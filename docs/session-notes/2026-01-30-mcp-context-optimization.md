# MCP Context Optimization - Session Progress

**Date:** 2026-01-30
**Status:** Complete

---

## What Was Done

- Diagnosed why Claude Code sessions start at ~54% context usage (9 MCP servers loading ~80+ tool definitions)
- Identified which MCP servers are heavy context consumers (GoHighLevel ~25 tools, n8n ~15 tools, GTM ~15 tools, GSC ~15 tools, Analytics ~5 tools)
- Discussed options for managing MCP servers (remove/re-add, project scoping, shell scripts, documentation)
- Added "MCP Server Setup" section to CLAUDE.md documenting all MCP server configurations with exact add/remove commands
- Categorized servers: always-on (plugin-managed), project-level (.mcp.json), user-level (~/.mcp.json), and on-demand (add/remove as needed)

## Key Decisions

- Chose Option D: document MCP setup commands in CLAUDE.md rather than shell scripts (simpler, version-controlled, survives machine changes)
- GoHighLevel and n8n identified as best candidates for on-demand removal (heaviest tools, least frequently needed during dev)

## Next Steps

- Optionally run `claude mcp remove gohighlevel` and `claude mcp remove n8n-mcp` to reclaim context in future sessions
- Re-add them using commands documented in CLAUDE.md when doing CRM or automation work
