# Printed-line and punctuation restarts: original-cipher constraint

**Agent46, 18 November 2026.** A source-exact, scoped rejection of an independently uniform GP29 output rune at each *physical printed line or punctuation transition* on the still-unsolved LP2 manuscript. **No plaintext, key, or authenticated author-intended opcode is recovered.**

## Original input and the human-solve premise

Original LP2 pages p0–p55 contain 12,956 printed GP29 rune positions on 55 rune-bearing physical pages; p50 is numeric only. The canonical `resources/liber-primus/lp2-transcription.txt` has page delimiters (`%`) and printed line wraps (`/`). Its exact rune tape was reconstructed rune-for-rune and asserted identical to `resources/liber-primus/lp2-corpus.json`, including all page transitions. The same source includes 594 printed rune lines, 539 genuine *within-physical-page* line starts, and 54 interpage starts. There are 86 adjacent equalities on the complete source tape.

A visually plausible way to make the puzzle segmented is to restart a cipher's output state at each printed line, sentence or chapter punctuation. A **strong, falsifiable version** of this conjecture says each restart emits a fresh *independent uniformly sampled* GP29 rune without conditioning on the preceding printed rune. If true, the first printed rune after each within-page line break independently matches its predecessor with probability `1/29`, irrespective of any additional suppression inside lines.

## Source-exact original result

| Original transition class | Eligible rune transitions | Adjacent equals | Independent-uniform restart expectation |
| --- | ---: | ---: | ---: |
| Printed line start, within physical page | **539** | **4** | **18.5862** |
| Printed punctuation event, distinct actual rune offsets | **172** | **1** | **5.9310** |
| All original adjacent GP29 transitions | 12,955 | 86 | 446.72 under independent uniform input |

For line starts, `P(Binomial(539,1/29)≤4)=0.00004301013818`. The four source events occur twice on p34, once on p43 and once on p46. For punctuation, `P(Binomial(172,1/29)≤1)=0.01708432075`. Punctuation offsets deduplicate coincident large marks and remove the four p15 numeric-row editorial full stops listed in the original image audit; the source-physical inventory is in `resources/liber-primus/lp2-punctuation-identity.json`. These tests are prespecified as **conditional consequences of the concrete reset hypothesis**, not retrospective claims of a newly discovered statistical anomaly.

**Crucial rival comparison:** The manuscript's rare repeat sites are already suppressed *everywhere*. Keep each physical page's exact source rune count and exact existing number of adjacent equalities, uniformly redistribute the equality sites among eligible within-page transitions, and count hits at the real line starts. The independent page-stratified hypergeometric convolution expects **3.57937** line-start hits; the actual four give `P(X≤4)=0.71245855`. Therefore **there is no additional special anti-repeat mechanism at line starts**, nor evidence of a line-specific event affecting the repeat statistics. The line-start count is entirely ordinary once existing page-specific repeat scarcity is retained.

## Decision and precise limitation

**Retire the independent output-uniform GP29 rune restart at each printed line**, and, more weakly, the same independent-output restart at each distinct punctuation event. The expected doublets are missing at both kinds of visible cut, consistent with a history-aware output constraint persisting across them. This does **not** exclude key-clock resets, IV changes, hidden word or mark directions, F-transparent bypass, fresh key symbols combined with an anti-repeat filter that carries across lines, a source-selected nonuniform first-rune law, or a cipher dependent on the previous plaintext/ciphertext. It also says nothing about the existence or location of an external key. Do not extrapolate this narrow result into a general proof of a continuous cipher state.

## Reproduction and control

[Source-exact, standalone CommonJS SFT](../sims/lp2_printed_line_restart_original_gate_sft.cjs) checks rune-for-rune tape alignment, the 539 line cuts, all 86 authentic doublets, p34/p43/p46 event positions, punctuation audit exclusion, exact binomial recurrence, and per-page hypergeometric convolution; it includes a typical-result positive calibration for 19 independent-uniform matches, which is correctly not rejected.

[Windows Node.js 22 passing original-source execution](https://github.com/FlareZ123/liber-primus/actions/runs/44260794891) printed all exact source counts and probabilities. The only hypothesis being rejected has an independent first-output-uniform restart distribution specified *before* looking at the original line-start equality counts. This is a bounded original-source mechanism decision and belongs in intermediate research; it is **not an LP2 decipherment**.
