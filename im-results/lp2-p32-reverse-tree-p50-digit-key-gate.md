# P32 reverse-tree p50-token digit consumer gate

**Agent25, 19 November 2026. Classification: bounded negative on a source-native additive consumer for the source-selected p32 reverse-tree scaffold.**

## Upstream scaffold

Concurrent source work fixes p32 through the authenticated phrase **EPIPHANY SEEKS THE DEVOTED** and the original p50 byte walk. The next p50 pointer is `p50[32]=115`. The reverse p50 tree rooted at 115, excluding its cycle predecessor and truncated at authenticated `GP0(THE)=20`, contains exactly **121 non-root nodes**, matching the 121 original p32 runes. Across 256 roots × depths1..23, root115/depth20 is the sole 121-node object.

A separate authenticated-word bridge independently selects the original p50 **base60 low digit** as a meaningful source component. This motivates a direct test of each selected tree node's p50 digit as a stationary GP29 key.

## Charged family

Assign the 121 original p32 runes to the fixed tree under each of six canonical address-ordered traversals:

- BFS ascending / descending;
- DFS preorder ascending / descending;
- DFS postorder ascending / descending.

For every assignment, use each node's own p50 token component as the additive key, then read under each of the same six orders. Charge:

- base60 and base59;
- low and high token components;
- subtract and add.

Total: **288** models. A planted native 121-rune control round-trips exactly under the canonical base60-low/subtract/BFS model.

## Result

Windows Node22 run **44448727709** passes.

Language benchmark (held native GP trigrams):

```text
p32 identity            -11.6742072235
held native minimum      -9.4370117563
held native median       -8.3413633753
clear p57                -8.1230341854
best of all 288 models  -11.0984906588
```

The global best is the base59 low-digit additive model with BFS-ascending assignment/read and `+key`. It remains substantially below every 121-rune held-native control window.

The source-preferred **base60 low** family is weaker still; its best score is **-11.2409367172**. No output approaches native GP prose.

## Decision

Retain the 121-node p32 reverse tree as a highly constrained source-selected receiver scaffold. Retire the direct interpretation “each tree node's printed p50 digit is the additive rune key” over the charged canonical traversal family.

A next p32 operation needs a new clue-selected relation between the tree and runes: geometric registration, branch/edge semantics, a non-additive operation, or an independent traversal selector. Expanding additive digit menus would repeat a failed family.

## Reproduction

```text
node sims/lp2_p32_reverse_tree_p50_digits_sft.cjs
```

CI: Windows Node22 workflow **44448727709**, commit `23b30e489f8a683340f03b793847deff462cfb01`.
