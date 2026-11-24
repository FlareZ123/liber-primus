# LP2 physical-line-framed enumerative rank: original inverse and capacity gate

**Agent42, 24 November 2026. Classification: intermediate negative.** This is a source-exact test of one line-framed 29-to-28 enumerative architecture, not a recovered Liber Primus plaintext or an established historical mechanism.

## Question and source-visible motivation

The original LP2 typography exposes 594 rune-bearing physical lines over the 55 unknown rune-bearing pages (physical p0–p49 and p51–p55). It is reasonable for a human solver to ask whether those visible lines are block boundaries for a constrained encoder. This test freezes the source's actual slash-delimited printed lines as blocks, rather than reusing the earlier word-framed rank codecs.

The canonical transcription and rune corpus agree exactly: **12,956 GP29 symbols, 594 physical lines, and 2,896 printed word groups**. The line-internal adjacent-repeat schedule is 515 lines with zero repeats, 76 with one, and three with two: **82 internal repeats**. Four additional equalities occur at line starts, all within pages; none occurs at a page boundary. Thus the continuous line stream has the same 86 adjacent-equality events as the established source count.

## Frozen reversible line rank

For line i with length L_i and e_i internal adjacent repeats, define the plaintext space

\[
P_i = 29^{L_i}.
\]

The ciphertext line is ranked in GP29 chart order using one frozen field order:

1. A: the first rune, ranked in the source alphabet (or relative to the preceding ciphertext line's final rune in the continuous-seam mode);
2. B: the colex combinadic rank of the e_i repeated-transition positions among the L_i−1 internal gaps;
3. D: the base-28 rank of each nonrepeating successor, in ascending GP29 ordinal order with the preceding rune omitted.

The exact ciphertext codebook size is

\[
M_i = h_i \binom{L_i-1}{e_i} 28^{L_i-1-e_i},
\]

where h_i is 29 for a free line head, 28 for a nonrepeating line-start transition, and 1 for a repeated line-start transition.

A single mixed-radix quotient carry streams the line ranks:

\[
v_i=s_iP_i+p_i,\qquad r_i=v_i\bmod M_i,\qquad s_{i+1}=\lfloor v_i/M_i\rfloor.
\]

The inverse, evaluated backward from a frozen terminal state, is

\[
v_i=s_{i+1}M_i+r_i,\qquad p_i=v_i\bmod P_i,\qquad s_i=\lfloor v_i/P_i\rfloor.
\]

No language score, fitted phase, free lookup table, or key search chooses the rank order. The per-line repeat counts and line-start equality schedule are read from the observed ciphertext, however, so those schedules are **post-selected constraints**, not independently authenticated encoder instructions.

## Original-input results

Two natural line-start conventions were tested:

| Mode | Line-start choices | Repeats represented | log2(product M / product P) | Minimum private-state bits | Original candidate IoC | Long dictionary hits |
|---|---:|---:|---:|---:|---:|---:|
| Free head at every line (generous reset) | 29 at all 594 lines | 82 internal; four line-start equalities unconstrained | −661.019827 | **662** | 0.034551775 | **0 / 1,132** |
| Continuous seam across lines | 29 at first line; 28 at 589 starts; 1 at four repeated starts | All 86 | −710.270509 | **711** | 0.034577978 | **0 / 1,132** |

For each mode, the original line rank is below its corresponding 29-way plaintext line space on **all 594 lines**. Consequently, the terminal-zero inverse has initial state zero and re-encrypts the original input exactly. That fact does not remove the capacity deficit: it means this particular observed rank vector lies in the low-rank subset reachable with zero carry. The product codebook still covers only a fraction of all unrestricted GP29 line streams.

The candidate outputs are not plausible native plaintext. Under the unchanged original printed word lengths, neither mode yields a dictionary word of five or more GP29 symbols in the 1,132 such positions. Their full-stream coincidence indices are near the uniform 29-symbol baseline. Examples: the free-head p0 output begins `WAYTHDDWYLXSSIARNJEXIAB...`; the continuous-seam p16 output begins `NRWGFSNGJNGMUTWCSXBFIFHT...`. The line-framed decoder does not preserve plaintext spaces, so this word score is a diagnostic rather than a universal linguistic impossibility theorem.

## Capacity and the compositor constraint

For a fixed line-length and repeat schedule, a lossless encoder covering every unrestricted GP29 input stream needs at least

\[
S \ge \left\lceil\frac{\prod_i P_i}{\prod_i M_i}\right\rceil
\]

distinct private states or equivalent independent side information. The exact integer state bound requires **662 bits** even with a free 29-way head on every line, and **711 bits** when line-start transitions are constrained continuously. This is a universal-input bound for these fixed schedules, not a lower bound for a restricted natural-language source or every possible LP2 cipher.

The independent original-JPEG compositor study already accounts for 484/539 within-page line joins using frozen glyph advances, red dropcap gutters, and numbered-line insets. Eleven additional short lines terminate at printed periods. Its deliberately generous binary exceptional-line-only model leaves at most **55 bits** across the 55 non-forced joins. That is far below even the 662-bit free-head requirement (a 607-bit gap). This comparison is conditional on that simple binary residual-line-end carrier; it does not bound every possible use of punctuation, word boundaries, residual margins, page state, or an external source.

The native positive control is important: the same exact rank/unrank and carry implementation encodes a 12,956-rune plant made from the authentic 2,979-rune solved-GP29 donor with a known initial state 3301, then recovers every rune and the original state exactly in both line-start modes. The negative original result is therefore not a failed implementation.

## Decision

Reject this frozen physical-line-framed enumerative architecture as an explanation of the original unknown pages. Do not continue rank-order, line-reset, or terminal-state sweeps. The line schedule is visible, but no first-party clue selects this exact A/B/D serialization or the post-selected per-line repeat quota; the original inverse is nonprose and the universal-input codebook requires substantially more state than the simple residual line-end model can carry.

This does **not** reject the broader 29-to-28 family, the separately tested word-boundary carrier, a source-selected nonuniform language code, a different authentic state machine, or an externally supplied key. Reopen this branch only if independent source evidence selects the per-line repeat schedule and rank operation, or supplies a recoverable state/side channel that predicts an untouched original block.

## Reproduction

Run from the repository root with Node.js 22:

`node sims/lp2_line_framed_enumerative_original_sft.cjs`

The read-only SFT asserts the original 55-page rune arrays, 594 line segmentation, 2,896 word segmentation, all 86 repeat events, both original unrank/forward replays, the 662/711-bit capacity bounds, dictionary scoring, and both source-native planted-key controls. Inputs are the canonical LP2 transcription/corpus, the solved-GP29 donor, and the TextBlob word-frequency control.
