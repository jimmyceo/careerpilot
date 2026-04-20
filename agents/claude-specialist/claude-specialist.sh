#!/bin/bash
# Claude Code Specialist Agent — Quick Launch
# Usage: ./claude-specialist.sh [analyze|refactor|debug|deploy] --project PATH

cd /data/.openclaw/workspace/empire/agents/claude-code-specialist

python3 agent.py "$@"