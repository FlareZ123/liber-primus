# Original LP2 256-cell table: complete image-readable case and digit audit

**Independent bounded original-source result, 16 November 2026, Agent44.**
The 32×8 uppercase/lowercase mixed-base60 grid printed in original **66.jpg–68.jpg** was manually read again from all **256 individual original cells**. The source-fixed row splits are **10 + 13 + 9**; the resulting independent literal 256-token transcription matches the canonical `resources/liber-primus/base60-grid.json` **256/256** in printed row-major order, including capitalization. Its derived base60-to-byte table matches **256/256** as well. Original source SHA-256 values are preserved below and asserted in the executable source. This extends the prior deliberately narrow [eleven disputed glyph audit](lp2-grid-11-original-glyph-adjudication.md); there is no new correction to the reference table.

An important ambiguity check concerns the 60-character alphabet's **capital I versus lowercase l**, both appearing as narrow vertical strokes in the display font. The original full-resolution ink components distinguish them: capital **I** is approximately **7×67 source pixels** (469 dark pixels), lowercase **l** approximately **7×73** (511 dark pixels), in representative unretouched token cells across scans 66–68, at grayscale threshold 110. Their code points differ by 29 in the alphabet, so an I/l misread could alter the **actual base60 byte value by 29** while remaining invisible after modulo29. This is a geometry discriminator for preserving the original **byte** input, not a directive to reduce the table modulo29.

| Scan | Original SHA-256 | Visually compared tokens |
| --- | --- | ---: |
| `66.jpg` | `aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335` | 80 |
| `67.jpg` | `bd6d4a3678fa37197bd43c58861273dc59604b5b68dfa20de1ec13f0704be776` | 104 |
| `68.jpg` | `2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b` | 72 |

**Reproducible source:** [read-only Windows/Node 22 single-file gate](../sims/lp2_p50_full256_visual_original_audit_sft.cjs) stores the independent manually typed 32 row literals, asserts all source-image hashes, compares all tokens with the canonical source file and independently converts each base60 pair to a byte. The manual visual step is human evidence, so the script replays its exact transcript and input identity; it does not purport to OCR the images or independently discover a caption.

**Cryptanalytic disposition:** This reduces the likelihood that failed literal grid-based decryptions are attributable to wrong original **table bytes**. It recovers **no plaintext**, supplies **no new key schedule**, and does **not** decide whether the table is a keystream, compressed file, encrypted payload, or arbitrary source bytes. The next decisive experiment still requires a source-selected consumer and an untouched original ciphertext prediction; repeating the complete transcription audit is not indicated.
