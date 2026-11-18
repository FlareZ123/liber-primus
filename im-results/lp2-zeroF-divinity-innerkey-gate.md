# Zero-F surface inverse followed by authentic DIVINITY

**Agent9, 18 November 2026. Classification: bounded negative for the single independently keyed refinement authorized by Director #1524. No unknown plaintext or new key recovered.**

## Why this refinement is independently motivated

The frozen p50 zero-F moving-exception inverse is unusually specific on original LP2 p0-p55: it restores hundreds of adjacent repeats with only 549 edits, but its output remains nonlinguistic. Director #1524 therefore allowed at most one small independently keyed refinement.

`DIVINITY` is unusually well qualified for that role. It is the exact authenticated period-8 Vigenère key recovered from solved LP1 p3-p4, and solved p57 explicitly says to find the divinity within. This test uses that historical key unchanged rather than learning an inner key from LP2.

The layer order is fixed by the hypothesis: zero-F is the proposed **surface wrapper**, so it is removed first; the historical Vigenère inverse is then applied to the intermediate stream.

## Frozen key and clock

Historical key indices: `[23,10,1,10,9,10,16,26]`.

The key begins at phase0 and runs globally across p0-p55. No phase scan, page reset, reverse key, sign choice or per-section parameter is allowed.

Two key-consumption conventions are tested because both are independently motivated by the authenticated LP1 recovery:

1. every intermediate rune consumes a key symbol;
2. every intermediate ciphertext F is treated as literal and does not consume a key symbol, the natural generalized version of the historical LP1 exceptions.

The exact source-native GP trigram score is trained on the first 240,000 characters of the pinned Shakespeare control using the repository's authenticated ING/IO spelling calibration. Higher scores are more language-like.

## Result

| stream | source-native GP trigram score, nats/rune |
| --- | ---: |
| untouched LP2 p0-p55 | **-4.0912049740** |
| zero-F alone | **-4.0994112979** |
| direct DIVINITY, consume all | -4.1026913211 |
| direct DIVINITY, generalized literal-F | -4.1295639615 |
| zero-F then DIVINITY, consume all | **-4.0990427904** |
| zero-F then DIVINITY, generalized literal-F | **-4.1149236146** |
| clear solved p57 | **-2.4481137055** |

The consume-all inner layer is essentially indistinguishable from zero-F alone and remains slightly worse than the untouched ciphertext. Generalized literal-F handling makes the layered output worse. Neither convention moves the stream toward the clear-p57 language regime.

The corresponding GP29 IoCs are also nonlinguistic: zero-F+DIVINITY consume-all is **0.0345009425**, literal-F is **0.0355168442**, while clear p57 is **0.0627099664**.

A composed positive control encrypts clear p57 under phase-zero DIVINITY and then wraps it with the exact zero-F transform. The tested inverse recovers all **95/95** p57 runes, so the negative result is not caused by layer-order or implementation failure.

## Decision

The one obvious independently authenticated inner key does **not** turn zero-F into a decipherment. Retain zero-F only as a specific structural/surface-normalization observation. Do not continue stacking guessed inner layers beneath it unless a new first-party clue supplies the key or operation independently.

This result does not falsify the zero-F structural association itself, nor does it establish that `DIVINITY` can never participate elsewhere in LP2. It closes the direct global phase-zero historical-DIVINITY inner layer under the two source-supported consumption conventions.

## Reproduction

Run `sims/lp2_zeroF_divinity_innerkey_sft.cjs` under Node 22.
