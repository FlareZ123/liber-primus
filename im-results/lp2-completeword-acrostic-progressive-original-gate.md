# Every complete LP2 word's initial/final rune: original-source acrostic and progressive key gate

**Agent 42, 17 November 2026.** **Decision: finite negative for direct and classical progressively shifted complete-word acrostics.** No new plaintext, historical key, cipher architecture, or Cicada continuation is recovered. This test examines a distinct manuscript-selected channel from the already documented 206 *printed-line initial* runes and the thirteen giant red initials. It does not re-execute those searches.

## Why this is an executable source route

The authenticated 2016 Cicada instruction calls the manuscript's *words* its map, and the unsolved book visibly prints word divisions. One human-readable way to use that instruction is to take one rune from every complete printed word, potentially obtaining a second message that does not require decrypting the word bodies. As a small, historically familiar next operation, a classical progressively changing Caesar alphabet adds or subtracts the next mod-29 number at each word; a change of printed physical page or decorated chapter may reset that progression. These are **hypothetical** readings. Neither the 2016 text nor an original-page instruction specifies acrostics or a progressive alphabet.

This is a sharply bounded direct test. It does not attempt to turn a short apparent word into a key, tune an offset to recovered language, or invent a new encrypted framing.

## Original unchanged source and exact extraction

Read `resources/liber-primus/lp2-transcription.txt` with the already checked-in `sims/lp2_word_pages.cjs` parser and compare **every rune** against `resources/liber-primus/lp2-corpus.json`. Preserve the actual punctuated complete words through physical line and page wraps. The source has **12,956 unsolved GP29 runes**, **2,896 complete printed words**, **32 authentic words carried across original page boundaries** and **55 rune-bearing physical pages among p0–55**, with numeral-only p50 skipped. No word fragments were split into fake initials at page turns.

Define two complete **2,896-rune** tapes: (1) the first GP rune of each original complete word and (2) its last GP rune. For each tape, test literal order and the two inverse progressive shifts `P_i=(C_i±i) mod 29`, where `i` counts complete words from zero, either continuously through the book, restarting at each original physical page, or restarting at each of nine *actual* illustrated chapter boundaries: p0/3/8/15/23/27/33/40/54. The clock restarts based on the **original word's starting physical page**; the 32 page-spanning words stay intact.

Each direction and reset has the entire modulo-29 alphabet as possible starting offset, but all such offsets are mere global rotations of the recovered GP symbols and **cannot alter the IoC statistic**. One representative origin zero therefore tests every 29 such phases for the declared pure progressive model. These direct classic Caesar lifts treat all 29 GP symbols ordinarily; they make **no claim to exhaust** historically solved p56's different conditional plaintext-F bypass, alternative symbols, word reordering or hidden clocks.

## Original full-tape results

IoC is the exact GP29 unordered-symbol marginal collision rate `Σ n_r(n_r−1)/(N(N−1))` on all 2,896 produced runes. Unshifted uniform-GP baseline is **1/29=0.03448276**. The authentic original clear p57 PARABLE reference has **IoC 0.06270997** on 95 real GP runes, and a genuine historical GP-English passage normally has an unequal symbol distribution. None of the original full-tape outputs displays sustained readable text.

| Boundary tape | Direct | Decode −i, continuous | Decode +i, continuous | Decode −i, page | Decode +i, page | Decode −i, chapter | Decode +i, chapter |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Original **first rune per complete word** | **0.03442208** | 0.03438511 | 0.03436388 | 0.03441970 | 0.03450629 | 0.03435123 | 0.03441851 |
| Original **last rune per complete word** | **0.03454518** | 0.03441898 | 0.03446097 | 0.03452562 | **0.03463559** | 0.03447695 | 0.03442161 |

**An additional all-secret obstruction beyond the finite progressive-key menu.** Any arbitrary book-fixed secret **bijection** of the 29 GP runes merely renames the source's first-/last-rune counts, and **any rearrangement** of the complete acrostic merely moves those same counts. Thus even if both the entire 29! unknown substitution alphabet and an arbitrary 2,896-place transposition are freely selected, the exact original direct IoC remains **0.03442208** for the first-rune channel or **0.03454518** for the last-rune channel. A direct native-GP literary plaintext under a pure substitution/transposition acrostic would retain its source-native letter-collision distribution. This exact invariant, coupled with the independent solved reference, makes such a two-layer direct ordinary-GP-English reading implausible regardless of its unknown key/order. It does not forbid unusually uniform source language, an intermediate register, multiple changing alphabets or other value-changing cipher rules.

