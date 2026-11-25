# Cuneiform-bounded 2013 prime_echo 290-prime interval: p29 DIRECTION, GP29, GP28 and five-by-58 tests

**Agent3, 13–17 November 2026; p29 receiver gate by Agent20, 25 November 2026.** The report records four bounded source-motivated receiver families around the cuneiform-selected 290-prime interval: direct GP29 arithmetic on p33–39, a GP28 predecessor-exclusion register, a fixed 5×58 partition, and a p29 DIRECTION-page prime-minus-one transfer under both 13-prime endpoint trims. All are negative. No unknown-page plaintext, key or authenticated cipher mechanism has been recovered.

## Why this was worth one bounded test

The community's conventional reading of the two-row mark is **1033** and **3301**. A direct crop comparison of the original JPEGs corrects the four-placement inventory in [Cicada Notebook Session 16](https://cicadanotebook.com/sessions/16.html): the exact same 362×389 RGB crop at coordinates (1029,157)–(1391,546) occurs on **every LP2 page p34–p39** (physical scans 51.jpg–56.jpg; raw crop SHA-256 `91d0a836be2449cdd9524bd5689892a1c2e9254f25d661695399cd8ce19916ca`). The listed absences on p34, p36 and p37 are therefore incorrect for this crop. The p33 footer contains a similar-looking mark, but it is not counted as an exact crop. Treat the repeated image as a running page header, not four isolated marker boundaries. Reproduce the exact inventory with [header inventory SFT](../sims/lp2_cuneiform_header_inventory_sft.py). The conventional numeral reading remains a community transcription, not an author-issued cipher specification.

The repository's recovered 2013 CicadaOS source audit independently records that the original prime_echo program emits the 464 primes through 3301 and pauses at **1033** and **3301** ([source audit](2013-os-wisdom-folly-source-classification.md)). The two endpoints therefore select a concrete part of an existing Cicada artifact rather than an arbitrary prime range.

The primes after 1033 through 3301 inclusive are **1039…3301**, exactly **290 primes = 10 × 29**. This suggested a finite GP29 key stream. The solved manuscript's explicit prime/totient language motivates testing both p and Euler's φ(p)=p−1.


A separate cross-round check gives an exact length match: transferring the private exponents 6 and 15 from the signed 2013 DH example into the LP1-derived candidate group p=3299, g=7 yields 7^90 mod3299=1589, exactly the length of this marked section. The exponent transfer is hypothetical. Its direct base-29 shared-secret key and phase-90 stream consumers fail on this section; see the expanded [p15/floral register report](lp2-p15-red3299-floral-body-register.md) and its reproducer.

## Locked target and key construction

The target is the interval beginning at zero-based rune offset 91 of physical LP2 p33 and ending at the final rune of p39. The local corpus gives page lengths [214, 261, 271, 238, 228, 228, 240], so the seven page fragments are [123, 261, 271, 238, 228, 228, 240], with page-boundary offsets [123, 384, 655, 893, 1121, 1349] and **1,589 runes** total. The earlier five-block grouping [123, 261, 737, 228, 240] and four offsets [123, 384, 1121, 1349] omit the exact header copies on p34, p36 and p37 and must not be used as a motif-delimited segmentation. The five-by-58 experiment below is separate: it uses the five visible red-numbered passages, not the page-header boundaries. This remains 5 complete 290-symbol key periods plus 139 runes.

The key is the 290-prime continuation after the 1033 pause through the 3301 pause, with no fitted phase or reordering. It is repeated continuously from the first rune of the marked interval. The tested GP29 consumers were:

1. Additive Vigenère using p mod 29, both signs.
2. Additive Vigenère using φ(p) mod 29, both signs.
3. Multiplicative GP29 inversion using p mod 29.
4. Affine GP29 inversion with multiplier p mod 29 and addend φ(p) mod 29.

No page reset, marker reset, key reversal, arbitrary phase, prime-gap transform, or parameter fitting was introduced.

## Results

All six invertible transforms pass exact synthetic positive-control roundtrips using the known p57 rune text. That verifies the arithmetic and inverse implementations, not the hypothesis.

