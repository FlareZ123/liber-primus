# Direct H/G polynomial syndromes of all original LP2 pages do not reveal plaintext

**Agent 46, 11 November 2026. Evidence class:** one source-fixed, exact original-ciphertext readout with a planted source-GP message and algebraic inverse. **No unknown LP2 plaintext, authentic key, historical instruction, or destination recovered.** The decision is limited to direct page-remainder-as-text; the independently established p29/p50 common factor remains intact.

## Candidate human route and source-selected operation

Two original artifacts identify a four-symbol polynomial checksum without choosing any target text:

1. The **2013 Cicada-signed TCP-server instruction** gives the worked BASE29 3301 → 3QO, whose printed digits yield the degree-two polynomial \(H(X)=3+26X+24X^2\) in the ascending-power convention independently observed for LP2's red triads. Turning numeral digits into a polynomial is an interpretation, not an explicit 2013 instruction.
2. The **original physical p39 three-rune red inscription**, at page-local offsets 119–121, yields \(G(X)=27+5X+15X^2=15(X-24)^2\) over GF29.

Both source-linked polynomials divide the original **256-byte table polynomial** spanning physical pp49–51 in original row-major descending coefficient order. They are coprime, giving **four independent syndrome positions**. The original table's byte-stream SHA-256 is 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.

**One finite inverse/readout:** treat each of the **55 rune-bearing unknown physical pages**, in printed order, as a polynomial whose descending coefficients are its 0–28 GP indices. Reduce that page polynomial first modulo H, then modulo G. Each remainder has two descending GP coefficients. Concatenate the four coefficients per page, with **no fitted key, rotation or boundary choice**, to create a 220-rune candidate plaintext channel. Physical p50 has no runes; physical pp0–55 contain 12,956 original runes in total.

This asks a specific question: did the author use the polynomial checks already present in the number table to place a readable message at the page level? The manuscript does not explicitly tell players to polynomialize each rune page; that is the single interpretive leap.

## Original-data answer

| Readout/control | Result |
| --- | --- |
| Original printed grid, correctly oriented H and G | Both remainders **[0,0]** |
| Same grid, reversed source-digit factors | Nonzero remainders **H [1,6]**, **G [19,22]** |
| 55 unchanged rune-bearing original pages | **220** extracted GP indices |
| Original 220-symbol index of coincidence | **0.0342465753425** |
| Original p29 reduced modulo G | **[0,0]**, previously established |
| Solved-GP positive plaintext embedded in the *same decoder* | **220/220** recovered, IoC **0.0683271066833** |

The original stream begins:

    NGSEXLOEPGAELUSSSEOGTHICNEAMENGJNGWBEAIAITH

The reproducer prints the entire fixed 220-index stream. It does not read as ordinary Gematria-Primus prose, and its near-uniform symbol-collision rate is invariant under any fixed 29-rune alphabet permutation. Direct native-GP plaintext under this specific four-residue extraction is therefore unsupported. No general language impossibility follows.

### Positive encryption and exact inverse, without a fitted source key

For each of the 55 original page-length vectors, preserve **every original source rune except the last four**. Hold that original prefix fixed and solve four GF29 linear equations for the four trailing rune values that encode four consecutive target symbols from **independently solved physical p57** text. Repeat the solved 95-rune text as needed to fill 220 positions.

Because H and G are coprime degree-two factors, the four trailing coefficients control their two independent two-symbol remainders with a full-rank 4×4 map over GF29. The reproducer solves each page using Gauss–Jordan elimination, decodes those source-length-matched synthetic pages, and asserts all **220 target GP runes are recovered exactly**. This proves the tested decoder can extract a planted four-rune-per-page message when one exists. The plant is diagnostic only; it does not imply the actual Cicada author encoded pages this way or replicate all ciphertext statistics.

## Decision and scope

This original-data result closes the **direct H/G page-syndrome message** route. The same factors yield exact algebraic relationships inside the number table and between the table and p29, yet the other page syndromes expose no new native-GP prose, key or decoding instruction. Further arbitrary page permutations, roots, derived alphabet choices or phase scans need a new original clue.

The p29 double-root and p10/p11 facing-tree single-root relations remain documented separately; this result does not replace them.

**Reproduction:** [single-file CommonJS original-source test](../sims/lp2_gh_page_syndrome_sft.cjs) on tracked [LP2 corpus](../resources/liber-primus/lp2-corpus.json) and [original table](../resources/liber-primus/lp2-grid-256.json). Run the Node.js file from the repository root. The program checks the original 256-byte table hash, correct and wrong-source factor orientations, all 55 source page lengths, the previously known p29 zero, the complete 220-symbol output and the **220/220** positive exact inverse. Background source arithmetic: [2013 BASE29 table factor](2013-base29-gf29-grid-factor.md) and [p29 original double-root relation](lp2-page29-marked-quadratic-crosslink.md).
