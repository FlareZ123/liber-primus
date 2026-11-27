# Optional literal-F prime-clock inverse: p54 fit, p55 holdout

## Decision

The authentic p56 subtraction clock is not rescued on p54–55 by allowing every ciphertext F to be either a literal F hold or a consuming enciphered symbol, **and** allowing consuming plaintext F. This strictly relaxes the ordinary always-hold model and includes all-consuming as a special case. The original p54 maximum across all 464 tested initial prime origins and every compatible hold path is -5.82347 nats/rune; the frozen continuation into p55 is -6.36272, visibly nonprose. Both matched native mixed-policy plants and the genuine p56 control recover their exact origin, every fitted and held-out rune, and replay completely. No unknown plaintext/key recovered.

## Sender and exact inverse

Use the authentic p56 GP29 arithmetic, with zero-based origin `o`, consuming index `j`, and `K_j=(prime[j]-1) mod 29`. At every plaintext position the sender may either consume and emit `C=(P+K_j) mod29`, or, only when `P=0` (literal F), emit zero and hold the pointer. Unlike the strict LP1/p56 policy, consuming plaintext F is permitted. This relaxed sender requires a branch selector for unique encoding/decoding; it is an investigative superclass, not a claimed historical rule. Stage04's actual F crossings (#3193) demonstrate a consuming F policy in a distinct first-party example, while p56 establishes genuine held F. They do not independently authorize switching within LP2.

At physical index i, the DP state is the number h of prior held F events and the last two decoded symbols a,b. The consuming inverse is `p=C_i-K_{o+i-h} mod29`; when C_i=0 a second inverse edge emits F and increments h. Keep the maximum cumulative interpolated trigram log likelihood for each (h,a,b), with full backpointers. Both edges are evaluated even when they emit the same F, because their clocks differ. This is exact over all possible branch sequences under the fixed objective, without beam pruning. No rune positions/words are rearranged. The fit ranks all origins 0–463 (the original 2013 prime_echo count). The count defines a finite exploratory origin bound, not a source-selected LP2 initialization. The held-out continuation starts from the single best prefix state and never retunes the origin or prior hold choices.

Native training: pinned Shakespeare first300k, greedily GP-transliterated per #2608, plus solved donor sections 0,2,4,6,8, with section boundaries reset and no input from sections 1,3,5,7. 218,386 training runes. Trigram probabilities back off to bigram and unigram via fixed pseudocount masses 8,5, and 0.5 per symbol. The original fit excludes p55 altogether. The 308-rune native plants have the same 232/76 division; plant 1 uses donor section 1 prefix and origin 173 with alternating held/consumed plaintext Fs, plant 2 uses section 3 prefix and origin 289 with holds at F occurrence indices not divisible by 3. The real p56 source is donor section 7, 60/25 split, origin 0, and its all-F-hold forward encoding exactly reproduces the original 85-rune ciphertext before any fitting. No native control is trained on its own section.

| Input | Selected origin (true rank) | Prefix score nats/rune | Frozen suffix score | Exact fit / holdout |
|---|---:|---:|---:|---:|
| Native WELCOME plant | 173 (1) | -2.385764 | -2.443475 | 232/232; 76/76 |
| Native KOAN plant | 289 (1) | -2.216422 | -2.199168 | 232/232; 76/76 |
| Authentic p56 | 0 (1) | -2.543470 | -2.667761 | 60/60; 25/25 |
| Original p54→55 | 51 | -5.823474 | -6.362718 | Unknown truth; no prose |

Original runner-up origins 221 and 307 score -1361.94296 and -1372.09596 total prefix log likelihood, against -1351.04587 at origin 51. The winning original path has 2 holds within p54 and 5 total. Full original decode/re-encode agrees exactly on 308/308 runes; this is legality, not authentication. Beginning: `E J O EA Y A C A F G NG Y U H I P TH E A B J P O G I Y L J D U J J G T O J Y W E C E F R R J TH T P EA F I R B B N OE IA L EO D Y R U H F IA L Y Y I I G E P T T D S T D IA Y EA O U P U F F U AE M`. Complete output, scores, hold flags and controls in the JSON artifact.

## Scope

This is a complete finite-origin, optional-F **prefix MAP** search and frozen-state holdout, not a claim that all possible plaintexts are impossible, that the original uses this clock, or that an unknown different origin, different prime order, independent reset, or extra cipher layer is excluded. The language model is an approximation. Two planted controls are calibration, not a universal correctness theorem. No independent original source selects the relaxed per-event policy. Retire the tested direct p54–55 prime-clock transfer rather than expand arbitrary F policy schedules.

## Reproducer

`node sims/lp2_optional_literal_f_prime_clock_sft.cjs`

- [Source](../sims/lp2_optional_literal_f_prime_clock_sft.cjs)
- [Complete exact output](lp2-optional-literal-f-prime-clock-output.json)
- Pinned corpus and donor source paths are in the script.
- Executed the full experiment in the connected JS runtime using the original repository data, including both hidden-origin controls and actual p56. The standalone Node wrapper was not separately executed.
