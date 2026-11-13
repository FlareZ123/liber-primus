# Conditional p55 16-word / 5-bit-ornament Tor-v2 locator candidate

**Research classification:** an exact, reproducible **unverified locator hypothesis**, not a decipherment, recovered unknown-page text, authenticated key, or validated onion service. The proposed host is **\`6sws36unkmvdy4b7.onion\`**. It must not be described as Cicada's destination without an independently attributable historical copy or another source-selected validation.

## Source-first causal route

The original physical p55 (2014 scan \`72.jpg\`) contains one leading rune finishing a p54 word, followed by **16 complete printed words**. The immediately following solved p56 asks the reader to find a page in the “deep web”; Tor v2 services used **16-character Base32 hostnames** in 2014. The same floral frame appears on all original pp40–55. An earlier independent original-image audit read the **five-slot left and right ornaments as 01101₂=13 and 11111₂=31** under a single declared topmost/clockwise black-bit convention ([source-visible report](original-visual-clue-operation-map.md); [red-event report](red-256-event-grid-correspondence.md)). Five bits suggest Base32, though their orientation and application as a codebook are **not** explicitly given by Cicada.

Earlier solved Cicada material provides a genuine operation for assigning numbers to GP words: **add the first-29-prime weights of their runes** (2014 LP1 Wisdom/magic-square stage). A concrete possible endgame readout is therefore: omit the single carry fragment; retain the 16 complete printed words in order; sum each word's GP prime values; reduce modulo 32; translate digits with the historical Tor Base32 alphabet \`abcdefghijklmnopqrstuvwxyz234567\`. This is **one frozen original-input hypothesis**. The reduction modulo32 and treatment of words as an onion ID are interpretive additions, not verified authored instructions.

## Exact original result and the two ornamental anchors

Original source-canonical GP-prime sums, word1 through word16:

\`\`\`text
222 114 118 306 283  30 596 365
138 108 341 291  88 284 129 159
\`\`\`

Reduced modulo32, in two proposed 8-symbol groups:

\`\`\`text
30 18 22 18 27 30 20 13 | 10 12 21  3 24 28  1 31
 6  s  w  s  3  6  u  n |  k  m  v  d  y  4  b  7
\`\`\`

The **eighth** word, six-rune \`MSDIAPF\`, has GP-prime sum **365 ≡ 13 (mod32)**. The **sixteenth** word, three-rune \`BEI\`, has GP-prime sum **159 ≡ 31 (mod32)**. These match the independently audited 13/31 left/right border bit motifs in that order if one partitions the 16 words into two consecutive groups of eight. The printed p55 lines begin **7/2/5/2** complete words, so **this 8+8 division is not a printed line break**. The separate 32×8 numerical table elsewhere in the manuscript motivates an eight-column convention, but does not explicitly authorize applying it here.

Across **2,103** consecutive, complete, 16-fragment windows confined to one original runic physical page p0–55, the fixed constraints “word8 sum modulo32 is 13” and “word16 sum modulo32 is 31” jointly occur **once**, at p55's start offset1 (its first complete word). Across the **15** rune-bearing floral pages p40–55, the same test on each page's **last** 16 local fragments also matches only p55. These are descriptive source observations. Under an idealized independent uniform two-digit null, one expects about 2.05 matches among 2,103 windows; **one match is not globally anomalous**. Choosing the final page and 8+8 positions after seeing the ornament/word facts can introduce selection bias, so a naive 1/1024 probability is not evidence of intended encryption.

## What remains missing

Any 16 Base32 characters form a syntactically permissible historical Tor-v2 service ID. The construction is therefore **not self-validating** and does not demonstrate the site's existence or possession of its corresponding RSA private key. The same inputs admit alternative reductions/word readings, and the border bit-order convention itself has no original textual endorsement. The historical v2 service protocol is retired, and an unindexed old service may be unrecoverable.

The decisive next test is **source-directed**, not another cipher-key sweep: recover a dated snapshot, original service descriptor/hostname, contemporaneous participant log or signature-valid statement that independently names \`6sws36unkmvdy4b7.onion\` or supplies the correct 16-digit construction. If an authentic page is recovered, compare its exact original bytes to p56's printed 128-hex hash under an independently selected historical 512-bit digest and serialization. Without that source, keep this host in \`workplace/\`, not \`results/\`, and pursue more discriminating decipherment routes.

## Reproduction

Run \`node sims/lp2_p55_16word_onion_candidate_sft.cjs\` from the repository root. It reads the original physical rune counts, GP prime alphabet and page-local printed text, corrects for the runeless p50 in the transcription, asserts all 76 original p55 runes and 17 fragments, freezes all 16 sums, and reproduces the complete 2,103-window and 15-page controls. It makes no network requests and claims no decrypted rune.
