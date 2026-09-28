# Architect 2.0: product discovery

This is how we got from the brief to the product. It runs step by step, with the evidence and the arguments that changed our minds. The build and the architecture follow from it.

*Ritika Das. Researched and argued through with Claude, 2026-09-29. Where a claim rests on a secondary source or a guess, it says so.*

## The process

| # | Step | Question | Status |
|---|---|---|---|
| 1 | Context and goals | What does Lyzr sell, and what does it need Architect to do? | Done |
| 2 | Users and segments | Who's involved, and how do they differ? | Done |
| 3 | Problems per segment | What does each one struggle with, and how do we know? | Next |
| 4 | Target | Which segment and which problem first? | |
| 5 | Problem statement | One paragraph everything hangs from | |
| 6 | Journeys | Today's journey vs the new one | |
| 7 | Solutions and priorities | What's in v1, what's cut, and why | |
| 8 | Metrics | North star, inputs, guardrails | |
| 9 | Go-to-market and pricing | Who first, how, and how it makes money | |
| 10 | Risks and open questions | What would prove us wrong | |

**A limit to be upfront about:** there were no user interviews. The evidence is Ritika's own experience, three years as an SAP technical consultant and a year as an APM, plus public reports, reviews and competitor documentation.

---

## Step 1. Context and goals

### What Lyzr is

Lyzr sells the infrastructure to run AI agents inside enterprises. Its selling point isn't *building* an agent, which is now easy. It's running agents **safely enough for a bank**:
- private deployment: in Lyzr's cloud, the customer's private cloud (VPC), or on-premises ("Sovereign AI")
- governance: Responsible AI, a Hallucination Manager, audit trails
- control of "agent sprawl" through Opencontroller

