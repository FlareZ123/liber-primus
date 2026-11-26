# 2013 761.MP3 raw-byte XOR against original LP2 page JPEGs

**Agent 18, 11 November 2026; p2 extension by Agent 2, 15 November 2026; p23–26 image extension by Agent 21, 26 November 2026. Bounded historical-operation negative.** The exact 2013 offset-zero raw-byte XOR produces no recognizable complete-file payload from original LP2 p2, p23–26, p27, p53 or p55. This report tests JPEG receivers only; the distinct packed-GP29 rune receiver is documented separately. No unknown LP2 plaintext, key or continuation is recovered.

## Human-visible selectors and historical operation

Three source-motivated LP2 visual selectors motivate the same narrowly specified test:

- **Physical p2 (19.jpg)** contains an apparent cicada-nymph illustration. The original Cicada 2013 audio 761.MP3 is titled *The Instar Emergence*. This is a plausible cross-round pointer to that exact earlier artifact, not proof of authorial intent.
- **Physical p23–26 (40–43.jpg)** were added as a bounded visual-block extension. Do not describe them as four repeated cicada figures: the block contains mixed corpse/cross/dot and wing motifs. Community art attribution links the mayfly-wing drawings in this block to Figure 4, “Ephemeroptera (mayflies),” on [the original art-source page](https://www.metafysica.nl/wings/wings_14.html), although community inventories differ on the exact LP2 page boundary. This is an insect-art association, not an instruction to use the audio as a key.
- **Physical p27 (44.jpg)** displays a wing drawing, another plausible insect-related selector tested previously.

The historical operation is real: archived 2013 participants used the original 761.MP3 bytes as an XOR pad for the saved Twitter hex stream and recovered a JPEG containing the Gematria Primus clue. The source-pinned audio is **4,010,732 bytes**, Git commit rtkd/iddqd@f2267b0c2f1e1d2662806b90b9c3a2953b3a7023, SHA-256 83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460. Its ID3 metadata occupies the first **206 bytes**.

The original 64,167-byte Twitter stream is the positive control. Testing the two historical starts—offset 0 (whole file) and offset 206 (audio-only)—selects **offset 0 alone** as a valid JPEG. The recovered JPEG has SHA-256 d4736b09cfac03097efcb5c2f48ffc71f46700835fc09f7549283956580eb35d. Thus the source-authenticated operation includes the ID3 bytes.

Freeze the LP2 operation as:

`out[i] = originalJPEG[i] XOR original761MP3[i]`

for every byte from offset zero, with no shift, guessed phase, reverse reading or KDF. This is a source-motivated transfer hypothesis; the historical 2013 use does not itself authorize its application to LP2.

## Complete original-input results

| LP2 physical page | Original JPEG bytes | Original JPEG SHA-256 | XOR output SHA-256 | XOR first 4 bytes | Entropy (bits/byte) | Printable rate | File magic |
| ---: | ---: | --- | --- | --- | ---: | ---: | --- |
| **p2 (nymph)** | **595,338** | 74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34 | 07a3d21513af5e521edf0f416e9ce69cf26cfe477e76add84cb2d0f41daab343 | b69ccce3 | **7.999532** | 0.383748 | none |
| **p23–26 (instar sequence)** | | | | | | | |
| p23 | 484,095 | d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee | 3b709a0107209414e15f50b6d30193c1c801c0a1b20b59f10b5d30af94e35e36 | b69ccce3 | 7.999341 | 0.383887 | none |
| p24 | 654,761 | 62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80 | 48c6b51d8a6ce8b87eb6492ee212b02390c62a01ff6d85ec9b4338e1af188336 | b69ccce3 | 7.999621 | 0.383065 | none |
| p25 | 643,754 | a7d6e597debff4f7c5b3516e1b02ca2e4fa5b37d972f567264ed2ec845013cff | 4e8e8c3021be4156cdb229fba076bd32c5fde906905a986cdf1d989e799d6cc6 | b69ccce3 | 7.999617 | 0.381902 | none |
| p26 | 677,224 | ed88f5fcdca3d1f846538caa8be979aa28cde969eb99c9464d60daa26c1f9af7 | bd773f1a7b6573eaddea6b9a036325b04ab6b2bbebd4d202ab1e22133d740a22 | b69ccce3 | 7.999596 | 0.383684 | none |
| **p27 (wing)** | **580,041** | c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e | 0aca2a368ab0ebe4413049a6135e193878a31aa06b92692db97f472da683a9bd | b69ccce3 | **7.999450** | 0.383764 | none |
| p53 control | 753,790 | 4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548 | 1a0647a5d0a0349ac9e8524a27197a20b1541262981e2ec4de7b9060c725bd04 | b69ccce3 | 7.999529 | 0.384083 | none |
| p55 control | 614,928 | a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba | a845a90cac9beb905b475ecdaf4ef40cd6fd2fa992de7bb17df055a0eb7b89de | b69ccce3 | 7.999512 | 0.383393 | none |

All eight outputs begin B69CCCE300104A4648.... This common prefix is expected because the original JPEGs share their initial header bytes and the same pad is applied; it is **not** evidence of a shared hidden payload. Every output uses all 256 byte values. The tested complete-file signatures include JPEG, PNG, ZIP, gzip, PDF, GIF, MP3-ID3, Ogg, 7z, RIFF and PGP armor; none is present. The p2 output contains 2,740 zero bytes; the p23–26 outputs contain 2,315, 2,722, 2,809 and 2,830 zero bytes respectively. Their entropy (7.999341–7.999621 bits/byte) and printable rates (0.381902–0.383887) remain consistent with random-looking binary data, not a recovered typed payload.

The finite signature test does not exclude a deliberately non-file-structured hidden payload. It does reject the straightforward expectation that this exact XOR produces a directly recognizable complete file.

## Reproduction

The [source SFT](../sims/lp2_p27_761mp3_originaljpeg_xor_sft.cjs) verifies the exact MP3 SHA-256, reconstructs the original Twitter-byte positive control, requires offset zero to be the unique valid-JPEG start, and then applies the same operation to original LP2 JPEGs. It accepts optional physical-page arguments; without arguments it retains the original p27/p53/p55 scope.

The [manual-only workflow](../.github/workflows/lp2-p27-761mp3-originaljpeg-xor.yml) now runs both the original p27/control test and the p2 extension. The p2 execution is [GitHub Actions run 43674748118](https://github.com/FlareZ123/liber-primus/actions/runs/43674748118); the earlier p27 result is [run 43074097422](https://github.com/FlareZ123/liber-primus/actions/runs/43074097422).

The [p23–26 wrapper](../sims/lp2_p23_p26_instar_761mp3_originaljpeg_xor_sft.cjs) fetches the exact pinned 761.MP3, verifies its length and SHA-256, and invokes the same source SFT for physical pages 23–26. It ran through the existing [manual Node 22 runner](../.github/workflows/manual-node22-sft-runner.yml) in [GitHub Actions run 45855584894](https://github.com/FlareZ123/liber-primus/actions/runs/45855584894).

The separate [Agent37 packed-GP29 XOR gate](lp2-2013-audio-direct-packed-gp29-original-xor-gate.md) tests the distinct raw-rune receiver under one-byte and both canonical five-bit byte packings; it is not repeated here.

## Decision

Retire the exact direct whole-file 2013 MP3-XOR transfer to the source-motivated LP2 JPEG targets p2, p23–26 and p27, as well as the p53/p55 controls. Do not add arbitrary offsets, second-layer guesses or new carrier transformations. The insect and wing illustrations may still point to the 2013 Instar artifact for a different, independently selected reason; this test supplies no further operation. No unknown LP2 plaintext, key or final destination has been recovered.
