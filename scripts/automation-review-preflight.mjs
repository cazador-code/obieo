#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const FAILURE_CLASSES = {
  writePath: 'SANDBOX_WRITE_PATH_FAILURE',
  bootstrap: 'DEPENDENCY_BOOTSTRAP_FAILURE',
  network: 'NETWORK_GITHUB_FAILURE',
  auth: 'AUTH_FAILURE',
}

const BLOCKED_CLASSIFICATIONS = [
  {
    failureClass: FAILURE_CLASSES.writePath,
    classification: 'SANDBOX_BLOCKED',
    confidence: 0.99,
    nextAction:
      'Fix the repo-local artifact/state write path first, then rerun preflight before any analysis.',
  },
  {
    failureClass: FAILURE_CLASSES.auth,
    classification: 'AUTH_BLOCKED',
    confidence: 0.98,
    nextAction:
      'Restore required auth credentials, verify access with preflight, then rerun the automation.',
  },
  {
    failureClass: FAILURE_CLASSES.network,
    classification: 'NETWORK_BLOCKED',
    confidence: 0.98,
    nextAction:
      'Restore GitHub or network reachability first, then rerun preflight before any analysis or write step.',
  },
  {
    failureClass: FAILURE_CLASSES.bootstrap,
    classification: 'ENVIRONMENT_BLOCKED',
    confidence: 0.97,
    nextAction:
      'Install or restore the missing local dependency/tooling requirements, then rerun preflight before analysis.',
  },
]

const JOBS = {
  'nightly-code-health': {
    name: 'Nightly code health',
    requiredCommands: ['git', 'rg', 'curl', 'gh'],
    requiredFiles: ['package.json'],
    requiresGitHubNetwork: true,
    requiresGitHubAuth: true,
  },
  'weekly-dependency-audit': {
    name: 'Weekly dependency audit',
    requiredCommands: ['git', 'node', 'npm', 'rg', 'curl', 'gh'],
    requiredFiles: ['package.json', 'package-lock.json'],
    requiresGitHubNetwork: true,
    requiresGitHubAuth: true,
  },
  'nightly-test-gaps': {
    name: 'Nightly test gaps',
    requiredCommands: ['git', 'node', 'npm', 'rg', 'curl', 'gh'],
    requiredFiles: ['package.json', 'tsconfig.json'],
    requiredPaths: ['node_modules/.bin/tsc'],
    requiresGitHubNetwork: true,
    requiresGitHubAuth: true,
  },
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    encoding: 'utf8',
    env: options.env ?? process.env,
  })
}

