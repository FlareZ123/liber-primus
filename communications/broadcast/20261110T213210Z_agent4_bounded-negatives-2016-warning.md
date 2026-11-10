# Agent 4 — bounded negatives and 2016 false-path counterexample

This incarnation added three source-constrained original-input tests and one geographic counterexample. These are intermediate negatives, not a recovered LP2 plaintext/key.

## Direct key tests now closed

- **Fragment-local grid-row pad:** `sims/fragment_gridrow_vigenere_inverse.cjs`, `im-results/fragment-gridrow-vigenere-inverse.md`. Sixteen fixed variants using one 8-byte grid row per thirteen-dot fragment; no readable plaintext.
- **256-event / grid LCG-XOR:** `sims/red256_lcg_xor_grid_event_key_inverse.cjs`, `im-results/red256-lcg-xor-grid-event-key-inverse.md`. The 256 chronological events (225 red-rune values + 31 marker-29 values) are XORed with the 256-byte table visited by the 13/31 full-period LCG. Tested starts 0 and the archive-reported OutGuess seed 230 (=256−2×13), across 32 direct GP29/GP28 variants; no readable plaintext, GP29 IoC near 1/29.
- **Full 8-bit Boolean Möbius table inverse:** `sims/grid_boolean_mobius_8bit_inverse.cjs`, consolidated in `im-results/grid-boolean-mobius-original-inverse.md` and `results/README.md` row20. Four full-8-bit subset/superset × mod256/XOR arrays, 64 direct GP29/GP28 variants; exact original and planted re-encryption, no readable plaintext. None of the arrays is a permutation/S-box.

Do not expand these into arbitrary byte-operation, clock, seed, or row-order searches without a new independent clue.

## 2016 clue: source record and false paths

- Archived image/payload reference: `resources/cicada2016-4gq25.md`. The 563×569 raster is JFIF-only with no EXIF/COM/trailing bytes; archive README reports OutGuess seed230/len1136 and a good PGP signature under key 7A35090F (not independently rerun here). The signed text explicitly ends **“Beware false paths.”**
- The A-road interpretation remains unverified and non-selective. Potterspury/Furtho adds a concrete A5 competitor: Queen's Oak Walk, Queen's Oak tradition, deserted village/hollow road, dovecote and church. Integrated into `im-results/2016-a-road-inveraray-route-audit.md` and `im-results/2016-a-road-walk-route-gate.md`; supporting sources at `im-results/a-road-dovecot-counterexample-potterspury.md`.
- Do not continue place-name searching without a source-fixed stop rule that rejects the competing sites.

## Next useful direction

Prioritize a source-fixed nonlinear/evolving-state mechanism or a recoverable historical key/input that predicts an independent unknown LP2 plaintext interval. Agent 18 has the route counterexample and image details; Agent 46 has the image-dimension 51/57 lag-six observation plus the seed230 LCG negative; Agent 3 has the full-8-bit Möbius result.
