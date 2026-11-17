# Red-page extra-tick hypothesis against the p49–51 byte table

**Decision (17 November 2026):** A six-rune ciphertext echo admits a striking 256-clock arithmetic alignment if each intervening red-bearing physical page adds exactly one key tick. The relationship is source-exact, but the clock has **no independent repeated-string support**; a fixed table-byte additive inverse produces nonprose on original unknown ciphertext. No unknown LP2 plaintext or historical key is recovered. This is a postselected candidate with a scoped negative.

[Complete read-only SFT](../sims/lp2_redpage_256_echo_clock_sft.cjs) · [Manual Windows Node22 test](https://github.com/FlareZ123/liber-primus/actions/runs/44026847263)

## Independent original source and one locked hypothesis

The same six consecutive GP29 ciphertext runes, **D-J-U-B-E-I**, appear at LP2 p27 local rune offsets 28–33 (global 6555–6560) and p55 offsets 70–75 (global 12950–12955). Their raw distance is exactly **6395**. The p49–51 table has **256** cells. Five intervening physical pages bear red runes: **p33, p39, p40, p53, p54**. Thus 6395 + 5 = **6400 = 25×256**.

The proposed rule advances the key clock by one additional tick at the **first red rune of each page containing any red ink**. The original red pages at or before p55 are p0, p3, p6, p7, p8, p15, p23, p27, p33, p39, p40, p53 and p54. It ignores second red spans on the same page. The manuscript supplies **no instruction** authorizing this operator; it was noticed after the six-rune match. The experiment freezes this one clock before inspecting any other repeated phrase.

Source: [canonical LP2 ciphertext](../resources/liber-primus/lp2-corpus.json), [red ink annotations linked to original images](../resources/liber-primus/lp2-ink-annotations.json), and [256 original two-digit table cells](../resources/liber-primus/lp2-grid-256.json). The conditional base60 table-to-byte decoding is assumed only for the finite key-consumer test.

## Exact other-string holdout

All nonoverlapping occurrence pairs of exact k-rune repeated substrings were counted across the 12,956 unknown runes. For independent counts, every overlapping subphrase of the focal p27/p55 six-rune repeat was removed. A repeated pair shares 256-byte phase when its clock separation is divisible by 256.

| Rune length | Repeated pairs | Raw phase matches | Red-page phase matches | Independent pairs | Independent raw matches | Independent red-page matches |
|---|---:|---:|---:|---:|---:|---:|
| 3 | 3580 | 19 | 20 | 3576 | 19 | 16 |
| 4 | 129 | 2 | 3 | 126 | 2 | **0** |
| 5 | 6 | 0 | 2 | 4 | 0 | **0** |
| 6 | 1 | 0 | 1 | 0 | 0 | **0** |

The extra-page rule aligns exactly the original discovery instance and its shorter overlaps at lengths four through six; it predicts **zero additional** four- or five-rune matches. It is therefore not independently corroborated.

## Full original table-byte consumer

A direct key is the row-major sequence of 256 table bytes, advanced according to the frozen red-page clock and applied to GP29 as plaintext rune = ciphertext rune **± table byte modulo 29**. The same original undisturbed source is decoded in full for p55 (76 runes) and the separate p40–53 passage (3,008 runes). Two author-visible origins were selected without tuning: global book start and after p49 at the printed table insertion. Both signs are covered.

| Clock origin | Direction | p55 plaintext-candidate IoC | p40–53 candidate IoC |
|---|---:|---:|---:|
| Book start | − | 0.03263158 | 0.03458199 |
| Book start | + | 0.03122807 | 0.03442765 |
| After p49 | − | 0.03649123 | 0.03448226 |
| After p49 | + | 0.03508772 | 0.03447054 |

Original p55 ciphertext IoC is 0.03789474. All four recovered 76-rune strings remain nonprose, and all four independent 3,008-rune strings remain near-uniform. Exact re-encryption and a reversible codec are implementation checks, not evidence of key provenance.

**Research consequence:** Preserve the 6395+5 equality as a bounded, explicitly postselected observation. Retire the **specific red-page tick + row-major byte-additive consumer**. New iterations need an independent first-party instruction for a different red-event clock or value-changing decoder. Previous [stationary p50 key-state gates](lp2-p50-raw-tableau-allsecret-gate.md) cover other table clocks. No established-result synthesis needs revision.
