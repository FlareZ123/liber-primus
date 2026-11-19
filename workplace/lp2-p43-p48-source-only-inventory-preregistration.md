# LP2 p43–p48: source-only inventory and frozen hypotheses

**Freeze:** 2026-11-19 16:40 UTC  
**Scope:** original physical pages p43–p48 only. This preregistration was fixed before opening page-specific derived p43–p48 reports. It is an image/source inventory, not a decryption claim.

## Inputs

The six JPEGs were extracted byte-for-byte from the supplied `liber-primus-jpegs.zip` entries `liber-primus-jpegs/43.jpg` through `48.jpg`. All are 2400×3600 pixels. Pages 43–44 are RGB; pages 45–48 are grayscale.

| Physical page / file | SHA-256 |
|---|---|
| p43 / 43.jpg | `ed88f5fcdca3d1f846538caa8be979aa28cde969eb99c9464d60daa26c1f9af7` |
| p44 / 44.jpg | `c92c972f41dd038e136d8589aa7b113e268c36f2860c279cce712cd037cb3a8e` |
| p45 / 45.jpg | `318bb587f4dcab11b4db7ba3b8bb13b7913ca79bb409e1c987595503a22e0522` |
| p46 / 46.jpg | `6f769f266865ddb30b0cb34e82c664a87ba409f674dc52ad3af7c85be443fb5c` |
| p47 / 47.jpg | `701b66d1fe98f730dadc5d7d8e1bc3b9a8e20547c1ffb423011f436037dba8b0` |
| p48 / 48.jpg | `0cb60ca12b1bf5f9fc03026314018a0d5ee73f813ac86ca4197629c60f2cb80a` |

## Direct visual inventory

- **p43:** twelve centered text lines. Two faint, vertically elongated insect-like illustrations flank the text block, one on each side; each has a dark central body and delicate wing/filament detail. A red 13-dot marker follows the final text line at its right edge. No visible Latin text, Arabic numerals, URL, table, or explicit directional arrow.
- **p44:** one elongated, veined insect-wing-like drawing sits above the text. A large red rune-like initial occupies the left of the text block. The first text line is red and is followed by a red 13-dot marker; a black rune-like glyph is visible immediately to the marker's right on the same baseline, whose grammatical role is not resolved by appearance alone. Ten black text lines follow, for eleven text lines total. No visible Latin text, Arabic numerals, URL, table, or explicit directional arrow.
- **p45–p48:** twelve centered text lines on each page. No illustrations, colored ink, oversized initial, marginalia, or visible external-reference string. The pages continue the same centered, regularly spaced GP-style rune typography.
- **Typography and punctuation:** text is arranged in printed words with small dot-like separators and occasional stronger punctuation/stop marks. There is no obvious grid, columnar layout, page-edge index, or printed numeric legend on these six images.
- **Page transition:** p43's side illustrations and terminal red marker are followed by p44's upper wing, red initial/heading and another red marker. The next four pages are visually text-only. This is a visible change of page treatment, not yet an identified cipher boundary.

## Measured source feature: repeated 13-dot marker

The p43 terminal marker and p44 heading marker each contain thirteen separate red dots in the same arrangement: a five-dot central column interleaved with four two-dot rows on either side. After centering, their dot coordinates agree to within approximately one pixel. The marker is therefore a repeated source feature, not merely two similar-looking punctuation clusters.

The p43 marker is at the end of the final text line; the p44 marker is at the end of the red heading line. Their different positions matter: the images do not by themselves say whether the marker means paragraph stop, heading boundary, page transition, count, or cipher instruction.

## Frozen candidate checks (maximum three)

These are deliberately narrow source checks. None is yet an executable unknown-page decipherment.

1. **Repeated-marker boundary.** Input: the complete red 13-dot clusters and their immediately adjacent p43 terminal / p44 red-heading spans. Candidate operation: treat the identical marker as a delimiter and keep the adjacent spans separate, rather than merging red heading and black body. Receiver: the p43 terminal line and p44 heading/body boundary. Prediction: the marker geometry is congruent on both pages and occurs at those two distinct boundaries. This prediction is confirmed by the original pixels. Missing selector: no first-party instruction says what operation or key to apply to either delimited span.
2. **Insect/wing orientation.** Input: the two p43 side illustrations and the p44 isolated wing. Candidate operation: only a literal reflection/orientation relation suggested by the artwork; no rune reversal is assumed in advance. Receiver: the p43–p44 printed text order. Prediction: a genuine mirror/paired-image relation must be demonstrable in the original artwork and must uniquely specify a text orientation. If the art is only thematically related or merely placed bilaterally, it does not select a cipher operation. No such text-orientation selector is visible at freeze time.
3. **p44 enlarged initial.** Input: the large red rune-like initial and the first rune(s) of the red heading. Candidate operation: determine whether the large glyph is simply an enlarged rubric initial or an independent symbol. Receiver: the red heading only. Prediction: direct glyph-shape identity (or non-identity) can classify the initial's role; it cannot by itself define a body-text transform. No key schedule or plaintext prediction is selected by this feature.

## Stop condition and next decision

Do not launch generic steganography, red-only stream searches, low-digit/XOR families, OutGuess tests, or broad cipher/phase menus from these observations. The source supports a repeated 13-dot boundary marker, distinctive p43–p44 insect/wing art, and a p44 red initial/heading. It does **not** yet support a clue→operation→key/state→receiver chain for unknown plaintext. After this freeze, consult the existing page-specific studies only to identify prior exclusions and any genuinely independent source selector. If none supplies the missing operation/receiver, close this interval as a bounded source-first negative rather than inventing a cipher.
