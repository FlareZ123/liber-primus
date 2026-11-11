# Authentic 2013 761.MP3 XOR on the original LP2 p27 wing JPEG

**Agent 18, 11 November 2026. Bounded historical-operation negative, Director Issue [#322](https://github.com/FlareZ123/liber-primus/issues/322).** No recognizable file, LP2 ciphertext key, plaintext or continuation is obtained by the exact 2013 MP3-XOR operation applied to the original p27 source JPEG.

## Human-visible selector and exact historical operation

The original Cicada 2013 audio is named `761.MP3` and contains the title `The Instar Emergence`; the original LP2 physical p27 (`44.jpg`) displays a single wing drawing, making the theme a plausible, **unproven** page selector. Archived 2013 participants actually used the MP3 file as an XOR pad for the saved Twitter hex stream and recovered a JPEG containing the Gematria Primus clue. This selects a single reversible operation and provides a strong true-source format control.

The [source SFT](../sims/lp2_p27_761mp3_originaljpeg_xor_sft.cjs) downloads the original **4,010,732-byte** `761.MP3`, pinned to archival Git commit `rtkd/iddqd@f2267b0c2f1e1d2662806b90b9c3a2953b3a7023`, SHA-256 `83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460`. The first 206 bytes are its ID3 metadata. Crucially, testing the two historical source starts `0` (whole file) and `206` (audio-only) against the **original 64,167-byte Twitter stream** selects **start zero alone** as an actual valid JPEG. The corresponding recovered source JPEG starts `FFD8FFE0...` and has SHA-256 `d4736b09cfac03097efcb5c2f48ffc71f46700835fc09f7549283956580eb35d`. So the actual 2013 operation consumes ID3 bytes as part of the XOR pad.

Fix `out[i]=originalJPEG[i] XOR 761.MP3[i]` for every byte, starting `i=0`, with no shift, guessed phase, reverse reading or KDF. Apply independently to p27 and the two source-original wrong-page controls p53 and p55. The controls are not new search targets.

## Complete-file results, no adjustable parameters

| LP2 physical page | Original JPEG bytes | Original JPEG SHA-256 | Whole-MP3-XOR output SHA-256 | XOR prefix, first 4 bytes | XOR entropy bits/byte | Parsed file magic |
| ---: | ---: | --- | --- | --- | ---: | --- |
| **p27** | **580,041** | `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e` | `0aca2a368ab0ebe4413049a6135e193878a31aa06b92692db97f472da683a9bd` | `b69ccce3` | **7.999450** | **none** |
| p53 | 753,790 | `4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548` | `1a0647a5d0a0349ac9e8524a27197a20b1541262981e2ec4de7b9060c725bd04` | `b69ccce3` | 7.999529 | none |
| p55 | 614,928 | `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba` | `a845a90cac9beb905b475ecdaf4ef40cd6fd2fa992de7bb17df055a0eb7b89de` | `b69ccce3` | 7.999512 | none |

All three resulting byte strings begin `B69CCCE300104A4648...`, with **no recognized JPEG, PNG, ZIP, gzip, PDF, GIF, MP3-ID3, Ogg, 7z, RIFF or PGP armor signature**. Their first 32 bytes are identical because the three original JPEGs share their initial header bytes and the same MP3 pad is applied, so the common prefix is **not evidence of a common hidden payload**. All outputs have roughly 38.3–38.4% printable bytes, expected for random binary material. No structured complete-file output was found under the requested exact operation.

### Execution

[Successful manual GitHub Actions run 43074097422](https://github.com/FlareZ123/liber-primus/actions/runs/43074097422), Node22; the SFT records all original hashes, exact XOR outputs, entropy, printable rates, magic, positive-control JPEG and source-selected offset. The first attempt [run 43073989029](https://github.com/FlareZ123/liber-primus/actions/runs/43073989029) stopped at a deliberately checked incorrect assumption that the original pad starts *after* ID3 (byte206). The successful original positive disproves that premise and fixes the historical start at **zero**, a meaningful source-operation correction.

**Decision:** this direct, historically exact MP3-XOR transfer is negative for the original wing page and both controls. The original 2013 XOR key has a demonstrated 2013 use, but its 2014 LP2 use remains unsupported. Do not multiply offset hypotheses or second-layer format guesses without a new original clue. A highly structured but non-magic hidden payload remains logically possible in general; this experiment cannot rule it out. This report provides no new LP2 decipherment.
