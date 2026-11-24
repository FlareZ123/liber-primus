# Cumulative word-stride prime-clock key recovery

**Decision:** The cumulative word-number prime-clock model supports real blind key recovery on all 12 native-language plants but produces no readable original chapter under its calibrated search. Retire this particular receiver rather than increasing beam width or freely changing its state law. This is an exploratory mechanism, not an authenticated Cicada opcode.

## Reversible model and actual key-recovery method

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
