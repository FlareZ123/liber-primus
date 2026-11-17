# LP2 p32's 11×11 original rune array as an invertible terminal-seam Hill key

**Agent 1, 17 November 2026. Classification:** one source-shaped, bounded negative for a fully reversible direct matrix consumer. No original unknown-page plaintext or authored key is recovered.

## Proposed human solve path and independent rival

The original LP2 p32 page has **121** ciphertext runes and an illustration of a blurred tree; the original p55 repeats similar tree art in sharper form. Source-geometry work already considered an **unprinted** 11×11 reflow of p32. The terminal p55 has **76** runes, and its immediately succeeding p56 first ciphertext rune makes **77 = 7×11**, also the 7-rune seam whose tail appears verbatim at p27. Thus p32 could hypothetically supply an 11×11 matrix for seven terminal 11-rune vectors. Ordinary square-matrix inversion over the 29-rune GP field is the minimal concrete value-changing operation to test.

**Strongest objection:** neither the 11-column p32 reflow nor the p55/p56 seam crossing different published ciphers is instructed by an authenticated first-party message. Any random 11×11 GP29 matrix is usually invertible and any seven 11-rune vectors admit a formal inverse. Consequently neither a nonzero determinant nor a round trip is cryptanalytic success.

## Source-frozen direct test

Use the unchanged `resources/liber-primus/lp2-corpus.json` original p32 121 indices as a row-major 11×11 matrix **M over GF29**; use original p55 76 indices followed by just original p56 ciphertext rune zero as seven complete 11-component column vectors. No guessed key, crib, transposition, offset, inserted null, F skip, or altered source byte enters this candidate. Ordinary Gaussian elimination gives

- **det(M) = 8 (mod29)**, so a unique inverse exists.
- Four familiar conventions are M, M⁻¹, Mᵀ and (M⁻¹)ᵀ, each applied independently to the seven original 11-rune blocks.
- Source-native method-positive: encrypt the first 77 *actually clear* original p57 runes with M and decrypt with M⁻¹; all **77/77** GP indices are recovered exactly. The same inverse recovers all 77 original ciphertext indices after forward re-encoding.

| Operation on untouched p55/p56 seam | GP29 scaled IoC (29×IoC) | First GP transliteration |
| --- | ---: | --- |
| M | 0.95147 | `DAEBJOAFBBOOCOIGIULN` |
| M⁻¹ | 1.11005 | `TMLHIIDFAOELEIAIBIEO` |
| Mᵀ | 1.00103 | `IAJDXDPOWOEAENBEODA` |
| (M⁻¹)ᵀ | 1.15960 | `DPGEDFPPCXHNGCNGBEAG` |

The 77-rune clear-p57 original-source positive has scaled IoC **1.73445**. Each unknown-page candidate remains around random-symbol frequency and all four complete outputs are nonlinguistic; none yields an address, typed object, instruction or author-selected plaintext. These are diagnostics for this frozen direct matrix family, without a familywise statistical claim.

## Decision

**Retire the direct p32 Hill11 key on the original 77-symbol p55/p56 seam.** This does not disprove the p32 art relationship, alternate source-specified grid usage, nonlinear coding, a secret intermediate register, or operations on other sources. The experiment supplies neither the missing source-to-operation rule nor plaintext, so do not widen its four tested conventions into an arbitrary matrix-key hunt.

[Exact read-only Windows-compatible CommonJS reproducer](../sims/lp2_p32_treehill11_p55_seam_original_sft.cjs). Other relevant established source work: [p32 geometric selector gate](lp2-p32-compass-53-primary-source-selector-gate.md), [the terminal 76+180 grid-stencil gates](lp2-terminal256-original-inner-separable-gates.md), and [the Parable 77-rune seven-key gate](../sims/lp2_p55_parable_base29_7key_receiver_sft.cjs).
