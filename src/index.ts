import React, { useRef, useState, useEffect } from 'react';


const messagePending = [
    { key: 0, value: '正在连接中......' },
    { key: 1, value: '已经连接并且可以通讯' },
    { key: 2, value: '连接正在关闭' },
    { key: 3, value: '连接已关闭或者没有连接成功' },
]


const useWs = ({ url }) => {
    const ws = useRef<any>(null);
    const timer = useRef<any>(null);
    const count = useRef(0);
    const [wsData, setMessage] = useState('');
    const [readyState, setReadyState] = useState({ key: 0, value: '正在链接中...' })

    // 创建ws
    const createWebStocket = () => {
        try {
            ws.current = new WebSocket(url);
            ws.current.binaryType = 'arraybuffer';
            ws.current.onopen = () => setReadyState(messagePending[ws.current?.readyState ?? 0]);
            ws.current.close = () => setReadyState(messagePending[ws.current?.readyState ?? 0]);
            ws.current.error = () => setReadyState(messagePending[ws.current?.readyState ?? 0]);
            ws.current.onmessage = (e) => {
                // 处理返回的消息
                let Message = root.lookupType('websocket.WebSocketTransferMessage')
                let buffer = new Uint8Array(e.data)

                let errmsg = Message.verify(buffer)

                let message = Message.decode(buffer)
                setMessage(message)
            }
        } catch (error) {
            console.log(error);
        }
    }


    // 初始化ws
    const init = () => {
        if (!ws.current || ws.current?.readyState === 3) {
            createWebStocket();
        }
    }

    // 关闭ws
    const closeWebstocker = () => {
        ws.current?.close();
    }


    // 开始发送信息
    const sendMessage = (type = 1001, contentType) => {
        if (ws.current && ws.current?.readyState === 1) {
            // 获取服务端想要的信息
            // 可自行配置
            let params = {};
            // 请求时入参处理的数据
            let Message = root.lookupType('websocket.WebSocketTransferMessage')
            let buffer = Message.encode(Message.create(params)).finish()
            ws.current?.send(buffer)
        }
    }


    // 重连
    const reconnect = () => {
        try {
            count.current++;
            if (count.current < 60) {
                if (timer.current) return;
                timer.current = setInterval(() => {
                    console.log('进行重新连接reconnect');
                    closeWebstocker();
                    ws.current = null;
                    createWebStocket();
                    clearInterval(timer.current);
                    timer.current = null;
                }, 30000)
            } else {
                clearInterval(timer.current);
                timer.current = null;
                count.current = 0;
            }
        } catch (error) {
            console.log(error, 'reconnect');
        }
    }

    useEffect(() => {
        init()
        return () => {
            ws.current?.close()
            console.log('dom销毁，socket关闭]')
        }
    }, [ws])

    return {
        wsData,
        readyState,
        closeWebstocker,
        reconnect,
        sendMessage
    }

}





export default useWs;