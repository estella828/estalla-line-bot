const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// 啟用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json());

// LINE Messaging API 設定
const LINE_CHANNEL_ID = '2007249201';
const LINE_CHANNEL_SECRET = '446c855b1222d30bde21ee5e456112c8';
// 我們需要先取得 Channel Access Token
const LINE_CHANNEL_ACCESS_TOKEN = ''; // 這裡需要填入 Channel Access Token
const LINE_USER_ID = ''; // 這裡需要填入你的 LINE User ID

// 處理訂單通知
app.post('/send-notification', async (req, res) => {
    try {
        const { orderDetails, totalAmount } = req.body;
        
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
                            size: 'xl'
                        }
                    ]
                },
                body: {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                        {
                            type: 'text',
                            text: `⏰ ${new Date().toLocaleString('zh-TW')}`,
                            size: 'sm',
                            color: '#999999'
                        },
                        {
                            type: 'text',
                            text: '訂單明細',
                            weight: 'bold',
                            margin: 'lg'
                        },
                        {
                            type: 'text',
                            text: orderDetails,
                            wrap: true,
                            margin: 'sm'
                        },
                        {
                            type: 'text',
                            text: `總金額：${totalAmount}`,
                            weight: 'bold',
                            margin: 'lg'
                        }
                    ]
                }
            }
        };

        // 發送到 LINE Messaging API
        const response = await axios.post('https://api.line.me/v2/bot/message/push', 
            {
                to: LINE_USER_ID,
                messages: [message]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
                }
            }
        );

        res.json({ success: true, message: '通知已發送' });
    } catch (error) {
        console.error('發送通知時發生錯誤:', error);
        res.status(500).json({ success: false, message: '發送通知失敗' });
    }
});

// LINE Webhook 路由
app.post('/webhook', (req, res) => {
    console.log('收到 webhook 請求:', req.body);
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
