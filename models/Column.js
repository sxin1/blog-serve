const {formatDate} = require('../core/util/util')
const mongoose = require('mongoose')
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
    get(val) {
      val = val.toString()
      return formatDate(new Date(val), 'yyyy年MM月dd日 hh:mm:ss')
    }
  },
  //文章 ids
  aids: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Article"
  }],
  uid: {
    type: mongoose.SchemaTypes.ObjectId,
  }
})
schema.set('toJSON', {getters: true})

module.exports = mongoose.model('Column', schema)