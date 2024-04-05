const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const AccessToken = db.accessToken;

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
}

const verifyToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  const existingAccessToken = await AccessToken.findOne({
    where: {
      token: token
    }
  })

  if(existingAccessToken) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return catchError(err, res);
      }
      req.userId = decoded.id;
      next();
    });
  } else {
    return res.status(403).send({ message: "Token Expired!" });
  }

};

const authJwt = {
  verifyToken: verifyToken,
};
module.exports = authJwt;
