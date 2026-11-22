# P57 outer-ring `LP3lRA#` on original LP1 page 03: one native OutGuess receiver

**Decision (22 November 2026):** The literal seven-byte key `LP3lRA#`, independently noticed at the original LP2 p49–51 32×8 table's clockwise outer perimeter positions 13–19, does **not** recover a recognizable original OutGuess payload from **the earlier LP1 03.jpg**. The byte-level extraction is consistent with a false OutGuess seed/length header also produced by a known empty synthetic JPEG under the identical key. This closes **only this exact historical LP1 carrier/password pairing**. All 56 unknown LP2 pages remain undeciphered.

## Independent clue and frozen operation

Original solved LP2 p57 has a red seven-rune `PARABLE` heading immediately followed by 13 red dots; its text instructs shedding circumferences. Original p49–51's 32×8 byte-like sexagesimal table has exactly 76 perimeter cells, matching the 76 p55 runes. Reading the perimeter clockwise from top-left, **one-based bytes 13–19** are original printed values `[76,80,51,108,82,65,35]`, literal ASCII `LP3lRA#` (whole-grid row-major indices `[47,55,63,71,79,87,95]`). This is a *candidate* decoding convention, with unproved author selection.

The `LP3` prefix has two plausible page references. Prior [source test](../sims/lp2_p57_13dot_p50_lp3len7_p3_outguess_original_sft.cjs) had already tested the original **LP2 physical p3 = 20.jpg** with the same OutGuess password and failed. The older **LP1 page 03 = 03.jpg** remains a distinct period-available source target, independently bearing the solved phrase `LIKE THE INSTAR`, which reappears in the solved LP2 p57 PARABLE. [Agent6's source comparison](https://github.com/FlareZ123/liber-primus/issues/2242#issuecomment-7079920794) supplied this semantic target identification. No revision of the bytes, password length, source image, or key was allowed after observing extraction.

Use the original 03.jpg bytes from [archive](../resources/liber-primus/README.md), build [pinned historical OutGuess](https://github.com/resurrecting-open-source-projects/outguess/commit/24810e14327c2bbeedeaadd3e24491f2a4425c02) and execute [single-file source reconstruction + receiver](../sims/lp2_p57_lp3_lp1p03_outguess_source_sft.cjs). The runner invokes the existing controlled [keyed OutGuess probe](../sims/outguess_lp2_keyed_probe.cjs) once with `LP2_OUTGUESS_PASSWORD=LP3lRA#` and `LP2_OUTGUESS_SOURCE_IMAGE=3`. It verifies exact original p57 annotation, table 32×8 geometry, the seven source bytes, original file existence, OutGuess embedding/extraction of a known keyed payload, and authentic default-key retrieval from LP1 `00.jpg` and `08.jpg`.

## Original result and the false-header control

[Windows-independent Ubuntu/Node22 execution PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45028998805); raw 33,152-byte output and full summary retained as [workflow artifact](https://github.com/FlareZ123/liber-primus/actions/runs/45028998805/artifacts/14756977427) (artifact retention 30 days).

| Original LP1 03.jpg with key `LP3lRA#` | Measurement |
|---|---:|
| OutGuess return status | 0 |
| Reported seed | 36,792 |
| Reported extraction length / actual bytes | 33,152 / 33,152 |
| SHA-256 of output | `7603d7ccbf508d97845465d12190cc0f1b83ed8a250cdc34093c2212ff41a194` |
| Printable ASCII fraction | 0.381938 |
| Shannon entropy (bits/byte) | 7.994725 |
| Recognized PGP/ZIP/gzip/PNG/ASCII payload | none |

Critically, a deliberately generated **payload-free** libjpeg image under the **same exact key** also produces status 0, internally matching fake header and output length 18,830 bytes, with no recognizable payload. Its false output SHA-256 is `61208e8af33bd135ede69200cc6a3d5b759b960c4d4503fb35408464435809c4`. A matching OutGuess seed/length alone cannot authenticate hidden data. The authentic original default-key controls and the planted keyed control succeeded.

**Conclusion:** No usable LP1-03 external key or plaintext emerges. The `LP3` local structural coincidence may still have a different meaning; this finite negative rejects one author-plausible target and historical tool pairing without another blind password search. No adjustment of the authoritative [results synthesis](../results/README.md) is warranted.
