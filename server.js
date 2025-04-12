const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// 啟用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json());

// 設定靜態檔案服務
app.use(express.static('.'));

// LINE Messaging API 設定
const LINE_CHANNEL_ID = '2007249201';
const LINE_CHANNEL_SECRET = '446c855b1222d30bde21ee5e456112c8';
// 我們需要先取得 Channel Access Token
const LINE_CHANNEL_ACCESS_TOKEN = 'R/Xor2TVbRcUjh2boUOFwRtL5CAZ5Q8epBoyEmNjl3gLOcd7IrgUIaC6mOfNSA6M1G+uctCI6RS7bmaV2TG2At1c4B7K4lvcv72uAMxtsXiF+b7BdU2E+l1M8t7hVI9e4YuhamMh70HWsVYVeG7SIgdB04t89/1O/w1cDnyilFU=';
const LINE_USER_ID = 'U1edb70bcec18fde451c7a92830660997';

// 格式化金額
function formatAmount(amount) {
    return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0
    }).format(amount);
}

// 處理訂單通知
app.post('/send-notification', async (req, res) => {
    try {
        const { orderDetails, totalAmount, customerInfo } = req.body;
        
        // 生成訂單編號
        const orderId = `ORDER${Date.now()}`;

        // 組合訊息
        const message = {
            type: 'flex',
            altText: '新訂單通知',
            contents: {
                type: 'bubble',
                header: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: '🛒 新訂單通知',
                            weight: 'bold',
                            size: 'xl',
                            color: '#1DB446'
                        }
                    ],
                    backgroundColor: '#f7f7f7'
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    spacing: 'md',
                    contents: [
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '訂單編號',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 1
                                },
                                {
                                    type: 'text',
                                    text: orderId,
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 2
                                }
                            ]
                        },
                        {
                            type: 'box',
                            layout: 'horizontal',
                            contents: [
                                {
                                    type: 'text',
                                    text: '訂購時間',
                                    size: 'sm',
                                    color: '#555555',
                                    flex: 1
                                },
                                {
                                    type: 'text',
                                    text: new Date().toLocaleString('zh-TW'),
                                    size: 'sm',
                                    color: '#111111',
                                    align: 'end',
                                    flex: 2
                                }
                            ]
                        },
                        {
                            type: 'separator',
                            margin: 'lg'
                        },
                        {
                            type: 'box',
                            layout: 'vertical',
                            margin: 'lg',
                            spacing: 'sm',
                            contents: [
                                {
                                    type: 'text',
                                    text: '訂單明細',
                                    size: 'sm',
                                    color: '#555555',
                                    weight: 'bold'
                                },
                                ...orderDetails.map(item => ({
                                    type: 'box',
                                    layout: 'horizontal',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: item.name,
                                            size: 'sm',
                                            color: '#555555',
                                            flex: 2
                                        },
                                        {
                                            type: 'text',
                                            text: `x${item.quantity}`,
                                            size: 'sm',
                                            color: '#111111',
                                            align: 'end',
                                            flex: 1
                                        },
                                        {
                                            type: 'text',
                                            text: formatAmount(item.price * item.quantity),
                                            size: 'sm',
                                            color: '#111111',
                                            align: 'end',
                                            flex: 1
                                        }
                                    ]
                                })),
                                {
                                    type: 'separator',
                                    margin: 'lg'
                                },
                                {
                                    type: 'box',
                                    layout: 'horizontal',
                                    margin: 'lg',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: '總金額',
                                            size: 'sm',
                                            color: '#555555',
                                            weight: 'bold'
                                        },
                                        {
                                            type: 'text',
                                            text: formatAmount(Number(totalAmount)),
                                            size: 'sm',
                                            color: '#1DB446',
                                            align: 'end',
                                            weight: 'bold'
                                        }
                                    ]
                                },
                                {
                                    type: 'separator',
                                    margin: 'lg'
                                },
                                {
                                    type: 'box',
                                    layout: 'vertical',
                                    margin: 'lg',
                                    spacing: 'sm',
                                    contents: [
                                        {
                                            type: 'text',
                                            text: '購買者資訊',
                                            size: 'sm',
                                            color: '#555555',
                                            weight: 'bold'
                                        },
                                        {
                                            type: 'box',
                                            layout: 'horizontal',
                                            contents: [
                                                {
                                                    type: 'text',
                                                    text: '姓名',
                                                    size: 'sm',
                                                    color: '#555555',
                                                    flex: 1
                                                },
                                                {
                                                    type: 'text',
                                                    text: customerInfo.name,
                                                    size: 'sm',
                                                    color: '#111111',
                                                    align: 'end',
                                                    flex: 2
                                                }
                                            ]
                                        },
                                        {
                                            type: 'box',
                                            layout: 'horizontal',
                                            contents: [
                                                {
                                                    type: 'text',
                                                    text: '電話',
                                                    size: 'sm',
                                                    color: '#555555',
                                                    flex: 1
                                                },
                                                {
                                                    type: 'text',
                                                    text: customerInfo.phone,
                                                    size: 'sm',
                                                    color: '#111111',
                                                    align: 'end',
                                                    flex: 2
                                                }
                                            ]
                                        },
                                        {
                                            type: 'box',
                                            layout: 'horizontal',
                                            contents: [
                                                {
                                                    type: 'text',
                                                    text: '地址',
                                                    size: 'sm',
                                                    color: '#555555',
                                                    flex: 1
                                                },
                                                {
                                                    type: 'text',
                                                    text: customerInfo.address,
                                                    size: 'sm',
                                                    color: '#111111',
                                                    align: 'end',
                                                    flex: 2,
                                                    wrap: true
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                footer: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'button',
                            style: 'primary',
                            color: '#1DB446',
                            action: {
                                type: 'postback',
                                label: '確認訂單',
                                data: `action=confirm&orderId=${orderId}`,
                                displayText: `確認訂單 ${orderId}`
                            }
                        }
                    ]
                }
            }
        };

        // 發送 LINE 訊息
        const response = await axios.post('https://api.line.me/v2/bot/message/push', {
            to: LINE_USER_ID,
            messages: [message]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
            }
        });

        res.json({ success: true, message: '訂單通知已發送' });
    } catch (error) {
        console.error('發送通知時發生錯誤:', error);
        res.status(500).json({ success: false, message: '發送通知失敗' });
    }
});

// LINE Webhook 路由
app.post('/webhook', (req, res) => {
    console.log('收到 webhook 請求:', req.body);

    // 處理 postback 事件
    if (req.body.events && req.body.events[0].type === 'postback') {
        const event = req.body.events[0];
        const data = new URLSearchParams(event.postback.data);
        
        if (data.get('action') === 'confirm') {
            const orderId = data.get('orderId');
            // 送出訂單確認訊息
            const message = {
                type: 'text',
                text: `訂單 ${orderId} 已確認！我們會盡快處理您的訂單。`
            };

            // 發送確認訊息
            axios.post('https://api.line.me/v2/bot/message/reply', {
                replyToken: event.replyToken,
                messages: [message]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
                }
            }).catch(error => {
                console.error('發送確認訊息時發生錯誤:', error);
            });
        }
    }
    res.sendStatus(200);
});

// 檢查服務器狀態的路由
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: '服務器運行正常' });
});

// 啟動服務器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服務器運行在 http://localhost:${PORT}`);
});
