# P50 256 numeric leaves → p8 255 rune parents: complete original 511-node tree gate

**Agent6, 23 November 2026. Classification:** bounded negative on the unchanged original LP2 artwork and ciphertext. This is the first explicitly tested **p50-number-leaf to p8-rune-internal-node 511-vertex** model, distinct from the previously rejected p8-only 255-rune heap. **No unknown-page plaintext, key, cipher instruction or destination is recovered.**

## Human-solvable hypothesis and rival

Physical p8 (source scan `25.jpg`) carries exactly **255** GP29 runes and tree imagery; physical p49–51 (scans `66.jpg`–`68.jpg`) carry a separate **256-cell**, 32×8 original two-character numeral table. Exactly **255 internal nodes** accompany **256 leaves** in a full binary tree. A 2014 puzzle author could theoretically store parent labels as GP29 runes and numeric leaves as byte inputs. Competing explanation: 256 is a natural byte-grid size, 255 also independently equals p3–7's original printed-word count, and the tree art need not represent a Merkle tree. The manuscript does **not** say to identify these distinct objects, serialize the leaves as GP numbers, choose a traversal or hash their pairs.

We test the complete falsifiable proposal without changing source word boundaries, omitting ciphertext, fitting private node salts or selecting a language score.

## Exact original typed construction

- Source parents: the 255 unmodified p8 rune ordinals (0..28) in `resources/liber-primus/lp2-corpus.json`. The real first 12 are printed red; their visual distinction is retained in the source but does not alter a field-element parent here.
- Source leaves: **all 256 original p49–51 cells** in `resources/liber-primus/lp2-grid-256.json`, in printed row-major order. Test both ordinary base-60 and the original-token base-59 interpretation that deletes its unused lowercase `f`. Both decode every unchanged token unambiguously. Any leaf byte entering GF29 is reduced modulo29.
- The complete zero-based binary heap has **511 nodes**, internal addresses 0..254, leaves 255..510. The two predeclared human-readable assignments of the printed p8 rune list are (a) breadth-first, internal heap order 0..254, and (b) conventional inorder recursive traversal of the full heap, recording only its internal vertices.
- At each of 255 original internal addresses `i`, compare its p8 rune `Y_i` with the proposed output on exact children `L_i=V[2i+1]` and `R_i=V[2i+2]`. Six fixed operations are `(L+R) mod29`, `(L−R) mod29`, `(R−L) mod29`, `LR mod29`, `(L XOR R) mod29` (XOR on the original child byte values), and `(GPprime[L mod29]+GPprime[R mod29]) mod29`. This charges **24** total traversal×radix×law cases rather than post-selecting a secret field operation.

The source image glyph audit [adjudicated eleven disputed table tokens](lp2-grid-11-original-glyph-adjudication.md) against all 256 actual printed cells, including I/l, L/l and S/s forms. The canonical grid therefore remains the source-correct reading. Even allowing **eleven arbitrary leaf-token corrections** would alter at most eleven of the **128 bottom-level** parent tests; it would never alter any higher parent/child labels, which are all original p8 runes. This makes the exact upper-level exclusion below independent of every historical numeral dispute and of the base59/base60 choice.

## All-secret theorem: the upper internal tree already contradicts itself

Allow **any deterministic secret function for each independent depth**, even one with all 841 GP29 ordered child pairs as independently arbitrary lookup entries:

`Y_i = H_depth(L_i, R_i)`.

A necessary identity is unavoidable: **two parents at the same depth with equal ordered child rune pairs must have equal parent runes**. If two such nodes disagree, no secret function, password or retuned byte interpretation can fit the entire tree. Depths **0–6** use *only the p8 rune source* as children, while numeric table leaves appear exclusively at depth7.

| p8 internal assignment | Conflicting pairs strictly above leaves | Independent original contradiction certificates |
|---|---:|---|
| Breadth-first | **3** | depth5 nodes45/59: same ordered children (4,14), different parents (23,17); depth6 nodes73/81: (18,16) → (4,20); depth6 nodes77/124: (3,10) → (4,19) |
| Inorder | **4** | depth5 nodes35/59: (11,20) → (21,9); depth5 nodes54/61: (22,0) → (24,13); depth6 nodes74/84: (4,7) → (23,13); depth6 nodes100/104: (16,9) → (20,21) |

