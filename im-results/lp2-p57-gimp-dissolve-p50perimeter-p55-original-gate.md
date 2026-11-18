# Original LP2 p57 GIMP Dissolve -> p50 perimeter -> p55: direct source candidate

**Decision (18 November 2026):** Independently reconstructed the old GIMP Dissolve generator at the p57 isolated dots, then used its deterministic threshold field in one narrowly specified original-p55 inverse. Neither of the two GP29 additive signs recovered readable plaintext or an authenticated key.

## Source clues and tested original input

The independent [SECRA study, 15 October 2026](https://secra.tech/research/liber-primus-strongest-findings/) identified a strong historical GIMP Dissolve fingerprint on the clear p57 mayfly; its [machine-readable evidence](https://secra.tech/research/liber-primus-strongest-findings/evidence/index.html) reports a fixed image alignment (x+4,y−9) and four isolated dot cells (53,250), (44,256), (41,265), (57,269). [Historical GIMP implementation](https://mail.gnome.org/archives/commits-list/2017-February/msg00316.html) initializes 4,096 row-specific random seeds from the literal software seed 314159265. That seed is a software default, **not a creator-authenticated LP2 key**.

I separately reproduced all four dot thresholds as zero using native GLib's seeded Mersenne Twister and g_rand_int_range(0,255). The portable JS test reproduces the first twelve GLib row seeds, the four zero dots, eleven raw range outputs and the first twenty 32×8 perimeter samples. This validates the generator used in the next experiment without attempting to refit the image.

The original LP2 numerical grid has 32 rows and eight columns, with exactly **76 perimeter positions**. Original LP2 p55 has exactly **76 GP29 ciphertext runes**. An original user-visible instruction connecting these two equal-sized registers to the p57 GIMP threshold image has **not** been found.

## Frozen receiver, results

Read the 32×8 perimeter in clockwise sequence starting northwest: eight top-row cells, 31 right-edge cells, seven bottom-edge cells, 30 left-edge cells. At each grid cell (col,row), generate the GIMP threshold at (col+4,row−9), reduce it modulo29 and use it as an additive key for the corresponding complete original p55 rune. Evaluate both signs: P = (C − K) mod29 and P = (C + K) mod29. Both inverse results reencrypt exactly to all 76 original runes. This is an implementation invariant, not a key identification.

| P55 readout | GP29 IoC | Original plaintext recovered |
| --- | ---: | --- |
| Unmodified ciphertext | 0.0378947368 | No |
| GIMP key subtraction | 0.0329824561 | No |
| GIMP key addition | 0.0315789474 | No |

The two complete candidate GP-transliterated outputs are included in the [read-only, dependency-free Node22 CommonJS reproducer](../sims/lp2_gimp_p57_p50perimeter_p55_original_sft.cjs). They do not form meaningful original-page prose; no independent instruction, alphabet or key is recovered.

## Scope and next decision

This **rejects the two literal additive consumers at the single frozen clockwise 76-position projection**. It does not exclude other GIMP-based puzzles, steganography, or other ciphers. The historical transparent-F prime-totient decoder on p56 has a different structure and is neither reproduced nor contradicted by this experiment. Randomly changing the grid origin, adding rotations, or trying many rekeyings without another original clue would produce unconstrained source-key hunting; avoid that branch. Strong next evidence would be an original source-selected mapping from the artwork to a data register, or a coherent untouched unknown-page plaintext.
