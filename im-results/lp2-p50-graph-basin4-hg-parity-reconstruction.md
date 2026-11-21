# Original LP2 numeric table: 252+4 pointer basins and a rank-three HG parity bridge

**Agent49, 21 November 2026. Evidence: exact source-side linear algebra, conditional on a hypothetical table pointer interpretation. No unknown GP29 plaintext or author-selected cipher was recovered.**

## Why compare these two constructions

Original LP2 physical pp49–51 print 256 two-character numbers in a 32×8 table. Under the conventional base60-byte reading, the candidate `next(i)=byte[i]` creates exactly two basins: a **252-cell basin** draining into the known 11-cycle and a **4-cell basin** draining into the two-cycle 158↔249. Its four original addresses are **[9,158,227,249]**, with printed tokens **[49,49,49,2c]** and decoded bytes **[249,249,249,158]**. These printed equalities are automatic under the pointer graph's fan-in at state249.

Independently, the historically sourced 2013 BASE29 quadratic `H` and the original p39 red quadratic `G` multiply to `HG(X)=12X^4+17X^3+11X²+21X+23` in GF29. Taking original byte residues modulo29 as the coefficients of a descending-power polynomial, the complete printed table divides **exactly** by HG, yielding **252 quotient** symbols and **four vanishing parity checks**. This 252+4 match with the pointer basin split motivated a direct algebraic calculation, *without treating either operation as an authenticated original cipher instruction*.

## A direct original-source parity reconstruction

Pretend the original GP29 residues at the four small-basin positions are hidden, retaining the other252 original residues. The four HG remainder checks applied to these four unknown coordinates yield the following coefficient matrix, each column the polynomial residue of `X^(255−index)` modulo HG:

```text
               index  9 158 227 249
X^0                   23  15  25  23
X^1                    3  28  15   7
X^2                   25  25   2  17
X^3                    0  24  16  24
```

The matrix has **rank3**, with a nonzero kernel vector **[12,20,12,1] mod29**. Thus the four table positions cannot function as four *independently determined* HG parity symbols without one additional relationship: 29 distinct four-residue assignments satisfy the same factor constraints.

The printed same-token relation between cells9 and158 supplies `b[9]≡b[158] mod29`, whose row `[1,28,0,0]` is independent of the three existing constraints. The new augmented system has **full rank4** and uniquely reconstructs the source's exact four GP29 residues **[17,17,17,13]**; the third printed `49` at cell227 is satisfied as well. Replacing those four residues in the unmodified source gives all original 256 residues and vanishing HG remainder. To demonstrate that factor checks alone do not suffice, add the nullvector once to get **[0,8,0,14]**: it still passes all four HG checks, while violating the source fan-in equality.

**The recovered data are only GF29 residues, not original 8-bit byte values.** The small basin itself was defined using its own original bytes; consequently this is a self-consistency reconstruction of an already-visible object, not a cryptographic recovery of unseen plaintext. Its conditional novelty is the algebraic relationship between graph basin location, the independent historical quadratic factors and the existing repeated table values.

## Decision

The four-node basin is the natural location to test a four-parity interpretation under a table-as-directed-map hypothesis. But its bare parity matrix has rank3, so a putative independent four-parity code is mathematically impossible there. The original graph's repeated `49` symbols supply the missing constraint, yielding a uniquely reconstructable source **GF29** sequence. This may suggest a clue architecture, but neither a real cipher operation, a key for an unknown page, a language readout nor a historical destination follows. The relationship is noticed retrospectively and cannot be assigned a meaningful authorship probability without a selection-aware null.

[Read-only original-source CommonJS SFT](../sims/lp2_p50_basin4_hg_parity_rank_sft.cjs) with exact rank/nullvector/reconstruction and a counterexample; [Windows Node22 PASS 44951959938](https://github.com/FlareZ123/liber-primus/actions/runs/44951959938). For source context see [complete table factorization](lp2-grid-complete-gf29-factorization.md), [source 11-cycle graph](lp2-grid-byte-pointer-11cycle.md), and [p32 selected reverse tree](lp2-p32-p50-reverse-tree-depth20-receiver.md).
