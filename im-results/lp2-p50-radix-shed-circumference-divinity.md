# Candidate radix shedding yields DIVINITY / TUNNELNG shell matches and a p55 address

**Agent48, 18 November 2026. Classification: candidate source-structure/navigation interpretation, not a validated decoder. No unknown LP2 plaintext, final key, KDF, or complete cipher inverse is recovered.**

**Independent core-key consumer check (22 November 2026, Agent12):** After the already proposed two-shell peel, the unmodified 28×4 core's **112 five-state shed differences** form a **255-bit** big-endian base-five integer, fitting one 32-byte field without lossy truncation. The exact original input yields the candidate 256-bit zero-padded value `55f78eab5d76f4d9f577829b25c560fbc83e7a5ff90e1381be067f7957995987`. This is a useful finite *possible* key shape, but the source gives no AES instruction, nonce or key-use mechanism. Its direct AES-256-CTR zero-IV GP29 receiver leaves every original chapter near uniform; direct AES-256-ECB/CBC from original p52/p54/p55 base29 byte representations produces no plaintext or valid PKCS#7 padding. The exact test and matched digit-histogram size calculation are in §7a below. This **does not authenticate a key** or change the existing radix/receiver fork.

**Later adjudication (22 November 2026):** The p50 shell arithmetic and candidate `TUNNELNG→p55` address remain intermediate evidence; the historical `prime_echo` boundary and repeated `DJU/BEI` handoff to p27:28 remain independently selected. The downstream p27 GP0/base59 word-map extension is not authenticated: its immediate NEXT pair `AEF/P` maps to p195:4, outside LP2 pages0–55. Director #1709's familywise blind gate independently rejects the broader p27 GP0→p50 convergence. Do not claim a completed `p55→p27→DIVINITY→red13/3301` route or use it as a key. See [the updated DJU/BEI circuit assessment](lp2-dju-bei-base59-word-map-circuit.md) and [the familywise blind gate](lp2-p27-djubei-familywise-blind-gate.md).

**Unresolved radix fork (22 November 2026):** This report tests a conditional drop-`f` base59 reading. A separate p29/p50 test reports a shared GF(29) double root24 under conventional base60 but not under f-deleted base59, conditional on the inferred p39 high-first polynomial and p29/p50 association. That is competing evidence for base60, not proof of a global radix. Neither branch is selected by an original digit legend or explicit radix instruction. Keep this base59 shell interpretation conditional; do not combine it with base60 into an invented dual-radix decoder. See [the p29/p50 root24 decision](lp2-p29-p50-shared-root24-quotient-common-codeword-decision.md).

## Literal p15 4×4 tiled spiral: two directional word links, but no decipherment (Agent3, 25 November)

The p15 original (scan32) fixes the exact 4×4 center-out clockwise route: local row-major indices `[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]` starting at red 3299 and moving right. The conditional two-shell p50 core has shape 28×4, i.e. seven consecutive congruent 4×4 tiles. Independently of their values, read each tile by that same p15 route, and concatenate tiles in ordinary top-to-bottom printed order. This is a specific candidate use of p56's plural “spirals”; the original does not explicitly select this tiling, peel count or base59. No rotation or tile ordering is fitted. Let GP0(word) index this 112-cell tape; the original cell's f-deleted base59 value is its pointer.

Two newly observed literal directional links:

| Input | Address | Original 32×8 cell (zero-based) | Token | Output |
|---|---:|---:|---|---|
| TUNNELNG | 94 | 203 | 18 | 67 = SURFACE |
| FIND | 42 | 93 | 1O | 83 = EMERGE |

These are forward, nonadjacent within-clause word links, not the Agent39 WE↔MUST cycle. TUNNELNG→SURFACE is a particularly direct semantic match to “tunneling to the surface”; FIND→EMERGE links the two verbs of the final clause. The candidate does not implement all directions: WE→168, MUST→118, and no adjacent p57 pair matches. The exact continued traces are `94→67→81→38→198` (38=WITHIN) and `42→83→88→142`. Both leave the 112-address domain and cannot be assigned a next operation from the present source. All 18 in-domain word instances exit; of all 112 starting addresses, 111 exit, and only address80 is a fixed point.

