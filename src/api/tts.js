// api/tts.js — Cria esta pasta e ficheiro na raiz do teu projecto
// Caminho: /api/tts.js (ao lado de /src, /public, etc.)

export default async function handler(req, res) {
  // Permite CORS para o teu site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Texto em falta' });
  }

  const apiKey = process.env.GEMINI_API_KEY; // Sem VITE_ — esta é a versão do servidor!

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave API não configurada no servidor' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Fala isto com entusiasmo alegre, como uma apresentadora de televisão infantil animada e carinhosa para crianças de 3 a 7 anos: ${text}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Kore', // Voz feminina clara e calorosa
                },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Erro da API Gemini:', response.status, errorBody);
      return res.status(response.status).json({ error: 'Erro na API Gemini', details: errorBody });
    }

    const data = await response.json();
    const base64Audio = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'Sem áudio na resposta', raw: data });
    }

    // Devolve o áudio base64 ao browser
    return res.status(200).json({ audio: base64Audio });
  } catch (err) {
    console.error('Erro interno:', err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
