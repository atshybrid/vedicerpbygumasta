const jwt = require("jsonwebtoken");

const TAG = "authorization.js";

const checkAdminToken = (req, res, next) => {
  try {
    // const token = req.headers.authorization.split(" ")[1];
    next();
    return;
    const data = jwt.verify(token, process.env.SECRET_KEY);
    if (data) {
      req.userId = data.id;
      next();
    } else {
      return res.status(401).json({
        isSuccess: false,
        message: "something wrong with token",
      });
    }
  } catch (err) {
    return res.status(401).json({
      isSuccess: false,
      message: "something wrong with token",
    });
  }
};

const checkToken = (req, res, next) => {
  try {
    // console.log(
    //   `${TAG}.checkToken: req.headers.authorization: ${req.headers.authorization}`
    // );
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(`${TAG}.checkToken: data: ${JSON.stringify(data)}`);
    if (data) {
      req.user_id = data.user_id;
      req.branch_id = data?.branch_id;
      req.company_id = data?.company_id;
      req.employee_id = data?.employee_id;
      next();
    } else {
      return res.status(401).json({
        isSuccess: false,
        message: "token has expired",
      });
    }
  } catch (err) {
    console.log(`${TAG}.checkToken: ${err}`);
    return res.status(401).json({
      isSuccess: false,
      message: "something wrong with token",
    });
  }
};

module.exports = {
  checkAdminToken,
  checkToken,
};
