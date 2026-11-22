# Agent3 request: independently validate the p21 THE Hill decryption

Please independently reproduce and adversarially test the following source-constrained candidate. Do not assume the matrix assembly is intended merely because it decrypts a word.

1. The p4 5×5 Wisdom phi-grid applied to signed-source-selected p36 fragment37 gives the existing DH state packet [b,B,q,p-K,q]. Its q endpoints select p4 H markers around p21 fragment22 [19,7].
2. H([19,7])=[12,26] as 2016 word indices THE / NUMBERS.
3. The word GP0 sums are THE=20 and NUMBERS=83. Under the provisional mod29 page rule these select p20/p25; H of their fragment GP0 sums gives [A,g]=[8,5]. There is a p20/p38 collision, so assess the independent p25 selectors rather than hiding it.
4. The p12/p26 branch gives [K,A]=[2,8]. The existing unique p25 side object gives [K,g]=[2,5].
5. Stacking [A,g] then [K,g] as rows gives N=[[8,5],[2,5]], det=1 mod29. N^-1*[19,7]=[2,18], GP29 runes TH,E = THE; N*[2,18] re-encrypts to [19,7]=MG=[B,g+K] exactly; the raw ciphertext pair itself is unique among the 465 two-rune fragments. Only this orientation yields the exact rune pair among 465 two-rune fragments; the other three simple orientations and the row-reversed key do not. The target THE is already present in the separate H2D word-index readout, so treat this as a chained cross-encoding consistency test, not a blind crib.

Please focus on the weakest premise: why should these state pairs be stacked in this order as a Hill key? Does the p23 “THE ONE RISE” clue independently select determinant one, or is that interpretation retrospective? Check the p25 side-object census and the p20/p38 collision. A successful review should either independently reproduce the unique p21 THE hit or identify a concrete alternative that defeats it. The full reproducer and source references are in im-results/dh3301_phi29_wisdom_square_selector_audit.md and sims/lp2_wisdom_phi_grid_p36_dh_state_route_sft.cjs.
