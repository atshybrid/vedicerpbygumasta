const {
  Sale,
  SaleReturn,
  Customer,
  Branch,
  Company,
  Employee,
  BranchItem,
  CompanyItem,
  FinancialTransaction,
  StockRegister,
  CounterRegister,
  CashAccount,
  BankAccount,
  User,
  CashHandover,
  ItemVariation,
  Item,
  Category,
  OTP,
} = require("./../../../models");

const { Op, sequelize } = require("sequelize");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");
const moment = require("moment-timezone");
const {
  sendBillerHandoverNotification,
  sendManagerHandoverNotification,
  sendInvoiceToCustomer,
} = require("../../../utils/whatsapp.send.service");
const generateInvoice = require("../../../utils/generateInvoice");
const JsBarcode = require("jsbarcode");
const { uploadToS3 } = require("../../../utils/uploadToS3");
const { Canvas } = require("canvas");
const TAG = "sale.service.js";

module.exports = {
  // Create a Sale
  createSale: async (req) => {
    try {
      const {
        sale_by, // "branch" or "company"
        customer_id,
        company_id,
        transaction_date,
        branch_id,
        total_amount,
        discount_percentage,
        discount_amount,
        payment_status,
        payment_method,
        split,
        items,
        biller_id,
      } = req.body;

      // Validate input
      if (
        !sale_by ||
        !customer_id ||
        !company_id ||
        !branch_id ||
        !total_amount ||
        !items ||
        items.length === 0
      ) {
        return sendServiceMessage("messages.apis.app.sale.create.invalid_body");
      }
      if (
        (payment_method.toLowerCase() === "split" && !split) ||
        (payment_method.toLowerCase() === "balance" && split)
      ) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.invalid_split"
        );
      }

      if (
        split &&
        (Object.keys(split).length < 2 ||
          !Object.entries(split).every(
            ([key, value]) => value !== undefined && value >= 0
          ))
      ) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.split_items_missing"
        );
      }

      if (
        payment_method.toLowerCase() === "split" &&
        Number(split["cash"] || 0) +
          Number(split["bank"] || 0) +
          Number(split["balance"] || 0) !==
          total_amount
      ) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.split_amount_mismatch"
        );
      }

      // Fetch customer details
      const customer = await Customer.findByPk(customer_id);
      if (!customer) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.invalid_customer"
        );
      }

      const customerBalanceAvailable = Math.abs(customer.balance || 0);

      if (
        (payment_method.toLowerCase() === "balance" ||
          (payment_method.toLowerCase() === "split" && split?.balance)) &&
        customerBalanceAvailable <
          (payment_method.toLowerCase() === "balance"
            ? total_amount
            : split.balance)
      ) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.insufficient_balance"
        );
      }

      // Validate Employee details
      const employee = await Employee.findByPk(biller_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "name",
              "email",
              "mobile_number",
              "role_id",
              "branch_id",
            ],
          },
        ],
      });
      if (!employee) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.invalid_employee"
        );
      }

      // Validate company details
      const company = await Company.findByPk(company_id);
      if (!company) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.invalid_company"
        );
      }

      // Validate branch details
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.invalid_branch"
        );
      }

      let calculatedTotal = 0;
      let calculatedSubTotal = 0;
      const gstTotal = items.reduce((sum, item) => sum + item.gst_amount, 0);

      // Validate each item and calculate totals
      for (const item of items) {
        const {
          item_id,
          variation_id,
          rate,
          quantity,
          sub_total,
          gst_amount,
          total_amount: item_total,
        } = item;

        const recalculatedSubTotal = +(rate * quantity).toFixed(2);
        const recalculatedItemTotal = +(
          recalculatedSubTotal + gst_amount
        ).toFixed(2);

        if (
          sub_total !== recalculatedSubTotal ||
          item_total !== recalculatedItemTotal
        ) {
          return sendServiceMessage(
            "messages.apis.app.sale.create.invalid_item_details"
          );
        }

        calculatedTotal += item_total;
        calculatedSubTotal += sub_total;

        // Validate stock availability based on `sale_by`
        let stockItem;
        if (sale_by === "branch") {
          stockItem = await BranchItem.findOne({
            where: { branch_id, variation_id },
          });
        } else if (sale_by === "company") {
          stockItem = await CompanyItem.findOne({
            where: { company_id, variation_id },
          });
        }

        if (!stockItem || stockItem.stock < quantity) {
          return sendServiceMessage(
            "messages.apis.app.sale.create.insufficient_stock"
          );
        }
      }

      console.log("Calculated Total: ", calculatedTotal);

      // Validate overall total amount
      if (Math.round(calculatedTotal) !== total_amount) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.invalid_total_amount"
        );
      }

      // Create the sale entry
      const saleDateIST = transaction_date;

      const invoice_number = await generateInvoiceNumber(branch_id);

      if (!invoice_number) {
        return sendServiceMessage(
          "messages.apis.app.sale.create.invoice_number_error"
        );
      }

      // Round off calculatedTotal to nearest integer
      const roundedTotal = Math.round(calculatedTotal);

      // Find round off adjustment (+ or -)
      const roundOff = +(roundedTotal - calculatedTotal).toFixed(2);

      let sale = await Sale.create({
        customer_id,
        branch_id,
        company_id,
        invoice_number,
        total_amount,
        discount_percentage,
        discount_amount,
        sub_total: calculatedSubTotal,
        gst_amount: gstTotal,
        sale_date: saleDateIST,
        payment_status,
        employee_id: biller_id,
      });

      // Update stocks and create stock register entries
      for (const item of items) {
        const {
          item_id,
          variation_id,
          quantity,
          rate,
          sub_total,
          gst_rate,
          gst_amount,
          total_amount: item_total,
        } = item;

        // Update stock based on `sale_by`
        let stockItem;
        if (sale_by === "branch") {
          stockItem = await BranchItem.findOne({
            where: { branch_id, variation_id },
          });
          await stockItem.update({ stock: stockItem.stock - quantity });
        } else if (sale_by === "company") {
          stockItem = await CompanyItem.findOne({
            where: { company_id, variation_id },
          });
          await stockItem.update({ stock: stockItem.stock - quantity });
        }

        // Create stock register entry
        await StockRegister.create({
          reference_id: sale.sale_id,
          item_id,
          variation_id,
          branch_id,
          company_id,
          transaction_type: "SALE",
          flow_type: "OUT",
          quantity,
          rate,
          sub_total,
          gst_rate,
          gst_amount,
          grand_total: item_total,
          transaction_date: saleDateIST,
          remarks: `Sale to ${customer.customer_name}`,
        });
      }

      // Handle payment logic
      if (payment_status === "Due") {
        const availableCredit = customer.credit_limit - customer.balance;

        if (total_amount > availableCredit) {
          return sendServiceMessage(
            "messages.apis.app.sale.create.insufficient_credit_limit"
          );
        }

        await customer.update({
          balance: +(
            parseFloat(customer.balance) + parseFloat(total_amount)
          ).toFixed(2),
        });
      } else if (
        payment_status === "Paid" &&
        payment_method.toLowerCase() !== "split"
      ) {
        await FinancialTransaction.create({
          transaction_type: "SALE",
          amount: total_amount,
          reference_number: sale.sale_id,
          transaction_date: saleDateIST,
          payment_method,
          customer_id,
          employee_id: biller_id,
          branch_id,
          company_id,
          bank_account_id: company.bank_account_id || null,
          description: `Sale to ${customer.customer_name}`,
        });

        if (payment_method === "Cash") {
          const cashAccount = await CashAccount.findOne({
            where: { branch_id },
          });
          if (!cashAccount) {
            return sendServiceMessage(
              "messages.apis.app.sale.create.invalid_cash_account"
            );
          }

          await cashAccount.update({
            balance: +(
              parseFloat(cashAccount.balance) + parseFloat(total_amount)
            ).toFixed(2),
            last_updated_by: employee.user_id,
          });
        } else if (["UPI", "Card"].includes(payment_method)) {
          const bankAccount = await BankAccount.findByPk(
            company.bank_account_id
          );
          if (!bankAccount) {
            return sendServiceMessage(
              "messages.apis.app.sale.create.invalid_bank_account"
            );
          }

          await bankAccount.update({
            balance: +(
              parseFloat(bankAccount.balance) + parseFloat(total_amount)
            ).toFixed(2),
          });
        } else if (payment_method === "Balance") {
          await customer.update({
            balance: (
              parseFloat(customer.balance) + parseFloat(total_amount)
            ).toFixed(2),
          });
        }
      } else if (
        payment_status === "Paid" &&
        payment_method.toLowerCase() === "split"
      ) {
        if (split.cash && split.cash > 0) {
          await FinancialTransaction.create({
            transaction_type: "SALE",
            amount: split.cash,
            reference_number: sale.sale_id,
            transaction_date: saleDateIST,
            payment_method: "CASH",
            customer_id,
            employee_id: biller_id,
            branch_id,
            company_id,
            bank_account_id: company.bank_account_id || null,
            description: `Sale to ${customer.customer_name}`,
          });

          const cashAccount = await CashAccount.findOne({
            where: { branch_id },
          });
          if (!cashAccount) {
            return sendServiceMessage(
              "messages.apis.app.sale.create.invalid_cash_account"
            );
          }
          await cashAccount.update({
            balance: +(
              parseFloat(cashAccount.balance) + parseFloat(split.cash)
            ).toFixed(2),
            last_updated_by: employee.user_id,
          });
        }

        if (split.bank && split.bank > 0) {
          await FinancialTransaction.create({
            transaction_type: "SALE",
            amount: split.bank,
            reference_number: sale.sale_id,
            transaction_date: saleDateIST,
            payment_method: "CARD",
            customer_id,
            employee_id: biller_id,
            branch_id,
            company_id,
            bank_account_id: company.bank_account_id || null,
            description: `Sale to ${customer.customer_name}`,
          });

          const bankAccount = await BankAccount.findByPk(
            company.bank_account_id
          );
          if (!bankAccount) {
            return sendServiceMessage(
              "messages.apis.app.sale.create.invalid_bank_account"
            );
          }
          await bankAccount.update({
            balance: +(
              parseFloat(bankAccount.balance) + parseFloat(split.bank)
            ).toFixed(2),
          });
        }

        if (split.balance && split.balance > 0) {
          await FinancialTransaction.create({
            transaction_type: "SALE",
            amount: split.balance,
            reference_number: sale.sale_id,
            transaction_date: saleDateIST,
            payment_method: "BALANCE",
            customer_id,
            employee_id: biller_id,
            branch_id,
            company_id,
            description: `Sale to ${customer.customer_name} using Balance (Split)`,
          });

          await customer.update({
            balance: +(
              parseFloat(customer.balance) + parseFloat(split.balance)
            ).toFixed(2),
          });
        }
      }

      // Generate Invoice
      // Prepare data for invoice generation
      const itemsByGST = {};
      let totalQty = 0;
      let totalRate = 0;
      let totalDiscount = parseFloat(discount_amount || 0);
      let totalAmount = 0;

      // Group items by GST rate and calculate totals
      for (const item of items) {
        const {
          quantity,
          rate,
          sub_total,
          gst_rate,
          discount_amount,
          gst_amount,
          total_amount,
        } = item;
        if (!itemsByGST[gst_rate]) itemsByGST[gst_rate] = [];

        itemsByGST[gst_rate].push({
          name: item.item_name || "Item",
          sku: item.sku || "N/A",
          qty: quantity,
          variation: item.variation_name || "Variation",
          rate,
          gst_amount,
          discount: discount_amount,
          amount: sub_total,
        });

        totalQty += quantity;
        totalRate += rate;
        totalAmount += sub_total;
      }

      // Tax summary
      const taxSummary = Object.keys(itemsByGST).map((gstRate) => {
        const items = itemsByGST[gstRate];
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const tax = items.reduce((sum, item) => sum + item.gst_amount, 0);
        const sgst = (tax / 2).toFixed(2);
        const cgst = (tax / 2).toFixed(2);
        const net = parseFloat(subtotal) + parseFloat(tax);

        return { rate: parseFloat(gstRate), tax, sgst, cgst, net };
      });

      const taxTotal = {
        totalTax: gstTotal.toFixed(2),
        totalSGST: (gstTotal / 2).toFixed(2),
        totalCGST: (gstTotal / 2).toFixed(2),
        totalNet: total_amount,
      };

      const canvas = new Canvas(280, 50);
      JsBarcode(canvas, invoice_number, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: false,
        margin: 0,
      });
      const barcodeBase64 = canvas.toDataURL("image/png");

      // Prepare invoice data
      const saleData = {
        company: {
          logo_url: company.logo_url || "",
          name: company.company_name,
          address: {
            line1: company.address_line_1 || "Branch Address",
            line2: company.address_line_2 || "",
          },
          state: company.state,
          phone: company.phone_number,
          gst: company.gst_number,
          cin: company.cin || "CIN123456789",
          fssai: company.fssai || "FSSAI123456789",
        },
        invoice: {
          number: invoice_number,
          date: new Date(saleDateIST).toLocaleDateString(),
          time: new Date(saleDateIST).toLocaleTimeString(),
          cashier: employee.user.name.split(" ")[0] || "Admin",
          barcodeText: invoice_number,
          barcodeUrl: barcodeBase64,
          printedAt: new Date().toISOString(),
        },
        itemsByGST,
        summary: {
          totalQty,
          totalDiscount,
          totalAmount,
          totalRate,
          savings: totalDiscount,
          savingsPercentage: discount_percentage,
          gross: totalAmount + totalDiscount,
          promoDiscount: totalDiscount,
          net: calculatedTotal,
          roundOff,
          received: payment_status === "Paid" ? total_amount : 0,
          balance: payment_status === "Due" ? total_amount : 0,
        },
        payment: {
          method:
            payment_method.toLowerCase() === "split"
              ? "Split (Cash/Bank)"
              : payment_method,
          amount: total_amount.toFixed(2),
        },
        taxSummary,
        taxTotal,
      };

      processInvoiceAndSend(
        saleData,
        invoice_number,
        customer,
        branch,
        company,
        saleDateIST
      )
        .then(() => console.log(`Invoice sent for sale ${invoice_number}`))
        .catch((err) =>
          console.error(`Invoice sending failed: ${err.message}`)
        );

      // // Generate the invoice
      // // Generate the invoice as a buffer
      // const pdfBuffer = await generateInvoice(saleData);

      // // Upload the PDF buffer to S3
      // const sanitizedInvoiceNumber = invoice_number.replace(
      //   /[^a-zA-Z0-9-_]/g,
      //   "_"
      // );
      // const awsPath = `invoices/invoice_${sanitizedInvoiceNumber}.pdf`;
      // const s3Response = await uploadToS3(
      //   null,
      //   awsPath,
      //   pdfBuffer,
      //   "application/pdf"
      // );

      // sendInvoiceToCustomer({
      //   phoneNumber: customer.phone_number,
      //   name: customer.customer_name,
      //   branchName: branch.branch_name,
      //   invoiceNo: invoice_number,
      //   date: new Date(saleDateIST).toLocaleDateString(),
      //   total: total_amount,
      //   url: s3Response.Location,
      //   filename: `Invoice_${invoice_number}.pdf`,
      //   branchPhoneNo: company.phone_number,
      // });

      return sendServiceData({
        ...sale.toJSON(),
        round_off: roundOff,
      });
    } catch (error) {
      console.error(`${TAG} - createSale: `, error);
      return sendServiceMessage("messages.apis.app.sale.create.error");
    }
  },

  // Retrieve a Sale by ID
  getSale: async ({ params }) => {
    try {
      const { sale_id } = params;

      // Validate input
      if (!sale_id) {
        return sendServiceMessage("messages.apis.app.sale.get.invalid_sale_id");
      }

      // Fetch sale details
      const sale = await Sale.findByPk(sale_id, {
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: [
              "customer_id",
              "customer_name",
              "email",
              "phone_number",
            ],
          },
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branch_name", "location"],
          },
          {
            model: Employee,
            as: "employee",
            attributes: ["employee_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["branch_id", "name", "email", "mobile_number"],
              },
            ],
          },
        ],
      });

      // Validate if sale exists
      if (!sale) {
        return sendServiceMessage("messages.apis.app.sale.get.sale_not_found");
      }

      // Fetch stock register details for the sale
      const stockRegisters = await StockRegister.findAll({
        where: {
          reference_id: sale_id,
          transaction_type: "SALE",
        },
        include: [
          {
            model: ItemVariation,
            as: "variation",
            attributes: [
              "variation_id",
              "variation_name",
              "mrp",
              "discount",
              "sku",
              "barcode",
              "image",
            ],
            include: [
              {
                model: Item,
                as: "item",
                attributes: ["item_id", "item_name", "description"],
              },
            ],
          },
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branch_name", "location"],
          },
          {
            model: Company,
            as: "company",
            attributes: ["company_id", "company_name"],
          },
        ],
      });
      // Map stock entries into structured items
      const items = stockRegisters.map((entry) => {
        const variation = entry.variation;
        const item = variation.item;
        const category = item.category;

        return {
          item_id: item.item_id,
          item_name: item.item_name,
          description: item.description,
          image: item.image,
          parent_category: category?.parent
            ? {
                category_id: category.parent.category_id,
                category_name: category.parent.category_name,
                image: category.parent.image,
              }
            : null,
          sub_category: category
            ? {
                category_id: category.category_id,
                category_name: category.category_name,
                image: category.image,
              }
            : null,
          variation: {
            variation_id: variation.variation_id,
            variation_name: variation.variation_name,
            mrp: variation.mrp,
            discount: variation.discount,
            sku: variation.sku,
            barcode: variation.barcode,
            image: variation.image,
            quantity: entry.quantity,
            rate: entry.rate,
            sub_total: entry.sub_total,
            gst_rate: entry.gst_rate,
            gst_amount: entry.gst_amount,
            total_amount: entry.grand_total,
          },
        };
      });

      // Final response
      const result = {
        sale_details: {
          sale_id: sale.sale_id,
          customer: sale.customer,
          branch: sale.branch,
          biller: sale.employee,
          total_amount: sale.total_amount,
          sub_total: sale.sub_total,
          gst_amount: sale.gst_amount,
          sale_date: sale.sale_date,
          invoice_number: sale.invoice_number,
          payment_status: sale.payment_status,
        },
        items,
      };

      return sendServiceData(result);
    } catch (error) {
      console.error(`${TAG} - getSale: `, error);
      return sendServiceMessage("messages.apis.app.sale.get.error");
    }
  },

  // List All Sales
  getSales: async ({ query }) => {
    try {
      const {
        fromDate,
        toDate,
        biller_id,
        branch_id,
        customer_id,
        company_id,
      } = query;

      // Build filter for sales
      const salesFilter = {};
      if (fromDate && toDate) {
        salesFilter.sale_date = {
          [Op.between]: [
            moment
              .tz(Number(fromDate), "Asia/Kolkata")
              .startOf("day")
              .valueOf(),
            moment.tz(Number(toDate), "Asia/Kolkata").endOf("day").valueOf(),
          ],
        };
      }
      if (biller_id) salesFilter.employee_id = biller_id;
      if (branch_id) salesFilter.branch_id = branch_id;
      if (customer_id) salesFilter.customer_id = customer_id;
      if (company_id) salesFilter.company_id = company_id;

      // Fetch sales with filter
      const sales = await Sale.findAll({
        where: salesFilter,
        include: [
          { model: Customer, as: "customer" },
          {
            model: Branch,
            as: "branch",
            attributes: ["branch_name", "location"],
          },
          {
            model: Employee,
            as: "employee",
            attributes: ["employee_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: [
                  "branch_id",
                  "name",
                  "email",
                  "mobile_number",
                  "company_id",
                ],
              },
            ],
          },
        ],
        attributes: [
          "sale_id",
          "customer_id",
          "branch_id",
          "total_amount",
          "sub_total",
          "gst_amount",
          "sale_date",
          "payment_status",
          "created_at",
          "invoice_number",
        ],
      });

      if (!sales || sales.length === 0) {
        return sendServiceMessage("messages.apis.app.sale.get.no_sales");
      }

      // Initialize total sales amount
      let totalSalesAmount = 0;

      // Process sales and map items with variations
      const salesResult = await Promise.all(
        sales.map(async (sale) => {
          // Fetch stock register entries for each sale
          const stockEntries = await StockRegister.findAll({
            where: { reference_id: sale.sale_id, transaction_type: "SALE" },
            include: [
              {
                model: ItemVariation,
                as: "variation",
                attributes: [
                  "variation_id",
                  "variation_name",
                  "mrp",
                  "discount",
                  "sku",
                  "barcode",
                  "image",
                ],
                include: [
                  {
                    model: Item,
                    as: "item",
                    attributes: [
                      "item_id",
                      "item_name",
                      "description",
                      "image",
                    ],
                    include: [
                      {
                        model: Category,
                        as: "category",
                        attributes: [
                          "category_id",
                          "category_name",
                          "parent_id",
                          "image",
                        ],
                        include: [
                          {
                            model: Category,
                            as: "parent",
                            attributes: [
                              "category_id",
                              "category_name",
                              "image",
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
            attributes: [
              "quantity",
              "rate",
              "sub_total",
              "gst_rate",
              "gst_amount",
              "grand_total",
            ],
          });

          // Map stock entries to structured items
          const items = stockEntries.map((entry) => {
            const variation = entry.variation;
            const item = variation.item;
            const category = item.category;

            return {
              item_id: item.item_id,
              item_name: item.item_name,
              description: item.description,
              image: item.image,
              parent_category: category?.parent
                ? {
                    category_id: category.parent.category_id,
                    category_name: category.parent.category_name,
                    image: category.parent.image,
                  }
                : null,
              sub_category: category
                ? {
                    category_id: category.category_id,
                    category_name: category.category_name,
                    image: category.image,
                  }
                : null,
              variation: {
                variation_id: variation.variation_id,
                variation_name: variation.variation_name,
                mrp: variation.mrp,
                discount: variation.discount,
                sku: variation.sku,
                barcode: variation.barcode,
                image: variation.image,
                quantity: entry.quantity,
                rate: entry.rate,
                sub_total: entry.sub_total,
                gst_rate: entry.gst_rate,
                gst_amount: entry.gst_amount,
                total_amount: entry.grand_total,
              },
            };
          });

          // Increment total sales amount
          totalSalesAmount += Number(sale.total_amount);

          // Return structured sale details
          return {
            sale_id: sale.sale_id,
            customer: sale.customer,
            branch: sale.branch,
            biller: sale.employee,
            total_amount: sale.total_amount,
            sub_total: sale.sub_total,
            gst_amount: sale.gst_amount,
            sale_date: sale.sale_date,
            payment_status: sale.payment_status,
            invoice_number: sale.invoice_number,
            items,
          };
        })
      );

      // Final response
      const result = {
        total_sales: totalSalesAmount.toFixed(2),
        sales: salesResult,
      };

      return sendServiceData(result);
    } catch (error) {
      console.error(`${TAG} - getSales: `, error);
      return sendServiceMessage("messages.apis.app.sale.get.error");
    }
  },

  createSaleReturn: async (req) => {
    try {
      const {
        sale_id,
        customer_id,
        return_date,
        items, // array of return items
        return_by, // "branch" or "company"
        remarks,
        manager_id,
        company_id,
        branch_id,
      } = req.body;

      const { employee_id } = req;

      // Basic validation
      if (
        !sale_id ||
        !customer_id ||
        !manager_id ||
        !company_id ||
        !branch_id ||
        !return_date ||
        !items ||
        items.length === 0
      ) {
        return sendServiceMessage("messages.apis.app.sale.return.invalid_body");
      }

      // Fetch sale
      const sale = await Sale.findByPk(sale_id);
      if (!sale) {
        return sendServiceMessage("messages.apis.app.sale.return.invalid_sale");
      }

      // Validate customer
      const customer = await Customer.findByPk(customer_id);
      if (!customer) {
        return sendServiceMessage(
          "messages.apis.app.sale.return.invalid_customer"
        );
      }

      // Check if customer is B2C and return is allowed only in same month
      const saleMonth = new Date(sale.sale_date).getMonth();
      const returnMonth = new Date(return_date).getMonth();
      if (customer.customer_type === "B2C" && saleMonth !== returnMonth) {
        return sendServiceMessage(
          "messages.apis.app.sale.return.b2c_month_mismatch"
        );
      }

      // Validate all return items
      let totalReturnAmount = 0;

      for (const item of items) {
        const { item_id, variation_id, quantity } = item;

        if (
          !item_id ||
          !variation_id ||
          quantity === undefined ||
          quantity <= 0
        ) {
          return sendServiceMessage(
            "messages.apis.app.sale.return.invalid_item"
          );
        }

        // Find stock register entries for this sale and item
        const stockEntry = await StockRegister.findOne({
          where: {
            reference_id: sale_id,
            item_id,
            variation_id,
            transaction_type: "SALE",
            flow_type: "OUT",
          },
        });

        if (!stockEntry) {
          return sendServiceMessage(
            "messages.apis.app.sale.return.invalid_sale_item"
          );
        }

        const saleReturns = await SaleReturn.findAll({
          where: { sale_id },
          attributes: ["return_id"],
        });

        const returnIds = saleReturns.map((sr) => sr.return_id);

        // Now sum the already returned quantity
        const returnedQty = await StockRegister.sum("quantity", {
          where: {
            reference_id: returnIds.length > 0 ? returnIds : 0, // safe for empty
            flow_type: "IN",
            transaction_type: "SALE_RETURN",
            variation_id: item.variation_id,
          },
        });

        const availableQty = stockEntry.quantity - returnedQty;

        if (quantity > availableQty) {
          return sendServiceMessage(
            "messages.apis.app.sale.return.exceeds_available_quantity"
          );
        }

        totalReturnAmount += item.total_amount;
      }

      // Create Sale Return
      const saleReturn = await SaleReturn.create({
        sale_id,
        customer_id,
        return_amount: totalReturnAmount,
        return_date,
        remarks: remarks || null,
        branch_id,
        manager_id,
        company_id,
      });

      // Now for each item, adjust stock and create stock register entry
      for (const item of items) {
        const {
          item_id,
          variation_id,
          quantity,
          rate,
          sub_total,
          gst_rate,
          gst_amount,
          total_amount,
        } = item;

        // Adjust stock
        if (return_by === "branch") {
          const branchItem = await BranchItem.findOne({
            where: { branch_id: sale.branch_id, variation_id },
          });
          if (branchItem) {
            await branchItem.update({ stock: branchItem.stock + quantity });
          } else {
            await BranchItem.create({
              branch_id: sale.branch_id,
              variation_id,
              stock: quantity,
              mrp: rate,
              discount: 0,
            });
          }
        } else if (return_by === "company") {
          const companyItem = await CompanyItem.findOne({
            where: { company_id: sale.company_id, variation_id },
          });
          if (companyItem) {
            await companyItem.update({ stock: companyItem.stock + quantity });
          } else {
            await CompanyItem.create({
              company_id: sale.company_id,
              variation_id,
              stock: quantity,
              mrp: rate,
              discount: 0,
            });
          }
        }

        // Insert into stock register
        await StockRegister.create({
          reference_id: saleReturn.return_id,
          item_id,
          variation_id,
          branch_id: sale.branch_id,
          company_id: sale.company_id,
          transaction_type: "SALE_RETURN",
          flow_type: "IN",
          quantity,
          rate,
          sub_total,
          gst_rate,
          gst_amount,
          grand_total: total_amount,
          transaction_date: return_date,
          remarks: `Return against sale ID ${sale_id}`,
        });
      }

      // Update customer balance (only if needed)
      if (customer) {
        await customer.update({
          balance: +(
            parseFloat(customer.balance || 0) - parseFloat(totalReturnAmount)
          ).toFixed(2),
        });
      }

      return sendServiceData(saleReturn);
    } catch (error) {
      console.error(`${TAG} - createSaleReturn: `, error);
      return sendServiceMessage("messages.apis.app.sale.return.create_error");
    }
  },

  // Retrieve a Sale Return by ID
  getSaleReturn: async ({ params }) => {
    try {
      const { return_id } = params;

      // Validate input
      if (!return_id) {
        return sendServiceMessage(
          "messages.apis.app.saleReturn.get.invalid_return_id"
        );
      }

      // Fetch Sale Return details
      const saleReturn = await SaleReturn.findByPk(return_id, {
        include: [
          {
            model: Sale,
            as: "sale",
            include: [
              {
                model: Customer,
                as: "customer",
                attributes: [
                  "customer_id",
                  "customer_name",
                  "email",
                  "phone_number",
                ],
              },
              {
                model: Branch,
                as: "branch",
                attributes: ["id", "branch_name", "location"],
              },
              {
                model: Employee,
                as: "employee",
                attributes: ["employee_id"],
                include: [
                  {
                    model: User,
                    as: "user",
                    attributes: ["branch_id", "name", "email", "mobile_number"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!saleReturn) {
        return sendServiceMessage(
          "messages.apis.app.saleReturn.get.return_not_found"
        );
      }

      // Fetch returned stock entries
      const stockRegisters = await StockRegister.findAll({
        where: {
          reference_id: return_id,
          transaction_type: "SALE_RETURN",
        },
        include: [
          {
            model: ItemVariation,
            as: "variation",
            attributes: [
              "variation_id",
              "variation_name",
              "mrp",
              "discount",
              "sku",
              "barcode",
              "image",
            ],
            include: [
              {
                model: Item,
                as: "item",
                attributes: ["item_id", "item_name", "description"],
              },
            ],
          },
        ],
      });

      const items = stockRegisters.map((entry) => ({
        item_id: entry.variation.item.item_id,
        item_name: entry.variation.item.item_name,
        description: entry.variation.item.description,
        variation: {
          variation_id: entry.variation.variation_id,
          variation_name: entry.variation.variation_name,
          mrp: entry.variation.mrp,
          discount: entry.variation.discount,
          sku: entry.variation.sku,
          barcode: entry.variation.barcode,
          image: entry.variation.image,
          quantity: entry.quantity,
          rate: entry.rate,
          sub_total: entry.sub_total,
          gst_rate: entry.gst_rate,
          gst_amount: entry.gst_amount,
          total_amount: entry.grand_total,
        },
      }));

      const result = {
        return_details: {
          return_id: saleReturn.return_id,
          sale_id: saleReturn.sale_id,
          customer: saleReturn.sale.customer,
          branch: saleReturn.sale.branch,
          biller: saleReturn.sale.employee,
          return_amount: saleReturn.return_amount,
          return_date: saleReturn.return_date,
        },
        items,
      };

      return sendServiceData(result);
    } catch (error) {
      console.error(`${TAG} - getSaleReturn: `, error);
      return sendServiceMessage("messages.apis.app.saleReturn.get.error");
    }
  },

  // List All Sale Returns
  getSaleReturns: async ({ query }) => {
    try {
      const {
        fromDate,
        toDate,
        manager_id,
        branch_id,
        customer_id,
        company_id,
      } = query;

      const returnFilter = {};
      if (fromDate && toDate) {
        returnFilter.return_date = {
          [Op.between]: [
            moment
              .tz(Number(fromDate), "Asia/Kolkata")
              .startOf("day")
              .valueOf(),
            moment.tz(Number(toDate), "Asia/Kolkata").endOf("day").valueOf(),
          ],
        };
      }
      if (customer_id) returnFilter.customer_id = customer_id;
      if (manager_id) returnFilter.manager_id = manager_id;
      if (branch_id) returnFilter.branch_id = branch_id;
      if (company_id) returnFilter.company_id = company_id;

      const returns = await SaleReturn.findAll({
        where: returnFilter,
        include: [
          {
            model: Sale,
            as: "sale",
            include: [
              {
                model: Customer,
                as: "customer",
              },
              {
                model: Branch,
                as: "branch",
                attributes: ["branch_name", "location"],
              },
              {
                model: Employee,
                as: "employee",
                attributes: ["employee_id"],
                include: [
                  {
                    model: User,
                    as: "user",
                    attributes: [
                      "branch_id",
                      "name",
                      "email",
                      "mobile_number",
                      "company_id",
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!returns || returns.length === 0) {
        return sendServiceMessage(
          "messages.apis.app.saleReturn.get.no_returns"
        );
      }

      let totalReturnAmount = 0;

      const returnsResult = await Promise.all(
        returns.map(async (saleReturn) => {
          const stockEntries = await StockRegister.findAll({
            where: {
              reference_id: saleReturn.return_id,
              transaction_type: "SALE_RETURN",
            },
            include: [
              {
                model: ItemVariation,
                as: "variation",
                attributes: [
                  "variation_id",
                  "variation_name",
                  "mrp",
                  "discount",
                  "sku",
                  "barcode",
                  "image",
                ],
                include: [
                  {
                    model: Item,
                    as: "item",
                    attributes: [
                      "item_id",
                      "item_name",
                      "description",
                      "image",
                    ],
                  },
                ],
              },
            ],
          });

          const items = stockEntries.map((entry) => ({
            item_id: entry.variation.item.item_id,
            item_name: entry.variation.item.item_name,
            description: entry.variation.item.description,
            variation: {
              variation_id: entry.variation.variation_id,
              variation_name: entry.variation.variation_name,
              mrp: entry.variation.mrp,
              discount: entry.variation.discount,
              sku: entry.variation.sku,
              barcode: entry.variation.barcode,
              image: entry.variation.image,
              quantity: entry.quantity,
              rate: entry.rate,
              sub_total: entry.sub_total,
              gst_rate: entry.gst_rate,
              gst_amount: entry.gst_amount,
              total_amount: entry.grand_total,
            },
          }));

          totalReturnAmount += Number(saleReturn.return_amount);

          return {
            return_id: saleReturn.return_id,
            sale_id: saleReturn.sale_id,
            customer: saleReturn.sale.customer,
            branch: saleReturn.sale.branch,
            biller: saleReturn.sale.employee,
            return_amount: saleReturn.return_amount,
            return_date: saleReturn.return_date,
            items,
          };
        })
      );

      const result = {
        total_returns: totalReturnAmount.toFixed(2),
        returns: returnsResult,
      };

      return sendServiceData(result);
    } catch (error) {
      console.error(`${TAG} - getSaleReturns: `, error);
      return sendServiceMessage("messages.apis.app.saleReturn.get.error");
    }
  },

  // Update a Sale
  updateSale: async ({ params, body }) => {
    try {
      const sale = await Sale.findByPk(params.sale_id);

      if (!sale) {
        return sendServiceMessage("messages.apis.app.sale.update.not_found");
      }

      const updates = {};
      if (body.customer_id) {
        const customerExists = await Customer.findByPk(body.customer_id);
        if (!customerExists) {
          return sendServiceMessage(
            "messages.apis.app.sale.update.invalid_customer"
          );
        }
        updates.customer_id = body.customer_id;
      }

      if (body.branch_id) {
        const branchExists = await Branch.findByPk(body.branch_id);
        if (!branchExists) {
          return sendServiceMessage(
            "messages.apis.app.sale.update.invalid_branch"
          );
        }
        updates.branch_id = body.branch_id;
      }

      if (body.employee_id) {
        const employeeExists = await Employee.findByPk(body.employee_id);
        if (!employeeExists) {
          return sendServiceMessage(
            "messages.apis.app.sale.update.invalid_employee"
          );
        }
        updates.employee_id = body.employee_id;
      }

      if (body.total_amount !== undefined)
        updates.total_amount = body.total_amount;
      if (body.gst_amount !== undefined) updates.gst_amount = body.gst_amount;
      if (body.payment_status) updates.payment_status = body.payment_status;
      if (body.sale_date) updates.sale_date = body.sale_date;

      await sale.update(updates);

      return sendServiceData(sale);
    } catch (error) {
      console.error(`${TAG} - updateSale: `, error);
      return sendServiceMessage("messages.apis.app.sale.update.error");
    }
  },

  // Delete a Sale
  deleteSale: async ({ params }) => {
    try {
      const sale = await Sale.findByPk(params.sale_id);

      if (!sale) {
        return sendServiceMessage("messages.apis.app.sale.delete.not_found");
      }

      await sale.destroy();

      return sendServiceMessage("messages.apis.app.sale.delete.success");
    } catch (error) {
      console.error(`${TAG} - deleteSale: `, error);
      return sendServiceMessage("messages.apis.app.sale.delete.error");
    }
  },

  // Retrieve Sales by Branch
  getSalesByBranch: async ({ params }) => {
    try {
      const { branch_id } = params;

      const sales = await Sale.findAll({
        where: { branch_id: branch_id },
        attributes: [
          "branch_id",
          [sequelize.fn("COUNT", sequelize.col("sale_id")), "total_sales"],
          [sequelize.fn("SUM", sequelize.col("total_amount")), "total_revenue"],
        ],
        group: ["branch_id"],
      });

      return sendServiceData(sales);
    } catch (error) {
      console.error(`${TAG} - getSalesByBranch: `, error);
      return sendServiceMessage("messages.apis.app.sale.list.by_branch.error");
    }
  },

  // Retrieve Sales by Customer
  getSalesByCustomer: async ({ params }) => {
    try {
      const { customer_id } = params;

      const sales = await Sale.findAll({
        where: { customer_id: customer_id },
        attributes: [
          "customer_id",
          [sequelize.fn("COUNT", sequelize.col("sale_id")), "total_purchases"],
          [sequelize.fn("SUM", sequelize.col("total_amount")), "total_spent"],
        ],
        group: ["customer_id"],
      });

      return sendServiceData(sales);
    } catch (error) {
      console.error(`${TAG} - getSalesByCustomer: `, error);
      return sendServiceMessage(
        "messages.apis.app.sale.list.by_customer.error"
      );
    }
  },

  // Retrieve Pending Payments
  getPendingPayments: async () => {
    try {
      const pendingSales = await Sale.findAll({
        where: { payment_status: "Due" },
      });

      return sendServiceData(pendingSales);
    } catch (error) {
      console.error(`${TAG} - getPendingPayments: `, error);
      return sendServiceMessage("messages.apis.app.sale.list.by_pending.error");
    }
  },

  getCashTotal: async (req) => {
    try {
      const { timestamp } = req.params;

      const { branch_id } = req.user;
      const { employee_id: biller_id } = req.employee;

      // Validate input
      if (!branch_id || !timestamp) {
        return sendServiceMessage(
          "messages.apis.app.sale.cashTotal.invalid_params"
        );
      }

      // Validate branch
      const branch = await Branch.findByPk(branch_id);

      if (!branch) {
        return sendServiceMessage(
          "messages.apis.app.sale.cashTotal.invalid_branch"
        );
      }

      // Calculate the start and end timestamps for the given day
      const dayStart = moment
        .tz(Number(timestamp), "Asia/Kolkata")
        .startOf("day")
        .valueOf();
      const dayEnd = moment
        .tz(Number(timestamp), "Asia/Kolkata")
        .endOf("day")
        .valueOf();

      console.log(timestamp, dayStart, dayEnd);

      // Fetch the opening balance from the first register for the day
      const openingRegister = await CounterRegister.findOne({
        where: {
          branch_id,
          biller_id,
          shift_start: { [Op.between]: [dayStart, dayEnd] },
          status: "OPEN",
        },
        attributes: ["opening_balance", "shift_start"],
        order: [["shift_start", "ASC"]], // Get the earliest register for the day
      });

      const openingBalance = Number(openingRegister?.opening_balance) || 0;

      const shift_start = openingRegister?.shift_start || Date.now();

      console.log("openingRegister", openingRegister);

      // Fetch all cash transactions for the given day from FinancialTransaction
      const cashTransactions = await FinancialTransaction.findAll({
        where: {
          branch_id,
          employee_id: biller_id,
          transaction_date: { [Op.between]: [shift_start, dayEnd] },
          payment_method: "Cash", // Only cash transactions
        },
        attributes: ["amount"],
      });

      const upiTransactions = await FinancialTransaction.findAll({
        where: {
          branch_id,
          employee_id: biller_id,
          transaction_date: { [Op.between]: [shift_start, dayEnd] },
          payment_method: "UPI",
        },
        attributes: ["amount"],
      });

      const cardTransactions = await FinancialTransaction.findAll({
        where: {
          branch_id,
          employee_id: biller_id,
          transaction_date: { [Op.between]: [shift_start, dayEnd] },
          payment_method: "Card",
        },
        attributes: ["amount"],
      });

      // Calculate total cash transactions
      const totalCashTransactions = cashTransactions.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount),
        0
      );

      const totalUpiTransactions = upiTransactions.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount),
        0
      );

      const totalCardTransactions = cardTransactions.reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount),
        0
      );

      // Calculate total balance
      const totalBalance = openingBalance + totalCashTransactions;

      // Return the data
      return sendServiceData({
        opening_balance: openingBalance.toFixed(2),
        total_cash_transactions: totalCashTransactions.toFixed(2),
        total_upi_transactions: totalUpiTransactions.toFixed(2),
        total_card_transactions: totalCardTransactions.toFixed(2),
        total_balance: totalBalance.toFixed(2),
      });
    } catch (error) {
      console.error(`${TAG} - getCashTotal: `, error);
      return sendServiceMessage("messages.apis.app.sale.cashTotal.error");
    }
  },

  createHandoverRequest: async (req) => {
    try {
      const { manager_id, cash_amount, timestamp, register_id, biller_id } =
        req.body;

      // const { employee_id: biller_id } = req.employee;

      const { branch_id } = req.user;
      // Validate input
      if (
        !biller_id ||
        !branch_id ||
        !manager_id ||
        cash_amount === undefined ||
        !timestamp
      ) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.create.invalid_body"
        );
      }

      if (cash_amount < 0) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.create.invalid_cash_amount"
        );
      }

      // Validate branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.create.invalid_branch"
        );
      }

      // Validate biller
      const biller = await Employee.findByPk(biller_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "name",
              "email",
              "mobile_number",
              "role_id",
              "branch_id",
            ],
          },
        ],
      });
      if (!biller || biller?.user?.branch_id !== branch_id) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.create.invalid_biller"
        );
      }

      // Validate manager
      const manager = await Employee.findByPk(manager_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "name",
              "email",
              "mobile_number",
              "role_id",
              "branch_id",
            ],
          },
        ],
      });
      if (!manager || manager?.user?.branch_id !== branch_id) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.create.invalid_manager"
        );
      }

      // Get today's start and end timestamps in IST
      const todayStart = moment
        .tz(timestamp, "Asia/Kolkata")
        .startOf("day")
        .valueOf();
      const todayEnd = moment
        .tz(timestamp, "Asia/Kolkata")
        .endOf("day")
        .valueOf();

      // Find today's register for the biller
      const todayRegister = await CounterRegister.findOne({
        where: {
          biller_id,
          branch_id,
          status: "OPEN",
          shift_start: { [Op.between]: [todayStart, todayEnd] },
        },
        order: [["created_at", "DESC"]],
      });

      if (!todayRegister && !register_id) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.create.no_register_for_today"
        );
      }

      // Create handover request
      const handoverRequest = await CashHandover.create({
        register_id: todayRegister?.register_id || register_id,
        manager_id,
        biller_id,
        branch_id,
        cash_amount,
        status: "PENDING",
        approval_date: null,
      });

      // Send notifications to the manager
      sendManagerHandoverNotification({
        name: manager?.user?.name,
        phoneNumber: manager?.user?.mobile_number,
        billerName: biller?.user?.name,
        settlementDate: moment(timestamp).format("DD-MM-YYYY"),
        amount: cash_amount,
        branchName: branch.branch_name,
      });

      return sendServiceData(handoverRequest);
    } catch (error) {
      console.error(`${TAG} - createHandoverRequest: `, error);
      return sendServiceMessage("messages.apis.app.sale.handover.create.error");
    }
  },

  approveHandoverRequest: async ({ body, params }) => {
    try {
      const { manager_id, timestamp, approve, remarks } = body;
      const { handover_id } = params;

      // Validate input
      if (!handover_id || !manager_id || !timestamp || approve === undefined) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.approve.invalid_body"
        );
      }

      if (!approve && !remarks) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.approve.remarks_required"
        );
      }

      // Fetch handover request
      const handoverRequest = await CashHandover.findByPk(handover_id, {
        include: [
          {
            model: CounterRegister,
            as: "register",
            include: [
              {
                model: Branch,
                as: "branch",
                attributes: ["id", "branch_name"],
              },
            ],
          },
        ],
      });

      if (!handoverRequest) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.approve.invalid_handover"
        );
      }

      const biller = await Employee.findByPk(handoverRequest.biller_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "name",
              "email",
              "mobile_number",
              "role_id",
              "branch_id",
            ],
          },
        ],
      });

      // Validate the handover request status
      if (handoverRequest.status !== "PENDING") {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.approve.not_pending"
        );
      }

      // Validate manager
      const manager = await Employee.findByPk(manager_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "name",
              "email",
              "mobile_number",
              "role_id",
              "branch_id",
            ],
          },
        ],
      });
      if (!manager || manager?.user?.branch_id !== handoverRequest.branch_id) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.approve.invalid_manager"
        );
      }

      // Verify manager
      if (manager_id !== handoverRequest.manager_id) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.approve.wrong_manager"
        );
      }

      // Update the handover request status based on approval flag
      if (approve) {
        await handoverRequest.update({
          status: "APPROVED",
          approval_date: timestamp,
          remarks: remarks || null,
        });
      } else {
        await handoverRequest.update({
          status: "REJECTED",
          remarks,
          approval_date: timestamp,
        });
      }

      sendBillerHandoverNotification({
        name: manager?.user?.name,
        phoneNumber: biller?.user?.mobile_number,
        billerName: biller?.user?.name,
        settlementDate: moment(timestamp).format("DD-MM-YYYY"),
        amount: handoverRequest.cash_amount,
        branchName: handoverRequest.register.branch.branch_name,
        status: approve ? "Approved" : "Rejected",
      });

      return sendServiceData(handoverRequest);
    } catch (error) {
      console.error(`${TAG} - approveHandoverRequest: `, error);
      return sendServiceMessage(
        "messages.apis.app.sale.handover.approve.error"
      );
    }
  },

  getHandovers: async ({ query }) => {
    try {
      const { branch_id, biller_id, manager_id, status } = query;

      if (!branch_id) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.read.invalid_branch"
        );
      }

      // Build filter dynamically based on the query parameters
      const filter = {};
      if (branch_id) filter.branch_id = branch_id;
      if (biller_id) filter.biller_id = biller_id;
      if (manager_id) filter.manager_id = manager_id;
      if (status) filter.status = status;

      // Fetch handover requests with related details
      const handovers = await CashHandover.findAll({
        where: filter,
        include: [
          {
            model: CounterRegister,
            as: "register",
            attributes: [
              "register_id",
              "shift_start",
              "shift_end",
              "opening_balance",
              "closing_balance",
              "status",
            ],
            include: [
              {
                model: Branch,
                as: "branch",
                attributes: ["id", "branch_name", "location"],
              },
            ],
          },
          {
            model: Employee,
            as: "manager",
            attributes: ["employee_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name", "email"],
              },
            ],
          },
          {
            model: Employee,
            as: "biller",
            attributes: ["employee_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name", "email"],
              },
            ],
          },
        ],
        attributes: [
          "handover_id",
          "branch_id",
          "manager_id",
          "cash_amount",
          "status",
          "approval_date",
          "created_at",
          "updated_at",
        ],
        order: [["created_at", "DESC"]], // Sort by the creation date
      });

      return sendServiceData(handovers);
    } catch (error) {
      console.error(`${TAG} - getHandovers: `, error);
      return sendServiceMessage("messages.apis.app.sale.handover.read.error");
    }
  },

  getHandover: async ({ params }) => {
    try {
      const { handover_id } = params;

      const handover = await CashHandover.findByPk(handover_id, {
        include: [
          {
            model: CounterRegister,
            as: "register",
            attributes: [
              "register_id",
              "shift_start",
              "shift_end",
              "opening_balance",
              "closing_balance",
              "status",
            ],
            include: [
              {
                model: Branch,
                as: "branch",
                attributes: ["id", "branch_name", "location"],
              },
            ],
          },
          {
            model: Employee,
            as: "manager",
            attributes: ["employee_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name", "email"],
              },
            ],
          },
          {
            model: Employee,
            as: "biller",
            attributes: ["employee_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name", "email"],
              },
            ],
          },
        ],
        attributes: [
          "handover_id",
          "branch_id",
          "manager_id",
          "cash_amount",
          "status",
          "approval_date",
          "created_at",
          "updated_at",
        ],
      });

      if (!handover) {
        return sendServiceMessage(
          "messages.apis.app.sale.handover.read.not_found"
        );
      }

      return sendServiceData(handover);
    } catch (error) {
      console.error(`${TAG} - getHandover: `, error);
      return sendServiceMessage("messages.apis.app.sale.handover.read.error");
    }
  },

  sendOtp: async ({ body }) => {
    try {
      const { phone_number } = body;

      const customer = await Customer.findOne({
        where: { phone_number },
        attributes: ["customer_name", "phone_number"],
      });

      if (!customer) {
        return sendServiceMessage("messages.apis.auth.common.user_not_found");
      }

      const otp_code = Math.floor(100000 + Math.random() * 900000).toString();

      const expires_at = new Date(Date.now() + 5 * 60 * 1000);

      const otpEntry = await OTP.create({
        phone_number,
        otp_code,
        expires_at,
      });

      const {
        sendWhatsAppOTP,
      } = require("../../../utils/whatsapp.send.service");
      const messageSent = await sendWhatsAppOTP(
        customer?.customer_name || "user",
        otp_code,
        phone_number
      );

      if (!messageSent) {
        return sendServiceMessage("messages.apis.auth.request_otp.error");
      }

      return sendServiceData({
        otp_id: otpEntry.otp_id,
        phone_number: otpEntry.phone_number,
        sent_at: otpEntry.created_at,
        expires_at: otpEntry.expires_at,
      });
    } catch (error) {
      console.error(`${TAG} - sendOtp: `, error);
      return sendServiceMessage("messages.apis.auth.request_otp.error");
    }
  },

  verifyOtp: async ({ body }) => {
    try {
      const { phone_number, otp_code } = body;

      const otpEntry = await OTP.findOne({
        where: { phone_number, otp_code },
      });

      if (!otpEntry) {
        return sendServiceMessage(
          "messages.apis.auth.verify_otp.incorrect_otp"
        );
      }

      if (new Date() > otpEntry.expires_at) {
        return sendServiceMessage("messages.apis.auth.verify_otp.otp_expired");
      }

      await otpEntry.update({ is_verified: 1 });

      const customer = await Customer.findOne({
        where: { phone_number },
        attributes: ["customer_name", "phone_number"],
      });

      return sendServiceData({
        name: customer?.customer_name,
        mobile_number: customer?.phone_number,
      });
    } catch (error) {
      console.error(`${TAG} - verifyOtp: `, error);
      return sendServiceMessage("messages.apis.auth.verify_otp.error");
    }
  },
};

