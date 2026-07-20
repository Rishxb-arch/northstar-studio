const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const clean = (value) => String(value ?? '').trim()

const supabaseRestUrl = (value) => {
  const url = String(value || '').trim().replace(/\/$/, '')
  return url.endsWith('/rest/v1') ? url : `${url}/rest/v1`
}

const send = (response, status, body) => {
  response.setHeader('Cache-Control', 'no-store')
  return response.status(status).json(body)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return send(response, 405, { ok: false, error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return send(response, 500, { ok: false, error: 'Waitlist is not configured yet' })
  }

  const payload = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body || {}
  const name = clean(payload.name)
  const email = clean(payload.email).toLowerCase()
  const handle = clean(payload.handle)
  const niche = clean(payload.niche)
  const platform = clean(payload.platform) || 'Instagram/TikTok'

  if (!name || !emailPattern.test(email) || !niche) {
    return send(response, 400, { ok: false, error: 'Name, valid email, and niche are required' })
  }

  const insertResponse = await fetch(`${supabaseRestUrl(supabaseUrl)}/waitlist`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      name,
      email,
      handle,
      niche,
      platform,
      source: 'website',
      user_agent: request.headers['user-agent'] ?? null,
    }),
  })

  if (insertResponse.status === 409) {
    return send(response, 200, { ok: true, duplicate: true })
  }

  if (!insertResponse.ok) {
    const message = await insertResponse.text()
    console.error('Supabase waitlist insert failed', message)
    if (message.includes('PGRST205') || message.includes("public.waitlist")) {
      return send(response, 502, { ok: false, error: 'Waitlist table is not created yet' })
    }
    return send(response, 502, { ok: false, error: 'Could not save waitlist signup' })
  }

  const [lead] = await insertResponse.json()
  return send(response, 200, { ok: true, id: lead?.id ?? null })
}
