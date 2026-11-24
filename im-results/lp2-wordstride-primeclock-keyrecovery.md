# Cumulative word-stride prime-clock key recovery: plaintext and ciphertext clocks

**Decision:** The cumulative word-number prime-clock model supports real blind key recovery on all 12 native-language plants but produces no readable original chapter under its calibrated search. Retire this particular receiver rather than increasing beam width or freely changing its state law. This is an exploratory mechanism, not an authenticated Cicada opcode.

## Complementary exact ciphertext-word cumulative clock

**Decision:** The observable ciphertext-word GP-prime-sum stride also fails. This differs from the plaintext-dependent cumulative stride below, the earlier previous-ciphertext-word *reset* clock, and the ciphertext-*rune*-totient stride: the start persists between words, advances by the complete current ciphertext group's prime sum, and is independent of the unknown plaintext or F interpretation.

For each printed group, use zero-based prime ordinal (s), local consuming position (i), and (K_i=(p_{s+i}-1)\bmod29), where (p_0=2). Encrypt (C=(P+K_i)\bmod29); under the historical plaintext-F bypass, (P=0) emits 0 and holds the local position. After the complete group set (s\leftarrow s+\sum_{c\in C}\mathrm{GPprime}(c)). Thus the receiver can compute every word start from a single initial ordinal and observed previous ciphertext; no unknown word-level feedback or circular encryption. The ordinary consuming-F counterpart increments (i) on every rune. The signed words/numbers clue and known p56 operation motivate the ingredients, but no original source authenticates their cumulative combination.

Exact attack: join real page/line carries, partition at the eight printed dollar-section boundaries, and assert canonical equality of all 2,896 groups / 12,956 runes. Independently grant every section any initial ordinal 0–12,956 inclusive. The local hold inverse propagates a bitmask of possible consuming counts; an observed zero admits a literal-F hold and, when its inverse is nonzero, a distinct consuming branch. Since future word start depends only on the ciphertext sum, exact local feasibility suffices to discard a starting ordinal without a language assumption. For surviving prefix ordinals, rank every legal word path with a target-excluded, smoothed GP29 word-local trigram trained on native solved sections other than the three controls. Select the origin using the first floor(0.6 × word count) groups only, freeze, and decode the remaining groups once. In the ordinary-F arm each origin has a unique inverse, so all 12,957 origins are ranked; no beam or crib. Forward replay is asserted for every selected full or partial path.

| Original $ section | Runes | Groups | Hold: first group leaving zero origins (1-based) | Consuming-F prefix-selected origin | Frozen suffix nats/rune |
|---|---:|---:|---:|---:|---:|
| 1 | 729 | 158 | 75 | 11487 | -5.39951 |
| 2 | 1145 | 255 | 80 | 605 | -5.47024 |
| 3 | 1738 | 385 | 88 | 2686 | -5.20147 |
| 4 | 1894 | 435 | 74 | 12449 | -5.23784 |
| 5 | 1021 | 224 | 71 | 11531 | -5.20097 |
| 6 | 1433 | 326 | 77 | 1026 | -5.23131 |
| 7 | 1680 | 378 | 65 | 6247 | -5.30252 |
| 8 | 3316 | 735 | 72 | 2770 | -5.23826 |

All 103,656 section/origin probes are mathematically rejected by the transparent-F arm before the prefix split, without using the language model. These are exact original contradictions, independent of the presumed register. Ordinary F admits all origins, but all eight frozen-prefix-selected candidates are nonprose, with holdout scores -5.20 to -5.47 nats/rune versus native plants -2.42 to -2.61. This arm is a predictive ranking failure rather than a proof excluding all languages or keys.

Independent mechanism controls use native WELCOME (seed 73), first KOAN (168) and second KOAN (3301), withheld entirely from model training. Under both F conventions all three true origins rank first on prefix alone. The hold arm recovers 208/208, 335/336 and 137/137 suffix runes (680/681); two full plaintext paths contain errors despite exact forward replay. The ordinary arm recovers all 681/681 withheld runes and all three complete planted texts exactly. These are synthetic controls on genuine solved-native plaintext, not historical ciphertext evidence for the proposed law.

