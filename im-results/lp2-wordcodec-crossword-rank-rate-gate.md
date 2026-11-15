# Original LP2 word-type obstruction and a two-back entropy-rank coder gate

**Status (15 November 2026): bounded original-cipher negative and necessary-state constraint. No recovered unknown plaintext, authentic key, source-selected ANS algorithm or final destination.** The exact experiment is [this read-only CommonJS SFT](../sims/lp2_wordcodec_gp29_crossword_rank_gate_sft.cjs), independently executed on the committed original source under [successful Windows Node.js 22 Actions run 43767401111](https://github.com/FlareZ123/liber-primus/actions/runs/43767401111). This report addresses [Director #1166](https://github.com/FlareZ123/liber-primus/issues/1166); it does **not** settle the broader family of cross-word arithmetic/ANS stream coders.

## Source facts and a word-reset impossibility

The canonical \`resources/liber-primus/lp2-corpus.json\` alphabet and the physical-page-aware parser \`sims/lp2_word_pages.cjs\` join genuine page-carried words. The 55 rune-bearing unsolved physical pages contain exactly **2,896 printed whole words / 12,956 runes**. The unchanged printed ciphertext has these length-conditioned type counts:

| GP-rune word length | Tokens | Different ciphertext word types |
| --- | ---: | ---: |
| 1 | 83 | **28** |
| 2 | 448 | **354** |
| 3 | 720 | **704** |
| 4 | 513 | **513** |
| 5–14 combined | 1,132 | **1,132** |

There are **1,645** words of length ≥4; **every one is distinct**. This is a stronger decision constraint than a global rune IoC alone.

**Exact invariant.** Suppose a deterministic, lossless, plaintext-word-to-ciphertext-word transformation fixes its initial state at *every printed word boundary*, preserves each word's GP-rune length, and has no carried code digits, changing key, or other auxiliary information. It is injective on words of a fixed length. Thus it **preserves the number of distinct word types at each length**, whatever Markov model, arithmetic cumulative frequencies, ranking, ANS table, or permutation it uses. To decode the authentic source into ordinary GP-native English under these premises, the 83 source singletons must become 28 distinct one-rune plaintext words. A source-native GP rendering of the complete project Gibran reference has only **9** distinct singleton types; the larger first-300k-character Shakespeare sample has **11**, even including nonprose/editorial one-character tokens. Their complete length-2 inventories have 45 and 59 types respectively, also far below the source's 354 different two-rune ciphertext types. These are conditional finite-corpus controls, not an assertion that every conceivable English vocabulary is limited to them. Ordinary single-letter English prose typically uses A and I, with occasional O.

Consequently, **a purely word-reset codec cannot plausibly be the sought original prose decoder** unless the original printed segmentation is not the plaintext segmentation, the plaintext register is nonstandard, or a cross-word/tweak/side state survives each boundary. This excludes that specific mechanism class independent of a secret fixed word substitution. A *streaming* ANS/range coder with state crossing words is outside the theorem.

A narrower source-only state check strengthens the implementation requirement. Among **82** one-rune words with a preceding word on the same physical page, group each single-rune ciphertext by the immediately preceding ciphertext rune. The 82 observations occupy **28** predecessor contexts; **16** contexts contain more than two different singleton outputs and **9** contain more than three, with a maximum of **six**. Any deterministic emitter whose entire boundary state is the last ciphertext rune needs at least six different plaintext singleton possibilities in one such context. This is conditional on intact printed breaks and a full state limited to that predecessor rune. Agent30's [stronger all-secret whole-book one-back frequency exclusion](lp2-previouscipher-rowperm-allsecret-frequency-gate.md) already rules out its corresponding book-static row-bijective family on normal GP-English frequency grounds. Do not duplicate that older key-family sweep.

## One fixed, fully reversible cross-word rank transport

A deliberately narrow, **length-preserving 29-symbol finite-state rank codec** tests whether an English-conditioned low-probability rune escape could explain the output repeat budget. It is a fixed-radix entropy-rank **surrogate**, not a variable-rate rANS compressor and not an operation authenticated by Cicada. The entire choice was frozen before observing the candidate plaintext:

1. Source-native Gibran GP29 words train a Laplace-\`+1\` order-one frequency model, with a distinct beginning-of-word context; ties resolve by canonical GP ordinal. Assign rank \`r=0..28\` by descending frequency.
2. Retain the last two ciphertext runes \`a,b\` **continuously across words and printed pages**, seeded \`(13,5)\`; only the *plaintext model context* resets at a word break. This state can distinguish repeated A/I singleton plaintext tokens.
3. For rank \`r=28\`, emit \`c=b\` (a repeat). For ranks \`0..27\`, emit \`c = (b + 1 + (5r + 5a + 13b) mod 28) mod 29\`. The 28 nonzero steps are a bijection because \`5\` is invertible modulo28.
4. The inverse obtains \`d=(c-b) mod 29\`; if \`d=0\`, \`r=28\`, otherwise \`r=17(d-1-5a-13b) mod28\`, then looks up the context-ranked plaintext GP symbol. State updates \`(a,b)←(b,c)\`. Every GP29 symbol, including F, IO/IA and ING/NG, remains represented exactly.

The 5/13 choices are exploratory integer constants suggested by GP primes and visible small numerals, **not a historical instruction selecting this cipher**. No parameters are fitted to LP2. The implementation is a total bijection on arbitrary GP29 words, requires no lossy projection or side bits, and its arbitrary GP29 and exact-length English controls successfully invert. A planted 2,896-word/12,956-rune GP-native Gibran book decodes **12,956/12,956** exactly. A wrong Shakespeare-trained decoder also re-encrypts its wrong output exactly: this is an expected mathematical invariant, not evidence of a correct key.

## Original-input failure and native rate budget

The original remains **86** adjacent repeat runes and **104/2,105** word-interior fiveback echoes. On the fixed rank model's original plaintext candidate:

- **p0–2 (729 authentic runes, 158 words):** normalized GP29 IoC **1.01199897496**; only **3/158** whole decoded words occur in the training lexicon. No contiguous source-language sentence.
- **Blind p3–7 (1,145 authentic runes, 255 words):** normalized GP29 IoC **1.01403029285**; only **3/255** training-lexicon hits. This separately held-out chapter confirms failure rather than local overfitting.
- **All 12,956 original runes:** normalized GP29 IoC **1.00724150344**, **48/2,896** native-lexicon hits. Forward re-encryption is 12,956/12,956 by the defined bijection, but conveys no historical identity.

On an exact native-GP length-matched planted corpus, the fixed output produced **zero adjacent repeated runes** and **68/2,105** word-interior fiveback echoes. With **256** independently seeded, length-matched Gibran plaintext plants using the *same frozen model*, **all 256** produced zero adjacent repeats. The simulated fiveback count averaged **73.26953125** with SD **7.98543654**, ranged **53–95**, and **none** reached the source's 104. This is a model-and-control-specific incompatibility, not an unconditional p-value for Cicada's unknown language or encryption architecture. The model's rank-28 repeat branch is never activated on these Gibran native plants, so the original's 86 escape-like repeats alone decisively show an inadequate source-rate model for that registered plain-language control.

**Decision:** retire this particular two-back fixed-radix rank transducer. Neither its exact reciphering nor its fitted-free state update produced authentic unknown plaintext. A genuinely viable arithmetic/ANS model would need a source-selected, reversible **cross-word normalization/escape/spillover operation**, an explicit clock and starting state, a way to account for all 86 repeats while preserving the observed singleton diversity, and a locked p0–2 decryption that predicts untouched p3–7. Do not simply retune the rare rank, state multipliers, or input corpus to imitate these outputs. The independent source-selected decoder/key is still missing; #1166 remains an open, broader research decision.
