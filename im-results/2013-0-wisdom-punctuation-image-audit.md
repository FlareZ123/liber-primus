# 2013 0_wisdom punctuation: source-exact image audit

**Classification:** original-image transcription correction; no LP2 plaintext, key, or cipher recovered.

## Decision

The proposed mapping from the raw transcription placeholders to the LP2 13-dot and 10-dot stencil classes is **falsified** by the original 2013 page.

- All three occurrences transcribed as ⁜ are **11-dot** stencils, with row occupancy **1/3/3/3/1**. Their inks, in source order, are red, black, red.
- The two prose occurrences of ⁘ after the two sentences ending in SACRED are **four-dot diamond** marks, with row occupancy **1/2/1**, both black.
- The five trailing ⁘ characters after the 5×5 table rows in the text transcription have **no corresponding detached dot stencil** in the image. They appear to encode row divisions in the transcription, which are shown by spatial layout in the image.

Thus the 2013 source page contains neither a 13-dot nor a 10-dot stencil at any of these ten transcription positions. Do not use this page as a known-plaintext control for ⁜→13 or ⁘→10.

## Primary source identity

The pinned external source is krisyotam/cicada3301, commit 76d3ee8c762f60025822c8c05edbf31351636469, path tools/solvers/LiberPrayground/pages/0_wisdom.jpg. Its Git blob SHA-1 is 2829e13812015601ff1014cb4427587b4a8aa3a6.

That blob is byte-identical to this repository's resources/liber-primus/05.jpg, which was also present in the supplied JPEG archive. The local file has dimensions 2400×3600 and SHA-256 2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7. The audit therefore uses the exact pinned image bytes, not a re-rendered copy or OCR.

The crosswalk is against resources/external/2013-0-wisdom.txt, whose transcription has three ⁜ occurrences and seven ⁘ occurrences.

## Exact source crosswalk

Coordinates are native image pixels (x,y); bounding boxes are half-open [left,top,right,bottom).

| Text position | Transcription token | Ink | Detached components | Row occupancy | Bounding box |
|---|---|---:|---:|---:|---|
| After SOME WISDOM | ⁜ | Red | 11 | 1/3/3/3/1 | [1064,687,1102,773) |
| After ALL THINGS SHOULD BE ENCRYPTED | ⁜ | Black | 11 | 1/3/3/3/1 | [828,1338,867,1423) |
| After KNOW THIS | ⁜ | Red | 11 | 1/3/3/3/1 | [878,2010,916,2096) |
| After first SACRED sentence | ⁘ | Black | 4 | 1/2/1 | [758,925,798,968) |
| After second SACRED sentence | ⁘ | Black | 4 | 1/2/1 | [811,1141,852,1184) |
| After table row 1 | ⁘ in transcription | — | 0 | — | No separate mark |
| After table row 2 | ⁘ in transcription | — | 0 | — | No separate mark |
| After table row 3 | ⁘ in transcription | — | 0 | — | No separate mark |
| After table row 4 | ⁘ in transcription | — | 0 | — | No separate mark |
| After table row 5 | ⁘ in transcription | — | 0 | — | No separate mark |

The large-stencil component centers (mean of the 11 dot centroids) are approximately (1082.5,729.5), (847.0,1379.8), and (896.5,2052.5). The two four-dot centers are approximately (777.8,946.0) and (831.5,1162.3).

For the table, the audited region is [550,2150,1800,2800), covering all five rows. It contains zero detached black square components with width/height 5–20 pixels and area 20–300 pixels. The image shows five spatially separated rows, not five extra four-, ten-, or thirteen-dot punctuation marks.

## Reproduction

Run:

    python3 sims/2013_0_wisdom_punctuation_image_audit.py

Dependency: Pillow. The script checks the Git blob SHA-1, SHA-256, image dimensions, fixed source-coordinate crops, component counts, row occupancies, and the absence of detached table-row dot components. It uses red threshold R>85, R>1.4G, R>1.4B, G<130; black threshold max(R,G,B)<110; 8-connected components; and a 5–20 pixel width/height and 20–300 pixel area filter.

## Evidence boundary

This establishes the visible punctuation geometry on the pinned 2013 image and corrects the transcription-to-image crosswalk. It does not identify the author's intended Unicode labels, prove a cipher role for the marks, or recover any unknown LP2 text. The two four-dot marks are consistent with the visual form suggested by ⁘, but the Unicode placeholders should not be treated as a reliable numeric dot-count vocabulary.
