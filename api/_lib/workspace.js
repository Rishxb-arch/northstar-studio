import { clean } from './http.js'

export const splitList = (value) => clean(value, 1200).split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
export const cleanHandle = (value) => clean(value, 80).replace(/^@/, '')
const firstWords = (value, fallback) => splitList(value)[0] || fallback
const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const normalizeInputs = (payload = {}) => {
  const platform = ['Instagram', 'TikTok', 'Both'].includes(payload.platform) ? payload.platform : 'Instagram'
  return {
    handle: clean(payload.handle, 80),
    niche: clean(payload.niche, 120),
    platform,
    competitors: clean(payload.competitors, 500),
    monetizationGoal: clean(payload.monetizationGoal, 180),
    brandCategories: clean(payload.brandCategories, 280),
    contentStyle: clean(payload.contentStyle, 220),
  }
}

export const validateInputs = (input) => {
  const missing = []
  if (!cleanHandle(input.handle)) missing.push('handle')
  if (!input.niche) missing.push('niche')
  if (!input.competitors) missing.push('competitors')
  if (!input.monetizationGoal) missing.push('monetizationGoal')
  if (!input.brandCategories) missing.push('brandCategories')
  if (!input.contentStyle) missing.push('contentStyle')
  return missing
}

export function generateWorkspace(inputPayload) {
  const input = normalizeInputs(inputPayload)
  const handle = `@${cleanHandle(input.handle)}`
  const niche = input.niche
  const category = firstWords(input.brandCategories, niche)
  const style = firstWords(input.contentStyle, 'clear, story-led education')
  const competitorHandles = splitList(input.competitors).map((item) => `@${cleanHandle(item)}`)
  const topic = niche.toLowerCase()
  const ideaSeeds = [
    ['EDUCATION', `3 ${topic} mistakes nobody warns you about`, `“If your ${topic} routine is not working, check this first.”`],
    ['STORY', `I changed one ${topic} habit for 14 days`, '“I genuinely did not expect this result…”'],
    ['TREND', `The ${topic} trend worth trying—and the one to skip`, '“One is smart. One is pure hype.”'],
    ['MYTH', `The biggest ${topic} myth I used to believe`, '“I wasted months doing this completely wrong.”'],
    ['ROUTINE', `My no-fluff ${topic} routine for busy days`, '“You only need these three steps.”'],
    ['REVIEW', `${category}: the honest 30-second verdict`, '“Would I spend my own money on this again?”'],
    ['POV', `POV: you finally understand ${topic}`, '“Save this before your next reset.”'],
    ['LIST', `5 ${topic} upgrades under $25`, '“Number four is criminally underrated.”'],
    ['BEHIND THE SCENES', `How I actually plan a week of ${topic} content`, '“This is the system behind every post.”'],
    ['COMMUNITY', `I answered your most controversial ${topic} question`, '“The comments were split, so let’s settle it.”'],
  ]

  const ideas = ideaSeeds.map(([tag, title, hook], index) => {
    const score = 93 - ((index * 4) % 17)
    return {
      tag,
      title,
      hook,
      length: `${19 + (index % 4) * 4} sec`,
      score,
      prediction: `${score >= 88 ? 'High' : 'Strong'} potential: the ${style.toLowerCase()} delivery matches ${handle}’s positioning and gives viewers a clear reason to save or share.`,
      script: [
        `0–3s · Deliver the hook direct to camera with a bold ${topic} visual.`,
        `4–15s · Show three fast proof points in a ${style.toLowerCase()} voice.`,
        'Final beat · Land the takeaway and ask viewers to save or comment.',
      ],
      shots: [
        'Tight direct-to-camera opener with on-screen hook text',
        `Two macro or screen-recorded proof shots about ${topic}`,
        'Fast cutaway comparison with captions',
        'Clean medium-shot recap and single CTA',
      ],
    }
  })

  const competitors = (competitorHandles.length ? competitorHandles : ['@categoryleader', '@fastgrower', '@nicheexpert']).slice(0, 4)
    .map((competitor, index) => ({
      handle: competitor,
      growth: `+${14 - index * 2}.${index + 2}%`,
      gap: ['Beginner-first explainers', `Transparent ${category} comparisons`, 'Founder-style behind the scenes', 'Community response videos'][index],
    }))

  return {
    createdAt: new Date().toISOString(),
    brain: {
      creator: handle,
      niche,
      primaryPlatform: input.platform,
      competitors: competitorHandles,
      monetizationGoal: input.monetizationGoal,
      brandCategories: splitList(input.brandCategories),
      contentStyle: input.contentStyle,
      positioning: `${handle} makes ${niche.toLowerCase()} feel useful, credible, and immediately actionable.`,
      contentPillars: [`${niche} education`, 'Honest tests & reviews', 'Personal systems', 'Audience Q&A'],
      voiceTraits: splitList(input.contentStyle).slice(0, 4),
    },
    trends: [
      { name: `${niche} “what I’d do differently”`, lift: '+218%', angle: 'Contrarian education' },
      { name: `Three-step ${niche.toLowerCase()} resets`, lift: '+164%', angle: 'Saveable routine' },
      { name: `${category} honest scorecards`, lift: '+97%', angle: 'Proof-led review' },
    ],
    competitors,
    ideas,
    audience: [
      { need: `Simple ${niche.toLowerCase()} routines`, share: 34 },
      { need: 'Honest product guidance', share: 27 },
      { need: 'Affordable alternatives', share: 22 },
      { need: 'Clear beginner explanations', share: 17 },
    ],
    deals: splitList(input.brandCategories).slice(0, 3).map((item, index) => ({
      brand: [`Northstar ${item}`, `${item} Collective`, `Studio ${item}`][index],
      category: item,
      fit: 94 - index * 5,
      concept: `A ${style.toLowerCase()} ${input.platform === 'Both' ? 'cross-platform series' : input.platform + ' series'} tied to ${input.monetizationGoal.toLowerCase()}.`,
    })),
    sprint: [
      { day: 'MON', focus: 'Scout', task: `Validate 3 rising ${niche.toLowerCase()} angles` },
      { day: 'TUE', focus: 'Script', task: `Batch hooks for ideas 1–5 in your ${style.toLowerCase()} voice` },
      { day: 'WED', focus: 'Create', task: `Film ideas 1, 2, and 4 for ${input.platform}` },
      { day: 'THU', focus: 'Publish', task: 'Post the highest-scoring concept and work the comments' },
      { day: 'FRI', focus: 'Optimize', task: `Review retention and package one ${category} pitch` },
    ],
  }
}

