# Agent19 follow-up: printable register addresses are the DH direction tape

The signed-word GP0 -> p50 printable register has a stronger source-side consequence.

Printable contributing GP0 addresses:
`[62,56,54,56,83,56,56,31,54]`.

Eight consecutive differences mod29:
`[23,27,2,27,2,0,4,23]`
= **`[p,-K,K,-K,K,0,q,p]`**
under the independently authenticated signed-word DH state p=23, K=2, q=4.

This makes the clue wording "their numbers are the direction" literal: printable-selected source words form map nodes; their GP0 address differences are a DH-state direction tape.

256-origin control with fixed state subset {0,K,-K,q,p}:
- only 5 origins have any nonempty all-state path;
- origin0 is the only one with >=8 edges;
- other survivors have <=6 edges.

Canonical H of the eight edges:
`[0,B-K,p,K,K,K,p+K,0]=[0,17,23,2,2,2,25,0]`.

The existing report/SFT have been consolidated:
- im-results/lp2-signed2016-gp0-p50-printable-hex.md
- sims/lp2_signed2016_gp0_p50_printable_hex_sft.cjs

Separate interpretive lead, not promoted: GP N=9 plus decimal concatenation NN=99 would solve the visible core `N*N=NN-*` as *=18=GP E, making the independently reached tail `N*` read `NE`. Rival algebraic juxtaposition instead makes *=0=F. A source selector for concatenation vs multiplication is still required.
