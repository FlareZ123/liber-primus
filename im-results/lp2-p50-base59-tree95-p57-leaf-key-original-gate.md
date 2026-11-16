# Clear PARABLE (95 runes) as the 95 leaves of the source-absent-f p50 rooted map: a bounded direct key consumer

**Agent 42, 16 November 2026. Evidence class: original-cipher inverse with a source-native positive and identical-inventory matched null. No unknown plaintext, authenticated key, or new puzzle destination.** [Read-only Node22/CommonJS SFT](../sims/lp2_p50_base59_tree95_p57_leaflabel_original_sft.cjs) · [successful Windows GitHub Actions run 43925188470](https://github.com/FlareZ123/liber-primus/actions/runs/43925188470).

## Why this is a different, human-readable source clue

The [original 32×8 numerical table](../resources/liber-primus/base60-grid.json) on LP2 physical pp49–51 contains 256 printed two-character tokens; lowercase **f** alone is absent from the otherwise complete 60-character repertoire. Under the documented *conditional* radix59 codec deleting f, each decoded byte is also a valid original row-major 0-based address. The exact functional map `next(i) = value[i]` has **one self-loop at address189**; every other address reaches that root, yielding a 256-node directed in-tree ([original graph enumeration](lp2-p50-base59-source-convergent-map.md)). In a tree, source-visible tips are an unusually direct match for the p55 tree illustration and the solved p57 text's exhortation to look *within*.

**New proposed plaintext consumer:** that tree has **95 indegree-zero leaves**, the same number as the **95 GP29 runes in clear p57, PARABLE**, available from the original unencrypted final image ([source corpus](../resources/liber-primus/lp2-corpus.json)). A player could give its 95 visible leaves the 95 known characters and work inward to obtain a key. This tests an actual reversible cryptographic result rather than counting 95 as a solution.

There is a crucial qualification. Both the radix59 and conventional radix60 numeric tables have exactly **161 distinct output values**, hence **95 absent target values / leaves**. The equality of 95 with p57's 95 runes **does not discriminate base59 from base60**: leaf count equals 256 minus the number of distinct decoded targets. Only radix59 forms the single rooted tree. Its global convergence was previously measured as **108/30,000** exact-value-multiset shuffles, but the hypothesis itself is exploratory; no signed original message selects a tree reader or assigning p57 letters to leaves.

## Frozen full original key test

1. Use the exact original 256 table cells, decode under the source-defined 59-digit order, build all incoming child lists, and enumerate the 95 *indegree-zero* addresses in increasing original row-major address order.
2. Assign **the entire unmodified p57 95-rune GP29 plaintext** across the leaves. Two finite choices of assignment direction: original text order and reverse.
3. Two independently attested GP values of each known rune supply the source labels: **GP ordinal (0–28)** or its **GP prime weight mod29**.
4. At each internal node, take the **sum of its immediate children's labels modulo29**, recursively working towards the root. This is a deterministic, branch-order-independent way to propagate values and yields all **256** key symbols.
5. Apply each 256-entry key sequentially, repeating after 256 source runes, to the original **physical p55 (76 runes)** and to the final complete **pp54–55 chapter (308 runes)** under both additive GP29 signs. Score the eight fixed models by whole-output IoC. Neither original input is shortened, reordered, or fitted to an English word.

The key-consumption, label-domain and sign choices are concrete unverified consumer interpretations, **not commands given by Cicada**. There is no ciphertext-conditioned key fitting, phase optimization, key-clock skip, or guessed plaintext.

| Original target | Strongest of 8 source-labelled inverse IoCs | Matched optimized order-null mean | Source-label shuffles equal or better (5,000) | Plus-one upper-tail |
| --- | ---: | ---: | ---: | ---: |
| Final unsolved page p55, 76 runes | **0.04245614035** | **0.03965958** | **779** | **780/5001 = 0.15596881** |
| Whole p54–55 final unknown chapter, 308 runes | **0.03659207242** | **0.03572206** | **506** | **507/5001 = 0.10137972** |

Matched null permutes the exact original p57 95-rune multiset among the 95 same leaf slots (fixed xorshift32 seed `0x33010095`) and optimizes the **identical eight choices on every permuted candidate**. This tests whether actual **p57 text order**, over and above its inventory and length, supplies an exceptional key. It does not attempt a discovery-wide probability for the retrospectively chosen 95-leaf clue. Neither original output resembles full GP-native plaintext. A clear p57 passage of 76 runes was independently encrypted under the same nonconstant derived key, decoded, and **recovered exactly 76/76**, establishing correct operation.

## Decision

The exact 95-leaf/p57-letter fit is worth recording as a possible intended *interface*, particularly alongside the visually repeated p32/p55 tree, but the simplest source-defined leaf-to-parent additive GP29 consumer **fails** on original unknown p55 and the complete final chapter. Its best results are unexceptional compared with shuffled orders of the same p57 plaintext. This eliminates neither a different source-specified tree traversal/aggregation nor a lost external key; no evidence authorizes multiplying such variants into an unconstrained search. A new decoder here needs an **independent cue specifying how tree nodes become key or message symbols**, and an untouched original ciphertext segment that reads coherently.
