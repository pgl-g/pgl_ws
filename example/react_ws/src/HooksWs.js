import React, { useEffect } from 'react';


import useWebSocket from './utils/hooksWs';



const HooksWs = () => {


  const [wsData, readyState, closeWebSocket, reconnect] = useWebSocket({ url: 'ws://ip:端口' })


  useEffect(() => {
    // 不在白名单人员之间不执行后续操作，不需要可以删除

    // 接受到socket数据， 进行业务逻辑处理
    if (Object.keys(wsData).length !== 0) {
      console.log(wsData)
    }

    // 如果是已关闭且是当前页面自动重连
    if (readyState.key === 3) {
      reconnect()
    }
    // 不是当前页面 清空 webSocket 此处为优化代码使用的，不需要可以直接删除。
    return () => {
      closeWebSocket()
    }
  }, [wsData, readyState])

  return (
    <div>
      xxx
    </div>
  )
}

export default HooksWs;