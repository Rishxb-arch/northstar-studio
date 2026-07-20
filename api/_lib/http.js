export const send = (response, status, body) => {
  response.setHeader('Cache-Control', 'no-store')
  return response.status(status).json(body)
}

export const parseBody = (request) => {
  if (typeof request.body === 'string') return JSON.parse(request.body || '{}')
  return request.body || {}
}

export const clean = (value, max = 280) => String(value ?? '').trim().slice(0, max)

export const requireUserKey = (request) => {
  const header = request.headers['x-northstar-user'] || request.headers['X-Northstar-User']
  const key = clean(Array.isArray(header) ? header[0] : header, 96)
  if (!/^[a-zA-Z0-9._:-]{12,96}$/.test(key)) return ''
  return key
}
