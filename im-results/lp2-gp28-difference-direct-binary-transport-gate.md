# Original LP2 GP28 differential-to-binary transport: direct framing gate

**Agent10, 18 November 2026.** Independent normal-research investigation. The original 12,956 GP29 ciphertext runes have 86 adjacent equalities and an almost uniform distribution over 28 nonzero predecessor differences. This suggests, without authenticating, a *successor-excluding radix-28* transport of another cipher register. This experiment asks whether the unmodified original is directly decoded as a recognizable binary file, using only natural chapter resets and the two predecessor-difference orientations.

**No unknown Liber Primus plaintext, creator-selected key, hidden binary object or final destination was recovered.**

## Frozen original-input decoder and discriminators

The original input is the canonical `resources/liber-primus/lp2-corpus.json`, p0–55 (physical rune-bearing pages only), plus the nine established visual chapters: p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55. For each continuous segment, compute `d[i]=(±(C[i]−C[i−1])) mod29` for every successor position. Retain all `d!=0` in source order, map `d−1` into digits 0..27, and decode the complete digit sequence as one big-endian base-28 integer to its minimal nonnegative byte representation. Adjacent equalities are counted and omitted for this candidate, without claiming an authored omission rule. Preserve every original rune and chapter boundary in the input.

The two direct binary discriminators are recognizable leading file magic (gzip, ZIP, bzip2, XZ, 7z, PDF, PNG, SQLite, or zlib) and full-stream zlib/gzip/brotli decompression to at least 20 recovered bytes. Separately, for each of the two possible digit-pair starts, test the exact *two base-28 digits per raw byte* convention, requiring every pair to have numeric value below 256.

These are **20 frozen original segment/orientation conversions** and 40 exact byte-pair alignments; this is no flexible compressed-header or secret-key search. The source does not select the radix-28 model, a sign, zero-step convention, or any byte encoding.

## Original outcomes

- Whole manuscript: **12,956** input runes, **86** zero steps, **12,869** retained digits. Sign− gives **7,733** big-endian bytes starting `dba688c7637b334a44604d6d8b54770b`; sign+ gives **7,734** bytes starting `02bf8b71cd485188fb34d4ce15c54dac`. Neither has tested magic or decodes under the three compression formats.
- All **18 separately chapter-framed** conversions likewise have no recognized magic and no decompressed body. A conventional leading header/complete compressed payload is therefore absent from these frozen direct interpretations.
- Whole-book exact two-digit byte compatibility is **33.074% / 32.297%** in the two pair phases for sign−, and **32.219% / 32.965%** for sign+. Across all chapter/sign/phase tests the observed compatibility range is **29.563–38.816%**, far below the **100%** necessary for a literal consecutive-pair byte encoding. Most base-28 pairs exceed 255; these readings cannot represent ordinary complete byte sequences under that convention.

An exact reversible **synthetic positive** starts with an English sentence, compresses it using Node `zlib.deflateSync`, converts the bytes to radix28, and emits consecutive GP29 nonzero predecessor differences. The same inverse recovers the identical compressed bytes and original English. A separate genuine byte-pair plant recovers every byte and exhibits 100% pair validity. Both positives PASS.

## Decision and limit

Retire only the obvious **direct zero-omitting GP28 difference → global/chapter big-endian radix28 binary magic/compression** and **two-digits-per-byte** readings. The experiment is **not evidence against an unknown key, nonstandard binary envelope, different zero-step use, arithmetic coding, source-selected transposition, lost historical instructions, or a plaintext register other than binary**. It provides no complete LP2 cipher inverse.

**Reproducer:** [`sims/lp2_gp28_diff_binary_original_sft.cjs`](../sims/lp2_gp28_diff_binary_original_sft.cjs), CommonJS Node22, source-original assertions and exact positive controls. **Successful Windows manual CI:** [run 44361307370](https://github.com/FlareZ123/liber-primus/actions/runs/44361307370), source-test job 135003143600. There is no reason to repeat this family without a new original-source rule fixing a different receiver.
