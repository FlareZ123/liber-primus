# LP1 physical page 05: embedded square, reversed-prefix structure, and OutGuess probe

**Classification:** established source-artifact structure plus bounded OutGuess negative; no LP2 plaintext recovered.  
**Date:** 2026-11-11; structure consolidated 2026-11-15.  
**Input:** original \`resources/liber-primus/05.jpg\` from the supplied 75-image collection. This is **LP1 physical page 05**, not LP2 page 05: files 00–16 are LP1 physical pages and files 17–74 are LP2 pages 00–57. The workflow and script retain legacy \`lp2\` filenames for run-history continuity.

## Complete artifact structure

The file is 673,066 bytes and partitions exactly as:

- \`A = data[0:336353]\`: 336,353-byte valid 2400×3600 JPEG.
- \`M = data[336353:336713]\`: 360-byte middle block consisting of two newline bytes followed by 358 ASCII hexadecimal characters.
- \`T = data[336713:673066]\`: 336,353-byte suffix satisfying \`T == reverse(A)\`.

The 72,700 bytes after the JPEG EOI at offset 600,364 are only a slice of this reversed suffix. They are not an independent payload. The EOI marker at 600,364 lies inside the reversed copy; treating it as the boundary of a separate appended file is incorrect.

Hex-decoding the 358-character body of \`M\` yields a 179-byte object (SHA-256 \`82c135148b6cf85e9b550afdbc6204be075ff67717356a8ae18b76f9cc3af5fa\`). The documented nibble-swap and decimal-digit reversal recover the exact third 2014 magic square. This is already consolidated, with its source derivation and other consumers, in [the authoritative LP1 p05 artifact report](lp1-page05-reversed-prefix-anomaly.md) and [the extraction SFT](../sims/lp1_p05_magic_square_nibble_inverse_sft.cjs).

## OutGuess extraction

A pinned build of the reference C OutGuess 0.4 implementation was used, with its bundled modified JPEG library. The workflow and exact probe are:

- [Probe script](../sims/outguess_lp2_page05_probe.sh)
- [Workflow](../.github/workflows/lp2-outguess-page05-probe.yml)
- [Successful workflow run](https://github.com/FlareZ123/liber-primus/actions/runs/42936210151)
- OutGuess source commit: \`24810e14327c2bbeedeaadd3e24491f2a4425c02\`

LP1 physical page **00** is the positive control: default-key retrieval yields a **2,899-byte PGP-signed message**. This confirms that the C extractor build and its JPEG handler work on a known carrier in this collection.

Page **05** produces no valid default-key payload:

| Input | OutGuess result |
|---|---|
| Original \`05.jpg\` | Seed 41408; claimed length 58,152 exceeds available 47,198 bytes |
| Main JPEG prefix \`A\` carved through its EOI | Same seed/length failure |
| Reversed suffix \`T\` | Same seed/length failure; available capacity only 10,578 bytes |
| Original \`05.jpg\` with \`-e\` error correction | Padding error; no valid payload |

The page-00 positive control also fails under \`-e\`, while ordinary default-key retrieval succeeds. Thus the \`-e\` failures do not establish anything about page 05's intended encoding. A separate Go OutGuess port was rejected because it panicked on the known page-00 carrier; it was not used for the result above.

The recovered 179-byte square was separately used as an OutGuess key against the repeated-moth LP2 images in [the p05-square/moth SFT](../sims/lp1_p05_square_outguess_moth_sft.py). That test did not recover a valid hidden message. Do not conflate that key experiment with the default-key p05 carrier probe above.

## Interpretation and scope

1. The full file is \`A || M || reverse(A)\`; the reversed suffix is a self-copy, while the middle block encodes the third historical 2014 magic square.
2. The reference C OutGuess extractor recovers the known page-00 message but does not recover a valid page-05 payload under its default key, with or without the documented error-correction option.
3. This does **not** prove that page 05 contains no steganographic payload: other keys or a different embedding system were not tested. No unconstrained password search was attempted.
4. The historical OpenPuff JPEG route remains separate; this experiment tested OutGuess, not OpenPuff.

**Decision:** do not treat the reversed suffix as a second manuscript page, and do not treat the 72,700-byte post-EOI slice as a separate payload. Preserve the 179-byte central-square extraction as an established artifact fact. Revisit page 05's steganography only if another source clue supplies a concrete key or extraction parameter.
