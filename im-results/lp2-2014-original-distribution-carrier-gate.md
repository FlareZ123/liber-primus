# May 2014 original LP2 carrier set: complete 58-JPEG exact-byte check

**Decision, 15 November 2026.** All **58** JPEGs in the project's canonical unsolved Liber Primus release are exact Git-object byte matches to the **58** individual page images in a historical participant's archive committed **11 May 2014**. Its containing directory preserves no extra key-bearing sibling file. The original HTML delivery index has only the static title `133`, div ID `331`, and 58 relative JPEG references, with no code or bytes implementing a decipherment. This decisively **rules out a modified modern source image or a missing same-directory file** as the cause of failure to decrypt LP2. It does **not** prove that the JPEGs lack embedded payloads. Original JPEG payload extraction remains separately blocked, and no new original LP2 plaintext is known.

## Specific original source and full image mapping

[Original archived Stage11 directory at contemporaneous commit `6c3421a4d245596e403c88e037509d162a2afd17`](https://github.com/micheloosterhof/cicada-2014/tree/6c3421a4d245596e403c88e037509d162a2afd17/stage11/ky2khlqdf7qdznac.onion), dated **11 May 2014**, has exactly **59** items: `index.html` and `0.jpg` through `57.jpg`. The original archive is participant-preserved Git evidence rather than a Cicada-signed HTTP response. The surviving [original Cicada signed handoff](../resources/historical/cicada2014-stage11-message.asc) supplies only that Tor host name and an invitation to correspond; it supplies no path, query, source key, named image, or cipher operation. The [same-index original HTML audit](lp2-2014-html133-red119-crosslink.md) rejects an automatic scripting or image-key role for 133/331.

**Exact complete check:** Compare the Git blob SHA-1 **and byte length** of all `N.jpg` in that exact May 2014 commit to `resources/liber-primus/(N+17).jpg` in the project's currently shared `main`. This was done for every **N=0,…,57** using two GitHub directory content listings and exact returned object IDs. **58/58 matched**, with **zero** missing files, size mismatches, or object mismatches. For anchor checks:

| Original LP2 physical page | Historic 2014 source blob | Repo original file | Bytes | Exact blob |
| ---: | --- | --- | ---: | --- |
| p0 | `0.jpg` | `17.jpg` | 695,525 | `abab573f7a3786f46fe4fab17d5f2dcf2476136b` |
| p3 | `3.jpg` | `20.jpg` | 599,916 | `3a7badc18e859868ef28d5b8b81bfde38e0ebbde` |
| p55 | `55.jpg` | `72.jpg` | 614,928 | `ee00cd34013fe3a5c6808650abb6d3206b6f1b13` |
| p56 | `56.jpg` | `73.jpg` | 389,813 | `afa3428764199ddf590baf0c055c8caedc079cb1` |
| p57 | `57.jpg` | `74.jpg` | 318,076 | `4397143b4df5ad729b00cfd740a74994052f46d2` |

The original source mapping is directly executable as a one-loop Git API comparison, and uses the Git content-addressed identities for exact file-byte equality. The original full page pair mapping is already in [the canonical archive README](../resources/liber-primus/README.md). A source-container file may itself hide bits or data in JPEG segments; matching source bytes cannot decide that separate steganographic claim.

## Other original 2014 media already reduce to known LP1 artifacts

A first-party [2014 Stage10 Tor form](../resources/external/cicada2014-onion6-magic-form-and-response.json) instructs successful solvers to post three solved magic squares and their own Tor hidden-service address. Its preserved static acknowledgement references **`107.jpg`, `167.jpg`, `229.jpg`**. Exact Git blob comparisons against the contemporaneous archive `micheloosterhof/cicada-2014/stage10` from the **13 February 2014** initial commit `3b15257c5a9efada85b8ccfdb876e2ec934d5b90` show these are already the included **LP1 `14.jpg`, `15.jpg`, `16.jpg`** respectively. Both bytes and object hashes agree:

| Stage10 old name | LP1 image | File size | Exact Git SHA-1 |
| --- | --- | ---: | --- |
| `107.jpg` | `14.jpg` | 625,668 | `28a1ac59a2f1f51d272e4e362c0c35b4be241347` |
| `167.jpg` | `15.jpg` | 426,945 | `32952b7d28028f5fedffceace4de0e7eb688d3d6` |
| `229.jpg` | `16.jpg` | 485,456 | `6f8059f7e8025bf3f51fceefe20be0cce8ce1e20` |

Each Stage10 old filename is the 28th, 39th or 50th prime, hence a source-visible **11,11 prime-ordinal stride**. The final filename 229 is also a direct original LP2 256-grid address with B[229]=0, entering the established 11-cycle. [The integrated graph and original p55 test](lp2-grid-byte-pointer-11cycle.md) preserve the exact observation without claiming an authored transfer instruction. Each Stage10 old filename happens to be a prime (prime ordinals 28, 39, 50), but the original response renders only those familiar LP1 images, from before LP2 distribution. The old filenames therefore **do not independently provide new LP2 key bytes**. A novel original instruction could in principle reuse these values, but none here selects such a transfer.

The earlier Stage9 package was four JPEG streams `index.1…index.4` and signed OutGuess instructions to make a private Tor CGI file upload service. The original archive's [Stage9 README](https://github.com/micheloosterhof/cicada-2014/blob/3b15257c5a9efada85b8ccfdb876e2ec934d5b90/stage9/README.md) contains an **operator transcription error**: its first extract uses `outguess -r index.4.jpg index.1.outguess`, duplicating the fourth JPEG's signed plain-text message in the first output name. The actual signed messages carry the known `3301` motif in digit-wise decorative borders (the source of the typo, the fourth input, carries digit `1`). This is a reason to avoid treating `index.1.outguess` as an independent first-image original result. The archive did not contain a separately named LP2 key or a generator for original LP2 unknown-page plaintext.

## Scope and next cryptanalytic decision

The true unresolved source is a **key-bearing original Cicada payload or typed cipher instruction**, if one existed beyond the published image set. Original May2014 Stage11 consists of 58 identical known scans and static HTML; its signed handoff offers no codec or selected page. The private communication/upload mechanism in the preceding Stage9–10 messages could have carried solver-specific data, but the public archived form and static reply do not preserve actual POST bodies or private replies. No key from that private channel is established.

The **original Windows OpenPuff 2014 MP3 positive control passed** on 15 November 2026, recovering the authentic 745-byte magic squares under historical password `33011033` ([complete source-native report](openpuff-jpeg-capacity-gate.md)). The separately submitted JPEG extraction run was blocked by the host before GitHub accepted it; **no negative or positive result exists for any of the 58 JPEGs**. No alternate tool path may be inferred from the archive comparison. Future research needs an actual signed or period-witnessed instruction that points to specific original JPEG payload bytes, a source-derived reversible cipher or an independent page-specific key. This archive check eliminates missing/mutated copies while preserving every original LP2 byte.

**Result class:** exact original-source identity plus a missing-link decision. **No recovered unknown LP2 plaintext, authenticated key or final destination.**
