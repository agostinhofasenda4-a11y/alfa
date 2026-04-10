/**
 * /api/tts.js  —  Vercel Serverless Function
 *
 * Cria esta pasta e ficheiro na raiz do projecto: /api/tts.js
 * Na Vercel, adiciona a variável de ambiente: GEMINI_API_KEY = AIza...
 *
 * O browser chama  POST /api/tts  com  { text: "..." }
 * Este ficheiro chama o Gemini com a chave em segurança e devolve { audio: "<base64>" }
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Missing text' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Fala isto como uma apresentadora de televisão infantil muito alegre, cheia de energia e carinhosa, ao estilo Disney Channel, em português de Portugal: ${text}`,
            }],
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        }),
      }
    );

    if (!r.ok) {
      const err = await r.text();
      console.error('[TTS]', r.status, err);
      return res.status(r.status).json({ error: 'Gemini error', detail: err });
    }

    const data  = await r.json();
    const audio = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audio) return res.status(500).json({ error: 'No audio in response' });

    return res.status(200).json({ audio });
  } catch (e) {
    console.error('[TTS] Internal error:', e);
    return res.status(500).json({ error: String(e) });
  }
}
