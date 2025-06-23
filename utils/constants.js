const Status = {
  Usage: {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
  },
};

const Type = {
  Log: {
    PRE_CHANGE: "PRE_CHANGE",
    POST_CHANGE: "POST_CHANGE",
    AUDIT: "AUDIT",
    ERROR: "ERROR",
  },
  OtpFor: {
    LOGIN: "LOGIN",
    REGISTER: "REGISTER",
  },
  Device: {
    WEB: "WEB",
    ANDROID: "ANDROID",
  },
  Gender: {
    MALE: "MALE",
    FEMALE: "FEMALE",
    OTHER: "OTHER",
  },
};

const Enums = {};

const Internal = {};

module.exports = {
  Status,
  Type,
  Enums,
  Internal,
};
