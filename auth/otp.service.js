const { OTP } = require("./../../models"); // Assuming OTP is the Sequelize model for the otp table
const {
  sendServiceData,
  sendServiceMessage,
} = require("./../../utils/service.response");

const TAG = "otp.service.js";

module.exports = {
  // Generate and Send OTP
  generateAndSendOTP: async ({ body }) => {
    try {
      const { phone_number } = body;

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

      // Simulate sending OTP via WhatsApp API
      console.log(`Sending OTP ${otp_code} to WhatsApp: ${phone_number}`);

      // Add actual WhatsApp API integration here
      // For example:
      // await sendWhatsAppMessage(phone_number, `Your OTP is ${otp_code}`);

      return sendServiceData(otpEntry);
    } catch (error) {
      console.error(`${TAG} - generateAndSendOTP: `, error);
      return sendServiceMessage("messages.apis.app.otp.generate.error");
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
        return sendServiceMessage("messages.apis.app.otp.verify.invalid");
      }

      // Check if OTP is expired
      if (new Date() > otpEntry.expires_at) {
        return sendServiceMessage("messages.apis.app.otp.verify.expired");
      }

      // Mark OTP as verified
      await otpEntry.update({ is_verified: 1 });

      return sendServiceData({ message: "OTP verified successfully" });
    } catch (error) {
      console.error(`${TAG} - verifyOTP: `, error);
      return sendServiceMessage("messages.apis.app.otp.verify.error");
    }
  },

  // Resend OTP
  resendOTP: async ({ body }) => {
    try {
      const { phone_number } = body;

      // Check if an OTP already exists and is unverified
      const existingOTP = await OTP.findOne({
        where: { phone_number, is_verified: 0 },
        order: [["created_at", "DESC"]],
      });

      if (!existingOTP || new Date() > existingOTP.expires_at) {
        // Generate and send a new OTP if the existing one is expired or doesn't exist
        return module.exports.generateAndSendOTP({ body });
      }

      // Resend the existing OTP
      console.log(
        `Resending OTP ${existingOTP.otp_code} to WhatsApp: ${phone_number}`
      );

      // Add actual WhatsApp API integration here
      // For example:
      // await sendWhatsAppMessage(phone_number, `Your OTP is ${existingOTP.otp_code}`);

      return sendServiceData({ message: "OTP resent successfully" });
    } catch (error) {
      console.error(`${TAG} - resendOTP: `, error);
      return sendServiceMessage("messages.apis.app.otp.resend.error");
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
