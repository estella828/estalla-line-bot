const got = require('got');
const crypto = require('crypto');

exports.handler = async (event) => {
    try {
        console.log('Webhook received:', event);
        console.log('Request headers:', event.headers);
        console.log('Request body:', event.body);

        // 驗證 Line 的簽名
        const signature = event.headers['x-line-signature'];
        const channelSecret = process.env.LINE_BOT_CHANNEL_SECRET;
        
        if (!signature || !channelSecret) {
            console.error('Missing signature or channel secret');
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'Missing signature or channel secret'
            };
        }

        // 驗證簽名
        const hash = crypto.createHmac('sha256', channelSecret);
        hash.update(event.body);
        const expectedSignature = hash.digest('base64');

        if (signature !== expectedSignature) {
            console.error('Invalid signature');
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: 'Invalid signature'
            };
        }

        // 解析事件
        const events = JSON.parse(event.body).events;
        console.log('Received events:', events);

        // 處理每個事件
        for (const event of events) {
            console.log('Processing event:', event);

            // 只處理文字訊息
            if (event.type === 'message' && event.message.type === 'text') {
                const userId = event.source.userId;
                const message = event.message.text;
                console.log('Received message from:', userId);
                console.log('Message content:', message);

                // 回覆訊息
                try {
                    const response = await got.post('https://api.line.me/v2/bot/message/reply', {
                        headers: {
                            'Authorization': `Bearer ${process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        json: {
                            replyToken: event.replyToken,
                            messages: [
                                {
                                    type: 'text',
                                    text: '收到您的訊息了！'
                                }
                            ]
                        }
                    });

                    console.log('Reply sent successfully');
                } catch (error) {
                    console.error('Error replying to message:', error);
                }
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: 'OK'
        };

    } catch (error) {
        console.error('Error in webhook:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'text/plain'
            },
            body: 'Internal server error'
        };
    }
};