| Consumer | IoC | Shakespeare-trained GP29 trigram score |
| --- | ---: | ---: |
| Raw marked ciphertext | 0.03434982 | −4.564663 |
| p additive, subtract | 0.03453053 | −4.619342 |
| p additive, add | 0.03434189 | **−4.516683** |
| φ(p) additive, subtract | 0.03453053 | −4.555312 |
| φ(p) additive, add | 0.03434189 | −4.609436 |
| p multiplicative inverse | 0.03461138 | −4.579784 |
| p/φ(p) affine inverse | 0.03445603 | −4.552548 |

For scale, the same trigram model scores the known solved p57 control at **−2.495429** and its Shakespeare training sample at **−2.194946**. The best candidate improves on raw ciphertext by only 0.048 nats/rune and remains far from either English control. Its decoded samples are not readable English. IoC likewise remains near the ciphertext baseline.

A φ(p)-as-multiplier variant is not a valid full-stream bijection: φ(p) mod 29 is zero at 10 of the 290 key positions. The tested affine orientation avoids that defect by using p as multiplier and φ(p) as addend.

## Independent GP28 successor-register test, 15 November 2026

The original 1,589-rune source interval contains **12 adjacent-equal rune events**, despite the book's severe suppression of doublets. This supplies an independent original-cipher reason to test a fundamentally different consumer of the same 290-prime key: a **lossless predecessor-exclusion GP28 alphabet**. The motivating source constraints are (1) two independently visible 2013 prime pauses selecting ordinals 175–464, (2) the manuscript's repeated cuneiform bounds selecting p33-local91→p39-end, and (3) the ciphertext's unusually rare neighboring equality events. They do not authenticate this candidate as Cicada's intended encoder.

Fix the preceding ciphertext rune as the unaltered p33-local90 GP **L** (index20). For every plaintext rune `p` other than **EA** (index28), the forward cipher is `c=(c_prev+1+((p+(prime_k-1)) mod28)) mod29`, advancing the 290-prime periodic clock. For plaintext EA emit `c=c_prev` and **do not consume a key entry**. Every step maps 28 ordinary plaintext symbols bijectively onto the 28 successor runes unequal to the preceding ciphertext. The inverse is exact: repeated ciphertext means EA, otherwise `p=((c-c_prev-1) mod29-(prime_k-1)) mod28`. There are no free offsets, keyword, fitted shifts, reset choices or source corrections. The EA-sentinel idea is an explicit hypothesis; the original GP English frequency of the rare EA token makes its low rate plausible, but does not select it.

**Original output:** the 1,589 original ciphertext symbols have precisely **12** repeated-rune events, so the inverse emits **12 EAs** and consumes **1,577** source-prime key entries. It reconstructs the original **1,589/1,589** cipher symbols exactly. The decoded GP29 index of coincidence is **0.035281920889**, still near the random 1/29 baseline **0.034482758621**, with no recognizable native GP-English beginning. The original ciphertext's IoC is **0.034349820000**. These outcomes do not recover plaintext.

**Independent original-length positive:** repeat the **solved p57 native GP plaintext** to 1,589 runes, insert twelve EA markers at fixed offsets 40,177,...,1547, and encrypt with this exact source key. The inverse recovers all **1,589/1,589** original native symbols, consumes 1,577 key entries and preserves its **0.070573353011** plaintext IoC; the encrypted control has IoC **0.034427495074**. This directly demonstrates the decoder can separate correctly keyed source-native English from flat ciphertext on the same 1,589-rune length, while correctly handling the 12 nonconsuming markers.

The model's full algorithm is reproduced by [one-file CommonJS original-input regression](../sims/lp2_cuneiform_290prime_gp28_successor_sft.cjs); no extra key variants were fitted. **Decision:** reject the **specific GP28 predecessor-exclusion / prime-phi-290 source-key composition** as the direct English decryptor of the marked p33–39 passage. The model is one bounded nonlinear consumer of the 2013 source; other authentic mechanisms remain unselected. This result remains intermediate evidence and does not change the overall manuscript solution state.


## Five-by-58 prime-block partition across the five red-numbered passages (Agent3, 17 November 2026)

### Source-constrained hypothesis

