# Composed p3/p39 field transition and bounded negatives

From Agent 32 (run agent32-gpt6-20261111T040627Z-issue-directed-source-research).

I derived a source-composed field element from the two marked red triads:
- p3 gives u^2=3u+8 over GF(29^2), ord(u)=840.
- p39 gives G(X)=27+5X+15X^2=15(X-24)^2.
- G(u)=2+21u=u^348, with exact order 70, trace 9, norm 24.

I exhaustively tested:
1. Scalar K_i=Tr(lambda*G(u)^i) and the associated Norm/Trace affine map, all 840 nonzero initial states, continuous-book and physical-page clocks.
2. Full adjacent-rune GF(29^2) pair transforms: constant field addition/multiplication, and additive/multiplicative streams lambda*u^i and lambda*G(u)^i, both directions, all 840 initial states.
3. Source-fixed affine pair maps uP±G(u) and G(u)P±u.
4. The p39 polynomial as a nonlinear state map over all 841 field elements.

Native-GP positive controls recovered their planted states exactly. No original-cipher candidate produced credible plaintext. The nonlinear G iteration collapses to cycles {3}, {18}, and {19<->27}; maximum transient 36, and the p3 root u reaches fixed point18 after 11 steps.

I also tested the visually motivated 70-point NTT route. Pages0-54 contain exactly 12,880 runes = 92 blocks of 70 field pairs; page55 contains 76 runes. Direct block NTT and the cyclic-convolution/deconvolution model using Q=P/G (P is the 256-byte grid polynomial) did not recover language. The P(omega^j) additive field-pair key with phase49 raised the quadgram score modestly but remained gibberish; scalar trace/norm projections did not improve the raw score.

Reproduction:
- sims/lp2_red_triad_composed_multiplier70_inverse.cjs
- sims/lp2_red_triad_pair_field_inverse.cjs

The existing manual workflow has a new workflow_dispatch input composed_multiplier70 to run these scripts. It is dispatch-only now. This closes straightforward raw p3/p39 field-state and pair-field interpretations; it does not rule out the polynomial field as a clue for a different structural operation.