The most favorable of these fourteen finite original readouts is **0.03463559**, near the uniform baseline and far from the solved p57 control. The native source first-rune tape begins `S S TH F O N N H P EO A B E S Y B G NG I Y TH H T X E C EO TH Y Y`; the last-rune tape begins `F C AE OE TH U TH IA N TH X P F IA H U P TH G J Y EO IA Y NG N TH P EA Y`. They do not contain independent GP plaintext.

## Distinct source-specific 16-value key: p15 numerical spiral and 2,896 = 16 × 181

The manuscript independently supplies exactly **sixteen visible decimal numbers** on its p15 4×4 prime/Fibonacci square, and the original word parser independently yields **2,896 = 16 × 181** complete words. This motivates one extra, fully source-frozen direct key interpretation: take the printed sixteen numbers `mod 29` as a period-16 GP additive key acting **once per complete printed word**, on the acrostic first or last rune. Use either the genuinely source-printed row-major order or the independently solved red-3299-start spiral order. Reset exactly at the beginning of the book, with the visible red spiral start for the spiral variant. Both inverse signs are tested, without any phase tuning, modifying the 16 values, or transplanting previous p15 full-word transposition experiments.

| Complete-word channel | Key direction | Decode minus numeric key | Decode plus numeric key |
| --- | --- | ---: | ---: |
| First rune | Red-3299 spiral | 0.03448005 | 0.03458692 |
| First rune | Literal printed row-major | 0.03459981 | 0.03441779 |
| Last rune | Red-3299 spiral | 0.03454542 | 0.03453373 |
| Last rune | Literal printed row-major | 0.03467781 | 0.03445047 |

All **eight** unchanged original 2,896-rune output tapes remain effectively uniform in GP29 and do not reveal coherent plaintext. A source-native p57 positive plant for each case re-encrypts and recovers **2,896/2,896 runes**. Unlike a broad keyword hunt, the key/order/clock are exact functions of *one original image and the original complete word count*. This finite failure weakens the specific p15-numerals→word-initial/word-final GP29 acrostic explanation while preserving the mathematical p15 spiral as independently solved source evidence. It cannot exclude other consumers of the p15 numbers or original words.

### All-secret 16-phase alphabet obstruction on the same complete-word tape

The printed sixteen-cell p15 grid could also choose **sixteen entirely secret GP29 substitution alphabets**, one per original complete-word position modulo 16, instead of the eight literal additive consumers above. This grants `(29!)^16` possible keyed substitutions without guessing any of them. On the **2,896 = 16 × 181** whole-word acrostic, each of the sixteen phase classes has exactly **181 original symbols**. Every per-phase secret bijection preserves its count of equal within-class ordered pairs, so the exact necessary invariant is the **phase-pooled collision rate**, with common denominator `16 × 181 × 180 = 521,280`.

| Exact 16-phase ciphertext channel | Equal within-phase ordered pairs | Pooled IoC |
| --- | ---: | ---: |
| All original first runes of complete words | **17,886** | **0.034311694291** |
| All original last runes of complete words | **18,472** | **0.035435850215** |
| Original clear p57 GP text repeated as a 2,896-symbol *language control* | **35,226** | **0.067575966851** |

The ratios were computed directly from the unchanged source-runic transcription, with complete cross-page words joined and phase origin fixed at the first printed word. Therefore **every possible fixed sixteen-phase, 29-symbol bijective substitution key yields the corresponding exact original low collision rate**, and a further transposition *within a fixed phase* cannot change it. The control is a repeated 95-rune genuine clear GP passage and is a demonstration, **not** a broad native-English corpus minimum or a formal all-language impossibility proof. This makes ordinary GP-native prose from these exact complete-word acrostics highly implausible under a fixed period-16 polyalphabetic substitution, even after freeing all sixteen keys. The earlier [p15 period-16 key-independent gate](lp2-p15-period16-allsecret-source-gate.md) studies **full rune ciphertext on physical pp16–23** with original printed word-phase clocks; it is a separate original-data channel from the 2,896-symbol acrostics assessed here. No independent source directs a cipher to use the acrostic register or fixes a subsequent mechanism.

## Stronger p15 word-map test: select a rune *inside* every original word

The same source-visible p15 16-number square could convey *which rune to take from each word* rather than a 16-symbol cryptographic pad. This is a closer literal implementation of the authenticated 2016 `words are the map` / `numbers are the direction` message, although **neither source authenticates this particular modulo word-length pointer**.

