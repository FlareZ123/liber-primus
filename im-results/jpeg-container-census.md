# Original JPEG-container census: no LP2 appended payloads or variable ICC metadata

**Classification:** exact original-file structural census, bounded negative for a specific hiding channel. Agent 42, 2026-11-10. **No LP2 plaintext, key or destination recovered.**

## Question and method

The historically meaningful 05.jpg reversed-JPEG payload and 10.jpg concatenation establish that metadata and raw post-EOI bytes can carry intentional structure. To avoid fruitlessly re-exploring every LP2 source file as a possible appended payload, the entire `resources/liber-primus/00.jpg`–`74.jpg` original-byte corpus was parsed. The scanner follows JPEG marker lengths and entropy-coded scan escapes (including stuffed `FF 00` and restart markers), so the first **actual valid EOI** is used instead of arbitrary byte-pattern searches.

For every file, record whether data follows that EOI, whether JPEG COM or APP1–APP15 metadata exists, and the baseline image frame dimensions/component count. Compare APP2 content cryptographically across files rather than interpreting image-compression metadata as a cipher by default.

## Results

- **73/75** original files end exactly at the first parsed JPEG EOI marker. The only exceptions are the **previously documented** LP1 `05.jpg` and `10.jpg`.
- `05.jpg`: a first **336,353-byte** complete JPEG, a **360-byte** middle region and a **336,353-byte exact byte reversal** of that JPEG. This independently confirms the previously recovered magic-square structure; see [JPEG05 payload](jpeg05-palindromic-magic-square.md).
- `10.jpg`: a first **754,662-byte** complete JPEG followed with no gaps by full, byte-for-byte copies of `11.jpg`, `12.jpg`, `13.jpg`. See [JPEG10 composite](jpeg10-concatenated-pages.md).
- **All 58 scans `17.jpg`–`74.jpg` (entire LP2)** contain one complete JPEG with **zero trailing bytes**, **zero JPEG COM segments**, a single **2,590-byte APP2 ICC_PROFILE segment**, and image dimensions **2400×3600**. Every APP2 payload has exactly the same SHA-256 digest `62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f`. There is no page-specific information in this ICC field.
- JPEG component mode differs: **23 LP2 scans** are one-component grayscale, while **35** are three-component images. The grayscale scan IDs are: `33–38, 41–42, 45–48, 58–65, 67–69`. The mode difference describes image encoding; it is not independently identified as a bitstream or key.

## Cryptanalytic consequence and limitations

The 56 unresolved LP2 pages, as well as its two solved terminal pages, **cannot conceal a separate post-EOI byte payload or individualized ICC-profile value within these original files**. Search effort should prioritize visually present marks, quantized image coefficients, actual rune sequences, or independently motivated key sources rather than more trailer-byte hunting. This is an exact scope exclusion for the audited files only, not a no-steganography claim. Pixel-level JPEG encoding can carry information without post-EOI bytes or individualized APP metadata; visible dot patterns, coloured typography, and the existing numeric grid are outside this test.

## Reproduce

Run `node sims/jpeg_container_census.cjs` against the original 75 JPEGs in `resources/liber-primus/` using Node.js 22. The script verifies the two known trailers byte-for-byte, requires exactly one ICC digest across LP2, and asserts zero appended payloads on all LP2 images. It prints a JSON report of the counts, digest and grayscale scan numbers. No network services or third-party libraries are required.
