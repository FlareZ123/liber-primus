# LP2 p0–2: locked second-passage checksum selects the recorded post-IDEA route

**Agent7, 18 November 2026. Classification:** strong conditional selector result. This report does not authenticate the full 27×27 plaintext route. It establishes a finite computational fact inside a clearly stated upstream family and identifies the remaining source-selection gap.

## Result

The previously locked LP1 cross-text target for the proposed second seven-word passage is:

```text
17 runes
rune-index sum 232
GP sum 854
```

The already source-connected prefix **THE IDEA** contributes:

```text
5 runes
rune-index sum 81
GP sum 301
```

Therefore the next five words have a frozen residual, fixed before this continuation search:

```text
12 runes
rune-index sum 151
GP sum 553
```

Starting from the recorded IDEA endpoint and granting only the five original three-cell source nodes connected by the published local geometry, an exhaustive search over the published Reports 01–19 transition family leaves **exactly one** continuation satisfying that residual. It is:

```text
OF | THE | END | IS | DEATH
```

The selector does not supply those words, per-block ciphertext lengths, ciphertext starts, reading directions, or direct-vs-center-totient key choice.

## Frozen upstream state

The incoming block is the already reproduced **IDEA** candidate:

- source node: A–TH–A at `(8,13),(11,16),(14,19)`;
- ciphertext: `(15,20),(16,19),(17,18)`;
- endpoint: D at `(17,18)`;
- phase: 1;
- accumulated phase state: `S=7`;
- outer state: `a=0`;
- preceding NOW THE beginning: `(11,16)`.

The five source nodes tested after IDEA are the local connected structures documented in the primary 27×27 route:

| Stage | Fixed original source node |
| --- | --- |
| 09 | J–D–J at `(15,20),(17,18),(19,16)` |
| 10 | OE–J–OE at `(18,16),(19,16),(20,16)` |
| 11 | J–B–J at `(19,16),(23,12),(27,8)` |
| 12 | H–R–H at `(21,17),(21,22),(21,27)` |
| 13 | J–B–J at `(19,16),(23,12),(27,8)` |

This source-node sequence is the principal remaining premise. The search below does not assume the recorded ciphertext placements or plaintext.

## Exhaustive family

For each of the five fixed nodes, the SFT considers:

1. both direct-center and Euler-totient-center key constructions, deduplicated when they give the same aligned key;
2. every in-bounds straight contiguous ciphertext segment on the eight grid directions;
3. every block length compatible with the locked total of 12 runes.

Because five independent blocks each have the Report 08 minimum of two ciphertext cells, no block can exceed four cells while the total remains 12. Enumerating lengths 2–4 is therefore complete for this target.

Every candidate transition is filtered by the primary project's published Reports 01–15, 17, 18 and 19 at pinned revision `d89cf1b16f849f6d59ca311553436e13075a71fb`. These filters use the carried phase/outer state and original grid coordinates. No dictionary or plaintext score is queried.

With only nonnegative target-bound pruning, the surviving partial-path counts are:

```text
after stage 09: 22
after stage 10: 46
after stage 11: 16
after stage 12: 34
after stage 13: 60
```

Applying the exact final residual `12 / 151 / 553` leaves:

```text
1 hit
```

## Unique survivor

| Stage | Selected source operation | Selected ciphertext | Decrypted runes |
| --- | --- | --- | --- |
| 09 | J–D–J → J–OE–J, center φ, phase 0 | `(18,15)→(18,16)` | O F |
| 10 | OE–J–OE → OE–OE–I, center φ, phase 2 | `(19,17)→(19,16)` | TH E |
| 11 | J–B–J → J–J–T, center φ, phase 2 | `(19,23)→(20,23)→(21,23)` | E N D |
| 12 | H–R–H → TH–H–H, center φ, phase 1 | `(21,9)→(21,10)` | I S |
| 13 | J–B–J → J–J–T, center φ, phase 2 | `(26,3)→(26,2)→(26,1)` | D EA TH |

The result simultaneously fixes all five center transformations, all five block lengths, all five starts, all five directions, and all twelve plaintext runes inside this family.

## Controls and why the transition family matters

The locked checksum does not select this phrase from an unconstrained grid.

Two deliberately broader controls were run before the final selector:

- keeping the five source nodes but allowing every straight segment of the recorded lengths in all eight directions gives approximately **1.11×10^15** checksum-matching five-block combinations;
- restricting starts to cells on or immediately around the locally connected mirror structures still leaves **719,861** checksum matches.

Thus the new evidence is specifically the conjunction of the independently locked LP1 numerical target with the published transition constraints and the fixed connected source-node sequence. The numerical target alone is far too weak.

## Interpretation

This result materially strengthens stages 09–13 relative to a phrase selected only by English scoring. Within the stated source-node family, the exact route is recovered by arithmetic and geometry before inspecting the resulting words.

Two dependencies remain:

1. **Source-node selection.** A manuscript-selected rule still must derive J–D–J → OE–J–OE → J–B–J → H–R–H → J–B–J from the original grid without importing the recorded route.
2. **Transition-rule provenance.** Reports 01–19 are retrospective empirical rules developed on the proposed route. Passing them plus an independent locked checksum is stronger than either alone, but it does not establish that Cicada authored those transition rules.

The next decisive experiment is therefore a source-only mirror-overlap traversal from the IDEA endpoint. If a simple local rule uniquely or nearly uniquely selects the five nodes above before using the checksum, this result becomes substantially more persuasive. If many source-node chains survive, the checksum must be tested across those chains and may lose uniqueness.

## Reproduction

Run:

```text
node sims/lp2_p0_second_passage_checksum_selector_sft.cjs
```

The SFT reads `resources/liber-primus/lp2-corpus.json`, implements the pinned transition predicates, exhaustively enumerates the finite family, asserts partial-path counts `[22,46,16,34,60]`, and asserts the unique recorded survivor.

Windows Node 22 CI run **44415672565** passed syntax and the exact selector on 18 November 2026.

Supporting implementation:

- `sims/lp2_p0_second_passage_checksum_selector_sft.cjs`
- `.github/workflows/agent7-p0-second-passage-checksum-selector.yml`
