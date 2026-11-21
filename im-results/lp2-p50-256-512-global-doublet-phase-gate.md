# Original LP2 equality-site phase recurrence on the p50 table dimensions

**Status:** Original-source structural observation, **global-clock hypothesis downgraded after hotspot conditioning**. Tested 21 November 2026; no authenticated key, reversible original-page decoder, or unknown plaintext.

## The question and rival

The originally printed numeric p50 field contains **32 rows by eight columns**, with **256 two-character base60 tokens**. The source therefore makes periods **256 (cells)** and **512 (printed token characters)** unusually natural choices for a whole-book clock. An encoder with a table-driven exception state might produce repeated-cipher-rune events at recurring clock phases.

The principal rival is a noncryptographic concentration of 86 rare equality events in only 12,956 runes, compounded by ordinary printed-line and source-word structure. The repository has **already established** a phase-zero leading-0 class with **33/86** events inside 60/256 table cells. The present result must be judged **conditional on that earlier evidence**. It is exploratory and cannot be assigned a discovery-wide p-value as though 256 were tested in isolation from other prior LP2 research.

## Exact original input and fixed experiment

- Original rune stream: `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`; physical p0–p55, numeric p50 omitted from the rune clock, yielding **55 rune-bearing pages**, **12,956** GP29 ciphertext runes, **2,896** printed words, and **12,901** within-page predecessor comparisons.
- Original table: `resources/liber-primus/base60-grid.json`; printed physical row-major order, 256 tokens, 512 characters, bytes unchanged. A token at the **first rune of an adjacent pair** has index `(globalCurrentOffset-1) % 256`. This reproduces the existing 33/86 first-character-leading-0 association; indexing the second rune instead gives only 15/86.
- Event: consecutive within-page GP29 glyph indices are identical, giving **86** true events at global current-rune offsets. Exclude all physical-page transitions, while advancing the global clock by every preceding rune.
- Main statistic `S_P`: count unordered **pairs of events** sharing a global index modulo `P`. Two source-licensed periods `P=256,512`. Fixed cross-half diagnostic divides the book at rune 6,478.
- Comparators draw the **same 86 event counts** without replacement at eligible locations within exact page, 1,000-rune block, physical page-and-line, page+line+preceding glyph, and original event-bearing word/page groups. The strongest word control preserves the count of original literal-leading-zero events **inside every event-bearing word/page**, so its ability to produce the already-established 33/86 enrichment cannot create an independent positive. The original has 85 such word/page groups; one contains two equality events.

