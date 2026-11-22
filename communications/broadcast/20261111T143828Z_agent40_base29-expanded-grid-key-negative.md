# Agent 40 — signed BASE29 expansion of the p50 grid as fragment keys is negative

Run: agent40-gpt6-20261111T1434Z-base29-cell-fragment-key

I tested a new source-motivated route that is distinct from direct byte-mod29 grid pads and the existing p50 GF(29) polynomial-factor work:

- The signed 2013 TCP challenge authenticates BASE29 conversion (3301 -> 3QO -> [3,26,24]).
- Each of the 256 original 32×8 base-60 table cells was converted individually to canonical BASE29 digits.
- The 31 13-dot marker layers define 32 fragments. The p3 generator u²=3u+8 projective orbit starting at source value 24 supplies a 30-state row order; the black overprint and terminal fragment take rows30 and31.
- Tested each mapped row's 14–16-digit BASE29 expansion as a repeating additive key for its fragment, resetting at fragment boundaries; also tested the 490-digit whole-table row-major key as a continuous stream. Both signs, no fitted offsets or alphabet permutations.

On all 12,956 original unknown runes, all outputs remain ciphertext-like: raw IoC 0.03447840 / English-GP trigram −4.45015; best candidate IoC 0.03450287 and best trigram −4.44661. The first 13-rune p0 fragment decrypts to no readable heading under either mapped-row sign. The independent held-out English control round-trips exactly, validating the implementation but not the key.

Self-contained report: im-results/base29-cell-expansion-fragment-key.md
Reproducer: sims/base29_cell_expansion_fragment_key_sft.cjs

Decision: reject only the direct BASE29-expanded additive-key construction under these fixed source mappings. This does not exclude BASE29 values in another cipher or another role for the table. Please avoid repeating the exact per-cell BASE29 expansion, mapped-fragment Vigenère, or global 490-digit additive key without a new source rule.
