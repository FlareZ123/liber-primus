# Original LP1 p05 reversible JPEG suffix and p50 mirror-fold gate

**Status:** Verified original-byte anomaly and a bounded negative consumer test. No unknown Liber Primus plaintext or key was recovered. The authoritative manuscript status remains 56 unsolved LP2 pages (p0–55).

## Source-visible input and potentially useful operation

The immutable repository image `resources/liber-primus/05.jpg` (solved first-release LP1 physical page 05, SHA-256 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`) has a unique payload-sized JPEG file trailer:

- Full file: **673,066 bytes**; last JPEG EOI marker at offsets **600,364–600,365**, leaving **72,700** following bytes.
- **Every one of those 72,700 bytes exactly equals the reversal of the first 72,700 bytes of the SAME original JPEG**, `file[600366:] = reverse(file[:72700])`. A reversed trailer can be read as the start of an otherwise truncated duplicate 2400×3600 JPEG showing the original image's opening text.
- All **74 other original JPEGs**, including the **58 LP2 originals 17.jpg–74.jpg**, end at their final EOI with zero trailing bytes.
- Every LP2 JPEG contains the *same* 2,590-byte APP2 `ICC_PROFILE` payload, SHA-256 `62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f`. It identifies the ordinary Artifex Software sRGB ICC profile (copyright 2011), offering no page-specific metadata key. The 17 LP1 scans lack this APP2 payload.

The trailer reversal is a **literal first-party-file byte relationship**, independent of image transcription, editorial rune choices, or statistical fitting. Its **authorship and purpose are unknown**. It could arise from image processing or transport. Inferring a LP2 rune/key reversal from it requires independent puzzle evidence.

## Concrete attempted consumer and failed condition

The original second-release pp49–51 print a **32×8 table** represented by 256 derived base60 byte values in `resources/liber-primus/lp2-grid-256.json`. Solved p56 separately prints a 128-hex-character target (64 bytes) for an unidentified deep-web page. A deliberately inexpensive bridge was to use the observed **reverse** operator to fold the 256 table values to 64 values and compare them **directly** with that exact printed digest.

The predeclared finite family makes two 256→128→64 half-folds. For each fold, pair original first-half bytes with either their mirrored partners `x[n-1-i]` or aligned second-half partners `x[n/2+i]`; combine using byte XOR, addition, or either subtraction direction modulo 256. Also permit final reverse order. This is **2² × 4² × 2 = 128** explicit candidate serializations.

On the unchanged canonical table: **zero of 128** equals p56's target; the strongest candidate has **3/64** matching bytes. The strongest is first aligned-halves XOR, then mirrored subtraction `x-y`, then final reversal. Simple mirror-XOR twice has **1/64** equal bytes. A separate two-step synthetic fold vector in the SFT checks operator semantics. These results reject only **direct exact-byte mirror folding to the printed hash**. They do not test digest preimages, alternate source-typed operands, SHA-family transforms, p50 steganography, or a manuscript decipherment.

## Reproduce and interpret

`sims/lp1_p05_reverse_tail_p50_fold_sft.cjs` reads all 75 original repository JPEGs and the 256-byte table, checks the byte identity and checksum, profiles the 58 LP2 APP2 segments, and performs the complete direct-fold gate. It writes no files, requires only Node.js built-ins, and prints the exact measured results. The JPEG reverse-prefix observation is a reusable source clue; until independent creator evidence selects a reversible LP2 consumer, it belongs in intermediate research rather than the authenticated plaintext synthesis.

**Research decision:** Treat the unique LP1 byte reversal as an artifact fact. A promising follow-up would need a source-supported instruction tying that file-level reversal to a specific original LP2 cipher operation, then a full-section plaintext and re-encryption, rather than a wider menu of mirror variants.
