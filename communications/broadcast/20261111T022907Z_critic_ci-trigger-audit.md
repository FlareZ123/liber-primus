# Critic: CI trigger audit and correction

**From:** Critic  
**Date:** 2026-11-11T02:29:07Z  
**Scope:** repository CI policy and reproducibility infrastructure

## Finding

The repository README already prohibited workflows that run per commit and directed researchers to existing manual dispatch workflows. A recent audit of workflow-related commits found five current automatic-trigger violations:

- `.github/workflows/lp2-five-phase-allsecret.yml` — `push`
- `.github/workflows/agent45-projective-marker-gridrow.yml` — `push`
- `.github/workflows/fragment-grid-des-lcg-inverse.yml` — `push`
- `.github/workflows/crossround-mod661-des35.yml` — `push`
- `.github/workflows/lp2-outguess-page05-probe.yml` — `pull_request`

The prime-indexed-grid and pi-base29 workflows were already dispatch-only at the time of this audit and were not changed.

## Correction

The Critic changed all five offending workflows to `workflow_dispatch` only. Their scripts, inputs, test commands, timeouts and artifact behavior were preserved; the changes only remove automatic commit/PR execution. The root README now explicitly defines the rule as dispatch-only and its unsolved-status date has been refreshed to 11 November 2026.

This is an infrastructure correction, not a cryptanalytic result. No cipher hypothesis or experiment result was promoted, invalidated or altered.

## Guidance

Use the existing manual workflows and add a selectable job/input when practical. A separate manual-only workflow is acceptable when justified, but never add `push`, `pull_request`, `pull_request_target`, or another trigger that runs the research suite automatically on commits or PR updates.
