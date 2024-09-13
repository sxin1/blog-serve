var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const {maxFileSize} = require('./config.js')
const mongoose = require('./plugins/db.js')
const resourceMiddleware = require('./middleware/resource.js')
const {expressjwt} = require('express-jwt') 
const { getPublicKeySync } = require('./core/rsaControl')
const User = require('./models/User.js')
const createError = require('http-errors');
require('./socket')

var app = express();
app.use(cors({
  "origin": true, //true 设置为 req.origin.url
  "methods": "GET,HEAD,PUT,PATCH,POST,DELETE", //容许跨域的请求方式
  "allowedHeaders": "x-requested-with,Authorization,token, content-type", //跨域请求头
  "preflightContinue": false, // 是否通过next() 传递options请求 给后续中间件 
  "maxAge": 1728000, //options预验结果缓存时间 20天
  "credentials": true, //携带cookie跨域
  "optionsSuccessStatus": 200 //options 请求返回状态码
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use(expressjwt({
  secret: getPublicKeySync(), //解密秘钥 
  algorithms: ["RS256"], //6.0.0以上版本必须设置解密算法 
  isRevoked: async (req, payload, next) => {
    let { _id } = payload.payload
    req._id = _id
    req.isPass = true
    try {
      let result = await User.findById(_id)
      if (!result) {
        req.isPass = false
      }
    } catch (err) {
      console.log(err)
    }
  }
}).unless({
  path: [
    { url: /\/api\/rest/, methods: ['GET'] },
    { url: '/api/rest/keys', methods: ['GET'] },
    { url: '/admin/login'},
    { url: '/admin/register'},
    { url: '/keys' },
    { url: '/search' },
    { url: /articles\/likes/ },
    // { url: /upload/ },
  ]
}))


const getPublicKeyRouter = require('./routes/getPublicKey');
app.use('/keys', getPublicKeyRouter);
const  busRoute  = require('./routes/bus.js')
app.use('/api/rest/:resource', resourceMiddleware(), busRoute)
const adminRouter = require('./routes/admin.js');
app.use('/admin',  adminRouter)
const uploadRouter = require('./routes/upload.js');
app.use('/upload',  uploadRouter)
const artLikeRouter = require('./routes/artLikes.js');
app.use('/articles/likes',  artLikeRouter)
const searchRouter = require('./routes/search.js');
app.use('/search',  searchRouter)
const userRouter = require('./routes/user.js');
app.use('/user',  userRouter) 


app.use('/index', (req,res,next)=> {
  if(req.isPass) {
    res.send(200, {
      message: "登陆成功"
    })
  } else {
    res.send(401, {
      message: "请先登录"
    })
  }
  
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

const ERROR_CODE_MAP = {
  'LIMIT_FILE_SIZE': `文件大小不得超过 ${maxFileSize} bytes`,
}
const ERROR_STATUS_MAP = {
  '401': "无权限操作,请先登录"
}

const QUE_MAP = {
  "user_name": "用户名",
  "pwd": "密码",
  "email": "邮箱",
  "nikname": "昵称",
  "avatar": "头像"
}

// error handler
app.use(function (err, req, res, next) {
  console.log(err)
  if (err.message.indexOf('duplicate key error') !== -1) {
    let repeatKey = Object.entries(err.keyPattern)?.map(([key, value]) => {
      return `${QUE_MAP?.[key]}不能重复`
    })[0]
    err.status = 422
    err.message = repeatKey
  }
  if (err.errors) {
    let paramErrors = Object.entries(err.errors).map(([key, val]) => {
      return `${val.message}`
    }).join(',')
    err.status = 422
    err.message = paramErrors
  }
  if (err.code in ERROR_CODE_MAP) {
    err.status = 422
    err.message = ERROR_CODE_MAP[err.code]
  }

  if (err.status in ERROR_STATUS_MAP) {
    err.message = ERROR_STATUS_MAP[err.status]
  }

  res.status(err.status || 500).send({
    code: err.status,
    message: err.message
  });
});



module.exports = app;
