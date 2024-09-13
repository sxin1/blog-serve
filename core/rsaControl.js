const { decrypt, encrypt, generateKeys } = require('../core/util/util')
const fs = require('fs').promises
const fsSync = require('fs')

const { publicPath, privatePath } = require('../config')

module.exports = {
  getPublicKeySync() {
    return fsSync.readFileSync(publicPath, 'utf8')
  },
  async getPublicKey() {
    let key
    try {
      key = await fs.readFile(publicPath, 'utf8')
    } catch (error) {
      generateKeys()
      key = await fs.readFile(publicPath, 'utf8')
    }
    return key 
  },
  async getPrivateKey() {
    let key
    try {
      key = await fs.readFile(privatePath, 'utf8')
    } catch (error) {
      generateKeys()
      key = await fs.readFile(privatePath, 'utf8')
    }
    return key 
  },
}