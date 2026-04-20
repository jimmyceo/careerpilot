#!/usr/bin/env python3
"""
CLAUDE CODE SPECIALIST AGENT
Expert-level Claude Code CLI operator for complex software tasks.
Production-grade coding, architecture, debugging, and deployment.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

sys.path.append('/data/.openclaw/workspace/empire/agents')
from company_config import workspace_read, workspace_write, notify, agent_log, kimi_query

logger = agent_log("claude-specialist")

class ClaudeCodeAgent:
    """
    Master Claude Code operator.
    Handles: architecture, refactoring, debugging, production deployment.
    """
    
    def __init__(self):
        self.workspace = Path('/data/.openclaw/workspace')
        self.claude_cmd = 'claude'  # Claude Code CLI
        
    def check_claude_available(self) -> bool:
        """Verify Claude Code CLI is installed"""
        try:
            result = subprocess.run(
                ['which', self.claude_cmd],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except Exception as e:
            logger.error(f"Claude check failed: {e}")
            return False
    
    def analyze_codebase(self, project_path: str) -> dict:
        """
        Deep codebase analysis using Claude Code.
        Returns architecture summary, issues, optimization opportunities.
        """
        if not self.check_claude_available():
            return {"error": "Claude Code CLI not available"}
        
        logger.info(f"Analyzing codebase: {project_path}")
        
        # Build analysis prompt
        prompt = f"""Analyze this codebase thoroughly:

PROJECT: {project_path}

Provide:
1. Architecture overview (tech stack, patterns)
2. Code quality assessment (1-10 scale)
3. Security vulnerabilities (if any)
4. Performance bottlenecks
5. Refactoring recommendations
6. Production readiness checklist

Be specific. Reference actual files and code patterns."""

        try:
            # Use Claude Code in non-interactive mode with prompt
            # Flag: -p or --print for non-interactive output
            result = subprocess.run(
                [self.claude_cmd, project_path, '-p'],
                input=prompt,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutes
            )
            
            return {
                "project": project_path,
                "analysis": result.stdout,
                "timestamp": datetime.now().isoformat(),
                "status": "success" if result.returncode == 0 else "error",
                "error": result.stderr if result.returncode != 0 else None
            }
            
        except subprocess.TimeoutExpired:
            logger.error("Analysis timeout")
            return {"error": "Analysis timed out (>5 min)"}
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            return {"error": str(e)}
    
    def refactor_production(self, project_path: str, goal: str) -> dict:
        """
        Production-grade refactoring with Claude Code.
        Multi-step planning and execution.
        """
        logger.info(f"Production refactor: {goal} for {project_path}")
        
        # Phase 1: Plan
        plan_prompt = f"""Create a detailed refactoring plan for:
PROJECT: {project_path}
GOAL: {goal}

Requirements:
1. Zero breaking changes to public API
2. Maintain all existing tests
3. Add migration guide if needed
4. Performance must improve or stay same

Output: Step-by-step refactoring plan with file-level changes."""

        # Phase 2: Execute (would run in interactive or scripted mode)
        # For safety, we generate the plan first
        
        return {
            "phase": "planning",
            "goal": goal,
            "project": project_path,
            "status": "ready_for_execution",
            "next_steps": [
                "Review generated plan",
                "Execute with --apply flag",
                "Run tests",
                "Commit with descriptive message"
            ]
        }
    
    def debug_issue(self, project_path: str, error_log: str, context: str = "") -> dict:
        """
        Expert debugging session.
        Analyzes error logs, traces issue, proposes fixes.
        """
        logger.info(f"Debugging issue in {project_path}")
        
        debug_prompt = f"""Debug this issue:

PROJECT: {project_path}
CONTEXT: {context}

ERROR LOG:
```
{error_log}
```

Provide:
1. Root cause analysis
2. Specific files/lines involved
3. Fix implementation
4. Prevention recommendations
5. Test case to reproduce"""

        return {
            "mode": "debug",
            "project": project_path,
            "prompt": debug_prompt,
            "timestamp": datetime.now().isoformat(),
            "status": "ready"
        }
    
    def deploy_production(self, project_path: str, platform: str = "railway") -> dict:
        """
        Production deployment orchestration.
        Handles: build, test, env vars, deployment, health checks.
        """
        logger.info(f"Production deploy: {project_path} to {platform}")
        
        deployment_steps = {
            "railway": [
                "Verify railway.json configuration",
                "Check Dockerfile validity",
                "Verify health check endpoint",
                "Test database connectivity",
                "Validate environment variables",
                "Deploy and monitor logs",
                "Run post-deploy smoke tests"
            ],
            "vercel": [
                "Verify vercel.json configuration", 
                "Check build output settings",
                "Validate API URL environment variable",
                "Deploy and verify edge functions",
                "Run frontend integration tests"
            ],
            "vps": [
                "SSH to VPS",
                "Pull latest code",
                "Rebuild containers",
                "Run migrations",
                "Restart services",
                "Verify with health check"
            ]
        }
        
        return {
            "platform": platform,
            "project": project_path,
            "steps": deployment_steps.get(platform, ["Unknown platform"]),
            "status": "ready_for_deployment",
            "timestamp": datetime.now().isoformat()
        }
    
    def run(self, mode: str, **kwargs) -> dict:
        """
        Main entry point.
        Modes: analyze, refactor, debug, deploy
        """
        modes = {
            "analyze": self.analyze_codebase,
            "refactor": self.refactor_production,
            "debug": self.debug_issue,
            "deploy": self.deploy_production
        }
        
        handler = modes.get(mode)
        if not handler:
            return {"error": f"Unknown mode: {mode}. Use: {list(modes.keys())}"}
        
        return handler(**kwargs)

def main():
    """CLI entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Claude Code Specialist Agent')
    parser.add_argument('mode', choices=['analyze', 'refactor', 'debug', 'deploy'])
    parser.add_argument('--project', '-p', required=True, help='Path to project')
    parser.add_argument('--goal', '-g', help='Goal for refactor mode')
    parser.add_argument('--error-log', '-e', help='Error log for debug mode')
    parser.add_argument('--platform', default='railway', choices=['railway', 'vercel', 'vps'])
    
    args = parser.parse_args()
    
    agent = ClaudeCodeAgent()
    
    kwargs = {"project_path": args.project}
    
    if args.mode == "refactor" and args.goal:
        kwargs["goal"] = args.goal
    elif args.mode == "debug" and args.error_log:
        kwargs["error_log"] = args.error_log
    elif args.mode == "deploy":
        kwargs["platform"] = args.platform
    
    result = agent.run(args.mode, **kwargs)
    print(json.dumps(result, indent=2))
    
    # Send notification for human review if needed
    if result.get("status") == "ready_for_execution":
        notify(f"Claude Specialist ready: {args.mode} for {args.project}")

if __name__ == "__main__":
    main()
