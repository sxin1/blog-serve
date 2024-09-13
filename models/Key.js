const {formatDate} = require('../core/util/util')
const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
    get(val) {
      val = val.toString()
      return formatDate(new Date(val), 'yyyy年MM月dd日 hh:mm:ss')
    }
  }
})
schema.set('toJSON', {getters: true})

module.exports = mongoose.model('Key', schema)