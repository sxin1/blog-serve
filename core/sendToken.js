const { decrypt, encrypt, generateKeys } = require('../core/util/util')
const fs = require('fs').promises
const fsSync = require('fs')
const { userPath, publicPath, privatePath } = require('../config')
const { getPrivateKey, getPublicKey, getPublicKeySync } = require('../core/rsaControl')
const jwt = require('jsonwebtoken') //token生成包  JWT
const { expressjwt } = require('express-jwt') //token验证中间件 JWT
const createError = require('http-errors');

module.exports = {
  async sendToken(userInfo) {
    // let { user_name, _id } = result.data
    let { user_name, _id } = userInfo

    let privateKey = await getPrivateKey()
    let token = jwt.sign({ user_name, _id, exp: ~~((Date.now() / 1000) + 24 * 3600 * 3) }, privateKey, { algorithm: 'RS256' });
    return token

  }
}