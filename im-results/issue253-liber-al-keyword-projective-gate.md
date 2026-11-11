# Issue #253 — Liber AL keyword gate

**Disposition:** no source-selected LP2 inverse established. The literal keyword readings below are rejected. The broader III:47 geometric interpretation is not promoted: an earlier Agent 11 incarnation already ran a 10×8 shear gate, and the repository has substantial independent projective/Möbius work.

## Source and human-solve hypothesis

The 2013 *Book of the Law* files in `resources/external/` contain two tempting cues:

- I:24: “my word is six and fifty,” conventionally associated with Nuit and 56.
- III:47: letter shapes and relative positions, a drawn line, a circle “squared in its failure,” and the word *Abrahadabra*.

A solver familiar with the 2013 Cicada material could reasonably try the literal words as keys, and could read the 11-letter *Abrahadabra* as selecting an 11-symbol period or square. The cues do **not**, by themselves, specify Vigenère, Hill, a matrix fill, or a unique line/circle transform. These are bounded tests of the simplest reversible readings, not claims that the verses are proven LP2 instructions.

## Reproducible tests

Input: `resources/liber-primus/lp2-corpus.json`, all 12,956 rune indices on the 55 rune-bearing unsolved pages (the numeric-table page has no rune stream). Arithmetic is mod 29, using the corpus's declared `translit` order. Key clocks run continuously across the concatenated stream; no page resets or tuned offsets.

1. **Vigenère with NUIT** (key indices `[9,1,10,16]`), both additive signs: no readable plaintext; output IoC is approximately 0.03449, essentially the random 29-symbol baseline.
2. **Vigenère with ABRAHADABRA** (key indices `[24,17,4,24,8,24,23,24,17,4,24]`), both additive signs: no readable plaintext; output IoC remains approximately 0.03447–0.03452.
3. **11×11 circulant Hill key from ABRAHADABRA.** Construct the matrix by cyclically shifting the 11 key values row by row. It is invertible over GF(29), so the inverse is well-defined. Both row/column vector conventions decrypt to non-language output; IoC is approximately 0.03445–0.03448, against the uniform 29-symbol baseline (1/29 \approx 0.03448). The reproduction script includes a synthetic encrypt/decrypt round-trip to validate the implementation.
4. **Auxiliary map-key check:** treating the p32 11×11 rune array as a Hill key also gives an invertible matrix but no readable output. This is only a negative control on a tempting 11×11 interpretation; it does not reopen the p32/M7 work.

The direct keyword and matrix readings therefore fail to recover plaintext. Exact outputs and implementation are in `sims/issue253_liber_al_keyword_gate.cjs`.

## What this changes

- Do not continue generic NUIT/ABRAHADABRA Vigenère or keyword-derived 11×11 Hill searches.
- Do not treat the phrases “line” and “circle” as permission for an unconstrained Möbius/projective parameter sweep. Agent 11 memory already records a III:47 10×8 shear test; the shared repository also contains substantial p32/projective/Möbius work.
- The **missing input** is a source-authenticated construction that maps III:47's line/circle language to one specific reversible operation and fixes its parameters independently of the LP2 ciphertext. Without that, further geometry/key searches are underconstrained.

This is a bounded negative result, not an established discovery or a claim that Liber AL is irrelevant. No change to `results/README.md` is warranted.
