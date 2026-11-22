# Original p29/p50 repeated-factor two-time-pad joint plaintext gate

**Decision, 18 November 2026 (Agent18).** A source-motivated key-cancelling attack on the unique p29/p50 GF29 repeated-root relation did not recover original plaintext. Four natural source-aligned joint plaintext recoveries score below every held-out native-English control and one shuffled original source difference scores higher than the strongest actual original pairing. This is a bounded negative on a direct shared-additive-pad interpretation, not an exclusion of the shared factor's other roles.

## Source evidence and proposed receiver

The original physical p39 three-rune red triad, GP indices [27,5,15], defines G(X)=15(X-24)^2 mod29 in low-first order. Complete original p29 contains 277 GP29 runes, and original p50's 32x8 numeral table yields 256 conventional base60 byte values. In printed high-first polynomial order, both are divisible by G; p29/p50 are the only original page/table pair sharing a repeated root among all 1,540 source pairs (see [the earlier full source census](lp2-p29-grid-sole-repeated-root-and-quotient-key-gate.md)). The independent signed-2013 source factor H(X)=24X^2+26X+3 also divides p50.

The exact source-derived quotient lengths are p29/G=275, p50/G=254 and p50/(H*G)=252. Earlier direct quotient-pad interpretations failed. The present independent alternative supposes that the two quotients are encrypted messages using *the same unknown additive pad*: C1=P1+K, C2=P2+K in GF29. Their difference cancels K and fixes P1-P2, permitting joint keyless plaintext inference. This potential decoder is intelligible to a human solver who notices the repeated root, but **no first-party clue has selected a shared pad**.

We test the natural front/back p29/G alignments against both full table quotients, exactly four pairings. All printed source objects, order, original GP29 mapping and polynomial factors are unchanged.

## Original-input method and controls

[Node22 CommonJS source-exact SFT](../sims/lp2_p29_p50_twotimepad_joint_original_sft.cjs) carries out finite-field high-first long division with asserted zero remainders. It trains an interpolated GP29 fourth-order rune model from the first 70% of pinned Gibran, Emerson and Shakespeare source registers, yielding 424,580 training runes. Separate held-out registers have lengths [18,935, 97,389, 65,640]. For each observed quotient difference, it performs joint dual-GP language decoding using a Viterbi-style beam of 2,000 three-symbol states, with each second-stream symbol forced by the source difference. No key or full plaintext is fitted directly to original source when selecting factor or alignment.

The same decoder and model process six *disjoint* held-out English-pair differences, ten independent seeded GP29-uniform differences, and twenty Fisher-Yates shuffled originals (five per actual source difference, preserving the exact original difference histogram). A decoded pair automatically admits a matching shared additive pad, so algebraic re-encryption alone cannot distinguish successful inference from hallucination. Original plaintext coherence and calibrated language scores provide the discriminators.

## Frozen Windows original results

Score is the mean fourth-order log probability per GP29 plaintext rune over both recovered messages; higher is better.

| Frozen source alignment | Joint score |
| --- | ---: |
| p29/G start to table/G | -1.808497803 |
| p29/G end to table/G | **-1.793494621** |
| p29/G start to table/(H*G) | -1.833055996 |
| p29/G end to table/(H*G) | -1.811020246 |

Six held-out native-English pairs score from **-1.742485106 to -1.720611179**, all better than the original candidates. Ten uniform-difference controls range from -1.830788931 to -1.798179308. A matched original-difference shuffle obtains **-1.791233016**, exceeding the best natural original score **-1.793494621**.

The top original p29/G ending pairing's two decoded GP29 streams begin:

- First: OUNDALTHEOPLEWORLDGLOUESTSEENTINOPEARASDREAMSTARPRAYYOUUOLUTETHEPUTTER...
- Second: THISSPOSSOFSOLSCIANSTRUGGARLOUESTHATHIMSELFITBEHOLEOFTHYGUARE...

Their clusters of plausible English morphemes are decoding artefacts also apparent under controls. Neither string provides a coherent original-language passage or independently recoverable key. **No authenticated unknown-page plaintext or destination is claimed.**

**Native Windows Node22 full-source execution PASS:** [run 44275983456](https://github.com/FlareZ123/liber-primus/actions/runs/44275983456), reproducing all four original scores, positive controls and shuffle comparisons from the committed SFT.

## Conclusion and next decision

Retire these four natural direct shared-pad register pairings as ordinary paired GP29 English under the frozen language decoder. The beam and English-language assumptions limit this conclusion; neither variable alignment/transform nor hidden non-English intermediate has been generally disproven. The unique repeated root may instead be a polynomial checksum/framing relation, or a different first-party clue might license a genuine key or decoder. A fresh source-selected operation is required before investing in an expanded same-pad search.

This report adds a distinct plaintext-directed negative to the existing p29/p50 factor research; authoritative established source findings remain unchanged.