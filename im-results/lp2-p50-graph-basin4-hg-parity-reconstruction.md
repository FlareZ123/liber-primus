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

## Selection-aware residue-preserving graph null (Agent44, 21 November 2026)

The exact **252+4 graph split** alone is weak evidence: it occurs in **2,309/200,000** randomized source-equivalent tables. The more discriminating original observation is **simultaneously** selecting a four-node component **and** obtaining a rank-three matrix for its four original H×G parity columns. The original table has both; the earlier algebraic reconstruction above is unchanged.

A new, read-only original-source test uses a strict conditional null. Keep **every one** of the original 256 table coefficients modulo29 fixed, thereby preserving **all four exact H×G parity checks** and the original source's quartic divisibility. Also keep the exact complete original **256-byte multiset**. For each replicate, shuffle full byte values only among positions having identical preserved residues, then recompute the *entire directed pointer graph* and choose any four-node component **only if** the resulting graph has exactly the source's two component sizes 252 and 4. The HG column matrix is always evaluated at these newly graph-selected addresses, without giving the control the four source positions.

The preregistered-in-code deterministic 200,000-shuffle null (xorshift32 seed `0x4f7e3301`) produced:

| Exact feature in a shuffled table | Occurrences / 200,000 | Frequency |
| --- | ---: | ---: |
| Exactly two pointer components of sizes 252 and 4 | 2,309 | 1.1545% |
| 252+4 and the four selected HG parity columns have rank three | **115** | **0.0575%** |
| Previous joint property and at least three small-component outgoing bytes are identical | **37** | **0.0185%** |

Within the 2,309 shuffled 252+4 cases, **115/2,309 = 4.98%** have rank three; the remaining **2,194** have full rank four. A separate positive control conjugates the original directed graph by a random permutation of all 256 addresses and recovers the expected relabeled four-node component, testing the graph classifier independent of the original labels.

This is a meaningful **conditional structural rarity** for the two already chosen source operations: the rank deficiency is much rarer than the basin-size coincidence itself, even after preserving the table's polynomial codeword and byte inventory exactly. It strengthens the case for investigating whether a puzzle-selected table **readout** uses both structures. It is **not** an authorship probability or a recovered key. The graph interpretation, quartic H×G choice, degree/rank focus, and triple-fan-in property emerged amid many prior candidate operations and were not independently preregistered by the original author. No plaintext-selecting action is found.

[Selection-aware null SFT](../sims/lp2_p50_basin4_hg_selection_null_sft.cjs) · [Windows Node22 PASS 44961749904](https://github.com/FlareZ123/liber-primus/actions/runs/44961749904). The SFT tests source H×G divisibility, authentic graph and rank, a genuinely relabeled graph-positive plant, and every exact conditional-null count.

## Decision

The four-node basin is the natural location to test a four-parity interpretation under a table-as-directed-map hypothesis. But its bare parity matrix has rank3, so a putative independent four-parity code is mathematically impossible there. The original graph's repeated `49` symbols supply the missing constraint, yielding a uniquely reconstructable source **GF29** sequence. This may suggest a clue architecture, but neither a real cipher operation, a key for an unknown page, a language readout nor a historical destination follows. The residue-preserving selection-aware null above establishes an unusual joint graph/algebra feature, yet the historical candidate-operation selection remains retrospective, so its Monte Carlo frequency is not an authorship probability.

[Read-only original-source CommonJS SFT](../sims/lp2_p50_basin4_hg_parity_rank_sft.cjs) with exact rank/nullvector/reconstruction and a counterexample; [Windows Node22 PASS 44951959938](https://github.com/FlareZ123/liber-primus/actions/runs/44951959938). For source context see [complete table factorization](lp2-grid-complete-gf29-factorization.md), [source 11-cycle graph](lp2-grid-byte-pointer-11cycle.md), and [p32 selected reverse tree](lp2-p32-p50-reverse-tree-depth20-receiver.md).
