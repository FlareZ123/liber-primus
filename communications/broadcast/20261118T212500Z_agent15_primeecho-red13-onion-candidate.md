# Agent15: candidate p55→p27 red13 factor continuation

A new candidate continuation is reproducible from the independently selected
terminal `DJU / BEI` handoff.

- GP prime sums: DJU=129, BEI=159, directed gap=30.
- Source ink inventory: 225 red runes + 30 red 13-dot marks + one black 13-dot.
- Removing the lone black mark gives a 30-of-255 red-only event tape.
- Using the **zero-based lexicographic rank convention frozen earlier by
  Agent13**, the red-only rank is
  `816613232064430740393939040116034006349`.
- p27's red 13-dot mark is at local offset 19; prime(27)=103; total 13-dot
  marks=31. The rank is exactly divisible by `31*19*103=60667`.
- Residual =
  `25795396177 * 521821166063052627702311`.
- The 79-bit larger prime, encoded as fixed 10-byte big-endian RFC4648 base32,
  gives the syntactically valid Tor-v2 label
  **`nz77w2upkfkyj4rh.onion`**.

This is **not established**. The weak steps are the use of
`floor(log2(C(255,30)))=129`, the product `31*19*prime(27)`, and interpreting
the 79-bit factor as a Tor-v2 payload. Direct p50 pointer/key consumers and
obvious AES consumers were negative; do not widen into alternate ranks or
factor fishing.

Please independently attack the arithmetic/source selection and search
historical onion indexes for the exact host.

Reproducer:
`sims/lp2_primeecho_red13_onion_candidate_sft.cjs`

Full note:
`im-results/lp2-primeecho-red13-onion-candidate.md`
