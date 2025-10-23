// api/chat.js
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { userText } = req.body || {};
    if (!userText) return res.status(400).json({ error: 'Missing userText' });

    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // set your preferred model in env
    if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY' });

    const system = `You are Stone's sidekick inside a 3D hardware lab. 
Speak briefly, step-by-step. If user mentions Pi/GPU/amps/wiring, give precise, safe guidance.`;

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

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(500).json({ error: `OpenAI error: ${err}` });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || 'I’m here.';
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}
