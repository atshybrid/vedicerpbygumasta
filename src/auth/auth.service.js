const { User, Branch, Company, Role, Employee, OTP } = require("../../models");
const { sendWhatsAppOTP } = require("../../utils/whatsapp.send.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const {
  sendServiceData,
  sendServiceMessage,
} = require("../../utils/service.response");

const TAG = "auth.service.js";

module.exports = {
  getMpinStatus: async ({ params: { phoneNo: mobile_number } }) => {
    try {
      // Validate input
      if (!mobile_number) {
        return sendServiceMessage("messages.apis.auth.signIn.invalid_body");
      }

      // Find the user by mobile number
      const user = await User.findOne({
        where: { mobile_number },
        attributes: [
          "user_id",
          "mobile_number",
          "mpin",
          "name",
          "email",
          "role_id",
          "branch_id",
          "company_id",
        ],
      });

      if (!user) {
        return sendServiceMessage("messages.apis.auth.signIn.user_not_found");
      }

      return sendServiceData({
        has_mpin: user.mpin ? true : false,
      });
    } catch (error) {
      console.error(`${TAG} - getMpinStatus: `, error);
      return sendServiceMessage("messages.apis.auth.signIn.error");
    }
  },
  signIn: async ({ body }) => {
    try {
      const { mobile_number, mpin } = body;

      // Validate input
      if (!mobile_number || !mpin) {
        return sendServiceMessage("messages.apis.auth.signIn.invalid_body");
      }

      // Find the user by mobile number
      const user = await User.findOne({
        where: { mobile_number },
        attributes: [
          "user_id",
          "mobile_number",
          "mpin",
          "name",
          "email",
          "role_id",
          "branch_id",
          "company_id",
        ],
        include: [
          {
            model: Branch,
            as: "branch",
            attributes: ["id", "branch_name", "location"],
          },
          {
            model: Role,
            as: "role",
            attributes: ["role_id", "role_name"],
          },
          {
            model: Company,
            as: "company",
            attributes: ["company_id", "company_name"],
          },
        ],
      });

      if (!user) {
        return sendServiceMessage("messages.apis.auth.signIn.user_not_found");
      }

      if (!user.mpin) {
        return sendServiceData({
          user: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            mobile_number: user.mobile_number,
            role_id: user.role_id,
            branch_id: user.branch_id,
            company_id: user.company_id,
            branch: user.branch
              ? {
                  id: user.branch.id,
                  branch_name: user.branch.branch_name,
                  location: user.branch.location,
                }
              : null,
            role: user.role
              ? {
                  role_id: user.role.role_id,
                  role_name: user.role.role_name,
                }
              : null,
            company: user.company
              ? {
                  company_id: user.company.company_id,
                  company_name: user.company.company_name,
                }
              : null,
            has_mpin: false,
          },
        });
      }

      // Compare MPIN
      const isValidMpin = await bcrypt.compare(mpin, user.mpin);
      if (!isValidMpin) {
        return sendServiceMessage("messages.apis.auth.signIn.invalid_mpin");
      }

      // Fetch employee details if available
      const employee = await Employee.findOne({
        where: { user_id: user.user_id },
        attributes: ["employee_id", "employee_no"],
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          user_id: user.user_id,
          name: user.name,
          mobile_number: user.mobile_number,
          role_id: user.role_id,
          branch_id: user.branch_id,
          company_id: user.company_id,
          employee_id: employee?.employee_id || null,
          employee_no: employee?.employee_no || null,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return sendServiceData({
        token,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          mobile_number: user.mobile_number,
          role_id: user.role_id,
          branch_id: user.branch_id,
          company_id: user.company_id,
          branch: user.branch
            ? {
                id: user.branch.id,
                branch_name: user.branch.branch_name,
                location: user.branch.location,
              }
            : null,
          role: user.role
            ? {
                role_id: user.role.role_id,
                role_name: user.role.role_name,
              }
            : null,
          company: user.company
            ? {
                company_id: user.company.company_id,
                company_name: user.company.company_name,
              }
            : null,
          employee_id: employee?.employee_id || null,
          employee_no: employee?.employee_no || null,
        },
      });
    } catch (error) {
      console.error(`${TAG} - signIn: `, error);
      return sendServiceMessage("messages.apis.auth.signIn.error");
    }
  },
  // Generate and Send OTP
  generateAndSendOTP: async ({ body }) => {
    try {
      const { phone_number } = body;

      // Fetch user details from the phone number
      const user = await User.findOne({
        where: { mobile_number: phone_number },
        attributes: ["name", "mobile_number"],
      });

      if (!user) {
        return sendServiceMessage("messages.apis.auth.common.user_not_found");
      }

      // Generate a random 6-digit OTP
      const otp_code = Math.floor(100000 + Math.random() * 900000).toString();

      // Set OTP expiry time (e.g., 5 minutes from now)
      const expires_at = new Date(Date.now() + 5 * 60 * 1000);

      // Save OTP to database
      const otpEntry = await OTP.create({
        phone_number,
        otp_code,
        expires_at,
      });

      // Send OTP via WhatsApp
      const messageSent = await sendWhatsAppOTP(
        user.name,
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
      console.error(`${TAG} - generateAndSendOTP: `, error);
      return sendServiceMessage("messages.apis.auth.request_otp.error");
    }
  },

  // Verify OTP
  verifyOTP: async ({ body }) => {
    try {
      const { phone_number, otp_code } = body;

      // Find the OTP entry
      const otpEntry = await OTP.findOne({
        where: { phone_number, otp_code },
      });

      if (!otpEntry) {
        return sendServiceMessage(
          "messages.apis.auth.verify_otp.incorrect_otp"
        );
      }

      // Check if OTP is expired
      if (new Date() > otpEntry.expires_at) {
        return sendServiceMessage("messages.apis.auth.verify_otp.otp_expired");
      }

      // Mark OTP as verified
      await otpEntry.update({ is_verified: 1 });

      const user = await User.findOne({
        where: { mobile_number: phone_number },
        attributes: ["name", "mobile_number"],
      });

      return sendServiceData({
        name: user.name,
        mobile_number: user.mobile_number,
      });
    } catch (error) {
      console.error(`${TAG} - verifyOTP: `, error);
      return sendServiceMessage("messages.apis.auth.verify_otp.error");
    }
  },

  // Resend OTP
  resendOTP: async ({ body }) => {
    try {
      const { phone_number } = body;

      if (!phone_number) {
        return sendServiceMessage("messages.apis.auth.common.invalid_body");
      }

      // Check if user exists
      const user = await User.findOne({
        where: { mobile_number: phone_number },
        attributes: ["name", "mobile_number"],
      });

      if (!user) {
        return sendServiceMessage("messages.apis.auth.common.user_not_found");
      }

      // Delete expired OTPs for this phone number
      await OTP.destroy({
        where: { phone_number, expires_at: { [Op.lt]: new Date() } },
      });

      // Check for an existing valid OTP
      let existingOTP = await OTP.findOne({
        where: {
          phone_number,
          is_verified: false,
          expires_at: { [Op.gt]: new Date() },
        },
        order: [["created_at", "DESC"]],
      });

      if (existingOTP) {
        // Resend the existing OTP via WhatsApp
        const messageSent = await sendWhatsAppOTP(
          user.name,
          existingOTP.otp_code,
          phone_number
        );

        if (!messageSent) {
          return sendServiceMessage("messages.apis.auth.request_otp.error");
        }

        return sendServiceData({
          message: "OTP resent successfully",
          otp_id: existingOTP.otp_id,
          phone_number: existingOTP.phone_number,
          sent_at: existingOTP.created_at,
          expires_at: existingOTP.expires_at,
        });
      }

      // If no valid OTP exists, generate a new one
      const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires_at = new Date(Date.now() + 5 * 60 * 1000);

      const newOTP = await OTP.create({
        phone_number,
        otp_code,
        expires_at,
      });

      // Send the new OTP via WhatsApp
      const messageSent = await sendWhatsAppOTP(
        user.name,
        otp_code,
        phone_number
      );

      if (!messageSent) {
        return sendServiceMessage("messages.apis.auth.request_otp.error");
      }

      return sendServiceData({
        otp_id: newOTP.otp_id,
        phone_number: newOTP.phone_number,
        sent_at: newOTP.created_at,
        expires_at: newOTP.expires_at,
      });
    } catch (error) {
      console.error(`${TAG} - resendOTP: `, error);
      return sendServiceMessage("messages.apis.auth.resend_otp.error");
    }
  },

  forgotPassword: async ({ body }) => {
    try {
      const { phone_number, new_mpin } = body;

      // Validate input
      if (!phone_number || !new_mpin || new_mpin.length !== 6) {
        return sendServiceMessage("messages.apis.auth.reset_mpin.invalid_body");
      }

      // Check if OTP for this user is verified
      const otpEntry = await OTP.findOne({
        where: { phone_number, is_verified: true },
        order: [["created_at", "DESC"]],
      });

      if (!otpEntry) {
        return sendServiceMessage(
          "messages.apis.auth.reset_mpin.unverified_otp"
        );
      }

      // Hash the new MPIN
      const hashedMpin = await bcrypt.hash(new_mpin, 10);

      // Update user's MPIN
      const user = await User.findOne({
        where: { mobile_number: phone_number },
      });
      if (!user) {
        return sendServiceMessage("messages.apis.auth.common.user_not_found");
      }
      await otpEntry.update({ is_verified: false });
      await user.update({ mpin: hashedMpin });

      return { error: false };
    } catch (error) {
      console.error(`${TAG} - forgotPassword: `, error);
      return sendServiceMessage("messages.apis.auth.reset_mpin.error");
    }
  },

  // Clean Up Expired OTPs
  cleanupExpiredOTPs: async () => {
    try {
      const result = await OTP.destroy({
        where: {
          expires_at: { [Op.lt]: new Date() }, // Delete OTPs where expires_at is in the past
        },
      });

      console.log(`Deleted ${result} expired OTPs`);
      return sendServiceData({ message: `Deleted ${result} expired OTPs` });
    } catch (error) {
      console.error(`${TAG} - cleanupExpiredOTPs: `, error);
      return sendServiceMessage("messages.apis.app.otp.cleanup.error");
    }
  },
};
