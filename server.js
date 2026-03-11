const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check — visit /health in your browser to confirm the API key is loaded
app.get('/health', (req, res) => {
  const keyLoaded = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    status: 'ok',
    apiKeyLoaded: keyLoaded,
    keyPreview: keyLoaded ? process.env.ANTHROPIC_API_KEY.slice(0, 10) + '...' : 'NOT SET'
  });
});

app.post('/api/claude', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY is not set on the server.' } });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: { message: err.message || 'Server error' } });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fart Oracle running on port ${PORT}`));