Reproduce from repository root with Node: [hold SFT](../sims/lp2_cumulative_cipherword_primeclock_sft.cjs) and [consuming-F SFT](../sims/lp2_cumulative_cipherword_primeclock_consuming_sft.cjs). Exact [hold output](lp2-cumulative-cipherword-primeclock-output.json) and [consuming output](lp2-cumulative-cipherword-primeclock-consuming-output.json) include the source blob SHAs, candidate counts, scores and excerpts. Both computations executed in connected V8 with the exact repository inputs; no CI run claimed. No unknown plaintext or authenticated key. Retire these two fixed cumulative ciphertext-sum conventions within the tested ordinal domain; arbitrary larger origins, alternative word framing, and independent source-selected state transitions remain outside this result.

## Plaintext-dependent reversible model and actual key-recovery method

Unlike the prior [reset-to-word-number experiment](lp2-wordfed-primeclock-original-gate.md), the prime index here persists across words: start s in 0..12,956, decrypt each word by consecutive prime-minus-one shifts beginning at s, then advance the start for the next word by the current recovered plaintext word's GP prime sum (or GP0 sum), s'=s+sum(P). Hold F means plaintext F emits literal F without consuming an intra-word shift; ordinary F consumes the same shift as any other rune. The signed word-number instruction and solved p56 clock motivate the exploratory composition, not its authenticity. All observed F ambiguities retained at each visited state. Merge candidates at identical next state using an additive word-local score, retain top1024 states per word, and recover initial seed and complete plaintext path. Every returned path exactly re-encrypts its original input. Beam search is not an all-key exclusion.

Frozen language model: TextBlob native-GP normalized word counts plus first70% of Gibran and Emerson, 30,627 lexical entries; smoothed word-internal character trigram including boundary, mixture 85% lexical/15% character. No LP1/p57 text used as training input. Calibrate on independent p57 (seed3301,95 runes), LP1 koan excerpt (seed12345,181 runes), heldout Gibran (seed1033,182 runes). All four configurations recover exact hidden seed and every rune in all three plants (12/12). True path retained throughout. Planted scores −1.748 to −2.223 nats/rune; score differences to second final states are recorded in raw output. Exact replay is an implementation invariant, not sufficient key evidence.

## Original full-book section application

Original source transcription joined across physical-page/line carries then divided at its literal $ section markers. The eight source sections concatenate to all 2,896 complete words /12,956 runes with exact canonical corpus agreement. Additionally test the physically separate p54–55 heading/terminal pair as a candidate independent reset. All four configurations use identical 0..12956 initial seeds and width1024. Train on first45 words (or half the section if shorter), freeze best inferred state and continue on every remaining source word; no new start or parameter fit. Full raw candidate texts, score margins, peak state counts, truncations and per-plant recovery are in [machine output](lp2-wordstride-primeclock-keyrecovery.json).

