var express = require('express');
var router = express.Router();
const assert = require('http-assert')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { uploadPath, uploadURL, maxFileSize } = require('../config')


const FILE_TYPE = {
  'user': 'user',
  'article': 'article'
}

const storage = multer.diskStorage({
  //存储位置
  destination(req, res, cb) {
    let fileType = FILE_TYPE[req.params['classify'].trim()] ?? "other";
    const filePath = path.join(uploadPath, fileType)
    fs.existsSync(filePath) || fs.mkdirSync(filePath);
    cb(null, filePath);
  },
  filename(req, file, cb) {
    const { ext, base, name } = path.parse(file.originalname)
    cb(null, name + '_' + Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSize
  }
})


router.post('/:classify', upload.any(), async (req, res, next) => {
  try {
    let fileType = FILE_TYPE[req.params['classify']] ?? ''
    assert(fileType, 400, '文件上传分类不正确')
    let u_id = req._id
    if (fileType === 'users') {
      assert(u_id, 422, '用户头像必须指定UID')
      assert.equal(u_id, req._id, 422, '必须为用户本人')
    }

    let fileURLS = req.files.map(item => {
      let { destination, filename } = item
      return path.join(uploadURL, path.parse(destination).name, filename).replace(/\\/g, '/').replace('http:/', 'http://')
    })



    let resultData = {
      message: "上传成功",
      errno: 0,
      data: {
        fileURL: fileURLS[0]
      }
    }
    if (fileType === 'article') {
      let data = fileURLS
      resultData = {
        "errno": 0,
        data
      }
    }
    res.send(200, resultData)

  } catch (err) {
    next(err)
  }
})



module.exports = router;
