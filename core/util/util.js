const NodeRSA = require('node-rsa');
const path = require('path')
const fs = require('fs').promises
const fsSync = require('fs')

const { publicPath, privatePath } = require('../../config')
const cerPath = path.join(process.cwd(), './auth')
const mongoPagination = require('mongoose-sex-page')
const mongoose = require('mongoose')
//创建秘钥
async function generateKey() {
  const newkey = new NodeRSA({ b: 2048 });
  // newkey.setOptions({ encryptionScheme: 'pkcs1' })
  let public_key = newkey.exportKey('pkcs1-public')//公钥,
  let private_key = newkey.exportKey('pkcs1-private') //私钥

  await fs.writeFile(privatePath, private_key);
  await fs.writeFile(publicPath, public_key);
}

//加密
async function encrypt(plain) {
  let public_key = await fs.readFile(publicPath, 'utf8');
  const nodersa = new NodeRSA(public_key);
  // nodersa.setOptions({ encryptionScheme: 'pkcs1' });
  const encrypted = nodersa.encrypt(plain, 'base64');
  return encrypted;
}

function encryptSync(plain) {
  let public_key = fsSync.readFileSync(publicPath, 'utf8');
  const nodersa = new NodeRSA(public_key);
  // nodersa.setOptions({ encryptionScheme: 'pkcs1' });
  const encrypted = nodersa.encrypt(plain, 'base64');
  return encrypted;
}




async function decrypt(cipher) {
  let private_key = await fs.readFile(privatePath, 'utf8'); //私钥
  let prikey = new NodeRSA(private_key);
  // prikey.setOptions({ encryptionScheme: 'pkcs1' });
  return prikey.decrypt(cipher, 'utf8')
}

function decryptSync(cipher) {
  let private_key = fsSync.readFileSync(privatePath, 'utf8'); //私钥
  let prikey = new NodeRSA(private_key);
  // prikey.setOptions({ encryptionScheme: 'pkcs1' });
  return prikey.decrypt(cipher, 'utf8')
}

async function pagination({ model, query, options, size, page, dis, populate={} }) {
  let result = await mongoPagination(model).find(query).populate(populate).select(options).size(size).page(page).display(dis).exec()
  let { total, records: list, pages, display } = result
  let count = list.length
  return { count, page, size, total, list, pages, display }
}

function toDouble(num) {
  return String(num)[1] && String(num) || '0' + num;
}

function formatDate(date = new Date(), format = "yyyy-MM-dd hh:mm:ss") {
  let regMap = {
    'y': date.getFullYear(),
    'M': toDouble(date.getMonth() + 1),
    'd': toDouble(date.getDate()),
    'h': toDouble(date.getHours()),
    'm': toDouble(date.getMinutes()),
    's': toDouble(date.getSeconds()),
  }
  //逻辑(正则替换 对应位置替换对应值) 数据(日期验证字符 对应值) 分离
  return Object.entries(regMap).reduce((acc, [reg, value]) => {
    return acc.replace(new RegExp(`${reg}+`, 'g'), value);
  }, format);
}


module.exports = {
  encrypt, decrypt, generateKey, pagination, encryptSync, decryptSync, formatDate
}