const generateInvoiceNumber = async (branch_id) => {
  const currentYear = new Date().getFullYear();

  const branch = await Branch.findByPk(branch_id);

  const invoicePrefix = branch?.invoice_prefix || "INV";

  const lastInvoice = await Sale.findOne({
    where: {
      branch_id,
      sale_date: {
        [Op.gte]: new Date(`${currentYear}-01-01`),
      },
    },
    order: [["sale_id", "DESC"]],
    limit: 1,
  });

  console.log("Last Invoice: ", lastInvoice);

  let lastInvoiceNumber = 0;
  if (lastInvoice) {
    const lastInvoiceParts = lastInvoice.invoice_number.split("/");
    if (lastInvoiceParts.length === 3) {
      lastInvoiceNumber = parseInt(lastInvoiceParts[2], 10);
    }
  }

  const newInvoiceNumber = lastInvoiceNumber + 1;

  const formattedInvoiceNumber = newInvoiceNumber.toString().padStart(5, "0");

  const invoiceNumber = `${invoicePrefix}/${currentYear}/${formattedInvoiceNumber}`;

  return invoiceNumber;
};

async function processInvoiceAndSend(
  saleData,
  invoice_number,
  customer,
  branch,
  company,
  saleDateIST
) {
  const pdfBuffer = await generateInvoice(saleData);

  const sanitizedInvoiceNumber = invoice_number.replace(/[^a-zA-Z0-9-_]/g, "_");
  const awsPath = `invoices/invoice_${sanitizedInvoiceNumber}.pdf`;

  const s3Response = await uploadToS3(
    null,
    awsPath,
    pdfBuffer,
    "application/pdf"
  );

  await sendInvoiceToCustomer({
    phoneNumber: customer.phone_number,
    name: customer.customer_name,
    branchName: branch.branch_name,
    invoiceNo: invoice_number,
    date: new Date(saleDateIST).toLocaleDateString(),
    total: saleData.summary.net,
    url: s3Response.Location,
    filename: `Invoice_${invoice_number}.pdf`,
    branchPhoneNo: company.phone_number,
  });
}
