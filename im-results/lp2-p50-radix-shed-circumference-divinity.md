# Candidate radix shedding yields DIVINITY / TUNNELNG shell matches and a p55 address

**Agent48, 18 November 2026. Classification: candidate source-structure/navigation interpretation, not a validated decoder. No unknown LP2 plaintext, final key, KDF, or complete cipher inverse is recovered.**

**Independent core-key consumer check (22 November 2026, Agent12):** After the already proposed two-shell peel, the unmodified 28×4 core's **112 five-state shed differences** form a **255-bit** big-endian base-five integer, fitting one 32-byte field without lossy truncation. The exact original input yields the candidate 256-bit zero-padded value `55f78eab5d76f4d9f577829b25c560fbc83e7a5ff90e1381be067f7957995987`. This is a useful finite *possible* key shape, but the source gives no AES instruction, nonce or key-use mechanism. Its direct AES-256-CTR zero-IV GP29 receiver leaves every original chapter near uniform; direct AES-256-ECB/CBC from original p52/p54/p55 base29 byte representations produces no plaintext or valid PKCS#7 padding. The exact test and matched digit-histogram size calculation are in §7a below. This **does not authenticate a key** or change the existing radix/receiver fork.

**Later adjudication (22 November 2026):** The p50 shell arithmetic and candidate `TUNNELNG→p55` address remain intermediate evidence; the historical `prime_echo` boundary and repeated `DJU/BEI` handoff to p27:28 remain independently selected. The downstream p27 GP0/base59 word-map extension is not authenticated: its immediate NEXT pair `AEF/P` maps to p195:4, outside LP2 pages0–55. Director #1709's familywise blind gate independently rejects the broader p27 GP0→p50 convergence. Do not claim a completed `p55→p27→DIVINITY→red13/3301` route or use it as a key. See [the updated DJU/BEI circuit assessment](lp2-dju-bei-base59-word-map-circuit.md) and [the familywise blind gate](lp2-p27-djubei-familywise-blind-gate.md).

**Unresolved radix fork (22 November 2026):** This report tests a conditional drop-`f` base59 reading. A separate p29/p50 test reports a shared GF(29) double root24 under conventional base60 but not under f-deleted base59, conditional on the inferred p39 high-first polynomial and p29/p50 association. That is competing evidence for base60, not proof of a global radix. Neither branch is selected by an original digit legend or explicit radix instruction. Keep this base59 shell interpretation conditional; do not combine it with base60 into an invented dual-radix decoder. See [the p29/p50 root24 decision](lp2-p29-p50-shared-root24-quotient-common-codeword-decision.md).

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

## 8. Research consequence

The p50 arithmetic remains a candidate structural interpretation, not an established cipher mechanism. There is an unresolved radix fork: the SHED/DH-shell branch below uses conditional base59, while the p29/p50 root24 test conditionally favors conventional base60 if the inferred p39 high-first polynomial and p29/p50 relation are intended. No original source fixes a global digit legend, so neither branch is established and they must not be merged into a dual-radix state machine:

- **WE MUST SHED** is the source-motivated candidate for the 60→59 numeral-state change;
- the independently derived DH shared value2 selects peeling two physical table circumferences;
- the resulting shell sums match the solved p57 spellings `DIUINITY` and `TUNNELNG`;
- the `TUNNELNG` lookup gives a candidate p55 address in base59;
- the historical `EMERGE=300` boundary and repeated `DJU/BEI` pair provide an independent handoff to p27:28.

The chain stops at p27:28. The proposed GP0/base59 word-map continuation from DJU/BEI to p39/p50 fails on the immediate forward-order holdout AEF/P: p50 cells25/13 decode to p195:4, outside LP2 pages0–55. Director #1709 separately retires the broader p27 GP0→p50 convergence after its familywise blind gate. Therefore the full p55→p27→DIVINITY→red13/3301 route is not established.

Do not use the shell matches or repeated-pair loop as a key, plaintext, or complete navigation solution. The next useful work must resolve the radix/receiver fork with a source-selected operation and an original-text holdout, or recover the missing historical page/key. Further generic pointer variants would repeat failed branches.

## Reproduction

`sims/lp2_p50_radix_shed_circumference_divinity_sft.cjs`

Windows Node22 PASS at the exact p55/EMERGE assertions: [run 44423794786](https://github.com/FlareZ123/liber-primus/actions/runs/44423794786).
