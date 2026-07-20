import { describe, expect, it } from 'vitest'
import { buildBriefExport, createProductionPlan, generateWorkspace, validateInputs } from './workspace.js'

describe('workspace backend architecture', () => {
  const inputs = {
    handle: '@northstarcreator',
    niche: 'Fitness creators',
    platform: 'TikTok',
    competitors: '@one, @two',
    monetizationGoal: 'sell a paid guide',
    brandCategories: 'Supplements, gear',
    contentStyle: 'Direct, practical, high proof',
  }

  it('validates required creator onboarding inputs', () => {
    expect(validateInputs({ ...inputs, niche: '' })).toContain('niche')
    expect(validateInputs(inputs)).toEqual([])
  })

  it('generates a complete persisted workspace payload', () => {
    const workspace = generateWorkspace(inputs)

    expect(workspace.brain.creator).toBe('@northstarcreator')
    expect(workspace.ideas).toHaveLength(10)
    expect(workspace.sprint).toHaveLength(5)
    expect(workspace.deals[0]).toMatchObject({ category: 'Supplements' })
  })

  it('creates plan state from saved task statuses', () => {
    const workspace = generateWorkspace(inputs)
    const plan = createProductionPlan(workspace, 1, { 'mon-scout': 'done' })

    expect(plan.selectedIdeaIndex).toBe(1)
    expect(plan.metrics).toEqual({ planned: 5, done: 1, progress: 20 })
    expect(plan.tasks[1].status).toBe('next')
  })

  it('exports active brief markdown server-side', () => {
    const workspace = generateWorkspace(inputs)
    const plan = createProductionPlan(workspace, 0, {})
    const markdown = buildBriefExport(workspace, plan)

    expect(markdown).toContain('# @northstarcreator')
    expect(markdown).toContain('## Production sprint')
  })
})
