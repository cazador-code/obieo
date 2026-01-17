# Claude Code Capabilities Map

A visual reference of all tools, skills, plugins, and agents available in this workspace.

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLAUDE CODE TOOLKIT                                │
├─────────────────────┬─────────────────────┬─────────────────────────────────┤
│   CORE TOOLS        │   SKILLS (/slash)   │   MCP SERVERS                   │
│   (Always Available)│   (Invoke via Skill)│   (External Integrations)       │
├─────────────────────┼─────────────────────┼─────────────────────────────────┤
│ • Read/Write/Edit   │ • superpowers/*     │ • Chrome Browser Automation     │
│ • Bash              │ • commit-commands/* │ • Google Search Console         │
│ • Glob/Grep         │ • pr-review-toolkit │ • VS Code IDE                   │
│ • Task (Agents)     │ • feature-dev/*     │                                 │
│ • WebSearch/Fetch   │ • vercel/*          │                                 │
│ • TodoWrite         │ • seo-geo-content   │                                 │
└─────────────────────┴─────────────────────┴─────────────────────────────────┘
```

---

## 1. Core Tools

These are always available and form the foundation of all operations.

### File Operations

| Tool | When to Use | Example |
|------|-------------|---------|
| **Read** | View file contents, images, PDFs, notebooks | Reading code, reviewing docs |
| **Write** | Create new files (use sparingly) | New components, configs |
| **Edit** | Modify existing files (preferred) | Bug fixes, feature additions |
| **Glob** | Find files by pattern | `**/*.tsx`, `src/**/*.ts` |
| **Grep** | Search file contents | Find function definitions, imports |

### Execution & Research

| Tool | When to Use | Example |
|------|-------------|---------|
| **Bash** | Run shell commands, git, npm | `git status`, `npm run build` |
| **WebSearch** | Find current information online | Research APIs, docs, trends |
| **WebFetch** | Fetch & analyze specific URLs | Read documentation pages |
| **TodoWrite** | Track multi-step tasks | Complex features, debugging |

### Planning & Questions

| Tool | When to Use | Example |
|------|-------------|---------|
| **EnterPlanMode** | Non-trivial implementations | New features, refactors |
| **ExitPlanMode** | Submit plan for approval | After writing plan |
| **AskUserQuestion** | Need clarification | Ambiguous requirements |

---

## 2. Task Agents (Subagents)

Launch specialized agents for complex, autonomous work via the `Task` tool.

### Exploration & Research

```
┌────────────────────────────────────────────────────────────────┐
│  EXPLORE AGENTS - Use before coding to understand codebase     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Explore                    feature-dev:code-explorer          │
│  ├─ Quick file searches     ├─ Deep feature analysis           │
│  ├─ Pattern matching        ├─ Trace execution paths           │
│  └─ Codebase questions      └─ Map architecture layers         │
│                                                                │
│  episodic-memory:search-conversations                          │
│  └─ Search past conversations for context & decisions          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

| Agent | When to Use |
|-------|-------------|
| `Explore` | "Where is X?", "How does Y work?", codebase structure |
| `feature-dev:code-explorer` | Deep dive into existing features before building similar |
| `episodic-memory:search-conversations` | Recall past decisions, solutions, lessons |

### Planning & Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  PLANNING AGENTS - Design before implementation                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Plan                       feature-dev:code-architect         │
│  ├─ Implementation strategy ├─ Feature blueprints              │
│  ├─ Critical file IDs       ├─ Component designs               │
│  └─ Architectural trade-offs└─ Data flow mapping               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Code Review Agents

