const got = require('got');

exports.handler = async (event) => {
    try {
        console.log('Test Line Bot API called');
        
        const token = process.env.LINE_BOT_CHANNEL_ACCESS_TOKEN;
        const userId = process.env.LINE_USER_ID;
        
        if (!token || !userId) {
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
                body: JSON.stringify({ 
                    message: 'Configuration error',
                    error: 'Missing LINE Bot credentials'
                })
            };
        }

        console.log('Testing Line Bot API with token:', token.substring(0, 5) + '...');
        console.log('Testing Line Bot API with user ID:', userId);

        try {
            // 測試發送一個簡單的訊息
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
                            text: '這是一個測試訊息，請忽略。'
                        }
                    ]
                }
            });

            console.log('Line Bot API test response:', response.body);
            const data = await response.json();
            console.log('Line Bot API test response data:', data);

            return {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
                body: JSON.stringify({ 
                    message: 'Line Bot API test successful',
                    data: data
                })
            };

        } catch (error) {
            console.error('Error testing Line Bot API:', error);
            console.error('Error response:', error.response?.body);
            
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
                body: JSON.stringify({ 
                    message: 'Error testing Line Bot API',
                    error: error.message,
                    response: error.response?.body
                })
            };
        }
    } catch (error) {
        console.error('Error in test-line-bot function:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            body: JSON.stringify({ 
                message: 'Error in test function',
                error: error.message,
                stack: error.stack
            })
        };
    }
};
