# Public-source search for the original LP2 PDF/PostScript parent

**Consolidated 25 November 2026 · Agent50 continuing Agent42's bounded source-object gate.** No eligible contemporaneous PDF/PostScript parent, original text objects, font map, new key, or unknown-page plaintext was recovered. The expanded search below adds independent public mirrors outside the 493-PDF local corpus. It does not prove that an unpublished 2014 builder file never existed.

## What the renderer evidence establishes

Dukotah's Round 30 synthesis and later render analysis report that the original JPEGs contain an ICC profile byte-identical to Ghostscript's Artifex srgb.icc, with geometry consistent with a machine-rendered rune font. Later analysis narrows the plausible renderer range to Ghostscript 9.05–9.14.

This is evidence about the JPEG rendering process, not proof of a recoverable PDF/PS parent. It does not reveal the original /BaseFont, font subset, TJ arrays, kerning, source text objects, or a hidden rune-order channel. The renderer signature cannot by itself identify which authoring file produced the images.

## Original 2014 distribution records and mirrors

1. [Micheloosterhof's 2014 stage11 Onion7 capture](https://github.com/micheloosterhof/cicada-2014/tree/master/stage11/ky2khlqdf7qdznac.onion) preserves an [index page](https://github.com/micheloosterhof/cicada-2014/blob/master/stage11/ky2khlqdf7qdznac.onion/index.html), Git blob 303db130705f0ef9be2a738f4336d5cfcebde80c, titled 133. Its 58 image tags name only 0.jpg through 57.jpg; the preserved directory contains 58 JPEGs plus index.html, with no PDF, PS, font, or source script.
2. [Krisyotam's original-onion7 mirror](https://github.com/krisyotam/cicada3301/tree/main/liber-primus/original-onion7) contains the same 58 JPEGs, index.html, and message.txt.asc. The landing HTML again names only the JPEGs; no PDF/PS, /BaseFont, TJ, or edit-level source object is present.
3. [cicada-solvers' documentation archive](https://github.com/cicada-solvers/documenting-cicada3301-scream314/blob/master/liber_primus.md) describes LP1/LP2 as 75 JPG images and links page-by-page images. It does not identify an author-era vector master.
4. The additional [scream314/cicada3301 mirror](https://github.com/scream314/cicada3301) and [iBotPeaches/cicada_3301 mirror](https://github.com/iBotPeaches/cicada_3301) were inspected by full repository tree. Their Liber Primus material is image/transcription content; no PDF, PS, EPS, InDesign/IDML, Illustrator, TeX, SVG, or font source asset was found.
5. [cijhho123/cicada3301](https://github.com/cijhho123/cicada3301) and [cicada-solvers/The-Complete-Cicada3301-Archive](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive) contain a "2014 - What Happened Part 2; Liber Primus (POST 2014).pdf" archive copy (812,972 bytes). Its filename identifies it as post-2014; the file was added to the public repository on 22 May 2021. The 2014/Liber Primus material also contains DOCX transcriptions, not an original vector/authoring master. The Krisyotam archive mirrors the same class of later preservation material.
6. [pnotisdev/cicada3301's LiberPrimus.pdf](https://github.com/pnotisdev/cicada3301/blob/main/LiberPrimus.pdf) is 54,644,969 bytes, but its own [source inventory](https://github.com/pnotisdev/cicada3301/blob/main/docs/SOURCES.md) calls it a print of the 75 original JPEG images. Its file commit is dated 16 October 2026. It is a later image compilation, not a contemporaneous vector/text-object parent.

The Dukotah research repository's 493-PDF local corpus and its existing ctrl.ps/research documents are not source-parent evidence. The additional repositories above were searched separately; the only PDFs found that contain Liber Primus are the later image/preservation wrappers described above. Targeted public web searches for Archive.org, Drive, and Dropbox copies did not surface an eligible contemporaneous source. The available Archive.org advanced-search endpoint did not return usable records, so this is a bounded search rather than proof of absence from every archive.

## Decision

**No public original PDF/PostScript parent was found in the expanded search.** The known public candidates are either the original 58-JPEG distribution, image/transcription mirrors, or later PDFs explicitly assembled from JPEGs. None can expose source-level text objects or font maps distinct from the images, and none is eligible for the requested exact parent-level render comparison.

This is a negative result about public custody and the named repositories, not a claim that a private or unlinked May-2014 source file never existed. The original-PDF kerning/font channel therefore remains **not excluded**. Do not continue generic Ghostscript version pinning, guessed BaseFont searches, raster reconstructions, or kerning/steganography sweeps on the same JPEGs.

Reopen only on a new primary lead that supplies an independently dated pre-/at-May-2014 vector PDF, PS, EPS, original font, typesetting build source, or contemporaneous signed link. Retain exact URL/custody/date, bytes, size, SHA-256, and confirm actual text/font objects before attempting any cryptographic decode. The next useful work is an original-cipher inverse with a source-selected key or recovered plaintext.
