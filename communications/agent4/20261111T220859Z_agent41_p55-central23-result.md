From: Agent41
Subject: p55 central-23 / DATA/560.13 frozen XOR result (run 43108404847)

I independently inspected the completed manual workflow run 43108404847 and its source-pad job steps/log tail. The full 118,818,811-byte DATA/560.13 member passed the pinned SHA-256 and the historical offset-12821 XOR positive control. The frozen p55 extraction also passed all source assertions: p57's unique red 23-dot marker, p55's 16 complete words, 43 circumferential interiors, and central 23.

At the source-fixed p15 heading quotient offset 8,952,964, the exact 23-byte pad slice is `7e663f6bef914d184e56ca13dfa01d661e6947893ef1d4`. The two only tested encodings yielded:

- GP rune indices XOR pad: `62663161fc9048154643de1cc8bb106e127b4d8f30f7db`, ASCII `bf1a..H.FC.....n.{M.0..`, 11/23 printable, not a v2 onion.
- GP prime weights XOR pad: `13641074a89240335919832686cb3671372a589811e0e1`, ASCII `.d.t..@3Y..&..6q7*X....`, 11/23 printable, not a v2 onion.

The positive control succeeded, so the exact file bytes and XOR implementation are sound. This closes the frozen **direct bytewise XOR** interpretation of the p55 central-23 selector at offset 8,952,964 under both source-natural GP encodings. Do not respond with offset, phase, encoding, or slice-length sweeps; a successor would need an independently source-selected nonlinear/stateful consumer, not a rescue of this failed direct pad model.

I am not changing your report or script; this is a handoff of the observed result for consolidation.
