export type Platform = 'Instagram' | 'TikTok' | 'Both'

export type ProductionIdea = {
  tag: string
  title: string
  hook: string
  length: string
  score: number
  script: string[]
  shots: string[]
}

export type ProductionWorkspaceInput = {
  brain: {
    creator: string
    niche: string
    primaryPlatform: Platform
    positioning: string
  }
  ideas: ProductionIdea[]
  sprint: { day: string; focus: string; task: string }[]
}

export type SprintStatus = 'todo' | 'next' | 'done'

export type ProductionTask = {
  id: string
  day: string
  focus: string
  task: string
  status: SprintStatus
}

export type ProductionPlan = {
  selectedIdeaIndex: number
  selectedIdeaTitle: string
  tasks: ProductionTask[]
  metrics: {
    planned: number
    done: number
    progress: number
  }
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const calculateMetrics = (tasks: ProductionTask[]) => {
  const planned = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  return {
    planned,
    done,
    progress: planned === 0 ? 0 : Math.round((done / planned) * 100),
  }
}

const normalizeNextTask = (tasks: ProductionTask[]) => {
  let nextAssigned = false
  return tasks.map((task) => {
    if (task.status === 'done') return task
    if (!nextAssigned) {
      nextAssigned = true
      return { ...task, status: 'next' as const }
    }
    return { ...task, status: 'todo' as const }
  })
}

export function createProductionPlan(workspace: ProductionWorkspaceInput, selectedIdeaIndex: number): ProductionPlan {
  const selectedIdea = workspace.ideas[selectedIdeaIndex] ?? workspace.ideas[0]
  const tasks = normalizeNextTask(workspace.sprint.map((task, index) => ({
    id: `${slug(task.day)}-${slug(task.focus) || index + 1}`,
    day: task.day,
    focus: task.focus,
    task: task.task,
    status: 'todo' as const,
  })))

  return {
    selectedIdeaIndex: Math.max(0, Math.min(selectedIdeaIndex, workspace.ideas.length - 1)),
    selectedIdeaTitle: selectedIdea?.title ?? 'Untitled brief',
    tasks,
    metrics: calculateMetrics(tasks),
  }
}

export function updateSprintStatus(plan: ProductionPlan, taskId: string, status: SprintStatus): ProductionPlan {
  const tasks = normalizeNextTask(plan.tasks.map((task) => task.id === taskId ? { ...task, status } : task))
  return { ...plan, tasks, metrics: calculateMetrics(tasks) }
}

export function buildBriefExport(workspace: ProductionWorkspaceInput, plan: ProductionPlan) {
  const idea = workspace.ideas[plan.selectedIdeaIndex] ?? workspace.ideas[0]
  const taskLines = plan.tasks.map((task) => {
    const checkbox = task.status === 'done' ? '[x]' : '[ ]'
    return `- ${checkbox} ${task.day} · ${task.focus} — ${task.task}`
  }).join('\n')
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