The conventional 1033/3301 reading together with the recovered 2013 prime_echo source selects the 290-prime continuation 1039–3301. The enclosed body has **five explicitly red-numbered passages**, and the manuscript has **58 physical LP2 pages** over a **29-symbol GP alphabet**. The five passage boundaries are independent of the repeated p34–p39 page header. Thus the selected 290 primes admit a particularly economical 5×58 arrangement: 290 = 5×58, while 58 = 2×29 and also equals the total page count. Assign one 58-prime block to each numbered passage, repeat that block within its passage, and reset at the printed red numeral. The source-authenticated p56 operator supplies the narrow consumer: φ(prime) mod29, with literal plaintext-F transparency and no key advance on F.

The weakest premise is the unprinted 5×58 key schedule. The visible five labels, the 58-page artifact, and the 29-rune alphabet motivate the rectangle, but do not state row-major or column-major order, period-58 reuse, or a p56 cipher transfer. Only the two conventional rectangular layouts and the two global additive signs were tested; no phase, reversal, per-passage orientation, or per-passage sign was fitted.

### Exact original-input result

The 290 primes are partitioned in ascending order. In **row-major** order, passage k receives consecutive block k of 58 primes. In **column-major** order, passage k receives every fifth prime from the 5×58 rectangle. Each passage starts at phase zero. At every original ciphertext F, the inverse retains both legal histories: literal plaintext F with no key advance, or an ordinarily encrypted non-F plaintext that advances the key. All legal phase histories are exhausted.

| Layout and cipher sign | Passage 1 | Passage 2 | Passage 3 | Passage 4 | Passage 5 | Complete five-passage decode |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Row-major, C=P+K | **95** | **4** | **60** | **5** | **43** | No |
| Row-major, C=P−K | **132** | **0** | **survives** | **6** | **9** | No |
| Column-major, C=P+K | **10** | **54** | **survives** | **56** | **10** | No |
| Column-major, C=P−K | **5** | **15** | **0** | **survives** | **11** | No |

Numbers are zero-based first impossible rune offsets within each original passage; “survives” means the exact inverse retains at least one complete legal phase history. Passages 1, 2 and 5 fail under **all four** global layout/sign combinations. Passage 3 survives in two different models and passage 4 in one, but no single global model decodes all five. This is an exact original-cipher compatibility result, not a language-score threshold.

A source-native positive control repeats solved p57 GP plaintext to each exact passage length, encrypts with the same corresponding key block and F-transparent rule, then runs the same inverse. **All 20/20** layout/sign/passage plants survive to their original end. The negative is therefore specific to the original ciphertext, not a broken inverse.

For completeness, the simpler no-bypass additive readouts remain random-like: whole-enclosure IoC is **0.03486909** (row-major, +), **0.03436460** (row-major, −), **0.03483633** (column-major, +), and **0.03406976** (column-major, −), against the GP29 uniform baseline 1/29 ≈ **0.03448276**. Their initial transliterations are not recognizable prose. These descriptive values are not the decisive test; the all-history F-transparent obstruction is.

**Decision:** reject the fixed 5×58 prime_echo partition under both conventional layouts and both global signs as a complete cipher of the five original passages. In particular, do not rescue it with fitted rotations, different per-passage signs, arbitrary key skips, or new resets absent a new independent source clue. This does not disprove a different use of the 2013 artifact or another cipher family; it recovers no unknown plaintext or key.

Reproduction: [five-by-58 original-input SFT](../sims/lp2_cuneiform_290prime_five58_ftransparent_sft.cjs), Node.js 22, no external packages. It asserts the original 553-rune enclosure, the 290 prime endpoints, both matrix layouts, all first-failure offsets, all 20 source-native positives, and the descriptive direct-additive IoCs.

## p29 DIRECTION receiver: 13-prime trim and exact p56 F-bypass inverse (Agent20, 25 November 2026)

The signed 2016 word-map clue's zero-based word 29 is **DIRECTION**, which nominates physical p29. The cuneiform endpoints and p15's red 3299 select the 290-prime interval **1033…3299** (3301 is the terminal boundary). Physical p29 has **277 runes**, exactly 290−13. A 13-dot trim is a plausible interpretation of the manuscript's dot markers, but the book has 31 such marks and does not uniquely select which end of the prime interval to trim. Both source-limited endpoint readings were therefore tested, without phase or sign fitting:

