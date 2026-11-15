# LP1/LP2 JPEG ICC partition and missing master source

**Status (15 November 2026): original-source reproducible metadata observation, no LP2 plaintext/key.** This documents a source-acquisition discriminator rather than a proposed cipher or a new artifact provenance verdict.

All **58 of 58** original LP2 JPEGs (`resources/liber-primus/17.jpg`–`74.jpg`, representing LP2 pp0–57) contain the **same 2,576-byte** JPEG APP2 `ICC_PROFILE` chunk. The reconstructed profile's SHA-256 is:

```text
942e0f66212eb8ad252706559da5007d893d7350652704f8d115d5e6074479d0
```

The embedded profile identifies itself as **"Artifex Software sRGB ICC Profile"** and contains **"Copyright Artifex Software 2011"**. By contrast, **0 of 17** original LP1 JPEGs (`00.jpg`–`16.jpg`) has an ICC_PROFILE segment. Both releases use 2400×3600 pixels, but the embedded ICC sharply distinguishes the LP2 raster export from LP1. A programmatic JPEG segment walk (from SOI until SOS, reassembling indexed APP2 chunks) verifies the full partition and the profile digest on every source image. Reproducer: [read-only Node22 single-file SFT](../sims/lp2_artifex_icc_source_sft.cjs); example invocation from the repo root: `node sims/lp2_artifex_icc_source_sft.cjs`.

**Independent external finding, distinguished from this check:** The [Dukotah/cicada3301 2026 artifact study](https://github.com/Dukotah/cicada3301) reports a match to a Ghostscript 9.06 `srgb.icc` and compatibility with some Ghostscript 9.05–9.14 export paths. The current original-image test confirms the Artifex marker and exact 58/17 partition; it does not independently prove a unique Ghostscript version, source application, original PDF or author identity. A 2026 local Debian Ghostscript 10.05.1 `srgb.icc` differs, consistent with profile evolution.

**Cryptanalytic consequence:** A retained *original 2014 pre-raster typesetting master* (PDF, source document, custom font, or export project) could preserve input character codes, font encodings, extractable object streams, creation metadata or author-specified operations that are absent from the JPEGs. Such a recovered source could yield a GP29 key or a printed instruction if it actually contains those bytes. The 2014 Stage11 onion index presently lists only the 58 raster images and no PDF link ([period index](../resources/historical/stage11-2014-index.html)); modern PDFs made by aggregating JPEGs are false candidates. Search historical archives only for a **dated original master or contemporaneous export source** and verify against raster appearance/production metadata. Without one, this profile is a common rendering artifact, not key material, and should not motivate an arbitrary ICC-derived Vigenère or PRNG sweep.

**Decision:** preserve the exact binary profile discriminator for any credible original-master acquisition. Continue key/plaintext work elsewhere; no original unread page has been deciphered by this observation.
