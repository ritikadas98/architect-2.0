# Architect 2.0: product discovery

This is how we got from the brief to the product. It runs step by step, with the evidence and the arguments that changed our minds. The build and the architecture follow from it.

*Ritika Das. Researched and argued through with Claude, 2026-09-29. Where a claim rests on a secondary source or a guess, it says so.*

## The process

| # | Step | Question | Status |
|---|---|---|---|
| 1 | Context and goals | What does Lyzr sell, and what does it need Architect to do? | Done |
| 2 | Users and segments | Who's involved, and how do they differ? | Next |
| 3 | Problems per segment | What does each one struggle with, and how do we know? | |
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
- **32 enterprise customers, paying about $250K a year on average.** The largest, a US federal agency, pays close to $2M. KPMG and Deloitte are named customers.
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
