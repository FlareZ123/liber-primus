# p27 DIVINITY core: provisional DH-derived additive-pad candidate

**Classification: DH-state-selected 8-rune receiver with a retrospective local additive-pad fit; the entire cyclic-order periodic-key rescue is excluded in the finite intact-word register below. No unknown LP2 plaintext, authenticated KDF, or page decoder recovered.**

This note records a reproducible alternative to the already-rejected direct DH-derived cube on the p27 core. The receiver is now independently constrained by the local DH state: p27 fixes `B=19,K=2`, zero-based word19 is `EORNSOOCAEYEE`, and literal depth2 shedding gives `NSOOCAEY`. The additive operation maps that selected 8-rune core to the expected p57 word, but the exact key serialization order is not fixed by an explicit source instruction. The exact target fit is retained as historical evidence; the cyclic-order rescue has failed.

## Receiver selection and remaining source-order ambiguity

- The earlier signed-2016 `their`/`numbers` coordinate reading was ambiguous. A newer local route removes that dependency: p6/p23/p24–26 fixes the DH state up to two `(b,B)` branches; p27 red fields select `(b,B,K)=(15,19,2)`; **B=19** as a zero-based p27 word number selects the 12-rune word at offset79, `EORNSOOCAEYEE`. Charging every state value as index, both origins, every state value as shedding depth, and every p57 word as target leaves only **B=19 / K=2 -> NSOOCAEY -> DIUINITY** by exact length and prime sum. See `lp2-p27-dh-state-word19-divinity-receiver.md`.
- Removing two outer runes at each end, as directed by p57's **WE MUST SHED OUR OWN CIRCUMFERENCES**, leaves the 8-rune core `NSOOCAEY`, GP29 indices `[9,15,3,3,5,24,18,26]`.
- The p57 clear target is `DIUINITY` (GP29 transliteration of DIVINITY), indices `[23,10,1,10,9,10,16,26]`, with GP-prime sum376.
- The existing p28 report proposes p28 word28 from the p57 `FIND→28` route. That selector has not yet been reconciled with one common page/word indexing convention.
- The signed 2016 message has one-based word29 `the` and word30 `direction`; using word30 to select p29 word30 likewise mixes a one-based word ordinal with a project-page label. The p29 word30 `JYJE` packet is a candidate input, not an independently authenticated coordinate.

## Source values and candidate pad

Use the circumference pair transform `H(x,y)=(x−y,x+y) mod29` and the existing H4 outside-in serialization.

| Source object | Calculation | Result | DH role |
|---|---|---:|---|
| p28 line6 first pair | `H(23,8)` | `[15,2]` | `[b,K]` |
| p28 line6 length | 23 runes | `p=23` | modulus |
| p28 word28 length | 5 runes | `g=5` | generator candidate |
| p28 word28 outer shell | `H(28,20)` | `[8,19]` | `[A,B]` |
| p28 word28 inner shell | `H(24,1)` | `[23,25]` | `[p,p+K]` |
| p29 word30 | `H4([11,26,11,18])` | `[22,15,8,0]` | `[p−1,b,A,F]` |
| p28 DH generator inverse | `5⁻¹ mod23` | `14` | `g⁻¹` |

The source-derived values permit the following **candidate serialization**:

`[b,g,K,p−1,p+K,g⁻¹ mod p,K,F] = [15,5,2,22,25,14,2,0]`.

Subtracting this 8-symbol vector elementwise from `NSOOCAEY` modulo29 gives `DIUINITY` exactly. The arithmetic is reversible: adding the same vector back recovers the original core.

## Cross-checks

These checks make the candidate worth an independent source-order audit, but they do not prove the serialization:

- The core's GP0 sum is **103**; the original p50 table cell103 is byte **206 = 2×103**, matching the DH shared value `K=2`.
- The candidate pad's GP-prime sum is **309 = 3×103**. The p27 red heading length19 and 13-dot marker give `H(19,13)=[6,3]`, so the second component is **e=3**.
- The target's GP-prime sum is **376**; `376−309=67`, the **19th prime**, matching the red-heading length19.
- The ciphertext core and target independently share GP-prime sum376, the existing p57 DIVINITY selector.

These are source-linked arithmetic consistencies. Because the pad was recognized after examining the selected core and target, they are not independent prospective validations.

## Critical limitations

1. The **p27 receiver coordinate is now independently constrained** by the local `B=19,K=2` state route. Coordinate ambiguity still affects some *pad-source* objects on p28/p29; the new receiver selection does not authenticate those inputs or their ordering.
2. The **values** in the pad are traceable to proposed p28/p29 source objects, but the exact concatenation order `[b,g,K,p−1,p+K,g⁻¹,K,F]` is not explicitly selected by a first-party instruction. This is the weakest premise.
3. The output `DIUINITY` is already suggested by the clear p57 instruction; this is not recovery of unknown plaintext.
4. Repeating the eight-symbol vector with period8 over p27 or p29 does not produce prose. The candidate is local to the eight-rune core, not a page decoder.
5. The signed 2013 DH protocol supplies no documented KDF or payload cipher. Do not infer that the shared secret2 is a GP29 additive key merely because it participates in this candidate.

## Source-order decision and exact unknown-order key inverse (Agent42, 26 November 2026)

