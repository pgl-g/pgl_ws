import React, { useRef, useEffect, useState } from 'react';




const stateMsg = [
  {
    key: 0,
    value: '正在连接...'
  },
  {
    key: 1,
    value: '连接成功，可以通信了'
  },
  {
    key: 2,
    value: '连接正在关闭'
  },
  {
    key: 3,
    value: '连接已经关闭，开启连接失败'
  }
]

const useWebSocket = ({ url }) => {
  const ws = useRef(null);

  const heartBeatTimer = useRef(null);

  const count = useRef(0);

  // 检测是否连接
  const [connect, isConnect] = useState(true);


  // 处理返回的状态
  const [readyState, setReadyState] = useState({ key: 0, value: '正在连接...' })

  const [wsData, setWsData] = useState()

  // 新建连接
  const createWebSocket = () => {
    ws.current = new WebSocket(url);

    init();
  }

  // 初始化状态
  const init = () => {
    ws.current.onopen = () => {
      // 心跳检测
      isConnect(true);
      reconnect();
      setReadyState(stateMsg[ws.current.readyState]);
    }
    ws.current.onmessage = ({ data }) => {
      const res = JSON.parse(data);
      // TODO: 接收到的数据进行一系列的处理
      setWsData(res);
    }
    ws.current.onclose = () => {
      isConnect(false);
      setReadyState(stateMsg[ws.current.readyState]);
    }
    ws.current.onerror = () => {
      isConnect(false);
      setReadyState(stateMsg[ws.current.readyState]);
    }
  }


  const closeWebSocket = () => {
    ws.current && ws.current.close();
  }

  const reconnect = () => {
    try {
      count.current++
      if (count.current < 60) {
        if (!heartBeatTimer.current) {
          heartBeatTimer.current = setInterval(() => {
            console.log('reconnect socket')
            closeWebSocket()
            ws.current = null
            createWebSocket()
            clearInterval(heartBeatTimer.current)
            heartBeatTimer.current = null
          }, 30000)
        }
      } else {
        clearInterval(heartBeatTimer.current)
        heartBeatTimer.current = null
        count.current = 0
      }
    } catch (e) {
      console.log(e)
    }
  }


  // 这里处理发送给后端所需要入参
  const sendMessage = (str) => {
    if (ws.current && ws.current.readyState === 1) {
      // .....
      ws.current.send(str);
    }
  }





  useEffect(() => {
    createWebSocket();

    return () => {
      ws.current.close();
    }
  }, [ws.current])


  return {
    readyState,
    wsData,
    sendMessage,
    closeWebSocket,
    reconnect
  }
}

export default useWebSocket;
