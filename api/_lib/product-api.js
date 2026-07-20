import { parseBody, requireUserKey, send } from './http.js'
import { supabaseFetch } from './supabase.js'
import { buildCreatorSystem, getProductDomain } from './product.js'
import { createProductionPlan, generateWorkspace, validateInputs } from './workspace.js'

const tablePath = '/creator_workspaces'

export const rowToWorkspaceDto = (row) => row ? {
  id: row.id,
  userKey: row.user_key,
  inputs: row.inputs,
  workspace: row.workspace,
  taskStatusOverrides: row.task_statuses || {},
  activeIdea: row.active_idea_index || 0,
  analytics: row.analytics || {},
  updatedAt: row.updated_at,
} : null

export const readSavedWorkspace = async (userKey) => {
  const query = `${tablePath}?user_key=eq.${encodeURIComponent(userKey)}&select=*&limit=1`
  const { configured, response } = await supabaseFetch(query, { method: 'GET', prefer: undefined })
  if (!configured) return { configured: false, workspace: null }
  if (!response.ok) throw new Error(await response.text())
  const rows = await response.json()
  return { configured: true, workspace: rowToWorkspaceDto(rows[0]) }
}

export const upsertSavedWorkspace = async (userKey, body) => {
  const { configured, response } = await supabaseFetch(tablePath, {
    method: 'POST',
    prefer: 'resolution=merge-duplicates,return=representation',
    body: JSON.stringify([{ user_key: userKey, ...body }]),
  })
  if (!configured) return { configured: false, workspace: null }
  if (!response.ok) throw new Error(await response.text())
  const [row] = await response.json()
  return { configured: true, workspace: rowToWorkspaceDto(row) }
}

export const deleteSavedWorkspace = async (userKey) => {
  const { configured, response } = await supabaseFetch(`${tablePath}?user_key=eq.${encodeURIComponent(userKey)}`, {
    method: 'DELETE',
    prefer: 'return=minimal',
  })
  if (configured && !response.ok) throw new Error(await response.text())
  return { configured }
}

const resolveWorkspaceFromRequest = async (request, userKey) => {
  if (request.method !== 'GET') {
    const payload = parseBody(request)
    if (payload.workspace) return { payload, saved: null, workspace: payload.workspace }
    if (payload.inputs) {
      const missing = validateInputs(payload.inputs)
      if (missing.length) return { payload, error: `Missing workspace inputs: ${missing.join(', ')}` }
      return { payload, saved: null, workspace: generateWorkspace(payload.inputs) }
    }
    const saved = await readSavedWorkspace(userKey)
    return { payload, saved: saved.workspace, workspace: saved.workspace?.workspace, persisted: saved.configured }
  }

  const saved = await readSavedWorkspace(userKey)
  return { payload: {}, saved: saved.workspace, workspace: saved.workspace?.workspace, persisted: saved.configured }
}

export function createDomainHandler(domain) {
  return async function handler(request, response) {
    const userKey = requireUserKey(request)
    if (!userKey) return send(response, 401, { ok: false, error: 'Workspace access key is required' })

    try {
      if (domain === 'session') {
        return send(response, 200, {
          ok: true,
          session: { userKey, access: 'beta-key', authenticated: true },
          apiCatalog: buildCreatorSystem(generateWorkspace({
            handle: '@sample', niche: 'Creator education', platform: 'Both', competitors: '@one,@two', monetizationGoal: 'brand deals', brandCategories: 'tools', contentStyle: 'clear',
          })).apiCatalog,
        })
      }

      const resolved = await resolveWorkspaceFromRequest(request, userKey)
      if (resolved.error) return send(response, 400, { ok: false, error: resolved.error })
      if (!resolved.workspace) return send(response, 404, { ok: false, error: 'Create a workspace before using this endpoint' })

      const taskStatuses = resolved.payload.taskStatusOverrides || resolved.saved?.taskStatusOverrides || {}
      const activeIdea = Number.isInteger(resolved.payload.activeIdea) ? resolved.payload.activeIdea : resolved.saved?.activeIdea || 0
      const analytics = resolved.payload.analytics || resolved.saved?.analytics || {}
      const resource = getProductDomain(domain, resolved.workspace, { taskStatuses, activeIdea, analytics })

      if (request.method === 'POST' || request.method === 'PATCH') {
        const shouldPersist = ['creators', 'workspaces', 'ideas', 'briefs', 'sprints', 'calendar', 'brands', 'analytics'].includes(domain)
        if (shouldPersist) {
          const plan = createProductionPlan(resolved.workspace, activeIdea, taskStatuses)
          const result = await upsertSavedWorkspace(userKey, {
            inputs: resolved.payload.inputs || resolved.saved?.inputs || {},
            workspace: resolved.workspace,
            task_statuses: taskStatuses,
            active_idea_index: activeIdea,
            analytics,
          })
          return send(response, 200, { ok: true, domain, persisted: result.configured, resource, plan, workspace: result.workspace })
        }
      }

      return send(response, 200, { ok: true, domain, persisted: Boolean(resolved.persisted), resource })
    } catch (error) {
      console.error(`${domain} API failed`, error)
      return send(response, 502, { ok: false, error: `${domain} service unavailable` })
    }
  }
}
