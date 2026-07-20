import { describe, expect, it } from 'vitest'
import {
  buildAnalyticsSnapshot,
  buildApiCatalog,
  buildBrandPipeline,
  buildCalendar,
  buildCreatorProfile,
  buildCreatorSystem,
  buildIntegrationStatus,
  createContentBrief,
  createSprintBoard,
  getProductDomain,
} from './product.js'
import { generateWorkspace } from './workspace.js'

const inputs = {
  handle: '@founderfit',
  niche: 'Founder fitness',
  platform: 'Both',
  competitors: '@fitone, @fittwo',
  monetizationGoal: 'sell coaching and brand deals',
  brandCategories: 'wearables, protein, recovery',
  contentStyle: 'direct, proof-led, useful',
}
const workspace = generateWorkspace(inputs)

describe('functional Northstar product backend domains', () => {
  it('defines only the functional product endpoints used by the app flow', () => {
    const catalog = buildApiCatalog()
    expect(catalog.map((item) => item.domain)).toEqual([
      'session', 'creators', 'integrations', 'workspaces', 'ideas', 'briefs', 'sprints', 'calendar', 'brands', 'analytics',
    ])
    expect(catalog.every((item) => item.endpoints.length > 0)).toBe(true)
  })

  it('builds creator profile and integration status resources from the workspace', () => {
    const profile = buildCreatorProfile(workspace)
    const integrations = buildIntegrationStatus(workspace)

    expect(profile.handle).toBe('@founderfit')
    expect(profile.contentPillars).toHaveLength(4)
    expect(integrations.map((item) => item.provider)).toEqual(['instagram', 'tiktok', 'supabase'])
  })

  it('builds execution resources for briefs, sprints, and calendar', () => {
    const brief = createContentBrief(workspace, 0)
    const sprint = createSprintBoard(workspace, { 'mon-scout': 'done' })
    const calendar = buildCalendar(workspace, sprint)

    expect(brief.productionChecklist.length).toBeGreaterThan(3)
    expect(sprint.metrics.progress).toBe(20)
    expect(calendar.items).toHaveLength(5)
    expect(calendar.items[0]).toMatchObject({ status: 'done' })
  })

  it('builds monetization and analytics resources', () => {
    const brands = buildBrandPipeline(workspace)
    const analytics = buildAnalyticsSnapshot(workspace, { views: 120000, saves: 6400, shares: 2100 })

    expect(brands.partners).toHaveLength(3)
    expect(brands.partners[0]).toHaveProperty('outreachAngle')
    expect(analytics.kpis.saveRate).toBe('5.33%')
  })

  it('builds a single creator system response containing all functional domains', () => {
    const system = buildCreatorSystem(workspace, { taskStatuses: { 'mon-scout': 'done' }, activeIdea: 1 })

    expect(system.creator.handle).toBe('@founderfit')
    expect(system.activeBrief.idea.title).toBe(workspace.ideas[1].title)
    expect(system.sprint.metrics.done).toBe(1)
    expect(system.apiCatalog).toHaveLength(10)
    expect(getProductDomain('briefs', workspace, { activeIdea: 1 }).idea.title).toBe(workspace.ideas[1].title)
  })
})
