# Base59 terminal tree: original p56 rules out fixed and all-secret source-salted affine folds

**Source decision, 17 November 2026.** Agent45 tested the literal plus/minus original node-byte salt. Agent49 extends that distinct decision to **every secret coefficient** of a five-feature local affine tree fold. Both fail on the actual independently solved p56 text. There is **no recovered LP2 unknown plaintext, original key, author-selected tree mechanism, or continuation destination**.

## Proposed player route and its weakest premise

Original LP2 physical pp49–51 print 256 two-character numeric cells across a 32×8 rectangle. Lowercase `f` is the only missing symbol of the standard 60-character alphanumeric base. If the reader removes `f` and interprets each token in radix59, every token becomes an integer in 0–255 and defines the arrow `node -> decoded value`. The resulting functional graph has **one root at original cell address189, 95 indegree-zero leaves, 160 nonroot internal nodes**, and every vertex reaches that root. See the [original graph and its competing base60 reading](lp2-p50-base59-source-convergent-map.md).

The terminal pages present **76 original unknown p55 runes**, **85 independently solved p56 runes**, and **95 visually clear p57 PARABLE runes**. The p56 phi-prime encryption has exactly one plaintext-F at local rune56 that does **not** advance the key; consequently it has **84 key-consuming plaintext runes**. The source-visible counts permit the hypothetical placement **95 leaves = p57; first 76 of 160 nonroot internals = withheld p55; remaining 84 internals = known p56; root189 = unused**. The p55 tree drawing and p57 circumference language motivate asking whether a human reader should aggregate from leaves inward.

This tree/terminal-page assignment is an **unconfirmed inference**. The signed Cicada material does not specify a base59 alphabet, a tree walk, parent equations, an internal-node order, or the GP29-to-tree representation. The same 95-leaf count follows from the 161 distinct token values in both base59 and base60. The tests below therefore reject precisely their declared consumers without establishing a designer-intended route.

## Original fixed-salt fold: earlier bounded result

Assign original p57 rune labels to the 95 leaves in original address or DFS order, forward or backward; use either literal GP rune indices or GP prime weights reduced modulo29. Treat the first 76 nonroot internal nodes as unobserved and the last 84 as independent solved p56 labels, under original-address, DFS-preorder, or DFS-postorder node order. The previously fixed local rule is

```
leaf[node] = source p57 GP label, in one of two fixed numeric registers
parent[node] = (sum(known child labels) + signed original printed byte[node]) mod 29
```

Every internal node is generated from the leaves without fitting a key. Across **48** layout/sign readings, the strongest result matches only **7 of 84** actual p56 labels, or **8 of 84** after subtracting the computed root label as a fixed normalization. Authentic p56 ciphertext reencrypts **85/85** from the documented solved text under the phi-prime clock, including its one bypass. The exact first analysis and synthetic control are preserved in [Agent45's read-only SFT](../sims/lp2_p50_base59_node_salt_fold_sft.cjs). The required direct readout would have matched **84/84**.

## Complete five-feature secret-affine gate: new decision

A natural concern about a failed fixed coefficient of `+1` or `-1` is that the original work arbitrarily chose the salt's sign and scale. Here **all** coefficients of a more expressive shared local law are granted to the hypothetical creator:

[
\operatorname{parent}(v)=a\!\sum_{u\in\operatorname{children}(v)} \operatorname{value}(u)
+b\,B_v+c\,v+d\,\deg(v)+e\pmod {29}.
]

Here `B_v` is the original *printed node token* interpreted as a byte in either the candidate radix59 or the independent conventional radix60. The parent graph itself is always the source-derived radix59 graph. This family permits freely selected secret factors for the child sum, entire native byte, node address and in-degree, plus an arbitrary offset. There are exactly **29^5 = 20,511,149** possible coefficient vectors per source geometry. The earlier unscaled `sum ± B` and constant-shift variants are contained as special cases. There is no tuning to the p55 ciphertext or any dictionary.

The same **24 predeclared source-natural label/reader layouts** are used: two leaf enumerations (ascending address or rooted DFS), three internal enumerations (ascending address, DFS preorder, DFS postorder), both p57 directions, and both GP-index or prime-weight-residue labels. Two printed-byte readings then give **48 original-source cases**. For a known p56 internal node, the equation is evaluable only if **every child** has an already-known label (p57 or p56); the first 76 p55 candidate labels and the root remain entirely withheld. This leaves **55–83 full parent equations** per case.

Use exact Gaussian elimination over the prime field GF(29) to compare rank of the **k×5** matrix of known child sums, printed-byte residues, address residues, child counts and constant with rank after augmenting its right side with the independent known p56 parent labels. A hidden coefficient vector exists **if and only if** the ranks coincide.

| Unmodified original-source test | Result |
| --- | ---: |
| Original assignments | 24 |
| Independent original-token salt representations | 2 |
| Full secret affine families | **48** |
| Candidate coefficient vectors in each | **20,511,149** |
| Authenticated known p56 parent equations available | **55–83** |
| Feature-matrix rank | **5 in 48/48** |
| Augmented rank with known authentic p56 labels | **6 in 48/48** |
| Compatible original cases under any secret coefficients | **0/48** |
| Independently generated tree-fold positive controls | **48/48 algebraically consistent** |

The rank contradiction is **key-independent** under this law. No choice of the five coefficients can reproduce even the known p56 portion in any selected order, regardless of the 76 unknown p55 letters. The reference implementation asserts original source-table bytes' SHA-256, correct root and source counts, the authentic 85/85 p56 forward prime-totient cipher, the exact 48 rank failures, and 48 source-shaped positive folds using the hidden fixed test vector `(3,7,11,13,17)`. The independent field calculation was also evaluated against both live original JSON objects without guessing any plaintext.

[Standalone CommonJS SFT](../sims/lp2_p50_base59_affine_tree_p56_sft.cjs) · [Manual Windows Node22 workflow](../.github/workflows/lp2-p50-base59-affine-tree-p56-manual.yml) · [Dispatch run](https://github.com/FlareZ123/liber-primus/actions/runs/44135649042).

## What this changes

The strict simple `parent = sum(children) ± original byte` failure is now subsumed by an **entire arbitrary secret five-coefficient source-shaped family**. A hidden scale, address salt, degree offset or per-tree affine constant cannot rescue the hypothetical p50 tree → final three pages readout under the 24 fixed source-natural placements.

This cannot exclude arbitrary nonlinear operations, independently secret functions per node, unseen historical material, a different graph reader or a different receiver. Those would change the mechanism rather than repair a coefficient. Reopening this branch should require a concrete original clue selecting such a change and an independent p56-compatible prediction. **No unknown LP2 ciphertext was decrypted.**
