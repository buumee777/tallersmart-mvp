export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ error: 'Falta configurar MP_ACCESS_TOKEN en Vercel.' });
    }

    const { jobId, title, description, amount, plate } = req.body || {};
    const numericAmount = Number(amount || 0);

    if (!jobId || !title || !numericAmount || numericAmount <= 0) {
      return res.status(400).json({ error: 'Datos de pago incompletos.' });
    }

    const origin = req.headers.origin || `https://${req.headers.host}`;
    const backUrlBase = `${origin}/?job_id=${encodeURIComponent(jobId)}`;

    const preference = {
      items: [
        {
          title: `TallerSmart - ${title}`,
          description: description || `Trabajo realizado al vehículo ${plate || ''}`,
          quantity: 1,
          currency_id: 'ARS',
          unit_price: numericAmount,
        },
      ],
      external_reference: jobId,
      back_urls: {
        success: `${backUrlBase}&payment_result=success`,
        pending: `${backUrlBase}&payment_result=pending`,
        failure: `${backUrlBase}&payment_result=failure`,
      },
      auto_return: 'approved',
      statement_descriptor: 'TALLERSMART',
      metadata: {
        job_id: jobId,
        plate: plate || '',
      },
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return res.status(mpResponse.status).json({ error: data.message || 'Error creando preferencia de Mercado Pago', details: data });
    }

    return res.status(200).json({
      id: data.id,
      init_point: data.init_point,
      sandbox_init_point: data.sandbox_init_point,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Error inesperado' });
  }
}
