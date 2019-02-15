# Tcp-chat

## 介绍

使用 TCP 协议完成 node 服务器与 telnet 客户端通信的聊天程序

## 环境

node v8.11.1

## 运行

```javascript
node index.js
另开一个终端，输入 telnet 127.0.0.1 3000
这样就成功打开了一个telnet客户端，此时，它正在候命
此时再打开一个telnet客户端，输入用户名，即可发送信息，与另一个客户端进行通信
```

## 原理

```javascript
该 chat 程序通过 TCP 协议实现，使用了其 net.createServer 的回调函数中的实例对象 connection
通过 connection 实现了 net.stream 系列操作，完成了用户注册，数据收发，离开广播等系列功能
```
