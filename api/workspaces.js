import { parseBody, requireUserKey, send } from './_lib/http.js'
import { supabaseFetch } from './_lib/supabase.js'
import { createProductionPlan, generateWorkspace, validateInputs } from './_lib/workspace.js'

const tablePath = '/creator_workspaces'

const rowToDto = (row) => row ? {
  id: row.id,
  userKey: row.user_key,
  inputs: row.inputs,
  workspace: row.workspace,
  taskStatusOverrides: row.task_statuses || {},
  activeIdea: row.active_idea_index || 0,
  updatedAt: row.updated_at,
} : null

const readWorkspace = async (userKey) => {
  const query = `${tablePath}?user_key=eq.${encodeURIComponent(userKey)}&select=*&limit=1`
  const { configured, response } = await supabaseFetch(query, { method: 'GET', prefer: undefined })
  if (!configured) return { configured: false, workspace: null }
  if (!response.ok) throw new Error(await response.text())
  const rows = await response.json()
  return { configured: true, workspace: rowToDto(rows[0]) }
}

const upsertWorkspace = async (userKey, body) => {
  const { configured, response } = await supabaseFetch(tablePath, {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
    body: JSON.stringify([{ user_key: userKey, ...body }]),
  })
  if (!configured) return { configured: false, workspace: null }
  if (!response.ok) throw new Error(await response.text())
  const [row] = await response.json()
  return { configured: true, workspace: rowToDto(row) }
}

export default async function handler(request, response) {
  const userKey = requireUserKey(request)
  if (!userKey) return send(response, 401, { ok: false, error: 'Workspace access key is required' })

  try {
    if (request.method === 'GET') {
      const result = await readWorkspace(userKey)
      return send(response, 200, { ok: true, persisted: result.configured, workspace: result.workspace })
    }

    if (request.method === 'POST') {
      const payload = parseBody(request)
      const inputs = payload.inputs || payload
      const missing = validateInputs(inputs)
      if (missing.length) return send(response, 400, { ok: false, error: `Missing workspace inputs: ${missing.join(', ')}` })

      const workspace = generateWorkspace(inputs)
      const taskStatusOverrides = {}
      const activeIdea = 0
      const plan = createProductionPlan(workspace, activeIdea, taskStatusOverrides)
      const result = await upsertWorkspace(userKey, {
        inputs,
        workspace,
        task_statuses: taskStatusOverrides,
        active_idea_index: activeIdea,
      })

      return send(response, 200, {
        ok: true,
        persisted: result.configured,
        workspace: result.workspace || { userKey, inputs, workspace, taskStatusOverrides, activeIdea },
        plan,
      })
    }

    if (request.method === 'PATCH') {
      const payload = parseBody(request)
      const current = await readWorkspace(userKey)
      const existing = current.workspace || null
      const workspace = payload.workspace || existing?.workspace
      if (!workspace) return send(response, 404, { ok: false, error: 'Workspace not found' })
      const taskStatusOverrides = payload.taskStatusOverrides || existing?.taskStatusOverrides || {}
      const activeIdea = Number.isInteger(payload.activeIdea) ? payload.activeIdea : existing?.activeIdea || 0
      const plan = createProductionPlan(workspace, activeIdea, taskStatusOverrides)
      const result = await upsertWorkspace(userKey, {
        inputs: payload.inputs || existing?.inputs || {},
        workspace,
        task_statuses: taskStatusOverrides,
        active_idea_index: activeIdea,
      })
      return send(response, 200, { ok: true, persisted: result.configured, workspace: result.workspace || { ...existing, userKey, workspace, taskStatusOverrides, activeIdea }, plan })
    }

    if (request.method === 'DELETE') {
      const { configured, response: supabaseResponse } = await supabaseFetch(`${tablePath}?user_key=eq.${encodeURIComponent(userKey)}`, {
        method: 'DELETE',
        prefer: 'return=minimal',
      })
      if (configured && !supabaseResponse.ok) throw new Error(await supabaseResponse.text())
      return send(response, 200, { ok: true, persisted: configured })
    }

    response.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return send(response, 405, { ok: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Workspace API failed', error)
    return send(response, 502, { ok: false, error: 'Workspace service unavailable' })
  }
}
