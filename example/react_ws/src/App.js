import React, { useEffect, useRef } from 'react';

import './App.css'
import Ws from './utils/classWs';

function App() {

  const wsRef = useRef(null);

  // const initWs = async () => {
  //   // 实例化一个WebSocket的对象,要用await，比如重连肯定是异步的，需要返回一个ws的对象
  //   // create的时候相当于new Ws
  //   wsRef.current = await Ws.create('ws://localhost:8000')
  // }

  function wsConnect() {
    /**
     * 重连时这里要重新将实例交给ws
     * 1.发布订阅监听
     * 2.直接传
     */
    wsRef.current = Ws.create('ws://localhost:8888', wsReConnect)
  }

  function wsReConnect() {
    // 如果wsRef不存在，我们就重新创建wsRef
    if (!wsRef.current) {
      return wsConnect()
    }

    if (wsRef.current && wsRef.current.reconnectingTimer) {
      clearTimeout(wsRef.current.reconnectingTimer)
      wsRef.current.reconnectingTimer = null;
      wsConnect()
    }
  }

  const handleSend = () => {
    // 用户信息,  HEART_BEAT封装在wsRef中
    wsRef.current.send(JSON.stringify({
      mode: 'MESSAGE',
      msg: 'Hello'
    }))
  }

  useEffect(() => {
    wsConnect()
  }, [])


  return (
    <div className="App">
      <button onClick={handleSend}>发送</button>
    </div>
  );
}

export default App;
