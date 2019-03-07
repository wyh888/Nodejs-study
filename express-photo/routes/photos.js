const express = require('express')
const router = express.Router()
let photos = []

photos.push({
  name: 'beautiful girl1',
  path: 'https://tuimeizi.cn/pure?o=1&w=400&h=400&s=0'
})

photos.push({
  name: 'beautiful girl2',
  path: 'https://tuimeizi.cn/pure?o=2&w=400&h=400&s=0'
})

router.get('/', function(req, res, next) {
  res.render('photos/index', {
    title: 'Photos',
    photos: photos
  })
})

module.exports = router