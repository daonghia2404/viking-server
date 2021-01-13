const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const hassPasword = (value) => {
  return bcrypt.hash(value, saltRounds);
};

const comparePassword = (value, hash) => {
  return bcrypt.compare(value, hash);
};

const signToken = (type, user) => {
  if (type === "access")
    return jwt.sign(user, process.env.ACCESS_TOKEN_KEY, { expiresIn: "3d" });
  if (type === "refresh")
    return jwt.sign(user, process.env.REFRESH_TOKEN_KEY, { expiresIn: "7d" });
  if (type === "reset-password")
    return jwt.sign(user, process.env.RESET_PASSWORD_TOKEN_KEY, { expiresIn: "5m" });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["x-token"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, response) => {
    if (err) return res.sendStatus(403);
    req.response = response;
    next();
  });
};

const authenticateRefreshToken = (req, res, next) => {
  const authHeader = req.headers["x-refresh-token"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.REFRESH_TOKEN_KEY, (err, response) => {
    if (err) return res.sendStatus(403);
    req.response = {
      ...response,
      refreshToken: token,
    };
    next();
  });
}

const authenticateResetPasswordToken = (req, res, next) => {
  const token = req.body.resetToken
  jwt.verify(token, process.env.RESET_PASSWORD_TOKEN_KEY, (err, response) => {
    if (err) {
      res.json({
        success: false,
        message: 'Token key đã hết hạn sử dụng'
      })
      return
    }
    req.response = response
    next();
  });
}

module.exports = { hassPasword, comparePassword, signToken, authenticateToken, authenticateRefreshToken, authenticateResetPasswordToken };
