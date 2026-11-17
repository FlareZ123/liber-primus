# Authentic 2013 Instar title as original LP2 p55 OutGuess password

**Original source test, 17 November 2026: negative for a directly recognizable payload.** The authentic 2013 `761.MP3` title `The Instar Emergence` was frozen as the exact OutGuess password for the terminal unknown-page original JPEG `72.jpg` (physical p55). The source-faithful OutGuess reader runs and its authenticated historical positive control passes. The p55 bytes read through this password are **42,017 high-entropy bytes with a source-forced header, no recognizable file signature, no PGP armor and no readable UTF-8 text**. These bytes do **not** authenticate a secret payload; no unknown LP2 plaintext or key was recovered.

## Human clue and competing interpretation

The already-solved p57 clear text explicitly says “LIKE THE INSTAR TUNNELING TO THE SURFACE,” close to the terminal p55 source illustration. The 2013 Cicada-associated music artifact title `The Instar Emergence` independently supplies an exact, period-available, human-reconstructible password. Cicada historically used OutGuess on JPEGs, so a single direct extraction is affordable. The rival is that these motifs refer to a transformation in the rune manuscript itself, or are thematic without a steganographic instruction.

Prior source test [`lp2_2013_instar_title_mayfly_outguess_sft.py`](../sims/lp2_2013_instar_title_mayfly_outguess_sft.py) applied this exact password to original p14 `31.jpg` and p23 `40.jpg`; neither yielded an authentic payload. A separate terminal p55 probe [`lp2_instar_outguess_single_probe.cjs`](../sims/lp2_instar_outguess_single_probe.cjs) tested the different password `INSTAR`, without the original 2013 title. This test closes the missing exact title × p55 carrier pair, without another password menu.

## Exact run and result

[Source-locked Python SFT](../sims/lp2_p55_2013_instar_title_outguess_sft.py) and [manual dispatch-only workflow](../.github/workflows/agent25-p55-2013-instar-title-outguess-manual.yml) are reproduced in [passing original-source Actions run 44129431709](https://github.com/FlareZ123/liber-primus/actions/runs/44129431709), step `Positive LP1 key and exactly one original LP2 p55 candidate`.

- **Original p55 source** `resources/liber-primus/72.jpg` SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`, 629,181 eligible JPEG coefficient bits.
- **Frozen password** `The Instar Emergence` with exact 2013 title capitalization and spaces; OutGuess historical ARC4 and coefficient-bit stream, no encoding or key variants.
- **Authenticated implementation control** original `03.jpg` / `Default key` yields 31,809 bytes beginning `-----BEGIN PGP SIGNED MESSAGE-----`; 811,192 original coefficient bits.
- **Original p55 output** 42,017 bytes, SHA-256 `c8fbf3429036bef36011523278c0108f82e78323163464035d3d11f21303cdd0`; first 32 bytes hex `1c9721a4def62bb2817cafd4f898f264565c57e3dc357979f34df789a018c822`. Shannon byte entropy 7.995660 bits/byte, printable ASCII fraction 0.383012, no common magic bytes, PGP header absent and UTF-8 unreadable. Crucially, the reader independently reports `header_is_source_forced:true`.

The reader can return random-looking bytes when a key decodes a header value compatible with the image's capacity. This **does not imply a real embed**, especially where the header bits are forced by the carrier. The passing workflow means the experiment executed correctly, not that it found a payload.

## Decision

Retire precisely **2013 title → native OutGuess → original p55 72.jpg → direct encoded object** as an independently verified plaintext/key path. A separately source-authenticated decoding or different carrier can be reconsidered if new first-party instructions select it. Do not extend this result into unbounded password, file-magic, brute-force, or imagined second encryption searches. The source-derived terminal instar cue remains interesting as thematic context, and is insufficient to infer a missing cipher receiver.
