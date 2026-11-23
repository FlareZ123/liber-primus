# Historic Stage05 × Stage06 maxim transfer to LP2 p37 at source offset 9133

**Agent41, 23 November 2026. Decision: original-cipher negative for the exact fixed two-stage historical transfer; no unknown plaintext or authentic key recovered.** This investigates a single shared-source-route combination not covered by earlier tests of Stage05 alone or with the Stage04 WELCOME key.

## Why a 2014 solver might try this

The decoded 2014 Stage05 seven-column sequence ends in the source-visible numeral **9133** and contains the 36-Latin-letter maxim `TOBELIEVETRUTHISTODESTROYPOSSIBILITY`. An independent original LP2 p37 structural observation places the **fourth red-numbered passage** at zero-based *global unsolved-rune offset 9133* (p37 rune189); that passage has **96 GP29 runes**. Source and manuscript share a numeral, motivating a direct test of the historical Stage05 permutation and its own recovered maxim as the key on that specific original passage.

This is **conditional**: no signed or printed source instructs applying the historical key on that passage. The boundary coincidence and the particular choice to combine these two historic objects were recognized after extensive repository investigation. They cannot establish the creator's intention.

## Frozen reversible test

Read the untouched original `resources/liber-primus/lp2-corpus.json`, concatenate p0–55 original GP29 index streams, and select positions **[9133,9229)**. Source Stage05 permutation for each seven-rune packet is `[0,6,2,5,1,4,3]`; its exact inverse is `[0,4,2,6,5,3,1]`. The direct historical Latin maxim, normalized V→U and GP29-tokenized, contains **35 GP29 symbols**. Apply its zero-phase periodic additive mod29 stream (both directions), composed with each of the two seven-packet permutations (both orders). This gives **eight** frozen complete-prefix decoders, without fitting a key, phase, permutation or target word.

The first **91 runes** of the 96-rune source passage comprise **13 complete seven-rune packets**. The last five are deliberately left outside the test, avoiding an unsupported rule for the non-full historical packet. All eight tests invert and re-encrypt all **91/91** original runes exactly. An independent positive of **91 genuine solved p57 GP29 runes** also round-trips in all eight modes.

| Measurement on 91 original p37 runes | Value |
| --- | ---: |
| Original untouched cipher GP29 IoC | **0.038095238** |
| Highest of eight historical-composite GP29 IoCs | **0.037606838** |
| Authentic solved p57 91-rune GP29 native IoC | **0.060317460** |

The best original composite under IoC uses Stage05 inverse, negative maxim shift, **maxim first, permutation second**. Its first 40 GP symbols are `C U IA D H EA OE H IA EA NG EA P S EA EO D J D M R I T Y O C R C L TH R I B X EA L T W S OE`. It is nonlinguistic; none of the eight variants contains continuous original-format plaintext. The other outputs and numerical measurements are printed by the reproducer.

The exact outcome is **negative for this constrained proposed two-step transfer**, with a demonstrated source-native positive. It is not a theorem about all source-derived keys, irregular final packet conventions, separate unknown transpositions, altered word registers or historically unselected key phases. The underlying 9133 coincidence remains a structural observation requiring independent authored operation before further exploitation.

**Executable reproducibility:** [original-source CommonJS SFT](../sims/lp2_2014_stage05_stage06_maxim_p37_9133_sft.cjs), Node.js 22 with built-ins only, no external downloads. [Windows Node22 source PASS, run 45160415545](https://github.com/FlareZ123/liber-primus/actions/runs/45160415545). Previous separate source-accurate Stage05/Stage04 operations: [historical original-chapter gate](lp2-2014-stage04-source-exact-stage05-seven-column-inverse.md). No change is warranted in the authoritative `results/README.md`, since the status of the 56 unknown pages remains unchanged.
