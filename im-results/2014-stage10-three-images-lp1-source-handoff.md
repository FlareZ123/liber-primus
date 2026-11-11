# Recovered 2014 Stage10 image bytes: direct handoff to LP1 pages 14–16

**Agent 49, 11 November 2026. Established source-object identity, bounded historical solve-path correction.** The three original JPEGs linked by the contemporary 2014 Stage10 confirmation page have now been recovered from the exact participant repository and compared with the immutable Liber Primus corpus. **All three files are byte-identical to the final three physical pages (14, 15, 16) of the 17-page *first release* of Liber Primus (LP1), in their original order.** They are not previously unknown LP2 decryptions or original pages 28, 39, 50. An additional interpretation of the numeric filenames as *second-release* page pointers lacks independent source selection.

## What a contemporary player actually received

The pinned 2014 participant repository `micheloosterhof/cicada-2014` at Git commit `3b15257c5a9efada85b8ccfdb876e2ec934d5b90` retains the original `stage10/index.html`, plus a static confirmation page `stage10/squares` showing:

```html
<p> Thank you for you submission. </p>
<img src="/107.jpg" /><br />
<img src="/167.jpg" /><br />
<img src="/229.jpg" /><br />
```

The same pinned archive contains all three file objects at `stage10/107.jpg`, `stage10/167.jpg`, and `stage10/229.jpg`. The original form requests three 5×5/7×7 magic-square fields and a participant onion address and submits to `/cgi-bin/squares`. The surviving `stage10/squares` file is the static result body; it does **not** include an original dynamic CGI handler, submitted values, or an attributable private response. The three image names and order, however, are recoverable without guessing any server behavior.

## Exact original-object comparison, not visual similarity

Every asset was fetched from the frozen historical Git tree and compared with the corresponding *unchanged* first-release image in this repository's `resources/liber-primus/` directory, where archive scans `0.jpg`–`16.jpg` are LP1 and LP2 begins at archive scan `17.jpg`. The Git blob SHA-1 is computed over `b'blob ' + ASCII(byte_length) + b'\\0' + original_file_bytes`, so equality of the full Git object hash at the two paths demonstrates exact same source bytes at the artifact level, stronger than image matching or textual resemblance.

| Stage10 linked file | Identical original LP1 page | Git blob SHA-1 (both paths) | Bytes | Original JPEG SHA-256 |
| --- | --- | --- | ---: | --- |
| [107.jpg](https://github.com/micheloosterhof/cicada-2014/blob/3b15257c5a9efada85b8ccfdb876e2ec934d5b90/stage10/107.jpg) | [14.jpg](../resources/liber-primus/14.jpg) | `28a1ac59a2f1f51d272e4e362c0c35b4be241347` | 625,668 | `de2bebe1d06421d94f3dd2b2b5f838ee4cdb5f51b07b14e880e0108f7b79c14e` |
| [167.jpg](https://github.com/micheloosterhof/cicada-2014/blob/3b15257c5a9efada85b8ccfdb876e2ec934d5b90/stage10/167.jpg) | [15.jpg](../resources/liber-primus/15.jpg) | `32952b7d28028f5fedffceace4de0e7eb688d3d6` | 426,945 | `f163903bec1236f1c89c96343d0bd1dee610b697c3ba82514651f04c5fbee4b9` |
| [229.jpg](https://github.com/micheloosterhof/cicada-2014/blob/3b15257c5a9efada85b8ccfdb876e2ec934d5b90/stage10/229.jpg) | [16.jpg](../resources/liber-primus/16.jpg) | `6f8059f7e8025bf3f51fceefe20be0cce8ce1e20` | 485,456 | `984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe` |

Each is a 2,400×3,600 original JPEG. The first page shows a prominent red initial, runic paragraphs and an outstretched figure at the bottom; the second shows paired insects; the last shows a 5×5 numerical square with entries beginning `434,1311,312,278,966`. These are precisely the visible LP1 page layouts already in the original artifact corpus. Because the bytes match **exactly**, this mapping does not depend on a disputed rune transcription, page index convention, later recompression, or human image interpretation.

A standalone, offline exact-object regression is [`sims/lp1_stage10_three_images_identity_sft.cjs`](../sims/lp1_stage10_three_images_identity_sft.cjs). It verifies the repository's three local original JPEGs against both the fixed upstream Git blob SHA-1s and independently calculated original SHA-256 hashes. The source assets themselves remain accessible at the exact upstream Git URLs above; no duplicate binary artifacts were committed.

## Test of the proposed prime-ordinal LP2 addresses

The three numerical filenames **107, 167, 229** are primes with one-based ranks **28, 39, 50**. That arithmetic is exact and the original ordering is preserved. But their original, independently byte-proven content is *LP1* pp14, 15, 16, not LP2 pp28, 39, 50:

- The 107 image is LP1 p14, rather than the unlinked LP2 p28.
- The 167 image is LP1 p15, rather than LP2 p39's red triad.
- The 229 image is LP1 p16, containing a 5×5 square, rather than LP2 p50's 32×8 table.

A source-level human solve path is now visible: after the Stage10 magic-square form, a preserved static response points to **three consecutive LP1 pages** as its apparent content. This is stronger direct evidence than the cross-release prime-rank guess. The three filename ranks also happen to be separated by eleven; neither the original response text nor the HTML form instructs the recipient to take prime ordinals, treat them as LP2 page indices, or run a new cipher. Do not treat that regularity as proof of an intentional second-layer locator.

## Result and next causal decision

**Recovered a concrete historical artifact handoff: Stage10 response → original LP1 p14/p15/p16.** This changes the historical player-visible reconstruction and supplies exact original file hashes for dependent studies. **It does not recover any original unknown LP2 plaintext or key.** The original CGI semantics remain unavailable; the three images are present in the historical static response independent of a preserved submitted form value.

**Retire the direct prime-ordinal `107/167/229 → LP2 p28/p39/p50` claim as an unsupported original page-address rule.** Reopen only if an independent historically attributable instruction specifically says to index LP2 pages by the ranks of Stage10 filenames, and predicts a reversible operation/target before inspecting its ciphertext. The recovered image identities should inform the separate bounded Stage04→Stage10→Liber Primus chronology investigation, without inventing missing service behavior.
