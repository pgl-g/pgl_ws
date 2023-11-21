const WS_MODE = {
  MESSAGE: 'MESSAGE',
  HEART_BEAT: 'HEART_BEAT'
}

class Ws extends WebSocket {
  wsUrl: string; // 当进行重新连接的时候，需要重新指定url
  reconnectingTimer: NodeJS.Timeout | null; // 重连定时器
  heartBeatTimer: NodeJS.Timer | any; // 设置心跳时间
  wsReConnect: any;
  constructor(url: string, wsReConnect?: string | string[]) {
    super(url, wsReConnect);

    this.wsUrl = url;

    this.reconnectingTimer = null;

    this.heartBeatTimer = null;

    this.wsReConnect = wsReConnect;
  }

  // 初始化页面
  public init() {
    try {
      // this实例来进行监听
      this.addEventListener('open', this.handleOpen.bind(this), false);
      this.addEventListener('close', this.handleClose.bind(this), false);
      this.addEventListener('error', this.handleError.bind(this), false);
      this.addEventListener('message', this.handleMessage.bind(this), false);
    } catch (error) {
      console.log(error, '又是哪里出现问题了')
    }
  }

  public handleOpen() {
    console.log('--- Client is connected---')
    // 连接时，开启心跳机制,检查是否断开，断开需要重连
    // 在startHeartBeat肯定要做间隙interval，则在reconnect中需要做延时进行重连，则需要两个计时器
    this.startHeartBeat()
  }

  public handleClose() {
    console.log('--- Client is closed---')
    // 关闭时，如果客户端还在，需要重连，页面关闭就彻底关闭。
    if (this.heartBeatTimer) {
      // 关闭时，清除this.heartBeatTimer定时器
      clearInterval(this.heartBeatTimer)
      this.heartBeatTimer = null
    }

    if (this.reconnectingTimer) {
      clearTimeout(this.reconnectingTimer)
      this.reconnectingTimer = null
    }
    this.reconnect()
  }

  public handleError(e) {
    console.log('--- Client is error---', e)
    this.reconnect()

  }

  public handleMessage(data) {
    // console.log('--- Client is msg---')
    const { mode, msg } = this.receiveMsg(data)

    switch (mode) {

      case WS_MODE.MESSAGE:
        console.log('--- MESSAGE ---', msg)
        break;
      // 此时接收到消息了，客户端和服务端肯定是连接状态，
      case WS_MODE.HEART_BEAT:
        console.log('--- HEART_BEAT ---', msg)
        break;
      default:
        break;
    }

  }

  // 将data换成js对象
  receiveMsg({ data }) {
    return JSON.parse(data)
  }

  // 延迟重连
  reconnect() {
    this.reconnectingTimer = setTimeout(() => {
      this.wsReConnect()
    }, 3000)
  }

  // 心跳
  startHeartBeat() {
    this.heartBeatTimer = setInterval(() => {
      // 告诉服务端，来了一个HEART_BEAT的消息,this.connentStatue为真时，才发送消息，
      // 如果关闭时也发送会报错

      if (this.readyState === 1) {
        this.sendMsg({
          mode: WS_MODE.HEART_BEAT,
          msg: 'HEART_BEAT'
        })
      } else {
        clearInterval(this.heartBeatTimer)
        this.heartBeatTimer = null
      }
      // 模拟关闭,导致重连reconnect
      this.waitForResponse()

    }, 4000)
  }

  waitForResponse() {
    setTimeout(() => {
      this.close()
    }, 2000)
  }


  // 发送信息，用字符串
  sendMsg(data) {
    this.readyState === 1 && this.send(JSON.stringify(data))
  }

  static create(url, wsReConnect) {
    return new Ws(url, wsReConnect)
  }

}



export default Ws;