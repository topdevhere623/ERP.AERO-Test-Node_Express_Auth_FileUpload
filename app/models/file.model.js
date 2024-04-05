module.exports = (sequelize, Sequelize) => {
  const File = sequelize.define('files', {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    extension: {
      type: Sequelize.STRING,
      allowNull: false
    },
    mimeType: {
      type: Sequelize.STRING,
      allowNull: false
    },
    size: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    path: {
      type: Sequelize.STRING,
      allowNull: false
    },
    uploadDate: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  });

  return File;
}