These certificates do not inspect a single numeric leaf. They are **not statistical evidence**: each is an exact logical contradiction for every depth-wise deterministic parent map under the specified traversal. Adding the 256 p50 leaves does not repair the earlier p8-only contradiction and actually adds further conflicting repeated leaf pairs.

| Parsed leaves / p8 traversal | All 255 parent-law matches: +, L−R, R−L, ×, byte-XOR, prime-sum | Conflicting same-depth parent pairs, all levels | First leaf-parent level matches for the corresponding six laws |
|---|---|---:|---|
| Base60 / breadth-first | **6, 4, 8, 6, 4, 11** | **12** | 3, 0, 6, 3, 1, 7 |
| Base59 / breadth-first | **7, 10, 4, 9, 8, 8** | **13** | 4, 6, 2, 6, 5, 4 |
| Base60 / inorder | **14, 6, 6, 11, 8, 6** | **14** | 5, 4, 4, 7, 3, 2 |
| Base59 / inorder | **12, 5, 5, 12, 9, 6** | **13** | 3, 3, 3, 8, 4, 2 |

The best printed-source score is **14/255**, achieved by the inorder/base60 additive law. It fails 241 original parent equations. A hypothetical complete tree under a genuine single parent law must reproduce all **255/255**, not merely a better-than-random subset.

## Source-multiset shuffled-leaf comparator

To detect whether 14/255 is in any way discriminative after choosing the best of 24 legitimate options, freeze the actual p8 labels and both source digit alphabets, shuffle **whole original table tokens** with one shared shuffle index for both radices, and recompute the best of all 24 laws for each of **5,000** xorshift32 permutations (seed `0x33012372`). The original top score is 14. Among scrambled-token controls:

- **3,751/5,000 (75.02%)** score at least 14 after the identical selection;
- average best score **14.7368/255**, observed null range **10–22/255**.

The printed grid's apparent best arithmetic relation is therefore **weaker than the ordinary shuffled-leaf maximum** under this predeclared comparison. This comparator is descriptive because the upper internal labels stay fixed; the all-secret same-pair contradiction gives the stronger complete exclusion.

## Reversible-method and positive-control boundary

The standalone [CommonJS original-source SFT](../sims/lp2_p8_p50_511tree_original_sft.cjs) reads unchanged repository JSON, reconstructs all 511 nodes in both placements and both numeral codecs, checks all six complete laws, reports the exact conflicting node-pair certificates, and reproduces the full 5,000-shuffle experiment. Its separate **255/255 positive** constructs every upper parent under a genuine explicit depth-dependent `H_d(L,R)=(L+2R+7+d) mod29` from the **same 256 source leaf positions**. The known-law recomputation passes and the all-secret contradiction detector returns zero. It is a forward-authentication control; *hashing leaves into parents is not an invertible manuscript decoder by itself*. No alleged original plaintext is produced, so no pretend re-encryption or semantic readout is claimed.

A later source-selected nonlocal tree, node-dependent salt, unknown traversal, bytewise hash plus truncation, or independently authored key can evade this theorem. Those escape hatches need original evidence: 255 preselected node salts would simply overfit 255 labels. The manuscript offers no authenticated rule turning the p50 bytes into readable p8 plaintext, and p9–14 contain no held-out positive outcome of these models.

**Director decision:** retire precisely the **full 511-node, conventional breadth-first/inorder, depth-stationary binary parent-law** bridge. The 255/256 count relationship remains an unspecific artifact coincidence. Do not assign another parent-function search or leave-to-parent private lookup until a genuinely independent instruction fixes a different tree representation and predicts an original ciphertext receiver. Full original runnable gate: [`sims/lp2_p8_p50_511tree_original_sft.cjs`](../sims/lp2_p8_p50_511tree_original_sft.cjs). Manual Windows Node22 workflow: [`lp2-p8-p50-511tree-original.yml`](../.github/workflows/lp2-p8-p50-511tree-original.yml).