The source sentence still does not by itself assign its pronouns/nouns to ordered page and word coordinates, so that old coordinate grammar remains underdetermined. However, the fitted p27 object no longer depends on it: the local DH-state route independently selects p27 zero-based word19 by `B=19` and its depth2 core by `K=2`; the complete state-index/origin/depth charge leaves only the DIUINITY checksum hit. The DIRECTION self-index and proposed p28/p29 pad-source coordinates remain separate convention questions. The stronger receiver selection does not authenticate the additive key. The proposed eight pad values also interleave the two components of H(DH) with the line's fragment count, jump to p29, return to the p28 inner shell, insert a derived inverse modulo23, duplicate K and return to p29 for F. The actual source order does not fix those jumps or their operand roles. See the [signed-source grammar decision](lp2-signed2016-manuscript-grammar-source-gate.md) and [literal DH source](lp2-p28-dh-line6-source-reconstruction.md). This is a source underdetermination, not a theorem forbidding every imaginable serialization.

To make the missing ordering a recoverable key variable instead of guessing more serializations, freeze only the **post-fitted** multiset {0,2,2,5,14,15,22,25}. Enumerate all 7!/2! = 2,520 cyclic keys with the unique zero at origin, all eight independent starting phases for each printed group, both signs, and ordinary consumption versus native plaintext-F holds (F emits zero and does not consume a shift). This covers every ordering, rotation and reversal of the fitted eight entries and all continuous-clock specializations. No arbitrary values, nulls, or other periods are added.

Exact solver: for every finite native dictionary candidate P of the same rune length as original C, form the required shift tape sign*(C-P) mod29; in F-hold mode remove only P=0 positions, which must have C=0. Every remaining value beyond the first eight must repeat the corresponding earlier value. Index all prefixes of all rotated candidate keys and collect the supported key IDs per source group. This is exhaustive over the specified key multiset and finite vocabulary, with a generous independent phase per group. The word support count does not depend on printed group order. The TextBlob spelling source, standard GP contraction and ING/IO alternate produce 33,369 distinct rune forms, including one-rune abbreviations. The source page tapes are checked against the canonical corpus.

The fit uses p28's 52 eligible groups, excluding its literal DH line6 (offsets117–139 inclusive) and endpoint fragments. The two other original tests exclude p27's heading, fitted 12-rune target word and terminal fragment (47 groups); and p29's fitted word30 and endpoint fragments (68 groups). These are untouched by this key-order fit, not globally novel manuscript holdouts. The multiset itself was obtained retrospectively from the p27 crib, so even positive cross-validation would not establish an independent KDF.

| Sign / F mode | Maximum p27 support over every key | Maximum p28 fit support | Maximum p29 support over every key | p29 support among p28 fit winners |
| --- | ---: | ---: | ---: | ---: |
| + ordinary | 21/47 | 17/52 | 29/68 | 23/68 |
| + F-hold | 21/47 | 17/52 | 29/68 | 19–22/68 |
| − ordinary | 19/47 | 17/52 | 26/68 | 19–21/68 |
| − F-hold | 19/47 | 17/52 | 27/68 | 16–22/68 |

The per-page maxima even permit the three pages to select different keys; they are upper bounds on a shared-key model. Every key needs at least 26/35/39 OOV groups respectively, versus the frozen 5% budgets of 2/2/3. Best shared support is 58/167. There is no key within the budget. Isolated short word matches are abundant and do not identify coherent text.

Calibration: four hidden distinct cyclic orders, one for each sign/hold mode, use four overlapping 100-word windows from the solved LP1 reference filtered to in-register forms, independently chosen deterministic group phases, 60 fit and 40 withheld words. Each fit uniquely recovers the exact planted cyclic key, and 160/160 withheld true words remain among the exact inverse candidates (124/160 unique). These are known-family planted controls, not four independently authored literary donors. The connected V8 core executed on original data and controls; the Node wrapper has been saved but has not separately run under Node or CI.

- [Executable SFT](../sims/lp2_p27_dh_pad_multiset_cyclic_inverse_sft.cjs)
- [Exact original and control output](lp2-p27-dh-pad-multiset-cyclic-output.json)

**Decision:** retire the repeated eight-entry pad, including every possible cyclic ordering of its exact multiset, for native intact-word GP29 additive/F-hold decoding of these passages. Preserve the original local fit as a retrospective numerical relation. This does not exclude nonperiodic serialization, a one-use instruction token, or an alternative register/segmentation. Do not extend the fitted multiset to arbitrary variants without a first-party operation that fixes the new values and their consumer.

Reproduce from the original canonical transcription and corpus with:

~~~sh
node sims/lp2_p27_dh_additive_pad_candidate_sft.cjs
~~~

The SFT reports the exact source selectors, H/H4 values, candidate pad, plaintext, checksum relations, and negative repeated-period controls. It deliberately labels the result **candidate-only**.

Related established inputs: `im-results/lp2-p27-divinity-dh-cube-receiver-gate.md`, `im-results/lp2-p57-find28-p28-centerword-dh87-loop.md`, `im-results/lp2-p29-direction-selfindex-packet.md`, and the signed 2016 source `resources/cicada2016-4gq25.md`.