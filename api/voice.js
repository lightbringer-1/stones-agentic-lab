// api/voice.js
export const config = { api: { responseLimit: false } }; // allow binary
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // default voice
    if (!apiKey) return res.status(500).json({ error: 'Missing ELEVENLABS_API_KEY' });

    const ttsResp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        model_id: 'eleven_multilingual_v2'
      })
    });

    if (!ttsResp.ok) {
      const err = await ttsResp.text();
      return res.status(500).json({ error: `ElevenLabs error: ${err}` });
    }

    const arrayBuf = await ttsResp.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unknown error' });
  }
}
