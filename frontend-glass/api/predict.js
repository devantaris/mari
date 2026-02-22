// Vercel serverless function — proxies POST /api/predict → Railway backend
// No CORS issues: browser calls same-origin Vercel, Vercel calls Railway server-to-server.

const RAILWAY_URL = 'https://risk-aware-fraud-detection-production.up.railway.app/predict';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const upstream = await fetch(RAILWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        const data = await upstream.json();
        return res.status(upstream.status).json(data);
    } catch (e) {
        return res.status(502).json({ error: `Upstream error: ${e.message}` });
    }
}
