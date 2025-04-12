const got = require('got');

exports.handler = async (event) => {
    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method not allowed' })
            };
        }

        const { message } = JSON.parse(event.body);
        const token = process.env.LINE_NOTIFY_TOKEN;

        if (!token) {
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    message: 'LINE Notify token not configured',
                    error: 'Please set LINE_NOTIFY_TOKEN in Netlify environment variables'
                })
            };
        }

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

        const data = await response.json();

        if (data.status === 200) {
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    message: 'Order submitted successfully',
                    data: data
                })
            };
        } else {
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    message: 'Failed to send notification',
                    error: data.message
                })
            };
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                message: 'Error submitting order',
                error: error.message
            })
        };
    }
};
