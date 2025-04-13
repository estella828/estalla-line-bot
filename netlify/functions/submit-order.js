const got = require('got');

exports.handler = async (event) => {
    try {
        console.log('Request received:', event);
        console.log('Request headers:', event.headers);
        console.log('Request body:', event.body);

        // 處理預飛行請求
        if (event.httpMethod === 'OPTIONS') {
            console.log('Handling OPTIONS request');
            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
                body: ''
            };
        }

        if (event.httpMethod !== 'POST') {
            console.log('Invalid HTTP method:', event.httpMethod);
            return {
                statusCode: 405,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
                body: JSON.stringify({ 
                    message: 'Method not allowed',
                    error: 'Only POST method is allowed'
                })
            };
        }

        try {
            const { message } = JSON.parse(event.body);
            console.log('Parsed message:', message);
            
            const userId = process.env.LINE_USER_ID;
            const token = process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN;
            
            if (!userId || !token) {
                console.log('Missing required environment variables');
                return {
                    statusCode: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                    body: JSON.stringify({ 
                        message: 'Configuration error',
                        error: 'Missing LINE Bot credentials in environment variables'
                    })
                };
            }

            console.log('Sending notification to Line Bot...');
            console.log('Using Line Bot token:', token.substring(0, 5) + '...');
            
            // 發送通知到 Line Bot
            try {
                const response = await got.post('https://api.line.me/v2/bot/message/push', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    json: {
                        to: userId,
                        messages: [
                            {
                                type: 'text',
                                text: message
                            }
                        ]
                    }
                });

                console.log('Line Bot API response:', response.body);
                const data = await response.json();
                console.log('Line Bot API response data:', data);

                if (data.status === 200) {
                    return {
                        statusCode: 200,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                        },
                        body: JSON.stringify({ 
                            message: 'Order submitted successfully',
                            data: data
                        })
                    };
                } else {
                    console.error('Line Bot returned non-200 status:', data);
                    return {
                        statusCode: 500,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                        },
                        body: JSON.stringify({ 
                            message: 'Failed to send notification',
                            error: data.message || 'Line Bot returned non-200 status'
                        })
                    };
                }
            } catch (error) {
                console.error('Error sending Line Bot:', error);
                console.error('Error response:', error.response?.body);
                
                // 如果發送失敗，返回錯誤信息
                return {
                    statusCode: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                    body: JSON.stringify({ 
                        message: 'Error sending notification',
                        error: error.message,
                        stack: error.stack,
                        response: error.response?.body
                    })
                };
            }
        } catch (error) {
            console.error('Error parsing request:', error);
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
                body: JSON.stringify({ 
                    message: 'Error processing request',
                    error: error.message,
                    stack: error.stack
                })
            };
        }
    } catch (error) {
        console.error('Error in submit-order function:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify({ 
                message: 'Error processing order',
                error: error.message,
                stack: error.stack
            })
        };
    }
};
