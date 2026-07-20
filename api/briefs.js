import { parseBody, send } from './_lib/http.js'
import { buildBriefExport, createProductionPlan } from './_lib/workspace.js'

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return send(response, 405, { ok: false, error: 'Method not allowed' })
  }

  try {
    const payload = parseBody(request)
    const workspace = payload.workspace
    if (!workspace?.brain || !Array.isArray(workspace.ideas) || !Array.isArray(workspace.sprint)) {
      return send(response, 400, { ok: false, error: 'Workspace payload is required' })
    }
    const plan = createProductionPlan(workspace, payload.activeIdea || 0, payload.taskStatusOverrides || {})
    return send(response, 200, { ok: true, markdown: buildBriefExport(workspace, plan), plan })
  } catch (error) {
    console.error('Brief export failed', error)
    return send(response, 400, { ok: false, error: 'Could not export brief' })
  }
}