For a descriptive matched null, the 44 distinct ordered GP0 pairs within the three p57 clauses (excluding the title, retaining repeated-word addresses only once per ordered pair) are evaluated on the fixed 112-cell traversal. Of 100,000 xorshift32-seeded (3301) Fisher–Yates permutations preserving the core value multiset, 2,518 contain ≥2 forward within-clause links; seven contain these exact two links. The exact specific-pair probability is 1/(112×111)=0.00008044 because each output value occurs once. The semantic pairs were identified after seeing the fixed traversal's outputs; their exact-pair rate is **not** a prospective significance estimate. The 2.518% clause-family rate also does not charge prior choices of radix, peel, tiling, traversal and word-sum convention. No authorship claim follows.

**Orientation comparison:** a rectangular inward traversal that starts bottom-left and moves right (the reverse of the p15 4×4 outer-shell route) gives no adjacent p57 pair and exits from all 112 starting addresses. Agent39's top-right/down clockwise whole-core route does reproduce `25↔51` but is a closed two-cycle, with no next destination; other in-domain p57 words exit. That orientation is not uniquely selected by the p15 graphic. The literal tile operation above is a separate hypothesis, not proof that it should replace that route.

**Direct original-cipher receiver:** reduce the ordered base59 values modulo29, treat them as one repeated 112-rune additive key, with historical literal plaintext-F bypass, no consuming F or fitted substitutions. Exact phase reachability grants all initial phases. For the complete unknown tape (12,956 runes), every phase dies at rune285 (zero-based), and eight of nine physical-page ranges have no complete path. The physical ranges tested start at pages 0,3,8,15,23,27,33,40,54; these are physical rather than section-boundary-adjusted ranges. The terminal p54–55 range (308 runes) has precisely four legal plaintexts, all starting at phase72, not the source-fixed phase0. Native bigram MAP, trained on all eight other solved registers excluding p57, selects a nonprose path of −4.03617 nats/rune; it exactly reencrypts, as required. The held-out 308-rune repeated p57 plant encoded at phase37 has 18,385 legal paths across fourteen starts, recovers true phase37 and 306/308 true runes, at −2.62207 nats/rune (true plaintext −2.62271). The two other rectangular spiral keys have zero full paths for all nine physical ranges; ordinary consuming subtraction of all three keys gives whole-book IoC .034489/.034457/.034468 respectively. The terminal candidate has no readable sentence or source-selected phase.

**Disposition:** reject these literal periodic additive receivers; do not extend them to arbitrary phases, KDFs, tile permutations or fitted substitutions. Keep the two conditional word-pointer links as a possible navigation clue only, pending an independently motivated typed interpretation of the two exits. No new plaintext or authenticated key. [Standalone CJS reproducer](../sims/lp2_p50_p15_tile_spiral_receiver_sft.cjs); its component functions were executed against the connected canonical JSON data, not separately run under Node CI. The original p15 route was directly inspected in the supplied JPEG; grid values and p57 words use the established canonical transcription rather than another complete manual re-transcription.

## Conditional base59 branch (not a selected global radix)

This report evaluates one candidate reading of the p50 table. The clear p57 phrase `WE MUST SHED` and the p28 DH shared value2 motivate testing a drop-`f` base59 conversion and two shell peels; they do not specify which digit to remove, a global radix transition, or the table's value/receiver semantics. The exact shell sums and `TUNNELNG→p55` pointer below are reproducible consequences of this chosen branch, not proof that the creator intended it.

Under this branch, interpret `SHED` as removing the only unused base60 digit `f`, producing a 59-symbol alphabet, and define the candidate amount shed at each original cell as:

`D(i) = value60(i) - value59(i)`.

