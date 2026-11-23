# LP2 p50 two-word boundary rotation: complete original-input resegmentation gate

**23 November 2026, Agent23; [Director Issue #2278](https://github.com/FlareZ123/liber-primus/issues/2278). Classification: bounded original-cipher negative.** A mathematically lossless, genuinely variable-word-length LP2 decoding operation driven by all 256 original p50 bytes was executed on the intact manuscript. It improves one natural-language word-length statistic superficially, but the improvement is ordinary under wrong-table controls and creates far too many one-rune words. **No unknown plaintext, authenticated LP2 operator or key, or final destination was recovered.** This rule is now retired, leaving independently selected variable-length or changing-state mechanisms open.

## Why consider this specific move?

The signed 2016 Cicada instruction describes the manuscript's *words* as a map and its *numbers* as direction. Original pp49–51 print a 32×8 table of **256 two-character sexagesimal bytes**, a plausible user-visible direction source. The source 2,896 complete printed words, including 32 true cross-page words, show unusually weak ordered word-length grammar. Instead of another fixed-symbol GP30 substitution or the previously rejected 2014 Stage5 seven-slot punctuation transposition, test the minimal local **two-word boundary shift**: a byte determines how much of each *adjacent pair's unchanged rune content* belongs to its first versus second word.

This is a **hypothetical reading** of the signed clue. The author did not explicitly prescribe word pairs, cyclic rotations or indexing the table by word-pair ordinal. The purpose of this bounded gate is to ask whether that concrete low-description-length operation opens a syntactically meaningful key route, before searching secret rune transformations.

## Exact lossless inverse and source

Take each neighboring pair of complete printed rune-words, in global printed order, with lengths \((a,b)\), sum \(S=a+b\ge2\), and the corresponding p50 table byte \(k=B_{\lfloor i/2\rfloor\bmod256}\), row-major. For both independent whole-source reading directions \(d\in\{-1,+1\}\), set

\[
a'=1+((a-1+d\,k)\bmod(S-1)),\qquad b'=S-a'.
\]

Every positive original word pair becomes **two positive decoded words**. The inverse uses the same table byte and direction \(-d\); no ciphertext rune is added, deleted or changed. Odd trailing words, if any, remain unchanged. Separators keep their literal original hyphen or full-stop identities and ordinal order, and their changed rune offsets are exactly recoverable; printed line and physical page wraps are separate immutable metadata. Original physical p50 is rune-free. The original input is [the canonical 12,956-rune / 2,896-word LP2 transcript](../resources/liber-primus/lp2-transcription.txt), [29-symbol corpus](../resources/liber-primus/lp2-corpus.json) and [literal p50 byte table](../resources/liber-primus/base60-grid.json). The source's six Arabic-number list-heading dashes are not falsely counted as word marks.

The original **12,956 rune identities and all 2,896 printed separator identities** round-trip exactly in both directions, with no empty decoded words. Genuine original development p16–21 (1,613 available runes) and heldout p40–53 (3,008) are assessed as contiguous original regions using all complete decoded words contained inside them. Boundary-carrying words at those regions' endpoints are excluded only from local scores, never from the full ciphertext inverse.

## Actual original output

Native-GP length grammar is an independent **12×12 bigram log-likelihood ratio**, trained exclusively on the first 8,500 words of source-normalized Gibran and 40,000 Shakespeare words. The 2,896-word Gibran and Shakespeare heldout reference windows score **+0.016562** and **+0.013678**. The genuine LP2 printed length order scores **−0.018645**. The two fixed source-table outputs are:

| Original p50 pair-boundary receiver | Full 2,896-word native grammar score | One-rune words | Two-rune words | Short-word adjacency ratio | p16–21 complete-word score | p40–53 complete-word score |
|---|---:|---:|---:|---:|---:|---:|
| Unchanged printed word lengths | −0.018645 | 83 | 448 | 0.9673 | not rescored | not rescored |
| Byte \(+k\bmod(S-1)\) | **+0.004148** | **460** | 460 | 0.6268 | see Windows output | **+0.018388** |
| Byte \(−k\bmod(S-1)\) | **+0.006806** | **410** | 474 | 0.6567 | **+0.014785** | **+0.009936** |

The output can superficially appear closer to ordered source-English word-length grammar on both original regions. However, this is a **generic effect of redividing pairs**, rather than evidence for the specific printed p50 table. On 2,896-word windows from the independently pinned native-GP Gibran corpus, the number of one-rune words is **66–126**; from Shakespeare it is **129–207**. Both candidate outputs produce **410 or 460**, well beyond either source's observed range. Rune values remain as encrypted as before: every output still contains the original near-uniform GP29 rune histogram, so an independent genuine cipher/key would still be needed.

A source-table-preserving **wrong-key test** permutes the table's 32 intact eight-cell rows using 1,000 independent deterministic Fisher–Yates draws while preserving all 256 printed byte values, row geometry and original LP2 positions. It applies the exact same pair-split decoder, independently for each sign, and scores the untouched original content:

| Sign | True p50 grammar score | Wrong-table mean | Wrong tables at least as good | Add-one tail |
|---|---:|---:|---:|---:|
| \(+k\) | +0.004148 | +0.003018 | **404 / 1,000** | **0.4046** |
| \(−k\) | +0.006806 | +0.004576 | **316 / 1,000** | **0.3167** |

The table's physically printed row ordering is **not recoverable** from the observed grammar gain; many wrong table orders are at least as persuasive. Neither sign is a proposed unknown-page decoder.

## Actual creator-authentic positive and decision

The same code reads the actual unencrypted solved p57 **PARABLE** (95 original GP runes, 20 real printed words) as a **typed source-native positive**, encrypts its word boundaries under the specified p50 pairwise rotation, and recovers **every original rune and word boundary** under the exact inverse. That control proves the algorithm can faithfully transport real GP text, without alleging that Cicada used this mechanism on unknown pages. Full-book original replay and the 1,000 wrong-table controls were independently executed on **Windows latest / Node.js 22**.

**Decision:** this **specific** source-table byte modulo two-word-sum boundary rotation provides a complete, viable form of variable-length coding, but its original output supplies no correct source-table key selection, no native plaintext and no evidence that the physical p50 numerals drive LP2 spaces. Do not continue fitting signs, table row phases or new numeral residues on this same receiver. A meaningful successor requires an independently source-visible opcode changing either the space count, the rune values or both, coupled to an independently checkable original plaintext prediction.

[Full self-contained Windows-compatible CommonJS SFT](../sims/lp2_p50_two_word_boundary_rotation_original_sft.cjs) · [PASS GitHub Actions run 45094723284](https://github.com/FlareZ123/liber-primus/actions/runs/45094723284) · [manual-only workflow](../.github/workflows/agent23-p50-wordpair-boundary-manual.yml).
