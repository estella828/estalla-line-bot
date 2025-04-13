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
                    'Access-Control-Allow-Origin': 'https://main--taiwanagla-2025.netlify.app',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: ''
            };
        }

        if (event.httpMethod !== 'POST') {
            console.log('Invalid HTTP method:', event.httpMethod);
            return {
                statusCode: 405,
                headers: {
                    'Access-Control-Allow-Origin': 'https://main--taiwanagla-2025.netlify.app',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ 
                    message: 'Method not allowed',
                    error: 'Only POST method is allowed'
                })
            };
        }

        try {
            const body = JSON.parse(event.body);
            console.log('Parsed request body:', body);
            
            const userId = process.env.LINE_USER_ID;
            const token = process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN;
            const secret = process.env.LINE_BOT_CHANNEL_SECRET;
            
            console.log('Environment variables:', {
                hasUserId: !!userId,
                hasToken: !!token,
                hasSecret: !!secret
            });
            
            if (!userId || !token || !secret) {
                console.log('Missing required environment variables');
                return {
                    statusCode: 500,
                    headers: {
                        'Access-Control-Allow-Origin': 'https://main--taiwanagla-2025.netlify.app',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                        'Access-Control-Allow-Credentials': 'true'
                    },
                    body: JSON.stringify({ 
                        success: false,
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
                                text: body.message
                            }
                        ]
                    }
                });

                // got 的回應已經是 JSON 格式，不需要再調用 json()
                console.log('Line Bot API response:', response.body);
                
                if (response.statusCode === 200) {
                    return {
                        statusCode: 200,
                        headers: {
                            'Access-Control-Allow-Origin': 'https://main--taiwanagla-2025.netlify.app',
                            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                            'Access-Control-Allow-Credentials': 'true'
                        },
                        body: JSON.stringify({ 
                            success: true,
                            message: 'Order submitted successfully',
                            data: response.body
                        })
                    };
                } else {
                    console.error('Line Bot returned non-200 status:', response.body);
                    return {
                        statusCode: 500,
                        headers: {
                            'Access-Control-Allow-Origin': 'https://main--taiwanagla-2025.netlify.app',
                            'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                            'Access-Control-Allow-Credentials': 'true'
                        },
                        body: JSON.stringify({ 
                            success: false,
                            message: 'Failed to send notification',
                            error: response.body.error || 'Unknown error'
                        })
                    };
                }
            } catch (apiError) {
                console.error('Error calling Line Bot API:', apiError);
                console.error('Error response:', apiError.response?.body);
                return {
                    statusCode: 500,
                    headers: {
                        'Access-Control-Allow-Origin': 'https://main--taiwanagla-2025.netlify.app',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                        'Access-Control-Allow-Credentials': 'true'
                    },
                    body: JSON.stringify({ 
                        success: false,
                        message: 'Failed to send notification',
                        error: apiError.message
                    })
                };
            }
        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': 'https://main--taiwanagla-2025.netlify.app',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                    'Access-Control-Allow-Credentials': 'true'
                },
                body: JSON.stringify({ 
                    success: false,
                    message: 'Invalid request format',
                    error: parseError.message
                })
            };
        }
    } catch (error) {
        console.error('Error in handler:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': 'https://main--taiwanagla-2025.netlify.app',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
                'Access-Control-Allow-Credentials': 'true'
            },
            body: JSON.stringify({ 
                success: false,
                message: 'Internal server error',
                error: error.message
            })
        };
    }
};
