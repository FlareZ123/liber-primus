# 2012 opening-image payload: byte-exact extraction and LP2 transfer decision

**Current status (23 November 2026):** the 2012 opening image and both payload channels have been recovered from two pinned community mirrors, and the historical OutGuess extraction has been independently reproduced with pinned OutGuess 0.4. The exact historical OutGuess read operation on source-selected LP2 p55 was also tested: it reports a false-looking header and terminates with SIGFPE before writing any payload bytes. Separately, the downstream book-code phrase yields a 75-symbol GP29 candidate matching the 75 non-carry runes on p55; direct substitution/Caesar tests fail, so a boundary-changing relation remains unproven. **The OutGuess transfer is rejected; the separate p55 crib candidate is handed to the existing boundary-reader investigation.**

## Original image and source limits

The image is `1CcV1.jpg`, originally referenced as `http://i.imgur.com/1CcV1.jpg`. The byte-preserving copies used here are pinned to:

- [`scream314/cicada3301`](https://github.com/scream314/cicada3301/tree/10733feb487bb8beb9966d534727ee5897aa54fc/assets/2012), commit `10733feb487bb8beb9966d534727ee5897aa54fc`, file `assets/2012/1CcV1.jpg`.
- [`cijhho123/cicada3301`](https://github.com/cijhho123/cicada3301/tree/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/2012), commit `d360ad97d39c4719e42dc88b0cbbb81ed54aa02c`, file `2012/additional media/images/1CcV1.jpg`.

The two files are byte-identical: **29,279 bytes**, SHA-256 `870353b8fbe4d1dd83fdbfc61b07d80213bab035526d3e5fd6a43f7d77db1ead`, Git blob SHA-1 `467a24a6f70bb589a994fd73ee37b6f9c7a827f8`. This agrees with the independent artifact comparison in [`Dukotah/cicada3301` REPORT-A.md](https://github.com/Dukotah/cicada3301/blob/fd13fe88a0bfef13f07c03c666b831e9ddae7f2d/corpus/A-primary-artifacts/REPORT-A.md), pinned to commit `fd13fe88a0bfef13f07c03c666b831e9ddae7f2d`.

**Authentication boundary:** the direct 4chan upload has not been recovered as a separately hashable binary, and this first image has no preserved Cicada PGP signature. The two matching copies are byte-pinned community mirrors, consistent with contemporary reports, not a cryptographically authenticated 4chan download. This matches the existing [local first-image source record](../resources/historical/cicada2012-first-image-source.md). The alternate 27,517-byte copy documented in the local source record is not a substitute: it lacks the 61-byte trailer and has a different JPEG encoding.

## Channel 1: the post-EOI Caesar URL

The 29,279-byte mirror has **61 bytes after the JPEG EOI**:

`TIBERIVS CLAVDIVS CAESAR says "lxxt>33m2mqkyv2gsq3q=w]O2ntk"`

The explicit Caesar reference selects a uniform ASCII-byte shift of −4 on the quoted string, producing:

`http://i.imgur.com/m9sYK.jpg`

This is not an alphabet-only Caesar rotation: punctuation and digits shift too. The destination image is the known duck decoy; its text directs the solver to “guess” how to get the message “out”, leading to the separate OutGuess step. The original first-image record and the exact byte-level trailer are documented in the pinned external report above.

## Channel 2: reproduced OutGuess payload

The historical walkthrough [scream314/cicada3301/2012.md](https://github.com/scream314/cicada3301/blob/10733feb487bb8beb9966d534727ee5897aa54fc/2012.md), pinned to the same `scream314` commit, records the exact command:

```sh
outguess -r 1CcV1.jpg 1CcV1.jpg.out
```

No password or additional flags are supplied. The extraction was reproduced in [workflow run 45288446664](https://github.com/FlareZ123/liber-primus/actions/runs/45288446664) using the repository's existing manual runner and OutGuess 0.4 source commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`.

The run independently downloaded both pinned mirrors and verified that:

- both original JPEGs are byte-identical and match the expected 29,279-byte SHA-256;
- both archived `.out` files are byte-identical;
- the 61-byte post-EOI trailer is exact and its ASCII −4 transform yields the URL above;
- `outguess -r` reports **29,049 usable bits**, **seed 228**, **length 535**;
- the newly extracted 535 bytes exactly equal both archived `.out` files.

The extracted payload SHA-256 is `7dbf268b1b356527cf4a2dc105c0dd1f6d2d703291dda24dd9e98e22851d6f40`. Its exact bytes are preserved in [`2012-first-image-1CcV1-outguess.txt`](2012-first-image-1CcV1-outguess.txt); the executable reproducer is [`2012_first_image_outguess_reproduction.cjs`](../sims/2012_first_image_outguess_reproduction.cjs).

The output is a **book-code instruction**, a Reddit destination (`r/a2e7j6ic78h0j`), and 76 line:character pairs. The Reddit/book identification and subsequent phone-number extraction are downstream stages of the 2012 chain; they are not extra bytes hidden in the JPEG trailer and should not be conflated with the OutGuess output.

A tempting LP2 overlap is that this payload has 76 coordinate entries while unknown p55 has 76 runes. This is a count-level match, not a selected transfer: the 2012 syntax is line:character addressing into a separately identified book, whereas p55 is a 76-rune page, not a 76-line reference text. Neither the 2012 payload nor an LP2 instruction says to map these coordinates to p55 rune positions, turn them into a GP29 key, or use them as a permutation. No source-defined operation connects the two 76-element objects.

## LP2 transfer candidate: 75-symbol p55 crib

The recovered OutGuess payload contains 76 line:character coordinates. The pinned 2012 walkthrough resolves the book code to the exact visible message:

\`CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT\`

This is **76 characters including spaces**. In GP29 transliteration, the \`TH\` in \`THREE\` is one rune, so the phrase has **75 GP29 tokens** (59 letter-runes plus 16 spaces).

The canonical LP2 transcription has **76 runes on p55**. Its first rune, \`ᛝ\`, completes a word carried over the p54/p55 page boundary. Removing that one carry-in leaves **75 p55 body runes**. Thus the book-code phrase and p55 body have an exact 75-token length alignment. This is stronger than the superficial “76 coordinates versus 76 runes” count match.

The alignment is not yet a plaintext identification:

- The phrase has 17 words; p55 has 16 complete printed word groups after the carry-in. GP29 word lengths are `[4,2,2,2,4,5,6,3,3,4,4,4,2,4,3,2,5]`; p55 body word lengths are `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Merging any one adjacent phrase-word pair does not make these vectors agree.
- A one-to-one monoalphabetic substitution over the 75-token alignment fails.
- The sorted symbol-frequency distributions do not match under any of the 29 possible single-rune assignments for the 16 spaces; this also rejects a simple transposition plus monoalphabetic substitution.
- No constant GP29 Caesar shift maps the phrase's letter-runes to the p55 body.
- Bounded source-derived consumers were tested (Agent36, 23 Nov 2026): the 75-token GP29 phrase as a direct Vigenère/OTP pad with all 29 space-symbol mappings and both additive signs always produces first word LAMT (C−K) or UXUIA (C+K); the literal phone digits 2143909608 as a repeated GP29 key (forward/reversed, both signs) do not yield coherent text. The 76 book-code coordinate pairs were reduced through nine simple line/character maps (line, character, sum, difference, product, and four small linear combinations), both 0-/1-based origins, both signs, and all 29 space values. No exact coordinate-derived key matches the 75-rune body or 76-rune full page; best partial agreements were 9/75 and 7/76 after 1,044 comparisons per alignment, not evidence after selection. These bounded negatives reject only those explicit consumers; a general Vigenère/OTP search or arbitrary coordinate mapping remains unjustified without a source-selected schedule.

The exact source selector is therefore **p55's 75-rune body length after its documented one-rune page carry**, and the candidate operand is the 75-token GP29 rendering of the 2012 book-code message. The remaining uncertainty is the reversible mechanism that could account for the changed word boundaries and symbol mapping. A source-constrained boundary-changing reader is the cheapest next discriminating test; Agent37, who is already investigating that problem under [#2278](https://github.com/FlareZ123/liber-primus/issues/2278), has been sent the exact crib and the falsification results.

This candidate should not be promoted to \`results/\` or described as plaintext unless a fixed, reversible mechanism decrypts the original p55 ciphertext and independently validates beyond this one phrase. The earlier no-transfer conclusion is superseded by this exact-length alignment, but the transfer remains **unproven**.

## Exact OutGuess transfer test on original p55

The source-selected receiver is the original May 2014 Stage11 file `55.jpg`, pinned to commit `6c3421a4d245596e403c88e037509d162a2afd17`. Its identity was verified in the reproduction run: **614,928 bytes**, Git blob SHA-1 `ee00cd34013fe3a5c6808650abb6d3206b6f1b13`, SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`.

Using the same pinned OutGuess 0.4 source and exact historical read command, with no password or extra flags:

```sh
outguess -r 55.jpg 55.jpg.out
```

The 2012 positive control again succeeds (29,049 usable bits, seed 228, length 535; exact 535-byte payload hash matches). On p55, OutGuess reports **629,181 usable bits**, **seed 41,408**, **length 58,152**, then terminates with **SIGFPE**. The output file is created but contains **0 bytes** (empty-file SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`). It contains neither the 2012 payload nor the book-code phrase.

Reproduction: [workflow run 45292635452](https://github.com/FlareZ123/liber-primus/actions/runs/45292635452); [exact SFT](../sims/2012_outguess_transfer_lp2_p55_sft.cjs). This is a negative result for this exact OutGuess 0.4 extraction on original p55, not proof that every possible image-steganography method is absent. It is consistent with the existing LP2 writer-fingerprint analysis.

## 2012 telephone number as an OutGuess password: original LP2 all-page gate

The recovered 2012 book-code message explicitly supplies telephone number **2143909608**. Treating it as a cross-round OutGuess password is one source-derived candidate, not a password search.

The source-faithful OutGuess 0.4 receiver in sims/outguess_extract.py and sims/outguess_bitmap_dump.c was run against original archive images 17–74 (all 58 LP2 JPEGs). The same receiver passed authentic LP1 controls under the historical default key: image 00 recovered a 2,899-byte PGP-armored message, and image 08 recovered the 140-byte “For those who have fallen behind” text.

All 58 LP2 images have the already-documented all-one first 1,024 eligible-coefficient bits, so their encrypted OutGuess headers are source-forced. Under password 2143909608, the 54 completed extractions all decode the same forced header 9566a29b (little-endian seed 26,261; length 39,842). Four archive images (31, 49, 73, 74) terminate with “iterator adapted to zero skip modulus.” None of the 54 outputs has a file signature, PGP armor, or near-printable content; entropy is 7.994522–7.996296 bits/byte and printable fraction 0.377491–0.387631. All 54 share the same first 32 output bytes, another consequence of the forced prefix.

LP2 p55 is archive image 72. Its 39,842-byte output has SHA-256 6e8bd6218148d795044bb9ed80b0e127254849cfdb9373e02a89c5f4e3e8b19c, entropy 7.994522 bits/byte, printable fraction 0.383264, and no recognized magic or PGP armor. It is not a recovered payload.

Reproduction: [bounded source-transfer SFT](../sims/2012_bookcode_p55_transfer_sft.py). This rejects only the literal 2012 telephone number as an OutGuess 0.4 password on these original LP2 JPEGs; it does not prove that every steganographic method or key is absent.

**Decision:** reject transfer of the historical OutGuess extraction operation to p55. Reject the literal 2012 telephone number as an OutGuess password for the original LP2 image set, and reject the bounded direct phrase-pad and coordinate-pad consumers above. Preserve the separate 75-token book-code phrase as an unresolved, source-derived crib candidate and hand it to the existing #2278 boundary-changing-reader investigation; it is not established plaintext. No generic OutGuess page sweep, password dictionary, arbitrary coordinate-to-rune mapping, or broad Vigenère/OTP key sweep is justified without a new first-party selector. No unknown LP2 plaintext, authentic LP2 key, complete inverse, or final Cicada destination has been recovered.

**Research result class:** exact historical payload recovery; negative original-p55 default-key OutGuess transfer; negative 2012-phone-number OutGuess transfer across all 58 LP2 originals; bounded direct key-consumer exclusions; unresolved 75-token p55 crib candidate with direct substitution/Caesar/transposition exclusions.
