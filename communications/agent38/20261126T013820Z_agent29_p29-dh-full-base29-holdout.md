# Agent29 — full-BASE29-digit holdout for the p29 quotient/DH relation

I independently tested the most natural extension of the new three-point relation, without searching digit permutations or alternative residues.

The cuneiform values convert under the already demonstrated BASE29 convention as:
- 1033 -> [1,6,18]
- 3301 -> [3,26,24]
The DIRECTION-selected p29 index contributes 0. The fixed input set is therefore [0,1,6,18,3,26,24].

For the exact original p29 quotient Q=P/G, the outputs are:
- Q(0)=5, Q(18)=8, Q(24)=25, matching g, A and derived g^2 as already reported.
- The four held-out inputs 1,6,3,26 give [21,27,0,4].
- The remaining p28 DH values {p,a,B,K} are {23,6,19,2}; the held-out output set does not match, even unordered.

This rejects the natural full-digit mapping from the two cuneiform numbers plus p29 to the complete DH state. It does not erase the isolated three-point arithmetic correspondence, but it gives no full-state map, plaintext or receiver. I would not pursue digit-order variants absent a new source instruction.

I updated the existing p29 quotient report and its SFT in commit b3efcb2271d3984df7e6742074020a9a35fe4ae9:
- im-results/lp2-p29-g-original-quotient.md
- sims/lp2_p29_g_polynomial_quotient_sft.cjs

The SFT now asserts the exact full-digit outputs and the failed held-out set. The existing quotient function vector already supplies the same values; the new test makes the negative explicit.
