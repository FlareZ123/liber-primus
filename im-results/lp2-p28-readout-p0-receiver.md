# READ OUT downstream receiver: GP0 55/20 selects a unique reachable 23-rune center-F p0 block

**Agent 1, 19 November 2026. Classification: independent structural continuation of the p28 READ OUT candidate. This materially strengthens the candidate plaintext, while the selected p0 block remains ciphertext.**

## Frozen continuation

After the p28 center-boundary transform produced the candidate plaintext **READ OUT**, take the words at face value under the same whole-word GP0 convention already established in the signed-2016→p50 navigation work.

Canonical GP29 encoding gives:

- `READ = [R,EA,D] = [4,28,23]`, GP0 sum **55**;
- `OUT = [O,U,T] = [3,1,16]`, GP0 sum **20**.

Use those two sums directly as p50 addresses. No key, phase, modulus or alternate spelling is introduced.

The original p50 table gives:

- `p50[55] = 80`;
- `p50[20] = 102`.

Under the already established p50-byte→p0-offset receiver, the candidate instruction therefore selects p0 offsets **80..102 inclusive**.

## Untouched p0 geometry

This selection is exact at both ends:

- offset80 is the **start of p0 word18**;
- offset102 is the **end of p0 word21**;
- the interval contains exactly four complete p0 ciphertext words18..21;
- the inclusive interval length is **23 runes**;
- its exact center, offset91, is **F = GP index0**.

The selected ciphertext words have:

| p0 word | span | length | raw GP0 sum | sum mod29 |
| --- | --- | ---: | ---: | ---: |
| 18 | 80..82 | 3 | 48 | 19 |
| 19 | 83..89 | 7 | 78 | 20 |
| 20 | 90..94 | 5 | 63 | 5 |
| 21 | 95..102 | 8 | 139 | 23 |

Thus three of the four word-sum residues are already selected DH values: **B=19, g=5, p=23**. The remaining residue20 is left uninterpreted; no adjustment is introduced to force a fourth DH field.

## Exact p0 census

Scan all p0 intervals of inclusive length23 whose left endpoint is a printed-word start, right endpoint is a printed-word end, and exact center rune is F.

There are exactly two:

- **80..102**, center91;
- **166..188**, center177.

Now impose only the actual p50 byte inventory. The decoded p50 table contains:

- value80 with multiplicity4;
- value102 with multiplicity1;
- value166 with multiplicity1;
- value188 with multiplicity0.

Therefore **80..102 is the only 23-rune whole-word-bounded center-F interval that is reachable at both ends from the actual p50 table at all**.

For a fixed pair of p50 addresses under a random permutation of the exact p50 byte multiset, the chance of those addresses landing on this unique reachable ordered endpoint pair is:

`4 / (256*255) = 4/65280 ≈ 0.0000612745 = 0.00612745%`.

This is a conditional fixed-grammar null. It does not include the broader discovery process that produced READ OUT.

## Homology with the source DH object

The independently selected physical p28 DH line6 has the same two coarse invariants:

- exactly **23 runes**;
- exact center rune **F**.

That line begins with literal `DH` and supplied the DH23 state from which the GP29 cube operation was derived. The READ OUT continuation therefore lands on a second 23-rune center-F object in p0.

Direct position-by-position cube-orbit comparison between the two 23-rune sequences does **not** produce a simple substitution, and center-out Hadamard traversal of the new block does not immediately yield prose. Those minimal direct consumers are rejected rather than tuned.

## Decision

This is the first downstream consequence of READ OUT obtained by applying an already established navigation grammar to the recovered words themselves. It was not part of the lexicon search that produced READ OUT.

The candidate plaintext should therefore be upgraded from an isolated language hit to a **strong source-linked plaintext candidate with an independent structural continuation**:

`READ OUT -> GP0(55,20) -> p50(80,102) -> unique reachable p0 23-rune center-F block`.

The selected p0 block is a concrete new receiver for subsequent cryptanalysis. Future work should preserve its exact 23-rune boundaries and center F. The next useful operation must be source-selected by the DH23/H/cube route or by another independent clue; do not search arbitrary transforms of the block.

## Reproduction

Run:

`node sims/lp2_p28_readout_p0_receiver_sft.cjs`

The SFT derives the two GP0 sums, performs the original p50 lookups, reparses p0 word geometry, verifies the exact 23-rune center-F receiver, exhausts every comparable p0 interval, checks reachability against the exact p50 byte multiset, computes the fixed-address multiset-permutation null, and asserts the 23-rune center-F homology with p28 DH line6.
