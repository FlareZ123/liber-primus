# P55 cicada / 13–17-year periodicity: bounded hypothesis audit

**Classification:** intermediate negative result; not an established clue or cipher.  
**Reproduction:** [periodicity SFT](../sims/lp2_p55_periodical_cicada_periodicity_audit.cjs) · [Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44678846421)

## Why test it

The original p55 image contains a cicada and tree illustration; the canonical transcription has 17 printed words on p55; a terminal red 13-dot mark occurs at rune offset76; and the solved p57 text includes `EMERGE`. A human solver could reasonably notice the periodical-cicada association (13- and 17-year broods) and ask whether the manuscript is pointing to a 13/17-cycle. This is a hypothesis about a possible clue, not evidence that the author intended it.

## Discriminating tests

1. **Marker phase.** The corpus contains 30 red 13-dot markers. Their global rune-offset residues modulo13 are `[2,4,4,2,3,1,2,4,2,2,1,1,2]`; page-local offset residues are `[4,1,2,2,2,4,4,4,1,2,2,1,1]`; page-index residues are `[5,3,5,4,2,1,3,5,0,1,1,0,0]`. There is no single phase or concentrated modulo13 placement. The p55 marker is terminal at offset76, not a recurring 13-step boundary.
2. **Period17 repeating-key signature.** For the 12,956 unknown-page GP29 runes (p0–p55), the period17 mean column index of coincidence is `0.0343653` under a global clock and `0.0345609` when the key phase resets per page. The page-reset period17 profile ranks 13th among periods1–40; the global profile is not among the top15. These values are close to the uniform 29-symbol baseline `1/29 ≈ 0.034483`, not a distinctive period17 peak.
3. **Lag17 echo.** The fixed lag17 equality/MI test likewise shows no standout echo; the page-local equality rate is about3.5% and mutual information is about0.012 bits. This does not support a simple repeated 17-symbol clock.
4. **Period13 context.** The separate p0 13-rune red-title Vigenère-key candidate has already failed its fixed source-selected test; this audit does not reopen or retune it.

## Historical fit: both brood cycles occurred in 2014

The visual association is unusually well-timed, not merely generic: Iowa State University Extension documented 17-year Brood III emerging in Iowa, Missouri, and Illinois in 2014 ([11 April 2014 notice](https://yardandgarden.extension.iastate.edu/article/2014/04-11/cicadas.html)); Mississippi State University Extension records 13-year Brood XXII collections in Mississippi in 2014 ([brood distribution and collection history](https://accessibility.extension.msstate.edu/lawn-and-garden/ornamental-plants/distribution-periodical-cicadas-mississippi)). Thus the p55 cicada/tree, its 17 printed words, the terminal 13-dot mark, and p57 `EMERGE` could intentionally point to the **two 2014 periodical-cicada broods**.

This strengthens the motif as a historical/navigation clue, but still does not specify a cipher operation, key, page address, or extraction. The negative period17 periodicity result remains: do not turn the 13/17 brood clue into a generic repeating-key search. A future test should seek a further source-authenticated 2014 brood or geographic consequence before proposing a cryptographic consumer.

## Interpretation

The historical 2014 brood coincidence makes the visual association more compelling as a navigation/context clue, but it still does not select a cryptographic operation or key. The marker phases are diffuse and the simple global/page-reset period17 Vigenère signature is absent. This rejects the cheap hypothesis that the unknown pages use a straightforward repeating 17-symbol key; it does **not** rule out a narrative use of the cicada motif or a nonperiodic mechanism.

**Do not launch broad period13/17 brute force from this association alone.** A future attempt needs an independent source instruction that specifies the operation and supplies key material or a locked extraction coordinate. Keep this note in `im-results/`, not `results/`.
