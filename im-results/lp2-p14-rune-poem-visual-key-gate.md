# p14 mayfly / Old English Rune Poem visual-key gate

**Decision: provisional visual cross-reference only; no plaintext, key, or cipher mechanism recovered.** The p14 illustration gives a plausible reason to consult the Anglo-Saxon rune tradition, but the association does not yet select a reversible operation. Keep this in `im-results/`; it does not change the authoritative `results/README.md`.

## Source observation

The original LP2 p14 image is `resources/liber-primus/31.jpg`. It contains a distinct mayfly-like insect and a branch/tree-like marginal form. Agent28's existing `lp2-botanical-marginalia-template-gate.md` independently describes the insect as mayfly-like, while cautioning that no exact copied source or author instruction was established.

The 29-stanza Old English Rune Poem is a plausible historical reference because the manuscript's GP alphabet is based on the Anglo-Saxon Futhorc. In the Dobbie 1942 text reproduced in the UMass course PDF, the Eoh stanza describes a hard, rooted tree (`treow`); Dæg describes day; and Eolhx describes `secg` (sedge) growing in fen and water. The insect may be read as a day-fly (Dæg), while the marginal branch could be read as Eoh or Eolhx. These are semantic interpretations, not authenticated labels.

The original corpus gives p14 **137 runes in 7 printed lines**. GP prime weights are Eoh=41, Dæg=89, Eolhx=47. Thus two post hoc arithmetic matches are available:
- Eoh + Dæg + p14 line count = 41 + 89 + 7 = **137**.
- Eolhx + Dæg + 1 = 47 + 89 + 1 = **137**.

This is not independent confirmation: the plant identification is ambiguous, more than one rune-pair construction fits 137, and other LP2 page lengths also admit GP-prime pair sums. Do not promote the arithmetic to a key or infer an operation from it.

## Frozen tests

The tests below used the canonical `resources/liber-primus/lp2-corpus.json` and `resources/lp2-transcription.txt`. The reproducible core is `sims/lp2_p14_rune_poem_visual_key_gate.cjs`.

1. **Rune-Poem running key.** Normalized the Eolhx+Dæg stanza bodies and Eoh+Dæg stanza bodies into GP29. Tested one-time additive Vigenère in both signs on p14; Eolhx+Dæg was also tested on p15. Neither key produced language-like output. The complete 29-stanza poem (2,468 GP symbols) was then used as a one-time running key on the first 2,468 unknown symbols, both signs; neither output was language-like.
2. **Prime-indexed book readout.** Used the 29 GP prime weights as 1-based character positions in the normalized complete Rune Poem, and separately as 1-based word positions. The 29 selected letters do not form a phrase; the selected words do not form an instruction.
3. **Affine stream from the visual numbers.** With the Eolhx/Dæg candidate values, tested the fixed p14 stream (K_i=(47i+89)\bmod137), mapped to GP29 by both ordinary residue and proportional scaling, and both additive signs. No readable output.
4. **RSA word blocks.** Treating the image-associated rune primes and page length as an RSA key, tested p14 with ((p,q,e)=(47,89,137)) and ((41,89,137)), and the p22 ship/prone-body alternative with ((73,109,131)). Printed words were converted to base29 integers, reduced modulo (pq), decrypted, and rendered back to GP29. No coherent plaintext emerged.

These are exact negative results for the specified readouts only. They do not exclude every possible use of rune-poem semantics, nor do they establish that the illustrations are cryptographic selectors.

## Research decision

The mayfly/day and tree/sedge association is a reasonable human-solver observation worth retaining, especially because it connects a visible original illustration to a specific historical rune source. But the obvious running-key, prime-index, affine-stream, and RSA word-block consumers fail. **Do not expand this into key/phase/codec sweeps or a general rune-poem search.** Reopen only if an independent original clue specifies a further operation or a second unambiguous illustration-to-rune mapping predicts a withheld plaintext interval.

## References

- Original p14 JPEG: `resources/liber-primus/31.jpg`.
- Canonical source corpus and transcription: `resources/liber-primus/lp2-corpus.json`, `resources/lp2-transcription.txt`.
- Existing p14 insect assessment: `im-results/lp2-botanical-marginalia-template-gate.md`.
- Dobbie 1942 Old English Rune Poem transcription reproduced in the UMass course PDF: https://people.umass.edu/sharris/general/UM791_OE_F2013.pdf (Rune Poem section, extracted PDF lines 2186–2327).
- Reproducer: `sims/lp2_p14_rune_poem_visual_key_gate.cjs`.