```
┌────────────────────────────────────────────────────────────────┐
│  REVIEW AGENTS - Quality gates for code                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  superpowers:code-reviewer        pr-review-toolkit:*          │
│  ├─ Post-implementation review    ├─ code-reviewer             │
│  └─ Against plan & standards      ├─ code-simplifier           │
│                                   ├─ comment-analyzer          │
│  feature-dev:code-reviewer        ├─ pr-test-analyzer          │
│  ├─ Bug detection                 ├─ silent-failure-hunter     │
│  ├─ Security vulnerabilities      └─ type-design-analyzer      │
│  └─ Quality issues                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

| Agent | When to Use |
|-------|-------------|
| `superpowers:code-reviewer` | After completing major project steps |
| `pr-review-toolkit:code-reviewer` | Before commits/PRs, check against CLAUDE.md |
| `pr-review-toolkit:silent-failure-hunter` | Review error handling, catch blocks |
| `pr-review-toolkit:type-design-analyzer` | When introducing new types |
| `pr-review-toolkit:pr-test-analyzer` | Review test coverage in PRs |
| `pr-review-toolkit:comment-analyzer` | Verify comment accuracy |
| `code-simplifier:code-simplifier` | Simplify/refine for clarity |

### Specialized Agents

| Agent | When to Use |
|-------|-------------|
| `Bash` | Complex multi-step terminal operations |
| `general-purpose` | Multi-step tasks, complex research |
| `claude-code-guide` | Questions about Claude Code features |
| `superpowers-chrome:browser-user` | Analyze web content via Chrome DevTools |
| `agent-sdk-dev:agent-sdk-verifier-py` | Verify Python Agent SDK apps |
| `agent-sdk-dev:agent-sdk-verifier-ts` | Verify TypeScript Agent SDK apps |

---

## 3. Skills (Slash Commands)

Invoke via `Skill` tool. These are workflows and specialized procedures.

### Development Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEVELOPMENT LIFECYCLE                                 │
│                                                                             │
│   PLAN           BUILD              TEST             SHIP                   │
│     │              │                  │                │                    │
│     ▼              ▼                  ▼                ▼                    │
│ ┌────────┐    ┌──────────┐      ┌──────────┐    ┌────────────┐             │
│ │writing-│    │feature-  │      │test-     │    │commit      │             │
│ │plans   │───▶│dev       │─────▶│driven-   │───▶│            │             │
│ └────────┘    └──────────┘      │development│   │commit-push-│             │
│                                 └──────────┘    │pr          │             │
│ ┌────────┐    ┌──────────┐      ┌──────────┐    └────────────┘             │
│ │brain-  │    │frontend- │      │systematic│           │                   │
│ │storming│    │design    │      │-debugging│           ▼                   │
│ └────────┘    └──────────┘      └──────────┘    ┌────────────┐             │
│                                                 │review-pr   │             │
│                                                 └────────────┘             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Superpowers Skills (Process & Workflow)

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/brainstorming` | Before ANY creative work | Explore intent, requirements, design |
| `/writing-plans` | Have spec, need implementation steps | Create step-by-step plan |
| `/executing-plans` | Have written plan to execute | Execute with review checkpoints |
| `/subagent-driven-development` | Independent tasks, current session | Parallel task execution |
| `/dispatching-parallel-agents` | 2+ independent tasks | Work without shared state |
| `/test-driven-development` | Before writing implementation | Write tests first |
| `/systematic-debugging` | Any bug, test failure, unexpected behavior | Structured debugging |
| `/verification-before-completion` | About to claim work is done | Run verification first |
| `/requesting-code-review` | Completing major features | Verify work meets requirements |
| `/receiving-code-review` | Got code review feedback | Analyze before implementing |
| `/using-git-worktrees` | Need isolated feature work | Create isolated worktrees |
| `/finishing-a-development-branch` | Implementation complete, tests pass | Guide merge/PR/cleanup |

### Commit & Git Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/commit` | Ready to commit changes | Create git commit |
| `/commit-push-pr` | Ready for full PR workflow | Commit, push, open PR |
| `/clean_gone` | Clean up deleted remote branches | Remove [gone] branches |

### Code Review Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/review-pr` | Review a pull request | Comprehensive PR review |
| `/code-review` | Need code review | Review code quality |

### Specialized Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/seo-geo-content` | Writing website/blog content for SEO | Rank in search & AI results |
| `/frontend-design` | Build web UI components | High-quality, distinctive design |
| `/feature-dev` | Guided feature development | Codebase understanding + architecture |
| `/writing-clearly-and-concisely` | Any prose humans will read | Apply Strunk's writing rules |

### Infrastructure Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/deploy` | Deploy to Vercel | Push to production |
| `/logs` | Check Vercel logs | Debug deployments |
| `/setup` (vercel) | Configure Vercel | Link project |
| `/new-sdk-app` | Create Agent SDK app | Setup new SDK application |
| `/browsing` | Need direct browser control | Chrome DevTools Protocol |
| `/mcp-cli` | Use MCP servers on-demand | Discover tools without preloading |
| `/using-tmux-for-interactive-commands` | Interactive CLI tools | vim, git rebase -i, REPL |

