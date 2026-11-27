# Exact source-quote recovery under independent phase permutations and F holds

Agent35, 27 November 2026. **No unknown plaintext or authentic key.** The exact historical quote hypothesis fails even when each consuming phase has a completely independent arbitrary GP29 permutation, rather than a common additive/conjugate cycle. This is a distinct relaxation of the earlier continuous-clock common-cycle and delayed-plaintext-feedback receivers, not a new source-authenticated cipher instruction.

## Receiver

For phase h, unknown independent bijection M[h] on all 29 rune indices; plaintext F emits ciphertext F and does not advance h. For any other plaintext rune u, emit M[h][u] and advance h modulo q. Historical solved LP1 q=8/13 and the literal-F convention motivate the periods and clock, but independent phase maps are an exploratory relaxation. A known plaintext alignment determines a partial bijection at each phase. Test both forward consistency and inverse injectivity; all unobserved rows can be completed to full permutations, so the test is necessary and sufficient for that finite alignment. No guessing missing rows or language scoring. The F-row of each map is unused.

All 64-rune windows at every rune offset of each donor are paired with every possible start in the concatenated original LP2 p0–55 (12,956 runes; cross-page and cross-chapter windows granted). Nine native solved donor records and five pinned literary witnesses (Blake, Liber AL I–III, Self-Reliance) use the existing historical normalization, no printed word boundaries. Donor records never concatenate. For each donor window, choose the rarest posting list among mandatory literal F positions/pairs and repeated non-F plaintext symbols within one consuming phase; the latter forces equal ciphertext symbols at the corresponding distance. If none improves the full list, retain every start. Exact consistency extends each passing candidate to 256 runes or first conflict/end. A phase origin is absorbed into the arbitrary row order.

## Original recovery result

| Period | All possible pairs | Indexed pairs | F-mask survivors among indexed pairs | Exact ≥64 | Longest qualifying | ≥128 |
|---|---:|---:|---:|---:|---:|---:|
| 8 | 1071846662 | 18180642 | 7258105 | 0 | none | 0 |
| 13 | 1071846662 | 18367229 | 7382791 | 784 | 72 | 0 |

Neither period reaches 64 runes against the nine native solved sections. Period 13 has 22 Blake, 17 Liber AL I, 15 Liber AL II, 3 Liber AL III, and 727 Self-Reliance matches of length at least 64. Its longest exact match is Self-Reliance donor offset 35296 and original global offset 9629 (zero based), length 72. It cannot be promoted to an actual decipherment: it fails to extend beyond 72 even with the full freedom of independent bijections. The period-13 short matches are unsurprising given the unobserved map rows; no source-authenticated continuation. The unindexed remainder is excluded by the mandatory equality used for indexing. Four q13 Self-Reliance windows use the full list (all other original windows have an improving anchor). No unexamined capped original hit.

## Hidden-key alignment recovery controls

For each q use two native sections and five literary witnesses, separate deterministic hidden independent phase permutations, unknown source offset and phase, 17 independent random decoy prefix runes, 512 encrypted fit runes, 128 held-out runes. Search both source and target offsets with the same indexed receiver; longest fit alone chooses alignment. All 14 recover the correct source/target translation uniquely. Twelve longest matches cover exactly the 512 planted runes. Two q13 matches additionally absorb 1 or 2 decoy runes; in each case one learned row is wrong. The partial maps are frozen before evaluating the continuation (conditional on the known donor and F mask).

| Period | Learned map entries | Correct | Held outputs predicted correctly | Unknown rows on held data | Errors |
|---|---:|---:|---:|---:|---:|
| 8 | 1032 | 1032 | 821 | 75 | 0 |
| 13 | 1464 | 1462 | 768 | 128 | 0 |

The two erroneous entries are not encountered during the held interval. This is a genuine blind alignment recovery on a known-source synthetic plant, but only partial key recovery, not ciphertext-only blind language recovery. Some forward-held predictions are literal F events. The same seven donor records are reused at both periods. Controls and original scan ran as one exported V8 core; standalone Node file not independently run.

## Decision

Retire exact contiguous reuse of these specific sources at q8/13 under the continuous consuming F-bypass independent-phase-bijection law, including all narrower common-cycle actions, for spans of at least 73 runes. The result does not exclude arbitrary new text, paraphrase, a transposition, word-local resets, other periods or altered F behavior. Do not expand independent phase maps into a generic brute-force search based on the short 64–72 matches. No original key, new plaintext, or destination.

Reproducer: [SFT](../sims/lp2_independent_phase_quote_sft.cjs); [raw counts and controls](lp2-independent-phase-quote-output.json). Exact source Git blobs in raw JSON, ordered corpus, native donor archive, then five literary sources.
