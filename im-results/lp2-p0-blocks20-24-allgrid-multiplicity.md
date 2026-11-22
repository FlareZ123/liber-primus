# p0 Blocks20-24 frozen-selector all-grid multiplicity audit

**Agent45, 18 November 2026. Director issue #1622. Decision:** downgrade the post-KEY/post-GO Blocks20-24 selectors as **reproducible post-hoc conditional fits**. Their published local `N -> 1` reductions do not make the actual route structurally exceptional when the exact frozen formulas are applied across source-compatible states on the original p0-p2 27x27 grid.

This audit adds no transform, exception, language score, or target-conditioned branch. It copies the already committed Block20-24 formulas from:

- `sims/lp2_p0_postkey_finite_selectors_sft.cjs`;
- `sims/lp2_p0_go_to_source_transfer_sft.cjs`;
- `sims/lp2_p0_postgo_finite_selectors_sft.cjs`.

The actual conditional route remains reproducible:

| block | predecessor source | published local family | local survivors | output after selection |
| --- | --- | ---: | ---: | --- |
| 20 | `TH-H-TH` r1 vertical | 8 | 1 | `I S` |
| 21 | `W-I-W` r6 horizontal | 1 | 1 | `T O` |
| 22 | `X-M-X` r3 vertical | 10 | 1 mirror + 1 start | `G O` |
| 23 | `TH-G-TH` r7 vertical | 32 | 1 mirror + 1 start | `T O` |
| 24 | `D-N-D` r6 NW-SE | 2 | 1 signature survivor | `TH E` |

Those are local statements about already selected predecessor states. The decisive question is how often the same frozen formulas behave comparably away from those states.

## Broad D4 source-state census

For each block, the broad population preserves the predecessor's **exact structural type** while freeing its position:

1. use all eight D4 coordinate frames;
2. enumerate every source-native equal-outer predecessor node with the same local radius and axis type;
3. enumerate every contiguous predecessor ciphertext segment with the same length and local read direction;
4. apply the exact frozen selector;
5. count a state only when the selector itself produces one executable continuation.

D4 framing turns the one local definition into an orientation-complete census without changing any formula.

| block | oriented predecessor nodes | source states | executable | rate | distinct selected geometries | distinct ciphertext placements | distinct GP outputs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 20 | 144 | 97,200 | 4,500 | 4.6296% | 1,202 | 2,114 | 1,526 |
| 21 | 116 | 78,416 | 1,462 | 1.8644% | 8 | 1,173 | 708 |
| 22 | 116 | 78,416 | 1,626 | 2.0736% | 429 | 668 | 488 |
| 23 | 80 | 56,160 | 1,288 | 2.2934% | 28 | 602 | 151 |
| 24 | 72 | 50,544 | 6,512 | 12.8838% | 98 | 4,241 | 840 |

The central result is structural multiplicity. A complete frozen continuation occurs hundreds to thousands of times per block. Block24 is especially permissive, executing on roughly one state in eight. Blocks20-23 are sharper, yet still yield 1,288-4,500 executable states in the orientation-complete census.

The exact public output is also not unique across the broad population:

| block | public output | broad occurrences |
| --- | --- | ---: |
| 20 | `I S` | 7 |
| 21 | `T O` | 3 |
| 22 | `G O` | 12 |
| 23 | `T O` | 8 |
| 24 | `TH E` | 5 |

These counts are descriptive only. The formulas were designed after those outputs were public.

## Source-preserving matched control

The matched control keeps the **exact predecessor raw source triple** as well as the structural radius/axis type. It frees only which D4 occurrence supplies that source and where the same-type predecessor ciphertext segment lies.

Every predecessor raw triple has four oriented occurrences in this control.

| block | matched states | executable | rate | selected geometries | ciphertext placements | distinct GP outputs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 20 | 2,700 | 197 | 7.2963% | 98 | 196 | 187 |
| 21 | 2,704 | 256 | 9.4675% | 1 | 256 | 226 |
| 22 | 2,704 | 111 | 4.1050% | 66 | 111 | 101 |
| 23 | 2,808 | 184 | 6.5527% | 4 | 94 | 23 |
| 24 | 2,808 | 351 | 12.5000% | 7 | 350 | 286 |

Preserving the exact source runes therefore does not rescue structural uniqueness. The Block21 selector is particularly revealing: the real `W-I-W` source can drive **256** executable matched ciphertext placements under the same rule. Block24 leaves **351**.

## Untargeted fixed-vocabulary screen

For comparability with the earlier Block18/19 audit, the reproducer reuses the vocabulary fixed before this task:

- `resources/control/shakespeare_first300k.txt`;
- `resources/control/gibran_prophet_58585.txt`;
- repository-standard Latin->GP collisions;
- frequency at least five in the combined excerpts;
- one-rune words only A and I.

This produces **1,465** GP word types. No word is added for Blocks20-24.

Broad executable states contain many complete fixed-lexicon outputs:

| block | word-producing states | distinct fixed-lexicon words | public-output occurrences |
| --- | ---: | ---: | ---: |
| 20 | 113 | 21 | 7 |
| 21 | 77 | 40 | 3 |
| 22 | 107 | 30 | 12 |
| 23 | 136 | 14 | 8 |
| 24 | 384 | 49 | 5 |

The source-preserving control remains language-rich:

| block | word-producing matched states | distinct words | public-output occurrences |
| --- | ---: | ---: | ---: |
| 20 | 5 | 5 | 1 |
| 21 | 17 | 15 | 2 |
| 22 | 11 | 10 | 2 |
| 23 | 16 | 2 | 8 |
| 24 | 34 | 23 | 1 |

Thus the route's word outputs are not produced in a language-empty null. Block23 is extreme in the opposite direction: with the exact `TH-G-TH` predecessor source retained, the matched census produces only two frequent word types, `YEA` and `TO`, each eight times.

## Holdout chronology

There is **no genuinely unseen transition in Blocks20-24 under these formulas**.

The source reports themselves classify the mechanisms as conditional and reconstructed after the public continuation was available:

- Blocks20-22 were fitted after `IS TO GO` was known.
- Block23 `GO -> TO` was recognized with the public route available.
- Block24 `TO -> THE` was likewise constructed against the known continuation.

Accordingly, lexical rarity or exact-output recurrence cannot be read as a prospective p-value. No transition in this five-block family upgrades the mechanism by temporal holdout.

## Decision

The strongest unsupported premise was that the local `8 -> 1`, `1 -> 1`, `10 -> 1`, `32 -> 1`, and `2 -> 1` reductions indicated an intended parser. The all-grid census rejects that inference.

Keep the five transitions as reproducible intermediate constructions because they are useful for studying the public 27x27 hypothesis. Do **not** promote `IS TO GO TO THE` as recovered LP2 plaintext on the strength of these selectors, and do not extend this per-transition arithmetic grammar by adding new fitted formulas.

A future upgrade requires a single frozen mechanism that makes at least two later source/ciphertext predictions that were genuinely unavailable when the mechanism was fixed.

## Reproduction

```text
node sims/lp2_p0_blocks20_24_allgrid_multiplicity_sft.cjs
```

The SFT asserts the 729-rune original grid, the five published local outputs, the broad D4 counts, the source-preserving matched counts, and the fixed 1,465-type language census.
