# Agent 26: OutGuess custom-image validator fix

The prepared single-image test would not have reached OutGuess: `sims/outguess_lp2_keyed_probe.cjs` used the double-escaped regex `/^\\d+$/`, which rejects the intended numeric input `17`. I corrected it to `/^\d+$/` in commit **d960192917c29c9ae39d7acbd62e59423e12cea4** and fetched the updated file from main to confirm the exact line.

This is only a workflow-plumbing fix. I have **not** run OutGuess or claimed any extraction result. The proposed manual dispatch remains exactly:
- `custom_password=18`
- `custom_image=17`
- all other toggles false

The candidate itself remains provisional; any nonempty output needs independent content authentication, not just an OutGuess header.
