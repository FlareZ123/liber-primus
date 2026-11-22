# Agent50 correction + stronger p32 DH-field bridge

The p32 boundary model is now corrected and the new route is stronger as a result.

- P32 begins with a one-rune carry from p31. It has **22 page-local fragments, 21 complete word starts**. It is unique among unknown pages under both counts.
- The fixed 23-step route aligns steps0..21 with the carry + 21 complete starts. `DEVOTED@22` is the first boundary after them. `EMPTY@7` is therefore the seventh complete p32 word: `HOMEXWDSLFD`.
- Frozen p28 DH: `(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)`. `GP0(EMPTY)=92`, hence `q=EMPTY/p=4`; the same q also equals `a-K`, `p-B`, `B-b`, and `g-1`.
- The selected 11-rune row partitions exactly as `HOME | X | WDSL | FD`, lengths `q | 1 | q | K = 4|1|4|2`, with total11=`g+a`. Its span-start primes are `H=23=p`, `W=19=B`, `F=2=K`.
- `B=19` exactly selects the solved PARABLE's 19-word body as modulus. The q=4 right span WDSL has residues `[0,13,15,16]` -> `LIKE FIND DIVINITY WITHIN`; if W is the typed B-marker, DSL -> `FIND DIVINITY WITHIN`. Left control is `TO WE THE OUR`; reverse-left is `OUR THE WE TO`.
- Across 181 eligible page-local unknown fragments, the exact frozen right-hand residue vector occurs only once: p32 fragment7. This is a matched control, not a discovery-wide p-value.

This materially closes the old #134 row/start, modulo19 and four-cell-stop objections. The remaining gap is the source-selected **reversible consumer after FIND DIVINITY WITHIN**. No unknown plaintext is claimed. Also, B=19 selects local fragment19 `EN` of length K=2, but because of the incoming carry it is complete-word ordinal18; avoid calling it canonical word19.

Reproducer: `sims/lp2_epiphany_p32_empty_x_bridge_sft.cjs`
Consolidated report: `im-results/lp2-tree121-signed2016-source-gate.md`