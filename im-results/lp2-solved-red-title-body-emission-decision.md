# Solved LP1/LP2 rubric emission: continuous consuming clocks and missing cipher selector

**Director #625, 12 November 2026.** Two original solved LP2 pages demonstrate a **page-level cipher difference with continuous title/body treatment**. Physical p56 encrypts both its red heading and black prose under the same page-local phi(prime) GP29 stream. Physical p57 prints its red heading and black prose directly. The ink color and red 13-dot heading delimiter themselves do not select a cipher mode, key, or clock reset. **No source-grounded decoder for the nine unknown chapters follows from these two solved controls.** This is a precise missing-selector decision, not recovered unknown-page plaintext.

## Original solved emissions

Inputs: [original rune indices](../resources/liber-primus/lp2-corpus.json), [original ink spans and 13/10/23-dot punctuation](../resources/liber-primus/lp2-ink-annotations.json), [original printed word boundaries](../resources/liber-primus/lp2-transcription.txt), independently established [solved p56 GP plaintext](../sims/authentic_lp2_p56_totient_regression.cjs) and p57 original clear prose. JPEGs are physical [p56, image73](../resources/liber-primus/73.jpg) and [p57, image74](../resources/liber-primus/74.jpg).

| Source | Red title in original | Red title after authentic decoder | Black body | Full source reconstruction |
| --- | --- | --- | --- | --- |
| p56, offsets 0–4 | AE-JOESR | AN-END | same phi(prime) stream, continuing after rune 5 | 85/85 |
| p57, offsets 0–6 | PARABLE | PARABLE (literal) | literal GP29 runes | 95/95 |

GP spellings: AE-JOESR are five original runes separated into words of length 2+3; they decode as AN-END. PARABLE is seven original GP runes. The p56 plaintext is **AN END WITHIN THE DEEP WEB ... IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE**. The p57 literal body begins **LICE THE INSTAR TUNNELNG TO THE SURFACE** in GP transliteration and ends **FIND THE DIUINITY WITHIN AND EMERGE**. Both solved records use the same printed red 13-dot header delimiter despite different cipher treatments. p56 additionally prints red **ten-dot punctuation after rune 45**, and a red 13-dot footer after rune 85; p57 terminates after rune 95 with the unique red 23-dot punctuation.

The p56 subtraction shifts are Euler totients of consecutive primes 2,3,5,..., starting **at the first red rune**. One original F at absolute rune offset **56** is literal and does **not** advance the prime clock; the other four ciphertext F positions **35, 47, 51 and 74** are ordinary encrypted output. The correct rule predicts the entire red 5 + black 80 sequence and exactly re-encodes the original 85 runes. Exact source-image punctuation carries no prime reset.

### Frozen counterfactuals

| Model run on original | Exact p56 rune matches /85 | Matches from p56 offset45 /40 |
| --- | ---: | ---: |
| Authentic phi(prime), skip F at 56, no red reset | **85** | **40** |
| Wrong: restart at red-title boundary, offset5 | 6 | 1 |
| Wrong: restart at red ten-dot boundary, offset45 | 48 | 3 |
| Wrong: restart at both boundaries | 8 | 3 |
| Wrong: count the literal F at offset56 as cipher rune | 56 | 11 |

Applying p56's prime-totient cipher unchanged to *all 95* p57 runes matches only **3/95**, including **0/7** of the p57 red heading. A uniform literal renderer fails p56 starting at its first red rune. The two original solved pages jointly exclude a uniform all-plain or all-phi page rule, but two examples cannot identify a predictive page-mode selection function.

## Independent solved LP1 red-title controls (Agent23, 16 November 2026)

The original first-release scans [03.jpg](../resources/liber-primus/03.jpg), [10.jpg](../resources/liber-primus/10.jpg) and [14.jpg](../resources/liber-primus/14.jpg) each show red page-opening text and ornamental rubrication, independently of the two solved LP2 endings. Their source-exact opening text has **two different known cipher treatments**:

| Original LP1 scan | Red title GP runes | Source-authenticated solved reading |
| --- | --- | --- |
| 03.jpg | `SOME WISDOM` (10 runes) | Literal `SOME WISDOM` |
| 10.jpg | `THE LOSS OF DIUINITY` (16 runes) | Literal `THE LOSS OF DIVINITY` (GP U for English V) |
| 14.jpg | `A SWAI` (5 runes) | Encrypted: the known 13-rune `FIRFUMFERENFE` keyword deciphers it to `A COAN` (English **A KOAN**, GP C for K) |

