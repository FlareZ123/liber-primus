# Section-continuous AES/ChaCha grid-column keys with collision skips

**Status: bounded negative for two explicit row-order interpretations; no LP2 plaintext or authentic key recovered.** The original row-major experiment is retained below, with a new source-constrained five-dot/de Bruijn column-key test added. The new test uses the original repository fixtures and the same collision-aware decoder and positive-control machinery.

## Shared cipher model

The 32×8 LP2 base-60 table supplies eight 32-byte vertical keys for the eight major text sections. For a plaintext rune P and current key position j, the proposed encoder emits C=(P+sign·K_j) mod29. If a trial output would equal the immediately preceding emitted ciphertext rune, it may discard that draw and retry the same plaintext rune with K_(j+1), consuming up to two extra key positions. The Viterbi decoder allows up to three total draws per rune and charges a 3.5-unit score penalty per rejected draw.

The candidate family uses AES-256-CTR or ChaCha20 with a zero 16-byte IV; forward or reversed key bytes; byte reduction mod29 or floor(29×b/256); both arithmetic signs; and a complete 128-candidate screen per section. The first 24 ciphertext runes rank candidates, the top 24 are decoded over the first 220 runes, and all source groups use the same independently trained Shakespeare GP trigram model. The eight section lengths are [729,1145,1729,1903,1021,1524,1589,3316], accounting for all 12,956 unknown-page runes.

## Original row-major baseline

[Successful manual GitHub Actions run 42753423517](https://github.com/FlareZ123/liber-primus/actions/runs/42753423517), Node 22:

- **Positive control:** 220 genuine, independently sourced LP1-solved runes were encrypted under the actual AES-256-CTR first grid column, forward key, mod29, positive sign. With seed 0x452301c2 and 82% collision retry probability, nine extra key bytes were consumed. The true key ranked first of 128; the decoder recovered 220/220 runes and exactly nine skips, at −2.537283 per rune.
- **Original LP2 best 220-rune scores by group:** −5.520081, −5.431117, −5.484182, −5.435149, −5.645129, −5.541933, −5.495925, −5.403382. None gives a stable English-like passage; strong short-head matches collapse on the longer window.
- **Wrong-key null, group 0:** 40 independent within-column byte-order shuffles, each rerunning the full candidate screen. Observed −5.520081; shuffled mean maximum −5.533953, maximum −5.364663, add-one upper-tail p=0.39024.

## Five-dot/de Bruijn row order as eight section keys

This is a distinct use of the source-derived order from the earlier experiment that used each eight-byte row as a fragment nonce. Here, the common 32-row order permutes the bytes within each of the eight 32-byte vertical keys, and the eight resulting columns are tested as section-specific keys.

The source hypothesis is documented in [the red-256/grid correspondence](red-256-event-grid-correspondence.md): the left five-dot ornament's two hollow positions are interpreted as feedback taps 18, the all-solid right ornament supplies seed 31, and the 31-state maximal LFSR is completed by inserting zero after state 16. The uniquely black 13-dot mark is the eighth marker, followed by a red mark at the same rune offset; identifying the intervening empty fragment with state zero fixes the row phase. The resulting order is:

`13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15,31,30,28,25,19,6`.

These visual-to-numeric assignments remain hypotheses, not explicit manuscript instructions.

The new original-source screen tests the same 128 AES/ChaCha, key direction, byte reduction and sign settings per section, with the same 24-rune shortlist and 220-rune collision-aware Viterbi. A separate row-major run in the same execution reproduces the established baseline.

| Section | Row-major best score | Black-anchored de Bruijn best score |
| ---: | ---: | ---: |
| 0 | −5.520081 | −5.619152 |
| 1 | −5.431117 | −5.615072 |
| 2 | −5.484182 | −5.452796 |
| 3 | −5.435149 | −5.407779 |
| 4 | −5.645129 | −5.562819 |
| 5 | −5.541933 | −5.666507 |
| 6 | −5.495925 | −5.491987 |
| 7 | −5.403382 | −5.391190 |
| **Mean of eight section winners** | **−5.494612** | **−5.525913** |

The de Bruijn order is slightly worse overall than ordinary row-major order. Its best decoded strings are not coherent GP-English passages.

**Positive controls:** both AES-256-CTR and ChaCha20 planted controls use the de Bruijn-ordered column 0, forward key, mod29 and positive sign. In each case the true key ranked first of 128, the decoder recovered **220/220** runes and exactly **six** planted skips, with score **−2.489555 per rune**. This validates both stream generators and the collision-aware decoder for this key layout.

**Common row-order null:** ten seeded random permutations, each applied identically to all eight columns, preserve the byte inventory of each column while changing the common row order. On section 0, the de Bruijn result is **−5.619152**; random-order mean maximum is **−5.513734**, maximum **−5.386004**, and all ten random orders score better than the source-selected order (add-one upper tail 1.0). This small control is descriptive rather than a precise tail estimate, but it provides no support for a special de Bruijn advantage.

The full new result is reproduced by `node sims/grid_section_debruijn_keyskip_probe.cjs`; the source order is asserted from the 31 original 13-dot marks and the original ink annotation. The existing manual-only workflow `.github/workflows/grid-section-keyskip-probe.yml` now runs both the row-major and de Bruijn variants. The new script has not yet had a separate GitHub Actions run.

## Interpretation and limits

The positive controls show that the declared 24-rune head screen and 220-rune Viterbi can recover the exact key and collision path when the mechanism is planted. The authentic manuscript does not approach the planted language-model score. This rejects the specific section-start, zero-IV AES/ChaCha family under both row-major and black-marker-anchored de Bruijn column order.

It does not exclude a different key offset, other cipher or IV, independently varied settings by section, extra draws unrelated to adjacent ciphertext collisions, a different retry policy, a non-English register, or another use of the 32×8 table. The de Bruijn order itself remains a combinatorial source hypothesis; this negative result concerns its use to permute eight 32-byte section keys.

**Reproduce:** `node sims/grid_section_keyskip_probe.cjs` and `node sims/grid_section_debruijn_keyskip_probe.cjs`, using the committed source images/transcriptions, base-60 grid, ink annotations and Shakespeare control. The workflow is opt-in and has no on-push trigger.
