var express = require('express');
var router = express.Router();
const { verifyToken } = require('../core/userControl')
const { getUserStatusMsg } = require('../core/statusControl')
const { getPrivateKey, getPublicKey, getPublicKeySync } = require('../core/rsaControl')
const jwt = require('jsonwebtoken') //token生成包  JWT
const {expressjwt} = require('express-jwt') //token验证中间件 JWT
const createError = require('http-errors');


router.get('/', expressjwt({
  secret: getPublicKeySync(),
  algorithms: ['RS256'],
  isRevoked: async function (req, token,next) {
    let user_name = token.payload.user_name
    let u_id = token.payload.u_id
    await verifyToken(user_name,u_id).then(result => {
      if (result.statusCode !== getUserStatusMsg('USER_FOND')['statusCode']) {
        return createError(401)
      } 
    })
  }
}), function (req, res, next) {
  res.send(200, {
    ...getUserStatusMsg('USER_LOGIN'),
  })
});

module.exports = router;
