# Architect 2.0 — handoff for the next agent

You're picking up a take-home assignment that is mostly built and already live. Read this whole file before you change anything. It has the assignment, the current state, whose ideas are whose, the research, the code map, and the rules the owner cares about.

- **Owner:** Ritika Das (GitHub `ritikadas98`). Everything here is hers.
- **Live:** https://ritikadas.in/architect/
- **Code:** https://github.com/ritikadas98/architect-2.0
- **Architecture write-up:** `docs/ARCHITECTURE.md`, with the diagram at `docs/architecture.png`
- **Product discovery (in progress, one step at a time with Ritika):** `docs/DISCOVERY.md`. In every step, argue with her using researched facts, and never agree by default. She asked for this explicitly.
- **Started:** 2026-09-28. Self-set deadline: 24 hours, so about 2026-09-29.

---

## 0. Rules. Read these first.

1. **Commits are Ritika's only.** Set the repo-local `user.name "Ritika Das"` and `user.email "168818346+ritikadas98@users.noreply.github.com"`. **No `Co-Authored-By` trailers, and no AI or tool attribution in commit messages or PR bodies.** She asked for this explicitly, and it overrides any default attribution behaviour your tool has.
2. **Push as `ritikadas98`.** The machine this was built on had a global git config that rewrites https to ssh, and another GitHub account was active there. Push with:
   ```bash
   export GH_TOKEN=$(gh auth token --user ritikadas98)
   GIT_CONFIG_GLOBAL=/dev/null git -c credential.helper='!gh auth git-credential' push https://github.com/ritikadas98/architect-2.0.git main
   ```
   A "permission denied to <someone else>" error means the wrong account was used. It does not mean access was revoked.
3. **Publishing is a separate step.** The live site isn't deployed from this repo. See section 7. After any change the reviewer should see, run `./scripts/publish.sh`.
4. **Ritika is not an engineer.** She was a tech consultant: she understands context when it's explained, but doesn't read code line by line. Explain consequences in plain words, not mechanisms. She makes the decisions.
5. **Design calls are yours; words about her are hers.** She has handed over layout, spacing, type and colour decisions: make the call and tell her what you did in one line. Anything that speaks *as her* or makes claims about her needs her approval before it goes public. That covers the README intro, the form answers, and anything like "I built…".
6. **Be honest in the product.** The prototype says openly that its flows are scripted on one sample project. Keep it that way. The graders will click everything.

---

## 1. The assignment, in full

Source: https://hiring.lyzrarchitect.space/ (Lyzr, role: **Technical Product Manager, Architect**). The title is "Build your own vibe-coding platform". It's one assignment, and shortlisted candidates go straight to an interview.

**Start here:** study architect.new, the platform whose next version you're building.

**1. Explore.** Study architect.new, Replit, Lovable, Emergent, Vercel v0, Rocket.new, Cursor, Codex, Claude Code, "or any other coding agent / vibe-coding platform". Understand every feature of each one:
- what makes it different
- why people use it
- its features
- its UI, UX and user flows

**2. Build Architect 2.0.** It's a vibe-coding platform for both technical and non-technical users, where a user can:
- build an entire agentic application just by prompting
- import an existing project and keep working on it
- build agents in any framework
- connect GitHub
- deploy
- "…and anything else you think it needs"

Keep in mind:
- It should have every feature of the current Architect. Today's Architect only caters to non-technical folks, and the new one must also serve developers.
- Focus on UI/UX and the flow of the entire app, from authentication to deployment.
- Features don't need to work. Dummy flows are fine.
- Making basic things work, like auth and a database, is a plus.

**3. Technical architecture.** Research how a platform like architect.new works under the hood, then design how you'd build Architect 2.0 for real. Cover:
- sandboxes: what you'd use and why
- the agent harness: planning, writing code, running tools, recovering from errors
- being model-agnostic: switching between Claude, GPT, Gemini and open-source without breaking anything
- how the frontend talks to the sandbox and backend, including the live preview
- where the proxy sits and what it does
- GitHub integration
- deploying user apps, and deploying Architect 2.0 itself in the cloud
- scaling to thousands of concurrent users

