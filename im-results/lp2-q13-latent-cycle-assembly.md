# Latent q13 cycle assembly: constructive key recovery on the opening chapter

Agent 5, 26 Nov 2026. The source p0 red13 heading and following 13-dot delimiter motivate the conditional period-13 hypothesis, not an authenticated key selector. Freeze GP29 canonical addition, literal F hold, independent uniform initial phase at every actual word, latent boundaries and no inserted/deleted glyphs. The earlier raw-title continuous receiver, mapped continuous receiver, known-key latent continuous receiver and fixed-phase-zero latent receiver do not cover this architecture. Fit the p0 black-body plus p1 prefix (515 runes); hold p2's 201 runes. Remove only the genuine 13 red heading runes.

## Constructive inverse

Use the prior 31,629-word weighted lexicon and exact semi-Markov marginal from `sims/lp2_q8_latent_independent_phase_sft.cjs`. At every possible prefix alignment, translate a dictionary word into a candidate contiguous sequence of key digits; F must coincide with ciphertext zero and consumes no phase. A word with >13 consuming runes must repeat consistently. Accumulate weighted 3-, 4- and 5-consuming word fragment votes, then retain 512 fragments of each length 5–13, ranking by summed log1p weighted votes. A beam of width512 extends the current fragment by all 29 digits and merges full-word fragment seeds of the next length. Score each partial path with distinct windows only; score complete cycles including wrap windows. Canonicalize modulo rotation; augment the top32 complete cycles by every single-digit mutation and retain 96 candidates. Select by exact **prefix-only** word marginal; decode the whole sequence only for the winner. This is heuristic, not exhaustive; the cheap upper score used when selecting seeds omits duplicate-window penalties.

First large combined control attempt timed out; an allocation-light implementation runs one donor/negative case at a time. Three new held-out literary windows of 716 runes start at least 700 words into the held-out donor split, independent deterministic random keys/phases. All controls were executed before the original.

| Test | Key recovered | Prefix nats/rune | Held nats/rune | Held runes | Held boundary F1 |
|---|---|---:|---:|---:|---:|
| Gibran | exact | -2.292009 | -2.493518 | 193/201 | .925926 |
| Shakespeare | exact | -2.490598 | -2.293296 | 201/201 | .978723 |
| Emerson | exact | -2.303335 | -2.377957 | 195/201 | 1 |
| iid pad0 | — | -4.052744 | -4.278108 | — | — |
| iid pad1 | — | -4.076617 | -4.427499 | — | — |
| iid pad2 | — | -4.094602 | -4.350885 | — | — |
| Original p0–2 | unknown | -4.074548 | -4.054562 | — | — |

Original winner [3,24,23,16,5,13,26,19,28,15,17,10,27] (rotation canonical), runner-up prefix gap only 0.0734 nats over 515 runes. Original prefix in iid range; held score 0.224 nats/rune better than best of three iid controls yet 1.561 below weakest positive. No sustained prose, so no authenticated key/plaintext. The decoder can produce many dictionary singleton fragments without a genuine sentence. The original six fixed signed red13/prime/KOAN keys yield fit [-4.389,-4.234], held [-4.574,-4.356]; none approaches genuine-text controls. Their q13 fixed-phase independent starts are not a direct reproduction of the continuous raw-title test. The six fixed-key cases were evaluated after the search calibration, without separate q13 fixed-key controls; they are illustrative rather than independently calibrated.

Reproduce `node sims/lp2_q13_latent_cycle_assembly_sft.cjs 0+` (also 1+,2+,0-,1-,2-,original). Core executed directly on pinned repository content via V8, about 47 s per case; Node wrapper not independently tested. Raw per-case JSON names `im-results/lp2-q13-latent-cycle-assembly-control{0,1,2}-{positive,negative}.json` and `im-results/lp2-q13-latent-cycle-assembly-original.json`. The key selection results are conditional on the independent-phase native word mechanism and this bounded candidate search. No arbitrary q13 key exclusion, transposition rejection, unknown alphabet rejection, or general English theorem.
