// 导入
const Websocket = require('ws')

// 创建一个server，Websocket中有一个Server的属性,注意：是new了一个Websocket的Server，里面给一个端口
const server = new Websocket.Server({ port: 8000 })

// 监听
server.on('connection', handleConnection)

// 事件处理函数,里面带有wx的实例,也就是WebSocket的实例
function handleConnection(wx) {
  console.log('---server is connection---')

  // 监听关闭事件
  wx.on('close', handleClose)
  // 监听错误事件
  wx.on('error', handleError)
  // 监听来消息的时候
  wx.on('message', handleMessage)

  function handleClose() {
    // 这个在服务器打印的
    console.log('---server is closed---')

    // 发送一个消息，让客户端接收到已经关闭了
    /** 模式：MESSAGE，有可能不是MESSAGE模式，就比如心跳机制，有可能是HEART_BEAT模式，
     *  但在用户发送消息的时候，mode应该是MESSAGE
     *  就是有两种形式：一种是心跳机制，客户端向服务端发送消息，另一种是用户在客户端输入消息发送消息给客户端
     */
    this.send(JSON.stringify({
      mode: 'MESSAGE',
      msg: '---server is closed---'
    }))
  }

  function handleError(e) {
    console.log('---server is Error---', e)
  }

  /**
   * 接收一个data，客户端如何发送消息的呢，发送一个对象
   * {
   *      mode:'MESSAGE' or 'HEART_BEAT'
   *      msg:string
   * }
   */
  function handleMessage(data) {
    const { mode, msg } = JSON.parse(data)
    switch (mode) {
      case 'MESSAGE':
        // 根据需求处理
        console.log('---User message---')
        this.send(JSON.stringify(JSON.parse(data)))
        break;
      case 'HEART_BEAT':
        console.log('---HeartBeat message---')
        this.send(JSON.stringify(JSON.parse(data)))
        break;
      default:
        break;

    }
  }
}