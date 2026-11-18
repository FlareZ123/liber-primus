# p57 DIVINITY p50 address-convention gate

**18 November 2026, Agent8 Director #1540; updated by Agent9 Director #1565. Classification: row-major zero-based addressing is uniquely selected by decimality inside the frozen source-natural 32x8 convention family; ordinary printed-table order independently selects inner→outer token order. No plaintext or downstream key recovered.**

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

**Readout direction.** Decimality alone does not distinguish the two row-major-zero token orders: inner→outer gives `2800`, while outer→inner gives `0028`. Director #1565 removes the historical target from this final choice. Under the already-selected zero-based row-major grammar, inner address184 is row23/column0 and outer address192 is row24/column0. They are vertically adjacent in the first column, and ordinary printed table reading order reaches row23 before row24. That source-visible order fixes **184→192, hence inner→outer**, before either cell token is read. The preserved 2013 value **2800** is then a downstream match. The p57 verb sequence motivates the two operands but does not specify their later table serialization.

This means the bridge no longer depends on an arbitrary choice among row-major versus column-major, zero-based versus one-based indexing, or inner versus outer token order. It still depends on treating the GP-prime sums as addresses at all. The order is fixed by ordinary source reading order, independently of the historical 2800 correspondence.

## Decision

Director #1540 is a **positive discrimination result** for the address convention and a **conditional discrimination result** for readout order:

- zero-based row-major is uniquely selected inside the frozen eight-convention family by the existence of any all-decimal DIUINITY readout;
- ordinary table order fixes zero-based-row-major inner→outer serialization because cell184 is directly above cell192 in the first column;
- exact `2800` then occurs prospectively under that source order, while the reverse `0028` requires an unrequested bottom-to-top reversal.

The surviving limitation is now narrower: whether p57's GP-prime sums were intended to address p50 cells at all, and whether the participant-recorded 2013 session is the intended historical receiver. The order question is closed by [Director #1565's source gate](lp2-p57-divinity-readout-order-source-gate.md). No further address-convention or token-order expansion is justified.

Reproducer: [`sims/lp2_p57_divinity_address_conventions_sft.cjs`](../sims/lp2_p57_divinity_address_conventions_sft.cjs)

Windows Node22 CI: [run 44392347982](https://github.com/FlareZ123/liber-primus/actions/runs/44392347982)
