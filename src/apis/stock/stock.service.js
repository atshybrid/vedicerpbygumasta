const {
  StockRegister,
  StockTransfer,
  StockRequest,
  Item,
  ItemVariation,
  Branch,
  Company,
  Employee,
  User,
  CompanyItem,
  BranchItem,
  Category,
  GST,
  UOM,
} = require("./../../../models");
const { Op } = require("sequelize");
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../../utils/service.response");
const moment = require("moment");

const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");

const TAG = "stock.service.js";

module.exports = {
  // Create a Stock Transaction
  createStock: async ({ body }) => {
    try {
      const {
        item_id,
        variation_id,
        branch_id,
        transaction_type,
        quantity,
        gst_rate,
        transaction_date,
        remarks,
      } = body;

      // Validate foreign keys
      const itemExists = await Item.findByPk(item_id);
      if (!itemExists) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.create.invalid_item"
        );
      }

      const variationExists = await ItemVariation.findByPk(variation_id);
      if (!variationExists) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.create.invalid_variation"
        );
      }

      const branchExists = await Branch.findByPk(branch_id);
      if (!branchExists) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.create.invalid_branch"
        );
      }

      // Calculate GST amount
      const gst_amount = (quantity * gst_rate) / 100;

      // Create a stock transaction record
      const stockTransaction = await StockRegister.create({
        item_id,
        variation_id,
        branch_id,
        transaction_type,
        quantity,
        gst_rate,
        gst_amount,
        transaction_date: transaction_date || new Date(),
        remarks: remarks || null,
      });

      return sendServiceData(stockTransaction);
    } catch (error) {
      console.error(`${TAG} - createStock: `, error);
      return sendServiceMessage("messages.apis.app.stockRegister.create.error");
    }
  },

  addStockToCompanyItem: async ({ body }) => {
    try {
      const {
        company_id,
        variation_id,
        stock,
        transaction_type, // e.g., "PURCHASE"
        flow_type, // e.g., "IN"
        branch_id, // Optional, for branch-specific stocks
        remarks, // Optional
      } = body;

      // Validate input
      if (
        !(company_id || branch_id) ||
        !variation_id ||
        stock === undefined ||
        !transaction_type ||
        !flow_type
      ) {
        return sendServiceMessage(
          "messages.apis.app.stock.companyItem.addStock.invalid_body"
        );
      }

      if (stock <= 0) {
        return sendServiceMessage(
          "messages.apis.app.stock.companyItem.addStock.invalid_stock"
        );
      }

      // Validate foreign keys
      const companyExists = await Company.findByPk(company_id);
      if (!companyExists) {
        return sendServiceMessage(
          "messages.apis.app.stock.companyItem.addStock.invalid_company"
        );
      }

      const variationExists = await ItemVariation.findByPk(variation_id);
      if (!variationExists) {
        return sendServiceMessage(
          "messages.apis.app.stock.companyItem.addStock.invalid_variation"
        );
      }

      // Check if the company item already exists
      const existingCompanyItem = await CompanyItem.findOne({
        where: { company_id, variation_id },
      });

      let updatedCompanyItem;

      if (existingCompanyItem) {
        // Update stock if the item already exists
        updatedCompanyItem = await existingCompanyItem.update({
          stock: existingCompanyItem.stock + stock,
        });
      } else {
        // Create a new company item if it doesn't exist
        updatedCompanyItem = await CompanyItem.create({
          company_id,
          variation_id,
          stock,
          mrp: variationExists.mrp,
          discount: variationExists.discount || 0,
        });
      }

      // Generate numeric timestamp in IST
      const transactionDateIST = moment().tz("Asia/Kolkata").unix(); // Numeric Unix timestamp

      // Add an entry to the StockRegister
      const stockRegisterEntry = await StockRegister.create({
        item_id: variationExists.item_id, // Assuming item_id is linked in ItemVariation
        variation_id,
        branch_id: branch_id || null,
        company_id: company_id || null,
        transaction_type,
        flow_type,
        rate: null,
        quantity: stock,
        sub_total: null,
        gst_rate: null,
        gst_amount: null,
        grand_total: null,
        transaction_date: transactionDateIST,
        remarks: remarks || null,
      });

      return sendServiceData({
        companyItem: updatedCompanyItem,
        stockRegister: stockRegisterEntry,
      });
    } catch (error) {
      console.error(`${TAG} - addStockToCompanyItem: `, error);
      return sendServiceMessage(
        "messages.apis.app.stock.companyItem.addStock.error"
      );
    }
  },

  addStockToBranchItem: async ({ body }) => {
    try {
      const {
        branch_id,
        variation_id,
        stock,
        transaction_type, // e.g., "PURCHASE"
        flow_type, // e.g., "IN"
        remarks, // Optional
      } = body;

      // Validate input
      if (
        !branch_id ||
        !variation_id ||
        stock === undefined ||
        !transaction_type ||
        !flow_type
      ) {
        return sendServiceMessage(
          "messages.apis.app.stock.branchItem.addStock.invalid_body"
        );
      }

      if (stock <= 0) {
        return sendServiceMessage(
          "messages.apis.app.stock.branchItem.addStock.invalid_stock"
        );
      }

      // Validate foreign keys
      const branchExists = await Branch.findByPk(branch_id);
      if (!branchExists) {
        return sendServiceMessage(
          "messages.apis.app.stock.branchItem.addStock.invalid_branch"
        );
      }

      const variationExists = await ItemVariation.findByPk(variation_id);
      if (!variationExists) {
        return sendServiceMessage(
          "messages.apis.app.stock.branchItem.addStock.invalid_variation"
        );
      }

      // Check if the branch item already exists
      const existingBranchItem = await BranchItem.findOne({
        where: { branch_id, variation_id },
      });

      let updatedBranchItem;

      if (existingBranchItem) {
        let newStock =
          flow_type === "OUT"
            ? existingBranchItem.stock - stock
            : existingBranchItem.stock + stock;

        if (newStock < 0) {
          return sendServiceMessage(
            "messages.apis.app.stock.branchItem.addStock.insufficient_stock"
          );
        }

        updatedBranchItem = await existingBranchItem.update({
          stock: newStock,
        });
      } else {
        // Only allow creation on IN flow (cannot subtract from non-existent stock)
        if (flow_type === "OUT") {
          return sendServiceMessage(
            "messages.apis.app.stock.branchItem.addStock.stock_not_found"
          );
        }

        updatedBranchItem = await BranchItem.create({
          branch_id,
          variation_id,
          stock,
          mrp: variationExists.mrp,
          discount: variationExists.discount || 0,
        });
      }
      // Generate numeric timestamp in IST
      const transactionDateIST = moment().tz("Asia/Kolkata").unix(); // Numeric Unix timestamp

      // Add an entry to the StockRegister
      const stockRegisterEntry = await StockRegister.create({
        item_id: variationExists.item_id, // Assuming item_id is linked in ItemVariation
        variation_id,
        branch_id,
        company_id: branchExists.company_id || null, // If branch is associated with a company
        transaction_type,
        flow_type,
        rate: null,
        quantity: stock,
        sub_total: null,
        gst_rate: null,
        gst_amount: null,
        grand_total: null,
        transaction_date: transactionDateIST,
        remarks: remarks || null,
      });

      return sendServiceData({
        branchItem: updatedBranchItem,
        stockRegister: stockRegisterEntry,
      });
    } catch (error) {
      console.error(`${TAG} - addStockToBranchItem: `, error);
      return sendServiceMessage(
        "messages.apis.app.stock.branchItem.addStock.error"
      );
    }
  },

  transferStock: async ({ body }) => {
    try {
      const {
        from_branch_id,
        from_company_id,
        to_branch_id,
        items,
        transferDate,
      } = body;

      // Validate input
      if (
        !items ||
        items.length === 0 ||
        (!from_branch_id && !from_company_id) ||
        (!to_branch_id && !from_company_id)
      ) {
        return sendServiceMessage(
          "messages.apis.app.stock.transfer.invalid_body"
        );
      }

      // Generate a unique batch_id for this transfer
      const batch_id = uuidv4();

      const results = [];
      for (const item of items) {
        const {
          variation_id,
          quantity,
          rate,
          sub_total,
          gst_rate,
          gst_amount,
          total_amount,
          remarks,
        } = item;

        // Validate item details
        if (
          !variation_id ||
          quantity === undefined ||
          quantity <= 0 ||
          rate === undefined ||
          sub_total === undefined ||
          gst_rate === undefined ||
          gst_amount === undefined ||
          total_amount === undefined
        ) {
          return sendServiceMessage(
            "messages.apis.app.stock.transfer.invalid_item_body"
          );
        }

        // Recalculate and validate item details
        const recalculatedSubTotal = +(
          total_amount /
          (1 + gst_rate / 100)
        ).toFixed(2);
        const recalculatedGST = +(
          recalculatedSubTotal *
          (gst_rate / 100)
        ).toFixed(2);
        const recalculatedRate = +(recalculatedSubTotal / quantity).toFixed(2);

        if (
          sub_total !== recalculatedSubTotal ||
          gst_amount !== recalculatedGST ||
          rate !== recalculatedRate
        ) {
          return sendServiceMessage(
            "messages.apis.app.stock.transfer.invalid_item_details"
          );
        }

        // Validate source
        const variationExists = await ItemVariation.findByPk(variation_id);
        if (!variationExists) {
          return sendServiceMessage(
            "messages.apis.app.stock.transfer.invalid_variation"
          );
        }

        const fromBranch = from_branch_id
          ? await Branch.findByPk(from_branch_id)
          : null;
        const fromCompany = from_company_id
          ? await Company.findByPk(from_company_id)
          : null;

        if (from_branch_id && !fromBranch) {
          return sendServiceMessage(
            "messages.apis.app.stock.transfer.invalid_from_branch"
          );
        }

        if (from_company_id && !fromCompany) {
          return sendServiceMessage(
            "messages.apis.app.stock.transfer.invalid_from_company"
          );
        }

        let sourceItem;
        if (from_branch_id) {
          sourceItem = await BranchItem.findOne({
            where: { branch_id: from_branch_id, variation_id },
          });
        } else if (from_company_id) {
          sourceItem = await CompanyItem.findOne({
            where: { company_id: from_company_id, variation_id },
          });
        }

        if (!sourceItem || sourceItem.stock < quantity) {
          return sendServiceMessage(
            "messages.apis.app.stock.transfer.insufficient_stock"
          );
        }

        await sourceItem.update({ stock: sourceItem.stock - quantity });

        // Add entry to `StockTransfer`
        const stockTransfer = await StockTransfer.create({
          batch_id,
          from_branch_id: from_branch_id || null,
          from_company_id: from_company_id || null,
          to_branch_id: to_branch_id || null,
          variation_id,
          quantity,
          acknowledge: false,
          transfer_date: transferDate,
        });

        // Add out entry to `StockRegister`
        await StockRegister.create({
          item_id: variationExists.item_id,
          variation_id,
          branch_id: from_branch_id || null,
          company_id: from_company_id || null,
          transaction_type: "TRANSFER",
          flow_type: "OUT",
          quantity,
          rate,
          sub_total,
          gst_rate,
          gst_amount,
          grand_total: total_amount,
          transaction_date: transferDate,
          batch_id,
          remarks: remarks || null,
        });

        results.push({
          stockTransfer,
          fromBranch,
          fromCompany,
          variation: variationExists,
        });
      }

      return sendServiceData({ batch_id, transfers: results });
    } catch (error) {
      console.error(`${TAG} - transferStock: `, error);
      return sendServiceMessage("messages.apis.app.stock.transfer.error");
    }
  },

  acknowledgeStockTransfer: async ({ body }) => {
    try {
      const { batch_id, items, acknowledgeDate } = body;

      // Validate input
      if (!batch_id || !items || items.length === 0 || !acknowledgeDate) {
        return sendServiceMessage(
          "messages.apis.app.stock.transfer.acknowledge.invalid_body"
        );
      }

      // Fetch all transfers for the given batch_id
      const stockTransfers = await StockTransfer.findAll({
        where: { batch_id, acknowledge: false },
      });

      console.log("stockTransfers", stockTransfers);

      if (!stockTransfers || stockTransfers.length === 0) {
        return sendServiceMessage(
          "messages.apis.app.stock.transfer.acknowledge.invalid_batch"
        );
      }

      // Ensure all items in the batch are included in the request
      const transferVariationIds = stockTransfers.map(
        (transfer) => transfer.variation_id
      );
      const requestVariationIds = items.map((item) => item.variation_id);

      const missingItems = transferVariationIds.filter(
        (id) => !requestVariationIds.includes(id)
      );

      if (missingItems.length > 0) {
        return sendServiceMessage(
          "messages.apis.app.stock.transfer.acknowledge.missing_items"
        );
      }

      const results = [];
      for (const item of items) {
        const { variation_id, received_quantity, lost_quantity, remarks } =
          item;

        // Validate item input
        if (
          !variation_id ||
          received_quantity === undefined ||
          lost_quantity === undefined ||
          received_quantity < 0 ||
          lost_quantity < 0
        ) {
          return sendServiceMessage(
            "messages.apis.app.stock.transfer.acknowledge.invalid_item_body"
          );
        }

        const totalQuantity = received_quantity + lost_quantity;

        console.log("totalQuantity", totalQuantity, "item", item);

        // Find the matching transfer for the variation
        const transfer = stockTransfers.find(
          (transfer) => transfer.variation_id === variation_id
        );

        console.log("transfer", transfer);

        if (!transfer || transfer.quantity !== totalQuantity) {
          return sendServiceMessage(
            "messages.apis.app.stock.transfer.acknowledge.mismatched_quantity"
          );
        }

        const variationDetails = await ItemVariation.findByPk(variation_id);

        // Update branch stock
        const branchStock = await BranchItem.findOne({
          where: { branch_id: transfer.to_branch_id, variation_id },
        });

        if (branchStock) {
          await branchStock.update({
            stock: branchStock.stock + received_quantity,
          });
        } else {
          await BranchItem.create({
            branch_id: transfer.to_branch_id,
            variation_id,
            stock: received_quantity,
            mrp: variationDetails.mrp,
            discount: variationDetails.discount || 0,
          });
        }

        // Create stock register entry
        await StockRegister.create({
          item_id: variationDetails.item_id,
          batch_id,
          variation_id,
          branch_id: transfer.to_branch_id,
          company_id: transfer.from_company_id,
          transaction_type: "TRANSFER",
          flow_type: "IN",
          quantity: received_quantity,
          loss_quantity: lost_quantity,
          transaction_date: acknowledgeDate,
          remarks:
            remarks ||
            `Received ${received_quantity} items with ${lost_quantity} lost`,
        });

        // Update the transfer record as acknowledged
        await transfer.update({
          acknowledge: true,
          received_quantity,
          lost_quantity,
        });

        results.push({ transfer, received_quantity, lost_quantity });
      }

      return sendServiceData({ batch_id, acknowledged: true, items: results });
    } catch (error) {
      console.error(`${TAG} - acknowledgeStockTransfer: `, error);
      return sendServiceMessage(
        "messages.apis.app.stock.transfer.acknowledge.error"
      );
    }
  },
  getStockTransfers: async ({ query }) => {
    try {
      const { batch_id, company_id, from_branch_id, to_branch_id } = query;

      // Validate input
      if (!company_id && !batch_id && !from_branch_id && !to_branch_id) {
        return sendServiceMessage(
          "messages.apis.app.stock.transfer.get.invalid_query"
        );
      }

      // Build filter conditions
      const filter = {};
      if (batch_id) filter.batch_id = batch_id;
      if (company_id) filter.from_company_id = company_id;
      if (from_branch_id) filter.from_branch_id = from_branch_id;
      if (to_branch_id) filter.to_branch_id = to_branch_id;

      // Fetch stock transfers
      const stockTransfers = await StockTransfer.findAll({
        where: filter,
        include: [
          {
            model: Branch,
            as: "fromBranch",
            attributes: ["id", "branch_name", "location"],
          },
          {
            model: Branch,
            as: "toBranch",
            attributes: ["id", "branch_name", "location"],
          },
          {
            model: Company,
            as: "fromCompany",
            attributes: ["company_id", "company_name"],
          },
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_id", "variation_name"],
            include: [
              {
                model: Item,
                as: "item",
                attributes: ["item_id", "item_name"],
              },
            ],
          },
        ],
        attributes: [
          "batch_id",
          "from_branch_id",
          "from_company_id",
          "to_branch_id",
          "variation_id",
          "quantity",
          "acknowledge",
          "transfer_date",
          "received_quantity",
          "lost_quantity",
        ],
        order: [["transfer_date", "DESC"]],
      });

      if (!stockTransfers || stockTransfers.length === 0) {
        return sendServiceMessage(
          "messages.apis.app.stock.transfer.get.no_records"
        );
      }

      // Group transfers by batch_id
      const groupedTransfers = stockTransfers.reduce((acc, transfer) => {
        const batchId = transfer.batch_id;
        if (!acc[batchId]) {
          acc[batchId] = {
            batch_id: batchId,
            from_branch: transfer.fromBranch || null,
            to_branch: transfer.toBranch || null,
            from_company: transfer.fromCompany || null,
            transfer_date: transfer.transfer_date,
            variations: [],
            acknowledged: transfer.acknowledge,
          };
        }

        acc[batchId].variations.push({
          variation_id: transfer.variation.variation_id,
          variation_name: transfer.variation.variation_name,
          item_id: transfer.variation.item.item_id,
          item_name: transfer.variation.item.item_name,
          quantity: transfer.quantity,
          acknowledge: transfer.acknowledge,
          received_quantity: transfer.received_quantity,
          lost_quantity: transfer.lost_quantity,
        });

        return acc;
      }, {});

      // Transform grouped transfers into an array
      const response = Object.values(groupedTransfers);

      // Return data
      return sendServiceData(response);
    } catch (error) {
      console.error(`${TAG} - getStockTransfers: `, error);
      return sendServiceMessage("messages.apis.app.stock.transfer.get.error");
    }
  },
  getBranchItems: async ({ params, query }) => {
    try {
      const { branch_id } = params;
      const { barcode, name } = query;

      // Validate input
      if (!branch_id) {
        return sendServiceMessage(
          "messages.apis.app.stock.branchItem.get.invalid_branch"
        );
      }

      // Validate branch
      const branchExists = await Branch.findByPk(branch_id);
      if (!branchExists) {
        return sendServiceMessage(
          "messages.apis.app.stock.branchItem.get.branch_not_found"
        );
      }

      // Build filter for branch items
      const itemFilter = { branch_id };
      if (barcode) {
        itemFilter["$variation.barcode$"] = barcode;
      }
      if (name) {
        itemFilter["$variation.item.item_name$"] = { [Op.like]: `%${name}%` };
      }

      // Fetch items and stock details
      const branchItems = await BranchItem.findAll({
        where: itemFilter,
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
                attributes: ["item_id", "item_name", "description", "image"],
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
                        attributes: ["category_id", "category_name", "image"],
                      },
                    ],
                  },
                  {
                    model: GST,
                    as: "gst",
                    attributes: [
                      "gst_rate",
                      "cgst_rate",
                      "sgst_rate",
                      "igst_rate",
                    ],
                  },
                  {
                    model: UOM,
                    as: "uom",
                    attributes: ["uom_id", "uom_name"],
                  },
                ],
              },
            ],
          },
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branch_name", "location"],
          },
        ],
        attributes: ["branch_item_id", "stock"],
      });

      // Group items by parent category and subcategory
      const groupedItems = {};
      branchItems.forEach((branchItem) => {
        const variation = branchItem.variation;
        const item = variation.item;
        const category = item.category;
        const parentCategoryName = category?.parent
          ? category.parent.category_name
          : category?.category_name;
        const parentCategoryImage = category?.parent?.image || category?.image;
        const subCategoryName = category?.parent
          ? category.category_name
          : null;
        const subCategoryImage = category?.parent ? category.image : null;

        // Initialize parent category group if not present
        if (!groupedItems[parentCategoryName]) {
          groupedItems[parentCategoryName] = {
            image: parentCategoryImage,
            subcategories: {},
            items: [],
          };
        }

        // Initialize subcategory group under parent category if not present
        if (
          subCategoryName &&
          !groupedItems[parentCategoryName].subcategories[subCategoryName]
        ) {
          groupedItems[parentCategoryName].subcategories[subCategoryName] = {
            image: subCategoryImage,
            items: [],
          };
        }

        // Add items under subcategory or directly under parent category
        const itemData = {
          item_id: item.item_id,
          item_name: item.item_name,
          description: item.description,
          image: item.image,
          branch_item_id: branchItem.branch_item_id,
          variation: {
            variation_id: variation.variation_id,
            variation_name: variation.variation_name,
            mrp: variation.mrp,
            discount: variation.discount,
            stock: branchItem.stock,
            sku: variation.sku,
            barcode: variation.barcode,
            image: variation.image,
            gst: item.gst,
            uom: item.uom,
          },
        };

        if (subCategoryName) {
          groupedItems[parentCategoryName].subcategories[
            subCategoryName
          ].items.push(itemData);
        } else {
          groupedItems[parentCategoryName].items.push(itemData);
        }
      });

      // Convert groupedItems object to an array
      const result = Object.entries(groupedItems).map(
        ([categoryName, categoryData]) => ({
          category_name: categoryName,
          image: categoryData.image,
          subcategories: Object.entries(categoryData.subcategories).map(
            ([subCategoryName, subCategoryData]) => ({
              sub_category_name: subCategoryName,
              image: subCategoryData.image,
              items: subCategoryData.items,
            })
          ),
          items: categoryData.items,
        })
      );

      // Return grouped items as an array
      return sendServiceData(result);
    } catch (error) {
      console.error(`${TAG} - getBranchItems: `, error);
      return sendServiceMessage("messages.apis.stock.app.branchItem.get.error");
    }
  },
  getCompanyItems: async ({ params, query }) => {
    try {
      const { company_id } = params;
      const { barcode, name } = query;

      // Validate input
      if (!company_id) {
        return sendServiceMessage(
          "messages.apis.app.stock.companyItem.get.invalid_company"
        );
      }

      // Validate company
      const companyExists = await Company.findByPk(company_id);
      if (!companyExists) {
        return sendServiceMessage(
          "messages.apis.app.stock.companyItem.get.company_not_found"
        );
      }

      // Build filter for company items
      const itemFilter = { company_id };
      if (barcode) {
        itemFilter["$variation.barcode$"] = barcode;
      }
      if (name) {
        itemFilter["$variation.item.item_name$"] = { [Op.like]: `%${name}%` };
      }

      // Fetch items and stock details
      const companyItems = await CompanyItem.findAll({
        where: itemFilter,
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
                attributes: ["item_id", "item_name", "description", "image"],
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
                        attributes: ["category_id", "category_name", "image"],
                      },
                    ],
                  },
                  {
                    model: GST,
                    as: "gst",
                    attributes: [
                      "gst_rate",
                      "cgst_rate",
                      "sgst_rate",
                      "igst_rate",
                    ],
                  },
                  {
                    model: UOM,
                    as: "uom",
                    attributes: ["uom_id", "uom_name"],
                  },
                ],
              },
            ],
          },
          {
            model: Company,
            as: "company",
            attributes: ["company_id", "company_name"],
          },
        ],
        attributes: ["company_item_id", "stock"],
      });

      // Group items by parent category and subcategory
      const groupedItems = {};
      companyItems.forEach((companyItem) => {
        const variation = companyItem.variation;
        const item = variation.item;
        const category = item.category;
        const parentCategoryName = category?.parent
          ? category.parent.category_name
          : category?.category_name;
        const parentCategoryImage = category?.parent?.image || category?.image;
        const subCategoryName = category?.parent
          ? category.category_name
          : null;
        const subCategoryImage = category?.parent ? category.image : null;

        // Initialize parent category group if not present
        if (!groupedItems[parentCategoryName]) {
          groupedItems[parentCategoryName] = {
            image: parentCategoryImage,
            subcategories: {},
            items: [],
          };
        }

        // Initialize subcategory group under parent category if not present
        if (
          subCategoryName &&
          !groupedItems[parentCategoryName].subcategories[subCategoryName]
        ) {
          groupedItems[parentCategoryName].subcategories[subCategoryName] = {
            image: subCategoryImage,
            items: [],
          };
        }

        // Add items under subcategory or directly under parent category
        const itemData = {
          item_id: item.item_id,
          item_name: item.item_name,
          description: item.description,
          image: item.image,
          company_item_id: companyItem.company_item_id,
          variation: {
            variation_id: variation.variation_id,
            variation_name: variation.variation_name,
            mrp: variation.mrp,
            discount: variation.discount,
            stock: companyItem.stock,
            sku: variation.sku,
            barcode: variation.barcode,
            image: variation.image,
            gst: item.gst,
            uom: item.uom,
          },
        };

        if (subCategoryName) {
          groupedItems[parentCategoryName].subcategories[
            subCategoryName
          ].items.push(itemData);
        } else {
          groupedItems[parentCategoryName].items.push(itemData);
        }
      });

      // Convert groupedItems object to an array
      const result = Object.entries(groupedItems).map(
        ([categoryName, categoryData]) => ({
          category_name: categoryName,
          image: categoryData.image,
          subcategories: Object.entries(categoryData.subcategories).map(
            ([subCategoryName, subCategoryData]) => ({
              sub_category_name: subCategoryName,
              image: subCategoryData.image,
              items: subCategoryData.items,
            })
          ),
          items: categoryData.items,
        })
      );

      // Return grouped items as an array
      return sendServiceData(result);
    } catch (error) {
      console.error(`${TAG} - getCompanyItems: `, error);
      return sendServiceMessage(
        "messages.apis.app.stock.companyItem.get.error"
      );
    }
  },
  getBranchItemBySearch: async ({ params, query }) => {
    try {
      const { branch_id } = params;
      const { barcode, sku, name } = query;

      // Validate input
      if (!branch_id) {
        return sendServiceMessage(
          "messages.apis.app.stock.branchItem.get.invalid_branch"
        );
      }

      // Validate branch
      const branchExists = await Branch.findByPk(branch_id);
      if (!branchExists) {
        return sendServiceMessage(
          "messages.apis.app.stock.branchItem.get.branch_not_found"
        );
      }

      // If barcode or sku is provided, search for that specific variation
      if (barcode || sku) {
        const variationFilter = {};
        if (barcode) variationFilter.barcode = barcode;
        if (sku) variationFilter.sku = sku;

        const variation = await ItemVariation.findOne({
          where: variationFilter,
          include: [
            {
              model: Item,
              as: "item",
              attributes: ["item_id", "item_name", "description", "image"],
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
                      attributes: ["category_id", "category_name", "image"],
                    },
                  ],
                },
                {
                  model: GST,
                  as: "gst",
                  attributes: [
                    "gst_rate",
                    "cgst_rate",
                    "sgst_rate",
                    "igst_rate",
                  ],
                },
                {
                  model: UOM,
                  as: "uom",
                  attributes: ["uom_id", "uom_name"],
                },
              ],
            },
          ],
        });

        if (!variation) {
          return sendServiceMessage(
            "messages.apis.app.stock.branchItem.get.no_variation_found"
          );
        }

        // Fetch stock from BranchItem
        const branchItem = await BranchItem.findOne({
          where: { branch_id, variation_id: variation.variation_id },
          attributes: ["stock"],
        });

        return sendServiceData({
          item_id: variation.item.item_id,
          item_name: variation.item.item_name,
          description: variation.item.description,
          image: variation.item.image,
          category: {
            name: variation.item.category?.parent
              ? variation.item.category.parent.category_name
              : variation.item.category?.category_name,
            image:
              variation.item.category?.parent?.image ||
              variation.item.category?.image,
          },
          sub_category: variation.item.category?.parent
            ? {
                name: variation.item.category.category_name,
                image: variation.item.category.image,
              }
            : null,
          variation: {
            variation_id: variation.variation_id,
            variation_name: variation.variation_name,
            mrp: variation.mrp,
            discount: variation.discount,
            stock: branchItem?.stock || 0,
            sku: variation.sku,
            barcode: variation.barcode,
            image: variation.image,
            gst: variation.item.gst,
            uom: variation.item.uom,
          },
        });
      }

      // If name is provided, search for all matching items and group variations
      if (name) {
        const branchItems = await BranchItem.findAll({
          where: { branch_id },
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
                  attributes: ["item_id", "item_name", "description", "image"],
                  where: {
                    item_name: { [Op.like]: `%${name}%` },
                  },
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
                          attributes: ["category_id", "category_name", "image"],
                        },
                      ],
                    },
                    {
                      model: GST,
                      as: "gst",
                      attributes: [
                        "gst_rate",
                        "cgst_rate",
                        "sgst_rate",
                        "igst_rate",
                      ],
                    },
                    {
                      model: UOM,
                      as: "uom",
                      attributes: ["uom_id", "uom_name"],
                    },
                  ],
                },
              ],
            },
          ],
          attributes: ["branch_item_id", "stock"],
        });

        if (!branchItems.length) {
          return sendServiceMessage(
            "messages.apis.app.stock.branchItem.get.no_items"
          );
        }

        // Group variations under each matching item
        const groupedItems = {};
        branchItems.forEach((branchItem) => {
          const variation = branchItem.variation;

          // If variation exists but item is null, skip it
          if (!variation || !variation.item) {
            console.warn(
              `Skipping variation ID ${variation?.variation_id} due to missing item.`
            );
            return;
          }

          const item = variation.item;
          const category = item.category;
          const parentCategoryName = category?.parent
            ? category.parent.category_name
            : category?.category_name;
          const parentCategoryImage =
            category?.parent?.image || category?.image;
          const subCategoryName = category?.parent
            ? category.category_name
            : null;
          const subCategoryImage = category?.parent ? category.image : null;

          // Prepare item structure
          const itemKey = item.item_id;
          if (!groupedItems[itemKey]) {
            groupedItems[itemKey] = {
              item_id: item.item_id,
              item_name: item.item_name,
              description: item.description,
              image: item.image,
              category: {
                name: parentCategoryName,
                image: parentCategoryImage,
              },
              sub_category: subCategoryName
                ? {
                    name: subCategoryName,
                    image: subCategoryImage,
                  }
                : null,
              variations: [],
            };
          }

          // Push variation inside the item’s variations array
          groupedItems[itemKey].variations.push({
            variation_id: variation.variation_id,
            variation_name: variation.variation_name,
            mrp: variation.mrp,
            discount: variation.discount,
            stock: branchItem.stock,
            sku: variation.sku,
            barcode: variation.barcode,
            image: variation.image,
            gst: item.gst,
            uom: item.uom,
          });
        });

        return sendServiceData(Object.values(groupedItems));
      }

      return sendServiceMessage(
        "messages.apis.app.stock.branchItem.get.invalid_query"
      );
    } catch (error) {
      console.error(`${TAG} - getBranchItemBySearch: `, error);
      return sendServiceMessage("messages.apis.app.stock.branchItem.get.error");
    }
  },
  // Retrieve a Stock Transaction by ID
  getStock: async ({ params }) => {
    try {
      const stockTransaction = await StockRegister.findByPk(params.stock_id, {
        include: [
          { model: Item, as: "item", attributes: ["item_name"] },
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name"],
          },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
        ],
      });

      if (!stockTransaction) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.read.not_found"
        );
      }

      return sendServiceData(stockTransaction);
    } catch (error) {
      console.error(`${TAG} - getStock: `, error);
      return sendServiceMessage("messages.apis.app.stockRegister.read.error");
    }
  },

  // List All Stock Transactions
  getStocks: async () => {
    try {
      const stockTransactions = await StockRegister.findAll({
        include: [
          { model: Item, as: "item", attributes: ["item_name"] },
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name"],
          },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
        ],
      });

      return sendServiceData(stockTransactions);
    } catch (error) {
      console.error(`${TAG} - getAllStocks: `, error);
      return sendServiceMessage(
        "messages.apis.app.stockRegister.read_all.error"
      );
    }
  },

  // Update a Stock Transaction
  updateStock: async ({ params, body }) => {
    try {
      const stockTransaction = await StockRegister.findByPk(params.stock_id);

      if (!stockTransaction) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.update.not_found"
        );
      }

      const updates = {};
      if (body.quantity !== undefined) updates.quantity = body.quantity;
      if (body.remarks) updates.remarks = body.remarks;

      // Recalculate GST amount if quantity or gst_rate is updated
      if (body.quantity || body.gst_rate) {
        updates.gst_rate = body.gst_rate || stockTransaction.gst_rate;
        updates.gst_amount =
          (updates.quantity || stockTransaction.quantity) *
          (updates.gst_rate / 100);
      }

      await stockTransaction.update(updates);

      return sendServiceData(stockTransaction);
    } catch (error) {
      console.error(`${TAG} - updateStock: `, error);
      return sendServiceMessage("messages.apis.app.stockRegister.update.error");
    }
  },

  // Delete a Stock Transaction
  deleteStock: async ({ params }) => {
    try {
      const stockTransaction = await StockRegister.findByPk(params.stock_id);

      if (!stockTransaction) {
        return sendServiceMessage(
          "messages.apis.app.stockRegister.delete.not_found"
        );
      }

      await stockTransaction.destroy();

      return sendServiceMessage(
        "messages.apis.app.stockRegister.delete.success"
      );
    } catch (error) {
      console.error(`${TAG} - deleteStock: `, error);
      return sendServiceMessage("messages.apis.app.stockRegister.delete.error");
    }
  },

  // Retrieve Stock Transactions by Branch
  getStocksByBranch: async ({ params }) => {
    try {
      const { branch_id } = params;

      const stockTransactions = await StockRegister.findAll({
        where: { branch_id: branch_id },
        include: [
          { model: Item, as: "item", attributes: ["item_name"] },
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name"],
          },
        ],
      });

      return sendServiceData(stockTransactions);
    } catch (error) {
      console.error(`${TAG} - getStocksByBranch: `, error);
      return sendServiceMessage(
        "messages.apis.app.stockRegister.list.by_branch.error"
      );
    }
  },

  // Retrieve Stock Transactions by Item
  getStocksByItem: async ({ params }) => {
    try {
      const { item_id } = params;

      const stockTransactions = await StockRegister.findAll({
        where: { item_id: item_id },
        include: [
          {
            model: ItemVariation,
            as: "variation",
            attributes: ["variation_name"],
          },
          { model: Branch, as: "branch", attributes: ["branch_name"] },
        ],
      });

      return sendServiceData(stockTransactions);
    } catch (error) {
      console.error(`${TAG} - getStocksByItem: `, error);
      return sendServiceMessage(
        "messages.apis.app.stockRegister.list.by_item.error"
      );
    }
  },

  // Create Stock Request
  createStockRequest: async (req) => {
    try {
      const { items, timestamp } = req.body;

      const { employee_id: manager_id } = req.employee;

      const { branch_id, company_id } = req.user;

      console.log("Data", manager_id, branch_id, company_id);

      // Validate input
      if (
        !branch_id ||
        !manager_id ||
        !company_id ||
        !items ||
        items.length === 0 ||
        !timestamp
      ) {
        return sendServiceMessage(
          "messages.apis.app.stock.request.create.invalid_body"
        );
      }

      // Validate branch
      const branch = await Branch.findByPk(branch_id);
      if (!branch || branch.company_id !== company_id) {
        return sendServiceMessage(
          "messages.apis.app.stock.request.create.invalid_branch"
        );
      }

      // Validate manager
      const manager = await Employee.findByPk(manager_id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["branch_id"],
          },
        ],
      });
      if (!manager || manager?.user?.branch_id !== branch_id) {
        return sendServiceMessage(
          "messages.apis.app.stock.request.create.invalid_manager"
        );
      }

      // Generate a unique batch_id for this stock request session
      const batch_id = uuidv4();

      // Iterate through items and validate/create stock requests
      const stockRequests = [];
      for (const item of items) {
        const { variation_id, stock_requested, remarks } = item;

        if (!variation_id || stock_requested === undefined) {
          return sendServiceMessage(
            "messages.apis.app.stock.request.create.invalid_item_body"
          );
        }

        if (stock_requested <= 0) {
          return sendServiceMessage(
            "messages.apis.app.stock.request.create.invalid_stock_requested"
          );
        }

        // Validate item variation
        const variation = await ItemVariation.findByPk(variation_id);
        if (!variation) {
          return sendServiceMessage(
            "messages.apis.app.stock.request.create.invalid_variation"
          );
        }

        // Create stock request for each item
        const stockRequest = await StockRequest.create({
          batch_id,
          branch_id,
          manager_id,
          company_id,
          variation_id,
          stock_requested,
          remarks: remarks || null,
          request_date: timestamp,
        });

        stockRequests.push(stockRequest);
      }

      return sendServiceData(stockRequests);
    } catch (error) {
      console.error(`${TAG} - createStockRequest: `, error);
      return sendServiceMessage("messages.apis.app.stock.request.create.error");
    }
  },

  getStockRequests: async ({ query }) => {
    try {
      const { branch_id, manager_id, company_id } = query;

      if (!branch_id && !company_id) {
        return sendServiceMessage(
          "messages.apis.app.stock.request.read.invalid_query"
        );
      }

      // Build the query filter
      const filter = {};
      if (branch_id) filter.branch_id = branch_id;
      if (manager_id) filter.manager_id = manager_id;
      if (company_id) filter.company_id = company_id;

      // Fetch stock requests
      const stockRequests = await StockRequest.findAll({
        where: filter,
        include: [
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branch_name", "location"],
          },
          {
            model: Employee,
            as: "manager",
            attributes: ["employee_id", "user_id"],
            include: [
              {
                model: User,
                as: "user",
                attributes: ["name", "email", "mobile_number"],
              },
            ],
          },
          {
            model: Company,
            as: "company",
            attributes: ["company_id", "company_name"],
          },
          {
            model: ItemVariation,
            as: "variation",
            include: [
              {
                model: Item,
                as: "item",
                attributes: ["item_id", "item_name"],
              },
            ],
          },
        ],
        attributes: [
          "batch_id", // include batch_id for grouping
          "stock_request_id",
          "branch_id",
          "manager_id",
          "company_id",
          "variation_id",
          "stock_requested",
          "remarks",
          "status",
          "request_date",
          "created_at",
        ],
        order: [["request_date", "DESC"]],
      });

      // Group by batch_id using lodash
      const grouped = _.groupBy(stockRequests, "batch_id");

      // Convert to array format for easier frontend use
      const result = Object.entries(grouped).map(([batch_id, requests]) => ({
        batch_id,
        batch_status: requests[0]?.status || null,
        items: requests,
        created_at: requests[0]?.created_at || null,
        request_date: requests[0]?.request_date || null,
      }));

      return sendServiceData(result);
    } catch (error) {
      console.error(`${TAG} - getStockRequests: `, error);
      return sendServiceMessage("messages.apis.app.stock.request.read.error");
    }
  },

  updateStockRequestStatus: async (req) => {
    try {
      const { batch_id, status } = req.body;

      console.log("Update Stock Request Status", batch_id, status);

      if (!batch_id || !status) {
        return sendServiceMessage(
          "messages.apis.app.stock.request.update.invalid_body"
        );
      }

      // Validate status
      const validStatuses = [
        "PENDING",
        "REJECTED",
        "PARTIALLY APPROVED",
        "APPROVED",
      ];
      if (!validStatuses.includes(status)) {
        return sendServiceMessage(
          "messages.apis.app.stock.request.update.invalid_status"
        );
      }

      // Check if such stock requests exist
      const stockRequests = await StockRequest.findAll({ where: { batch_id } });

      if (!stockRequests || stockRequests.length === 0) {
        return sendServiceMessage(
          "messages.apis.app.stock.request.update.not_found"
        );
      }

      // Update all requests in the batch
      await StockRequest.update(
        { status },
        {
          where: { batch_id },
        }
      );

      return sendServiceData(stockRequests);
    } catch (error) {
      console.error(`${TAG} - updateStockRequestStatus:`, error);
      return sendServiceMessage("messages.apis.app.stock.request.update.error");
    }
  },
};
