const got = require('got');

exports.handler = async (event) => {
    try {
        console.log('Received event:', event);
        
        if (event.httpMethod !== 'POST') {
            console.log('Invalid HTTP method:', event.httpMethod);
            return {
                statusCode: 405,
                body: JSON.stringify({ 
                    message: 'Method not allowed',
                    error: 'Only POST method is allowed'
                })
            };
        }

        const { message } = JSON.parse(event.body);
        console.log('Parsed message:', message);
        
        const token = process.env.LINE_NOTIFY_TOKEN;
        console.log('LINE_NOTIFY_TOKEN is set:', !!token);

        if (!token) {
            console.log('LINE_NOTIFY_TOKEN not found in environment variables');
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    message: 'LINE Notify token not configured',
                    error: 'Please set LINE_NOTIFY_TOKEN in Netlify environment variables'
                })
            };
        }

        console.log('Sending notification to LINE Notify...');
        
        // 發送通知到 LINE
        const response = await got.post('https://notify-api.line.me/api/notify', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                message: message
            }
        });

        console.log('LINE Notify response:', response.body);
        const data = await response.json();

        console.log('LINE Notify response data:', data);

        if (data.status === 200) {
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    message: 'Order submitted successfully',
                    data: data
                })
            };
        } else {
            console.error('LINE Notify returned non-200 status:', data);
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    message: 'Failed to send notification',
                    error: data.message || 'LINE Notify returned non-200 status'
                })
            };
        }
    } catch (error) {
        console.error('Error in submit-order function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error submitting order',
                error: error.message,
                stack: error.stack
            })
        };
    }
};
