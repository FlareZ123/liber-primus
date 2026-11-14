# Five-dot, five-column word-local transposition: original LP2 decision

**14 November 2026, Agent21, Director [#894](https://github.com/FlareZ123/liber-primus/issues/894).** One original-source-frozen, length-general, exactly reversible within-word five-column inverse **fails to recover plaintext, a useful key, or an independently selected original cipher mechanism**. It reduces the 104 source word-local five-back equalities to only 14 while leaving an overwhelmingly nonlinguistic GP29 letter distribution and trigram model. The transform is a complete conditional negative for this one operator, not evidence that the five-dot figures encode a column count.

## Human-visible clue and weakest premise

The original images include the **same five-circle stencil** on unsolved p7 and p23 and solved p56, reused under reflections/rotation, with exact measurements in [the already-established five-dot atlas](lp2-p7-p23-p56-five-dot-dihedral-triad.md). The real 2014 puzzle historically included a columnar transposition at Stage05; its authentic seven-symbol inverse and scope are recovered in [the Stage04/05 source-exact analysis](lp2-2014-stage04-source-exact-stage05-seven-column-inverse.md). The original LP2 printed words contain 104 five-position equalities within 2,105 eligible original word slots, whereas most cross-word positions lack this excess ([fixed-rune boundary test](lp2-lag5-fixedrune-boundary-alignment.md)).

An independent period participant could recognize the five circles, remember that Cicada had used columnar rearrangement, and attempt **five columns within each printed word**. The necessary handoff is not authenticated: no contemporary instruction says these circles label columns, to reset at word boundaries, or to repeat a Stage05 operation on LP2. The operator was frozen [on Issue #894](https://github.com/FlareZ123/liber-primus/issues/894) **before inspecting any original decrypt or echo output**. A rival explanation is that the five circles are repeated section ornaments and the five-back excess arises from a distinct changing-state cipher or punctuation transport.

## Exactly specified reversible operation

For each complete printed GP-rune word of length n (all original n=1..14):

1. Hypothetical encryption writes the n runes in original order across **five columns** from left to right in successive rows, ending the final row as soon as all runes have been written, without filler.
2. Encryption then reads down each existing column in order, left to right. For n less than five, use exactly n nonempty columns; hence such words remain unchanged.
3. The **frozen decryption** used on authentic ciphertext splits its unmodified n positions into the five column lengths `floor(n/5)+1` for the first `n mod 5` columns and `floor(n/5)` for the remaining columns, then reads back across rows. All n positions and every visible word boundary survive; line/page wraps are soft, and the 32 crossing words are joined before reordering.
4. No offset, column sort, reversal, added key, rune correction, width menu, padding or second encoding is permitted. Original p0–2 and untouched p54–55 were designated the independent test regions.

The original source [SFT](../sims/lp2_fivedot_wordlocal_columnar_original_sft.cjs) compares every original page against the canonical source indices, verifies full decryption and forward re-encryption for all 2,896 words, and recovers **every rune** of 650 independently solved LP1-native GP positive words plus the 95 GP runes of clear p57 after a planted forward transposition. The 2014 positional operator is historically grounded; this five-dot/within-word composition remains conditional.

## Source-level consequences

| Metric | Untouched original LP2 | Frozen five-column inverse |
|---|---:|---:|
| Exact ciphertext runes | 12,956 | 12,956 |
| Word-local equal neighbors | **63 / 10,060** | **164 / 10,060** |
| Word-local lag-five equalities | **104 / 2,105** | **14 / 2,105** |
| Consecutive lag-five equalities | **9** | **0** |
| GP29 pooled IoC | 0.0344783979 | **0.0344783979** |
| Native LP1 smoothed GP trigram score | −3.417442 | **−3.419868** |

The change from 104 to 14 is a *direct deterministic effect of reordering*, not independent evidence for the historical cipher. In particular, 14/2,105 is even more depleted than the source alphabet's already unusual lag-one equality rate. Of all 2,896 original printed words, **2,081 (71.86%) have length ≤5** and are individually unchanged by this inverse. This renders the proposed mechanism especially poor as a stand-alone explanation for source-wide missing word-length grammar or a genuine 100-rune readable passage.

The IoC remains **exactly identical** under every within-word permutation because every rune is preserved; a subsequent stationary one-to-one rune substitution also preserves IoC. Source-native English is much more concentrated (clear p57 95-rune IoC 0.0627099664, independent 2,652-rune solved LP1 prose excerpt IoC 0.0601341137). A *separately keyed, nonstationary* cipher could change these invariants, but its key and operation would need independent evidence.

## Predeclared original and held-out regions

| Region | Runes / printed words | Original → decoded adjacent pairs | Original → decoded five-back pairs | Original → decoded GP trigram score |
|---|---:|---:|---:|---:|
| **p0–2** | 729 / 158 | 2 → 11 | 7 → **0** | −3.415601 → **−3.437750** |
| **p54–55** | 308 / 66 | 1 → 1 | 3 → **0** | −3.417485 → **−3.418306** |

The native GP29 trigram model is based on **3,510 independently solved LP1-reference runes**, with authentic training score **−2.260728** and held-out *solved p57* score **−2.468145**; the exact original source-calibrated `ING` and `IO` spellings are used. The two original decoded outputs remain at nearly random-looking scores and contain no coherent 100-rune original plaintext.

The opening 70 decoded rune transliterations in the first and last regions begin, respectively:

- **p0:** `SEGIAFHOMSYENGCTHJGAEFJOEONTHNBSEONGEAOEIUWNAEGITHHBNIAPBNEOJTHANGYXBDPEFXGFIASFUYXPPNG`
- **p54:** `AMDTHIMNGIAXIAPUAMDNGWTANGNGIAWSHTHICAEPAEGOMIAEOTWOFYUTJTHEACNEAJECEAEROUXDHNGAJWBFCU`

These are grapheme concatenations with GP `ING`/`IO` aliases and should be compared as decoded rune streams. They do not establish English plaintext or a hidden address.

## Completion and next cryptanalytic decision

**Reject this single frozen five-column, per-printed-word inverse as a standalone plaintext-restoring mechanism.** It does move the measured five-back excess, but its native-language scores worsen on both predesignated regions, it preserves the near-uniform GP29 marginal, and it reveals no complete original passage. There is no source-authorized secret permutation or additional cipher to attach to it. The operative missing ingredient remains a first-party clue that chooses a reversible state/key or original word-boundary transport; expanding to an arbitrary width/order/phase optimization on the already-known lag-five anomaly would be fitting, rather than solving.

**Reproducer:** [`sims/lp2_fivedot_wordlocal_columnar_original_sft.cjs`](../sims/lp2_fivedot_wordlocal_columnar_original_sft.cjs), Node.js 22 CommonJS, using only pinned repository source materials. It validates original page bytes/indices, fixed original counts, recovered solved-GP controls, inverse correctness, the independently calibrated trigram model, and both predesignated original regions. Its arithmetic was separately executed against exact GitHub-connected source contents to produce the figures above. No new CI trigger or arbitrary parameter search was introduced.
