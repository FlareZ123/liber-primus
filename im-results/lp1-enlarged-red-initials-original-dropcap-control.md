# Original LP1 enlarged red initials are runes already in the ciphertext

**Agent13's four initial correspondences extended by Agent16; 16 November 2026.** This is a source-visible typography control, not a new LP2 decryption. The LP1 canonical transcription has 15 nonempty, rune-bearing `%` pages. Scan 00 is the cover and scan 02 is the Chapter 1 title card; the rune-bearing sequence is p0→01.jpg, p1→03.jpg, p2→04.jpg, …, p14→16.jpg.

## Complete oversized-initial correspondence

The earlier control matched four nonadjacent scans. A source-coordinate pass over all eight scans called “arrow-like” in the red inventory finds **nine** oversized red components (scan 13 contains two). In every case, the oversized glyph is the first GP rune of the adjacent word or paragraph; the following small red runes continue it. Coordinates are `(x, y, width, height)` in the original 2400×3600 JPEG, with origin at the upper-left.

| Original scan | LP1 page | Oversized rune | Component box (x,y,w,h) | Following small red runes | Canonical text at that word/paragraph start | Source reading |
| --- | ---: | --- | --- | --- | --- | --- |
| `01.jpg` | 0 | `ᚱ` (R) | `602,672,164,550` | `ᛝᚱᚪ…` | `ᚱᛝᚱᚪᛗ…` | Encrypted “A WARNING” heading; authentic Atbash |
| `03.jpg` | 1 | `ᚢ` (U) | `601,673,230,492` | `ᛠᛝᛋ…` | `ᚢᛠᛝᛋᛇᚠᚳ…` | Encrypted “WELCOME” heading; authentic Vigenère/F |
| `04.jpg` | 2 | `ᛒ` (B) | `601,2044,149,492` | `ᛗᚱᚦᚠᛈ…` | `& ᛒᛗᚱᚦᚠᛈ…` | Paragraph initial; counted once in the canonical text |
| `06.jpg` | 4 | `ᚹ` (W) | `600,670,150,495` | `ᚣᛠᚹᛟ…` | `ᚹ-ᚣᛠᚹᛟ…` | One-rune word followed by the normal word separator |
| `10.jpg` | 8 | `ᚦ` (TH) | `601,667,148,497` | `ᛖ…` | `ᚦᛖ-ᛚᚩᛋᛋ…` | Clear “THE LOSS OF” heading |
| `13.jpg` | 11 | `ᛋ` (S) | `602,1488,148,498` | `ᚩᛗᛖ…` | `& ᛋᚩᛗᛖ-ᚹᛁᛋᛞᚩᛗ…` | Clear “SOME WISDOM” paragraph |
| `13.jpg` | 11 | `ᚪ` (A) | `600,2489,148,495` | `ᚾ…` | `& ᚪᚾ-ᛁᚾᛋᛏᚱᚢᚳᛏᛡᚾ…` | Clear “AN INSTRUCTION” paragraph |
| `14.jpg` | 12 | `ᚪ` (A) | `601,669,148,497` | `ᛋᚹᚪᛁ…` | `ᚪ-ᛋᚹᚪᛁ…` | One-rune word followed by the normal word separator |
| `16.jpg` | 14 | `ᚪ` (A) | `601,670,148,495` | `ᚾ…` | `ᚪᚾ-ᛁᚾᛋᛏᚱᚢᚳᛏᛡᚾ…` | Clear “AN INSTRUCTION” heading |

The p0/p1 controls are especially useful: their oversized runes are authentic **ciphertext runes**, not plaintext initials supplied to the decoder. The p8/p11/p14 controls show the same typography on printed clear-GP text. Therefore the enlarged form does not signal cipher state, an extra token, or a direction opcode.

## Cipher consequence and boundary

The original LP2 opening scan 17 likewise begins with an oversized `ᛋ`, followed by small `ᚻᛖ…`, matching the first source-inscribed red span `ᛋᚻᛖᚩᚷᛗᛡᚠᛋᚣᛖᛝᚳ` of p0. The LP2 p0 image does not supply a second extra arrow at the same location.

The LP1 “arrow-like” forms are now source-identified as ordinary drop capitals and must be counted once. This rejects the proposed interpretation of those shapes as an independent direction selector. It does **not** prove every red-highlighted word or punctuation mark is semantically inert, nor does it rule out a distinct visual instruction elsewhere. The remaining red ink supplies no unique ordering, key serialization or reversible receiver by itself; no LP1→LP2 key or plaintext follows from this observation. Existing LP1 Vigenère-transfer and LP2 red256-XOR tests remain separate, previously bounded branches and are not repeated here.

## Reproduction

Run from the repository root:

    python sims/lp1_red_initial_dropcap_sft.py resources/liber-primus

The script verifies all nine oversized red component boxes against the original scans and asserts that each adjudicated rune/context occurs in the corresponding canonical page. It is not OCR and does not claim to infer a cipher.
