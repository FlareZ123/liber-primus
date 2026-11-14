# Source-led RC4 KSA permutation does not restore original LP2 word order

**Agent 3, 14 November 2026. Classification: one bounded original-input cryptanalytic decision.** No unknown LP2 plaintext, authentic key, decipherment or deep-web address recovered. This tests a specific historically plausible **whole-word transposition**, separate from the prior eight-column and sorted-byte-rank routes.

## Why a 2014 solver might try it

The original LP2 physical pp49–51 print **256** base60 two-character numeric cells. Original pp0–55 have **2,896 complete printed GP words** containing 12,956 runes, with 32 words continued across original page breaks. The relation

\[
2,896=11\times256+80
\]

supplies eleven complete 256-word blocks. The signed 2016 text describes the manuscript's **words** as a map and **numbers** as its direction. The actual 2012–2014 Cicada workflow used OutGuess; its published implementation uses an **ARC4/RC4 state generator** (see [historical ARC4 implementation](https://sources.debian.org/src/outguess/1%3A0.2-8/arc.c)). RC4's standard key-scheduling algorithm takes arbitrary key bytes and yields a true **permutation of 0–255**. Thus the printed 256 bytes provide an exact permutation even though the grid itself is **not** a 256-entry S-box: it has 161 distinct bytes.

The severe assumption is that the author intended to apply this cryptographic algorithm to *whole-word order*. The original book does not state this operation, its block clock, or an 80-word tail rule. A full source-fixed test is cheap enough to decide without an open-ended key search.

## Frozen direct inverse

1. Read the original 256 printed source bytes in row-major order as the complete 256-byte RC4 KSA key. Initialize \(S[i]=i\). For each \(i=0,\dots,255\), set \(j=(j+S[i]+B[i])\bmod256\) and exchange \(S[i]\) and \(S[j]\). The first ten resulting permutation values are **82, 2, 3, 65, 182, 37, 111, 49, 22, 154**.
2. Parse the exact 2,896 whole printed rune-words, ignoring line and page wraps while preserving all genuine punctuation and word boundaries. Divide the first 2,816 words into eleven blocks of 256, retaining the final 80 in printed order.
3. Apply both exact inverse interpretations: \(W'_i=W_{S[i]}\) or \(W'_{S[i]}=W_i\) within every complete block. Preserve each word's letters and its word length. Both maps are perfectly invertible.
4. Measure the published nine-class adjacent GP-word-length Pearson chi-square, with bins **lengths 1–8 and 9+**. Ordinary GP-transcribed English has a stronger ordered-adjacency signal. Contrast the best of printed/forward/inverse against 2,000 reproducible shuffles of the manuscript's **exact original word-length inventory**, granting each shuffle the same three-way selection.

No table-byte fitting, guessed phase, unknown alphabet, private source or fitted word boundary enters this test.

## Executed result on unchanged original ciphertext

| Word sequence | Adjacent-length \(\chi^2\) |
| --- | ---: |
| Printed LP2 | **68.27318638** |
| Original-table RC4 KSA forward reading | **70.16993174** |
| Original-table RC4 KSA inverse reading | **64.16596005** |

The exact-inventory three-way shuffle null has **2,000** samples (xorshift32 seed **0x3301c3a7**). Its selected-score mean is **73.70375124** (SD **9.56184248**). **1,237/2,000** null selections equal or exceed the original maximum **70.16993174**, yielding the corrected upper tail **1,238/2,001 = 0.61869065**. Therefore the candidate KSA readout has an unremarkable word-length order under the manuscript's own marginal inventory.

### Independent native-English controls

Use three nonoverlapping word-position windows of an independently held Shakespeare text, normalize to real GP symbols, encrypt the *whole-word order* under the same fixed original-table RC4 permutation, and decode through the corresponding inverse. Every word is restored exactly on all three full-length plants.

| Shakespeare window word offset | Native ordered \(\chi^2\) | Scrambled forward | Scrambled inverse |
| ---: | ---: | ---: | ---: |
| 1,000 | **163.89099124** | 61.58142166 | 59.09664393 |
| 12,000 | **143.35686692** | 66.78575654 | 71.83453893 |
| 24,000 | **185.58404967** | 72.37317867 | 47.37562504 |

A true isolated KSA word-order transposition of natural GP-English restores a large order signal in these controls. The original LP2 remains at the shuffled-inventory baseline under either possible source-fixed inverse.

## Decision

**Retire the exact original 256-byte RC4-KSA permutation applied independently to the eleven complete 256-word blocks, with the final 80 source words unchanged, as a direct restoration of ordinary GP-English word order.** This is a finite English-register comparison with a reproducible planted inverse, rather than a universal theorem for all prose genres or multi-stage encipherments.

The KSA source is historically plausible, but no author-authenticated clue selects it as a whole-word permutation. A later hypothesis could change the 80-word tail or add a cipher layer; such changes require an **independent source selector** and independently checkable plaintext rather than tuning the weak word-grammar score. The original numbers retain all previously documented mathematical properties and remain available for differently motivated inverses.

**Exact source reproducibility:** [single-file Windows-compatible CommonJS SFT](../sims/lp2_p50_rc4ksa_256word_source_sft.cjs), reading unchanged [canonical LP2 GP corpus](../resources/liber-primus/lp2-corpus.json), [runic transcript](../resources/liber-primus/lp2-transcription.txt), [original numerical table](../resources/liber-primus/base60-grid.json) and independent [Shakespeare control](../resources/control/shakespeare_first300k.txt). The in-tool JavaScript computation reproduced all original, permutation-null and positive-plant numbers above. The complete standalone SFT, including the exact source-byte hash, original scoring, matched shuffles, native GP plant inversion and Node.js syntax check, subsequently **passed on Windows/Node.js 22** in [manual CI run 43649840903](https://github.com/FlareZ123/liber-primus/actions/runs/43649840903).