function cleanText(value) {
  return (value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function trimOutput(value) {
  const text = cleanText(value)
  if (!text) {
    return ''
  }
  return text.length > 220 ? `${text.slice(0, 217)}...` : text
}

function addCheck(report, { name, ok, failureClass = null, detail, meta = {} }) {
  report.checks.push({
    name,
    status: ok ? 'pass' : 'fail',
    failureClass,
    detail,
    ...meta,
  })

  if (!ok && failureClass && !report.failureClasses.includes(failureClass)) {
    report.failureClasses.push(failureClass)
  }
}

function ensureWritableDirectory(dirPath) {
  mkdirSync(dirPath, { recursive: true })
  const probePath = path.join(dirPath, '.write-probe')
  writeFileSync(probePath, 'ok\n', 'utf8')
  unlinkSync(probePath)
}

function ensureStateMemory(stateFilePath, title) {
  if (existsSync(stateFilePath)) {
    return
  }

  writeFileSync(
    stateFilePath,
    `# ${title}\n\nRepo-local automation memory.\n`,
    'utf8',
  )
}

function getRepoRoot() {
  const result = run('git', ['rev-parse', '--show-toplevel'])
  if (result.status !== 0) {
    return {
      ok: false,
      detail: trimOutput(result.stderr) || 'Not inside a git worktree.',
      value: process.cwd(),
    }
  }

  return {
    ok: true,
    detail: `Resolved repo root to ${cleanText(result.stdout)}`,
    value: cleanText(result.stdout),
  }
}

function checkCommand(commandName, cwd) {
  const result = run('which', [commandName], { cwd })
  if (result.status === 0) {
    return {
      ok: true,
      detail: `${commandName} available at ${cleanText(result.stdout)}`,
    }
  }

  return {
    ok: false,
    detail: trimOutput(result.stderr) || `Missing required command: ${commandName}`,
  }
}

function checkGitHubNetwork(cwd) {
  const result = run(
    'curl',
    [
      '--silent',
      '--show-error',
      '--location',
      '--output',
      '/dev/null',
      '--write-out',
      '%{http_code}',
      '--max-time',
      '10',
      'https://api.github.com',
    ],
    { cwd },
  )

  if (result.status !== 0) {
    return {
      ok: false,
      detail: trimOutput(result.stderr) || 'GitHub network check failed.',
    }
  }

  const httpCode = cleanText(result.stdout)
  const numericCode = Number(httpCode)
  if (!Number.isFinite(numericCode) || numericCode < 200 || numericCode >= 500) {
    return {
      ok: false,
      detail: `GitHub network check returned HTTP ${httpCode || 'unknown'}.`,
    }
  }

  return {
    ok: true,
    detail: `GitHub network reachable (HTTP ${httpCode}).`,
  }
}

function checkGitHubAuth(cwd) {
  const result = run('gh', ['auth', 'status'], { cwd })
  if (result.status === 0) {
    return {
      ok: true,
      detail: 'GitHub CLI auth is ready.',
    }
  }

  return {
    ok: false,
    detail: trimOutput(result.stderr || result.stdout) || 'GitHub CLI auth is not ready.',
  }
}

function deriveBlockedOutcome(report) {
  for (const mapping of BLOCKED_CLASSIFICATIONS) {
    if (report.failureClasses.includes(mapping.failureClass)) {
      const evidence = report.checks
        .filter((check) => check.failureClass === mapping.failureClass)
        .map((check) => `${check.name}: ${check.detail}`)

      return {
        classification: mapping.classification,
        confidence: mapping.confidence,
        concreteEvidence: evidence,
        recommendedNextAction: mapping.nextAction,
      }
    }
  }

  return {
    classification: 'ENVIRONMENT_BLOCKED',
    confidence: 0.8,
    concreteEvidence: report.checks
      .filter((check) => check.status === 'fail')
      .map((check) => `${check.name}: ${check.detail}`),
    recommendedNextAction:
      'Resolve the blocking preflight checks, then rerun preflight before any analysis.',
  }
}

function main() {
  const jobId = process.argv[2]
  const job = JOBS[jobId]

  if (!job) {
    console.error(`Unknown automation job "${jobId}".`)
    console.error(`Valid jobs: ${Object.keys(JOBS).join(', ')}`)
    process.exit(64)
  }

  const repoRootResult = getRepoRoot()
  const repoRoot = repoRootResult.value
  const storageRoot = path.join(repoRoot, 'automation-review', jobId)
  const stateDir = path.join(storageRoot, 'state')
  const runsDir = path.join(storageRoot, 'runs')
  const runId = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
  const artifactDir = path.join(runsDir, runId)
  const stateFile = path.join(stateDir, 'memory.md')
  const localReportPath = path.join(artifactDir, 'report.md')
  const report = {
    schemaVersion: 1,
    reportType: 'automation-review-preflight',
    jobId,
    jobName: job.name,
    runId,
    createdAt: new Date().toISOString(),
    status: 'READY',
    readyForCodeAnalysis: true,
    repoRoot,
    artifactDir,
    stateDir,
    stateFile,
    localReportPath,
    classification: 'INSUFFICIENT_EVIDENCE',
    confidence: 0.6,
    concreteEvidence: [],
    recommendedNextAction:
      'Run the configured automation analysis only after preflight returns READY.',
    failureClasses: [],
    checks: [],
    guidance:
      'Only continue with code analysis when status is READY. If status is BLOCKED, stop after reporting the preflight result and do not claim CODE_ISSUE or TEST_GAP.',
  }

  addCheck(report, {
    name: 'git_worktree',
    ok: repoRootResult.ok,
    failureClass: repoRootResult.ok ? null : FAILURE_CLASSES.bootstrap,
    detail: repoRootResult.detail,
  })

  let canWriteReport = false

  try {
    ensureWritableDirectory(stateDir)
    ensureWritableDirectory(artifactDir)
    ensureStateMemory(stateFile, job.name)
    canWriteReport = true
    addCheck(report, {
      name: 'repo_local_artifact_state_dirs',
      ok: true,
      detail: `Using repo-local artifact dir ${artifactDir} and state dir ${stateDir}.`,
    })
  } catch (error) {
    addCheck(report, {
      name: 'repo_local_artifact_state_dirs',
      ok: false,
      failureClass: FAILURE_CLASSES.writePath,
      detail: trimOutput(error instanceof Error ? error.message : String(error)),
    })
  }

  for (const requiredFile of job.requiredFiles) {
    const absolutePath = path.join(repoRoot, requiredFile)
    addCheck(report, {
      name: `required_file:${requiredFile}`,
      ok: existsSync(absolutePath),
      failureClass: existsSync(absolutePath) ? null : FAILURE_CLASSES.bootstrap,
      detail: existsSync(absolutePath)
        ? `Found ${requiredFile}.`
        : `Missing required file ${requiredFile}.`,
    })
  }

  for (const requiredPath of job.requiredPaths ?? []) {
    const absolutePath = path.join(repoRoot, requiredPath)
    addCheck(report, {
      name: `required_path:${requiredPath}`,
      ok: existsSync(absolutePath),
      failureClass: existsSync(absolutePath) ? null : FAILURE_CLASSES.bootstrap,
      detail: existsSync(absolutePath)
        ? `Found ${requiredPath}.`
        : `Missing required path ${requiredPath}.`,
    })
  }

  for (const commandName of job.requiredCommands) {
    const commandCheck = checkCommand(commandName, repoRoot)
    addCheck(report, {
      name: `required_command:${commandName}`,
      ok: commandCheck.ok,
      failureClass: commandCheck.ok ? null : FAILURE_CLASSES.bootstrap,
      detail: commandCheck.detail,
    })
  }

  let gitHubNetworkOk = true

  if (job.requiresGitHubNetwork) {
    const networkCheck = checkGitHubNetwork(repoRoot)
    gitHubNetworkOk = networkCheck.ok
    addCheck(report, {
      name: 'github_network',
      ok: networkCheck.ok,
      failureClass: networkCheck.ok ? null : FAILURE_CLASSES.network,
      detail: networkCheck.detail,
    })
  }

  if (job.requiresGitHubAuth) {
    if (!gitHubNetworkOk) {
      addCheck(report, {
        name: 'github_auth',
        ok: true,
        failureClass: null,
        detail: 'Skipped GitHub auth check because GitHub network is not ready.',
        meta: {
          status: 'skipped',
        },
      })
    } else {
      const authCheck = checkGitHubAuth(repoRoot)
      addCheck(report, {
        name: 'github_auth',
        ok: authCheck.ok,
        failureClass: authCheck.ok ? null : FAILURE_CLASSES.auth,
        detail: authCheck.detail,
      })
    }
  }

  if (report.failureClasses.length > 0) {
    report.status = 'BLOCKED'
    report.readyForCodeAnalysis = false
    Object.assign(report, deriveBlockedOutcome(report))
  } else {
    report.classification = 'INSUFFICIENT_EVIDENCE'
    report.confidence = 0.75
    report.concreteEvidence = [
      'Preflight completed successfully and analysis may begin.',
    ]
    report.recommendedNextAction =
      'Run the job-specific analysis and classify the final outcome from verified evidence.'
  }

  if (canWriteReport) {
    writeFileSync(
      path.join(artifactDir, 'preflight.json'),
      `${JSON.stringify(report, null, 2)}\n`,
      'utf8',
    )
    writeFileSync(
      path.join(stateDir, 'last-preflight.json'),
      `${JSON.stringify(report, null, 2)}\n`,
      'utf8',
    )
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  process.exit(report.status === 'READY' ? 0 : 2)
}

main()
