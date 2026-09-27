import type { Skill } from '../../data/demo'

export const CATS: Skill['cat'][] = ['Design', 'Planning', 'Security', 'Data', 'Agents', 'Language', 'Launch']

/** What concretely changes in a build when a skill of this kind is on. */
export const WHAT_CHANGES: Record<Skill['cat'], string[]> = {
  Design: [
    'I check every screen against your taste rules before you see it.',
    'Colours and fonts come from design.md, not my defaults.',
    'Anything off-brand gets flagged in red.',
  ],
  Planning: [
    'I ask 3 to 5 short questions before I plan.',
    'Every question has a “you decide” option.',
    'The blueprint lists everything I guessed.',
  ],
  Security: [
    'Every build ends with a check on who can see what.',
    'Keys go in the vault. Never in the code.',
    'Findings show up in Inspect, in plain words.',
  ],
  Data: [
    'The AI reads real records, not made-up ones.',
    'Access is read-only unless you say otherwise.',
    'Your login for that service stays in the vault.',
  ],
  Agents: [
    'Limits are enforced in code, outside the AI.',
    'Each agent gets test questions before launch.',
    'Every tool call shows up in the trace.',
  ],
  Language: [
    'Replies match the language the customer writes in.',
    'Your tone rules apply in every language.',
    'I test replies in each language before launch.',
  ],
  Launch: [
    'It runs before you press Launch.',
    'Missing pieces show up as a checklist.',
    'I write the first draft. You approve it.',
  ],
}

export function skillMd(s: Skill) {
  const rules = WHAT_CHANGES[s.cat]
  return `---
name: ${s.id}
description: ${s.what}
category: ${s.cat.toLowerCase()}
author: ${s.by}
---

# ${s.name}

## When to use
${s.why ? s.why : 'When the project touches ' + s.cat.toLowerCase() + '.'}

## Rules
${rules.map((r) => '- ' + r).join('\n')}
`
}
