const axios = require("axios");

const sendWhatsAppOTP = async (name, otp, phoneNumber) => {
  try {
    const data = JSON.stringify({
      from: "918686688966", // Sender's WhatsApp number
      to: phoneNumber, // Recipient's WhatsApp number
      type: "template",
      message: {
        templateid: "268311", // Template ID
        placeholders: [name, otp], // Replace placeholders in the template
      },
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://wapi.wbbox.in/v2/wamessage/send",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.WHATSAPP_API_KEY, // Replace with your actual API key
      },
      data: data,
    };

    const response = await axios.request(config);

    // Check response status
    if (response.data && response.data.status === "SUCCESS") {
      console.log("WhatsApp message sent successfully:", response.data);
      return true;
    } else {
      console.error("Failed to send WhatsApp message:", response.data);
      return false;
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

const sendManagerHandoverNotification = async ({
  name,
  phoneNumber,
  billerName,
  settlementDate,
  amount,
  branchName,
}) => {
  try {
    console.log("Sending WhatsApp message to:", phoneNumber, name, billerName);
    const data = JSON.stringify({
      from: "918686688966",
      to: phoneNumber,
      type: "template",
      message: {
        templateid: "774769",
        placeholders: [
          name,
          billerName,
          billerName,
          settlementDate,
          amount,
          branchName,
        ],
      },
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://wapi.wbbox.in/v2/wamessage/send",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.WHATSAPP_API_KEY, // Replace with your actual API key
      },
      data: data,
    };

    const response = await axios.request(config);

    // Check response status
    if (response.data && response.data.status === "SUCCESS") {
      console.log("WhatsApp message sent successfully:", response.data);
      return true;
    } else {
      console.error("Failed to send WhatsApp message:", response.data);
      return false;
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

const sendBillerHandoverNotification = async ({
  name,
  phoneNumber,
  billerName,
  settlementDate,
  amount,
  status,
  branchName,
}) => {
  try {
    console.log("Sending WhatsApp message to:", phoneNumber, name, billerName);
    const data = JSON.stringify({
      from: "918686688966",
      to: phoneNumber,
      type: "template",
      message: {
        templateid: "774779",
        placeholders: [
          billerName,
          amount,
          settlementDate,
          status,
          name,
          branchName,
        ],
      },
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://wapi.wbbox.in/v2/wamessage/send",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.WHATSAPP_API_KEY, // Replace with your actual API key
      },
      data: data,
    };

    const response = await axios.request(config);

    // Check response status
    if (response.data && response.data.status === "SUCCESS") {
      console.log("WhatsApp message sent successfully:", response.data);
      return true;
    } else {
      console.error("Failed to send WhatsApp message:", response.data);
      return false;
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

const sendInvoiceToCustomer = async ({
  phoneNumber,
  name,
  branchName,
  invoiceNo,
  date,
  total,
  url,
  filename,
  branchPhoneNo,
}) => {
  try {
    console.log("Sending WhatsApp message to:", phoneNumber, name, branchName);
    const data = JSON.stringify({
      from: "918686688966",
      to: `91${phoneNumber}`,
      type: "template",
      message: {
        templateid: "774767",
        url,
        filename,
        placeholders: [name, branchName, invoiceNo, date, total],
        buttons: [
          {
            index: 0,
            type: "Support",
            placeholder: branchPhoneNo,
          },
        ],
      },
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://wapi.wbbox.in/v2/wamessage/send",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.WHATSAPP_API_KEY,
      },
      data: data,
    };

    const response = await axios.request(config);

    // Check response status
    if (response.data && response.data.status === "SUCCESS") {
      console.log("WhatsApp message sent successfully:", response.data);
      return true;
    } else {
      console.error("Failed to send WhatsApp message:", response.data);
      return false;
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return false;
  }
};

module.exports = {
  sendWhatsAppOTP,
  sendManagerHandoverNotification,
  sendBillerHandoverNotification,
  sendInvoiceToCustomer,
};
