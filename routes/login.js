var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')
const { addUser, getUserInfo, verifyToken, verifyUser } = require('../core/userControl')
const { getUserStatusMsg } = require('../core/statusControl')
const { getPrivateKey } = require('../core/rsaControl')
const { sendToken } = require('../core/sendToken')
const assert = require('http-assert')
const { encrypt, decrypt } = require('../core/util/util.js')

const User = require('../models/User')

router.post('/', async function (req, res, next) {
  let { user_name, pwd } = req.body
  try {
    if (!user_name || user_name?.trim()?.length === 0 || !pwd || pwd?.trim()?.length === 0) {
      assert(false, 422, "账号密码必填")
    }
    const user = await User.findOne({ user_name }).select('+pwd')
    assert(user, 422, "用户不存在")
    let pwdDecrypt = await decrypt(user.pwd)
    assert.equal(pwd, pwdDecrypt,422, "账号密码错误")
    // token
    let token = await sendToken(user)
    res.send(200, {
      data: {
        message: '登陆成功',
        data:{
          userId: user._id,
          token
        }
      }
    })
  } catch (error) {
    console.log(error)
  }

});

module.exports = router;
