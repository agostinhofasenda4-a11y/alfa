/**
 * /api/tts.js — Vercel Serverless Function
 *
 * Melhorias V8:
 * - Cache HTTP com header Cache-Control (Vercel edge cache)
 * - Timeout de 8s para não bloquear indefinidamente
 * - Resposta de erro mais clara para debug
 */

export default async function handler(req, res) {
  // CORS
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

  // Timeout de 8s para o Gemini
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
              // Prompt optimizado para voz feminina alegre estilo Disney Channel PT
              text: `És uma apresentadora de um programa infantil português, muito alegre, calorosa e cheia de energia, como no Disney Channel Portugal. Fala o seguinte com entusiasmo e pausas naturais: ${text}`,
            }],
          }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                // Kore = voz feminina calorosa, ideal para crianças
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
      // Passa o status real para o cliente poder reagir (ex: 429 = quota)
      return res.status(r.status).json({
        error: 'Gemini error',
        status: r.status,
        detail: errText.slice(0, 200),
      });
    }

    const data  = await r.json();
    const audio = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audio) {
      console.error('[TTS] No audio in Gemini response:', JSON.stringify(data).slice(0, 300));
      return res.status(500).json({ error: 'No audio returned' });
    }

    // Cache no edge da Vercel por 1 hora para frases repetidas
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).json({ audio });

  } catch (e) {
    clearTimeout(timeout);
    const msg = e?.name === 'AbortError' ? 'Gemini timeout (8s)' : String(e);
    console.error('[TTS] Internal error:', msg);
    return res.status(504).json({ error: msg });
  }
}