All tests, the source cell192 post-inspection exclusion, and the table-byte-based source-shaped event plant are executable in **[the standalone CommonJS reproducer](../sims/lp2_p50_256_512_doublet_phase_sft.cjs)**, checked against original source counts. **[Windows Node22 CI passed, run 44960294158](https://github.com/FlareZ123/liber-primus/actions/runs/44960294158).** Each null was evaluated with its own deterministic seed and **50,000 trials**.

## Original event-phase result

| Clock / source rule | Same-phase event pairs | Distinct occupied phases | Cross-half event pairs |
|---|---:|---:|---:|
| Continuous global modulo256 | **27** | 66 / 256 | **14** |
| Continuous global modulo512 | **16** | 72 / 512 | **9** |
| Original modulo256 with clock reset at each page | 17 | — | — |
| Original modulo256 with clock reset at nine visual chapter starts | 12 | — | — |
| Original modulo512 with clock reset at each page | 17 | — | — |
| Original modulo512 with clock reset at nine visual chapter starts | 4 | — | — |

The last four reset comparisons were separately computed on the same canonical input with 80,000 exact-page-count shuffles. For chapter-local phase the nine original ranges were p0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53 and 54–55. The corresponding upper tails were, respectively, **0.278, 0.742, 0.196 and 0.915**. The global count is where this specific recurrence is present.

Local-period diagnostics are descriptive: in the 245–267 interval, the original P256 has 27 pairs versus a maximum of 20 for all other periods; in the 500–524 interval P512 has 16 pairs versus a maximum of 12 for the other periods. Period512 is the harmonic of period256 and shares evidence with it; the two tests are **strongly dependent**.

### Calibrated conditionals from the Windows source run

| Exact event-placement conditioning | Mean S256 | P(S256≥27) | Mean S512 | P(S512≥16) | P(either source-period threshold) |
|---|---:|---:|---:|---:|---:|
| Fixed physical-page event totals | 13.9685 | 0.00278 | 6.7924 | 0.00256 | 0.00478 |
| Fixed physical-page and printed-line totals | 16.0612 | 0.01084 | 7.8001 | 0.00780 | 0.01598 |
| Fixed page, line and preceding-rune identity | 18.8236 | 0.03270 | 10.0360 | 0.03300 | **0.05220** |
| Fixed 1,000-rune block event totals | 13.9959 | 0.00222 | 6.8547 | 0.00250 | 0.00410 |
| Fixed exact event-bearing word/page identities | 15.4419 | 0.00362 | 8.4476 | 0.00928 | 0.01132 |
| Fixed exact word/page and within-word leading-0 event counts | **18.2716** | **0.01966** | **10.2375** | **0.03362** | **0.04244** |

Empirical p-values use `(tailHits+1)/(50000+1)`. They describe the explicitly selected conditional nulls; they are **not calibrated across all possible periods, event features, cipher hypotheses or historical tests**. The printed-line+prior-rune null puts the **two-period familywise tail above 0.05**. The final word-and-leading-zero fixed null is much tighter on a different known mechanism, and reaches 0.04244, a suggestive residual requiring genuinely new source guidance.

### Where recurrence arises

The strongest printed predecessor-token phases include literal **`00` at table cell192** (4 events, 6 collision pairs), `45` at cell140 (3 events, 3 pairs), `06` at cell210 (3 events, 3 pairs), `0c` at cell188 (3 events, 3 pairs), and `3r` at cell138 (3 events, 3 pairs). Summing over all 256 phases, **16 of the 27** collision pairs occur inside the original leading-zero class and **11** outside it.

The four events at predecessor table cell192 encode **four different repeated GP glyph values** in different pages: `Y`, `O`, `U`, `A`. The repeated phase therefore does **not** itself provide a single repeated literal output rune. A direct event receiver `C_event − B_phase modulo29` was tested earlier as `sims/lp2_p50_doublet86_direct_byte_value_sft.cjs` without authentic plaintext.

The separately planted event-channel control restricts events to 62 table cells whose byte value is below64, retaining the original per-page event totals. It produces **55 pairs at period256** and **31 at period512**, showing that a fixed table-phase event selector can in fact be detected by this statistic. This is an event-location positive control, rather than a working original-cipher encrypter.

## Decisive post-inspection hotspot challenge

The local phase recurrence is fragile to one already-source-visible concentration. Under the **correct predecessor token** index `(globalCurrentOffset-1)%256`, cell **192 is printed `00`**. Four equality events share that cell (on separate original pages), accounting for **6 of the 27 same-phase pairs** at period256. Their repeated ciphertext rune values are all different: `Y`, `O`, `U`, `A`. **This `YOUA` sequence was already known** in the earlier [source-byte-sorted doublet receiver](../sims/lp2_p50_doublet86_sortedpad_p55_original_sft.cjs), where two printed `00` cells produce the five-symbol prefix `YOUAX`. That earlier exact original p55 additive-key experiment produced three mathematically legal F-transparent decryptions, all nonlinguistic. We therefore do not promote `YOUA` as newly recovered plaintext or as an independently successful decoder. The source-position spike alone does not map to a literal GP29 output symbol or recover a cipher exception.

A stricter **post-inspection** diagnostic removes those four sites from the scored events and holds their original event counts fixed inside each exact event-bearing word/page group. It also fixes the separate count of events within each word/page at the already-established 60-cell leading-zero class. Thus it cannot manufacture additional evidence by redistributing the four cell192 events or changing the known #1500 source-mask association.

| Conditional statistic | Original remaining 82 events | Null mean, 50,000 | One-sided empirical tail |
|---|---:|---:|---:|
| P256 same-phase event pairs | **21** | 14.60636 | 0.047499 |
| P512 same-phase event pairs | **13** | 8.58736 | 0.068219 |
| Either table-derived period exceeds original | — | — | **0.089458** |

The executable fixed-seed source test `hotspotExcludedNull(0x33015053,50000)` passed **[Windows CI run 44960294158](https://github.com/FlareZ123/liber-primus/actions/runs/44960294158)**. A separate 100,000-trial direct computation gave nearly the same familywise result (0.089019). Because the source `00` hotspot was singled out **after seeing the observed event histogram**, these are sensitivity diagnostics rather than fresh independent p-values. Their relevance is the change in inference: a single four-event source cell accounts for much of the full-clock excess, and the evidence no longer justifies elevating a manuscript-wide 256/512 exception-state clock.

The two-period test is necessarily dependent since 512 is twice256. Wider historic search and numerous prior LP2 period investigations prevent assigning any of the above tails a discovery-wide significance.

## Boundary on inference and next decision

An independently executed page-count-conditioned full-difference negative control shuffled **all 12,901 exact original GP29 predecessor differences**, retaining physical-page difference counts, 2,500 times. For original nonzero deltas, same-phase pair collisions were **11,328 at P256** versus null mean **11,241.9** (upper-tail ≈0.204), and **5,558 at P512** versus null mean **5,506.7** (upper-tail ≈0.241). This is a low-resolution exploratory negative, but it indicates the observed recurrence is **concentrated on equality events**, with no corresponding demonstrated full-alphabet periodic delta signature. The already-tested full-page additive p50 pad and fixed special-rune carrier models remain negative.

**Decision: downgrade the global p50-sized event-clock hypothesis.** The source table's literal-leading-zero enrichment remains established by prior conditional analyses. The new 256/512 same-phase recurrence is mostly tied to a four-event spike at the original literal `00` cell; after conditioning that cell and the known word/leading-zero geometry, its two-period familywise upper tail is approximately **0.089**. This is weak evidence for a transferable book-wide clock and supplies no authenticated opcode, GP29 key, exception payload or plaintext. Do **not** commission a global 256/512 KDF or phase sweep on this result. A genuinely useful successor must identify an independent first-party rule for consuming actual p50 token values, predict held-out source events without postselection, and deliver a reversible decoder capable of recovering the full unknown ciphertext, including the 53 equality sites outside the established leading-zero class.

## Relation to existing research

- [Director #1500](https://github.com/FlareZ123/liber-primus/issues/1500) and its reproducer `sims/lp2_p50_digit0_source_preserving_null_sft.cjs` establish the 33/86 leading-zero association and original table clock conventions.
- [Director #1508](https://github.com/FlareZ123/liber-primus/issues/1508) and `sims/lp2_p50_digit0_feature_loco_sft.cjs` show the 60 lowest raw values are identical to leading-zero tokens, with leave-one-chapter-out transfer; the exact `00` feature is not comparably transferable.
- [Director #2083](https://github.com/FlareZ123/liber-primus/issues/2083) seeks an actual reversible anti-repeat mechanism; this page provides a bounded input to that work without competing for its active ownership.
- External Dukotah Round44 reports original doublet-gap clustering as a separate exploratory clue. This result controls for fixed block/page event totals and does not assume a generating mechanism from that external report.
