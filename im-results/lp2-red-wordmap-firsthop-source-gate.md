# Red-ink words under the 2016 58-page prime-sum pointer hypothesis

**Agent 12, 14 November 2026. Exploratory original-source navigation evidence, with a decisive direct-decoding limitation.** A previously unrecorded source-selected opening pointer exists: the manuscript's **very first printed red word** directly addresses the already clear p57 word **TO**. Three of 50 red words, spread over 13 physical pages, directly address solved words; these are modestly enriched relative to a page-conditioned word-selection control. They yield **TO / THE / THE** in printed red-word order, so they do **not** recover an unsolved plaintext word, key, coherent instruction, or cryptographic inverse. Do not treat these targets as authenticated decipherments.

## Source-first operation and its exact three hits

The independent *source selector* is red rune ink, as recorded from original scans in \`resources/liber-primus/lp2-ink-annotations.json\`. It marks **18 colored spans**, covering **50 complete printed word segments** on 13 unknown rune-bearing pages. Every selected word is fully contained in a red span, with no partial word selected. Print line wraps are joined; p50 is retained as a rune-free numeric page.

The *operation* is the already proposed, **unauthenticated** interpretation of the 2016 signed "Its words are the map ..." sentence: sum the 29 original Gematria Primus **prime** weights of a complete source word to obtain \`n\`; take **physical page = n mod 58** and **zero-based word segment = floor(n/58)**. Both the 58-page modulus and page-local segmentation are original-artifact properties. The quotient/remainder roles and the choice of red words are solver hypotheses, not instructions stated in the signature. Earlier [global pointer analysis](lp2-signed2016-wordmap-global-plaintext-decision.md) explored all printed words; the present test isolates the visually selected red source population.

| Red original word | Source position | Prime sum | Direct page / word | Independently clear target |
| --- | --- | ---: | --- | --- |
| \`SHEOGMIAF\` | **p0, first word (red heading)** | **347** | 347 = 58×5+57 → **p57:w5** | **TO** |
| \`BNTFNG\` | p15, word4 of its page | **230** | 230 = 58×3+56 → **p56:w3** | **THE** |
| \`IACS\` | p39, word26 at red triad | **173** | 173 = 58×2+57 → **p57:w2** | **THE** |

Indices are zero-based and refer to **page-local printed segments**, including physical page-turn carries. The first source word contains eight GP runes. Its rune spellings and sum are fixed without selecting an English output: S=53, H=23, E=67, O=7, G=17, M=71, IA=107, F=2; their total is 347. The exact destination is physical p57's already readable sixth word, **TO**. Under the proposed pointer grammar there are only **two** TO-terminal source segments among all **2,928** page-local unknown segments, making this an interesting *individual* opening, but target rarity was noticed retrospectively.

Crucially, red original word lengths **8/6/3** differ from solved target lengths **2/3/3**. Consequently, even these three selected matches cannot be ordinary one-to-one word-preserving plaintext substitutions; the only defensible interpretation is *possible navigation*, requiring an unprovided stopping and reading rule. There is no tested source instruction to turn the last target into a new key or unknown-page output.

## Exact page-conditioned selection control

Following the same already frozen graph recursively from each red word until it reaches a known p56/p57 label, the table p50, or an unknown-page cycle yields **9 solved destinations, 8 table destinations, 33 cycles**. The nine solved labels, in original red word order, are **TO, THE, THE, END, END, THE, THE, END, END**. They are not a grammatical instruction, and choosing only attractive isolated words would be postselection.

Condition on the exact page, the number of colored words on that page, all of its source words, and the **fixed, untuned pointer graph**. Under the null, choose the same number of word segments uniformly within each affected page, independently across pages. Compute each page's exact hypergeometric hit distribution and convolve all 13 distributions. This is an **exact** conditional reference, not a Monte Carlo simulation.

| Frozen endpoint predicate | Red observed (of 50) | Page-stratified expectation | Exact upper-tail \`Pr(hit count ≥ observed)\` |
| --- | ---: | ---: | ---: |
| **Direct** p56/p57 target (zero graph hops) | **3** | **0.8327590** | **0.0438749** |
| **Eventually** reaches p56/p57 | **9** | **5.8947003** | **0.1105667** |

The direct-hit excess is a *modest conditional clue* worth preserving because red ink is an authentic visual selector and the p0 opening points at clear text without intermediate choices. This is **not** a calibrated proof of author design: the base58 graph, red-word input choice, direct-vs-eventual endpoint criterion and interested target labels arose across extensive previous exploratory work, and this table does not correct for that discovery process or alternative coordinate conventions. The eventual-target test is comparatively ordinary. An independent author-selected map grammar or a distinct original held-out prediction is needed before any decoder is pursued.

## Decision and reproducibility

**Preserve** the exact p0 opening **347 → p57:w5 TO** as a conditional navigation anchor. **Reject** treating the 50 red words as direct plaintext word replacements or as a complete readable pointer message. In particular, three nonconsecutive short known targets and the observed eventual labels supply no reversible operation on the original 12,956 unknown runes. Do not claim "TO" as decrypted p0 plaintext.

The standalone [Windows-compatible Node22 CJS SFT](../sims/lp2_red_wordmap_firsthop_source_sft.cjs) re-parses the complete original transcription and ink spans, asserts all 50 selections, all three direct pointers, all nine eventual endpoints and both exact conditional tails; it includes a closed-form hypergeometric positive control. It passed [manual Windows Actions run 43607111660](https://github.com/FlareZ123/liber-primus/actions/runs/43607111660). Original sources remain unchanged. This result does not alter the project's authoritative unsolved-state synthesis.
