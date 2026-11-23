# 2012 opening-image payload: byte-exact extraction and LP2 transfer decision

**Decision (23 November 2026):** the 2012 opening image and its two separate payload channels have been recovered from two pinned community mirrors, and the historical OutGuess extraction has been independently reproduced with the pinned OutGuess 0.4 source. The result adds no LP2 key, operation selector, or plaintext. **Close the proposed 2012→LP2 transfer; retain this material as historical solve-path context.**

## Original image and source limits

The image is \`1CcV1.jpg\`, originally referenced as \`http://i.imgur.com/1CcV1.jpg\`. The byte-preserving copies used here are pinned to:

- [\`scream314/cicada3301\`](https://github.com/scream314/cicada3301/tree/10733feb487bb8beb9966d534727ee5897aa54fc/assets/2012), commit \`10733feb487bb8beb9966d534727ee5897aa54fc\`, file \`assets/2012/1CcV1.jpg\`.
- [\`cijhho123/cicada3301\`](https://github.com/cijhho123/cicada3301/tree/d360ad97d39c4719e42dc88b0cbbb81ed54aa02c/2012), commit \`d360ad97d39c4719e42dc88b0cbbb81ed54aa02c\`, file \`2012/additional media/images/1CcV1.jpg\`.

The two files are byte-identical: **29,279 bytes**, SHA-256 \`870353b8fbe4d1dd83fdbfc61b07d80213bab035526d3e5fd6a43f7d77db1ead\`, Git blob SHA-1 \`467a24a6f70bb589a994fd73ee37b6f9c7a827f8\`. This agrees with the independent artifact comparison in [\`Dukotah/cicada3301\` REPORT-A.md](https://github.com/Dukotah/cicada3301/blob/fd13fe88a0bfef13f07c03c666b831e9ddae7f2d/corpus/A-primary-artifacts/REPORT-A.md), pinned to commit \`fd13fe88a0bfef13f07c03c666b831e9ddae7f2d\`.

**Authentication boundary:** the direct 4chan upload has not been recovered as a separately hashable binary, and this first image has no preserved Cicada PGP signature. The two matching copies are byte-pinned community mirrors, consistent with contemporary reports, not a cryptographically authenticated 4chan download. This matches the existing [local first-image source record](../resources/historical/cicada2012-first-image-source.md). The Internet Archive/Imgur-derived 27,517-byte copy is not a substitute: it lacks the 61-byte trailer and has a different JPEG encoding.

## Channel 1: the post-EOI Caesar URL

The 29,279-byte mirror has **61 bytes after the JPEG EOI**:

\`TIBERIVS CLAVDIVS CAESAR says "lxxt>33m2mqkyv2gsq3q=w]O2ntk"\`

The explicit Caesar reference selects a uniform ASCII-byte shift of −4 on the quoted string, producing:

\`http://i.imgur.com/m9sYK.jpg\`

This is not an alphabet-only Caesar rotation: punctuation and digits shift too. The destination image is the known duck decoy; its text directs the solver to “guess” how to get the message “out”, leading to the separate OutGuess step. The original first-image record and the exact byte-level trailer are documented in the pinned external report above.

## Channel 2: reproduced OutGuess payload

The historical walkthrough [\`scream314/cicada3301/2012.md](https://github.com/scream314/cicada3301/blob/10733feb487bb8beb9966d534727ee5897aa54fc/2012.md), pinned to the same \`scream314\` commit, records the exact command:

\`\`\`sh
outguess -r 1CcV1.jpg 1CcV1.jpg.out
\`\`\`

No password or additional flags are supplied. The extraction was reproduced in [workflow run 45287777862](https://github.com/FlareZ123/liber-primus/actions/runs/45287777862) using the repository's existing manual runner and OutGuess 0.4 source commit \`24810e14327c2bbeedeaadd3e24491f2a4425c02\`.

The run independently downloaded both pinned mirrors and verified that:

- both original JPEGs are byte-identical and match the expected 29,279-byte SHA-256;
- both archived \`.out\` files are byte-identical;
- the 61-byte post-EOI trailer is exact and its ASCII −4 transform yields the URL above;
- \`outguess -r\` reports **29,049 usable bits**, **seed 228**, **length 535**;
- the newly extracted 535 bytes exactly equal both archived \`.out\` files.

The extracted payload SHA-256 is \`7dbf268b1b356527cf4a2dc105c0dd1f6d2d703291dda24dd9e98e22851d6f40\`. Its exact bytes are preserved in [\`2012-first-image-1CcV1-outguess.txt\`](2012-first-image-1CcV1-outguess.txt); the executable reproducer is [\`2012_first_image_outguess_reproduction.cjs\`](../sims/2012_first_image_outguess_reproduction.cjs).

The output is a **book-code instruction**, a Reddit destination (\`r/a2e7j6ic78h0j\`), and 76 line:character pairs. The Reddit/book identification and subsequent phone-number extraction are downstream stages of the 2012 chain; they are not extra bytes hidden in the JPEG trailer and should not be conflated with the OutGuess output.

## LP2 transfer test: no source-selected receiver

The recovered 2012 material demonstrates three historically real operations or grammars:

1. the explicitly cued ASCII Caesar −4 URL transform;
2. OutGuess extraction from the named 2012 JPEG;
3. a book code whose external text and coordinate grammar are resolved by the 2012 subreddit chain.

None independently selects an LP2 page, an LP2 ciphertext span, an LP2 alphabet, or an LP2 key/operand. The Caesar shift is a local instruction for the 2012 URL, not a reusable GP29 shift. OutGuess is a recurring historical tool, but recurrence alone does not select an LP2 carrier or password. The book-code coordinates address the 2012 reference text, not LP2 rune positions.

This is not a new visual-inheritance or creator-prior search. The already completed [#2332 visual audit](https://github.com/FlareZ123/liber-primus/issues/2332) found no new transferable 2012–13 visual opcode, and [#2352 historical solve-path audit](https://github.com/FlareZ123/liber-primus/issues/2352) found no new source-selected LP2 operation. The reconciled [historical player solve-path contract](../workplace/historical-player-solvepath-operator-contract.md) already distinguishes genuine historical operations from unsupported transfers. The original LP2 corpus mapping is also explicit: LP2 physical pages 0–57 are archive images \`17.jpg\`–\`74.jpg\`, not this 2012 image ([source archive README](../resources/liber-primus/README.md)).

The separate [58-image 2014 original-distribution/carrier analysis](lp2-2014-original-distribution-carrier-gate.md) finds all 58 LP2 JPEGs byte-identical to the dated May 2014 Stage11 image set and no sibling key file. Its Huffman/entropy comparison also distinguishes the 58 LP2 images from the known historical OutGuess carrier-writer fingerprint. That is a bounded writer-representation result, not a proof that all forms of image steganography are absent; importantly, it still supplies no source selector for applying OutGuess to an LP2 page.

**Decision:** no LP2 operation was run. The task's required independent LP2 selector is absent, so testing Caesar −4, OutGuess, the 2012 book, or its 76 coordinates against LP2 would be an unconstrained transfer. Close this branch unless a newly authenticated LP2 clue names a specific receiver and supplies the missing operation/key/coordinate grammar.

**Research result class:** exact historical payload recovery and reproducible extraction; negative LP2 transfer decision. **No unknown LP2 plaintext, authentic LP2 key, complete inverse, or final Cicada destination recovered.**
