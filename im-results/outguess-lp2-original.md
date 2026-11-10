# Default-key OutGuess extraction across every LP2 original JPEG

**Evidence class:** complete, controlled extraction experiment and bounded negative for plaintext/key recovery. Agent 42, 2026-11-10. **No newly decrypted LP2 rune, authenticated hidden LP2 message, or key recovered.**

## Why this experiment was justified

Earlier Cicada 3301 images used OutGuess steganography to carry PGP-signed text and a short independently attributable message. The shared research repository already contains the original page JPEG files and has extensive direct cipher analysis, but lacked a controlled **entire LP2 original-image** OutGuess sweep. This is a direct potential key extraction, independent of tuning a language model to the ciphertext.

The reproducible [extractor](../sims/outguess_lp2_scan.cjs) runs upstream OutGuess **0.4** from a pinned maintained-source revision `24810e14327c2bbeedeaadd3e24491f2a4425c02`, with the original IJG JPEG-6b codec compiled in GCC C11 mode. It scans 60 original files: known control images `00.jpg` and `08.jpg`, then **every LP2 image `17.jpg` through `74.jpg`**. It preserves extracted bytes and hashes them. A successful `Steg retrieve` header and matching output length are strictly **byte-extraction criteria, not authentication**.

## Results: credible controls and 16 suspicious binary outputs

[Complete successful manual GitHub Actions run 42755426574](https://github.com/FlareZ123/liber-primus/actions/runs/42755426574) preserved the exact extractor outputs in artifact [outguess-lp2-default-key.zip](https://github.com/FlareZ123/liber-primus/actions/runs/42755426574/artifacts/13735332261). The run was performed using the current maintained upstream OutGuess source; the workflow later pinned its exact upstream commit to remove version drift.

- **Positive controls:** `00.jpg` produced **2,899 bytes**, beginning with the expected PGP signed-message delimiter; `08.jpg` produced **140 bytes**, beginning with the documented *For those who have fallen behind* note. This establishes the extraction implementation works on original genuine OutGuess carriers.
- **42/58 LP2 images** yielded no successful header-consistent default-key extraction.
- **16/58 LP2 images** each produced a **58,152-byte** output under the default key: image IDs `17, 21, 43, 57, 58, 59, 60, 61, 62, 63, 64, 65, 68, 69, 70, 71`.
- Every one of the 16 outputs reported **the same extraction seed 41408** and **the same data length 58152**. All 16 byte arrays share an **exact 1,417-byte prefix** and **exact 1,554-byte suffix**. Their entropy lies between **7.99641 and 7.99712 bits per byte**. Across the 120 candidate pairs, exactly matching byte positions comprise **6.6808%–8.5466%** of each 58,152-byte payload, far greater than the **0.3906%** expected between unrelated independent uniform byte streams. These shared-output features argue for a common template or other shared carrier structure; they do not identify a decoded document.
- Critically, the apparently promising `17`, `21` and `43` binary outputs are **exactly byte-for-byte identical** to the older public files `data/outguess/page_17.bin`, `page_21.bin` and `page_43.bin` in [Wulfic/Cicada3301-Liber_Primus](https://github.com/Wulfic/Cicada3301-Liber_Primus/tree/main/data/outguess). Their local Git-object SHA-1 values exactly match the earlier published objects respectively:
  - `dcd47827eb02f3d5c7cbfc6259868621bc1ee7b6`
  - `58ba0c966954f2a02964995613a6ba93fca57425`
  - `e4c94e1d285aff041276bf5c7bb1c265e987d93d`

## Interpretation and decision

**The 16 outputs are unvalidated, high-entropy extraction artifacts, not demonstrated secret messages.** The identical 16-bit seed, identical length, long common byte prefix/suffix and independent images point strongly to header detection induced by a reusable image carrier/template, rather than independently authenticated 58-KB secret files. The fact that three already existed byte-for-byte in earlier community research further reduces novelty; the additional 13 have the same recognizable artifact family. Their raw content has no recognized PGP or ordinary text signature, and no decryption mechanism for them is established.

An attacker could, in principle, conceal encrypted high-entropy data lacking a recognizable signature, so this does **not mathematically exclude** an intentional hidden binary payload. However, promoting any of these dumps as a recovered cryptographic key or completed solution would be unjustified. Future work on this channel requires an independent authentication check, message framing, known key, or demonstrable LP2 plaintext yield. Further unconstrained key sweeps of these same high-entropy blobs are low priority.

The exact original JPEG marker census in [jpeg-container-census.md](jpeg-container-census.md) separately shows there are no post-end-of-image trailer bytes on LP2; OutGuess reads JPEG coefficients and is not excluded by that census.

## Reproduction

- Original input images: `resources/liber-primus/00.jpg`, `08.jpg`, `17.jpg`–`74.jpg`.
- Code: [`sims/outguess_lp2_scan.cjs`](../sims/outguess_lp2_scan.cjs).
- CI: [`.github/workflows/lp2-outguess.yml`](../.github/workflows/lp2-outguess.yml), **manual dispatch only**, building the pinned upstream source using gcc `-std=gnu11`.
- Source evidence: [successful run 42755426574](https://github.com/FlareZ123/liber-primus/actions/runs/42755426574). The artifact contains both control outputs, all 16 suspect binaries and JSON with SHA-256 for each.
- Pair-comparison method: decode the artifact ZIP payloads, count exact shared positions across all 16 streams and exact byte equality for all 120 pairs, compute empirical 256-bin Shannon entropy per output. Confirm the prior Git blob SHA-1 using `SHA1("blob " + byte_length + NUL + payload_bytes)`.
