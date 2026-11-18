# Familywise audit of the p56/p57 word20 nested-bracket anchor

**18 November 2026, Agent3, Director #1694. Classification: strengthened solved-control structural anchor. No unknown LP2 plaintext, key, or value-changing cipher receiver is recovered.**

## Decision

The title-inclusive p56/p57 word20 observation survives a bounded familywise audit.

The bracket predicate was defined without PILGRIM/EMERGE values or any radix:

> two addressed cells are consecutive; each printed token occurs exactly twice in the 256-cell table; the two duplicate occurrence-pairs have the same midpoint.

The source-choice family was frozen as:

- p56 title included or excluded;
- p57 title included or excluded;
- alignment from the start or from the end;
- GP0, GP1, or GP-prime word number;
- zero-based or one-based table address.

That is **48 models**. Across the complete family, exactly **one** model hits either table bracket:

```text
p56 title included
p57 title included
start alignment
GP0
zero origin
position 20:
PILGRIM = 82
EMERGE  = 83
```

The table has exactly two qualifying adjacent starts, 82 and127. Both are the same nested duplicate object in opposite order:

- 82/83 = `3L 3D`;
- 127/128 = `3D 3L`;
- both duplicate classes have common midpoint **105**.

No GP1, GP-prime, one-based, title-excluded, or end-aligned model hits.

## Family candidate set

Before looking at which candidate cells satisfy the bracket predicate, the complete 48-model family can generate only eight consecutive in-range starts:

`18, 19, 20, 21, 23, 24, 81, 82`.

Only start82 is a bracket start in the original table.

This sharply narrows the selection burden compared with treating all 255 adjacent starts as candidate addresses.

## Matched controls

The reproduction SFT runs 100,000 deterministic controls with seed `0x1694a3f1`.

### Exact-token-multiset table permutation

Each trial permutes the original 256 printed tokens, preserving every token multiplicity exactly, while the solved-word family remains fixed.

At least one of the eight family candidate starts forms the nested-duplicate predicate in **1,631 / 100,000 = 0.01631** of trials.

This is the relevant familywise table-structure control. The observed source family therefore lands on an uncommon table structure even after title, alignment, metric and origin alternatives have been charged.

### Title-fixed solved-body permutation

Each trial preserves the printed p56 title `AN END` and p57 title `PARABLE`, then independently permutes the remaining solved body words while leaving the original table fixed.

At least one of the 48 models hits a bracket in **21,024 / 100,000 = 0.21024** of trials.

Thus the exact word ordering alone is only moderately selective. The strongest evidence comes from the conjunction of the frozen source family with the rare original table structure, rather than from position20 by itself.

## Additional solved-page consequence

The bracket predicate derives midpoint **105** without using any p57 center word. Under the winning GP0 convention, the only p57 word with GP0=105 is **DIUINITY**. The original table's cell105 is the unique printed token `13`.

The p57 instruction itself places DIUINITY before WITHIN, so `DIUINITY=105` landing at the interior center is a coherent extra solved-page consequence of the frozen bracket rule.

This consequence was already visible in prior repository work, so it is an independent feature relative to the bracket definition rather than a chronologically blind discovery. The audit therefore treats it as corroboration, not as an uncharged discovery p-value. In the table-permutation control, no trial among 100,000 produced the exact winning start82 with midpoint105.

## What this fixes

Within the audited family, the nested-bracket anchor selects:

- title inclusion on both solved pages;
- start alignment;
- GP0 rather than GP1 or GP-prime;
- zero-based rather than one-based addressing.

This is useful solved-control evidence for the GP0 navigation architecture. It does not establish a numeric token decoder or authorize free radix/receiver changes. Director #1686 independently found that the current numeric output edges do not generalize as one fixed p50 transducer.

The practical consequence is to preserve **GP0 → zero-based p50 address** and the 82/83/105 bracket geometry as a constrained structural route while requiring a separate source-selected output operation before unknown-page decryption.

## Reproduction

- SFT: [`sims/lp2_p56_p57_bracket_familywise_audit_sft.cjs`](../sims/lp2_p56_p57_bracket_familywise_audit_sft.cjs)
- Windows Node22: [PASS 44424605736](https://github.com/FlareZ123/liber-primus/actions/runs/44424605736)
- Director task: [#1694](https://github.com/FlareZ123/liber-primus/issues/1694)
