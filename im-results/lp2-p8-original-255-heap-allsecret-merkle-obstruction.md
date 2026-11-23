# Original p8: all-secret binary-tree parent obstruction

**Agent45, 23 November 2026. Classification: bounded exact original-cipher exclusion, not an LP2 decryption.** [Read-only Node22 reproducer](../sims/lp2_p8_255heap_allkey_merkle_original_sft.cjs). No unknown plaintext, secret key or destination was recovered.

## Why this is a human-recognizable route

Original physical LP2 **p8** (scan \`25.jpg\`) has **255 GP29 runes**, exactly \`1+2+4+8+16+32+64+128 = 2^8-1\`, and belongs to the visually illustrated tree section. Separately, the first **12** p8 runes are in a single red heading, which can be divided as 4 parents and eight children. A literal breadth-first complete eight-level binary tree is therefore an *independently count-selected* candidate interpretation of all **255** runes. It could have represented a Merkle-like parent lookup, perhaps with a secret table, rather than ordinary runic prose. This is a hypothetical reading: the original gives no authenticated instruction to traverse its rune text in heap order or to hash children.

A source-exact stronger question than comparing to a guessed hash or a language score is whether **any** fixed keyed parent lookup can fit the whole page.

## Key-independent necessary condition and original contradiction

In the exact **breadth-first 255-node** model, for each zero-based parent node \`i=0..126\`, children lie at \`2i+1\` and \`2i+2\`. Allow an *arbitrary*, entirely unknown parent function \`H_d(left,right)\` for every depth \`d=floor(log2(i+1))\`; each depth may have a different secret table with up to 841 ordered inputs, no regularity, no invertibility and no presumed key. Under **every** deterministic such function:

> If two positions of the same depth have equal ordered left/right child runes, then their parent runes must be equal.

The original 255-rune tape contains **three** within-depth repeated ordered child pairs, each with *different* parent values:

| Depth | Parent nodes (0-based) | Identical child pair (GP indices) | Contradictory parent pair (GP indices) |
|---:|---|---|---|
| 5 | **45**, **59** | **(4,14)** | **(23,17)** |
| 6 | **73**, **81** | **(18,16)** | **(4,20)** |
| 6 | **77**, **124** | **(3,10)** | **(4,19)** |

Thus **3 of 3** within-depth repeated pair inputs contradict **all** fixed, arbitrary-secret, *depth-specific* upward hash functions in this precise tree order. If the secret parent function must be global across all depths, there are **eight** repeated child pair observations, and **all eight** have unequal parents. The literal non-secret source-field arithmetic readouts also have only **3/127** matches each for parent \`= left+right (mod29)\` and parent \`= left*right (mod29)\`.

This is a logical inconsistency rather than a statistical negative: no choice of up to seven secret lookup tables can repair even one conflicting identical-input parent pair. It uses only the unchanged \`resources/liber-primus/lp2-corpus.json\` p8 indices and the separate \`lp2-ink-annotations.json\` red12 check. No word breaks, externally supplied candidate words, inferred plaintext, table radix, CI key sweep or language-model score enter the theorem.

## Executable controls and decision

The SFT creates a **128-rune authentic GP-native leaf plant** from the genuinely clear p57 register, repeats its first 64 native runes to force exact duplicated sibling inputs, and generates all 127 parents under the same explicit depth-conditioned operation \`H_d(l,r)=(l+2r+7+d) mod29\`. **64** within-depth pairs are repeated in this plant and **zero** conflict. Mutating a single synthetic parent at node95 produces a detected collision with node63, showing the test is sensitive to an invalid hash-tree representation.

The original p8 is **not** a complete ordinary Merkle-style GP29 upward tree in this natural exact 255-node breadth-first order, even if every depth had an independently secret function. This says nothing against other source-selected node orders, salted-by-node hashes, moving keyed state, forest/framing variants, non-GP intermediate labels or an entirely unrelated use of the tree illustration. In particular, without a player-visible salt or a different traversal, this branch contains no recoverable original plaintext. This rejects a concrete tree-message architecture and recommends **not** extending it with fitted salts merely to eliminate its collisions.

The previous [p8 red4→8 expansion test](../sims/lp2_p8_binary_tree_expansion_gate_sft.cjs) examined only twelve source-red runes and the opposite parent-to-children stateless direction. The present original all-255 **upward, depth-private** collision obstruction is distinct from that test and from the prior 256-byte grid Merkle proposals. It does not change the [established LP2 unsolved status](../results/README.md).
