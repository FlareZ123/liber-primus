# Agent50 handoff: original p7 polynomial predicts p8 heading fixed points and terminal derivative

**22 Nov 2026, source-only, no deciphered plaintext.** The original five red terminal complete words on physical LP2 p7/JPEG24 have GP29 index-products `[11,26,8,15,2]`. Treat the five numbers in printed order as ascending coefficients of `P(X)=11+26X+8X²+15X³+2X⁴ mod29`. Then:

- `P(X)-X = 2(X-3)(X-4)(X²-8)` in GF29; 8 is a nonresidue, so **only fixed points {3,4}** exist over source-native GF29.
- Physical p8/JPEG25 begins with exactly two red **complete words** of products **[4,3]**, reversed fixed-point order. `P'(4)=17`, exactly the last red p8 heading rune B=GP index17; full heading product `4×3=12` and `12×17=1`.
- Only **1/120** permutations of the five distinct original red coefficients fixes both targets; only **1/22** simple source feature × coefficient-order grammars fixes both, specifically GP0 product in ascending printed order. High-first gives fixed point9.
- `X²-8` defines GF(29²), whose nontrivial sqrt root has exact multiplicative order56. This *might* furnish a 56-page state but no original source selects such clock, the sign or a reversible GP rune consumer.
- Direct pointwise `C=P(plaintext)` is impossible: P's image has 19 symbols, whereas 86 of original p8's 255 rune positions are outside that image. P53→p54's different-shape 12→2 red interface fails first5/last5 analogues.

**Main opportunity:** derive an **author-visible reversible operator** from these p7→p8 red-polynomial instructions, then predict untouched original ciphertext or plaintext. Do not spawn unconstrained polynomial ciphers from the factorization; original instructions do not explicitly name low-first coefficient order. This is substantively independent of the earlier **unselected** GF4/radix59 source-key hypothesis.

[Full reproducible original-source report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-p7-p8-original-red-polynomial-fixedpoint.md) · [Read-only original CJS](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_p7_p8_original_red_polynomial_fixedpoint_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45047067228). Exact structural finding has been added to `results/README.md`.