What to share:
- a detailed architecture diagram
- a description of each service, why you picked it, and how it handles the points above
- a detailed .md file explaining the decisions and the diagram

Upload both, and add them to the GitHub repo.

**4. Ship.** Deploy it, and submit the live URL, the GitHub repo, the diagram and the .md.

**How it's judged, in order of importance:**
1. **Technical architecture. MOST IMPORTANT.** A detailed diagram, and sensible choices for sandboxes, harness, model-agnosticism, proxy, GitHub, deployment and scaling, with reasoning. "Don't just list services: explain how the pieces talk to each other, and walk us through what happens from the moment a user types a prompt to their app running live."
2. **Design, UI/UX and flows. MOST IMPORTANT.** Product sense, button placement, pages and sections, layout, how each step leads to the next. "Think from first principles. Don't copy the current Architect's UI/UX, or any other platform's."
3. **Feature coverage. HIGH.** Authentication, homepage, chat window, app preview, agent section, UI getting built, GitHub integration, deploying the app, "+ anything else". "Don't stop at this list": think about what technical and non-technical users each need.
4. **Working functionality. PLUS POINTS.** Not required. A database or Google sign-in earns extra points.

**The submission form asks for:**
- **About you:** full name, email, LinkedIn, résumé (PDF, max 4 MB)
- **Project:** deployed URL, public GitHub repo, architecture diagram (max 25 MB), architecture .md (max 5 MB)
- **Written answers:** "Why would a non-technical user pick your platform?" and "Why would a technical user pick your platform?"
- **Self-ratings from 1 to 5:** client work, codebase understanding, GTM/marketing strategy, and work-life balance importance
- **Other:** formal software engineering experience (Yes/No), and expected CTC (LPA)

---

## 2. Where things stand

**Done and live:**
- all 13 screens and every flow (section 5)
- the architecture diagram and write-up, also shown in-app at `/#/architecture`
- the README
- the database schema
- the publish script
- a CI build check

**Résumé:** fixed by Ritika on 2026-09-28. She removed the stray ", ." from the first CorpAsia bullet. Upload her own PDF. The résumé in the portfolio repo is an older version, so leave it alone.

**Still open**, in this order:

1. **Supabase: real sign-in and a real database. APPROVED by Ritika on 2026-09-28, in progress.**

   The code is ready and needs no changes:
   - `src/lib/supabase.ts`: the client, PKCE flow, redirect back to the app root
   - `src/lib/store.tsx`: mirrors the session into the store and syncs `projects`
   - `supabase/schema.sql`: the table, plus row-level security so each user sees only their own rows
   - `src/pages/Login.tsx`: Google, GitHub and email magic-link buttons, which fall back to demo mode when there are no keys

   Guide her one step at a time. She clicks; you explain what each step is for in one plain line.
   - [ ] **Step 1. Create the project (waiting on her).** At supabase.com: New project, name `architect-2`, region Mumbai (ap-south-1). She sends the **Project URL** and the **anon / publishable key**. Both are public by design. Never ask for the `service_role` or secret key.
   - [ ] **Step 2. The table.** She pastes `supabase/schema.sql` into the SQL editor and runs it. Confirm that the `projects` table exists with RLS on.
   - [ ] **Step 3. Redirect URLs.** Under Authentication → URL Configuration:
     - Site URL: `https://ritikadas.in/architect/`
     - Additional redirect URL: `http://localhost:5173/architect/`
   - [ ] **Step 4. GitHub sign-in.** On GitHub, go to Settings → Developer settings → OAuth Apps → New.
     - Homepage: `https://ritikadas.in/architect/`
     - Callback: `https://<project-ref>.supabase.co/auth/v1/callback`

     Paste the Client ID and secret into Supabase under Authentication → Providers → GitHub.
   - [ ] **Step 5. Google sign-in.** In Google Cloud Console:
     - create a project
     - fill in the OAuth consent screen (External; app name "Architect 2.0"; her email)
     - create Credentials → OAuth client ID (Web), with authorised JavaScript origin `https://ritikadas.in` and redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`

     Paste the ID and secret into Supabase under Providers → Google. The consent screen can stay in "Testing" if she adds test users, but publish it if reviewers must sign in with any Google account.
   - [ ] **Step 6. Email link.** It's on by default in Supabase. Just check it's enabled.
   - [ ] **Step 7. Keys into the build.** Put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`, which is gitignored. Run `npx tsc -b`, then `./scripts/publish.sh`.
   - [ ] **Step 8. Test live** at https://ritikadas.in/architect/#/login:
     - sign in with each provider
     - create a project
     - reload and check it's still there
     - check the row in Supabase's table editor
     - check the account menu shows "Signed in with …" and not "Demo account"

     Then update README "What's real" if anything differs.
   - If she stops partway, the app still works in demo mode. Nothing breaks.

