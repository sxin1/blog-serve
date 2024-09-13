const express = require('express');
const { getPublicKey } = require('../core/rsaControl')
const router = express.Router();
const Key = require('../models/Key')

router.get('/', async function (req, res, next) {
  let result = await Key.findOne()
  res.send(200, {
    message: '获取key成功',
    data: {
      pubKey: result.content
    }
  })
});

module.exports = router;
