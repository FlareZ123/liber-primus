# LP2 page 05: reversed-prefix artifact and OutGuess probe

**Classification:** intermediate artifact finding / bounded negative; no plaintext recovered.  
**Date:** 2026-11-11.  
**Input:** original `resources/liber-primus/05.jpg` from the supplied 75-image collection.

## Artifact structure

The file is 673,066 bytes. Its JPEG end-of-image marker `FF D9` begins at byte offset **600,364**; the remaining **72,700 bytes** are not part of the decoded JPEG.

Let (J) be the bytes before and including that EOI marker, and (T) the 72,700-byte tail. The exact relation is:

[
T^{\mathrm{rev}} = J[0:72{,}700].
]

That is, reversing the tail produces a byte-for-byte copy of the first 72,700 bytes of the same JPEG. It opens as a truncated 2400×3600 JPEG and reproduces the original page's upper image region; it is **not an independent hidden page or new image payload**. The reversed JPEG is truncated because it contains only the prefix of the original JPEG stream.

## OutGuess extraction

A pinned build of the reference C OutGuess 0.4 implementation was used, with its bundled modified JPEG library. The workflow and exact probe are:

- [Probe script](../sims/outguess_lp2_page05_probe.sh)
- [Workflow](../.github/workflows/lp2-outguess-page05-probe.yml)
- [Successful workflow run](https://github.com/FlareZ123/liber-primus/actions/runs/42936210151)
- OutGuess source commit: `24810e14327c2bbeedeaadd3e24491f2a4425c02`

Page **00** is the positive control: default-key retrieval yields a **2,899-byte PGP-signed message**. This confirms that the C extractor build and its JPEG handler work on a known carrier in this collection.

Page **05** produces no valid default-key payload:

| Input | OutGuess result |
|---|---|
| Original `05.jpg` | Seed 41408; claimed length 58,152 exceeds available 47,198 bytes |
| Main JPEG carved through EOI | Same seed/length failure |
| Reversed 72,700-byte tail | Same seed/length failure; available capacity only 10,578 bytes |
| Original `05.jpg` with `-e` error correction | Padding error; no valid payload |

The page-00 positive control also fails under `-e`, while ordinary default-key retrieval succeeds. Thus the `-e` failures do not establish anything about page 05's intended encoding. A separate Go OutGuess port was rejected because it panicked on the known page-00 carrier; it was not used for the result above.

## Interpretation and scope

1. The appended bytes are an exact reversed self-copy of the JPEG prefix, not a recovered message.
2. The reference C OutGuess extractor recovers the known page-00 message but does not recover a valid page-05 payload under its default key, with or without the documented error-correction option.
3. This is **not** proof that page 05 contains no steganographic payload: other keys, a second-message key, or a different embedding system were not tested. No unconstrained password search was attempted.
4. The historical OpenPuff JPEG route remains a separate question; this experiment tested OutGuess, not OpenPuff.

**Decision:** do not treat the reversed tail as a second manuscript page or plaintext. Retain the exact self-copy relation as an artifact fact. Revisit page 05 only if another source clue supplies a concrete OutGuess/OpenPuff key or extraction parameter.
