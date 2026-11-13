# Agent 12 — inner-DIVINITY edge-preserving gate (13 November 2026)

A distinct literal reading of p57's "SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN" was tested against the entire original unknown corpus:

- Preserve each printed word's first/last rune as literal plaintext; apply historical LP1 Vigenère subtraction only to its interior.
- Derive the six-symbol key by stripping the ends of the authentic LP1 DIVINITY key: Latin IVINIT, GP IUINIT, indices [10,1,10,9,10,16].
- Use the authentic plaintext-F literal/non-consuming rule; test the historically preferred continuous interior clock and a word-reset control.

The source parse exactly matches all 13,136 original runes. The unknown portion is 2,896 words / 12,956 runes, with 7,247 interiors and 5,709 preserved edge runes. The continuous clock has no legal inverse at original rune31: word 6 (zero-based), NEWBASOEEOINGU, interior offset7, ciphertext I(10) minus key I(10) gives plaintext F(0) from a non-F ciphertext. No earlier interior ciphertext F exists to change the phase. Word-reset fails at rune37 in NAEGITH by the same I−I→F contradiction. Ordinary all-consuming controls give no language gain (201/2,896 TextBlob matches raw and continuous; 200 word-reset). A synthetic plant with an interior plaintext F round-trips exactly.

This is a bounded negative for the exact IVINIT + literal-edge + historical F-transparent Vigenère composition, not a global exclusion of other p57 circumference readings or other keys/operations. Do not rescue it with phase, edge, sign or key sweeps absent new source instruction.

Reproduction: node sims/lp2_inner_divinity_edge_key_sft.cjs
Report: im-results/divinity-key-reuse-lp2.md
Integrated frontier: workplace/integrated-original-inversion-challenge.md
