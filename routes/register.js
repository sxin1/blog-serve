var express = require('express');
var router = express.Router();
const { addUser } = require('../core/userControl')
const { getUserStatusMsg } = require('../core/statusControl')
const { getPrivateKey } = require('../core/rsaControl')
const { sendToken } = require('../core/sendToken')
const User = require('../models/User')
const assert = require('http-assert')
const { encrypt, decrypt } = require('../core/util/util.js')
const createError = require('http-errors')
const QUE_MAP = require('../plugins/QUE_MAP.js')


router.post('/', async function (req, res, next) {
  let { user_name, pwd } = req.body
  try {
    if (!user_name || user_name?.trim()?.length === 0 || !pwd || pwd?.trim()?.length === 0) {
      assert(false, 422, "账号密码必填")
    }
    req.body.pwd = await encrypt(req.body.pwd)
    const user = await User.create(req.body)

    //生成token
    let token = await sendToken(user)
    res.send(200, {
      data: {
        message: '注册成功',
        data: {
          userId: user._id,
          token: token
        }
      }
    })
  } catch (err) {

    if (err.message.indexOf('duplicate key error') !== -1) {
      let repeatKey = Object.entries(err.keyPattern)?.map(([key, value]) => {
        return `${QUE_MAP?.[key]}不能重复`
      })[0]
      next(createError(422, repeatKey))
    }
    if(err.errors) {
      let paramErrors = Object.entries(err.errors).map(([key, val]) => {
        return `${val} `
      }).reduce((a, c) => {
        a += c
        return a
      }, "")
      next(createError(422, paramErrors))
    }
  }

});

module.exports = router;
