// api/chat.js  — improved logging
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { userText } = req.body || {};
    if (!userText) return res.status(400).json({ error: 'Missing userText' });

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

    const system = `You are Stone's sidekick inside a 3D hardware lab. Give brief, step-by-step responses.`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userText }
        ]
      })
    });

    const raw = await resp.text(); // always read body so we can log it
    if (!resp.ok) {
      console.error('OpenAI response:', raw);
      return res.status(500).json({ error: `OpenAI error: ${raw}` });
    }

    const data = JSON.parse(raw);
    const text = data?.choices?.[0]?.message?.content?.trim() || 'I’m here.';
    return res.status(200).json({ text });

  } catch (e) {
    console.error('Handler exception:', e);
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}
