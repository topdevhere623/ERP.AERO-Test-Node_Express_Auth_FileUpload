const { authJwt, upload } = require("../middleware");
const controller = require("../controllers/file.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post('/api/file/upload', [
    authJwt.verifyToken,
    upload.array('files')
  ], controller.uploadFile);

  app.get('/api/file/list', [
    authJwt.verifyToken
  ], controller.listFiles);

  app.get('/api/file/:id', [
    authJwt.verifyToken
  ], controller.getFileById);

  app.get('/api/file/download/:id', [
    authJwt.verifyToken
  ], controller.downloadFileById);

  app.delete('/api/file/delete/:id', [
    authJwt.verifyToken
  ], controller.deleteFileById);

  app.put('/api/file/update/:id', [
    authJwt.verifyToken,
    upload.single('file')
  ], controller.updateFileById);

};
