const db = require("../models");
const fs = require('fs');
const path = require('path');

const { file: UploadModel } = db;

exports.uploadFile = async (req, res) => {
  Promise.all(
    req.files.map(async (file) => {
      const fileData = {
        name: file.originalname,
        extension: file.originalname.split('.').pop(),
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        userId: req.userId
      };
    
      await UploadModel.create(fileData);
    })
  )

  res.json({ message: 'File uploaded successfully!' });
};

exports.listFiles = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.list_size) || 10;

  const offset = (page - 1) * pageSize;

  const files = await UploadModel.findAndCountAll({
    limit: pageSize,
    offset: offset
  });

  const totalPages = Math.ceil(files.count / pageSize);

  const response = {
    totalFiles: files.count,
    totalPages: totalPages,
    currentPage: page,
    files: files.rows
  };

  res.status(200).json(response);
};

exports.getFileById = async (req, res) => {
  const fileData = await UploadModel.findOne({
    where: {
      id: req.params.id
    }
  })

  if(fileData) {
    return res.status(200).send({ data: fileData.dataValues})
  } else {
    return res.status(404).send({ message: "User Not found." });
  } 
};

exports.downloadFileById = async (req, res) => {
  const file = await UploadModel.findOne({
    where: {
      id: req.params.id
    }
  })
  const filePath = path.join(__dirname, '../../', file.path);

  if (fs.existsSync(filePath)) {
    res.download(filePath)
  } else {
    res.status(404).send('File not found');
  }
};

exports.deleteFileById = async (req, res) => {
  const file = await UploadModel.findOne({
    where: {
      id: req.params.id
    }
  })

  if(file) {
    fs.unlinkSync(path.join(__dirname, '../../', file.path))
  
    await file.destroy()
  
    return res.status(200).send({ message: "File was deleted!" })
  } else {
    return res.status(404).send({ message: "File was not found!" })
  }
};

exports.updateFileById = async (req, res) => {
  const oldFile = await UploadModel.findOne({
    where: {
      id: req.params.id
    }
  })

  if(oldFile) {
    fs.unlinkSync(path.join(__dirname, '../../', oldFile.path))
    
    const fileData = {
      name: req.file.originalname,
      extension: req.file.originalname.split('.').pop(),
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      userId: req.userId
    };
  
    await oldFile.update(fileData);
  
    res.json({ message: 'File updated successfully!' });
  } else {
    return res.status(404).send({ message: "File was not found!" })
  }
};