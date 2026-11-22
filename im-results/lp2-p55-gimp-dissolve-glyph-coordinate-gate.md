# Original p55 glyph-coordinate GIMP Dissolve key consumer

**Agent8, 18 November 2026. Classification: exact original-input spatial-key negative.** No unknown plaintext, key or destination recovered.

[Single-file reproducer](../sims/lp2_gimp_dissolve_glyph_xy_key_sft.cjs) | [PASS, Windows Node22 original-input CI](https://github.com/FlareZ123/liber-primus/actions/runs/44363826456)

## Intended solve path

An original illustration on clear LP2 p57 visibly uses stippled pixels; independent earlier analysis reconstructed the GLib-based GIMP Dissolve field. Its generator begins with MT19937 seed 314159265, generates 4096 row seeds, then initializes one generator per pixel row. Earlier key tests used sequential raw values and row-major field prefixes. This distinct test samples the two-dimensional field at the **actual glyph coordinates** on terminal p55, whose 76 source rune rectangles are known. If the original artwork suggests a spatial key, the corresponding script can recover p55 directly with no dictionary search or fitted key. The source supplies no explicit sampling instruction, so the operation is a hypothesis.

## Original inputs, fixed consumers and controls

Original image: resources/liber-primus/72.jpg, 2400 x 3600, SHA256 a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba. The original rune indices exactly match the 76 separately established positions in resources/liber-primus/lp2-p55-source-glyph-coordinates.json.

Historic field generator: GLib 2.2 MT19937, seed 314159265, 4096 row seeds, each pixel sampled through g_rand_int_range(0,255). The exact prior GLib controls pass: first four row seeds 3721122731, 618219707, 807213306, 3144837749; first row first 16 values [87,10,191,6,133,152,5,71,134,199,88,235,186,95,169,95].

Only three original image rectangle points were sampled: upper-left ink-box corner, integer center and lower-right ink-box corner. Their pixel values modulo29 form the 76-shift pad. Test both additive signs and either direct GP29 additive encryption or predecessor-cipher feedback, with zero initial feedback. This gives **12 source-fixed decoder cases**. No phase, password, image rescale, origin shift or PRNG family was fitted.

Every candidate successfully encrypts and recovers all 76 original clear p57-prefix runes in a positive control, and re-encodes the original p55 ciphertext exactly, establishing implementation correctness.

## Results on the 76 unmodified p55 ciphertext runes

| Anchor | Direct minus | Direct plus | Feedback minus | Feedback plus |
| --- | ---: | ---: | ---: | ---: |
| Top-left | 0.031579 | 0.034737 | 0.034035 | 0.034737 |
| Center | **0.038246** | 0.031228 | 0.028070 | 0.033684 |
| Lower-right | 0.031930 | **0.038246** | 0.036140 | 0.034737 |

Entries are decoded GP29 index of coincidence. Native clear p57 first-76-rune control has IoC 0.059649; original unknown p55 has 0.037895; theoretical uniform baseline 1/29 = 0.034483. All twelve complete decrypted streams are printed by the reproducer. Best two cases remain nonlinguistic, with no coherent sentence or authenticated 76-rune key.

Example center/direct/minus transliteration: LTHHSTHSPLIAYTHAITRIAFJFEOAENGUIAIWFAEAEUAESGEFJAENAEPUNUPEOCTHBJEAJAEBLYUXEOEPGFCUFEAWEPRTEDEY.

The 76-rune IoC is noisy and by itself cannot exclude other languages or unusual registers. The demonstrated conclusion is a failure of these **twelve exact reversible source-coordinate operations to produce recognizable native plaintext**. A different pixel coordinate convention or a transformed key remains logically possible, but no original instruction currently selects one.

## Decision

This is a previously untested spatial consumer of a documented source-generation field, distinct from sequential GIMP key searches. It recovers no LP2 unknown plaintext. Further unrestricted x/y offset or cipher-phase scans are not warranted without a new human-visible first-party selector. All 56 original unknown LP2 pages remain unsolved.
