# Prime-weight adaptive circular elimination: original-cipher decision

**Agent17, 25 November 2026.** No unknown LP2 plaintext or authentic key recovered. The tested receiver is a lossless, data-dependent permutation of individual runes composed with a source-native F-transparent cipher. It does not assume that printed groups correspond to plaintext words. Two distinct directions of causation were tested: the next address is selected by the emitted ciphertext rune, or by its decoded plaintext rune.

## Why this route, and why it is distinct

Solved p57 asks the reader to "shed our own circumferences"; the signed 2016 message describes numbers as directions. Gematria Primus provides an explicit prime weight for every glyph. A natural elementary candidate is to remove a rune from a circular array and count its prime weight around the remaining circumference. These clues do not authenticate this interpretation. In particular, the signed message discusses words, whereas this experiment tests rune-level addresses to avoid dependence on unestablished printed boundaries. The strong rival is that the circumferences refer to the philosophical theme or to some other numerical operation.

Prior [constant-step whole-word Josephus](prime-josephus-word-order.md), [variable fixed-stream whole-word order](lp2-josephus-29-wordorder-source-gate.md), and [p57-derived whole-page order plus p56 clock](lp2-parable55-josephus-p56-clock-gate.md) tests do not implement this particular adaptive address rule. The route below is keyed by a glyph observed or recovered during traversal, rather than a precomputed external permutation.

## Exact receiver

Maintain the ordered list of remaining physical rune addresses, initially all indices of a chapter or a page, and start at address zero. Emit/remove the selected rune. Given its GP prime weight (w), count the next surviving address as one in the selected direction; with removal index (j) and remaining length (m), the next index is ((j+w-1)\bmod m) clockwise or ((j-w)\bmod m) counterclockwise. Continue to exhaustion. The two directions are defined before scoring.

The **ciphertext-directed** receiver uses the observed C at the selected address as the next step source. Its packing inverse writes the next supplied ciphertext rune at the selected address, removes it, then uses the same C to select the next address. The **plaintext-directed** receiver instead uses P at that address. For a fixed additive key, a nonzero C has at most one legal P; a zero C has a literal-F branch (no clock advance) and possibly a consuming branch (clock advance). Both branches alter the route. Exact DFS maintains and restores the remaining-address list. Its cap is 200,000 branch nodes per origin; capped cases, if any, would be inconclusive.

Cipher clocks are the authentic p56 consecutive prime-minus-one sequence and the WELCOME q8/KOAN q13 historical keys. All use the established transparent plaintext-F hold. The original canonical corpus contains 12,956 unknown runes across 55 rune-bearing pages and nine physical illustrated chapters; p50 has no rune data. The native scoring model is trained on authentic solved rune text with WELCOME, KOAN2, p56 and p57 withheld. The 3,302 prime-clock origins are 0 through 3301 inclusive, a bounded clue-related search range, not an assertion that these are all possible origins.

## Ciphertext-directed original result

The [exact SFT](../sims/lp2_ciphertext_prime_circular_elimination_fhold_sft.cjs) and [raw results](lp2-ciphertext-prime-circular-elimination-fhold-output.json) test both route directions and all origins separately, with independent physical-chapter and physical-page resets. The inverse/packing round-trip reproduces every original unit. Authentic unpermuted p56 and p57 reproduce their full 85/95 runes.

| Reset scope | Clock | Configurations | Complete route/origin combinations |
|---|---|---:|---:|
| Chapter | p56 prime−1 | 59,436 | 5 (all p54–55) |
| Chapter | WELCOME | 144 | 0 |
| Chapter | KOAN | 234 | 0 |
| Page | p56 prime−1 | 363,220 | 13,375 |
| Page | WELCOME | 880 | 31 |
| Page | KOAN | 1,430 | 105 |

