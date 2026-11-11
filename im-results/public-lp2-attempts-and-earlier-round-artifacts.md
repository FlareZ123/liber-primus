# Public LP2 attempts and earlier-round artifact index

**Snapshot:** 11 November 2026 · **Scope:** Director Issue [#97](https://github.com/FlareZ123/liber-primus/issues/97). This is an index of materially distinct public work, not an exhaustive scrape of forums. Links are preferred to copied third-party material; no copyrighted book text or unlicensed transcription is reproduced here.

## Decision

No reviewed public source supplies a source-selected key/state that recovers unknown LP2 plaintext. No complete or independently authenticated LP2 decryption was found. The strongest partial plaintext claim (the 27×27 / three-rune-node proposal) is already source-replayed and remains non-unique at its next block. The newer physical-artifact reports mostly overlap experiments already in this repository. Earlier-round book codes are genuine precedents for source-selected operations, but none currently identifies an LP2 book, edition, coordinate rule, or key.

## Materially distinct public LP2 work

### 1. 2retooz270703 — 27×27 map / three-rune nodes

- **Snapshot:** [commit f2090da (2026-11-09)](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/commit/f2090da0a4470a3fec648a684171b452a9ada3ae). The repository declares no license; link only.
- **Input and claimed operation:** the first 729 original rune positions (physical pp0–2), arranged as 27×27; three-rune nodes; a center-derived totient; a Möbius-derived key rotation; GP29 subtraction; then ray, geometry, word-boundary and language filters. The author reports 38 blocks / 115 runes of proposed plaintext and a red-heading reading.
- **Evidence class:** a conditional partial reading, not an identified key or verified decryption. Its later Reports 12–16 add transition and whole-word filters after a long sequence of choices; those filters do not independently select the route.
- **Current-repository comparison:** im-results/external-27-square-block39-complete-audit.md, im-results/lp2-27x27-published-nextblock-branching.md, and im-results/external-27-square-word-multiplicity.md already replay the source geometry and audit the published continuation. The frozen successor search leaves **21,818** source/key/path assignments after the stated GCD constraints; the separate 60-candidate single-word screen yields **52 distinct spellings**, not a unique next word. The claimed 38 blocks therefore do not determine block 39, let alone a general LP2 cipher. Do not repeat dictionary tuning or expand the route by adding more postselected language constraints.

### 2. Dukotah — multi-round campaigns and physical-channel frontier

- **Snapshot:** [Round 43 closeout, commit f63501d (2026-11-06)](https://github.com/Dukotah/cicada3301/commit/f63501d8f2d835b80c30230eb89a1110fb9197d2); see the repository's liber-primus/FINAL-SYNTHESIS.md, elimination ledger, and Round 44 plan.
- **Input and claimed work:** original LP2 pages and historical Cicada artifacts; repeated blind campaigns, plant/recovery controls, and a large elimination ledger. The author reports 309 ledger rows and a Round 44 plan organized around the page as a physical object. The repository's “OTP-class” description is its working classification, not a proved theorem about every possible cipher.
- **Round 44 proposals:** p15's 4×4 number grid as a schedule; the 405-rune quote/punctuation channel; 256-byte onion payloads as page pads; 20-byte-stride hash parsing; cuneiform and dot motifs; the 86-doublet sites; and p32/p55 tree geometry.
- **Current-repository comparison:** these are substantially covered by p15-fibonacci-page-word-address-gate.md, p15-hill-block-test.md, punctuation-quote-channel-gate.md, lp2-punctuation-identity-stream.md, historical-onion-byte-vigenere-lp2.md, onion2-r4-wordnull-inverse.md, lp2-p56-hash-2016-signed-tree-source-gate.md, p32-cuneiform-redtriad-mobius-bridge.md, p33-three-dot-constellation-screen.md, red-256-event-grid-correspondence.md, lp2-doublet-boundary-audit.md, and the tree/prime-pixel studies. The exact combination “R4 word-null plus per-page onion-pad reset” and a 20-byte hash-stride interpretation are not separately closed in every form, but the source bytes and adjacent direct/page-reset families have been tested. Neither proposal currently has a source-fixed selector for its clock, alignment, or mapping. The Round 44 document is a queue of hypotheses, not positive decryption evidence.

### 3. pnotisdev — 103-test corpus and R4 word-null model

- **Snapshot:** [commit 15200c6 (2026-10-24)](https://github.com/pnotisdev/cicada3301/commit/15200c67abee106913ba01ff504c5b6e88d16cc7).
- **Input and claimed operation:** broad LP2 corpus and a proposed two-part channel: the lag-six collision repair T(x)=24−2x mod29, plus one checked, non-key-consuming inserted rune in roughly 45% of words. Phase 57 reports a simulation fit statistic of about 0.64, but no source-derived key or plaintext. Its 150-rune key-library pilot did not find a real-window hit.
- **Evidence class:** a fitted structural model with synthetic positive controls and a negative real-cipher pilot; not a decryption.
- **Current-repository comparison:** the lag-six echo/repair studies and im-results/onion2-r4-wordnull-inverse.md already test the most direct historical bridge: an actual archived 256-byte onion stream under the R4 word-null channel, with positive plants and a negative original window. That local test is scoped to its stated 200-word window and global clock; it does not prove every possible per-page variant false. The external model adds no authenticated key source and does not change the current frontier.

### 4. Leo-Y-Zhang — 28-state chain-cipher hypothesis

- **Snapshot:** report dated 2026-09-06/07; repository [commit 0b90716 (2026-10-29)](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/commit/0b907164e95e3a44ee74c1d28efbf4688b770865), especially [docs/REPORT.md](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md).
- **Input and claimed operation:** 12,956 unknown runes; a chain model in which consecutive-ciphertext differences are governed by a flat, aperiodic 28-symbol step stream, with the rarity of zero steps used to explain the doublet deficit. No authentic source for the step stream is identified.
- **Evidence class:** statistical cipher-family hypothesis; no recovered key or plaintext. Its report counts **2,921 words**, unlike the current canonical corpus's **2,896** complete words, so word-level claims must not be compared until the boundary convention is reconciled.
- **Current-repository comparison:** related 28-state chain/step-domain work exists in im-results/grid-chain28-step-key.md and the lag/step-domain studies. The unconstrained flat step stream is a distinct formulation, but without a source selector it is not an executable human solve path.

### 5. Wulfic — page-by-page constraint and cipher tests

- **Snapshot:** [commit bf89d3d (2026-10-12)](https://github.com/Wulfic/Cicada3301-Liber_Primus/commit/bf89d3d13aad2b8f2c95ab195cf1b092f250775c); see README.md and MASTER_TRACKER.md.
- **Input and claimed work:** canonical page transcriptions, a 28-constraint ledger, and 268 reported tests over arithmetic streams, totients, page structure, and cipher families. The latest commit explicitly reports that the tested arithmetic-function streams do not supply the key.
- **Evidence class:** substantial independent negative research, not a plaintext recovery. Its README warns that some per-page SOLVED labels are hill-climbing artifacts and directs readers to trust the master tracker instead. The transcription lineage is already represented in this repository's resources/transcriptions/; the separate tracker is useful comparison, not an authoritative LP2 solution.

### 6. TheronEagle — repeated word-length patterns and scorer audit

- **Snapshot:** [commit a6c5d13 (2026-09-30)](https://github.com/TheronEagle/liber-primus-research/commit/a6c5d13f7591030367daace993c887af20a5e0ab), especially the corrected [open-leads.md](https://github.com/TheronEagle/liber-primus-research/blob/main/skill/cicada-3301-solver/references/open-leads.md) and ruled-out.md.
- **Input and claimed observation:** two 38-rune patterns in word-length sequences recur at page/word positions in that project's own indexing: [6,7,6,3,6,4,3,3] and [5,4,7,3,6,3,7,4]. Eight cross-page key variants were tested; a 400-sample max-over-eight permutation control gives p=0.113. The same commit finds the dictionary scorer omits ambiguous GP spellings, depressing scores on known plaintext; the defect creates false negatives, not false positives.
- **Evidence class:** a reproducible structural anomaly plus a useful tool-integrity correction; no key or plaintext. Preserve its page-numbering convention when comparing with the local physical-page map.

### 7. CicadaNotebook — long-form independent research notebook

- **Snapshot:** [Session 104 (2026-11-02)](https://cicadanotebook.com/sessions/104) and the [notebook index](https://cicadanotebook.com/).
- **Input and claimed work:** 104 research sessions covering word-level constraints, selective-F/unknown-key models, 27×27 proposals, and source reconstruction for earlier rounds. It reports no newly verified unknown LP2 plaintext.
- **Evidence class:** a research notebook, not a completed solve. Its 2012 Agrippa reconstruction and 2014 Gödel–Escher–Bach cue chain are useful historical comparisons; they do not establish those books as LP2 keys. The 27×27 work overlaps the source-replayed local audit above.

### 8. SECRA — physical-artifact and cross-round analysis

- **Snapshot:** [“Liber Primus: strongest findings” (2026-10-15)](https://secra.tech/research/liber-primus-strongest-findings/).
- **Input and claimed work:** reports a GIMP Dissolve rendering fingerprint on the solved p57 mayfly artwork (96.0% whole-image F1 and 93.9% held-out F1), identical opening/closing MP3 noise after alignment, prime-count arithmetic on three historical magic-square centers yielding the initials LP, and the 27×27 partial-plaintext proposal.
- **Evidence class:** physical-production and historical-structure observations, not unknown LP2 plaintext. The GIMP, audio, magic-square, and 27×27 families already have local counterparts in gimp-dissolve-source-pad-gate.md, interconnectedness-262-277-sameclock-invariant.md, onion7-magic-center-source-prime-gate.md, and the 27×27 audits. The reported GIMP seed is a software-rendering fingerprint, not by itself a cipher key.

## Earlier-round artifacts that actually select operations

- **2012 book-code precedent:** the public reconstructions of the Mabinogion/Agrippa stages use a named text and source-specific line/character extraction; CicadaNotebook Session 12 reconstructs the Agrippa input from an archived text snapshot. This demonstrates that a book cipher can be selected by a human-visible source clue. It does not select a text or edition for LP2.
- **2013 source code and server material:** [neuroretransmit/cicada](https://github.com/neuroretransmit/cicada) preserves the NUMBER, BASE29, DH, and prime-related stages. The local source gate distinguishes the bootable ISO from the separately reported remote telnet service: the ISO script prints all 464 primes through 3301; it does **not** authenticate the alleged remote omission of primes 73–1223. See resources/external/1033-3301-historical-operator-chain.json, im-results/historical-may2-whitespace-source-gate.md, and im-results/2013-telnet-prime-gap-differences.md.
- **2014 source-selected GEB book code:** the three extracted images point to Gödel's incompleteness theorem, Bach's Trio Sonata, and Escher's Eye, selecting *Gödel, Escher, Bach*. The published code uses **chapter abbreviation : line : word : letter** (for example 3PI:6:1:3) and yields ut3qtzbrvs7dtvzp.onion; it is not a dialogue/speech coordinate system. See the [2014 walkthrough](https://github.com/scream314/cicada3301/blob/master/2014.md) and the contemporary [2014 archive commit 6c3421a](https://github.com/micheloosterhof/cicada-2014/commit/6c3421a4d245596e403c88e037509d162a2afd17). This is a real historical selector and operation, but no LP2 clue presently selects GEB or its edition/layout.
- **2016 signed return and image archive:** the contemporary signed-message/image chain is summarized in workplace/historical-solve-path-to-original-lp2.md; the 2026 [mrroot archive commit](https://github.com/mrroot01011001/Cicada-3301-/commit/1ccf9583b7064ffd6feb52a49442311048295b41) is a useful secondary bundle of 2012–2017 signed messages and LP images, not primary authentication of missing server responses.

## Coverage and frontier decision

The following external ideas are already covered closely enough that they should not be reopened as broad searches: the 27×27 38-block continuation; the lag-six/R4 word-null model with an archived onion key; GIMP-Dissolve direct-pad/raster uses; the repeated MP3-noise relation; the historical square-center arithmetic; the quote/punctuation channel; cuneiform/dot motifs; doublet boundaries; and the p32/p55 tree families. Their exact scopes and limits are in the linked local reports.

The remaining Dukotah proposals—p15 as a page schedule, R4 combined with a per-page onion-pad clock, and a 20-byte-stride parse of the 2016 hash—are not all identical to prior tests, but none currently supplies the missing source-fixed mapping, alignment, or state. The 28-state chain model likewise lacks an authentic key source. These are not yet source-selected routes; opening more unconstrained variants would not materially improve the causal path to plaintext.

**Frontier decision:** no novel public LP2 route is justified by this census. Do not create a successor issue or launch another sweep on these suggestions. Reopen only if a historical artifact or LP2 clue fixes the source bytes, operation, key/state, and clock before original-cipher scoring.