### Meta & Memory Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/using-superpowers` | Start of conversation | How to find and use skills |
| `/writing-skills` | Create/edit skills | Skill development |
| `/remembering-conversations` | "How should I...", stuck, unfamiliar | Search conversation history |
| `/search-conversations` | Search past conversations | Semantic/text search history |
| `/working-with-claude-code` | Questions about Claude Code | Official documentation |
| `/developing-claude-code-plugins` | Working on plugins | Plugin lifecycle |

### Ralph Loop

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/ralph-loop` | Start autonomous loop | Continuous operation |
| `/cancel-ralph` | Stop autonomous loop | Cancel Ralph Loop |
| `/help` (ralph) | Understand Ralph Loop | Explanation |

---

## 4. MCP Servers (External Integrations)

### Chrome Browser Automation (`mcp__claude-in-chrome__*`)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CHROME BROWSER AUTOMATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SETUP                    INTERACTION              EXTRACTION               │
│  ─────                    ───────────              ──────────               │
│  tabs_context_mcp         navigate                 read_page                │
│  tabs_create_mcp          computer (click/type)    find                     │
│  update_plan              form_input               get_page_text            │
│  resize_window            keyboard_press           javascript_tool          │
│                                                                             │
│  DEBUGGING                RECORDING                                         │
│  ─────────                ─────────                                         │
│  read_console_messages    gif_creator                                       │
│  read_network_requests    upload_image                                      │
│                                                                             │
│  SHORTCUTS                                                                  │
│  ─────────                                                                  │
│  shortcuts_list                                                             │
│  shortcuts_execute                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Workflow:**
1. `tabs_context_mcp` → Get/create tab context
2. `navigate` → Go to URL
3. `read_page` / `find` → Understand page structure
4. `computer` / `form_input` → Interact
5. `gif_creator` → Record for review

### Google Search Console (`mcp__gsc__*`)

| Tool | Purpose |
|------|---------|
| `list_properties` | Get all GSC properties |
| `get_search_analytics` | Search performance data |
| `get_advanced_search_analytics` | Filtered/sorted analytics |
| `get_performance_overview` | Quick performance summary |
| `compare_search_periods` | Period-over-period comparison |
| `get_search_by_page_query` | Page-specific query data |
| `inspect_url_enhanced` | Check URL indexing status |
| `batch_url_inspection` | Bulk URL inspection |
| `check_indexing_issues` | Find indexing problems |
| `manage_sitemaps` | List/submit/delete sitemaps |
| `add_site` / `delete_site` | Manage properties |

### VS Code IDE (`mcp__ide__*`)

| Tool | Purpose |
|------|---------|
| `getDiagnostics` | Get language errors/warnings |
| `executeCode` | Run code in Jupyter kernel |

### Superpowers Chrome (`mcp__plugin_superpowers-chrome_chrome__*`)

| Tool | Purpose |
|------|---------|
| `use_browser` | Control persistent Chrome browser |

---

## 5. Decision Flowchart

```
                              ┌─────────────────┐
                              │ What do I need? │
                              └────────┬────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        │                              │                              │
        ▼                              ▼                              ▼
┌───────────────┐            ┌─────────────────┐            ┌─────────────────┐
│ UNDERSTAND    │            │ BUILD/FIX       │            │ SHIP/REVIEW     │
│ CODEBASE      │            │ SOMETHING       │            │ CODE            │
└───────┬───────┘            └────────┬────────┘            └────────┬────────┘
        │                             │                              │
        ▼                             ▼                              ▼
┌───────────────┐            ┌─────────────────┐            ┌─────────────────┐
│Quick search?  │            │Creative work?   │            │Ready to commit? │
│  → Glob/Grep  │            │  → /brainstorm  │            │  → /commit      │
│               │            │                 │            │                 │
│Deep explore?  │            │Need plan?       │            │Need PR?         │
│  → Explore    │            │  → /writing-    │            │  → /commit-     │
│    agent      │            │    plans        │            │    push-pr      │
│               │            │                 │            │                 │
│Past context?  │            │Bug/failure?     │            │Review code?     │
│  → episodic-  │            │  → /systematic- │            │  → /review-pr   │
│    memory     │            │    debugging    │            │                 │
│               │            │                 │            │Deploy?          │
│Feature deep   │            │Frontend UI?     │            │  → /deploy      │
│dive?          │            │  → /frontend-   │            │                 │
│  → code-      │            │    design       │            │                 │
│    explorer   │            │                 │            │                 │
└───────────────┘            │Feature work?    │            └─────────────────┘
                             │  → /feature-dev │
                             │                 │
                             │SEO content?     │
                             │  → /seo-geo-    │
                             │    content      │
                             └─────────────────┘
