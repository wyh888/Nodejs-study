const qs = require('querystring')

exports.sendHtml = function(res, html) { // 发送 HTML 响应
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Content-Length', Buffer.byteLength(html))
  res.end(html)
}

exports.parseReceivedData = function(req, cb) { // 解析 HTTP POST 数据
  let body = ''
  req.setEncoding('utf8')
  req.on('data', function(chunk) {
    body += chunk
  })
  req.on('end', function() {
    let data = qs.parse(body)
    cb(data)
  })
}

exports.actionForm = function(id, path, label) { // 渲染表单
  let html = `<form method="POST" action="${path}">
    <input type="hidden" name="id" value="${id}" />
    <input type="submit" value="${label}" />
  </form>`

  return html
}

// 添加工作记录
exports.add = function (db, req, res) {
  exports.parseReceivedData(req, function (work) {
    db.query(
      "INSERT INTO work (hours, date, description) " +
      " VALUES (?, ?, ?)",
      [work.hours, work.date, work.description],
      function (err) {
        if (err) throw err
        exports.show(db, res)
      }
    )
  })
}

// 删除工作记录
exports.delete = function(db, req, res) {
  exports.parseReceivedData(req, function(work) {
    db.query(
      "DELETE FROM work WHERE id=?",
      [work.id],
      function(err) {
        if (err) throw err
        exports.show(db, res)
      }
    )
  })
}

// 更新工作记录
exports.archive = function(db, req, res) {
  exports.parseReceivedData(req, function(work) {
    db.query(
      "UPDATE work SET archived=1 WHERE id=?",
      [work.id],
      function(err) {
        if (err) throw err
        exports.show(db, res)
      }
    )
  })
}

// 获取工作记录
exports.show = function(db, res, showArchived) {
  let query = "SELECT * FROM work " +
    "WHERE archived=? " +
    "ORDER BY date DESC"
  
  let archiveValue = (showArchived) ? 1 : 0
  db.query(
    query,
    [archiveValue],
    function(err, rows) {
      if (err) throw err
      let html = (showArchived) ? '' : '<a href="/archived">Archived Work</a><br/>'
      html += exports.workHitlistHtml(rows)
      html += exports.workFormHtml()
      exports.sendHtml(res, html)
    }
  )
}

exports.showArchived = function(db, res) {
  exports.show(db, res, true) // 只显示归档的工作记录
}

// 渲染表格
exports.workHitlistHtml = function(rows) {
  let html = '<table>'
  for (let i in rows) {
    html += '<tr>'
    html += '<td>' + rows[i].date + '</td>'
    html += '<td>' + rows[i].hours + '</td>'
    html += '<td>' + rows[i].description + '</td>'
    if (!rows[i].archived) {
      html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>'
    }
    html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>'
    html += '</tr>'
  }
  html += '</table>'
  return html
}

// 渲染用来输入新工作记录的空白 HTML 表单
exports.workFormHtml = function() {
  let html = `<form action="/" method="POST">
    <p>Date (YYYY-MM-DD):<br/><input type="text" name="date"/></p>
    <p>Hours worked:<br/><input type="text" name="hours"/></p>
    <p>Description:<br/>
      <textarea name="description"></textarea>
    </p>
    <input type="submit" value="Add" />
  </form>`
  return html
}

// 渲染归档按钮表单
exports.workArchiveForm = function(id) {
  return exports.actionForm(id, '/archive', 'Archive')
}

// 渲染删除按钮表单
exports.workDeleteForm = function(id) {
  return exports.actionForm(id, '/delete', 'Delete')
}