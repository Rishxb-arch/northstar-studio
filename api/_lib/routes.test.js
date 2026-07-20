import { describe, expect, it } from 'vitest'
import analyticsHandler from '../analytics.js'
import brandsHandler from '../brands.js'
import briefsHandler from '../briefs.js'
import ideasHandler from '../ideas.js'
import sessionHandler from '../session.js'
import sprintsHandler from '../sprints.js'
import workspacesHandler from '../workspaces.js'

const userHeader = { 'x-northstar-user': 'ns-route-test-12345' }
const inputs = {
  handle: '@routecreator',
  niche: 'Creator operations',
  platform: 'Both',
  competitors: '@one, @two',
  monetizationGoal: 'sell systems and brand deals',
  brandCategories: 'software, desk gear, creator tools',
  contentStyle: 'direct, useful, founder-led',
}

function req(method, body, headers = userHeader) {
  return { method, body, headers }
}

function res() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    setHeader(key, value) { this.headers[key] = value },
    status(statusCode) { this.statusCode = statusCode; return this },
    json(body) { this.body = body; return this },
  }
}

async function call(handler, method, body, headers) {
  const response = res()
  await handler(req(method, body, headers), response)
  return response
}

describe('functional API route handlers', () => {
  it('requires an access key for product routes', async () => {
    const response = await call(workspacesHandler, 'POST', { inputs }, {})
    expect(response.statusCode).toBe(401)
    expect(response.body.ok).toBe(false)
  })

  it('creates a working creator workspace from onboarding inputs without Supabase env', async () => {
    const response = await call(workspacesHandler, 'POST', { inputs })

    expect(response.statusCode).toBe(200)
    expect(response.body.ok).toBe(true)
    expect(response.body.persisted).toBe(false)
    expect(response.body.workspace.workspace.brain.creator).toBe('@routecreator')
    expect(response.body.workspace.workspace.ideas).toHaveLength(10)
    expect(response.body.plan.tasks).toHaveLength(5)
  })

  it('updates sprint status against a workspace payload and recalculates progress', async () => {
    const created = await call(workspacesHandler, 'POST', { inputs })
    const workspace = created.body.workspace.workspace
    const response = await call(workspacesHandler, 'PATCH', { workspace, taskStatusOverrides: { 'mon-scout': 'done' }, activeIdea: 2 })

    expect(response.statusCode).toBe(200)
    expect(response.body.plan.metrics).toEqual({ planned: 5, done: 1, progress: 20 })
    expect(response.body.plan.selectedIdeaIndex).toBe(2)
  })

  it('serves the product resources the frontend needs from real workspace data', async () => {
    const created = await call(workspacesHandler, 'POST', { inputs })
    const workspace = created.body.workspace.workspace

    const [ideas, sprints, brands, analytics] = await Promise.all([
      call(ideasHandler, 'POST', { workspace }),
      call(sprintsHandler, 'PATCH', { workspace, taskStatusOverrides: { 'mon-scout': 'done' } }),
      call(brandsHandler, 'POST', { workspace }),
      call(analyticsHandler, 'POST', { workspace, analytics: { views: 10000, saves: 700, shares: 250 } }),
    ])

    expect(ideas.body.resource.ideas[0].title).toContain('creator operations')
    expect(sprints.body.resource.metrics.progress).toBe(20)
    expect(brands.body.resource.partners[0]).toHaveProperty('outreachAngle')
    expect(analytics.body.resource.kpis.saveRate).toBe('7.00%')
  })

  it('exports markdown brief server-side from the selected idea and sprint state', async () => {
    const created = await call(workspacesHandler, 'POST', { inputs })
    const workspace = created.body.workspace.workspace
    const response = await call(briefsHandler, 'POST', { workspace, activeIdea: 1, taskStatusOverrides: { 'mon-scout': 'done' } })

    expect(response.statusCode).toBe(200)
    expect(response.body.ok).toBe(true)
    expect(response.body.markdown).toContain('# @routecreator')
    expect(response.body.markdown).toContain('- [x] MON · Scout')
  })

  it('exposes a session catalog that matches the implemented endpoint count', async () => {
    const response = await call(sessionHandler, 'GET')
    expect(response.statusCode).toBe(200)
    expect(response.body.apiCatalog).toHaveLength(10)
  })
})
