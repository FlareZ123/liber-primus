# Solved-control p50 output grammar holdout

**18 November 2026, Agent3, Director #1686. Classification: bounded negative for one fixed numeric p50 output grammar. The canonical GP0 → zero-based p50 address convention is outside this decision and remains a separate hypothesis. No unknown LP2 plaintext, authentic key, or complete cipher inverse is recovered.**

## Decision

The current solved-word graph does not support one reusable numeric p50 output grammar across p56 and p57.

The test froze the shared address operation before scoring:

```text
whole solved word GP0 sum
→ zero-based row-major p50 cell
→ one fixed numeric interpretation
→ one fixed receiver relation
```

Only numeric interpretations already active in the research record were admitted:

1. conventional base60;
2. order-preserving base59 after deleting the unused lowercase `f`.

Only three receiver relations were admitted:

1. the decoded value is the GP0 sum of a word in the same solved section;
2. the decoded value is the GP0 sum of a word in the other solved section;
3. the decoded value is the GP0 sum of the immediate next solved word.

This gives six predeclared training grammars. p57 was used for model selection. p56 was withheld until after the winning p57 grammar was frozen. Repeated solved words with the same GP0 address were deduplicated for the set-membership tests, so repeated THE/TO/PAGE occurrences cannot inflate the score.

## P57 training result

The best training grammar is **same-section/base60**:

- 17 distinct p57 source addresses;
- 16 of the 256 table cells decode under base60 to a value in the p57 GP0 receiver set;
- 3 observed source-address hits:
  - `PARABLE=120 → p50[120]=0g → 42=FIND`;
  - `TUNNELNG=94 → p50[94]=0u → 56=AND`;
  - `CIRCUMFERENCES=131 → p50[131]=20 → 120=PARABLE`.
- exact fixed-table-multiset hypergeometric upper tail: **0.07940915368668736**.

Charging the complete six-grammar family by Bonferroni gives **0.47645492212012414**. Thus the training selection itself is weak.

The other frozen p57 training results are:

| receiver grammar | base60 hits | base59 hits |
| --- | ---: | ---: |
| same-section GP0 | 3 | 2 |
| p57 → p56 GP0 | 3 | 1 |
| immediate next word | 0 | 0 |

The two base59 same-section hits are `SHED→PARABLE` and `WITHIN→CIRCUMFERENCES`. Neither immediate-next grammar predicts any solved p57 successor.

## Frozen p56 holdout

After selecting same-section/base60 on p57, that grammar was applied unchanged to p56:

- 18 distinct p56 source addresses;
- 18 of 256 table cells decode under base60 to a p56 GP0 receiver value;
- 3 observed hits:
  - `TO=19 → p50[19]=0X → 33=AN`;
  - `DUTY=66 → p50[66]=0P → 25=IS`;
  - `THIS=27 → p50[27]=0P → 25=IS`.
- exact fixed-table-multiset hypergeometric upper tail: **0.12194452388557367**.
- immediate-next solved-word predictions: **0**.

This does not provide a predictive solved-control transfer.

## Direction and radix instability

The cross-section receiver relation changes its preferred radix when the direction is reversed:

- p56 → p57: base60 gives 2 hits; base59 gives 3;
- p57 → p56: base60 gives 3 hits; base59 gives 1.

The prominent p56 edge `WITHIN=38 → base59 131=CIRCUMFERENCES` is in the p56→p57 base59 set, while the p57 training winner is base60. A fixed numeric grammar therefore cannot recover that edge without changing the radix after model selection.

Training on p56 does not resolve the radix either: same-section base60 and base59 both give 3 hits.

## Scope

This result rejects the proposition needed by Director #1686: that the existing numeric p50 word edges already instantiate one reusable, fixed output grammar that can be learned on solved text and transferred to untouched solved text.

It does **not** reject:

- the GP0 word-sum → zero-based p50 address convention itself;
- literal printed-token or duplicate-geometry uses of the table;
- an explicitly source-selected state transition that changes output interpretation at a defined point;
- other receiver semantics independently fixed by a source clue before target inspection.

Because the solved-control gate failed, **no unknown LP2 target was opened under this issue**. Extending the graph by choosing a radix, receiver class, page, or output type after seeing an unknown target would violate the holdout contract rather than test it.

## Reproduction

- SFT: [`sims/lp2_p50_solved_output_grammar_holdout_sft.cjs`](../sims/lp2_p50_solved_output_grammar_holdout_sft.cjs)
- Windows Node 22 CI: [PASS 44424095046](https://github.com/FlareZ123/liber-primus/actions/runs/44424095046)
- Director task: [#1686](https://github.com/FlareZ123/liber-primus/issues/1686)
