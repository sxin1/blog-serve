let mongoose = require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/blog")
let db = mongoose.connection

db.on('error', console.error.bind(console, 'connect error:'))
db.once('open', () => {
  console.log('connected!!!')
})

let articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "默认标题" + Date.now
  },
  //封面图
  cover: {
    type: String, //URL
  },
  //文章内容
  body: {
    type: String, // URIencode(HTMLCode)
    required: true,
  },
  //更新日期
  date: {
    type: mongoose.SchemaTypes.Date,
    default: Date.now
  },
  //点击量
  hits: {
    type: Number,
    default: 0
  },
  //评论数量
  comment: {
    type: Number,
    default: 0
  },
  //喜欢 点赞
  likes: {
    type: Number,
    default: 0
  },
  //作者
  author: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User"
  },
  //评论集合
  comment_ids: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Comment"
    }
  ],
  //分类
  columns: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Column'
    }
  ],
  column: {
    type: String,
    default: "技术文章"
  }

})

let Article = mongoose.model('Article', articleSchema)


Article.create({
  title: "测试文章1",
  body: "sdaasd asasdsadas as das d asd fe",
  author: new mongoose.Types.ObjectId('5fd76f7515c5203c44a8add9'),
}).then(doc => {
  console.log(doc)
}).catch(err => {
  console.log('错误 ---------------------')
  //unique 唯一项目出错判断
  if (err.message.indexOf('duplicate key error') !== -1) {
    console.log('唯一项重复', err.keyPattern)
    return
  }
  //required validate err.errors
  Object.entries(err.errors).map(([key, val]) => {
    console.log(`error: ${key}, ${val.message} `)
  })
  // console.log(err.errors)
})