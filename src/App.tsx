import { useState, type CSSProperties, type FormEvent } from 'react'
import {
  ArrowUpRight, BrainCircuit, CalendarDays, Check, ChevronRight, CircleCheck,
  Database, Heart, Menu, Radar, RotateCcw, Search, Sparkles, Target,
  TrendingUp, Users, WandSparkles, X, Zap,
} from 'lucide-react'

type Platform = 'Instagram' | 'TikTok' | 'Both'

type CreatorInputs = {
  handle: string
  niche: string
  platform: Platform
  competitors: string
  monetizationGoal: string
  brandCategories: string
  contentStyle: string
}

type VideoIdea = {
  tag: string
  title: string
  hook: string
  length: string
  score: number
  prediction: string
  script: string[]
  shots: string[]
}

type CreatorWorkspace = {
  createdAt: string
  brain: {
    creator: string
    niche: string
    primaryPlatform: Platform
    competitors: string[]
    monetizationGoal: string
    brandCategories: string[]
    contentStyle: string
    positioning: string
    contentPillars: string[]
    voiceTraits: string[]
  }
  trends: { name: string; lift: string; angle: string }[]
  competitors: { handle: string; growth: string; gap: string }[]
  ideas: VideoIdea[]
  audience: { need: string; share: number }[]
  deals: { brand: string; category: string; fit: number; concept: string }[]
  sprint: { day: string; focus: string; task: string }[]
}

const WORKSPACE_KEY = 'agentic.creator.workspace.v1'
const LEADS_KEY = 'agentic.creator.betaLeads.v1'

const blankInputs: CreatorInputs = {
  handle: '', niche: '', platform: 'Instagram', competitors: '', monetizationGoal: '', brandCategories: '', contentStyle: '',
}

const sampleInputs: CreatorInputs = {
  handle: '@amaraglow',
  niche: 'Beauty & skincare',
  platform: 'Both',
  competitors: '@niaglow, @mayaskinlab, @chloelab',
  monetizationGoal: '$10k/month through brand partnerships and digital guides',
  brandCategories: 'Clean skincare, SPF, wellness, beauty tools',
  contentStyle: 'Warm authority, honest reviews, quick visual demos',
}

const splitList = (value: string) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
const cleanHandle = (value: string) => value.trim().replace(/^@/, '')
const firstWords = (value: string, fallback: string) => splitList(value)[0] || fallback

function generateWorkspace(input: CreatorInputs): CreatorWorkspace {
  const handle = `@${cleanHandle(input.handle)}`
  const niche = input.niche.trim()
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
      gap: [`Beginner-first explainers`, `Transparent ${category} comparisons`, `Founder-style behind the scenes`, `Community response videos`][index],
    }))

  return {
    createdAt: new Date().toISOString(),
    brain: {
      creator: handle,
      niche,
      primaryPlatform: input.platform,
      competitors: competitorHandles,
      monetizationGoal: input.monetizationGoal.trim(),
      brandCategories: splitList(input.brandCategories),
      contentStyle: input.contentStyle.trim(),
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

function readWorkspace() {
  try {
    const saved = localStorage.getItem(WORKSPACE_KEY)
    return saved ? JSON.parse(saved) as CreatorWorkspace : null
  } catch {
    return null
  }
}

function readLeads() {
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]') as Record<string, string>[]
  } catch {
    return []
  }
}

