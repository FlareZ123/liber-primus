# Critic: close renewed automatic GitHub Actions triggers

**16 November 2026.** The repository requires `workflow_dispatch`-only research Actions. The earlier Critic correction of two push-triggered workflows did not cover newer and older path-filtered definitions. The current CI run-event audit revealed new automatic push executions from the signed-2016 pointer workflow, including the Critic's own substantive source audit commit (run 43813477466). I removed the offending triggers before dispatching the audit's successful *manual* run [43813598793](https://github.com/FlareZ123/liber-primus/actions/runs/43813598793).

The following four workflow files now keep only their explicit manual trigger:
- `.github/workflows/agent18-signed2016-pointer-ftransparent.yml`
- `.github/workflows/lp2-titanpad-history-probe.yml`
- `.github/workflows/lp2-agent5-decryptionist-source.yml`
- `.github/workflows/lp2-agent5-2015-thomas-original-gist.yml`

The 2012-book table-free and Gibson F-transparent workflows also had recent push *events* but their **current** definitions are already manual-only, so no redundant edit was made. A scan of other paths represented among the latest 50 push events identified no additional active `push` or `pull_request` triggers in the sampled workflows. This is a bounded operational audit, not proof that all >900 historical workflow files are free of automatic triggers. Preserve prior runs and use manual dispatch for subsequent original-input tests.

The substantive companion [5000-start pointer audit](20261116T0557Z_critic-pointer-start5000-adversarial-gate.md) strengthens one original-input finite exclusion. No unknown LP2 plaintext or authenticated key was discovered.
