const mongoose = require('mongoose')
const { encryptSync , decryptSync} = require('../core/util/util.js')


const schema = new mongoose.Schema({
  user_name: {
    required: [true, '用户名必填'],
    type: String,
    unique: true,
    index: true,
    validate: {
      validator (val) {
        return /^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,8}$/.test(val)
      },
      message: "用户名必须为 数字+字母 6-8位"
    },
    //唯一
  },
  pwd: {
    type: String,
    select: false,
    required: [true, '密码必填'],
    validate: {
      validator (val) {
        return val !== '密码格式不正确'
      },
      message: "密码必须为 数字+密码(大小写) 8-12位"
    },
    set (val) {
      let isValidate = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!.#*?&]{8,12}$/.test(decryptSync(val))
      if (isValidate) {
        return val
      }
      return '密码格式不正确'
    }
  },
  email: {
    type: String,
    required: [true, '邮箱必填'],
    unique: true,
    validate: {
      validator: function (val) {
        return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(val)
      },
      message: "请输入合法邮箱地址"
    },
  },
  avatar: {
    type: String, //URL,
    default: "http://127.0.0.1:3000/images/avatar.jpg"
  },
  nikname: {
    type: String,
    validate: {
      validator: function (val) {
        return /^[0-9a-zA-Z\u0391-\uFFE5]{1,30}$/.test(val)
      },
      message: "昵称可包含 数字/英文/汉字 1-8位"
    },
    default:`用户1`
  },
  signature: {
    type: String,
    default: "我是用户的个性签名"
  }
})

module.exports = mongoose.model('User', schema)