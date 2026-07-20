import { describe, expect, it } from 'vitest'
import { buildBriefExport, createProductionPlan, updateSprintStatus } from './product'

describe('creator production workspace', () => {
  const workspace = {
    brain: {
      creator: '@amaraglow',
      niche: 'Beauty & skincare',
      primaryPlatform: 'Both' as const,
      positioning: '@amaraglow makes beauty useful.',
    },
    ideas: [
      {
        tag: 'EDUCATION',
        title: '3 beauty mistakes nobody warns you about',
        hook: 'Check this first.',
        length: '19 sec',
        score: 93,
        script: ['0–3s · Hook', '4–15s · Proof', 'Final beat · CTA'],
        shots: ['Direct-to-camera opener', 'Macro proof shot'],
      },
    ],
    sprint: [
      { day: 'MON', focus: 'Scout', task: 'Validate 3 rising angles' },
      { day: 'TUE', focus: 'Script', task: 'Batch hooks' },
    ],
  }

  it('creates an actionable production plan from workspace output', () => {
    const plan = createProductionPlan(workspace, 0)

    expect(plan.selectedIdeaTitle).toBe('3 beauty mistakes nobody warns you about')
    expect(plan.tasks).toHaveLength(2)
    expect(plan.tasks[0]).toMatchObject({ id: 'mon-scout', status: 'next', task: 'Validate 3 rising angles' })
    expect(plan.tasks[1]).toMatchObject({ id: 'tue-script', status: 'todo' })
    expect(plan.metrics).toEqual({ planned: 2, done: 0, progress: 0 })
  })

  it('updates task status and recalculates progress', () => {
    const plan = createProductionPlan(workspace, 0)
    const updated = updateSprintStatus(plan, 'mon-scout', 'done')

    expect(updated.tasks[0].status).toBe('done')
    expect(updated.tasks[1].status).toBe('next')
    expect(updated.metrics).toEqual({ planned: 2, done: 1, progress: 50 })
  })

  it('exports a selected creative brief in creator-ready markdown', () => {
    const plan = createProductionPlan(workspace, 0)
    const exportText = buildBriefExport(workspace, plan)

    expect(exportText).toContain('# @amaraglow — 3 beauty mistakes nobody warns you about')
    expect(exportText).toContain('## Opening hook\nCheck this first.')
    expect(exportText).toContain('- [ ] MON · Scout — Validate 3 rising angles')
    expect(exportText).not.toContain('[object Object]')
  })
})