2. **Her voice needs her approval.** Two pieces speak as her. Show her each one, and let her reword it or ask you to:
   - the README's first-person "The idea" paragraph ("I've built three products with Claude Code, Cursor and Lovable…")
   - the two form answers, "Why would a non-technical user pick your platform?" and "Why would a technical user pick your platform?" (drafts in section 9)

   She likes casual, bold and dry, and hates polish (section 6). Once she approves, update README and section 9, and publish.

3. **Architecture walkthrough for the interview.** Explain `docs/ARCHITECTURE.md` to her in plain words, section by section, until she can defend each choice. Start with the prompt-to-live walkthrough (§2), the three proxies (§3.8), sandboxes (§3.6) and scaling (§5). She must never be caught out claiming engineering depth she doesn't have. The form's "formal software engineering experience" answer should be honest (No).

4. **Submit.** She fills in the form herself. It needs:
   - the live URL: https://ritikadas.in/architect/
   - the repo: https://github.com/ritikadas98/architect-2.0
   - the diagram: `docs/architecture.png`
   - the .md: `docs/ARCHITECTURE.md`
   - her résumé PDF
   - the two approved answers

---

## 3. Whose ideas are whose

This split matters to her, so keep it accurate.

### Ritika's problems and ideas (her words, 2026-09-28)

She has used Lovable, Cursor and, most of all, Claude Code. She has shipped three self-built products: Savio, FitCheck and Amazon Discovery Intelligence.

- **"They all look very similar."** To get something *different* (her word: not better, just different) she has to hunt for skills and add-ons, which she finds by accident on Instagram or YouTube. A vibe coder doesn't even know that's an option.
- **She wants the tool to know which skills exist**, suggest them, or pick and install them itself.
- **Design is where she wastes the most time.** She's a design perfectionist. The AI doesn't get what she means, even with visual references. "It does not know what questions to confirm to the user… it assumes a lot of details," which leads to "repetitive back and forth which wastes a lot of time and token". Vibe coders often can't express themselves in words, so they give visual cues, and the AI never confirms what it read from them. Many never use plan mode.
- **What scares a founder or ops manager is security.** They can get a frontend and a backend built, but not security. "Ignorance is a bliss thing doesn't work in tech." People who don't understand the whole application don't know what they're missing.
- **Developers don't avoid these tools.** They're integral: when Claude Code is down, everyone stops. So the developer pitch isn't "switch to us". It's "we fit into what you already use".
- **Discovery:** she doesn't know which skills or GitHub projects exist that would help with what she's building right now.
- She chose to host the app under her own site at ritikadas.in/architect, in its own repo. She asked for the repo to be renamed from `architect`, and I picked `architect-2.0`.

### What those became in the product

