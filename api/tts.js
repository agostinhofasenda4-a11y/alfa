/**
 * /api/tts.js — Vercel Serverless Function V9
 * Gera voz em PORTUGUÊS DE PORTUGAL via Gemini TTS.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid text' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 8000);

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        signal:  controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              // CRÍTICO: instrução explícita em PORTUGUÊS para garantir que
              // o Gemini não usa inglês ou espanhol na voz gerada
              text: `Fala OBRIGATORIAMENTE em português de Portugal. És uma apresentadora de um programa infantil português muito alegre, calorosa e cheia de energia, como no Disney Channel Portugal. Fala o seguinte em português: ${text}`,
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
    clearTimeout(timeout);

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      console.error(`[TTS] Gemini ${r.status}:`, errText.slice(0, 200));
      return res.status(r.status).json({
        error: 'Gemini error',
        status: r.status,
        detail: errText.slice(0, 200),
      });
    }

    const data  = await r.json();
    const audio = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audio) {
      console.error('[TTS] No audio in response:', JSON.stringify(data).slice(0, 200));
      return res.status(500).json({ error: 'No audio returned' });
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({ audio });

  } catch (e) {
    clearTimeout(timeout);
    const msg = e?.name === 'AbortError' ? 'Timeout (8s)' : String(e);
    console.error('[TTS] Error:', msg);
    return res.status(504).json({ error: msg });
  }
}