([lyzr.ai](https://www.lyzr.ai/))

It has three kinds of product:
- **Build tools:** Agent Studio, a low-code agent builder, and **Architect**, which builds whole agentic apps from a prompt: screens, database, agents and guardrails.
- **Ready-made agents:** Jazon (sales), Skott (marketing), Jeff (support), Diane (HR), and procurement and legal agents. There are also 1,000+ industry blueprints.
- **People:** its own Agentic Transformation Consultants (ATCs), partner consultancies, and Lyzr Academy.

An **agent** is an AI model given a job (instructions), hands (tools it can use), a reference shelf (knowledge it can search, known as RAG), a notebook (memory) and rules it can't break (guardrails). An **agentic app** is agents plus the screens people use them through.

### How it makes money

These numbers are self-reported to aggregators, so read them as approximate:
- **About $12M in annual recurring revenue** in June 2026, up from $650K in late 2025.
- **32 enterprise customers, paying about $250K a year on average.** The largest, a US federal agency, pays close to $2M. KPMG, Accenture and NTT Data are confirmed partners on Lyzr's own site. Deloitte appears only in an aggregator, so treat it as unconfirmed.
- **A $100M Series B** in July 2026. Accenture Ventures is an investor.

([Latka](https://getlatka.com/companies/lyzr.ai), [TNW](https://thenextweb.com/news/lyzr-ai-agent-100-million-series-b), [Tracxn](https://tracxn.com/d/companies/lyzr/__3iNuwF28pWvfOkygQJziJIfs1U-wu38eTORcpSBqjqo))

**So the $20–$99 Architect plans aren't the business.** Architect matters to the extent that it wins, speeds up and grows six-figure enterprise accounts.

### The problem Lyzr says it solves

**"Pilot purgatory"**: AI pilots that impress in a demo and never reach production. Lyzr names Microsoft Copilot and Salesforce Agentforce as the rivals that "struggle to move beyond early prototypes", not Lovable or Replit. ([SiliconANGLE](https://siliconangle.com/2026/02/06/exclusive-startup-lyzr-ai-launches-app-builder-aimed-moving-agents-production-volume/), [National Law Review](https://natlawreview.com/press-releases/lyzr-launches-architect-first-enterprise-grade-text-agent-platform-building))

It's a real problem:
- MIT's 2025 study found **95% of company generative AI pilots delivered no measurable profit-and-loss impact**. The leading causes: tools that don't fit real workflows, messy data, and systems that don't learn.
- **Pilots run by internal teams with outside experts succeeded 67% of the time, against 22% for IT alone.**

([Fortune via Yahoo](https://finance.yahoo.com/news/mit-report-95-generative-ai-105412686.html), [Mind the Product](https://www.mindtheproduct.com/why-most-ai-products-fail-key-findings-from-mits-2025-ai-report/))

**Lyzr's own answer today is people.** The CEO: *"90% of our customers go live because of our ATCs."* ([SiliconANGLE](https://siliconangle.com/2026/02/06/exclusive-startup-lyzr-ai-launches-app-builder-aimed-moving-agents-production-volume/)) Consultants get customers live. Consultants don't scale.

### What enterprise software history says: SAP

Ritika's experience as an SAP technical consultant points to two separate failure points.

1. **Before sign-off, the ghost pilot.** A team is assembled and a demo is shown. The client is pleased, and then never signs. The commitment of money, time and people is too big to make on the strength of a demo.
2. **After sign-off, failure through the implementer.** The consulting team isn't capable enough for the scale, and the project drags on for months.

The public record shows what's at stake:
- **Lidl** abandoned SAP after **seven years and about €500M**. It wouldn't change how it valued stock (at purchase price, where SAP assumes retail price), and that mismatch came to light far too late. ([Panorama](https://www.panorama-consulting.com/lidl-erp-failure/))
- **Revlon** lost **$64M in sales** after its 2018 go-live, missed financial reporting deadlines, and was sued by its own shareholders. ([Henrico Dolfing](https://www.henricodolfing.ch/en/case-study-6-how-revlon-got-sued-by-its-own-shareholders-because-of-a-failed-sap-implementation/))
- **Haribo** couldn't track its raw materials after moving to S/4HANA, and products vanished from shelves. ([ERP Research](https://www.erpresearch.com/en-us/erp-implementation-failure-case-studies))
- Independent studies put ERP projects that fail or badly overrun at **roughly 50–75%**. ([ERP Research](https://www.erpresearch.com/en-us/erp-implementation-failure-case-studies), [CIO](https://www.cio.com/article/278677/enterprise-resource-planning-10-famous-erp-disasters-dustups-and-disappointments.html))

### Arguments that changed our minds

- **We started with the wrong user.** The first version of the idea was built around a solo builder like Ritika: someone who hates the AI guessing, watches credits, and wants their app not to look generic. Lyzr's revenue says the user who matters works inside an enterprise, alongside consultants. The solo builder's pains don't disappear, but they stop being the headline.
- **"Demo to production" is Lyzr's slogan, not an insight.** Leading with it repeats their marketing back to them. The value is in the *how*.
- **The how is in the failure pattern.** Where people are the root cause, it shows up as *specific skipped steps*. Lidl's was a requirement nobody surfaced, and Revlon's was testing nobody did. A product can't hire better consultants. It can make those steps impossible to skip.
- **Incentives matter.** Consultancies are often paid by the hour, so a slow project isn't punished, and Lyzr earns partly through partners like Accenture. A tool that turns months into weeks helps the client but threatens a partner's billable hours. The product and its go-to-market need a version where partners win too, for example more projects a year, sold at a fixed price. That's for Step 9.
- **The ghost pilot is a decision problem, not a building problem.** The buyer can't commit because the cost at scale, the risks and the rollout aren't visible. No builder we researched helps with that.

### Goals for Architect 2.0

1. **Get enterprise pilots signed off and into production faster, with fewer consultant hours per customer.**
2. **Expand within accounts.** One team's app becomes ten teams' apps.
3. **Bring in developers and IT.** They approve and maintain what goes live. That's why the brief asks for technical users, not to compete with Cursor.

### Questions for Lyzr

- What share of Architect apps reach production? Where do the rest stop?
- Who uses Architect today: customers' own staff, Lyzr's ATCs, or partner consultants?
- How are partners paid: per hour, per project, or a share of licences?

---

## Step 2. Users and segments

### How Lyzr works with consultancies

Consultancies sell clients projects such as "automate your claims process". Lyzr gives them the machinery to deliver those projects. Its page for system integrators lists four partnership models ([lyzr.ai/gsi-si](https://www.lyzr.ai/gsi-si/)):

1. **Accelerate.** Lyzr engineers are embedded in the partner's delivery team, bringing 100+ tested agent blueprints. The pitch: "from quarters to weeks".
2. **White-label.** The partner runs Lyzr under its own brand, and the client may never see Lyzr's name.
3. **Agentic OS.** The partner builds its own product on Lyzr, such as a "Procurement OS", owns the IP, and moves "from engagement revenue to recurring product revenue".
4. **Internal first.** The partner uses Lyzr in-house before pitching it to clients.

Accenture invested so that Lyzr would bring agents to banking, insurance and financial-services clients ([Accenture](https://newsroom.accenture.com/news/2025/accenture-invests-in-lyzr-to-bring-agentic-ai-to-banking-and-insurance-companies)). KPMG builds custom agents for its clients on Lyzr. **Lyzr is the factory, the consultancy is the contractor, and Architect is one of the factory's machines.**

The third model also answers a worry from Step 1, that faster delivery would threaten billable hours. Partners turn projects into products they own. For Architect, that means **work done for one client has to be reusable for the next.**

### Two ways to segment

We rejected the brief's "technical vs non-technical" axis. In an enterprise, what someone *does* in the project predicts their needs better than their skill level. A technical CISO and a technical developer want opposite things.

**By account:**

| Segment | Example | Priority |
|---|---|---|
| **A2. Consultancy / systems integrator** | Accenture, KPMG, NTT Data | **Lead.** It's Lyzr's existing motion, and each partner is both a customer and a channel to many enterprises |
| A1. Regulated enterprise building directly | Banks, insurers, government | Next. This is the end client in most A2 projects anyway |
| A3. Mid-sized digital company | D2C, SaaS | Later |
| A4. Individual builder | Founders, freelancers | Later: a free way in, not revenue |

**By role in a project:**

- **Primary user: the delivery lead.** They run the agentic project end to end, like a product manager or PMO lead. They're accountable for scope, timeline, sign-off and go-live, and they coordinate the builders, the client's business owners and the client's IT.
- **The delivery team:** consultants and developers who build, plus Lyzr's embedded engineers.
- **Stakeholders to satisfy, not design for.** They're secondary users of a few screens: review, approval, audit.
  - **Business owner (champion):** wants the problem solved fast, and fears looking foolish.
  - **Economic buyer (business head + CFO):** signs off on money and resources, and fears another Lidl.
  - **IT gatekeepers**, whose involvement starts earlier and lasts longer for agents than for SAP:
    - **Enterprise architecture / review board:** fit with company systems.
    - **Identity (IAM):** every agent is a non-human identity. There are 45 of those for every human, and 16% of organisations don't track the AI ones.
    - **System and data owners:** they hold the data the agent reads and writes.
    - **Security:** data leaks, attacks that trick an agent, and over-broad access. The May 2026 Five Eyes advisory on agentic AI names excess privilege as the foundational risk.
    - **AI governance, model risk, compliance and legal:** RBI FREE-AI (Aug 2025) and its 2026 draft on model risk call for a model inventory, independent validation and vendor accountability.
    - **Operations (SRE):** uptime, alerts, rollback.
    - **FinOps:** usage costs that grow with adoption.
  - **End users:** they adopt the app, or quietly don't.

([CSA via The Hacker News](https://thehackernews.com/2026/09/iam-for-ai-agent.html), [Solytics on FREE-AI](https://www.solytics-partners.com/resources/blogs/understanding-rbi-free-ai-framework-2025-building-responsible-ethical-and-accountable-ai-governance-in-indias-bfsi-sector))

### How IT involvement changes with agents

- **Longer, not just larger.** With SAP, most IT work happens during the implementation. An agent keeps making decisions after launch, and its behaviour can change when the underlying model does. So IT stays involved for the app's whole life.
- **A "paved road", not approval for everything.** Businesses build within rules IT has already decided, and IT steps in only for new situations. Ritika's experience confirms this is how mature enterprises work. It's also the defence against shadow AI: corporate data pasted into AI tools rose 485% in a year ([Cyberhaven](https://www.cyberhaven.com/resources/report/2025-ai-adoption-risk-report)).
- **The gap.** For agents, most rules don't exist yet, so in year one every question is a new situation and goes to IT. **That first round of deliberation is a new version of the ghost pilot.**
- **An idea to carry forward: rules starter packs.** A consultancy arrives with an industry pack, for example one for banks drafted against RBI FREE-AI. It covers the data agents may touch, human approval thresholds, logging, and identity and permission defaults. The client's IT adapts one pack instead of deliberating from zero. The partner reuses it at every client, which makes it IP. Buying rather than building is already the trend: 76% of AI use cases are now bought, up from 53% ([Menlo Ventures](https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise/)).

### Arguments in this step

- **"Lead with consultancies because it's the existing segment" isn't enough on its own.** The stronger reason is that they're a customer *and* a channel. The trap is that the user (the consultant) and the gatekeepers (at the client) sit in different companies. Architect has to help one company satisfy another's IT.
- **Designing for ourselves.** Ritika has held the delivery-lead role herself, which is insight and bias at the same time. Every assumption about delivery leads gets checked against evidence in Step 3.
- **White-labelling has consequences for the product.** Partner branding, many clients per consultant, and strict separation of each client's data.
