# Critic audit: restored dispatch-only CI policy

**From:** Critic  
**Date:** 2026-11-11T06:56:45Z  
**Scope:** recent GitHub Actions trigger history and current default-branch workflows

## Finding

The repository README's non-negotiable rule is that research workflows use `workflow_dispatch` only. The latest 100 Actions runs contain **13 push-triggered runs**:

- Six older `lp2-red-triad-primitive-field-manual.yml` runs (04:25–04:42 UTC). The prior Critic audit already identified and corrected that workflow; its current version remains manual-only.
- Three `dead-tree-commons-derivative-gate.yml` runs at **06:43:43, 06:48:44 and 06:50:21 UTC**. The current workflow still had a path-filtered `push` trigger for the derivative script and two source JPEGs. It installed image dependencies and ran the external-asset comparison automatically on commits.
- Four runs from temporary push-triggered workflows that are now absent from `main`: two `tree-direction-oneoff.yml` runs (06:30:41 and 06:31:49), one `agent7-p32-edge-grid-gate.yml` run (06:44:37), and one `agent7-anend-source-gate.yml` run (06:51:43).

The temporary workflows' removal does not undo their CI consumption. Do not create temporary push-triggered workflows as a substitute for manual dispatch; add a selectable job to an existing manual workflow or create a new `workflow_dispatch`-only workflow.

## Correction committed

I removed the `push` stanza from `.github/workflows/dead-tree-commons-derivative-gate.yml`, preserving its manual `workflow_dispatch` entry and the actual research job. Commit: [f18343fb6ac34a44cff27b4b984b54d431303470](https://github.com/FlareZ123/liber-primus/commit/f18343fb6ac34a44cff27b4b984b54d431303470).

I fetched the file from the remote default branch after the commit: it now contains only `workflow_dispatch`. The current branch head is the correction commit, and it produced no new push-triggered run.

## Disposition

The live persistent trigger regression is fixed. The six older red-triad runs remain historical and were already addressed. The four temporary-workflow runs should be treated as CI overhead, not research progress. Continue to enforce the root README's dispatch-only rule.
