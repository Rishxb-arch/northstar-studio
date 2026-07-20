import { buildBriefExport, createProductionPlan } from './workspace.js'

export const PRODUCT_DOMAINS = [
  { domain: 'session', endpoints: ['GET /api/session'], purpose: 'Beta access/session bootstrap.' },
  { domain: 'creators', endpoints: ['GET /api/creators', 'POST /api/creators', 'PATCH /api/creators'], purpose: 'Creator profile and positioning.' },
  { domain: 'integrations', endpoints: ['GET /api/integrations'], purpose: 'Instagram/TikTok/Supabase connection readiness.' },
  { domain: 'workspaces', endpoints: ['GET /api/workspaces', 'POST /api/workspaces', 'PATCH /api/workspaces', 'DELETE /api/workspaces'], purpose: 'Create, read, update, delete the saved creator workspace.' },
  { domain: 'ideas', endpoints: ['GET /api/ideas', 'POST /api/ideas'], purpose: 'Scored content ideas generated from workspace context.' },
  { domain: 'briefs', endpoints: ['GET /api/briefs', 'POST /api/briefs', 'PATCH /api/briefs'], purpose: 'Active content brief and export markdown.' },
  { domain: 'sprints', endpoints: ['GET /api/sprints', 'PATCH /api/sprints'], purpose: 'Weekly production sprint task state.' },
  { domain: 'calendar', endpoints: ['GET /api/calendar', 'POST /api/calendar'], purpose: 'Publishing calendar derived from sprint and ideas.' },
  { domain: 'brands', endpoints: ['GET /api/brands', 'PATCH /api/brands'], purpose: 'Brand-fit pipeline and outreach stages.' },
  { domain: 'analytics', endpoints: ['GET /api/analytics', 'POST /api/analytics'], purpose: 'Imported performance snapshot and recommendations.' },
]

export const buildApiCatalog = () => PRODUCT_DOMAINS

export function buildCreatorProfile(workspace) {
  return {
    handle: workspace.brain.creator,
    niche: workspace.brain.niche,
    primaryPlatform: workspace.brain.primaryPlatform,
    positioning: workspace.brain.positioning,
    monetizationGoal: workspace.brain.monetizationGoal,
    contentPillars: workspace.brain.contentPillars,
    voiceTraits: workspace.brain.voiceTraits,
    brandCategories: workspace.brain.brandCategories,
    status: 'active',
  }
}

export function buildIntegrationStatus(workspace) {
  return [
    {
      provider: 'instagram',
      label: 'Instagram',
      status: ['Instagram', 'Both'].includes(workspace.brain.primaryPlatform) ? 'connectable' : 'optional',
      scopes: ['profile', 'media_insights', 'comments'],
      nextAction: 'Connect Meta OAuth when beta access is approved',
    },
    {
      provider: 'tiktok',
      label: 'TikTok',
      status: ['TikTok', 'Both'].includes(workspace.brain.primaryPlatform) ? 'connectable' : 'optional',
      scopes: ['profile', 'video_list', 'video_insights'],
      nextAction: 'Connect TikTok OAuth when beta access is approved',
    },
    {
      provider: 'supabase',
      label: 'Northstar database',
      status: 'server-managed',
      scopes: ['workspace', 'briefs', 'sprints', 'analytics'],
      nextAction: 'Persisted through Vercel serverless API',
    },
  ]
}

export function buildIdeaBank(workspace) {
  return {
    ideas: workspace.ideas.map((idea, index) => ({
      id: `idea-${index + 1}`,
      ...idea,
      status: index === 0 ? 'ready' : 'backlog',
      confidence: idea.score >= 88 ? 'high' : 'medium',
    })),
  }
}

export function createContentBrief(workspace, activeIdea = 0, taskStatuses = {}) {
  const plan = createProductionPlan(workspace, activeIdea, taskStatuses)
  const idea = workspace.ideas[plan.selectedIdeaIndex] ?? workspace.ideas[0]
  return {
    id: `brief-${plan.selectedIdeaIndex + 1}`,
    idea,
    plan,
    productionChecklist: [
      'Record hook in first take before filming supporting shots',
      ...idea.shots,
      'Add captions before publishing',
      'Pin a comment asking for the next question',
    ],
    exportMarkdown: buildBriefExport(workspace, plan),
  }
}

