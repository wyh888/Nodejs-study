function setup(format) { // setup 函数可以用不同的配置调用多次
  let regexp = /:(\w+)/g
  return function logger(req, res, next) { // connect 使用的真实 logger 组件
    let str = format.replace(regexp, function (match, property) { // 用正则表达式格式化请求的日志条目
      return req[property]
    })
    console.log(str) // 将日志条目输出到控制台
    next() // 将控制权交给下一个中间件组件
  }
}

module.exports = setup
