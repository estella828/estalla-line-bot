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
                body: JSON.stringify({ message: 'LINE Notify token not configured' })
            };
        }

        // 發送通知到 LINE
        const response = await got.post('https://notify-api.line.me/api/notify', {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            form: {
                message: message
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Order submitted successfully' })
        };
    } catch (error) {
        console.error('Error submitting order:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error submitting order', error: error.message })
        };
    }
};