The [single-file original LP1 source-positive](../sims/lp1_solved_red_title_two_mode_source_sft.cjs), successfully executed on [Windows Node22 CI 43828720351](https://github.com/FlareZ123/liber-primus/actions/runs/43828720351), pins the historical second-koan key as GP indices `[0,10,4,0,1,19,0,18,4,18,9,0,18]` and deciphers the p14 unchanged title indices `[24,15,7,24,10]` to `[24,5,3,24,9]`. **Key progression does not restart at the red/black boundary:** the same historical sequence recovers the independent first **49** p14 ciphertext runes, title and black prose together, as `A COAN DURNG A LESSON THE MASTER EXPLAINED THE I THE I IS THE UOICE O...`, with exact 49/49 forward reencryption. The first actual plaintext-F pause occurs at position49, beyond this title/body demonstration. The full 319-rune LP1 koan positive including its two historical F skips was independently established earlier ([source-known-key decoder](lp2-ftransparent-word-lexical-viterbi.md)).

The same **red-page-initial** rubrication is therefore applied to clear and encrypted titles in the *first* release as well as the second. A literal-all-red rule fails p14/p56; applying one historical cipher to all red headings fails LP1 p03/p10 and LP2 p57. Known keys explain each solved emission but neither ink color, ornamental initials nor a 13-dot LP2 title mark selects a key for an unknown page. **For Director #1211, the missing source-selected mode/key remains an exact prerequisite:** no independent rule predicts three unknown titles and their next 80 black runes. Other title dictionaries or arbitrary key search would revisit closed #625/#1100/#1172 without an authored selector.

## Section holdout: internal red spans and exact consuming-state identifiability (#2600)

The earlier opening-only demonstrations leave open a distinct question: an *internal* red rubric might reinitialize an existing cipher. Freeze a single conditional law from the second KOAN (14–15.jpg) and p56: **ink transitions and large punctuation consume no key symbols and do not reset the current consuming state**. Independently known key and plaintext-F transparency are premises. This law is not a cipher-family selector.

The held-out section is the already-solved WELCOME (03–04.jpg), using its documented GP29 DIVINITY key, source spelling `WIDSOM` and the original page layout. Direct visual inspection of 04.jpg establishes the second red drop-cap heading, WIDSOM, at rune offsets 394–399, black continuation at 400, and an entirely red terminal AN INSTRUCTIAN / COMMAND YOUR OWN SELF block at 485–514. The original first-page title spans offsets 0–6; the physical page boundary is 251. This is a **retrospective leave-section-out transfer**, not a newly blinded historical discovery. The key and authentic plaintext are public; the exact plaintext reference is used only as a comparator in the state-lattice calculation.

For ciphertext rune c and absolute consuming count j, a plaintext-F-transparent additive decoder admits a nonconsuming edge j→j only if c=0; a consuming edge j→j+1 exists exactly when (c−K(j)) mod29 ≠0. Forward propagation followed by reverse viability yields *all* states belonging to a complete valid path. No lexical scoring or F mask from known plaintext is used by this lattice. Exact reference replay supplies the historical state and scores each wrong reset independently.

| Section / boundary (rune offset) | Historical consumed count | Ciphertext-only viable counts (known key) | Exact full matches with reset there |
| --- | ---: | --- | ---: |
| second KOAN, title end 5 | 5 | 5 | 79/319 |
| second KOAN, next physical page 226 | 224 | 224 | 248/319 |
| p56, title end 5 | 5 | 5 | 6/85 |
| p56, digest edge 45 | 45 | 44,45 | 48/85 |
| WELCOME, title end 7 | 7 | 7 | 18/515 |
| WELCOME, next physical page 251 | 244 | 242,244 | 320/515 |
| WELCOME, internal red start 394 | 387 | 385,387 | 398/515 |
| WELCOME, internal red end 400 | 393 | 391,393 | 404/515 |
| WELCOME, terminal red start 485 | 475 | 473,475,477 | 486/515 |
| WELCOME, terminal heading end 497 | 487 | 485,487,489 | 498/515 |

The genuine continuous-clock references re-encode **319/319**, **85/85** and **515/515** respectively. Complete ciphertext-only legal path counts are **3**, **22**, and **2,240**; the WELCOME internal black-body start admits phases **1 or 7 modulo8**, including the historical phase1. The opening phase7 is uniquely identified only after full-ciphertext viability; its printed title itself contains a ciphertext F. Thus even with a known historical key, source ink does not uniquely determine the absolute consuming count at all internal red transitions. The continuity law predicts the right *transition*, but not necessarily the actual numerical state without independently resolving Fs. Red terminal command text also demonstrates that red ink is not limited to semantic labels.

### One frozen unknown-page transfer

For the independently proposed p7 five-red-word-product Vigenère key [11,26,8,15,2], earlier p8 experiments began at the 243-rune black receiver, phase0. The source p8 12-rune red heading contains no ciphertext F. Under the conditional solved continuity law, the full page must consume 12 symbols before its black body, entering at phase2 with no skip ambiguity. The exact phase is selected by the physical rubric, not by a phase sweep. Standard historical subtraction is fixed.

The complete original p8 F-transparent state lattice becomes empty at **page rune index99**, black-body index87. Its sole predecessor state is j=98; the printed C[99]=15 equals K[98 mod5]=15, demanding a plaintext F whose ciphertext would have to be zero. Therefore no plaintext can satisfy this specific full-page inverse, irrespective of language or dictionary coverage. The independently clear p57-derived 255-rune plant retains its valid path and re-encodes all 255 runes. The earlier body-local phase0 negative remains separate. See the consolidated [p7 product-key report](lp2-p7-red-product-repeating-vigenere-p8-gate.md).

**Decision:** retain same-mode continuous rubric treatment as a useful conditional clock constraint, including internal color changes. Do not infer an unknown section's actual key, cipher mode or ambiguous F state from rubrication. This closes the #2600 transfer without unknown plaintext and without generalizing a negative result to all red rubrics.

Reproducer: [exact absolute-state CommonJS SFT](../sims/lp2_rubric_continuous_state_holdout_sft.cjs), executed against freshly fetched checked-in source bytes; the solved GP references are `resources/external/relikd-solved-gp29-native-v1.json`. No CI execution is claimed.

## Nine unknown physical chapter openings

| Chapter | Red opening | Red heading rune structure | Red 13-dot at heading end? |
| --- | --- | --- | --- |
| 0–2 | p0 | 13 | yes, offset13 |
| 3–7 | p3 | 16 | yes, offset16; additional red fragments inside chapter |
| 8–14 | p8 | 12 | **no**; p14 closes with red13 |
| 15–22 | p15 | 9 then 11, separated by red13 at offset9; red13 at 0 and20 | yes, after each red unit |
| 23–26 | p23 | 16 | yes, offset16 |
| 27–32 | p27 | 19 | yes, offset19 |
| 33–39 | p33 | 10, plus inner 8-rune red span at offset91 | yes, after 10 and inner 8 |
| 40–53 | p40 | 8 | **no**; p53 closes with a 51-rune red span and red13 |
| 54–55 | p54 | 9 | yes, offset9 |

A heading-to-body cipher switch *at red13* fails as a universal source-defined interface, since red13 is absent at two of the nine opening headings. No original instruction selects either solved cipher or its key for the seven others. p56's literal-F exception has no source-unambiguous transfer to unknown text. p15 and p33 multi-header cases add uncertainty about which heading would control black text.

## Decision and next step

The solved evidence supports a single emission mode and a continuous consuming clock across both initial and internal rubric boundaries **conditional on the authentic cipher**. P56 uses its page-local prime-totient mode and p57 is literal. The independent WELCOME internal-rubric holdout supports continuity while showing that its numerical state can remain ambiguous even with the key. This does not predict an unknown page's mode. Incompatible extension rules fit both solved controls equally. Earlier [global red Atbash](lp2-all-red-original-atbash-gate.md), [red-heading self-key Vigenere](lp2-red-heading-self-key-vigenere-gate.md), and [shared additive pad after red headings](red-title-body-key-reuse.md) already fail original-input gates. No arbitrary heading cipher/key searches are justified by the solved samples.

**Actionable prerequisite:** independently authentic source evidence that determines a cipher family and key for one unknown heading plus following black words, including literal-marker behavior and page clock. Freeze that rule before using the original unknown ciphertext to evaluate it.

**Reproduction:** [single-file CJS regression](../sims/lp2_solved_red_title_body_emission_sft.cjs) checks all 180 solved runes, ink positions, prime exceptions, four negative controls, p57 literal and p56 exact re-encryption. It uses only checked-in repository source files.
