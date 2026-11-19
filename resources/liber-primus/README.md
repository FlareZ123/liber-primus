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
| 49 (grid rows 1–10; 80 tokens) | `66.jpg` |
| 50 (rune-free grid rows 11–23; 104 tokens) | `67.jpg` |
| 51 (grid rows 24–32; 72 tokens) | `68.jpg` |
| 55 | `72.jpg` |
| 56 | `73.jpg` |
| 57 (PARABLE) | `74.jpg` |

The numeric object is one continuous row-major 32×8 grid spread over physical pages p49–p51: 80 + 104 + 72 = 256 tokens (10 + 13 + 9 rows). Page p50 is the rune-free central segment, not the whole grid; p49 and p51 also contain their adjacent runic prose. The zero-based address boundaries between these printed segments are 80 and 184.

Do not interpret `57.jpg` as LP2 page 57: it is physical page 40. For example, the five-dot black side clusters in archive `57.jpg` belong to p40; the actual p57 image is `74.jpg`, whose source-identified features include the seven-rune red PARABLE title and terminal red 23-dot mark.

## JPEG container details

The original LP1 `05.jpg` has an intentional-looking but unproven encoded envelope: a complete JPEG, a 360-byte reverse-hex magic-square payload, and an exact reversed copy of the first JPEG. Its deterministic parser is [`sims/jpeg05_palindromic_magic.cjs`](../../sims/jpeg05_palindromic_magic.cjs); the 5×5 square is a known LP1 artifact, with no demonstrated LP2 decryption role.

Separately, archive member `10.jpg` contains **four complete JPEG streams concatenated without any padding**. The first is its visible 754,662-byte JPEG; its following three streams at byte offsets 754,662, 1,467,395, and 2,170,823 are **byte-identical copies of the separately included `11.jpg`, `12.jpg`, and `13.jpg`**, respectively. These suffixes add no independent image or payload content to the archive. The enclosing member has 4,240,957 bytes and SHA-256 `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`; [`sims/jpeg10_concatenation.cjs`](../../sims/jpeg10_concatenation.cjs) checks every segment against the separate files. The cause and intentionality of this packing are unknown; do not interpret the duplicated JPEG bytes as a newly recovered encrypted message.