| Her problem | The feature | Where it lives |
|---|---|---|
| AI assumes, doesn't confirm what it read from screenshots | **Brief:** "Here's what I picked up from your screenshots" as ✓/✕/"Actually…" chips, then 5 multiple-choice questions, each with "You decide" (marked as a red guess) | `src/pages/Brief.tsx` |
| Everything looks the same | **Taste:** three directions built from her references, with the generic AI look rendered and crossed out ("I won't do this unless you ask"). Saved as `design.md` rules | Brief, Taste section |
| Doesn't know what she's missing, security | **Inspection:** plain-language findings (must / should / placeholder / passed), each with "Fix it for me". Must-fix items block launch | `src/pages/workspace/InspectionTab.tsx`, `src/pages/Launch.tsx` |
| Skills are found by accident | **Skills that come to you:** suggested per build with a one-line reason, installed automatically, plus "Bring your own" (paste a GitHub skill or MCP link, trust check) | Brief, Skills section; `src/pages/Skills.tsx` |
| Developers live in Claude Code and Cursor | CLI and MCP link, two-way GitHub with PR mode, Developer view | `src/pages/workspace/CodeTab.tsx`, `Modals.tsx` |

### Ideas Claude added while building it

Claude (Anthropic's AI) did the research, design and build with her. These came from Claude's side. She accepted them, but none is sacred.

- **The drafting-table visual language.** Paper, ink, a grid, and one loud colour, red, used as the "redline": it marks anything the AI guessed and anything that needs the user. The blueprint gets an APPROVED stamp, launch gets a LIVE stamp, there's a title block like an architectural drawing, and a dark "blueprint" theme. The point is that it doesn't look like the dark-purple AI-tool default, which is her complaint turned into the brand.
- **"If I break it, fixing it is on me."** Every model call is tagged `cause: user | agent`, and only `user` is billed. It came from research: paying for the AI's own bug loops is the most common complaint across tools.
- **An estimate before building.** The blueprint shows "About 12–18 minutes · 140–190 credits". No competitor researched shows cost before acting.
- **An honesty ledger:** "Real on day one / Placeholder until you connect it / Not doing (yet)", plus the amber "using sample orders" warning during the build. Research found a tool that quietly ran on sample data without telling the user.
- **One project, two views.** Simple and Developer render the same event stream. A developer can join a founder's project without starting again.
- **Guardrails in code, not in the prompt.** The refund limit shows as a must-fix until it's moved out of the AI's instructions and into code. Agents, Inspection and Launch stay in sync on it.
- **Click-to-edit for small changes, costing 0 credits.** Not everything needs a prompt.
- **The chat confirms before acting.** "Change it everywhere or just on the chat page?" is her thesis applied inside the build.
- **The sample scenario:** "Glow & Co. support desk", a small skincare brand with a customer chat in English and Hindi, three agents, Shopify orders, and refunds over ₹1,500 going to the owner. It was picked because it exercises agents, customer data, money and integrations, so every feature has something real to do.
- **Architecture principles** (see `docs/ARCHITECTURE.md` §1): the agent loop runs outside the sandbox, generated code never holds real secrets (an egress proxy injects them), every vendor sits behind an interface, one event log drives both views, and builds are durable workflows.

---

## 4. Research summary

Full notes went into `docs/ARCHITECTURE.md`, with inline sources. The product-side findings:

**architect.new today** (from docs.architect.new, its changelog v2.0–v2.2, SiliconANGLE Feb 2026 and Product Hunt):
- **Audience:** non-technical business users and enterprise teams. "You don't need API keys, local environments, or Git repos."
- **Flow:** an AI Consultant onboarding, then Plan & Brainstorm (a PRD you approve), then Agents (edited in a separate product, Lyzr Studio), then App (code preview, chat, live preview), then Deploy. It has two-way GitHub sync.
- **Has:** Plan Mode, a self-healing QA step, a browser Testing Agent, a managed NoSQL database and auth, knowledge base, themes, about 30 integrations, MCP, code export, and a per-agent credit breakdown (only after spending).
- **Gaps for developers:**
  - no editor, file tree, terminal or diff
  - no documented checkpoints or rollback
  - agent logic lives in a separate product
  - NoSQL only, and imports are Next.js only
  - no CLI or IDE link
  - one permission level
  - no cost estimate before acting

**Unmet needs across the category, with evidence:**
1. **A cost and time estimate before committing.** None of the ten tools has one. Replit Agent 3 "blew through $70 in a night" (The Register, Sept 2025). v0 users report "$10 to $30 a day".
2. **Not paying for the tool's own mistakes.** Bolt reviewers say "up to half their tokens went to errors". Lovable users say "every fix… costs more credits". Rocket.new's free auto-fixes get praised for exactly this.
3. **Honesty about what's mocked.** Non-technical users can't tell "the demo works" from "it actually works".
4. **Protection from the agent breaking working code.** Replit's agent deleting a production database (July 2025, widely reported) led to its dev/prod database split.
5. **Plain-language errors and progress** for non-technical users.
6. **A real developer workspace inside the same project.**
7. **A reliable round trip** with GitHub and local tools.
8. **Agent observability** (traces) next to the preview.
9. **Safe security and data defaults.**
10. **Direct visual editing** without spending a prompt.

**Under the hood** (verified from vendor sources; see ARCHITECTURE.md):
- Lovable runs on Modal sandboxes (gVisor).
- v0 runs on Vercel Sandbox (Firecracker), with an AutoFix model.
- Replit runs on its own GCP containers moving to microVMs, with a Snapshot Engine (checkpoints cover code, database and agent context).
- Emergent runs one GKE pod per session. Its agent loop runs outside the pod, on Temporal.
- Bolt runs WebContainers in the browser, which is Node only and so can't host Python agents.

**Our stack choices:**
- sandboxes: E2B or Modal behind a `SandboxProvider` interface, then GKE + gVisor warm pools at scale
- orchestration: Temporal
- model gateway: LiteLLM
- previews: a Cloudflare preview proxy on a separate wildcard domain
- secrets: an egress proxy that injects them
- GitHub: a GitHub App
- user apps: Cloud Run or Fly for agents, Workers or Vercel for frontends
- tracing: OpenTelemetry and Langfuse

---

## 5. What this iteration contains

It's a front-end prototype: Vite, React 19, TypeScript and React Router (HashRouter). There's no UI library. Every page is lazy-loaded.

| Route | Screen | Notes |
|---|---|---|
| `/` | Landing | Hero prompt, four habits drawn with real UI, the money rule receipt, Simple vs Developer, a dev feature list |
| `/login` | Sign-in | Google, GitHub and email link via Supabase when configured, otherwise a labelled demo account |
| `/welcome` | First run | "How do you like to work?" (sets the default view) and who it's for |
| `/home` | Projects | Prompt, screenshots (a real file picker), a reference link, import, starting points, project cards, delete |
| `/import` | Import | GitHub repo, zip, other builders (Lovable, Bolt, v0, Replit) or Figma. A scan, then 3 questions before touching code |
| `/p/:id/brief` | Brief | Reads, questions (keys 1–4, D for "You decide"), taste, skills, and a live "What I know so far" rail |
| `/p/:id/blueprint` | Blueprint | A drawing sheet: title block, page map, agent flow, data, the honesty ledger, assumptions, estimate, model picker, the APPROVED stamp |
| `/p/:id?tab=build` | Build | Live build steps (plain or dev text), the free fix, the placeholder card, a credit meter. The preview is a working mini app (store, customer chat, inbox) with "Show my guesses", "Edit directly", device sizes, and the chat that confirms before acting |
| `?tab=agents` | Agents | SVG canvas, per-agent setup, guardrails, test chat with traces, evals. Framework switch (Lyzr ADK, LangGraph, CrewAI, OpenAI Agents SDK, Custom) generates code. Export |
| `?tab=inspect` | Inspection | Findings, fix-all, "Not now", the technical toggle |
| `?tab=revisions` | Revisions | Timeline A–F, preview, restore, compare |
| `?tab=code` | Code (dev only) | File tree, diff viewer, a terminal that answers a few commands, agent trace, CLI and MCP snippets |
| `/p/:id/launch` | Launch | Pre-flight gate, secrets, address and DNS, where it runs, deploy log, the LIVE stamp with a QR code, deploy history and rollback, after-launch monitoring |
| `/skills` | Skills | Suggested (with reasons), browse by category, detail modal, "Bring your own" |
| `/settings/:tab` | Settings | Models (auto routing or custom), usage (free fixes, estimate vs actual), API keys (BYOK), account and team |
| `/architecture` | Architecture | The diagram (zoomable), the 12 steps, the choices table |

**Scripted, not real:** every AI behaviour follows the one sample project, whatever the prompt. That includes the reads, the build steps, the agent replies and the findings. The home page and footer say so.

**Known shortcuts:**
- Some state lives only in browser localStorage, per project:
  - `a2:ws:<id>:*`: workspace revisions, edits, chat, Shopify status
  - `a2:agents:<id>`: agents
  - `a2:muted:<id>`: muted findings

  None of it reaches Supabase.
- Restoring a revision logs it but doesn't roll back preview edits.
- The Inspection and Launch revision letter (`revLetter`: F plus one per fix) and the workspace's runtime revisions (lettered from G) count separately, so they can disagree.
- Top-up credits, added skills, model choices, keys and team invites are page-local.
- Agents added after the second one get fixed canvas slots, so their lines can cross other nodes.

---

## 6. Code map and conventions

- `src/styles/tokens.css`: the colour tokens. Light is paper; dark is `data-theme="dark"`, the blueprint.
  - `--red*`: the AI guessed, or the user must act
  - `--blue*`: real or connected
  - `--green`: OK
  - `--amber`: placeholder
- `src/styles/components.css`: `.btn` (+ `-primary`, `-line`, `-ghost`, `-red`, `-sm`, `-lg`), `.chip`, `.badge-*`, `.seg`, `.tabs`, `.redline`, `.stamp`, `.titleblock`, `.modal*`, `.toast`. Use tokens only.
- **The generated app is the one exception to tokens.** The preview app has its own fixed "Quiet spa" palette: cream `#F4EDE2`, ink `#2E2A24`, sage `#7C8B6F`, and Cormorant Garamond.
- `src/components/ui.tsx`: `Logo`, `Modal`, `Toasts`, `ModeToggle`, `ThemeToggle`, `Redline` (the handwritten AI note, used only where the AI guessed or flags something), `Steps`.
- `src/components/Icon.tsx`: the inline SVG icon set.
- `src/data/demo.ts`: all the scripted content: prompts, reads, questions, directions, skills, blueprint, build steps, findings, revisions, files, trace, models, deploys.
- `src/lib/store.tsx`: user, mode, theme, projects, credits, toasts. localStorage keys start `a2:`. Supabase sync kicks in when the user is signed in for real.
- The page folders: `src/pages/brief/`, `workspace/`, `agents/`, `launch/` (`useFixes.ts` keeps findings in sync across screens), `skills/`, `settings/`.
- **Chrome gotcha.** In recent Chrome, `scrollTo` and `scrollIntoView` return a Promise. So `useEffect(() => el.scrollIntoView())` returns something that isn't a cleanup function, and React blanks the whole page with "destroy is not a function". Always use a block body: `useEffect(() => { el.scrollIntoView() }, [...])`.
- **Phones:** check real phone rendering in the iOS Simulator (Safari). Headless Chrome has produced false phone bugs on her other site. Page layouts have to work at 360px with no sideways scroll.

**Copy voice.** Hers, and strict:
- Short sentences: about 9 words on average, 15 at most, one idea each.
- No semicolons. Avoid em-dashes in UI copy.
- Casual, bold and dry. Concrete beats clever: put a real number or event in a joke and end on the blunt half.
- **Her "AI slop" detector fires on elegance:** balanced clauses, aphorisms, a closing flourish that summarises instead of adding. Plainness doesn't set it off.
- Banned words: "Revolutionize", "Seamless", "Unleash", "Empower", "Elevate".
- The product speaks as "I" when the AI talks.
- Where AI is really used, frame it as expertise in deploying AI, not as distrust of it.

---

## 7. Run, check, publish

```bash
npm install
npm run dev          # http://localhost:5173/architect/  (always preview over localhost, never file://)
npx tsc -b           # must pass
npm run build
./scripts/publish.sh # builds, copies dist/ into ../ritikadas.github.io/architect, commits as Ritika, pushes
```

**Why publishing goes through the portfolio repo.** Her portfolio repo is `ritikadas98/ritikadas.github.io`. It's named `ritikadas`, not `ritikadas98`, so it isn't the account's user site, and project repos don't inherit the `ritikadas.in` domain. So ritikadas.in serves only that repo, and the app lives in its `architect/` folder. GitHub Pages is off on this code repo. `.github/workflows/build.yml` only checks that every push builds.

`scripts/publish.sh` expects the portfolio checkout next to this repo (`../ritikadas.github.io`, overridable with `SITE=`). It pulls before copying, because that checkout can be behind the live site. **In the portfolio repo, touch only `architect/`.** Her `BUILD_SPEC.md` and worklog there are private and must never be published.

The diagram is generated by `docs/diagram/gen_svg.py`. Regenerate it with `python3 docs/diagram/gen_svg.py docs/architecture.svg && rsvg-convert -z 2 docs/architecture.svg -o docs/architecture.png`. Keep the ①–⑫ step numbers in sync with the table in ARCHITECTURE.md §2.

---

## 8. Ideas backlog

These are ranked by what the graders weight. Nothing here was promised to her.

1. **Real functionality.** Get Supabase live (it only needs keys). Then, optionally, one genuinely working AI step: for example, a real vision-model read of an uploaded screenshot through a small Supabase Edge Function proxy, so the API key never reaches the browser. That would make "asks before it assumes" real rather than scripted.
2. **A custom prompt adapts the brief.** Right now any prompt walks the support-desk script. A light version would adapt the question wording to keywords in the prompt.
3. **Persist workspace state to the project record**, so it's the same across devices when signed in.
4. **Unify revision letters** between the workspace timeline and Inspection/Launch.
5. **Trim ARCHITECTURE.md** from about 7,000 words towards 5,000 if she wants it tighter. §3 and §5 are the longest.
6. **Onboarding interview parity.** Current Architect has an "AI Consultant" onboarding that suggests app ideas. A first-principles version could live on the Welcome screen.

---

## 9. Draft form answers

These need her approval, in her words. Don't submit them as-is.

**Why would a non-technical user pick your platform?**

> Because it asks before it builds.
>
> I've built three products with Claude Code, Cursor and Lovable. I'm not an engineer. My biggest time sink was never the code. It was the AI guessing. I'd give it a screenshot, it would assume half the details, and then we'd go back and forth for an hour. Most people who vibe code can't describe a design in words. So they show a picture, and the tool never checks what it took from it.
>
> Architect 2.0 starts with a brief. It tells you what it saw in your screenshot, and you tick or cross each one. Then it asks five multiple-choice questions, each with a "you decide" option. Only then does it draw a blueprint, with a time and cost estimate you approve.
>
> It also tells you what you're missing. Before launch it runs an inspection in plain words, like "anyone with an order number could see that order", and every finding has a fix button. And you never pay for its mistakes. If the AI breaks something and fixes it, that's 0 credits.

**Why would a technical user pick your platform?**

> Because it doesn't make them leave their tools.
>
> Developers already live in Claude Code and Cursor. Architect 2.0 links to them. `npx architect link` plus an MCP server means Claude Code can read the brief, the design rules and the inspection results. A push from Cursor shows up in Architect, and GitHub sync runs both ways, with PR mode for main.
>
> The same project has a Developer view: files, diffs, a terminal, and a trace of every agent's reasoning and tool calls. Agents can be written in Lyzr ADK, LangGraph, CrewAI or the OpenAI Agents SDK, behind one invoke contract. The model is picked per task, and you can bring your own key.
>
> And skills come to them. Useful skills and MCP servers are suggested for what they're building, with a trust check before anything installs.
