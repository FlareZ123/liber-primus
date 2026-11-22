# P50 four 8×8 squares as source-shaped Hill8 chapter keys

**Agent20, 22 November 2026. Intermediate original-input negative. No authentic unknown-page plaintext, source-selected key or final destination.**

## Original clue and hypothesis

The 256 two-character numerals printed across original LP2 pp49–51 form **32 rows × 8 columns**, hence four consecutive physical **8×8 squares**. Nine illustrated manuscript chapters have GP29-rune lengths **[729,1145,1729,1903,1021,1433,1680,3008,308]**. Exactly **four** chapters, zero-based visual chapter indexes **0,1,2,5**, have one rune beyond an 8-multiple: **729=8×91+1, 1145=8×143+1, 1729=8×216+1, 1433=8×179+1**.

This motivates testing four table-derived GF29 block keys against four aligned text chapters, retaining one initial or terminal rune as a hypothetical IV/marker. This is a *retrospectively selected* numerical fit: no original or signed instruction authenticates the assignment, the IV, or Hill8 itself.

## Exact reversible experiment

The [read-only Windows Node22 source SFT](../sims/lp2_p50_four_hill8_source_chapters_sft.cjs) reads `resources/liber-primus/lp2-grid-256.json` and `resources/liber-primus/lp2-corpus.json`. It takes four consecutive groups of eight original table rows, reduces every printed base60 byte modulo29, and interprets each as an eight-by-eight matrix. **All four matrices have full GF29 rank eight** and exact calculable inverses.

Use the four eligible original-text chapters. Exclude exactly one end rune (offset0) or one initial rune (offset1), preserving all other original runes and original block order. Apply each matrix or its transpose in either forward/inverse direction. The declared experiment is **4 matrices ×2 transpose ×2 direction ×4 chapters ×2 offsets =128** candidates, with no fitted secret key. Every ciphertext block must reencrypt exactly. For positive controls, the same matrices encrypt and decrypt every full eight-rune block of the **authentic clear p57** source, recovering all control symbols exactly.

## Observed original-source result

| Measure | Result |
| --- | ---: |
| Independently visible table squares | 4, all full-rank |
| Complete original-cipher candidate inverses | 128 |
| Best decoded GP29 index of coincidence | **0.035087000144** |
| Worst decoded GP29 index of coincidence | **0.033960880935** |
| Authentic solved p57 native-GP index of coincidence | **0.062709966405** |

The highest-IoC candidate uses the first source square transposed, forward, on chapter5 (pp27–32) leaving the final rune aside. Its **1,432** decoded GP labels start `F W M W P I O H J S IA D G H H B EO M J C C OE E A H NG N EO W M L W`. All 128 candidate outputs remain distributionally ciphertext-like (IoC under0.04) and contain no coherent unknown plaintext. The observed negative is about **this finite, direct, source-ordered Hill8 model**, and does not disprove unknown additional cipher layers or a different table receiver.

All source and positive assertions passed [Windows Node22 CI run 44967371424](https://github.com/FlareZ123/liber-primus/actions/runs/44967371424). The single-file SFT includes the full implementation, native p57 roundtrips, original-input roundtrips, candidate scans and output.

## Decision

Retire the **direct four-square GP29 Hill8 transform of the four one-remainder chapters**. Keep the source geometry as a possible clue only if a separately authored operation/receiver can be identified. An unconstrained new phase, cipher layer, or byte reordering would not constitute progress under the available evidence. No manuscript solution or key was recovered.
