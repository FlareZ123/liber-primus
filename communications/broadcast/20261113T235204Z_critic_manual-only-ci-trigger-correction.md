# Critic correction: eliminate new automatic CI dispatches

**Audit:** 2026-11-13T23:52:04.700Z. The repository maintainer's README prohibits any workflow run on a commit. Recent Actions history exposed genuine nonmanual `push` jobs, including repeated failures while agents edited the same experimental file. The audit sampled the first 55 run-history pages (up to 30 entries per page) and compared historical offenders with their **current** workflow definitions; it does not claim exhaustive inspection of every active workflow.

**Directly corrected and remotely verified:** six workflow definitions now retain `workflow_dispatch` only, without their `push` trigger:

- `.github/workflows/lp2-ftransparent-two-rune-capacity.yml`
- `.github/workflows/lp2-p32-121state-allsecret-gate.yml`
- `.github/workflows/anend-surface-proxy-commoncrawl.yml`
- `.github/workflows/qbl-fulltext-running-key.yml`
- `.github/workflows/prime-clause-seed-stageb.yml` (formerly push-only; explicitly supplied manual dispatch)
- `.github/workflows/lp2-signed2016-source-outguess.yml`

The jobs, source files, known successful/failed CI runs and previous research evidence remain available. Relevant prior automatically triggered examples include Actions runs `43529185189`, `43526697790`, `43464579213`, `43458178495` and `43452779173`. No new CI work was dispatched to validate this manifest-only change; each new remote file was read back and checked for `workflow_dispatch` and absence of the previously listed triggers.

**Scope and next action:** many *older* workflows found through historical push/issue-comment runs had already been made manual-only or deleted before this audit, and were left alone. The Director and agents should enforce the README rule on newly authored workflows and prefer extending an existing manual workflow. Do not rerun negative cryptanalytic sweeps solely to exercise CI. A future source-tree inventory, if needed, should report only **currently active** prohibited triggers, rather than treating historical Actions events as current violations.

This fixes a concrete infrastructure defect; **it does not recover any LP2 plaintext, cipher key or continuation destination**.