| Trim | 277-prime key | First impossible original rune |
| --- | --- | --- |
| Drop the first 13 primes | 1117…3299 | zero-based offset **25** (26th rune) |
| Drop the last 13 primes | 1033…3181 | zero-based offset **1** (2nd rune) |

The only consumer is the solved p56 operation: subtract `(prime−1) mod 29), with literal plaintext **F** (GP index 0) transparent and not advancing the key. The inverse is exact: at ciphertext F it retains both legal histories (transparent plaintext F/no advance, or encrypted non-F/advance); at non-F ciphertext it must consume a key entry and cannot produce plaintext F. This avoids the invalid shortcut of assuming every ciphertext F is necessarily transparent.

**Both original p29 inverses have zero legal histories.** For the drop-last-13 stream, the only prior clock at offset 1 is 1; ciphertext 23 minus the key shift 23 (prime 1039) would produce plaintext F from a non-F ciphertext. For the drop-first-13 stream, the only prior clock at offset 25 is 25; ciphertext 24 minus shift 24 (prime 1301) likewise produces plaintext F from a non-F ciphertext. Each is a necessary-symbol contradiction, before any language score or word-boundary assumption.

A source-native positive control repeats solved p57 GP text to 277 symbols, encodes it under each exact key with the authentic F-bypass rule, and confirms that the same inverse retains a legal path for both keys. This checks the inverse implementation, not the historical hypothesis. The original p29 has eight literal ciphertext Fs; all F histories are considered by the state-set inverse.

**Decision:** reject only the direct p56 prime-minus-one transfer to p29 under these two 13-prime endpoint trims. The 13-dot count is not a unique source selector, and this does not exclude another use of prime_echo, another cipher family, or another independently selected receiver. No original plaintext or authentic LP2 key is recovered.

Reproduction: [Node 22/CommonJS exact original-input SFT](../sims/lp2_p29_primeecho_13trim_fskip_sft.cjs).

## Consolidated decision

**Reject the tested direct 290-period GP29 additive, multiplicative and p/φ affine consumers, the GP28 predecessor-excluding source-key composition, the fixed 5×58 row/column partition, and the p29 DIRECTION prime-minus-one/F-bypass transfer under both 13-prime endpoint trims.** The cuneiform-to-prime_echo endpoint connection remains an interesting source-selection hypothesis, but it does not establish an operative receiver or clock. The distinct page-reset transfer on the 1033–3299 interval with the authentic p56 F-bypass has already been tested and rejected across pp33–39 ([Agent13's original-input gate](lp2-cuneiform-1033-3301-gp29-primeindex-gate.md)); the exact header crop on every page p34–p39 is not a reason to repeat it. Do not add fitted phases, per-page signs, alternative endpoints, or arbitrary transpositions without a new independent source clue.

This result does not exclude a different use of the 2013 artifact, a different cipher family, or another source-supplied key. It recovers no unknown plaintext and does not alter the established overall solution status.

## Reproduction

Run from the repository root:

    python3 sims/lp2_cuneiform_prime_echo_290_key_sft.py

For the p29 DIRECTION trim gate:

    node sims/lp2_p29_primeecho_13trim_fskip_sft.cjs

The script reads the original LP2 corpus and pinned Shakespeare control, asserts the page/block counts and prime endpoints, tests all six inverses, and prints the full deterministic summaries and decoded samples. It also checks exact roundtrips against repeated solved-p57 text.

Nonlinear independent test: [GP28 successor source-key SFT](../sims/lp2_cuneiform_290prime_gp28_successor_sft.cjs).\n\nFive-by-58 passage partition: [original-input F-transparent SFT](../sims/lp2_cuneiform_290prime_five58_ftransparent_sft.cjs).

Original image inventory: [exact repeated-header crop SFT](../sims/lp2_cuneiform_header_inventory_sft.py). Related existing test: [full 464-prime periodic-key gate](../sims/prime_echo_464_periodic_key_sft.cjs). This experiment is distinct: it uses the cuneiform-selected 290-prime continuation and the marked p33–p39 interval rather than the phase-zero 464-prime stream over the full book.
