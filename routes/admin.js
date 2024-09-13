var express = require('express');
var router = express.Router();
const { sendToken } = require('../core/sendToken')
const User = require('../models/User')
const assert = require('http-assert')
const { encrypt, decrypt } = require('../core/util/util.js')
const createError = require('http-errors')
const QUE_MAP = require('../plugins/QUE_MAP.js')

const CLASSIFY = {
  'login': "login",
  'register': "register"
}

router.post('/:classify', async function (req, res, next) {
  let { user_name, pwd } = req.body
  let { classify } = req.params
  let isClassPass = classify in CLASSIFY
  assert(isClassPass, 400, '无效的请求')
  let user
  try {
    if (!user_name || user_name?.trim()?.length === 0 || !pwd || pwd?.trim()?.length === 0) {
      assert(false, 422, "账号密码必填")
    }
    if (classify === 'login') {
      user = await User.findOne({ user_name }).select('+pwd')
      assert(user, 422, "用户不存在")
      let pwdDecrypt = await decrypt(user.pwd)
      pwd = await decrypt(pwd)
      assert.equal(pwd, pwdDecrypt, 422, "账号密码错误")
    }
    if (classify === 'register') {

      user = await User.create(req.body)
    }
    // token
    let token = await sendToken(user)
    res.send(200, {
      message: '登陆成功',
      data: {
        userId: user._id,
        token
      }
    })
  } catch (error) {
    next(error)
  }
});

module.exports = router;
