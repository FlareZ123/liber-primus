# Source-controlled five-column and feedback/period-five gates

**Agent5 · 17 November 2026 · bounded completion for Director Issue #1296**

## Decision

No unknown LP2 plaintext or authentic key was recovered. Two source-motivated reversible families were selected before examining the heldout pages, optimized exactly on p0–p39, and tested against untouched p40–p53 and p54–p55. Both fail. Their inverse implementations pass full-length Gibran controls and authentic LP1/p56/p57 source controls, so the negative results are not explained by a broken inverse. This is a bounded exclusion of the stated encoders and clocks, not a proof against all stateful or externally keyed ciphers.

Reproducer: sims/lp2_issue1296_source_controlled_period5_gate_sft.cjs. Validated by the reusable Node 22 manual SFT workflow (run #261, success): https://github.com/FlareZ123/liber-primus/actions/runs/44075394418.

## Source controls and experimental discipline

The original LP2 parse is 2,896 printed words, 12,956 runes, and 32 words carried across physical page boundaries. Training uses words whose first rune is on p0–p39 (2,161 words / 9,640 runes); blind holdout is p40–p53 (669 / 3,008); terminal holdout is p54–p55 (66 / 308). All 29 GP symbols are retained. The fixed language model is trained on the independent 217,106-rune Shakespeare GP29 corpus; scoring uses within-word bigrams plus 0.25-weighted unigrams. The TextBlob lexicon is a secondary diagnostic, not the key objective.

The SFT also verifies the authentic p56 prime/totient transparent-F encoder: the known 85-rune plaintext and original p56 ciphertext match exactly, with one plaintext F and five ciphertext F symbols. It includes the independently solved LP1 clear-GP pages p3, p8–p11, p14 (1,001 original runes), plus LP2's clear p57 (95 runes). The 5-column route passes 10/10 source-segment roundtrips; the feedback family passes 20/20. Each tested key schedule also recovers eight full 12,956-rune Gibran plants under eight hidden five-symbol keys. These are positive implementation/identifiability controls, not evidence that LP2 uses these ciphers.

## Candidate A — five-column word route plus period-five additive GP29 key

Motivation: the five-dot stamp on p7/p23/p56 and the within-word lag-five excess. The reversible operation fills each printed word down five columns, adds one GP29 shift per column, then reads rows across. The two ordinary key clocks are word-reset and continuous across the rune stream. For each clock, an exact dynamic program searches the complete 29^5 key space under the fixed Shakespeare score, using only p0–p39.

| Key clock | Best training key (GP indices) | Train hits | p40–p53 hits | p54–p55 hits | Longest heldout dictionary run |
|---|---:|---:|---:|---:|---:|
| Word-reset | [4, 27, 16, 7, 12] | 149 / 2,161 | 38 / 669 | 4 / 66 | 2 |
| Continuous | [4, 6, 26, 11, 25] | 151 / 2,161 | 30 / 669 | 6 / 66 | 2 |

The word-reset score per rune is −5.0976 on training, −5.1937 on p40–p53 and −5.3012 on p54–p55. Its IoCs are 0.03450 / 0.03440 / 0.03386. The continuous-clock IoCs are 0.03450 / 0.03473 / 0.03513. Neither key produces a readable 150-rune run. The raw ciphertext has 181/2,896 TextBlob dictionary hits and a longest run of three, so the small isolated-hit increase is not plaintext recovery.

Both clocks recover the exact hidden key and all 12,956 runes in 8/8 full-length Gibran plants. The authentic p56, LP1 and p57 segments also round-trip exactly. This retires only the natural-order five-column fill-down/read-across route with one global additive period-five key under these two clocks.

## Candidate B — two-tap ciphertext feedback plus a period-five key

The tested reversible recurrence is
\`C_i = P_i + C_(i-1) - C_(i-5) + K_(phase) (mod 29)\`.
The one-back state crosses words and pages. The five-back tap was tested both word-local and global; the five-symbol additive key was tested with word-reset and continuous phase. These are the four ordinary clock combinations, not a search over arbitrary reset positions. Each five-symbol key is optimized exactly over 29^5 possibilities on p0–p39.

| Five-back clock | Key clock | Best key (GP indices) | Train hits | p40–p53 hits | p54–p55 hits | Longest heldout run |
|---|---|---:|---:|---:|---:|---:|
| Word-local | Word-reset | [24, 18, 18, 17, 18] | 146 / 2,161 | 26 / 669 | 4 / 66 | 2 |
| Word-local | Continuous | [23, 2, 27, 18, 1] | 151 / 2,161 | 42 / 669 | 4 / 66 | 2 |
| Global | Word-reset | [26, 16, 27, 25, 16] | 141 / 2,161 | 39 / 669 | 3 / 66 | 2 |
| Global | Continuous | [16, 8, 14, 9, 15] | 136 / 2,161 | 31 / 669 | 4 / 66 | 2 |

Training scores per rune range from −5.0745 to −5.1058; heldout scores remain nonlinguistic. Across the four variants, training-prefix within-word adjacent equalities are 259–282 / 7,479, versus 48 / 7,479 raw; lag-five equalities are 50–54 / 1,563, versus 78 / 1,563 raw. On p40–p53, candidate adjacent equalities are 81–86 / 2,339 versus 14 / 2,339 raw, while lag-five counts are 15–22 / 486 versus 23 / 486 raw. On p54–p55, candidates give 7–12 / 242 adjacent and 0–2 / 56 lag-five, versus raw 1 / 242 and 3 / 56. None yields a meaningful heldout word run. Each variant recovers the exact hidden key and all 12,956 runes in 8/8 Gibran plants, and passes the p56/LP1/p57 source controls.

The recurrence is therefore not rescued by the five-symbol key or by switching between word-local and global lag-five state. The four best-fit keys are statistical optima only, not source-authenticated material.

## Supporting finite negatives

The three remaining no-key signed recurrences C_i=P_i+aC_(i-1)+bC_(i-5), with (a,b)=(+1,+1), (−1,+1), (−1,−1), all round-trip and pass source-native Gibran plants but produce 336–364 within-word adjacent equals and only 59–88 lag-five equals. Agent21's earlier (+1,−1) member produces 456 page-local adjacent equals and 69 lag-five equals. This completes the simple four-sign family without expanding its parameter space.

Concurrent results constrain the next model: Agent12's plaintext-autokey5 gate is negative; Agent15 finds adjacent-repeat suppression also at word edges (so the one-back state cannot simply reset at each word); Agent20 finds 11 S–S lag-five pairs beyond its source-conditioned null and rejects the fixed-E / direct five-phase affine families. These results are incorporated as constraints, not rerun here.

## Director fork

The missing input is not another unconstrained five-symbol fit. A viable mechanism must have an independently motivated state/key update and IV/clock, suppress adjacent equals across word edges, reproduce the conditioned lag-five excess including the S–S component, and decode untouched pages as language. Do not widen route orders, signed coefficients, or reset menus without a first-party selector. The five-dot stamp and lag-five statistic motivate these finite tests but do not authenticate an opcode. No unknown plaintext, authentic key, or final Cicada destination was recovered.
