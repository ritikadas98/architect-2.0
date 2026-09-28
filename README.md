# Architect 2.0

An app builder for founders and developers that **asks before it assumes**.

**Live:** [ritikadas.in/architect](https://ritikadas.in/architect/) · **Architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · **Diagram:** [docs/architecture.png](docs/architecture.png)

Built by Ritika Das for the Lyzr Technical Product Manager assignment.

![System architecture](docs/architecture.png)

## The idea

I've built three products with Claude Code, Cursor and Lovable. The code was never where I lost time. The AI guessing was. I'd give it a screenshot, and it assumed half the details. It never checked what it took from the picture. Then came an hour of back and forth, paid for in tokens.

Architect 2.0 is built around four habits the others skip:

1. **It asks before it assumes.** It shows what it read from your screenshots ("cream background, serif headings, pill buttons") so you can tick or cross each one. Then five multiple-choice questions, each with "you decide". Only then a blueprint, with a time and cost estimate you approve.
2. **It won't look like every AI app.** Three directions built from your references. The generic AI look is shown crossed out. Your taste is saved as rules (`design.md`) the build has to follow.
3. **It tells you what you're missing.** Before launch, a plain-language inspection: "Anyone with an order number could see that order." Each finding has a fix button, and must-fix items block launch.
4. **It brings the right skills to you.** It suggests the add-ons your build needs, says why in one line, and installs them. Nobody should need an Instagram reel to learn a skill exists.

Two rules hold it together:

- **If the AI breaks it, fixing it is free.** Every model call is tagged `user` or `agent`, and only `user` is billed.
- **One project, two views.** Simple shows plain words. Developer shows code, diffs, a terminal, agent traces, a CLI, MCP and GitHub PRs. It's one switch, on the same project.

## A five-minute tour

1. Open the [live app](https://ritikadas.in/architect/) and sign in.
2. On Home, pick **Support desk for my brand** and press **Start with a brief**.
3. Correct a screenshot read, answer the questions (keys 1–4 work), and pick a look.
4. On the **Blueprint**, read "What's real, and what isn't", then **Approve and build**.
5. Watch the build. Note the free fix, and the amber "sample orders" warning.
6. In the preview, turn on **Show my guesses**, then **Edit directly** and click the headline.
7. Ask the chat to "make the buttons terracotta". It asks one question first.
8. Open **Inspection**, fix the must-fix items, then **Launch**.
9. Flip to **Developer** and open **Code** and **Agents**. Switch the agent framework to LangGraph or CrewAI.

## What's real and what's scripted

| Real | Scripted, and designed in [ARCHITECTURE.md](docs/ARCHITECTURE.md) |
|---|---|
| Sign-in with Google, GitHub or an email link (Supabase), when configured | The AI itself: brief reads, build steps and agent replies follow one sample project |
| A `projects` table with row-level security ([schema](supabase/schema.sql)) | Sandboxes, the agent harness, the model gateway and deploys |
| Every screen, flow, state change and credit count in the UI | GitHub App, CLI and MCP link |
| Click-to-edit and chat changes that really change the preview | Inspection scanners |

Without Supabase keys the app runs a clearly labelled demo account, and projects stay in the browser.

## Run it

```bash
npm install
cp .env.example .env.local   # optional: add Supabase URL + anon key
npm run dev                  # http://localhost:5173/architect/
```

Stack: Vite, React 19, TypeScript, React Router. No UI library: the drafting-table design system is in `src/styles`. Published to ritikadas.in/architect by `scripts/publish.sh`, which copies the build into the portfolio site. `.github/workflows/build.yml` checks every push builds.

Regenerate the diagram with `python3 docs/diagram/gen_svg.py docs/architecture.svg && rsvg-convert -z 2 docs/architecture.svg -o docs/architecture.png`.
