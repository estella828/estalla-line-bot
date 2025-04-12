const fetch = require('node-fetch');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    const token = process.env.LINE_NOTIFY_TOKEN;

    if (!token) {
      return res.status(500).json({ message: 'LINE Notify token not configured' });
    }

    // 發送通知到 LINE
    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `message=${encodeURIComponent(message)}`
    });

    const data = await response.json();

    if (data.status === 200) {
      return res.status(200).json({ message: 'Order submitted successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to send notification' });
    }
  } catch (error) {
    console.error('Error submitting order:', error);
    return res.status(500).json({ message: 'Error submitting order', error: error.message });
  }
}
