export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Falta configurar OPENAI_API_KEY en Vercel.' });
  }

  try {
    const { symptoms, vehicle, jobs } = req.body || {};
    if (!symptoms || typeof symptoms !== 'string') {
      return res.status(400).json({ error: 'Falta describir el problema del vehículo.' });
    }

    const systemPrompt = `Sos un asistente de orientación vehicular para TallerSmart. Respondé en español claro, breve y útil. No des diagnóstico definitivo. Indicá posibles causas, urgencia, próximos pasos y cuándo ir urgente a un taller. Incluí siempre que no reemplaza revisión profesional.`;

    const userPrompt = {
      symptoms,
      vehicle: vehicle || null,
      recent_jobs: Array.isArray(jobs) ? jobs : []
    };

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analizá este caso vehicular y devolvé una orientación inicial:\n${JSON.stringify(userPrompt, null, 2)}` }
        ],
        max_output_tokens: 450
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Error consultando IA.' });
    }

    const answer = data.output_text || data.output?.flatMap(item => item.content || []).map(c => c.text || '').join('\n') || '';
    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error interno.' });
  }
}
