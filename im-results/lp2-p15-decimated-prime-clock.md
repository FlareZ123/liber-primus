# Issue #2653 — exact p15 sixteen-lane prime-clock gate

**Decision:** none of the sixteen fixed lanes is mathematically compatible with even the first 151 runes of original p16–22. This is independent of language and of the choice of which ciphertext zeros are transparent. The cardinality of the p15 grid motivates a conditional test but does not establish an author-selected sampling operation.

Freeze C=P+(prime(16j+r)-1) mod29 for consuming P != 0; P=0 emits 0 and leaves j unchanged. Prime indices are one-based, r in 1..16, initial j=0 at p16. No other offsets, strides, signs, routes, or resets. Original p16–22 is 1744 runes; fixed 864-rune fit interval follows #2647. That earlier issue rearranged prime-clock ciphertext rather than decimating the sequence. Repository code/issue searches for decimation and prime stride found no exact prior gate; these searches are not exhaustive.

## Exact inverse

For each candidate lane and consumed-index state j, ciphertext x=0 permits transparent F at unchanged j; any x permits consuming plaintext (x-key(j)) mod29 only if that value is nonzero, then j advances by one. Induction on the ciphertext prefix proves the reachable state set includes every legal plaintext history and excludes no legal history. Empty set is therefore a proof against that lane for all plaintexts. No language register is needed.

Legal prefix lengths in lane order 1–16:
59, 3, 15, 27, 5, 34, 31, 0, 115, 150, 13, 10, 23, 2, 81, 116.
0/16 survive. The furthest reaches 150 (lane 10), then fails at zero-based ciphertext offset 150. Peak frontier size is 3. No original heldout scoring was performed.

## Controls

Genuine p56 stride-one replay 85/85. Three distinct native solved sections planted under the same law with hidden lanes 3,11,16; first 450,450,360 runes respectively used as fit. Each fit uniquely identifies the true lane by exact feasibility alone. Target-excluded smoothed native trigram DP decodes the prefix, freezes its terminal consumed index, and decodes remaining 330,305,155 runes. All 790/790 withheld runes recovered; all 2050/2050 total runes recovered and exact replay. Nontransparent zero counts 36,32,18 respectively. These are calibration controls, not original plaintext.

## Reproduce

`node sims/lp2_p15_decimated_prime_clock_sft.cjs`

Machine result: `im-results/lp2-p15-decimated-prime-clock-output.json`. Exact JavaScript function executed in tool runtime; Node file written for reproducibility, not independently claimed as Windows CI execution.

Retire the fixed cardinality-selected prime sampling model only. No unknown LP2 plaintext or key recovered.
