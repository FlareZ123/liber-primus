# November 2026 27×27 proposed p0–p2 plaintext: original-source coverage gate

**Research decision (Agent40, 15 November 2026): the published 38-block path is a 103-cell selected read, not a demonstrated inverse for the complete 729-rune original chapter.** No authenticated LP2 unknown-page plaintext, key or final destination has been recovered. This is a new external-claim triage of its exact ciphertext coverage, distinct from previous 27×27 / Trifid / matrix tests.

## Independent source and falsifiable question

The [recently updated external proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption) presents a reading beginning *“AS I GO, THE WEATHER TURNS COLD”* and ending *“GO, DO AS I ASK.”* Its author interprets original physical LP2 pp0–2 as a 27×27 matrix and assigns 38 independently selected ciphertext segments, usually with a three-rune node supplying a totient/Möbius-derived GP29 key. The README calls the project completed, but its own [block 19 walkthrough](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/ab9d8190e60009179563ac21b2d750271c2782b3/plaintext-i-found/19-key.md) expressly states that the proposed next node is **not uniquely identified**, and that earlier coordinate-selector/endpoint conditions are **not mandatory** after block 17. This is material selection freedom.

The narrowly decisive question is: **how much of the original 729-rune chapter does the site's advertised complete 38-stage plaintext extraction actually consume?** This can be answered directly from its published interactive overlay, without fitting an English score or re-running the same earlier matrix hypotheses.

Use the exact publicly committed [HTML map at commit `ab9d8190e60009179563ac21b2d750271c2782b3`](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/ab9d8190e60009179563ac21b2d750271c2782b3/0-2-live-map.html), Git blob SHA-1 `9d63d54570c52e3abae52aaed16ab182576ff58c`. Match the 729 rendered table glyphs to untouched original `resources/liber-primus/lp2-corpus.json` p0, p1, p2. The web author's display uses slash aliases for four canonical GP glyphs (`S/Z→S`, `C/K→C`, `IA/IO→IA`, `U/V→U`), not four changes to the original ciphertext.

## Original-cipher audit

| Directly observable quantity | Source-pinned result |
| --- | ---: |
| Physical p0–2 runes, row-major | **729** |
| Exact cell/rune matches after display-alias normalization | **729 / 729** |
| Claimed plaintext stage numbers represented | **38 / 38** |
| Original source cells marked `cipher-layer stage-N` | **103** |
| Duplicate ciphertext source cells among 38 marked stages | **0** |
| Rune positions without a claimed ciphertext overlay | **626** |
| Fraction of original chapter directly used as ciphertext | **14.13%** |

All 38 annotated blocks are present; their claimed ciphertext lengths range from **1 to 7 runes**. The total source consumption is **103 unique positions**, distributed across a maze of horizontal, vertical, and diagonal readings. The original artifact's remaining **626 positions (85.87%) have no `cipher-layer` annotation** in the proposed complete interactive map. The red heading is separately discussed by the author; it does not supply a specified inverse for those remaining 626 positions.

This is an important distinction: the displayed 27×27 matrix is accurate, and individual subtractions at hand-selected cells can be arithmetically correct. Such local arithmetic cannot establish that the author has decrypted the *729-rune object*, that the route is uniquely intended, or that the recovered words were predicted independently. The public reconstruction itself acknowledges that the key-node/route selector is not unique after block 17.

**Finite positive and negative controls:** the committed SFT checks *every* rendered rune against the canonical original, so it detects a wrong source matrix. It separately checks all 38 stage identifiers, asserts there are exactly 103 unique ciphertext cells, and fails on any source expansion/repetition or changed stage inventory. Its external input is immutable by both Git commit and exact Git blob hash. An entirely covered, specified full-chapter inverse would require either 729 ordered source positions or a separately specified disposition of omitted material; the present proposal supplies neither.

## Decision for the plaintext frontier

Classify the published sentence as a **third-party, post-selected 103-cell submessage candidate**. It is **not established p0–2 plaintext**, and it must not count as even a partly solved full chapter merely from a fluent sentence. This finding does not mathematically disprove that some sparse route through the page could encode a genuine additional message. The step that could promote it is a source-independent, unambiguous key-node and cell-transition rule that predicts unseen ciphertext locations and recovers held-out GP29 plaintext, followed by a complete disposition of the remaining 626 original rune positions. Candidate selection, fitting more geometry conditions to the already selected 38 blocks, or extending a manually picked phrase is not that step.

**Reproduction:** [single CommonJS Node22 source-corpus test](../sims/lp2_2026_27x27_claim_103cell_audit_sft.cjs), using the author-controlled immutable HTML commit, exact upstream blob hash, and the local canonical 729 ciphertext runes. No cipher or textual plaintext is fabricated.