For word `w_i` of its exact original length `L_i`, take source-printed number `N_(i mod 16)` from either the red-3299 spiral or the unmodified printed row-major grid, then choose rune at position `(N_(i mod 16)−b) mod L_i` from the front or from the back. `b=0` or `1` are the two literal zero/one-based ordinal conventions. All page-spanning words are combined before the source selector is applied. This freezes exactly **eight source-based complete-message extraction cases**, one selected rune from every one of 2,896 original words. No rune is decrypted, shifted, rearranged or changed.

| Original number order | Position convention | Choose from start IoC | Choose from end IoC |
| --- | --- | ---: | ---: |
| Red-3299 spiral | 0-based | 0.03439036 | 0.03457500 |
| Red-3299 spiral | 1-based | 0.03436674 | 0.03436030 |
| Literal printed rows | 0-based | 0.03446717 | 0.03445214 |
| Literal printed rows | 1-based | 0.03453707 | 0.03436364 |

All eight exact original extracted 2,896-rune tapes again show **uniform-like GP29** marginals and no coherent original plaintext. **Eight complete-length native message implants** independently overwrite only the selected rune of each original-format word with a genuine clear-p57 GP rune and recover all **2,896/2,896** implanted characters through the fixed selectors. That tests whether an actual hidden native GP message in the nominated physical channel would survive extraction. Its failure on the unchanged source rules out a straightforward readable-message interpretation of these eight particular p15-selected channels. It cannot rule out an encrypted message subsequently passing through an independently specified extra cipher, a different source-selected coordinate system, or a wholly different use of the original word boundaries.

## Reversible positive plant and decision

The full 95-rune **genuinely clear p57 GP source** serves as an independently decrypted plaintext alphabet sample. Repeat it to 2,896 runes; for every one of the six progression/shift-direction cases and four fixed p15 numeral-key cases at each edge channel, encrypt under the stipulated mod-29 clock, then invert and assert exact **2,896/2,896 recovered source indices**. Also assert that every original decoded tape re-encrypts to **the exact original extracted rune sequence**, and that constant offset rotations leave IoC mathematically unchanged. A successful roundtrip is an implementation check, **not evidence that this operation historically encrypted LP2**.

Run the standalone CommonJS Node 22 test `node sims/lp2_completeword_acrostic_progressive_original_sft.cjs`. Source and the original-data control: [reproducer](../sims/lp2_completeword_acrostic_progressive_original_sft.cjs) and [manual-only Windows workflow](../.github/workflows/agent42-completeword-acrostic-original-manual.yml). The complete **30-readout original-input Windows Node22 [manual Actions run 44140075104](https://github.com/FlareZ123/liber-primus/actions/runs/44140075104) finished SUCCESS** on 17 November 2026. The source-file assertions, native additive plants and native hidden-message implants all passed. Two earlier incomplete-version queued dispatches were cancelled without running.

**Independent source-exact preflight, 17 November 2026:** Before the queued Windows job, the **unchanged, committed standalone CommonJS script and unchanged `lp2_word_pages.cjs` parser** were evaluated in a JavaScript V8 runtime with read-only copies of the **exact committed original JSON and runic transcript**, substituting only filesystem/path/assertion module shims for the restricted environment. The complete script executed all internal assertions successfully: **12,956 original ciphertext runes exactly agree with the joined 2,896 complete words, 32 page carries**, all **14+8+8=30 extracted/direct cases** were emitted, and **20 reversible native-GP ciphertext plants plus eight hidden-message implants** passed. The observed 30-case IoC range was **0.03434837–0.03467781**. The source-original V8 preflight and the separately completed **SUCCESS Windows Node22 CI** agree on the script's assertions. The earlier dispatch label '28-case' counts only the 12 progressive plus 8 p15 additive plus 8 p15 pointer keys; adding two direct readings gives **30 actual emitted original rows**.

**Fork:** The simplest complete-word first/last acrostic, the direct p15 sixteen-value additive key, and eight original p15-selected within-word message channels all fail to uncover an authentic new text. This does not exclude a separately keyed acrostic, a different source-selected set of words, a different alphabet, a more complex state rule or the possibility that printed word boundaries are decoy framing. Do not extend this into an unconstrained key/word-index menu. A fresh attempt needs an **independent original instruction selecting exact word positions and a reversible decoding rule** that recovers a coherent untouched original passage.
