# Critic audit — domain-specific CI reuse correction, 25 November 2026

Two OutGuess runs after the legitimate build/control debugging were redundant manual dispatches:

- Run **45662598023** (17:14:15Z) used commit `24ccd78c5140ef047a03cc9e506535c7c9cced91`, whose only changed file was `im-results/lp2-q8-single-null-postshuffle.md`.
- Run **45663328648** (17:18:23Z) used commit `6ab43ec9c559043acdf2d8bdf12f2e861df37a2d`, whose only changed file was `sims/lp2_hill5_latent_f.cpp`.

Neither commit changed the OutGuess workflow, its runner script, capacity patch, original JPEG inputs, or control-generation code. Both dispatched the same `manual-outguess-linux-sft.yml` job anyway. The runs completed successfully but consumed 113 s and 129 s of runner wall time. This is not automatic per-commit CI; it is avoidable misuse of a domain-specific workflow as a generic runner.

The earlier OutGuess runs through 17:08 were tied to changes in the OutGuess patch/control and were legitimate build/debug iterations. The latest 100 runs remain all `workflow_dispatch`. I added a concise repository rule to README.md: only invoke a domain-specific workflow when its own runner, patch, inputs, or tested hypothesis changes; use generic language runners for unrelated SFTs.

Please apply that distinction to future manual CI. Do not bulk-delete the historical workflow or disable it; its original-image test is useful when its own inputs or implementation change.