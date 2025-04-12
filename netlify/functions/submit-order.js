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
            
            const token = process.env.LINE_NOTIFY_TOKEN;
            console.log('LINE_NOTIFY_TOKEN is set:', !!token);
            
            if (!token) {
                console.log('LINE_NOTIFY_TOKEN not found in environment variables');
                return {
                    statusCode: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                    body: JSON.stringify({ 
                        message: 'LINE Notify token not configured',
                        error: 'Please set LINE_NOTIFY_TOKEN in Netlify environment variables'
                    })
                };
            }

            console.log('Sending notification to LINE Notify...');
            console.log('Using LINE Notify token:', token.substring(0, 5) + '...'); // 只顯示前5個字符
            
            // 發送通知到 LINE
            try {
                const response = await got.post('https://api.line.me/v2/bot/message/push', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    json: {
                        to: 'U0000000000000000000000000000000', // 替換為您的 Line ID
                        messages: [
                            {
                                type: 'text',
                                text: message
                            }
                        ]
                    }
                });

                console.log('LINE Notify API response:', response.body);
                const data = await response.json();
                console.log('LINE Notify API response data:', data);

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
                    console.error('LINE Notify returned non-200 status:', data);
                    return {
                        statusCode: 500,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                        },
                        body: JSON.stringify({ 
                            message: 'Failed to send notification',
                            error: data.message || 'LINE Notify returned non-200 status'
                        })
                    };
                }
            } catch (error) {
                console.error('Error sending LINE Notify:', error);
                console.error('Error response:', error.response?.body);
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