const readLeadCount = () => readLeads().length

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [inputs, setInputs] = useState<CreatorInputs>(blankInputs)
  const [workspace, setWorkspace] = useState<CreatorWorkspace | null>(readWorkspace)
  const [activeIdea, setActiveIdea] = useState(0)
  const [shotListOpen, setShotListOpen] = useState(false)
  const [applicationSent, setApplicationSent] = useState(false)
  const [applicationError, setApplicationError] = useState('')
  const [applicationDuplicate, setApplicationDuplicate] = useState(false)
  const [applicationSubmitting, setApplicationSubmitting] = useState(false)
  const [leadCount, setLeadCount] = useState(readLeadCount)

  const updateInput = (field: keyof CreatorInputs, value: string) => setInputs((current) => ({ ...current, [field]: value }))

  const createBrain = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const next = generateWorkspace(inputs)
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(next))
    setWorkspace(next)
    setActiveIdea(0)
    setShotListOpen(false)
    requestAnimationFrame(() => document.getElementById('intelligence')?.scrollIntoView({ behavior: 'smooth' }))
  }

  const loadSample = () => {
    const next = generateWorkspace(sampleInputs)
    setInputs(sampleInputs)
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(next))
    setWorkspace(next)
    setActiveIdea(0)
  }

  const resetWorkspace = () => {
    localStorage.removeItem(WORKSPACE_KEY)
    setInputs(blankInputs)
    setWorkspace(null)
    setActiveIdea(0)
    setShotListOpen(false)
  }

  const submitApplication = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setApplicationError('')
    setApplicationSubmitting(true)
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const lead = {
      name: String(form.get('name') || ''),
      handle: String(form.get('handle') || ''),
      email: String(form.get('email') || ''),
      niche: String(form.get('niche') || ''),
      platform: String(form.get('platform') || 'Instagram/TikTok'),
      submittedAt: new Date().toISOString(),
    }

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      })
      const result = await response.json() as { ok?: boolean; duplicate?: boolean; error?: string }

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Could not save application')
      }

      setApplicationDuplicate(Boolean(result.duplicate))
    } catch (error) {
      setApplicationError(error instanceof Error ? error.message : 'Could not save application')
      setApplicationSubmitting(false)
      return
    }

    const leads = readLeads()
    leads.push(lead)
    localStorage.setItem(LEADS_KEY, JSON.stringify(leads))
    setLeadCount(leads.length)
    setApplicationSent(true)
    setApplicationSubmitting(false)
    formElement.reset()
  }

  const idea = workspace?.ideas[activeIdea]

  return (
    <div className="app-shell">
      <header className="nav">
        <a className="brand" href="#top" aria-label="Northstar Studio home"><span className="brand-mark"><Sparkles size={14} /></span><span>Northstar<span className="brand-muted"> Studio</span></span></a>
        <nav id="main-navigation" className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          <a href="#workspace" onClick={() => setMenuOpen(false)}>Workspace</a><a href="#intelligence" onClick={() => setMenuOpen(false)}>Intelligence</a><a href="#planner" onClick={() => setMenuOpen(false)}>Planner</a><a href="#beta" onClick={() => setMenuOpen(false)}>Beta</a>
        </nav>
        <a className="nav-cta" href="#workspace">Open workspace <ArrowUpRight size={15} /></a>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="main-navigation">{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <main id="top">
        <section className="hero section-pad">
          <div className="hero-grid"></div>
          <div className="hero-copy reveal">
            <div className="eyebrow"><span className="pulse"></span> Northstar Studio</div>
            <h1>The creator workspace for what to film next.</h1>
            <p className="hero-sub">Turn your niche, audience, competitors, and goals into a focused weekly content plan — with briefs your creator can actually shoot.</p>
            <div className="hero-actions"><a className="button primary" href="#workspace">Build my workspace <ArrowUpRight size={18} /></a><a className="button text-button" href="#intelligence"><span className="play">▶</span> See the output</a></div>
            <div className="social-proof"><p><strong>Private beta</strong> · for Instagram and TikTok creators</p></div>
          </div>
          <div className="hero-console reveal delay">
            <div className="console-head"><div><span className="status-dot"></span> CREATOR WORKSPACE / {workspace ? 'READY' : 'SETUP'}</div><span>PRIVATE BETA</span></div>
            <div className="profile-row"><div className="profile-art">{workspace ? cleanHandle(workspace.brain.creator).slice(0, 2).toUpperCase() : 'YOU'}<span className="online"></span></div><div><h3>{workspace?.brain.creator || 'Your creator brain'}</h3><p>{workspace?.brain.niche || 'Ready for onboarding'}</p></div><div className="growth"><span>IDEAS READY</span><strong>{workspace?.ideas.length || 0}</strong></div></div>
            <div className="mission-card"><div className="mini-label"><Target size={14} /> TODAY’S HIGHEST-LEVERAGE MOVE</div><p>{workspace ? workspace.sprint[0].task : 'Complete the seven-field onboarding to generate your strategy workspace.'}</p><button onClick={() => document.getElementById(workspace ? 'planner' : 'workspace')?.scrollIntoView({ behavior: 'smooth' })}>{workspace ? 'Open briefs' : 'Start setup'} <ChevronRight size={15} /></button></div>
            <div className="metric-row"><div><span>TRENDS</span><strong>{workspace?.trends.length || '—'}</strong><small>scouted</small></div><div><span>IDEAS</span><strong>{workspace?.ideas.length || '—'}</strong><small>scored</small></div><div><span>DEAL FITS</span><strong>{workspace?.deals.length || '—'}</strong><small>matched</small></div></div>
            <div className="signal-strip"><Database size={15} /><span>Privacy</span> {workspace ? 'Workspace saved on this device.' : 'Your workspace stays private on this device.'}</div>
          </div>
        </section>

        <section className="scroll-stop section-pad" aria-label="Northstar Studio product preview">
          <div className="scroll-copy">
            <p className="kicker">GET THE WEEK IN FOCUS</p>
            <h2>From scattered ideas to a shoot-ready plan.</h2>
            <p>Northstar Studio gives creators the management layer they usually cannot hire yet: positioning, trend direction, production briefs, and a weekly sprint.</p>
          </div>
          <div className="studio-stage signal-theatre" aria-hidden="true">
            <div className="theatre-glow"></div>
            <div className="orbit-line orbit-a"></div>
            <div className="orbit-line orbit-b"></div>
            <div className="signal-core"><span>NS</span><strong>Creator week</strong><small>10 briefs · 3 signals · 5-day sprint</small></div>
            <div className="signal-card card-trend"><small>TREND</small><strong>Beauty reset</strong><span>+218%</span></div>
            <div className="signal-card card-brief"><small>BRIEF</small><strong>Hook + shot list</strong><span>93</span></div>
            <div className="signal-card card-brand"><small>BRAND FIT</small><strong>SPF Collective</strong><span>89%</span></div>
          </div>
        </section>

        <section className="onboarding section-pad" id="workspace">
          <div className="workspace-intro"><div><p className="kicker">00 / CREATOR ONBOARDING</p><h2>Give Northstar<br />your point of view.</h2></div><div><p>Seven inputs become a starter strategy workspace—no account, API key, or backend required.</p><div className="workspace-actions"><button className="button outline" type="button" onClick={loadSample}><Sparkles size={16} /> Load sample</button><button className="button ghost" type="button" onClick={resetWorkspace}><RotateCcw size={15} /> Reset</button></div></div></div>
          <form className="creator-form" onSubmit={createBrain}>
            <label><span>Creator handle</span><input value={inputs.handle} onChange={(e) => updateInput('handle', e.target.value)} placeholder="@yourhandle" required /></label>
            <label><span>Niche</span><input value={inputs.niche} onChange={(e) => updateInput('niche', e.target.value)} placeholder="Beauty & skincare" required /></label>
            <label><span>Primary platform</span><select value={inputs.platform} onChange={(e) => updateInput('platform', e.target.value)}><option>Instagram</option><option>TikTok</option><option>Both</option></select></label>
            <label className="span-two"><span>Competitor handles</span><textarea value={inputs.competitors} onChange={(e) => updateInput('competitors', e.target.value)} placeholder="@creatorone, @creatortwo" required /></label>
            <label><span>Monetization goal</span><input value={inputs.monetizationGoal} onChange={(e) => updateInput('monetizationGoal', e.target.value)} placeholder="$10k/month from brand deals" required /></label>
            <label><span>Brand categories</span><input value={inputs.brandCategories} onChange={(e) => updateInput('brandCategories', e.target.value)} placeholder="Skincare, wellness, beauty tech" required /></label>
            <label className="span-two"><span>Content style</span><textarea value={inputs.contentStyle} onChange={(e) => updateInput('contentStyle', e.target.value)} placeholder="Warm authority, quick demos, honest reviews" required /></label>
            <div className="form-submit span-two"><span><Database size={14} /> Saved privately on this device</span><button className="button primary" type="submit">Generate creator workspace <ArrowUpRight size={18} /></button></div>
          </form>
        </section>

        {!workspace ? <section className="empty-state section-pad"><BrainCircuit /><p className="kicker">WORKSPACE WAITING</p><h2>Your strategy workspace will appear here.</h2><p>Complete onboarding or load the sample creator to unlock the product preview.</p><button className="button primary" onClick={loadSample}>Explore with sample data <ArrowUpRight size={17} /></button></section> : <>
          <section className="intelligence section-pad" id="intelligence">
            <div className="section-heading"><div><p className="kicker">01 / CREATOR PROFILE</p><h2>Your positioning,<br />turned into direction.</h2></div><p>A customer-facing strategy card that shows what Northstar understands about the creator—without exposing internal system data.</p></div>
            <div className="brain-grid output-brain-grid">
              <article className="panel creator-profile-card"><div className="panel-title"><BrainCircuit size={19} /><span>CREATOR STRATEGY PROFILE</span><small>READY</small></div><div className="profile-hero"><div className="profile-orb"><span>{cleanHandle(workspace.brain.creator).slice(0, 2).toUpperCase()}</span></div><div><small>CREATOR</small><h3>{workspace.brain.creator}</h3><p>{workspace.brain.niche}</p></div></div><div className="profile-positioning"><span>POSITIONING</span><p>{workspace.brain.positioning}</p></div><div className="profile-chip-grid"><div><small>PLATFORM</small><strong>{workspace.brain.primaryPlatform}</strong></div><div><small>GOAL</small><strong>{workspace.brain.monetizationGoal}</strong></div></div><div className="profile-list"><span>CONTENT PILLARS</span>{workspace.brain.contentPillars.map((pillar) => <strong key={pillar}>{pillar}</strong>)}</div><div className="profile-list voice"><span>VOICE</span>{workspace.brain.voiceTraits.map((trait) => <strong key={trait}>{trait}</strong>)}</div></article>
              <article className="panel trend-card"><div className="panel-title"><TrendingUp size={19} /><span>TREND SCOUT</span><small>BETA SIGNALS</small></div><h3>Signals worth your attention</h3><div className="trend-list">{workspace.trends.map((trend, index) => <div className="trend-item" key={trend.name}><span className="rank">0{index + 1}</span><div className="trend-copy"><strong>{trend.name}</strong><small>{trend.angle}</small></div><div className="sparkbars" aria-hidden="true">{[30, 50, 44, 72, 60, 88, 100].map((value, i) => <i key={i} style={{ height: `${value}%` }}></i>)}</div><b>{trend.lift}</b></div>)}</div><div className="trend-note"><Zap size={14} /> Suggested move window: <strong>24–48 hours</strong></div></article>
            </div>
          </section>

          <section className="radar section-pad"><div className="section-heading compact"><div><p className="kicker">02 / COMPETITOR RADAR</p><h2>Know the field.<br />Own the gap.</h2></div><p>Opportunity analysis based on the handles you supplied.</p></div><div className="competitor-grid">{workspace.competitors.map((person, index) => <article className="competitor" key={person.handle}><span className="index">0{index + 1}</span><div className="competitor-avatar">{cleanHandle(person.handle).slice(0, 2).toUpperCase()}</div><div><h3>{person.handle}</h3><p>{workspace.brain.niche}</p></div><div className="growth-cell"><small>30D GROWTH SIGNAL</small><strong>{person.growth}</strong></div><div className="gap"><Search size={14} /><span>Content gap</span><strong>{person.gap}</strong></div></article>)}</div></section>

          <section className="planner section-pad" id="planner"><div className="section-heading light"><div><p className="kicker">03 / VIDEO PLANNER</p><h2>From idea<br />to shoot plan.</h2></div><p>Choose a direction. Northstar gives the opening hook, the beats to film, the shot list, and a simple confidence signal.</p></div><div className="planner-layout"><div className="idea-tabs" role="tablist" aria-label="Generated video ideas">{workspace.ideas.map((item, index) => <button key={item.title} id={`idea-tab-${index}`} className={activeIdea === index ? 'idea-tab active' : 'idea-tab'} onClick={() => { setActiveIdea(index); setShotListOpen(false) }} role="tab" aria-selected={activeIdea === index} aria-controls="creative-brief"><span>IDEA {String(index + 1).padStart(2, '0')}</span><strong>{item.title}</strong><small>{item.tag} · {item.length}</small><ChevronRight /></button>)}</div>{idea && <><article className="script-card" id="creative-brief" role="tabpanel" aria-labelledby={`idea-tab-${activeIdea}`}><div className="script-head"><span><WandSparkles size={16} /> GENERATED CREATIVE BRIEF</span><span className="platform">{workspace.brain.primaryPlatform.toUpperCase()}</span></div><div className="script-content"><span className="content-tag">{idea.tag}</span><h3>{idea.title}</h3><div className="hook"><small>OPENING HOOK</small><blockquote>{idea.hook}</blockquote></div><div className="beats">{idea.script.map((beat, index) => <div key={beat}><span>0{index + 1}</span><p>{beat}</p></div>)}</div><button className="button dark" onClick={() => setShotListOpen(!shotListOpen)} aria-expanded={shotListOpen}>View full shot list <ArrowUpRight size={17} /></button>{shotListOpen && <div className="detail-panel shot-list"><div className="detail-heading"><span>FULL SHOT LIST</span><strong>{idea.length}</strong></div>{idea.shots.map((shot, index) => <div className="shot" key={shot}><span>0{index + 1}</span><div><strong>{shot}</strong></div></div>)}</div>}</div></article><article className="score-card"><div className="score-head"><Target size={18} /><span>PERFORMANCE PREDICTOR</span></div><div className="score-ring" style={{ '--score': idea.score } as CSSProperties}><strong>{idea.score}</strong><span>/ 100</span></div><h3>{idea.score >= 88 ? 'High breakout potential' : 'Strong format fit'}</h3><p>{idea.prediction}</p><div className="score-bars"><div><span>Hook strength</span><i><b style={{ width: `${idea.score + 2}%` }}></b></i><strong>{idea.score + 2}</strong></div><div><span>Audience fit</span><i><b style={{ width: `${idea.score}%` }}></b></i><strong>{idea.score}</strong></div><div><span>Trend timing</span><i><b style={{ width: `${idea.score - 4}%` }}></b></i><strong>{idea.score - 4}</strong></div></div></article></>}</div></section>

          <section className="audience section-pad"><div className="section-heading compact"><div><p className="kicker">04 / AUDIENCE INTELLIGENCE</p><h2>Turn attention into<br />useful direction.</h2></div><p>Audience needs derived from the creator’s niche, positioning, and monetization goal.</p></div><div className="audience-grid"><article className="panel conversation-card"><div className="panel-title"><Users size={18} /><span>AUDIENCE NEED MAP</span><small>BETA MODEL</small></div><h3>Your audience is asking for…</h3>{workspace.audience.map((item) => <div className="need" key={item.need}><span>{item.need}</span><div><i style={{ width: `${item.share}%` }}></i></div><strong>{item.share}%</strong></div>)}</article><article className="panel quote-card"><span className="quote-mark">“</span><blockquote>{workspace.brain.positioning}</blockquote><div className="quote-meta"><div className="tiny-avatar">NS</div><span>Strategic opportunity<br /><strong>{workspace.brain.contentPillars[0]}</strong></span></div><div className="sentiment"><span>VOICE MATCH</span><strong>91%</strong><small>based on onboarding inputs</small></div></article></div></section>

          <section className="deals section-pad" id="deals"><div className="deals-copy"><p className="kicker">05 / BRAND FIT</p><h2>Partners that fit<br /><em>the business goal.</em></h2><p>Suggestions use your selected categories and content style to create partnership angles.</p><ul><li><CircleCheck /> Brand-fit scoring</li><li><CircleCheck /> Campaign concept</li><li><CircleCheck /> Goal alignment</li></ul></div><div className="deal-list">{workspace.deals.length ? workspace.deals.map((deal) => <article className="deal-card compact-deal" key={deal.brand}><div className="deal-head"><span>SUGGESTED PARTNER</span><small>BETA MATCH</small></div><div className="brand-row"><div className="brand-logo">{deal.brand[0]}</div><div><h3>{deal.brand}</h3><p>{deal.category}</p></div><span className="fit">{deal.fit}% FIT</span></div><div className="agent-rec"><div><Sparkles size={16} /><span>CAMPAIGN ANGLE</span></div><p>{deal.concept}</p></div></article>) : <article className="deal-card compact-deal"><div className="brand-row"><p>Add brand categories in onboarding to generate deal suggestions.</p></div></article>}</div></section>

          <section className="workflow section-pad"><div className="section-heading compact"><div><p className="kicker">06 / WEEKLY SPRINT</p><h2>A week built around<br />your creator brain.</h2></div><p>A Monday–Friday execution plan generated from your niche, platform, style, and monetization goal.</p></div><div className="week-grid">{workspace.sprint.map((day, index) => <article key={day.day} className={index === 0 ? 'day active' : 'day'}><span>{day.day}</span><div className="day-icon">{index === 0 ? <Radar /> : index === 1 ? <WandSparkles /> : index === 2 ? <CalendarDays /> : index === 3 ? <Heart /> : <TrendingUp />}</div><h3>{day.focus}</h3><p>{day.task}</p>{index === 0 && <small>START HERE</small>}</article>)}</div></section>
        </>}

        <section className="beta" id="beta"><div className="beta-glow"></div><p className="kicker">PRIVATE BETA / 4-WEEK SPRINT</p><h2>Your next level isn’t<br />more hustle. <em>It’s leverage.</em></h2><p>Join a small cohort of Instagram/TikTok creators testing Northstar Studio. Applications now save to the real waitlist database.</p>{applicationSent ? <div className="success" role="status"><Check /> {applicationDuplicate ? 'You’re already on the waitlist.' : `Application saved. You’re local lead #${leadCount}.`}</div> : <form className="beta-form" onSubmit={submitApplication}><div className="form-grid"><label><span>Name</span><input name="name" type="text" autoComplete="name" placeholder="Amara Singh" required /></label><label><span>Creator handle</span><input name="handle" type="text" autoComplete="username" placeholder="@amaraglow" /></label><label><span>Email</span><input name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></label><label><span>Content niche</span><input name="niche" type="text" placeholder="Beauty & skincare" required /></label><label className="span-two"><span>Primary platform</span><select name="platform" defaultValue="Instagram/TikTok"><option>Instagram</option><option>TikTok</option><option>Instagram/TikTok</option><option>YouTube Shorts</option></select></label></div>{applicationError && <div className="form-error" role="alert">{applicationError}</div>}<button className="button primary beta-button" type="submit" disabled={applicationSubmitting}>{applicationSubmitting ? 'Saving…' : 'Join the beta waitlist'} <ArrowUpRight size={18} /></button></form>}<div className="beta-details"><span>✓ No credit card</span><span>✓ Saved to Supabase waitlist</span><span className="lead-count">{leadCount} local {leadCount === 1 ? 'submission' : 'submissions'}</span></div></section>
      </main>
      <footer><a className="brand" href="#top"><span className="brand-mark"><Sparkles size={14} /></span><span>Northstar<span className="brand-muted"> Studio</span></span></a><p>Built for creators who think like founders.</p><span>© 2026 NORTHSTAR STUDIO</span></footer>
    </div>
  )
}

export default App
