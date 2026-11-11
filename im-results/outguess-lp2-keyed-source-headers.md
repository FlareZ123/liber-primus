# OutGuess keyed-image extraction: 22 corpus-wide source clues plus isolated INSTAR and p0 DH18 candidates, with a source-independent false-header pattern

**Evidence class:** exact source-guided extraction experiments with authentic historical and newly embedded positive controls, plus a local extractor parity check against the pinned OutGuess workflow. Agent 40, 2026-11-10; Agent 8, 2026-11-11; Agent 38, 2026-11-11. **No new LP2 plaintext, authenticated hidden LP2 message, or cryptographic key recovered.**

## Purpose

Historical Cicada puzzles used genuine OutGuess hidden messages. Agent 42's earlier exhaustive default-password extraction from the 58 original second-release JPEGs yielded 16 nominal binary payloads, each 58,152 bytes, sharing seed and header fields, without known message authentication. Instead of treating a nominal successful extraction as proof, the present experiment tests independently source-motivated passwords and asks if the extracted content is a recognizable message, if the metadata varies appropriately, and whether this exact extraction procedure can recover an actual known keyed payload.

## Fixed search space and controls

Original source images: resources/liber-primus/17.jpg to 74.jpg inclusive, **58 images**. For each image, run the historical JPEG6b-based OutGuess extractor using password -k and -r, with 22 exact candidate strings:

- Red-sum page-triangle and historical source numbers: **15, 22, 53, 78, 79, 435, 638, 2262, 3299, 3301**.
- Exact lexical candidates in lowercase and uppercase: **fibonacci, totient, divinity, firfumferenfe, cicada3301, liberprimus**.

These spellings and case choices are hypotheses, not authenticated author-supplied passwords. The finite family comprises **22×58=1,276 independent key/image extraction attempts**. A separate, single-carrier INSTAR hypothesis is evaluated below and is not included in those corpus-wide counts. A result counts as header-consistent only if the process exits successfully, prints an OutGuess 'Steg retrieve' seed and length, and writes exactly that positive number of bytes. A recognizable-output flag requires a standard PGP, ZIP, gzip or PNG signature, or over 97% ASCII printable/whitespace characters in a payload of at least 32 bytes. A message can be intentionally encrypted binary and evade this recognizer; flags are strictly first-pass authentication heuristics.

**Actual embedding positive:** Use the original image 17.jpg as cover, embed the 47-byte message 'AGENT40 OUTGUESS KEYED RED TRIANGLE CONTROL 79' followed by a newline, with password '79'. Extract it using that same password from the *newly generated* stego JPEG. The recovered 47 bytes agree exactly with the original message, SHA-256 762005b411d8e83b361f8196c5240016465dec12029800e74d46ab0413c44ecb. In addition, the historical default OutGuess signature on source image 00.jpg and the known readable note on 08.jpg both extract correctly. This controls real password embedding, retrieval and recognizable content.

## Completed original-input result

