# Base59 terminal-tree node-salted fold: exact known-p56 gate

**Agent45, 17 November 2026. Classification: bounded original-input decipherment attempt; rejected. No unknown LP2 plaintext, authentic key, cipher or destination recovered.** This tests the simplest node-address-dependent improvement to the already-known no-salt source-graph fold, without a fitted 29×29 table or new external key.

## Human-visible proposed route

The intact LP2 p49–51 numeric field has 256 two-character tokens. The original prints every character of the standard base60 alphabet except lowercase `f`; parsing as a 59-digit alphabet (removing only that absent symbol) yields a directed graph on 256 cells, with `parent[i] = printed_numeric_value[i]`. It has one self-root at address **189**, **95 leaves** and **160 nonroot internal nodes**. This structural interpretation is exploratory and was first recorded in [the existing source-graph report](lp2-p50-base59-source-convergent-map.md).

The adjacent original manuscript provides physical p55 **76 opaque runes**, solved p56 **85 runes** with one authentic transparent plaintext **F** that consumes no key position, and clear p57 **95 runes**. Omitting p56's exact F and leaving the graph's one root unassigned gives a literal **76 + 84 + 95 + 1 = 256** partition. Earlier tests assigned the clear p57 symbols to graph leaves and used the *unsalted* sum of children modulo29 to infer internal-node plaintext. It failed against the already-known p56 message. It also found contradictions in an unrestricted unary substitution constant per graph depth.

The original 256 printed values supply a natural *varying* node parameter without a missing arbitrary key. The new frozen candidate is:

```
leaf_value[node] = one exact clear-p57 GP index (or its GP prime residue)
internal_value[node] = (signed printed_value[node] + sum(child_value)) mod 29
```

The parent graph, node salt, and 29-symbol modulus all come from original source artifacts. The **weakest assumption** is the entire graph-to-terminal-plaintext association: Cicada did not print an instruction to interpret the table as a radix59 parent map or to fold plaintext this way. The fixed `+/-` salt signs are both natural algebraic orientations, and one extra root-normalized prediction simply subtracts the computed root label before testing known output.

## Exact original-ciphertext held-out result

Use the 95 unchanged original p57 GP rune indices as leaves. Natural source orders for leaves are increasing cell addresses or depth-first root traversal; their payload direction is forward or reverse; numeric GP labels are literal 0–28 or the corresponding prime residue modulo29. Place the **84 already-solved, actually prime-key-consuming p56 plaintext runes** on the last 84 nonroot internal nodes in printed-address order, DFS preorder, or DFS postorder. The earlier 76 nonroot nodes are reserved for unknown p55, and *never fitted or scored*.

This gives **2 leaf orders × 3 internal orders × 2 rune value rules × 2 p57 directions × 2 salt signs = 48** complete original-table readouts, each with two prespecified presentations (raw or root-subtracted). Every node label is uniquely determined before comparing to p56; no language model, secret alphabet or p55 plaintext is optimized.

| Independent known-p56 check | Exact rune matches out of 84 |
| --- | ---: |
| Best of 48 raw node-salted readers | **7 / 84** |
| Best of 48 root-subtracted readers | **8 / 84** |
| Literal reconstruction required | **84 / 84** |

The already-established p56 plaintext spelling `AN END WITHIN THE DEEP WEB ... EUERY ... SEEC ...` is encoded with the original GP29 rune table. Its sole transparent F is at index56; the native solved-p56 prime-totient encoder reproduces the **entire 85-rune original ciphertext exactly**. This independently fixes the known-plaintext target before the tree is examined.

**Decision:** The physically printed node values are insufficient as the missing graph-fold salts. This rejects all 48 fixed readers and either root normalization, a finite simpler repair to the known no-salt fold. It does not rule out an independently authored address-dependent operation, other original graph interpretations, or unknown external keys. No further tree traversal or arbitrary salt fitting is warranted without a new source instruction.

[Single-file Node22 original-input reproducer](../sims/lp2_p50_base59_node_salt_fold_sft.cjs). Its source semantics were independently executed against the live `lp2-corpus.json` and `base60-grid.json` objects and returned the stated maxima before committing. The program also asserts the 256 graph nodes, the unique root189, the 95/160 partition and byte-for-byte solved-p56 reencryption.
