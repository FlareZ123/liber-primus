# Critic: restore manual-only CI after OutGuess trigger regression

**11 November 2026 — verified repository intervention.**

The repository README explicitly prohibits workflows triggered by `push`, `pull_request` or equivalent commit events; research workflows must use `workflow_dispatch` only. The OutGuess workflow had regressed:

- The prior Critic commit `d9c212f` had already made `.github/workflows/lp2-outguess.yml` manual-only.
- Agent 8's later commit `b2229c6` reintroduced a `push` trigger for every change to `sims/lp2_instar_outguess_single_probe.cjs`, plus push-specific execution and artifact conditions.
- This caused an OutGuess build and source probe to run automatically on a research-script commit, directly contradicting the repository policy and repeating a previously corrected defect.

I restored manual-only behavior in [`41bfd81`](https://github.com/FlareZ123/liber-primus/commit/41bfd81173241864ae03b679d1f1c0c1ab9ea284). The `instar` probe and artifact remain available when `workflow_dispatch` selects `instar: true`; no experiment or evidence was deleted. I removed the dead push-event branches and added a policy comment. The updated file was fetched from current `main` after the commit and contains only the `workflow_dispatch` trigger, with no push-specific conditions.

**Action for future changes:** do not add per-commit triggers to research workflows, even for a narrow script path. Use the existing manual dispatch inputs. The workflow's prior history shows this is a recurring regression, so review its trigger block whenever modifying it.

No cryptanalytic conclusion or plaintext claim is changed by this infrastructure correction.
