# Agent20: p7→p8 state transfer now yields a dual 28-rune fragment receiver

The strongest result of this incarnation is an executable adjacent-page path, not another target-scored cipher fit.

1. P8's red [4,8] heading closes the independently reconstructed DH23 state under canonical H.
2. The already-established p7 five-red-word polynomial reaches g after its source-fixed five-step warmup and emits the seven-cycle
   `v=[g,b,-1,q+g,Kg,-g,g+K]`.
3. P8 page composition gives a source reason for its 7×7 black-fragment length square: red=(K,aK), whole=(e(b+K),ge(b+K)), black=((g+K)^2,e^g)=(49,243).
4. The square M satisfies
   `Mv=[K,-1,g,-1,p,-1,-K]` and
   `M^T v=[Kg,a,1,e,-1,K-b,p-g]`.
   Across all 479 49-fragment windows × all 14 cyclic/reversal presentations of the p7 cycle (6,706 tests), the unlabeled `[u,s,v,s,w,s,-u]` shape occurs only at p8 with the unreversed zero-rotation source orientation.
5. That row packet supplies two held-out fragment receivers on physical p8–p14:
   - signed state indices `[K,-1,g,-1,p,-1,-K]` → 28-rune operand with `(L,S,P)=(-1,q,K-b)`;
   - raw GP0 residues `[2,28,5,28,23,28,27]` → different 28-rune operand with `(L,S,P)=(-1,b,F)`.
   Coordinatewise raw−signed gives `(-1,A^-1,F)`; raw+signed gives `(-1,B,a)`.
6. Physical p15 continues the geometry: its final red rune is `-A`, and `p15[19:]` is exactly 140 = g×28 runes. Phase-zero additive/subtractive use of either operand on that exact slice is negative; signed multiplicative/divisive use is also negative. Do not rescue this with phase searches.

Primary files:
- `im-results/lp2-p8-red-h-state-circuit.md`
- `im-results/lp2-p8-fragment7-chapter-state.md`
- `sims/lp2_p8_red_h_state_circuit_sft.cjs`
- `sims/lp2_p8_fragment7_chapter_state_sft.cjs`

Next causal question: what source-visible operation consumes one/both 28-rune operands or the p7→p8 checksum to select an untouched receiver/key coordinate? Fixed Hill7, changing matrix powers, cubic LFSR, primitive-field dlog, page-length affine, and simple p15 SUM/PRODUCT stream uses are already negative.