```

---

## 5b. SEO Machine (`.seomachine/`)

A **separate Claude Code workspace** embedded in this project for SEO content creation. Run commands from within the `.seomachine/` directory.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SEO MACHINE WORKFLOW                               │
│                                                                             │
│   /research          /write            /rewrite          /optimize          │
│       │                 │                  │                 │              │
│       ▼                 ▼                  ▼                 ▼              │
│  ┌─────────┐      ┌─────────┐        ┌─────────┐       ┌─────────┐         │
│  │Keyword  │      │Draft    │        │Improve  │       │SEO      │         │
│  │research │─────▶│article  │───────▶│existing │──────▶│scoring  │         │
│  │+ SERP   │      │2000-3000│        │content  │       │0-100    │         │
│  │analysis │      │words    │        │         │       │         │         │
│  └─────────┘      └─────────┘        └─────────┘       └─────────┘         │
│       │                 │                  │                 │              │
│       ▼                 ▼                  ▼                 ▼              │
│   /research/        /drafts/          /rewrites/         /output/          │
│                                                                             │
│   Additional: /analyze-existing, /performance-review                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### SEO Machine Commands

| Command | Purpose | Output Location |
|---------|---------|-----------------|
| `/research [topic]` | Keyword research, competitor analysis, content gaps | `/research/` |
| `/write [topic]` | Create 2000-3000+ word SEO article | `/drafts/` |
| `/rewrite [file]` | Improve existing content | `/rewrites/` |
| `/analyze-existing [url]` | Analyze live page performance | - |
| `/optimize [file]` | SEO scoring and suggestions | `/output/` |
| `/performance-review` | Review content performance via GSC | - |

### SEO Machine Context Files

Located in `.seomachine/context/`:

| File | Purpose |
|------|---------|
| `brand-voice.md` | Tone, messaging, personality |
| `writing-examples.md` | Exemplary content (like the LinkedIn article) |
| `style-guide.md` | Formatting, structure preferences |
| `target-keywords.md` | Keyword clusters and topics |
| `internal-links-map.md` | Site pages for internal linking |
| `seo-guidelines.md` | SEO requirements and rules |
| `competitor-analysis.md` | Competitor insights |
| `features.md` | Product/service features |

### SEO Machine vs Main Skills

| Use Case | Tool |
|----------|------|
| Full SEO content workflow | SEO Machine (`/research` → `/write`) |
| Quick content with SEO focus | `/seo-geo-content` skill |
| GSC data analysis | `mcp__gsc__*` tools |

---

## 6. For This Project (Obieo)

### SEO & Content Workflow

```
Full Content Pipeline (in .seomachine/):
  /research → /write → /optimize → /performance-review

Quick SEO Content:
  /seo-geo-content → Write optimized content

Search Console Analysis:
  mcp__gsc__get_search_analytics → Performance data
  mcp__gsc__inspect_url_enhanced → Check indexing

Browser Testing:
  mcp__claude-in-chrome__* → Test live site

Writing Examples Reference:
  .seomachine/context/writing-examples.md → Brand voice samples (LinkedIn article, etc.)
```

### Development Workflow

```
New Feature:
  /brainstorming → /writing-plans → /feature-dev → /test-driven-development

Bug Fix:
  /systematic-debugging → fix → /verification-before-completion

Ship:
  /commit-push-pr → /review-pr → /deploy
```

---

## Quick Command Reference

| I want to... | Use |
|--------------|-----|
| Find a file | `Glob` with pattern |
| Search code | `Grep` or `Explore` agent |
| Understand a feature | `feature-dev:code-explorer` |
| Plan a feature | `/brainstorming` → `/writing-plans` |
| Build UI | `/frontend-design` |
| Write SEO content | `/seo-geo-content` |
| Debug an issue | `/systematic-debugging` |
| Review my code | `/requesting-code-review` |
| Create a commit | `/commit` |
| Create a PR | `/commit-push-pr` |
| Deploy | `/deploy` |
| Check GSC data | `mcp__gsc__get_search_analytics` |
| Automate browser | `mcp__claude-in-chrome__*` |
| Recall past work | `/remembering-conversations` |