| Weight | F | Source section | Inferred initial index | Dev nats/rune | Dev lex words | Frozen continuation |
|---|---|---|---:|---:|---:|---|
| prime | hold | section1 | 1675 | -7.710 | 2/45 | dead after 10 words (exact from selected state) |
| prime | hold | section2 | 3866 | -8.028 | 3/45 | dead after 12 words (exact from selected state) |
| prime | hold | section3 | 473 | -8.242 | 3/45 | dead after 16 words (exact from selected state) |
| prime | hold | section4 | 11026 | -8.055 | 5/45 | dead after 1 words (exact from selected state) |
| prime | hold | section5 | 1344 | -7.886 | 3/45 | dead after 4 words (exact from selected state) |
| prime | hold | section6 | 12835 | -7.905 | 6/45 | dead after 3 words (exact from selected state) |
| prime | hold | section7 | 1507 | -8.035 | 4/45 | dead after 17 words (exact from selected state) |
| prime | hold | section8 | 7137 | -8.374 | 4/45 | dead after 1 words (exact from selected state) |
| prime | hold | supplemental p54–55 | 8239 | -7.930 | 2/33 | dead after 2 words (exact from selected state) |
| prime | ordinary | section1 | 7533 | -7.444 | 6/45 | -8.725; 7/113 lex |
| prime | ordinary | section2 | 7565 | -7.545 | 3/45 | -8.706; 12/210 lex |
| prime | ordinary | section3 | 7434 | -7.446 | 3/45 | -8.567; 26/340 lex |
| prime | ordinary | section4 | 3845 | -7.693 | 5/45 | -8.910; 31/390 lex |
| prime | ordinary | section5 | 10123 | -7.773 | 4/45 | -8.998; 12/179 lex |
| prime | ordinary | section6 | 9045 | -7.676 | 6/45 | -8.787; 20/281 lex |
| prime | ordinary | section7 | 6813 | -7.754 | 5/45 | -8.983; 18/333 lex |
| prime | ordinary | section8 | 7045 | -7.665 | 6/45 | -8.742; 38/690 lex |
| prime | ordinary | supplemental p54–55 | 6443 | -7.711 | 3/33 | -8.363; 5/33 lex |
| ordinal | hold | section1 | 5876 | -7.829 | 5/45 | dead after 57 words (exact from selected state) |
| ordinal | hold | section2 | 4674 | -8.087 | 2/45 | dead after 45 words (exact from selected state) |
| ordinal | hold | section3 | 9443 | -8.430 | 0/45 | dead after 8 words (exact from selected state) |
| ordinal | hold | section4 | 5926 | -8.093 | 8/45 | dead after 1 words (exact from selected state) |
| ordinal | hold | section5 | 9373 | -8.234 | 5/45 | dead after 84 words (exact from selected state) |
| ordinal | hold | section6 | 2486 | -7.865 | 5/45 | dead after 14 words (exact from selected state) |
| ordinal | hold | section7 | 8059 | -7.852 | 5/45 | dead after 20 words (exact from selected state) |
| ordinal | hold | section8 | 5473 | -8.432 | 5/45 | dead after 4 words (exact from selected state) |
| ordinal | hold | supplemental p54–55 | 7179 | -7.941 | 1/33 | dead after 3 words (exact from selected state) |
| ordinal | ordinary | section1 | 4224 | -7.752 | 4/45 | -8.619; 9/113 lex |
| ordinal | ordinary | section2 | 4192 | -7.788 | 4/45 | -8.620; 17/210 lex |
| ordinal | ordinary | section3 | 3358 | -7.662 | 1/45 | -8.814; 29/340 lex |
| ordinal | ordinary | section4 | 7220 | -7.676 | 3/45 | -8.704; 35/390 lex |
| ordinal | ordinary | section5 | 3229 | -7.698 | 5/45 | -8.820; 8/179 lex |
| ordinal | ordinary | section6 | 5414 | -7.808 | 6/45 | -8.738; 24/281 lex |
| ordinal | ordinary | section7 | 12437 | -7.694 | 8/45 | -8.610; 22/333 lex |
| ordinal | ordinary | section8 | 6604 | -7.452 | 6/45 | -8.734; 36/690 lex |
| ordinal | ordinary | supplemental p54–55 | 10066 | -7.475 | 3/33 | -8.671; 1/33 lex |

No candidate yields a meaningful extended native passage or reliable continuation. Original language scores and lexical coverage are substantially worse than the exact recovered controls. Some F-hold continuations have an exact contradiction from the frozen selected state before any beam truncation; others are search-limited. No unknown plaintext or key authenticated. This is a calibrated search result for this specific mechanism and seed range, not an exclusion of arbitrary nonlinear prime-dependent encryption or arbitrary language models.

## Reproduction

Run `node sims/lp2_wordstride_primeclock_keyrecovery_sft.cjs` at repository root; dependencies only Node built-ins. Input paths embedded in script. Executed via V8 using exact fetched repository files on 24 November 2026. Preserve results and do not re-sweep these same word-stride configurations without new independently selected key evidence.
