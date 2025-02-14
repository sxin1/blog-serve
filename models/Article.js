const mongoose = require('mongoose')
const {formatDate} = require('../core/util/util')
const { uploadURL } = require('../config')
const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  //封面图
  cover: {
    type: String, //URL
    default: `${uploadURL}article/1.jpg`
  },
  //文章内容
  content: {
    type: String, // URIencode(HTMLCode)
    set(val) {
      try {
        val = decodeURIComponent(val).replace(/\"/g, "\'")
        return val
      } catch (error) {
        return val
      }
    },
    required: true,
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now,
    get(val) {
      return formatDate(new Date(val), 'yyyy年MM月dd日 hh:mm:ss')
    }
  },
  //点击量
  hit_num: {
    type: Number,
    default: 0
  },
  //评论数量
  comment_num: {
    type: Number,
    default: 0
  },
  //喜欢 点赞
  like_num: {
    type: Number,
    default: 0
  },
  //作者
  author: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "User"
  },
  //评论集合
  comments: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Comment"
    }
  ],
  //分类
  column: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Column',
    required:true
  },
  like_users: [{
    type: mongoose.SchemaTypes.ObjectId
  }]
})
schema.set('toJSON', {getters: true})

module.exports = mongoose.model('Article', schema)