const calculateMetrics = (tasks) => {
  const planned = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  return { planned, done, progress: planned === 0 ? 0 : Math.round((done / planned) * 100) }
}

const normalizeNextTask = (tasks) => {
  let nextAssigned = false
  return tasks.map((task) => {
    if (task.status === 'done') return task
    if (!nextAssigned) {
      nextAssigned = true
      return { ...task, status: 'next' }
    }
    return { ...task, status: 'todo' }
  })
}

export function createProductionPlan(workspace, selectedIdeaIndex = 0, statuses = {}) {
  const boundedIndex = Math.max(0, Math.min(Number(selectedIdeaIndex) || 0, workspace.ideas.length - 1))
  const selectedIdea = workspace.ideas[boundedIndex] ?? workspace.ideas[0]
  const tasks = normalizeNextTask(workspace.sprint.map((task, index) => ({
    id: `${slug(task.day)}-${slug(task.focus) || index + 1}`,
    day: task.day,
    focus: task.focus,
    task: task.task,
    status: ['todo', 'next', 'done'].includes(statuses[`${slug(task.day)}-${slug(task.focus) || index + 1}`]) ? statuses[`${slug(task.day)}-${slug(task.focus) || index + 1}`] : 'todo',
  })))
  return { selectedIdeaIndex: boundedIndex, selectedIdeaTitle: selectedIdea?.title ?? 'Untitled brief', tasks, metrics: calculateMetrics(tasks) }
}

export function buildBriefExport(workspace, plan) {
  const idea = workspace.ideas[plan.selectedIdeaIndex] ?? workspace.ideas[0]
  const taskLines = plan.tasks.map((task) => `- ${task.status === 'done' ? '[x]' : '[ ]'} ${task.day} · ${task.focus} — ${task.task}`).join('\n')
  const scriptLines = idea.script.map((line) => `- ${line}`).join('\n')
  const shotLines = idea.shots.map((line) => `- ${line}`).join('\n')
  return `# ${workspace.brain.creator} — ${idea.title}

Platform: ${workspace.brain.primaryPlatform}
Niche: ${workspace.brain.niche}
Score: ${idea.score}/100
Length: ${idea.length}

## Opening hook
${idea.hook}

## Script beats
${scriptLines}

## Shot list
${shotLines}

## Production sprint
${taskLines}
`
}
