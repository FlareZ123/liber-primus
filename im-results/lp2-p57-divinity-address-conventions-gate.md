# p57 DIVINITY p50 address-convention gate

**18 November 2026, Agent8 Director #1540; reconciled under Director #1565. Classification: row-major zero-based addressing is uniquely selected by decimality inside the frozen source-natural 32×8 convention family; token order remains source-ambiguous because p57 action chronology and p50 graphical order point in opposite directions. No plaintext or downstream key recovered.**

## Frozen family

Keep the #1497 p57 operation fixed for all 20 complete words:

1. shed the first and last rune;
2. GP-prime-sum the strict interior and shed endpoints separately;
3. treat those two sums as p50 addresses under one of the source-natural 32x8 table conventions below, only where the address is valid;
4. concatenate the two literal printed cell tokens in either inner→outer or outer→inner order.

The only address conventions tested are zero-based and one-based row-major, plus zero-based and one-based column-major. No wrapping, phase shift, reflection, rotation, radix conversion or target-selected reinterpretation is allowed.

## Complete convention census

| address convention | token order | valid p57 words | all-decimal outputs | DIUINITY output |
| --- | --- | ---: | ---: | --- |
| row-major, zero-based | inner→outer | 18 | **1** | **2800** |
| row-major, zero-based | outer→inner | 18 | **1** | **0028** |
| row-major, one-based | inner→outer | 13 | 0 | 1L0X |
| row-major, one-based | outer→inner | 13 | 0 | 0X1L |
| column-major, zero-based | inner→outer | 18 | 0 | 1t26 |
| column-major, zero-based | outer→inner | 18 | 0 | 261t |
| column-major, one-based | inner→outer | 13 | 0 | 3C0a |
| column-major, one-based | outer→inner | 13 | 0 | 0a3C |

For zero-based row-major, DIUINITY's fixed sums are inner184 and outer192. Those are exactly table cells `28` and `00`. Under both token orders, DIUINITY remains the **only** p57 word yielding any four-decimal-character result. Every other address convention yields zero decimal outputs across all valid p57 words.

## What is selected

The census cleanly separates two questions.

**Address grammar.** Decimality alone selects **zero-based row-major** out of the four source-natural address grammars. One-based row-major and both column-major conventions produce no all-decimal p57 output at all. This materially strengthens #1497's use of the printed table as a zero-based row-major address space.

**Readout direction.** Decimality alone does not distinguish the two row-major-zero token orders: inner→outer gives `2800`, while outer→inner gives `0028`. Director #1565 identifies conflicting target-blind order rules. P57 action chronology sheds circumference before finding the interior, favoring outer→inner if action order controls serialization. P50 geometry places address184 directly above192 in the first column, favoring inner→outer under ordinary table reading. No authenticated convention in #1529 chooses between those principles.

This means the bridge no longer depends on an arbitrary choice among row-major versus column-major or zero-based versus one-based indexing. **The final token order remains unresolved source-only and is still selected by the historical `2800` match if that bridge is accepted.**

## Decision

Director #1540 remains a **positive discrimination result** for the address convention and a **conditional result** for readout order:

- zero-based row-major is uniquely selected inside the frozen eight-convention family by the existence of any all-decimal DIUINITY readout;
- exact `2800` occurs only for zero-based row-major with inner→outer concatenation;
- #1565 does not independently select that order because p57 chronology favors the reverse while p50 geometry favors inner→outer.

The surviving limitations are the source-unselected p50 receiver/addressing act established by #1568, participant-session provenance, and the final inner/outer serialization. No further address-convention expansion is justified.

Reproducer: [`sims/lp2_p57_divinity_address_conventions_sft.cjs`](../sims/lp2_p57_divinity_address_conventions_sft.cjs)

Windows Node22 CI: [run 44392347982](https://github.com/FlareZ123/liber-primus/actions/runs/44392347982)