The [successful manual GitHub Actions run 42780745513](https://github.com/FlareZ123/liber-primus/actions/runs/42780745513) completed all 1,276 attempts without tooling errors and preserved a SHA-256 digest for every header-consistent payload. The machine-readable [run artifact](https://github.com/FlareZ123/liber-primus/actions/runs/42780745513/artifacts/13746300544) includes every exact source, key, header and outcome.

| Outcome | Attempts |
| --- | ---: |
| Original LP2 JPEGs checked for each source-password | 58 |
| Source-password variants | 22 |
| All keyed extraction attempts | **1,276** |
| Header-consistent, bytes emitted | **977** |
| No header; OutGuess exits under SIGFPE | **274** |
| Nonzero exit status 1, no header | **25** |
| Genuine subprocess invocation errors | **0** |
| PGP/ZIP/gzip/PNG or nearly printable payloads | **0** |
| Exact newly embedded password-79 recovery | **PASS: 47/47 bytes** |
| Genuine historical 00.jpg and 08.jpg default-key controls | **PASS: both** |

## Crucial header invariance and image dependence

Within **each of the 22 candidate passwords**, every original image that yielded an apparently valid extraction reported **the same 16-bit seed and the same payload length**. Examples under source-motivated candidate passwords:

| Password | Header-consistent LP2 images | Reported seed | Reported bytes | Distinct extracted payload SHA-256 |
| --- | ---: | ---: | ---: | ---: |
| 22 | 58 | 63457 | 15481 | 58 |
| 79 | 58 | 48754 | 22897 | 58 |
| 2262 | 58 | 18010 | 558 | 58 |
| 638 | 58 | 50436 | 14020 | 58 |
| 3301 | 24 | 62079 | 54051 | 24 |
| fibonacci | 55 | 55229 | 39302 | 55 |
| totient | 58 | 18608 | 6457 | 58 |
| CICADA3301 | 13 | 15270 | 59519 | 13 |

This pattern holds for **all 22 tested passwords** (the artifact includes the entire fixed-password inventory). The reported seed/length pair is invariant across independent image ciphertexts for a given key, while every emitted payload has a **different digest for that image**. Some wrong-key combinations also trigger invalid arithmetic operations in the old extractor (274 SIGFPE). The pattern indicates header fields are dominated by how this implementation handles the supplied password and original image statistics, making the apparently successful header extremely weak evidence of an authentic embedded message. The 47-byte genuine password-79 plant, by contrast, carries its actual expected short message, not the bogus 22,897-byte LP2 key-79 header.

The previously extracted **16 default-password 58,152-byte blobs** all shared reported seed41408 and length58152, a related anomaly now strengthened by the explicit many-password original-image test. This does not prove every candidate blob is necessarily accidental or that the old images cannot hide deliberately encrypted binary data. It does expose a reproducible systematic false-positive channel that defeats any claim based solely on OutGuess success and claimed header length.

## Independent payload-free synthetic JPEG falsifies the header detector

The missing negative control in the original-image tests was a truly fresh image that **provably could not contain a Cicada-embedded message**. A deterministic C generator created an original-independent **2,400×3,600 RGB JPEG**, pixel values from a fixed xorshift seed and coordinate-dependent gradients, using libjpeg. This synthetic source is produced solely by code in [jpeg_synthetic_control.c](../sims/jpeg_synthetic_control.c), with SHA-256 **4b98fdb604ce7017680c7094a6fc646562987f575241bfdbf94052ee7f88d871**. No payload was ever embedded in that JPEG.

**All eight tested passwords nevertheless yielded a successful OutGuess extraction header with a positive claimed length and an output file of exactly that length.** The eight synthetic-image password/seed/length pairs were: 22→42493/11413, 79→36896/11488, 2262→539/4654, 638→61458/29030, 3301→37842/55907, fibonacci→41905/6631, totient→20470/41448, CICADA3301→21411/12069. These differ from the original LP2 same-password header pairs; the existence of these **eight successful false-positive outputs from a known clean image** is decisive. It proves the implementation's apparent header success is **not sufficient evidence of an embedded payload**.

Separately, a newly embedded 35-byte real message with password79 into the original source 17.jpg yielded the correct genuine 35-byte output and a distinct real header (seed242, length35). Thus the same extractor detects authentic embeds and generates false headers on known payload-free images. This comparison eliminates the possibility that merely matching claimed lengths under OutGuess is an authentication method.

Executed source and complete positive/negative outputs: [synthetic detector](../sims/outguess_header_synthetic_probe.cjs), [completed manual GitHub Actions run 42782492897](https://github.com/FlareZ123/liber-primus/actions/runs/42782492897), [machine output artifact](https://github.com/FlareZ123/liber-primus/actions/runs/42782492897/artifacts/13745984522). The source JPEG and historical LP2 images remain unchanged.

## Additional isolated INSTAR candidate on the moth-bearing p55 image

A separate source-derived candidate was tested after the 22-key corpus gate. Agent35's exploratory all-20-word p57 map reaches **INSTAR** from both source markers under both signs, although neither modulus nor sign is source-fixed (the reported permutation diagnostic was 604/100,000). The p55 illustration supplies an independent moth/instar semantic association. This is a plausible human clue, not an established key derivation. To avoid a dictionary sweep, only uppercase `INSTAR` was tested, once, against original physical p55 carrier `resources/liber-primus/72.jpg`.

Both positive controls passed:
- The authentic 2016 image/payload pair recovered exactly **1,136/1,136 bytes**, SHA-256 `fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010`.
- A planted 49-byte INSTAR-keyed message embedded into original `17.jpg` recovered exactly **49/49 bytes**, SHA-256 `f147781416c565405ccb732fe815df0b139a94286b7092c7c44e7bd9fbf24f48`.

The original p55 extraction exited successfully and reported seed **34964**, length **7553**, with exactly 7,553 bytes written. Its SHA-256 is `ad2fb27dbcb510a3028cbb37330b55a84b5a57984f61289f593fb353f6870f08`. It had no ASCII-armored PGP, ZIP, gzip, PNG, PDF, or nearly printable structure. The Unix `file` heuristic labels the leading bytes as an OpenPGP secret key, but this is a false signature: `gpg --batch --list-packets` exits **2**, reporting impossible packet versions 129, 195 and 104 and invalid packet CTBs `2a` and `7c`. The payload is therefore a malformed binary false positive, not an authenticated OpenPGP object. **INSTAR is rejected for this carrier.**

Reproduction: [first path-triggered run 42979839636](https://github.com/FlareZ123/liber-primus/actions/runs/42979839636) and [rerun 42982773161 with automated `file` and GnuPG packet diagnostics](https://github.com/FlareZ123/liber-primus/actions/runs/42982773161); [latest exact result artifact](https://github.com/FlareZ123/liber-primus/actions/runs/42982773161/artifacts/13838505557), [single-probe script](../sims/lp2_instar_outguess_single_probe.cjs). The script verifies both controls before testing the one original carrier, preserves the exact candidate bytes and summary, and now records the `file` heuristic plus `gpg --batch --list-packets` exit/diagnostics. GnuPG's exit2 and malformed packet versions are therefore reproducible from the artifact, not only a local manual check. No case, phase, carrier, or dictionary sweep was performed.

## Additional isolated p0 DH18 candidate (negative)

The p0 red-heading DH hypothesis derives shared secret **18** and server public value **17**. The natural one-carrier continuation is therefore the exact OutGuess passphrase `18` on original `resources/liber-primus/17.jpg`; this tests the proposed public-value-17 → image-17 selection without a corpus sweep.

A local extractor was implemented from the pinned OutGuess 0.4 retrieval path. Its JPEG coefficient bitmap and ARC4/iterator extraction reproduce the existing workflow artifact byte-for-byte on the independent LP2 p6 candidate: original `23.jpg`, password `ATXBMGIASBXEO`, seed 2437, length 29,681, SHA-256 `a2c894e1014e6b572cb60c27348a6be71841f093ea5e716242622423ba878f06`. This is an **implementation-parity control**, not a plaintext-positive payload; that p6 output is itself an unrecognized false-positive candidate. The comparison artifact is [workflow run 43022439918](https://github.com/FlareZ123/liber-primus/actions/runs/43022439918), [artifact 13855552680](https://github.com/FlareZ123/liber-primus/actions/runs/43022439918/artifacts/13855552680).

On the frozen p0 candidate, original `17.jpg` with password `18` gives:
- Bitmap: 714,405 eligible coefficients / 89,301 bytes.
- OutGuess header: seed **22,352**, length **16,260**; exactly 16,260 bytes are emitted.
- Payload SHA-256: `567d527ecfec0c5a8bce5b423b3b11a64adf35f4660c6ff2eecc67cff5ac70aa`.
- No recognized ZIP, gzip, zlib, PDF, PNG, JPEG, SQLite, or ELF signature; `file` reports generic data.
- `gpg --batch --list-packets` exits **2**: “no valid OpenPGP data found.”
- After the duplicated four-byte OutGuess header, entropy is **7.989703 bits/byte** and printable fraction **0.382997**.

The output is high-entropy, unrecognized binary, closely matching the known false-positive p6 artifact (tail entropy 7.993021; printable fraction 0.383361) and the payload-free synthetic-JPEG false-header controls above. A positive OutGuess header and exact output length are not authentication. **Reject the direct “DH secret 18 is the OutGuess password for image 17” continuation**; retain the DH arithmetic only as an intermediate hypothesis. This does not prove that p0 contains no other steganographic payload or exclude a separately source-selected second layer, but no such layer is specified by the current evidence.

Reproduction:
- `python3 sims/outguess_extract.py resources/liber-primus/23.jpg ATXBMGIASBXEO --expect-sha256 a2c894e1014e6b572cb60c27348a6be71841f093ea5e716242622423ba878f06`
- `python3 sims/outguess_extract.py resources/liber-primus/17.jpg 18 --output /tmp/p0-dh18-outguess.bin`
- The helper follows the pinned [OutGuess `jpg.c`](https://github.com/resurrecting-open-source-projects/outguess/blob/24810e14327c2bbeedeaadd3e24491f2a4425c02/src/jpg.c), [`iterator.c`](https://github.com/resurrecting-open-source-projects/outguess/blob/24810e14327c2bbeedeaadd3e24491f2a4425c02/src/iterator.c), and [`arc.c`](https://github.com/resurrecting-open-source-projects/outguess/blob/24810e14327c2bbeedeaadd3e24491f2a4425c02/src/arc.c); it requires a C compiler and libjpeg development headers.

## Scope and research consequence

No original LP2 hidden PGP-signed message or readable nonempty content was recovered under the 22 corpus-wide source passwords, the separate INSTAR p55 test, or the isolated p0 DH18 / image17 OutGuess candidate. Their consistent extraction headers are not cryptographic authentication. A hidden payload using other password derivation, key material, image encoding, nested encryption or unrelated DCT steganography remains untested. The source-derived finite password search therefore gives a **bounded negative with a useful detection discriminator**, rather than a proof of no source-image steganography.

Potential next source-image attack should demand exact recovered material and a distinguishing planted control, preferably a signed message or a demonstrated LP2 key with genuine decipherment. Further unrestricted passphrase guesses against these header artifacts have weak expected value without a new independent key clue; the p0 DH18 → OutGuess password18 path is now closed.

## Reproduction

- [Exact CommonJS source-key extractor and planted controls](../sims/outguess_lp2_keyed_probe.cjs). The 22-key corpus gate remains unchanged. For one exact externally derived candidate, set `LP2_OUTGUESS_PASSWORD` to that password; optionally set `LP2_OUTGUESS_SOURCE_IMAGE` to one original JPEG index17–74. In this single-key override mode the script preserves **every nonempty extraction output**, including unrecognized or header-inconsistent bytes, as `candidate_0_<page>.bin`, and records its status, header fields, size, hash and path in `rawCandidates`. The default 22-key run retains its prior artifact behavior.
- [Isolated INSTAR probe and controls](../sims/lp2_instar_outguess_single_probe.cjs).
- [Local source-faithful retrieval implementation](../sims/outguess_extract.py) and [JPEG coefficient bitmap helper](../sims/outguess_bitmap_dump.c). The p6 parity command above matches the workflow artifact exactly; the p0 DH18 candidate is now locally tested and closed. The existing OutGuess workflow remains manual-dispatch-only and exposes `custom_password` and optional `custom_image` for future independently selected candidates. It uses pinned maintained OutGuess commit 24810e14327c2bbeedeaadd3e24491f2a4425c02.
- [Complete successful run](https://github.com/FlareZ123/liber-primus/actions/runs/42780745513) and [preserved exact machine output](https://github.com/FlareZ123/liber-primus/actions/runs/42780745513/artifacts/13746300544).
- [Independent full-corpus direct-pad inversion of the 16 default-key binary arrays](outguess-lp2-original-directpad.md) tested a different possible use and also found no original plaintext.
