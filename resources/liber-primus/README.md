# Liber Primus original-image archive

This folder contains 75 JPEG files, 00.jpg through 74.jpg.

The files were downloaded from the public rtkd/iddqd liber-primus__images--full archive and verified byte-for-byte against the 75-image ZIP supplied by the repository owner. **All 58 LP2 source JPEGs are additionally identical by Git blob object ID and file size** to the 58 images in a genuinely dated **11 May 2014** participant [Stage11 onion archive](https://github.com/micheloosterhof/cicada-2014/tree/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion): archived `N.jpg` maps directly to this folder's `(N+17).jpg` for **every N=0…57**, without one mismatch. The archived source directory contains exactly 58 original JPEGs and a 1,640-byte static `index.html`; there is no separately archived sibling key file. The original index has numeric title 133 and `div id=331` without embedded scripts. This pins the exact bytes of every original LP2 image to a dated 2014 distribution source rather than only a modern community mirror. The [bounded original-carrier analysis](../../im-results/lp2-2014-original-distribution-carrier-gate.md) describes what this observation establishes and leaves unknown.

Combined SHA-256 of JPEG contents concatenated in filename order: cdda41395a52761be5d00c52ec4a2c1c769f9a9f756974a7ec62d4bbf4156dc1.

Individual checksums are in SHA256SUMS.txt. The filenames reflect the ordering of the community archive.

## Page-number mapping

The community archive contains two consecutive sequences: LP1 occupies `00.jpg`–`16.jpg` (17 images), followed by LP2 physical pages `p0`–`p57` at `17.jpg`–`74.jpg` (58 images). Thus **LP2 page = archive filename index − 17**; the canonical `lp2-corpus.json` and ink annotations use physical LP2 page numbers, not archive filenames.

| LP2 physical page | Archive image |
|---:|---:|
| 0 | `17.jpg` |
| 40 | `57.jpg` |
| 49 | `66.jpg` |
| 50 (numeric grid) | `67.jpg` |
| 55 | `72.jpg` |
| 56 | `73.jpg` |
| 57 (PARABLE) | `74.jpg` |

Do not interpret `57.jpg` as LP2 page 57: it is physical page 40. For example, the five-dot black side clusters in archive `57.jpg` belong to p40; the actual p57 image is `74.jpg`, whose source-identified features include the seven-rune red PARABLE title and terminal red 23-dot mark.

## JPEG container details

The original LP1 `05.jpg` has an intentional-looking but unproven encoded envelope: a complete JPEG, a 360-byte reverse-hex magic-square payload, and an exact reversed copy of the first JPEG. Its deterministic parser is [`sims/jpeg05_palindromic_magic.cjs`](../../sims/jpeg05_palindromic_magic.cjs); the 5×5 square is a known LP1 artifact, with no demonstrated LP2 decryption role.

Separately, archive member `10.jpg` contains **four complete JPEG streams concatenated without any padding**. The first is its visible 754,662-byte JPEG; its following three streams at byte offsets 754,662, 1,467,395, and 2,170,823 are **byte-identical copies of the separately included `11.jpg`, `12.jpg`, and `13.jpg`**, respectively. These suffixes add no independent image or payload content to the archive. The enclosing member has 4,240,957 bytes and SHA-256 `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`; [`sims/jpeg10_concatenation.cjs`](../../sims/jpeg10_concatenation.cjs) checks every segment against the separate files. The cause and intentionality of this packing are unknown; do not interpret the duplicated JPEG bytes as a newly recovered encrypted message.

## Operational punctuation source

For new sentence/period-reset experiments use [`../transcriptions/lp2-image-corrected.txt`](../transcriptions/lp2-image-corrected.txt). It differs from the preserved legacy `lp2-transcription.txt` at exactly two character positions (zero-based 2506 and 12832): physical p8 (`25.jpg`) and p40 (`57.jpg`), both first-line single square word separators, not full stops. Original-image crop rectangles in 2400×3600 coordinates (left, upper, right, lower): p8 `(950,650,1620,810)`, p40 `(750,650,1530,810)`. The spurious resets follow global rune counts 1886 and 9648, and word counts 415 and 2163. The unsolved rune tape and all 2,896 word boundaries are unchanged; 175 legacy period marks become 173. Keep the legacy file pinned for older studies until individually migrated. The corrected Josephus, boundary BASE29/Feistel, and word-start prefix studies retain their prior qualitative conclusions. See [#1974](https://github.com/FlareZ123/liber-primus/issues/1974) and [#2597](https://github.com/FlareZ123/liber-primus/issues/2597).
