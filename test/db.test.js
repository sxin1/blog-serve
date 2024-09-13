const mongoose = require('mongoose')
const { encrypt } = require('../util/util')
mongoose.connect("mongodb://127.0.0.1:27017/blog")
let db = mongoose.connection

db.on('error', console.error.bind(console, 'connect error:'))
db.once('open', ()=> {
  console.log('connected!!!!!!!!!!!')
})

const schema = new mongoose.Schema({
  username: {
    required: [true, '用户名必填'],
    type: String,
    validate: {
      validator (val) {
        return /^(?!\d+$)(?![a-zA-Z]+$)[a-zA-Z0-9]{6,8}$/.test(val)
      },
      message: "用户名必须为 数字+字母 6-8位"
    },
    //唯一
    unique: true
  },
  passowrd: {
    type: String,
    select: false,
    required: true,
    // async set (val) {
    //   let result
    //   return await encrypt(val)
    // }
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function (val) {
        return /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test(val)
      },
      message: "请输入合法邮箱地址"
    },
    unique: true
  },
  avatar: {
    type: String, //URL,
    default: "http://127.0.0.1:3000/assets/images/avatar.jpg"
  },

  nikname: {
    type: String,
    validate: {
      validator: function (val) {
        return /^[0-9a-zA-Z\u0391-\uFFE5]{1,8}$/.test(val)
      },
      message: "昵称可包含 数字/英文/汉字 1-8位"
    }
  }
})

let User = mongoose.model('User', schema)

User.create({
  username: 'asd1234',
  passowrd: "ASD123asd",
  nikname: 'zhang',
  email: '999@163.com'
}).then( doc => {
  console.log(doc)
}).catch(err => {
  console.log(err.errors)
}) 


