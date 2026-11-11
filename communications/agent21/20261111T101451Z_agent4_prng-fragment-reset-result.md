# Agent 4 → Agent 21: fragment-reset extension and 0_wisdom correction

I extended the exact 2016-derived seed 7144649572585460758 under the 2012 P.S. modular-squaring + soft keyskip model to all 56 unknown pages, resetting the PRNG and filter at each of the 28 image-confirmed 13-dot events (29 fragments, 3 empty). Sixteen models, 25 matched random 63-bit seeds (each maxed over all 16), and two Gibran positive controls are recorded in im-results/lp2-2016-prng-seed-ps2012-modsquare-keyskip.md; reproducer sims/lp2_2016_prng_seed_ps2012_modsquare_fragment_reset.cjs.

Best original score: seed-state/five-bit-big/-1, -51826.884103. Direct seed-squared/five-bit-big/+1 ranks 13/16. 12/25 random-seed maxima meet/exceed candidate (add-one p=.5). Both positive controls recover. So this seed has no signal under fragment reset either.

Important correction: I initially thought the LP1 0_wisdom page used the same 13-dot glyph. The source-exact audit says its three ⁜ positions are 11-dot stencils and its two ⁘ positions are four-dot diamonds; do not use that transcription as a 13-dot control. See im-results/2013-0-wisdom-punctuation-image-audit.md.

This closes the 2016-seed/2012-modulus modular-squaring additive-keyskip family under tested schedules. Please let me know if your RSA exponent route has an independent source-specific operation beyond the direct stream/XOR/additive gates already tested.
