# Canonical 4-ary rank encoding of p50's base59 tree: exact 64-byte p56 hash-preimage test

**Agent17, 21 November 2026. Evidence class: original-artifact reversible encoding, exact preimage comparison, complete negative. No unknown LP2 plaintext, authenticated cipher key or original deep-web page was recovered.**

## A complete source-selected consumer to try

Near the manuscript's ending, original pp49–51 print exactly **32×8=256** two-character numeral cells, original p55 prints a tree drawing, solved p57 tells the reader to “shed our own circumferences” and “find the divinity within,” and solved p56 prints **128 hexadecimal characters** said to be the hash of a deep-web page. Those are direct source facts. Previous tests of treating the 256 cells themselves as Merkle leaves ruled out six straightforward SHA-512 roots ([earlier original-byte gate](lp2-p50-merkle-sha512-original-source-gate.md)). This is a **different encoding**: use the 256 *vertex positions* of the source's competing **base59 rooted graph** to produce a candidate **64-byte original page**, and compare its SHA-512 to the original printed target.

Removing the only missing source symbol `f` from the conventional 60-character digit inventory yields an ordered 59-digit alphabet. Decoding original row-major cell (i) as the directed pointer (parent(i)) produces the already established unique in-tree rooted at self-loop **189** ([original-source graph](lp2-p50-base59-source-convergent-map.md)). Every vertex has **at most four *distinct nonself-loop children***. Thus a player can label each vertex with its 0-based ordinal among its parent's children, the children ordered by their unchanged printed row-major address; each ordinal is **0,1,2, or3**, requiring exactly two bits. Assign zero to the unique root's otherwise undefined child ordinal. Read the **256** two-bit ordinals in the original printed table order, four consecutive cells per byte, using most-significant-bit-first packing. This makes exactly **512 bits = 64 bytes**, the length of one SHA-512 digest. None of the 256 ordinals or their packing is fitted to the p56 hash or any unknown ciphertext.

The original source does **not** explicitly tell the solver that the base59 graph is a tree code, choose this ordinal convention, or use SHA-512. Both are plausible exploratory interpretations of the source clues, with genuine alternatives. The test is valuable because it makes a **single complete and independently falsifiable 512-bit original-source prediction**, rather than fitting a byte key to the printed digest.

## Exact original result

- Original cell graph has one root189, all vertices reach it, and child-count distribution (excluding root's self-loop) is **95 nodes with zero children, 92 with one, 49 with two, 15 with three and five with four**. The 255 nonroot vertices all have ordinals 0–3. The 256-symbol two-bit serialization round-trips exactly at each source address.
- The **64-byte canonical packed tape** is exactly:

```text
00000004000000000004400001060000045000400050041050004005855516014856011006005404450107010044210200250410102646546e964527e41a0107
```

- **SHA-512(packed 64-byte tape)** is:

```text
54f8d48af374b9d2d6d9bf4a9743d26bd841d1c25d40f27b305746f9998e079f5e748fcf72edff413893b6abe8d664ece624d12a3f6664151540e5509638a1e2
```

- The independently printed p56 128-hex target begins `36367763ab73783c7af284446c59466b4cd...` and **equals neither the packed tape nor its SHA-512**. Both full equality checks are false. A real SHA-512 known-answer and one-bit-mutated 64-byte plant distinguish a functioning comparison from a successful historical preimage.

**Consequence:** the canonical row-major two-bit sibling-rank tape under the base59 rooted graph is **not** the requested deep-web hash's direct 64-byte preimage under SHA-512, and it does not literally encode the printed 64-byte hash. It yields no plaintext or key. Its raw sparse/zero-heavy byte tape is also not an authored readable instruction. No alternative child order, bit endianness, omitted root position, table permutation, hash algorithm, or ciphertext-dependent parameter has been searched; varying those after seeing the negative would require an additional original clue. The base59 structural observation and p56 destination remain unresolved.

**Reproduce:** [one-file Windows Node22 CJS](../sims/lp2_p50_base59_tree_siblingrank_p56_sha512_sft.cjs), original table/corpus inputs, [successful 21 Nov Actions run 44943543321](https://github.com/FlareZ123/liber-primus/actions/runs/44943543321). Independent positive is the SHA-512 reference vector and synthetic changed-bit rejection; no fabricated plaintext.
