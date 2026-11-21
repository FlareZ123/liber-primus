# p55 cicada-cycle clue and the p50 base59 tree: source hypothesis, not a decipherment

**Agent 33 — 21 November 2026.** Classification: a new, human-solvable-path hypothesis that may select the competing base59 reading of p50; the three tested direct tree consumers below are negative. No unknown plaintext or cipher key is recovered.

## The source-visible chain

The original physical p55 image (resources/liber-primus/72.jpg) contains the Cicada 3301 insect emblem and a red 13-dot mark. Its original GP29 text has **17 printed words and 76 runes**. The independently solved p57 PARABLE uses the biological terms **“instar,” “tunneling to the surface,”** and **“emerge,”** and separately says to **“shed our own circumferences”** and find the divinity within. These are direct manuscript observations, not interpretations of the unknown p55 plaintext. The 17-word/76-rune partition and 43-interior/33-exterior split are frozen in [Director issue #40](https://github.com/FlareZ123/liber-primus/issues/40).

Periodical cicadas have **13- or 17-year** underground life cycles. The Library of Congress and University of Connecticut describe both periods; Illinois Extension also notes the proposed explanation that the intervals are prime numbers ([LOC](https://guides.loc.gov/periodical-cicadas), [Illinois Extension](https://extension.illinois.edu/insects/cicadas), [UConn](https://cicadas.uconn.edu/species/)). This gives a plausible human clue chain from the cicada emblem and p57's literal instar/emergence language to the p55 counts 13 and 17. It is not proof that the pictured emblem depicts a particular periodical species, or that the author expected solvers to use this biology.

The arithmetic consequence is unusually specific:

- The 17th prime is **59**, selecting the source-absent-f base59 interpretation of the p50 32×8 token table.
- The 13th prime is **41**; Euler's totient is **φ(13)=12**.
- Under base59, the p50 address graph has a single fixed point at address **189**, whose original token is **3C**. In the 59-symbol alphabet, 3C = 3×59+12 = 189; its low digit is exactly φ(13). Also 189 mod 29 = 15, GP29 symbol **S**.
- Under the conventional base60 reading, the same directed map has cycles of lengths **11 and 2**, not a single root.
- The base59 map has **95 leaves and 161 internal nodes**. These counts match p57's 95 runes and p55+p56's 76+85=161 runes.
- The p50 grid is 32×8: its outer perimeter is **76** cells and its interior is **180**. These match p55's 76 runes and p56+p57's 85+95=180 runes.

The base59 graph, root and null corrections are already documented in [the original p50 base59 map report](lp2-p50-base59-source-convergent-map.md). The separate GF29 parity analysis conditionally favors base60, so this biological selector is a genuine competing hypothesis, not a settled radix decision ([p50 parity report](lp2-p50-hg-single-residue-correction.md)).

## Frozen candidate mechanism and tests

The simplest geometric reading is: place p55's 76 ciphertext runes around the p50 table perimeter clockwise from the top-left; place the known p56+p57 180 runes into the 180 interior cells in row-major order; interpret each base59 table value as a parent pointer toward root 189. This turns p57's “shed circumferences” and “find the divinity within and emerge” into a concrete table/tree hypothesis.

I tested the following finite consumers against the **original** p55 ciphertext, with no key fitting or phase search:

1. **Nearest-interior-ancestor Vigenère key.** For each perimeter cell, follow parent pointers until the first interior cell and use that cell's known p56/p57 rune as the key. Test both additive signs, with and without literal-F passthrough.
2. **Recursive parent autokey.** Starting from known interior runes, recursively decrypt each perimeter node using its parent's recovered plaintext. Test both signs, with and without literal-F passthrough.
3. **Tree transposition.** On the same perimeter/interior assignment, read the 256 cells in root-first DFS, postorder DFS, breadth-first, and inverse-preorder order.

All 76 perimeter nodes reach an interior ancestor under base59; the nearest-interior path-depth histogram is {1:54, 2:16, 3:5, 4:1}. Nevertheless, none of the eight Vigenère/autokey outputs or four tree readouts yields a coherent GP29 passage. Representative original p55 word outputs from recursive subtraction are:

M / NSIL / PP / GU / JNGOECAET / OEGJXUN / EA / DMEAIGEAFNOECNGJD / ...

The root-first tree-transposition stream begins WAERCRMDMRXHACUEDNEIAEEACHXIEARCG...; inverse-preorder begins CUSEODUIYEAOETHEIJHNGEAITHJGSI.... These are ciphertext-like, not plaintext. The test therefore rejects these specific nearest-ancestor, parent-autokey and traversal consumers; it does not reject the source-level cicada/base59 clue or every possible tree mechanism.

The read-only Node22 reproducer is sims/lp2_p55_cicada_base59_perimeter_tree_sft.cjs. It pins the original corpus/table inputs, asserts the 13/17 prime/totient arithmetic, root and leaf counts, perimeter/interior partition, exact key streams and all tested outputs. [Node22 run 44909393081 passed](https://github.com/FlareZ123/liber-primus/actions/runs/44909393081).

## Strongest objections and decision

This is a plausible intended human clue, but it is not yet an independently authenticated instruction:

- The manuscript does not state “13 years” or “17 years”; the insect emblem may be generic, and 13-dot markers recur elsewhere.
- The p55 17-word count may be incidental. The root token's low digit matching φ(13) is a retrospective correspondence; its high digit 3 is not explained.
- Base59 is still conditional. The p50 GF29 parity interpretation has independent arithmetic that favors base60, although that interpretation's authorial selector is also unproved.
- The exact p55 perimeter/p56+p57 interior placement is count-constrained, but the table does not explicitly prescribe the clockwise start, row-major interior order, or a value-changing operation.
- The tested tree consumers are negative. The remaining missing input is not another traversal variant; it is an original-source instruction that specifies how table directions transform the rune values.

**Decision:** preserve this as one bounded source-to-radix hypothesis for Director evaluation. Do not promote base59 to an established result, reopen #40 as solved, or launch further tree/key sweeps without a new selector. No plaintext, authentic key, complete cipher or destination has been recovered.
