const { getText } = require("../language");

const getServiceResult = (error = false, data = null, message = "") => ({
  error,
  data,
  message,
});

module.exports = {
  sendServiceData: (data) => getServiceResult(false, data),
  sendServiceError: (error) => getServiceResult(true, null, error),
  sendServiceMessage: (text, data = null) =>
    getServiceResult(true, data, getText(text)),
};