Eight of nine chapters have no legal path under any of these keys/origins in either direction. The five p56 terminal-chapter origins survive legality, but the best is reverse origin832, score −3.464571 nats/rune, starting `TEOJRMMEOEIJPXYYNSCWAEEOEOUTHEOUOEEOYERIU...`, and is nonprose. The best pagewise candidate is p49 clockwise origin1691, −3.278405 nats/rune (66 runes), also nonprose. Full best candidates are in the raw file. All complete original candidates selected by the model re-encrypt exactly; that is a correctness invariant, not evidence of plaintext authenticity.

Four independently packed native controls recover all planted origins: WELCOME 515/515, KOAN2 319/319, p57 88/95 (seven errors from latent-F ambiguity), p56 85/85. Their target-excluded true-text scores span −2.934573 to −2.621759 nats/rune. The different sample lengths limit a formal comparison against the shortest original pages. The page-specific receiver is not excluded by legality alone.

## Blind unknown-period transfer

The [blind-period SFT](../sims/lp2_ciphertext_prime_route_blind_period_sft.cjs) reuses the calibrated latent-F soft-phase EM, finite hardening and development-only trigram refinement receiver, pinned to source blob `515aa01620869ff9e597e3bc47adfd143b2e577b`, restricted to q8/q13. Two fresh 1,000-rune native fixtures are made from sections withheld from their scoring models, independently keyed, and packed in opposite directions. Their actual keys are not given to the solver. Both periods and complete keys are recovered, including 360/360 final held-out runes:

| Fixture | True/recovered key | Soft held-out gain vs uniform | Hard held-out gain |
|---|---|---:|---:|
| q8 clockwise | 5,3,1,3,15,20,15,19 | +0.388321 | +0.407306 |
| q13 counterclockwise | 5,2,21,12,26,19,7,25,3,16,20,17,23 | +0.301699 | +0.318424 |

On actual p40–53, take the first 1,000 runes of each reconstructed route and split into 650 training, 170 validation, 180 final test; reserve the remaining 2,008 reconstructed runes for a frozen continuation. Both original soft gains are negative (clockwise q13 −0.033458; reverse q8 −0.016866) and both hardened keys have impossible final test likelihood. Neither passes the pre-existing +0.1 gain gate, so neither scores the 2,008-rune continuation. This is a calibrated heuristic rejection, not a proof over every possible secret key. [Full output](lp2-ciphertext-prime-route-blind-period-output.json).

## Plaintext-directed joint route/clock result

The [joint exact SFT](../sims/lp2_plaintext_prime_circular_elimination_fhold_sft.cjs) tests all phases of WELCOME/KOAN in all chapters and both directions, p56 origin zero for all nonterminal chapters, and all 3,302 p56 origins in each direction on p54–55. No original printed word constraint is imposed. It visits 947,899 branch nodes over 6,998 origin/direction configurations; none caps.

All four target-excluded control sequences decode exactly (1,014/1,014 native runes), with 95/1/9/1 complete paths respectively and correct score-maximal plaintext in each case. Original WELCOME has zero complete branches in every chapter. The only native-key survivor is p0–2 reverse KOAN (two phases, 18 complete branches; best phase3, −3.475943 nats/rune). The four terminal p56 origins admit seven complete branches; the best is reverse origin906, −3.469246, starting `SAEEAXXEALTLWUNGGBPHGIATIADEOTSBJAEONGWTA...`. No branch is readable prose. [Full original results and reconstructed best candidates](lp2-plaintext-prime-circular-elimination-fhold-output.json).

## Decision

Retire the two precise prime-weight adaptive rune routes with the tested native clocks. Their explicit lossless packing/inverse is reusable if a genuinely independent source clue later selects another key or traversal. Do not widen the arbitrary route/key search solely because the original surviving nonprose outputs round-trip. A different initial address, plaintext-word-driven step, unrelated cipher, other key stream, or a noncontinuous clock is outside these results. There is no new source selector or recovered unknown plaintext.

All three programs were executed in the connected JavaScript runtime using the repository source data. Standalone Node22/Windows execution was not separately performed. No CI workflow was created.
