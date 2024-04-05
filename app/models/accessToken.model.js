module.exports = (sequelize, Sequelize) => {
  const AccessToken = sequelize.define("accessToken", {
    token: {
      type: Sequelize.STRING,
    }
  });

  AccessToken.saveToken = async function (user, token) {
    await this.create({
      token: token,
      userId: user.id,
    });
  };

  AccessToken.updateToken = async function (userId, token) {
    await this.update({ token: token }, {
        where: {
          userId: userId
        }
      });
  };

  return AccessToken;
};
