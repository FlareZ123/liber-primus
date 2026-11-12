# Original LP2 word-ordinal 256-phase arbitrary-key alphabet gate

**Evidence class:** conditional, exact key-independent equality invariant on original GP29 ciphertext, with 5,000 source-native 2,709-word reference draws per declared clock family. **No unknown plaintext, authentic key, or original decoding operation recovered.**

## Intended source route and weakest assumption

The signed 2016 Cicada language about words and their numbers suggests investigating *word ordinal* as a key clock. The original pp49–51 32×8 numerical table has **256 printed cells**; other visible counts suggest comparison periods 16 (sixteen-page floral bookend), 32 (number-grid rows), and 43 (signed-2016 message word count). This motivates a precisely delimited, historical-style test:

For the complete original printed word with global zero-based ordinal j, suppose its first source-GP29 plaintext rune P[j] is encrypted as C[j] = S_(j mod m)(P[j]), where each of the m independently secret S functions is an arbitrary *bijection* of all 29 runes. The remaining runes of every word may be encrypted by any unrelated mechanism; this gate tests only the word-initial branch. We fix m ∈ {16,32,43,256} and use the authentic consecutive original word clock. No secret key, phase shift, reset, word reordering, transformed alphabet or plaintext phrase is fitted.

The **weakest premise** is that this hypothesized cipher acts one-to-one on recognizable native-English GP29 word initials and retains the original printed word divisions. Neither the signed message nor p50 explicitly instructs the author to substitute word initials with a period-256 alphabet. Therefore our numerical rejection is a *necessary-condition test of a motivated candidate*, not a claim about Cicada's historical cipher or all stateful encryption.

## Original data and exact invariant

The canonical original transcript in [resources/lp2-transcription.txt](../resources/lp2-transcription.txt), read by the shared [word parser](../sims/lp2_word_pages.cjs), contains **2,896 true printed words and 12,956 runes** in 55 rune-bearing unknown LP2 pages, including **32 words crossing pages**. Physical p50 contains the runeless numeric grid. We retain 2,709 words of **one to eight GP runes**, with exact counts by word length [83,448,720,513,317,256,216,156]. The 187 longer words remain in the global *clock*: ignoring them for reference matching must not collapse word ordinals or change phases.

Let n_(k,r) be the number of retained word initials with ciphertext rune r in absolute ordinal phase k = j mod m. Define

    Q_m = [Σ_k Σ_r n_(k,r)(n_(k,r) − 1)] /
          [Σ_k N_k(N_k − 1)].

For every bijective alphabet S_k, P_i=P_j if and only if C_i=C_j when both use the same phase. **Q_m is therefore exactly identical on plaintext and ciphertext for every possible set of (29!)^m unknown alphabet keys**. This property is independent of whether those secret alphabets are affine, Vigenère, rotor-like or arbitrary permutations.

| Globally continuous word-clock period | Original equal ordered pairs | Eligible ordered pairs | Original Q_m |
| ---: | ---: | ---: | ---: |
| 16 | 15,638 | 456,056 | 0.034289649 |
| 32 | 7,822 | 226,754 | 0.034495533 |
| 43 | 5,790 | 168,164 | 0.034430675 |
| **256** | **876** | **26,170** | **0.033473443** |

These ratios are very close to the uniform 29-class expectation 1/29=0.034482759. Within-phase alphabet changes cannot restore the concentration of conventional source-language first runes.

## Source-native calibration and exact secret-key plants