Independent p28 DH geometry supplies shared value **2**. Under this branch, use it as the peel count and remove two complete rectangular circumferences from the physical 32×8 table. The surviving 28×4 object contains **112 cells = φ(GP-prime(SHED))**. Its exposed circumference has **60 cells = φ(GP-prime(MUST))**.

Now sum the source-defined shed values on the two surviving circumferences:

- exposed depth2 circumference: **105 = GP0(DIUINITY)**;
- sole circumference within it: **94 = GP0(TUNNELNG)**.

The two outer discarded shell sums, 162 and146, match no solved p57 GP0 word.

Under the candidate base59 pointer interpretation, the geometry can be read as implementing the parable's directional language. `GP0(SURFACE)=67` is an address on the inner `TUNNELNG` circumference. Under this candidate base59 pointer map, original cell67 is `3C=189`, moving in one edge onto the exposed `DIUINITY` circumference. Cell189 is also `3C=189`, the unique global fixed point.

The candidate inner label gives a typed table lookup:

`TUNNELNG=94 → p50[94]=0u → base59 55`.

Under the pre-transition base60 control the same token is56. Across the entire solved p57 vocabulary, **TUNNELNG is the only word whose post-switch base59 table value lands in terminal physical pages54–57**, and it maps to the last unsolved physical page **p55** under this candidate convention.

That destination was independently source-selected before this result. The historical finite `prime_echo` family uniquely identifies the p54–p55 boundary300 when both player-visible pause values1033 and3301 are required; `GP-prime(EMERGE)=300`. The first intact repeated complete-word pair after that boundary is `DJU / BEI`, whose only other adjacent occurrence is p27. The candidate navigation chain is therefore, up to the independently selected p27:28 handoff:

`radix SHED → shared2 peel → TUNNELNG → p55 → EMERGE(300) → DJU/BEI → p27:28`.

This remains a candidate source-internal p50→p55 bridge, not a decryption. The later p27 GP0/base59 continuation to p39/p50 fails its immediate NEXT pair AEF/P and does not authenticate a further DIVINITY/red13/3301 destination.

## 1. Candidate source sequence for the base59 branch

The base59 branch interprets the following source observations as an ordered transition; the source does not explicitly state that the p50 table changes radix:

1. conventional base60 reaches `CIRCUMFERENCES → PARABLE → FIND → 28`;
2. the source-selected p28 word yields a DH151 public value66 and shared value87;
3. cell66 is radix-independent `WE=25`;
4. clear p57 continues `WE MUST SHED`;
5. `GP-prime(MUST)=186`, so `φ(186)=60`;
6. `GP0(MUST)=51 → p50[51]=0x → 59` under the still-active base60 reading;
7. lowercase `f` is the sole unused digit in the 60-symbol printed alphabet;
8. This motivates testing an order-preserving drop-`f` base59 alphabet;
9. under this branch, frozen shared87 decodes as `SHED=64` only in base59.

Separately, the physical p28 line6 DH23 state is:

`p=23, g=5, a=6, B=19, b=15, A=8, K=2`.

The present experiment uses only the already fixed shared value `K=2` as a radial peel count.

## 2. Candidate shed field under the f-deleted base59 interpretation

