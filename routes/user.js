const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Article = require('../models/Article.js')
const Column = require('../models/Column.js')
const Comment = require('../models/Comment.js')

const createError = require('http-errors')
const { encrypt, decrypt, pagination, encryptSync } = require('../core/util/util.js')
const POPULATE_MAP = require('../plugins/POPULATE_MAP.js')
const POP_POST_MAP = require('../plugins/POP_POST_MAP.js')
const POP_GET_MAP = require('../plugins/POP_GET_MAP.js')
const POP_PUT_MAP = require('../plugins/POP_PUT_MAP.js')
const RESOURCE_POST_MAP = require('../plugins/RESOURCE_POST_MAP')

const assert = require('http-assert')

//更新资源
router.put('/', async (req, res, next) => {
  let putData = req.body
  let id = req._id //资源id
  let isPass = req.isPass //鉴权结果
  try {
    assert(isPass, 400, '修改失败')
    let result = await User.findByIdAndUpdate(id, putData)
    res.send(200, {
      message: '修改成功'
    })
  } catch (error) {
    next(error || createError(400, "错误"))
  }
})



// //查询资源详情
router.get('/', async (req, res, next) => {
  let _id = req._id
  try {
    let userResult = await User.findById(_id)
    userResult = userResult.toJSON()
    let articleResult = await Article.find({author: _id}).count()
    let columnResult = await Column.find({uid: _id}).count()
    let result = Object.assign(userResult, {articleResult, columnResult})
    res.send(200, {
      message: '查询成功',
      data: result
    })
  } catch (error) {
    console.log(error)
  }
})


module.exports = router


