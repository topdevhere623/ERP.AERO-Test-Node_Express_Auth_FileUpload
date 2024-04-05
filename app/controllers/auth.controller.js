const db = require("../models");
const config = require("../config/auth.config");
const { user: User, refreshToken: RefreshToken, accessToken: AccessToken } = db;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  User.create({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 8)
  }).then(async (user) => {
      if(user) {
        const token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: config.jwtExpiration
        });
  
        await AccessToken.saveToken(user, token);
        let refreshToken = await RefreshToken.createToken(user);
  
        res.status(200).send({
          id: user.id,
          username: user.username,
          accessToken: token,
          refreshToken: refreshToken,
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      username: req.body.username
    }
  })
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      const token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: config.jwtExpiration
      });

      await AccessToken.updateToken(user.id, token);
      let refreshToken = await RefreshToken.createToken(user);

      res.status(200).send({
        id: user.id,
        username: user.username,
        accessToken: token,
        refreshToken: refreshToken,
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.logout = async (req, res) => {
  const userId = req.userId;

  RefreshToken.destroy({ where: { userId: userId } });

  AccessToken.updateToken(userId, null);
  return res.status(200).json({ message: "User is logged out!" });
};

exports.getInfo = async (req, res) => {
  const userId = req.userId;
  
  const userInfo = await User.findOne({ where: { id: userId } });

  return res.status(200).json(userInfo.id);
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.destroy({ where: { id: refreshToken.id } });
      
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }

    const user = await refreshToken.getUser();
    let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    await AccessToken.updateToken(user.id, newAccessToken);

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};