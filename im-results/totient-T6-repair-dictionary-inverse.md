# LP2 prime-totient plus lag-six collision repair: exact dictionary inverse finds no five-rune English words

**Status (2026-11-10): completed finite cryptanalytic inversion, with full-manuscript original run and model-matched planted positive.** No unknown LP2 plaintext, key, or destination recovered. The direct reuse of LP2 page56's authenticated prime-totient keystream remains incompatible with ordinary unchanged GP-English words, even when the selected lag-six output-repair mechanism is explicitly inverted.

## Two independent ingredients joined into one exact decipherment model

The previously solved LP2 page56 uses the additive mod-29 key `K_j = p_(j+1)-1`, where `p_i` is the ith prime, with a documented selective literal-F exception (regression: [authentic solved page56](../sims/authentic_lp2_p56_totient_regression.cjs)). Independently, the unknown LP2 ciphertext contains unusually frequent word-internal six-apart affine echoes `T(x) = (24 - 2x) mod 29`. The [forward-model investigation](lp2-forward-generator-joint.md) proposes the following source-independent collision repair: generate tentative cipher rune `X_i=(P_i + sign*K_i) mod29`; whenever `X_i` equals the preceding *published* ciphertext rune `C_(i−1)`, optionally substitute `T(C_(i−6))` instead, for an eligible within-word position `i ≥ 6`.

This rule has a sharply constrained **exact inverse**, independent of plaintext guesses. For an observed rune `C_i` other than the printed T target, tentative `X_i` must equal `C_i`. Only if `C_i=T(C_(i−6))` and `C_i≠C_(i−1)` can an overwrite have occurred. At that site, tentative `X_i` belongs to precisely `{C_i,C_(i−1)}`, yielding at most **two** GP plaintext possibilities under a fixed prime key. The mechanism does not permit arbitrary rune substitution, an independently optimized pad, or an unbounded edit distance. A literal F carrier can optionally be passed through and can leave the prime clock unchanged, as an explicit page56-inspired variant.

The original source corpus contains **55 rune-bearing unsolved LP2 pages, 12,956 runes and 2,896 whole words**. All page boundaries and 32 crossing words are parsed canonically; the runeless page50 contributes no rune clock. Each original rune word is tested against **all allowed binary T-overwrite choices** with exact GP-encoded words from the committed frequency lexicon. The lexicon has **more than 25,000 unique GP spellings** and covers the genuine model-matched synthetic English plants. Results are classified by whole ciphertext-word length. No unknown plaintext symbols are assumed or patched from a language-model prediction.

## Frozen 12-setting family and exact original outcome

The key source is fixed to the genuine page56 `phi(prime)` stream with start at prime index zero; `sign` is ±1, key clock restarts at each printed rune word, physical page, or entire book, and literal F passthrough/key-skip is enabled or disabled. That is **3 × 2 × 2 = 12** predeclared configurations. The T-repair rule applies at original displayed-word indices six and later. The first six runes of a word admit no discretionary repair under this model.

| Measurement | Original LP2 result |
| --- | ---: |
| Complete GP words checked | **2,896** |
| Complete words of five or more GP runes | **1,132** |
| Largest complete dictionary-word count across the 12 inverses | **184 / 2,896** |
| Dictionary hits among original words of five or more runes, **every setting** | **0 / 1,132** |
| Ambiguous T-repair sites per run | **76–79** |
| Ambiguous complete dictionary-word outcomes | **0** |

The winning short-word configuration restarts the prime clock at each word, adds the inverse sign `−1`, and allows literal F passthrough. Its 184 complete lexicon matches have only one to four runes: **70 one-rune, 94 two-rune, 19 three-rune and one four-rune words**. No original long English dictionary word was recovered by any model, even allowing every permitted overwrite alternative on a word. Because the model can vary in the documented 12 ways and none recovers any five-rune word, scoring or selecting a favorite layout cannot rescue the proposed simple reuse of the known page56 key.

## Constructive positive demonstrating inverse coverage

Select **2,896 genuine GP lexicon words**, each with exactly the *original corresponding ciphertext word length*. Encrypt all 12,956 rune positions using the **actual `phi(prime)` key from its first prime, restarting at each word with `sign=+1`**. At word positions six and later, when tentative output equals the preceding published rune, deterministically apply `T(C_(i−6))` on approximately 82% of eligible collisions. This generated **29 actual output repairs** and exercises the ambiguous branch of the inverse. The inverse of the original mechanism recognizes **all 2,896 complete planted dictionary words**, including **all 1,132 words of five or more runes**. The plant demonstrates sensitivity to this concrete key/rewrite family on matched word lengths, with genuine English lexicon GP spellings and exact model inversion.

The original absence of any five-rune whole-word hit, in contrast to 1,132/1,132 in the matched positive, therefore strongly disfavors this particular *full, unmodified English GP word and source-key* construction. The result does not exclude a different key start far into the prime sequence, another word-alphabet mapping, a different repair at positions zero through five, a phase-advanced rejection process, nonstandard vocabulary, shortened/lengthened words, hidden nulls, or a genuinely different cipher.

## Reproduce

[`sims/totient_T6_repair_dictionary_inverse.cjs`](../sims/totient_T6_repair_dictionary_inverse.cjs) is dependency-free CommonJS under Node.js22. It reads the canonical original rune corpus and word spans, the checked-in GP lexicon, generates the first 12,988 totient-prime values, enumerates all allowed binary word-local corrections exactly, and asserts the synthetic model-matched positive. [Manual-only GitHub Actions execution 42768698368](https://github.com/FlareZ123/liber-primus/actions/runs/42768698368) **completed successfully**. This is distinct from [prime-draw-skip collision tests](../sims/prime_totient_collision_probe.cjs) and from the separate [highlighted-word prime-offset inversion](red-verse-prime-totient-anchor.md), which use a different hypothesized collision handling rule or source interval.

**Research consequence:** the T-repair echo is an intriguing source-independent ciphertext feature, yet combining it with the only independently authenticated LP2 keystream fails a direct whole-word inverse. Stronger future attempts require a reason to change the source key schedule or a decipherable nonlexical layer rather than additional accidental short-word scores.
