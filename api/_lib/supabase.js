const supabaseRestUrl = (value) => {
  const url = String(value || '').trim().replace(/\/$/, '')
  return url.endsWith('/rest/v1') ? url : `${url}/rest/v1`
}

export const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  return { restUrl: supabaseRestUrl(url), serviceRoleKey }
}

export const supabaseHeaders = (serviceRoleKey, prefer = 'return=representation') => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
  Prefer: prefer,
})

export async function supabaseFetch(path, options = {}) {
  const config = getSupabaseConfig()
  if (!config) return { configured: false, response: null }
  const response = await fetch(`${config.restUrl}${path}`, {
    ...options,
    headers: {
      ...supabaseHeaders(config.serviceRoleKey, options.prefer),
      ...(options.headers || {}),
    },
  })
  return { configured: true, response }
}