The independent language controls are pinned locally under resources/control/: Gibran's *The Prophet*, Shakespeare, Emerson's essays, a **corrected source-native Old English Beowulf** model, and the **word-preserving Latin Vulgate New Testament**. English reference words are case-folded and greedily tokenized using GP29 transliterations (TH/NG/EO/OE/AE/IA/EA and the project's V→U, K/Q→C, Z→S and ING→NG conventions). The Old English and Latin references instead use their existing authoritative **GP29 word-native encodings**; we do not re-normalize already encoded words. Importantly, corrected Beowulf encodes rune indices using its explicit **ABCDEFGHIJKLMNOPQRSTUVWXYZabc** alphabet, while the Latin file uses **0123456789ABCDEFGHIJKLMNOPQRS**. These distinct alphabets must be decoded separately, as enforced by the SFT. The Old English reference provides 10,885 original GP words, including six GP singleton words; the Latin reference provides 39,835 words. No unknown ciphertext was consulted to select source words.

For each source, **1,000 seeded samples** independently draw genuine GP-native source words of the exact 2,709 original source word lengths at their exact global ordinals. The selection is fixed by actual original word lengths and the source-native pools of each length, not by original rune letters. Every sample is scored at each of the four frozen clock periods. Xorshift32 seeds are **0x33015600 through 0x33015604**, respectively, for Gibran, Shakespeare, Emerson, corrected Old English and Latin.

| Period | Gibran min / mean | Shakespeare min / mean | Emerson min / mean | Old English min / mean | Latin min / mean | Controls ≤ original |
| ---: | --- | --- | --- | --- | --- | ---: |
| 16 | 0.058089 / 0.061409 | 0.053901 / 0.057098 | 0.060497 / 0.064188 | 0.070228 / 0.075907 | 0.085853 / 0.091848 | 0/5,000 |
| 32 | 0.057551 / 0.061409 | 0.052868 / 0.057147 | 0.060021 / 0.064157 | 0.070799 / 0.075933 | 0.086208 / 0.091977 | 0/5,000 |
| 43 | 0.057408 / 0.061672 | 0.053745 / 0.057168 | 0.060108 / 0.064514 | 0.070265 / 0.076035 | 0.085916 / 0.092092 | 0/5,000 |
| **256** | **0.055025 / 0.061881** | **0.048987 / 0.057359** | **0.056248 / 0.064488** | **0.068170 / 0.076257** | **0.082384 / 0.092274** | **0/5,000** |

The lower-tail plus-one finite-simulation estimate for each *source and period* is at most 1/1,001 ≈ 0.000999, under the explicitly defined independently sampled source-language model. This is an exploratory, language-conditioned null, **not** a universal decryption-significance claim; the candidate period family and source languages are not a hidden-proof preregistration.

**Positive plant:** for the first control sample in each of the five sources, the SFT generates all m independent uniformly shuffled GP29 bijections, encrypts every retained first-rune symbol using its original word ordinal, and decrypts **2,709/2,709 symbols exactly**. The transformed native-source Q_m remains *bitwise identical* to the unencrypted source value for every m, as required by the theorem; an intentionally wrong phase-key mapping does not recover the source. An entire 2,896-word ciphertext cannot be claimed, because this hypothesis specifically concerns its first rune only.

## Decision and prior-art boundary

Earlier [word-start research](word-start-reset-and-periodicity.md) established a static section-word-initial exclusion, a conditional 23-word additive hypothesis, a secret-alphabet **periods 2–60** shuffle screen with **section/page resets**, and a one-rune-word capacity theorem finding that a **period 130** book-word clock is the first period that ceases to force exceptions for the *singleton A/I-only* evidence. Those tests did **not** perform a **continuous global 256-word clock with 2,709 independently sourced, length-matched native GP initials** or quantify full alphabet collision constraints at that period. The current result is an extension at the original table's exact **256** length, rather than a restatement of period-23 arithmetic or singleton feasibility. Passing the period-130 singleton capacity condition is only necessary; it cannot establish a candidate cipher.

**Retire the directly keyed, continuously repeating 16/32/43/256-word GP29 first-rune arbitrary-permutation architecture under ordinary source-native English with preserved printed word lengths.** The rate discrepancy exists independently of every secret alphabet. Do not spend compute seeking 256 character substitutions for this same model. This constraint does **not** reject positionwise keystreams that change each word, non-native or heavily transformed registers, variable-length coding, secret state evolving during the 256-word cycle, page-local resets, or printed word boundaries unrelated to plaintext. None of these alternatives is established by the negative result.

**Exact single-file reproducibility:** [sims/lp2_word_ordinal_256_allsecret_sft.cjs](../sims/lp2_word_ordinal_256_allsecret_sft.cjs). The manual-only [workflow](../.github/workflows/lp2-word-ordinal-256-allsecret-manual.yml) executes it with Node 22 and no external packages. **The final five-author corrected-source SFT passed [GitHub Actions run 43326873705](https://github.com/FlareZ123/liber-primus/actions/runs/43326873705)** (Node 22). An intermediate run [43326531941](https://github.com/FlareZ123/liber-primus/actions/runs/43326531941) caught a fixture-alphabet mismatch before this correction; the initial three-author version independently passed [43324886528](https://github.com/FlareZ123/liber-primus/actions/runs/43324886528).
