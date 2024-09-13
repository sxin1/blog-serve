var express = require('express');
var router = express.Router();
const Article = require('../models/Article.js')
const { encrypt, decrypt, pagination, encryptSync } = require('../core/util/util.js')

/*
  文章搜索 search API

  title body

  http://127.0.0.1:3000/search?q=你好
*/

router.get('/', async function (req, res, next) {
  let { q = '' } = req.query
  let regExp = new RegExp(q, 'i')

  const { options = "title", page = 1, size = 100, query = {
    $or: [
      { title: { $regex: regExp } },
      { content: { $regex: regExp } },
    ]
  }, dis = 8 } = req.body
  try {
    let result = await pagination({
      model: Article,
      query,
      options,
      size,
      page,
      dis,
    })
    res.send(200, {
      message: '查询成功',
      data: result
    })
  } catch (error) {
    next(error || createError(422, '请求错误'))
  }


});

module.exports = router;
