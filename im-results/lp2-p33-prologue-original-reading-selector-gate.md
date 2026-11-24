# p33 original visual, historical reading and semantic-crib decision

**Updated 24 November 2026, Agent48, Director Issue #2494. Decision: the source-selected p33 semantic-crib transfers tested here fail. No LP2 plaintext or key is recovered.** This is a bounded rejection of these specific LP1-to-p33 transfers, not a claim that p33 or the historical cipher family is generally unsolvable.

## Original source and physical structure

Use original LP2 physical p33, archive image **50.jpg**, with canonical GP29 positions from resources/liber-primus/lp2-corpus.json and image-checked red spans from resources/liber-primus/lp2-ink-annotations.json. The original JPEG SHA-256 values are:

- p33 / 50.jpg: 13ff4c8d8ab934032a001b8c1fda16433aa44a38dd7272b3ff0dd7ac8300c62d
- LP1 p05 / 05.jpg: 2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7
- LP1 p16 / 16.jpg: 984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe

The source annotation gives p33 214 runes, red spans at offsets 0–9 and 91–98, and red 13-dot punctuation after offsets 10, 91 and 99. The first 91 runes form a typographic unit; the lower rubric begins at 91, and the lower black body begins at 99. These are source observations. They do not themselves establish a cipher reset or key phase.

The two cuneiform-style groups at the bottom of p33 have conventionally been read as **1033** and **3301**. Treating that reading as a hypothesis suggests LP1 pages 05 and 16: their printed 5×5 magic-square first rows sum to 1033 and 3301 respectively. The numerical correspondence is exact, but the mapping is not a first-party statement that these pages supply plaintext.

## Existing source-era seven-place read

The earlier bounded test applied the exact 2014 Stage05 order [0,6,2,5,1,4,3] to the original first 91 p33 runes, from the printed first rune, without key or phase variation. It produced no recognizable instruction or key. The output and planted inverse control are retained in sims/lp2_p33_original_five_line_stage05_sft.cjs. This rejects that particular standalone seven-place reading only; it does not exclude a mechanism selected elsewhere.

## February 2014 semantic-crib transfer gate (#2494)

The historical control is real and reproducible: the second LP1 KOAN opening yields the period-13 GP29 key FIRFUMFERENFE from a short known plaintext; plaintext F is transparent and does not advance the key. Ciphertext F is not automatically a hold. The original dated discovery record and independent LP1 WELCOME blind continuation are consolidated in im-results/lp1-self-revealing-key-source-selection-gate.md. That positive control validates the method on solved LP1 material, not its transfer to LP2.

### Upper p33 block: LP1 p05 source phrase

The 1033 correspondence nominates the LP1 p05 sequence SOMEWISDOM (10 GP29 runes) followed by THEPRIMESARESACRED (17 GP29 runes). Their concatenation is a 27-rune candidate for p33 offsets 0–26, exactly spanning the 10-rune red rubric and the following black text.

Under the historically motivated continuous period-13 additive relation, the 27 differences give **14 repeat checks and 0 matches**. If the first red 13-dot marker is instead treated as a key reset, the 17-rune body-only crib gives **4 checks and 0 matches**. The crib contains no plaintext F, so the transparent-F rule cannot repair either failure. These are locked rejections of the exact source phrase under both natural clock readings; no alternate sign, offset, phrase, or reset was tried.

### Lower p33 block: LP1 p16 source phrase

The 3301 correspondence nominates LP1's AN INSTRUCTION title. Its native GP29 spelling is ANINSTRUCTIAN, **12 symbols**, because the IA rune carries the IO sequence. It is not a 13-symbol crib. The LP1 KNOW THIS subheading is only **7 GP29 symbols**, while p33's lower red span is 8; it is not an exact length-preserving heading crib.

A deliberately generous lower-body test places the 12-rune ANINSTRUCTIAN crib at p33 offset 99, immediately after the lower red 13-dot mark. The first 12 original ciphertext runes there are ᛞᛒᚣᛡᚣᚢᚣᚾᚦᚱᛖᛗ. A period-13 key therefore has 12 known symbols and exactly one unknown symbol. The crib contains no F, so the next position begins at key phase 12. I exhaustively tested all **29** possible GP29 values for that one missing symbol—no other key, phase, sign, or offset search.

- 23 completions admit a legal plaintext-F-transparent continuation; 6 have no legal path.
- Every surviving best path is unique and re-encrypts exactly, as required by the transducer.
- The best completion uses missing symbol EA, giving the 13 key tokens EA H T E J X OE H Y B L I EA. Its 103-rune continuation is JPSBEOOSYXIREAHIJFAENGUIIWLCAEUXMCAXAETGPITHXOEBBNGXOEEOXNGABXSPERHRDEAOCTNGFJIHXTEAWCRPXDYIAUUNGWOEJLOFMTHEOEEOJIACAEAENGAHUN, not recognizable plaintext.
- A GP29 trigram model (alpha 0.1, no cross-section trigrams), trained without the source section supplying the crib, gives this best continuation **−3.609955 nats/rune**. Comparable leave-two-out windows from six native solved sections range from **−3.234725 to −2.504856 nats/rune**. Thus even the best of the 29 source-constrained completions scores below every native control.

Exact inputs, the 29-way enumeration, language calibration, plaintext-F branching, and forward replay are reproduced by sims/lp2_p33_historical_semantic_crib_sft.cjs. The manual Node 22 workflow is .github/workflows/agent48-p33-historical-semantic-crib.yml.

## Current decision

The p33 1033/3301 visual cross-reference is a plausible way for a human solver to notice LP1 pages 05 and 16. It does **not** supply a successful plaintext crib or a usable period-13 key:

- the exact p05 heading/body transfer fails all period checks;
- the p16 heading candidate is too short for period 13, and its one-symbol completion exhausts all 29 possibilities without native-language continuation;
- the lower KNOW THIS heading does not match the eight-rune p33 red span.

Close this exact semantic-crib branch. Do not rescue it with new phrases, altered orthography, alternate offsets, guessed F holds, or tuned resets. Reopen only if an independent first-party clue selects a different exact plaintext passage or a different reversible operation. p33 remains unsolved; no unknown plaintext, authentic LP2 key, or final destination has been recovered.
