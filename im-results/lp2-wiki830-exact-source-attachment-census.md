# Uncovering Cicada wiki attachment census: exact source-byte gate

**Status (13 November 2026, Agent4, [Director #756](https://github.com/FlareZ123/liber-primus/issues/756)):** source inventory and bounded retrieval succeeded; **no previously unknown Liber Primus plaintext, authorial key, 2014 continuation object, p56 hash preimage, or authentic decoder has been identified.** Continue targeted retrieval of historically relevant objects. Wiki upload time records upload provenance only, not puzzle authorship.

## New source corpus and direct answer

The independent source registry [pnotisdev/cicada3301, docs/SOURCES.md](https://github.com/pnotisdev/cicada3301/blob/main/docs/SOURCES.md) describes 830 files on Uncovering Cicada's public MediaWiki API. The new [source-only CommonJS reproducer](../sims/lp2_wiki830_source_attachment_triage_sft.cjs) fetched the complete two-page API listing directly in original API order, and compared its reported **raw-file SHA-1 values** against the **actual bytes of every image** in the independently published [Complete Cicada 3301 Archive](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive).

- **830** wiki file entries; source API returns stable name, SHA-1, file size, upload timestamp and original-image URL for each.
- GitHub archive has **438 unique SHA-1 contents** among JPEG/PNG/GIF/BMP/WebP/SVG/PDF files, after exact binary hashing of the live checked-out archive. **194 of 830 wiki SHA-1s exactly match archive source bytes.** These include the original onion7 `0.jpg`, `1.jpg`, `10.jpg`, and the original `1033.jpg`. This is an independent known-original positive control on hash semantics and image identity.
- **636 of 830** source SHA-1 values are absent from that reference archive. This defines a *byte-distinct candidate set*, which contains many recent artwork, media, resized/reprocessed images and screenshots. It is **not** a count of missing Cicada puzzle files.
- Filename matching alone would have classified **164** entries as archived and **666** as not matched. This discrepancy proves that filename equality alone is inadequate to screen source novelty.
- Upload-date distribution: 2013 **55**, 2014 **242**, 2015 **189**, 2016 **45**, 2017 **27**, and 2018–2026 **272**. The newer uploads cannot be treated as 2014 clues without independent signed source evidence.
- API file extensions: **460 .jpg, 314 .png, 22 .gif, 5 .mp4, 5 .pdf, 3 .jpeg, 3 .webp, 2 .mp3** plus small miscellaneous classes. An `allimages` API entry may represent video or other attachments.

## Byte retrieval and a practical hazard

The original CDN `/revision/latest` address returns HTTP 200 even when the image bytes differ from the source API SHA-1, sometimes with a smaller optimized JPEG. The reproducible retrieval attempts the published URL, then the direct original path, then the explicit original-format query. Of the first **35** alphabetically ranked and candidate-filtered byte-distinct filenames, **13** passed exact SHA-1 and **22** produced different bytes under all three variants. No transformed image is accepted as a source-original object. This matters for steganography and hash tests. The [manual-only source workflow](../.github/workflows/lp2-wiki830-source-triage-manual.yml) retains the 830-file index, exact per-name SHA-1 and retrieval outcomes as a short-lived artifact. Successful [workflow run 43431241796](https://github.com/FlareZ123/liber-primus/actions/runs/43431241796) established archive byte deduplication; [run 43431866460](https://github.com/FlareZ123/liber-primus/actions/runs/43431866460) obtained the targeted visual source controls.

## Direct inspection of apparent key files

Three distinct documents were inspected as original bytes or, when original-byte retrieval failed, were expressly marked as non-authentic renderings.

1. **`Liberprimus_key_uncovered.jpg`**, uploaded 19 August 2025: source-SHA1-verified 382,514-byte file. Its visual content is an ordinary labeled **Gematria Primus** substitution chart with colored rune samples. It supplies no plaintext, original 2014 key or reproducible inverse.
2. **`New_potential_clue_from_MIT_keyservers.png`**, uploaded 19 August 2026: source-SHA1-verified 19,690-byte screenshot. Displays a **4096R/7A35090F** OpenPGP key listing dated **14 March 2024**, with user ID `C6S7 (9687409 The broken mirror reflects truth more honestly than the whole. The email here is form without function)`. This is a modern *short-key-ID listing* rather than a signed 2014 continuation. Without its complete fingerprint and an authenticated binding to the old Cicada signing key, it does not furnish a source key or legitimize its 2024 text.
3. **`SubstitutionKeyKoan.jpg`**, uploaded 30 January 2014: a labeled original *Onion 4 koan substitution* chart, already consistent with solved historical techniques. The image was viewed through CDN-transformed bytes that **failed** its source SHA-1; it must not enter raw-byte tests.

## Unresolved high-value work

The full *file names and hashes* have been enumerated, and the first 35 distinct candidate downloads have been tested. The remaining **601** byte-distinct entries have **not** been independently retrieved or checked for original text/embedded payloads. Focus on **2013–2016 upload-dated, byte-bearing material whose hash is absent from the archive**, especially the five PDF, five video and two audio entries, and compare their exact bytes to historical signed source where possible. The wiki offers no verified original `59.txt`/`59.bin` from the label search; the absence of a matching filename is limited evidence. Use the reproduced index to avoid a second crawl of known originals.

**No new LP2 original plaintext was recovered.**