const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Article = require('../models/Article.js')
const Column = require('../models/Column.js')
const Comment = require('../models/Comment.js')

const createError = require('http-errors')
const { encrypt, decrypt, pagination, encryptSync } = require('../core/util/util.js')
const POPULATE_MAP = require('../plugins/POPULATE_MAP.js')
const POP_POST_MAP = require('../plugins/POP_POST_MAP.js')
const POP_GET_MAP = require('../plugins/POP_GET_MAP.js')
const POP_PUT_MAP = require('../plugins/POP_PUT_MAP.js')
const RESOURCE_POST_MAP = require('../plugins/RESOURCE_POST_MAP')

const assert = require('http-assert')


// columns id 66bc05f97c864e7f4cb37e71
// users id 66baf4047c5c4027f32c1ebf
// articles id 66bc06b9cf4075e3149ffdc8
// comments id 66bc1441132c211b656ba2fe

//创建资源
router.post('/', async (req, res, next) => {
  try {
    let modelName = req.Model.modelName
    let body = req.body
    if(modelName in RESOURCE_POST_MAP){
      body = RESOURCE_POST_MAP[modelName]['body'](body,req._id)
    }

    const result = await req.Model.create(body)

    if (modelName in POP_POST_MAP) {
      let item = POP_POST_MAP[modelName]
      let {_refId,_model,queryAct,options} = item
      let _id = result._id
      let refId = result?.[_refId]
      assert(refId, 422, `${_refId} 必填`)
      await _model[queryAct](refId,options(_id))
    }
    res.send(200, {
      message: '创建成功',
      data: result
    })
  } catch (err) {
    next(err || createError(400, '添加失败'))
  }
})
//更新资源
// /api/rest/articles/83827123/query?..
router.put('/:id', async (req, res, next) => {
  let putData = req.body
  let modelName = req.Model.modelName
  let id = req.params.id //资源id
  let isPass = req.isPass //鉴权结果
  let userId = req._id //userID

  try {
    let { revisable, authField } = POP_PUT_MAP[modelName]
    let isValidate = (modelName in POP_PUT_MAP) && isPass
    assert(isValidate, 400, "无权修改")
    let data = await req.Model.findById(id)
    assert(data, 404, "资源不存在")
    assert.equal(userId, data?.[authField], 400, '无权修改')
    let updateData = Object.entries(putData).filter(([key, value]) => {
      return revisable.includes(key)
    })
    isValidate = updateData.length !== 0
    assert(isValidate, 400, '修改失败')
    updateData = Object.fromEntries(updateData)
    updateData['date'] = new Date().toISOString()
    await req.Model.findByIdAndUpdate(id, updateData)
    res.send(200, {
      message: '修改成功'
    })
  } catch (error) {
    next(error || createError(400, "错误"))
  }
})

// //删除资源
router.delete('/:id', async (req, res, next) => {
  await req.Model.findByIdAndDelete(req.params.id)
  res.send({
    errMsg: 'ok'
  })
})

// //查询资源列表                                                  
router.get('/', async (req, res, next) => {
  let modelName = req.Model.modelName
  // node端
  // let { options = {}, page = 1, size = 100, dis = 8, populate = {} } = req.body 
  // vue
  let { options = {}, page = 1, size = 100, dis = 8, populate = {} } = req.query
  let query = req.query.query || {}

  if(query['$or']) {
    query['$or'].map((item, idx)=>{
      for(key in item) {
        item[key]['$regex']= new RegExp(item[key]['$regex'],'i')
      }
      return item
    })
  }
  try {
    if (modelName in POPULATE_MAP) {
      populate = POPULATE_MAP[modelName]
    }
    let result = await pagination({
      model: req.Model, query, options, size, page, dis, populate
    })
    res.send(200, {
      message: '查询成功',
      data: result
    })
  } catch (error) {
    next(createError(422, '请求错误'))
  }

})

// //查询资源详情
router.get('/:id', async (req, res, next) => {
  let modelName = req.Model.modelName
  let _id = req.params.id
  try {
    let item = req.Model.findById(_id)
    if (modelName in POPULATE_MAP) {
      item.populate(POPULATE_MAP[modelName])
    }
    // 
    if (modelName in POP_GET_MAP) {
      let { queryAct, options } = POP_GET_MAP[modelName]
      await req.Model[queryAct](_id, options())
    }
    let result = await item.exec()
    res.send(200, {
      message: '查询成功',
      data: result
    })
  } catch (error) {
    console.log(error)
  }

})


module.exports = router


