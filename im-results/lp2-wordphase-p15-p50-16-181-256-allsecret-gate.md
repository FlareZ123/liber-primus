# Original 16-, 181-, and 256-word periodic secret alphabets cannot expose native GP29 prose

**Agent 3, 22 November 2026. Classification: exact source-cipher key-independent exclusion of three originally nominated periodic word-key models, conditional on authentic GP29 plaintext concentration. No unknown LP2 plaintext, authentic key, or terminal destination is recovered.**

## Why these three clocks merit a joint original-cipher test

The source LP2 has **2,896 complete printed words and 12,956 runes**, with 32 original words crossing page breaks. The already decoded p15 Fibonacci square is a physical **4×4 = 16-cell** object. The full original word count factors without padding as **2,896 = 16 × 181**. Separately, the physical pp49–51 numerical table contains exactly **256 source-visible cells**, each a byte under the conventional base60 reading. These real numbers suggest, as a falsifiable candidate, an unknown secret **word-indexed** substitution key repeated every 16, 181, or 256 complete words. The 16- and 181-clocks represent the two axes of one unpadded 16×181 grid; the 256-clock corresponds to the complete printed p50 table.

Neither p15 nor p50 authorizes a particular alphabet mapping or a reset across printed words, nor does the 16×181 coincidence establish that all manuscript word separators are original plaintext delimiters. Those are candidate ciphers tested here rather than creator instructions. Unlike the older p15 sixteen-column whole-word **transposition** and p50 eight-column readout studies, this test allows **every symbol substitution in every phase to remain completely secret**. It therefore avoids merely trying a few fitted Caesar offsets or a guess at a table key.

## Exact all-secret bound for each complete original clock

For a candidate period `p ∈ {16,181,256}`, let `w` be the complete printed source-word number, zero-based. Allow any secret permutation `σ_(w mod p)` of the entire 29-symbol GP rune alphabet, used for every rune of that word. Each period phase can have a completely independent unknown 29! alphabet. Any fixed word-phase Caesar, affine cipher, alphabet substitution, or full 29-letter secret codebook is inside this family. The model allows the initial key to be unknown and any single fixed phase rotation because that merely relabels the p phases.

For all original ciphertext glyphs, count `M[s,c]`: how often cipher rune `c` appears at phase `s=(w mod p)`. Under **every** choice of these independent secret alphabets, the number of positions decrypting to the plaintext's four most common GP rune types cannot exceed the sharp attainable bound

`U_4 = Σ_{s=0}^{p−1} (sum of the four greatest values of M[s,*]).`

This holds regardless of whether plaintext words were secretly reordered **before** applying the phase-dependent cipher: any permutation of complete English words retains its four-symbol unigram concentration. It does not survive adding an unknown **post-encryption** reordering or another value-changing layer, for which separate rules would be necessary.

The resulting exact original-cipher values are:

| Hypothetical key reset by word index | Independent secret 29-way alphabets | Maximum top-four original output | Share of all 12,956 runes | Within-phase collision rate |
| --- | ---: | ---: | ---: | ---: |
| Period 16 (p15 4×4 square size) | 16 | **2,338** | **18.0457%** | 0.0345093 |
| Period 181 (2896÷16) | 181 | **3,624** | **27.9716%** | 0.0338905 |
| Period 256 (p50 table cells) | 256 | **4,021** | **31.0358%** | 0.0340394 |

All available original word boundaries are retained, and the same 12,956 source rune indices are asserted directly against the canonical continuous source transcription. No original ciphertext symbol is redacted or replaced. The all-secret bound is exact over **all permutations**, not a statistical search over passwords.

## Source-native GP29 plausibility and exact planted decryptions

Authentic solved LP1 spelling rules are used to encode two pinned unrelated English controls into GP29 runes, including `ING→ᛝ` and `IO→ᛡ`. Every full **12,956-rune** heldout window at fixed stride503 is compared with the upper bounds, with no search for favorable ciphertext phase:

- Gibran, **99** windows from 62,492 GP29 runes: minimum **4,373** of 12,956 in the four most frequent native runes (**33.7527%**).
- Shakespeare, **406** windows from 217,106 GP29 runes: minimum **4,266** (**32.9268%**).
- All three original-source exact maxima, including the most permissive period256's **4,021**, fall below **all 505** finite native windows.

As a real-positive implementation check, the SFT takes **12,956 authentic Gibran GP29 runes**, partitions them by the original 2,896 word-length slots, generates **16/181/256 completely arbitrary independent 29-way secret substitution alphabets** respectively, encrypts all glyphs with the nominated repeating word-phase key, and recovers the entire plaintext **12,956/12,956** exactly using the true inverse. The original ciphertext-derived upper bound for the planted cipher includes the real known plaintext's four-rune mass in all three cases. This confirms that an implementation bug cannot exclude actual native plaintext under this modeled encryption.

## Decision and the missing operation

**Retire the source-natural repeating 16-, 181-, and 256-word static substitution codebooks as standalone unknown-LP2→native-English decoders**, regardless of all hidden alphabets. The failure is invariant to the particular p15 square values and p50 table byte values; no tuning of those values can rescue this class. The 16×181 factorization and p50 table can still motivate other operations, but they do not supply an authenticated hidden plaintext key.

A value-changing **per-word** key, a secretly varying page/chapter key, a second position clock, a mixed-radix transport, or any nonpermutation/nonlocal emitter can violate these specific bounds. Those alternatives require an independently motivated source selector and a real original-cipher prediction before another key search. This result does **not** exclude a non-English source whose top-four GP rune concentration is as low as the observed original upper bounds.

Original-cipher reproducer: [`sims/lp2_wordphase_16_181_256_allsecret_sft.cjs`](../sims/lp2_wordphase_16_181_256_allsecret_sft.cjs). It uses [canonical source runes](../resources/liber-primus/lp2-corpus.json), [continuous original printed words](../resources/lp2-transcription.txt), and two source-pinned native GP29 controls; it writes no files. The experiment complements [word-length resegmentation all-secret gate](lp2-wordlength-resegment-allsecret-original-gate.md), whose hidden alphabets are indexed by **word length/position**, whereas this gate indexes them by **complete word ordinal modulo the source-nominated periods**.
