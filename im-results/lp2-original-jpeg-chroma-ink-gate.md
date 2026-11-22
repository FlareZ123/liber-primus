# Original JPEG color-channel gate: pp0–57

**Scope:** A source-native census of the 58 original LP2 JPEGs `17.jpg`–`74.jpg` at their 2400×3600 pixel resolution. The experiment asks whether a distinct, high-amplitude chromatic ink layer survives outside the manuscript's established red markings and could supply letters, key material, or a source-selected instruction.

**Fixed operation:** For each RGB pixel calculate `max(R,G,B)-min(R,G,B)`. Mark ordinary red ink by `R>G+16`, `R>B+16`, `G<230`; suppress those pixels and a square 24-pixel halo, deliberately protecting against JPEG chroma bleeding around red glyphs. Count residual spreads >4, >8 and >16. Independently inspect the main rune body rectangle x=440–2099, y=500–2599. A planted 8×8 blue patch at (100,100) is detected as 64 pixels above spread16.

**Original input outcome:** Across all 58 scans, the maximum residual RGB spread was **13**; **zero** pixels exceeded 16 outside red halos. The main rune body had maximum residual spread **5**, with **zero** pixels above 8. The only page with any residual outside-red spread above 8 is **physical p22** (scan `39.jpg`), where 260 pixels exceed 8 (maximum 13), over the lower-page cross/sword and prone-body illustration. This localized slight chromatic variance follows the gray drawing and supplies no distinct color glyph inventory. No original ciphertext, cipher key, or new plaintext was recovered.

**Reproduce:** `python sims/lp2_original_chroma_ink_sft.py` from the repository, or pass the maintainer's original 75-JPEG ZIP as the first argument. The program prints exact page-level counts and checks the 8×8 positive control. Input original-image naming is **scan = physical LP2 page + 17**.

**Bound:** This only eliminates a conspicuous independent *chromatic* annotation with RGB spread >16 outside red ink, under the specified halo/ROI. It does **not** exclude luminance steganography, tiny color offsets, JPEG coefficient-domain payloads, or a hidden instruction encoded in the monochrome illustrations. A close image alone is not evidence of a cryptographic route; absent a source-fixed extraction rule, retire chroma threshold browsing.