The printed 60-symbol alphabet is:

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`.

Under this branch, the 59-symbol alphabet removes the sole unused character `f`:

`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx`.

For each unchanged original two-character token, subtract its base59 numerical value from its prior base60 value. No rune, token, table position, modulus, coefficient, orientation, or plaintext score enters the definition.

Across all256 cells:

- `D(i)` takes only values0–4;
- the complete shed-value sum is507;
- the exact concentric-shell sums are **162, 146, 105, 94** from outside inward.

This is the arithmetic difference implied by the candidate `60→59` interpretation. The source selection of the radix change and the subtraction field remains unresolved.

## 3. Shared2 motivates a two-shell peel

The physical 32×8 table has four complete rectangular circumferences:

| Depth | Circumference cells | Shed-value sum | Solved p57 GP0 match |
| ---: | ---: | ---: | --- |
| 0 | 76 | 162 | none |
| 1 | 68 | 146 | none |
| **2** | **60** | **105** | **DIUINITY** |
| **3** | **52** | **94** | **TUNNELNG** |

The independently derived DH shared value2 removes depths0 and1. Depths2 and3 remain.

Their combined area is:

`60 + 52 = 112 = 28×4 = φ(GP-prime(SHED))`.

The newly exposed surface itself has:

`60 = φ(GP-prime(MUST))`

cells.

Thus the clear adjacent instruction words `MUST SHED` numerically describe the selected object's exposed circumference and total remaining area at the same time that they define the numeral-state change.

## 4. Shell sums match the solved p57 words

On the selected 28×4 object:

`Σ D(depth2) = 105 = GP0(DIUINITY)`.

The only circumference strictly within it is depth3:

`Σ D(depth3) = 94 = GP0(TUNNELNG)`.

No other physical shell has either sum.

This is more specific than merely noticing that a table total equals a solved word. The shell depth was fixed by DH shared2 before the shed-value sums were inspected, and the two matching p57 words are consistent with the geometry: the inner object is TUNNELNG inside the exposed DIVINITY surface.

A deterministic matched calibration permutes the exact 256 shed values over the fixed 32×8 positions while preserving their entire multiset. In 100,000 seeded shuffles, depth2 has sum105 about 1.2% of the time, while the ordered conjunction depth2=105 and depth3=94 occurs about 0.02% of the time. These frequencies are post-discovery scale diagnostics only. They are not historical authorship probabilities and do not correct the broader search process.

## 5. SURFACE gives a candidate one-edge pointer

Clear p57 has:

`GP0(SURFACE)=67`.

Address67 is physically on the depth3 inner circumference.

The selected base59 map gives:

`p50[67]=3C=189`.

Address189 is physically on the exposed depth2 circumference. It carries the same original token:

`p50[189]=3C=189`.

The candidate one-edge transition is:

`SURFACE67, inner ring → 189, exposed ring → fixed`.

Under the candidate base59 pointer map, this is an exact one-edge movement from the TUNNELNG-labelled inner circumference to the DIVINITY-labelled exposed surface. It also lands on the already established DH coordinate `189=23×8+5=(p,g)`.

The longer functional graph from arbitrary word starts wanders among shell depths, so this result does **not** promote shell depth as a universal semantic decoder. The one-edge SURFACE transition is the useful typed consequence.

## 6. TUNNELNG maps to a candidate p55 address

The recovered inner-shell label is actionable under the already established solved-word map:

`GP0(TUNNELNG)=94`.

Original cell94 is `0u`.

- conventional base60: `0u=56`;
- selected drop-`f` base59: `0u=55`.

The candidate post-SHED state therefore maps to physical **p55**, while the pre-transition control maps to solved p56.

Across all20 p57 words, six post-switch base59 values lie in the 0–57 physical-page range. Only one lies in terminal pages54–57:

`TUNNELNG → 55`.

This gives the radix transition a downstream discriminating consequence that was not used to choose the transition.

## 7. P55 already has an independent EMERGE handoff

Existing historical work on the finite 2013 `prime_echo` source was completed before this p50→p55 route.

When both exceptional player-visible pauses1033 and3301 are required, the source-bounded first-exhaustion family uniquely selects terminal-chapter boundary **300**, immediately after p55 line3. Clear p57 independently has:

`GP-prime(EMERGE)=300`.

After that boundary, discard the partial carried word and take the first two intact complete words. They are:

`DJU / BEI`.

That pair has exactly one other adjacent occurrence in the complete manuscript, on p27. Independent `FIND→28` navigation then selects its exact p27 offset.

The candidate shell route therefore reaches this independently selected terminal handoff:

`TUNNELNG94 → base59 55 → p55 → EMERGE300 → DJU/BEI → p27`.

The p55 historical selector and repeated-pair result are independent of the present shell arithmetic. They are documented in `im-results/lp2-primeecho-terminal-duplicate-mapline.md`.

## 7a. Source-shaped 255-bit inner-core candidate and direct AES-256 original-input gate

The previously defined *conditional* 60→59 **shed difference** is an unsigned digit in **0..4** at each original table cell. After the independently hypothesized DH shared2 removes the first two 32×8 shells, the retained original **28×4** region has exactly **112 such base-five digits**. Reading those 112 digits in printed row order, without using any ciphertext score, gives the unambiguous integer

`0x55f78eab5d76f4d9f577829b25c560fbc83e7a5ff90e1381be067f7957995987`,

of **255-bit** length, zero-left-padded to a conventional **32-byte / 256-bit AES key candidate**. Its original first twelve base-five digits are `002230213011`; the 112 digits sum to **199**. This is mathematically interesting because no bits need be discarded to fit a 256-bit register. However **AES is nowhere selected by this source-derived shell route**, and the alphabet/radix choice and peel count remain conditional. The core does not become genuine recovered *cryptographic key material* until it decrypts an independently preserved ciphertext or passes a source-authenticated keyed verification.

A deliberately tight, unoptimized trial uses AES-256-CTR from a **zero 128-bit counter/IV**, one keystream byte per unchanged GP29 ciphertext rune, `P_i=C_i−(AES_byte[i] mod29) mod29`, with a **single clock across all 12,956 original unknown runes**. No image resampling, AES key hash, fitted nonce, word resets, chosen phase or altered symbol order enter this first receiver. Original decoded coincidence indices are:

| Exact source interval | Original runes | Decoded GP29 coincidence |
| --- | ---: | ---: |
| p16–21 training corridor | 1,613 | **0.034311787** |
| p40–53 untouched floral | 3,008 | **0.034432733** |
| p54–55 untouched terminal | 308 | **0.034519227** |
| p55 alone | 76 | **0.033333333** |
| Entire unknown book | 12,956 | **0.034503028** |

These are approximately uniform (1/29≈0.03448276) and yield no coherent original paragraph. An authentic solved-p57 GP-native positive encoded under the *same* key and byte-to-GP operation recovers **1,613/1,613** and **3,008/3,008** known runes. The original full-text reencryption also succeeds (expected algebraic replay, not confirmation of the key).

A second typed original-byte consumer treats each complete original p52, p54 and p55 GP rune page as a single most-significant-first **base29 integer**, left-padded to a whole 16-byte AES block count, then directly decrypts with the same key under AES-256-ECB and AES-256-CBC with zero IV. Original input lengths are respectively **160, 144, 48 bytes**. None of the **six** native decryptions has valid PKCS#7 padding or recognizable UTF-8/ASCII prose. For p55 alone, the 76 actual rune digits encode a **369-bit** integer that needs **one leading zero byte** to occupy three complete 16-byte AES blocks; the two outputs have only **13/48** and **19/48** printable ASCII bytes. The positive source-solved language CBC/ECB plants reencrypt and recover exactly. These are deliberately narrow, finite, direct readouts, so their failure does not invalidate the 112-digit numerical source object or all imaginable cryptographic consumers.

A source-marginal calibration further limits interpretation of the key length. Under uniformly random rearrangement of the **exact observed 256 shed digits** (frequencies `[36,62,62,63,33]`) into the 112 fixed core positions, the exact sequential hypergeometric prefix probability that the 112-digit integer fits **any 256-bit slot** is **0.036598654649**, and the probability of the observed **exact 255-bit length** is **0.009096829271**. These values are **post-discovery, uncorrected** for having selected a particular radix, peel count, orientation and conventional key size; they are context for the numerology, not independent evidence that Cicada encoded AES-256.

**Decision:** Retire the two literal AES readout families only. Do not treat the 255-bit fit, full 32-byte hex string, native AES inversion or shell word matches as a recovered key or original plaintext until an independent Cicada-authored operation specifies encryption, counter/IV and target. The complete [read-only Node22 CJS source gate](../sims/lp2_p50_shed_core112_aes256_original_sft.cjs) asserts exact original input, key material and positives; Windows [first successful key/CTR+ECB/CBC run 45009239653](https://github.com/FlareZ123/liber-primus/actions/runs/45009239653), with exact-histogram calibration appended and rerun [45009342023](https://github.com/FlareZ123/liber-primus/actions/runs/45009342023).

## 7b. Direct signed BASE29 integer transport of the SHED field

The genuine 2013 Cicada BASE29 converter supplies a second more historically direct possible consumer of the source-conditioned radix-shed field. Rather than grouping D digits into triples/quartets or claiming a symmetric key, regard all original **base-five digits** on the displayed rectangular scope as **one most-significant-first integer**, and write its exact canonical base29 representation. Four complete physical table scopes, each predetermined by an integer number of discarded original circumferences (0, 1, 2 or 3), yield:

| Original circumferences removed | Source base5 digits | Exact base29 rune digits | GP29 decoded IoC | Literal GP transliteration prefix |
| ---: | ---: | ---: | ---: | --- |
| 0 | 256 | 123 | **0.033719845** | `THEPXTEIAAYHLEAONXCN...` |
| 1 | 180 | 87 | **0.031275060** | `UFOEBWFNTRAEBUXEA...` |
| 2 | 112 | 53 | **0.036284470** | `OXNGNEHDUEOLWAIJJ...` |
| 3 | 52 | 25 | **0.043333333** | `UPHUEAIXGSICAE...` |

The unpeeled result begins with GP runes `TH, E, P`, yielding the literal prefix `THEP` in the transliteration. The remaining **119 runes** have no continuous readable plaintext. Its full original-scope IoC is *below* uniform 1/29. The 53-rune twice-shed candidate also lacks prose and cannot be equated with the source red51 closing segment merely because their lengths are nearby. No word boundaries or length trims are fit; these are **raw canonical digit streams**, and four candidate scopes were available. The short English-looking prefix is therefore only an isolated coincidence and supplies no decoder.

A genuine solved-p57 register of 95 native GP rune indices was independently converted to a complete base-five integer and recovered **95/95** with the very same reversible BASE29 parser, establishing that lack of original text is not an arithmetic implementation error. [Original-input CommonJS SFT](../sims/lp2_p50_shed_base5_base29_full_integer_sft.cjs), [Windows Node22 PASS45010188236](https://github.com/FlareZ123/liber-primus/actions/runs/45010188236).

**Authenticated solved-p56 cipher as an exact second stage:** The original p56 `AN END` uses the prime-totient GP29 running shift `prime(index)-1 mod29`, with one transparent original plaintext-F at rune56. That authentic published stream is independently reproduced **85/85** by the updated source SFT with that fixed interruption. As a single historically supported second stage, apply the *uninterrupted* running-totient key from its initial prime2 to each original SHED→BASE29 stream, retaining each natural length and runic order. The four GP29 outputs have coincidence indices **0.036652006**, **0.034750067**, **0.037010160** and **0.056666667** for peels0–3, lengths123/87/53/25; none forms a continuous readable passage. The first123 begins `UTNHGGJGRNM...`; the twice-shed 53 begins `THEOBOHAEWE...` without a grammatical continuation. The 25-rune high IoC is too short to establish plaintext. **No F positions are independently selected for an unknown table-derived output**, so this is only the natural uninterrupted precedent, with no secret-position fitting, and its rejection does not exclude a future authored stateful interruption rule. [Updated Windows Node22 source test](https://github.com/FlareZ123/liber-primus/actions/runs/45010467444).

**Decision:** Retire direct no-key full-integer SHED→BASE29 prose. The original full 256-digit D field and inner112 key-shaped object still exist as exact mathematical source-derived values. Neither transport gives unknown plaintext or specifies a source-authenticated further permutation/decryption. If a newly recovered first-party instruction chooses a particular scope and a new keyed transformation, that would constitute a new hypothesis requiring an untouched original passage, rather than a reason to tune these outputs retroactively.


## 7c. Spiral-addressed two-shell core pointer: WE ↔ MUST (provisional)

This is a conditional receiver test distinct from row-major pointer variants. Its actual source motivations are the marked p15 numerical spiral, p57’s instruction to shed our own circumferences and find the divinity within, and the authenticated [2016 message](../resources/historical/cicada2016-4gq25-outguess.asc) about words, map and numeric direction. **Source correction:** solved p56 does not contain the phrase “path of spirals”; neither does the preserved LP1 p11 translation contain “their numbers are the direction.” The latter is in the 2016 message, not an independent LP1 p11 clue. The source supports investigating spirals and numerical directions, not this specific address representation or fitted start.

The two-shell peel leaves a 28×4 core from the original 32×8 table. Use the p57 GP0 word sum as an address into a spiral ordering of that core, and the cell's base-59 value (remove lowercase `f` from the 60-symbol alphabet) as the next address. The complete p57 solved sequence contains 20 words; its adjacent `WE` and `MUST` addresses are 25 and 51.

Across all eight dihedral spiral orientations, both radices, and both full-table/core scopes (32 configurations), the **only adjacent p57 word edge** is:

`WE(25) → MUST(51)`

It occurs in the twice-shed 28×4 core, base59, clockwise spiral starting at the core's top-right corner (the 90° counterclockwise matrix transform followed by the standard clockwise spiral). It is reciprocal:

| p57 word/address | Spiral position | Original 32×8 cell (0-based row, column) | Token | Base59 next address |
| --- | ---: | ---: | --- | ---: |
| WE / 25 | 25 | 221 (27, 5) | `0q` | 51 = MUST |
| MUST / 51 | 51 | 66 (8, 2) | `0P` | 25 = WE |

The radix change is essential: `0q` is 52 in base60 but 51 in base59; `0P` remains 25 in either radix. Thus the literal `SHED` operation closes the WE↔MUST two-cycle. The other 18 adjacent p57 word pairs do not map under this selected variant. The full 20-word list, all 32 controls, physical-cell trace and deterministic reproducer are in [`lp2_p50_core_spiral_wordpointer_sft.cjs`](../sims/lp2_p50_core_spiral_wordpointer_sft.cjs).

A 100,000-permutation null (seed `0x3301`), shuffling the 112 core base59 values while preserving their multiset and testing all eight spiral orientations, gives:
- specific WE↔MUST mutual cycle: 259/100,000 (0.259%);
- any mutual cycle among distinct p57 word addresses: 5,209/100,000 (5.209%);
- one-way WE→MUST edge: 13.679%;
- any adjacent p57-word edge: 62.625%.

So the one-way edge alone is not surprising; the reciprocal WE/MUST cycle is the notable feature. The 0.259% figure is conditional on this specific source-selected word pair and the tested spiral family, not a global p-value; the broader any-word-pair familywise rate is 5.209%.

**Independent fixed-receiver continuation (Agent13, 25 November):** an independent turn-on-boundary walk reproduces both cells; original image 68.jpg numeric row5 column6 is `0q`, and 66.jpg numeric row9 column3 is `0P` (one-based local coordinates). The complete graph has only cycles 18 and 25↔51; the latter's entire basin is {25,51,76,111}. MUST never reaches SHED. **No surviving core cell has value64 (SHED) or55 (p55)**, so no rearrangement of the 112 cells gives either as a direct next address. Full-table cell87 (token `15`, depth0) is the only value64; cells94/245 (`0u`, depth1) are the only value55. All were discarded. The frozen TUNNELNG orbit is 94→81→173, DIUINITY105→174, EMERGE83→69→82→191 (out of range). P56 IS also has GP0=25, aliasing WE. Even an arbitrary deterministic GP0→GP0 map cannot represent the entire ordered parable: THE=20 requires three distinct successors78/67/105 and TO=OWN=19 requires two successors20/131. Extra state is necessary for that interpretation. The original marked p15 spiral (32.jpg) runs clockwise outward from interior red3299, ending bottom-left; literal inward reversal begins bottom-left going right counterclockwise. That transfer to the core yields WE→193, MUST→189, zero adjacent p57 edges. The bilateral p49/p51 ornaments do not mark the fitted top-right corner. Retain the local numeric cycle, but retire the exact static graph as a complete parable-word or p55 navigation receiver. A separately source-selected state change is necessary. No new plaintext/key. [Independent SFT](../sims/lp2_p50_core_spiral_continuation_sft.cjs) · [full orbits](lp2-p50-core-spiral-continuation.json).

**Dynamic receiver relaxation:** every peel depth0–3, four corners, both handednesses, inward and reversed outward indexing, and both radices (128 configurations) was granted independently at every word edge. Only **2/19** adjacent p57 pairs have any compatible configuration: WE25→MUST51 (depth2, TR clockwise inward, base59, cell221) and WITHIN38→AND56 (depth1, TR counterclockwise inward, base60, cell245). MUST51→SHED64 has zero support; so do all other adjacent pairs. Thus even arbitrary dynamic switching among these 128 standard spiral/shell/radix states cannot turn the ordered parable into a direct consecutive-word path. This is stronger than the static-graph negative and does not require choosing a state-transition schedule. No alternate address function or arbitrary extra data is excluded. [Exact relaxation SFT](../sims/lp2_p50_spiral_dynamic_wordpath_sft.cjs) · [all edge domains](lp2-p50-spiral-dynamic-wordpath.json).

**Status: local provisional numerical structure, not a decryption.** The top-right clockwise start is the unique match among the eight standard spiral orientations, but no independent visible start marker has yet selected that corner. The static graph cannot reach SHED or p55, as shown above; no unknown LP2 plaintext. Do not conflate this raw base59 pointer map with the separate five-state base60−base59 difference field or interpret those differences as literal compass directions. Only a separately source-selected state change or representation would reopen this receiver.

## 8. Research consequence

The p50 arithmetic remains a candidate structural interpretation, not an established cipher mechanism. There is an unresolved radix fork: the SHED/DH-shell branch below uses conditional base59, while the p29/p50 root24 test conditionally favors conventional base60 if the inferred p39 high-first polynomial and p29/p50 relation are intended. No original source fixes a global digit legend, so neither branch is established and they must not be merged into a dual-radix state machine:

- **WE MUST SHED** is the source-motivated candidate for the 60→59 numeral-state change;
- the independently derived DH shared value2 selects peeling two physical table circumferences;
- the resulting shell sums match the solved p57 spellings `DIUINITY` and `TUNNELNG`;
- the `TUNNELNG` lookup gives a candidate p55 address in base59;
- the historical `EMERGE=300` boundary and repeated `DJU/BEI` pair provide an independent handoff to p27:28.

The chain stops at p27:28. The proposed GP0/base59 word-map continuation from DJU/BEI to p39/p50 fails on the immediate forward-order holdout AEF/P: p50 cells25/13 decode to p195:4, outside LP2 pages0–55. Director #1709 separately retires the broader p27 GP0→p50 convergence after its familywise blind gate. Therefore the full p55→p27→DIVINITY→red13/3301 route is not established. A distinct p15/p57/2016-motivated spiral-core base59 pointer candidate now gives the reciprocal p57 WE↔MUST cycle (see §7c), but the exact static continuation is now excluded for SHED and p55; the local cycle remains provisional.

Do not use the shell matches or repeated-pair loop as a key, plaintext, or complete navigation solution. The next useful work must resolve the radix/receiver fork with a source-selected operation and an original-text holdout, or recover the missing historical page/key. Further generic pointer variants would repeat failed branches.

## Reproduction

`sims/lp2_p50_radix_shed_circumference_divinity_sft.cjs`

Windows Node22 PASS at the exact p55/EMERGE assertions: [run 44423794786](https://github.com/FlareZ123/liber-primus/actions/runs/44423794786).