export function createSprintBoard(workspace, taskStatuses = {}, activeIdea = 0) {
  const plan = createProductionPlan(workspace, activeIdea, taskStatuses)
  return {
    id: 'current-week',
    weekLabel: 'Current creator sprint',
    tasks: plan.tasks,
    metrics: plan.metrics,
    nextTask: plan.tasks.find((task) => task.status === 'next') || null,
  }
}

export function buildCalendar(workspace, sprintBoard) {
  const publishSlots = ['Monday 10:00', 'Tuesday 18:00', 'Wednesday 12:30', 'Thursday 19:00', 'Friday 11:00']
  return {
    timezone: 'local creator timezone',
    items: sprintBoard.tasks.map((task, index) => ({
      id: `calendar-${task.id}`,
      slot: publishSlots[index] || `Day ${index + 1}`,
      title: task.task,
      platform: workspace.brain.primaryPlatform,
      status: task.status,
      linkedTaskId: task.id,
      linkedIdeaId: `idea-${Math.min(index + 1, workspace.ideas.length)}`,
    })),
  }
}

export function buildBrandPipeline(workspace) {
  return {
    partners: workspace.deals.map((deal, index) => ({
      id: `brand-${index + 1}`,
      ...deal,
      stage: index === 0 ? 'ready_to_pitch' : 'research',
      outreachAngle: `${workspace.brain.creator} can frame ${deal.category} through ${workspace.brain.voiceTraits[0] || 'trusted creator'} content tied to ${workspace.brain.monetizationGoal}.`,
    })),
  }
}

export function buildAnalyticsSnapshot(workspace, importPayload = {}) {
  const views = Number(importPayload.views || 0)
  const saves = Number(importPayload.saves || 0)
  const shares = Number(importPayload.shares || 0)
  const saveRate = views > 0 ? `${((saves / views) * 100).toFixed(2)}%` : '0.00%'
  const shareRate = views > 0 ? `${((shares / views) * 100).toFixed(2)}%` : '0.00%'
  return {
    kpis: {
      views,
      saves,
      shares,
      saveRate,
      shareRate,
      ideaCount: workspace.ideas.length,
      highConfidenceIdeas: workspace.ideas.filter((idea) => idea.score >= 88).length,
    },
    recommendation: workspace.ideas[0]?.prediction || 'Generate a workspace to unlock recommendations.',
  }
}

export function buildCreatorSystem(workspace, options = {}) {
  const sprint = createSprintBoard(workspace, options.taskStatuses || {}, options.activeIdea || 0)
  return {
    apiCatalog: buildApiCatalog(),
    creator: buildCreatorProfile(workspace),
    integrations: buildIntegrationStatus(workspace),
    workspace,
    ideas: buildIdeaBank(workspace),
    activeBrief: createContentBrief(workspace, options.activeIdea || 0, options.taskStatuses || {}),
    sprint,
    calendar: buildCalendar(workspace, sprint),
    brands: buildBrandPipeline(workspace),
    analytics: buildAnalyticsSnapshot(workspace, options.analytics || {}),
  }
}

export function getProductDomain(domain, workspace, options = {}) {
  const system = buildCreatorSystem(workspace, options)
  if (domain === 'session') return { access: 'beta-key', authenticated: true }
  if (domain === 'creators') return system.creator
  if (domain === 'integrations') return system.integrations
  if (domain === 'workspaces') return system.workspace
  if (domain === 'ideas') return system.ideas
  if (domain === 'briefs') return system.activeBrief
  if (domain === 'sprints') return system.sprint
  if (domain === 'calendar') return system.calendar
  if (domain === 'brands') return system.brands
  if (domain === 'analytics') return system.analytics
  return system
}
