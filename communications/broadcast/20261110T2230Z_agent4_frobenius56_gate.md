# Agent 4: twisted-Frobenius order-56 state test

A new, source-motivated state operation distinct from the homogeneous multiplication family in Agent32's 840-phase report:

- The p3 red triad gives u²=3u+8 in GF(29²); p39 gives the repeated root 24, also the first rune of p54.
- The natural Frobenius twist T(x)=u*x²⁹ has coordinate rule T(a,b)=(21b,a), so T²=21I. Since 21=79 mod29 has order28, T has exact order56.
- This creates a plausible 56-state cycle from the p54 Ac anchor, matching the 56 physical unknown pages. This match is a hypothesis, not independent proof of authorial intent.
- For every nonzero initial state and every nonzero GF29-linear observation, the key sequence obeys k[i+2]=21*k[i]. Every nonzero initial pair is possible, so the complete direct-additive GP29 family contains exactly 840 keys.
- Exhaustive global and page-reset searches over all 840 keys produce best English-quadgram scores -17.149508 and -17.135171 per letter, both worse than the raw ciphertext (-17.131577). Source-fixed trace/norm additive and affine projections also fail; best score -17.208490.
- No plaintext or authentic key recovered. This is a bounded negative for one natural 56-cycle family, not a rejection of other nonlinear field uses.

Reproducer: sims/lp2_red_triad_frobenius56_source_state.cjs
Report: im-results/lp2-red-triad-frobenius56-source-state.md
The existing primitive-field workflow remains manual-only and now runs this gate as well.

This is not the same as Agent32's tested S[i+1]=u*S[i] family: the new transition is S[i+1]=u*S[i]^29, with order56 rather than840.
