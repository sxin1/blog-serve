const path = require('path')
module.exports= {
  host: "127.0.0.1",
  root: process.cwd(),
  port: 3000,
  keyPath: path.join(process.cwd(),"/auth"),
  publicPath: path.join(process.cwd(),"/auth/public.cer"),
  privatePath: path.join(process.cwd(),"/auth/private.cer"),
  userPath: path.join(process.cwd(),"/user/user.json"),
  uploadPath: path.join(process.cwd(),"/uploads"),
  uploadURL: 'http://127.0.0.1:3000/',
  maxFileSize: 102400
}