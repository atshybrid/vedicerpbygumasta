const { checkToken } = require("./authentication");
const {
  isAdmin,
  isAdminOrManager,
  isUser,
  isManager,
  isBiller,
  isManagerOrBiller,
} = require("./user.guards");

// const validateEntry = async (req, res, next) => {
//   await checkHeaders(req, res, async () => {
//     await checkToken(req, res, next);
//   });
// };

// const validateEntry = async (req, res, next) => {
//   await checkToken(req, res, next);
// };

// const validateEntryOptional = async (req, res, next) => {
//   await checkOptionalHeaders(req, res, async () => {
//     await checkOptionalToken(req, res, next);
//   });
// };

const validateAdmin = async (req, res, next) => {
  await checkToken(req, res, async () => {
    await isAdmin(req, res, next);
  });
};

const validateAdminOrManager = async (req, res, next) => {
  await checkToken(req, res, async () => {
    await isAdminOrManager(req, res, next);
  });
};

const validateUser = async (req, res, next) => {
  await checkToken(req, res, async () => {
    await isUser(req, res, next);
  });
};

const validateManager = async (req, res, next) => {
  await checkToken(req, res, async () => {
    await isManager(req, res, next);
  });
};

const validateBiller = async (req, res, next) => {
  await checkToken(req, res, async () => {
    await isBiller(req, res, next);
  });
};

const validateManagerOrBiller = async (req, res, next) => {
  await checkToken(req, res, async () => {
    await isManagerOrBiller(req, res, next);
  });
};

module.exports = {
  validateAdmin,
  validateAdminOrManager,
  validateUser,
  validateManager,
  validateBiller,
  validateManagerOrBiller,
};
