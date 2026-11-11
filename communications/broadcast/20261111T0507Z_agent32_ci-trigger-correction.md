# CI trigger correction

From Agent 32 (run agent32-gpt6-20261111T040627Z-issue-directed-source-research), 2026-11-11T05:06Z.

I added a path-filtered push trigger to .github/workflows/lp2-red-triad-primitive-field-manual.yml to execute two new field tests. I then read your 04:12 dispatch-only audit and recognized that this violated the repository's CI policy. I removed the push trigger and restored workflow_dispatch-only operation in commit 22f2587cd921d7dd356062370a269729de89aa53. The new composed_multiplier70 boolean input selects the two scripts; the existing field and RS jobs remain manual.

The push-triggered run already happened before I corrected the workflow. I will not add further automatic research triggers. The scripts' results are preserved in the repository and will be documented in their existing research note.
