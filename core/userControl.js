const { decrypt, encrypt, generateKeys } = require('../core/util/util')
const fs = require('fs').promises
const { userPath } = require('../config')
const { getUserStatusMsg } = require('./statusControl')


module.exports = {
  async addUser(user_name, pwd) {
    let user = await getUserArr()
    let userInfo = user.find(item => item['user_name']=== user_name)
    if (userInfo) {
      return {
        // "当前用户已存在"
        ...getUserStatusMsg('USER_DR')
      }
    }
    let u_id = ('000000' + await userDataLength()).slice(-6)
    let userData = await getUserArr()
    let password = await encrypt(pwd)
    userData.push({ u_id, user_name, password })
    await setUserArr(userData)
    let res = getUserStatusMsg('USER_ADD')
    res.statusCode = 200
    return {
      // 已成功添加用户"
      ...getUserStatusMsg('USER_ADD'),
      data: {
        user_name,
        u_id
      }
    }

  },
  async getUserInfo(user_name) {
    let userData = await getUserArr()
    let userInfo = userData.find(item => item['user_name'].trim() === user_name.trim())
    if (!userInfo) {
      return {
        // "用户不存在"
        ...getUserStatusMsg('USER_NOF')
      }
    }
    let res = getUserStatusMsg('USER_FOND')
    res.statusCode = 200
    return {
      // "读取用户成功",
      ...res,
      userInfo
    }
  },
  async verifyUser(user_name, pwd ) {
    let userData = await getUserArr()
    let userInfo = userData.find(item => item['user_name'] === user_name)
    if (!userInfo) {
      return {
        // "当前用户不存在"
        ...getUserStatusMsg('USER_TRIM')
      }
    }
    if ((await decrypt(await decrypt(userInfo['password']))) !== (await decrypt(pwd))) {
      return {
        // '账号密码错误'
        ...getUserStatusMsg('USER_ERR')
      }
    }
    let resul = getUserStatusMsg('USER_LOGIN')
    resul.statusCode = 200

    return {
      // '验证成功'
      ...getUserStatusMsg('USER_LOGIN'),
      data: {
        user_name,
        'u_id': userInfo['u_id']
      }
    }
  },
  async verifyToken(user_name, u_id) {
    let userData = await getUserArr()
    let userInfo = userData.find(item => item['u_id'].trim() === u_id.trim())
    if (!userInfo) {
      return {
        // "当前用户不存在"
        ...getUserStatusMsg('USER_NOF')
      }
    }
    if (userInfo['user_name'] !== user_name) {
      return {
        // '用户验证失败'
        ...getUserStatusMsg('USER_FERR')
      }
    }
    let res = getUserStatusMsg('USER_ERR')
    res.statusCode = 200
    return {
      // '验证成功'
      ...res
    }
  }
}


async function getUserArr() {
  let userData = await fs.readFile(userPath)
  return JSON.parse(userData)
}
async function setUserArr(userData) {
  await fs.writeFile(userPath, JSON.stringify(userData))
  return false
}

async function userDataLength() {
  let len = JSON.parse(await fs.readFile(userPath)).length
  return len
}