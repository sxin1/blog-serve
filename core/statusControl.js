


const userTtC = {
  'USER_ADD': "4010",
  'USER_TRIM': '4012',
  'USER_FOND': "4013",
  'USER_NOF': "4014",
  'USER_DR': "4016",
  'USER_INN': '4020',
  'USER_LOGIN': "4021",
  'USER_ERR': "4022",
  'USER_FERR': "4099",
}
const userCtM = {
  '4010': '用户注册成功',
  '4012': '用户不存在',
  '4013': '用户查询成功',
  '4014': '用户名或密码不能为空',
  '4016': '用户已存在',
  '4020': '账号密码验证成功',
  '4021': '登录成功',
  '4022': '账号密码错误',
  '4099': '用户查询错误',
}


module.exports = {
  getUserStatusMsg (tag) {
    if (!tag) {
      return false
    }
    let statusCode = userTtC[tag]
    let errMsg = userCtM[statusCode]
    return {
      statusCode, errMsg, tag
    }
  }
}
/*
  statusCode  4001
  statusTag  'USER_INN'
  errMsg "用户注册成功"


*/