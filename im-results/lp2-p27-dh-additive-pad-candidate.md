# p27 DIVINITY core: provisional DH-derived additive-pad candidate

**Classification: local 8-rune candidate only. No unknown LP2 plaintext, authenticated KDF, or page decoder recovered.**

This note records a reproducible alternative to the already-rejected direct DH-derived cube on the p27 core. The additive operation maps one source-selected 8-rune core to the expected p57 word, but the exact key serialization order is not fixed by an explicit source instruction. Treat it as a live, falsifiable candidate—not an established decryption.

## Source-selected objects

- The full signed 2016 words-map message, including its opening `Hello`, has one-based word20 `their` and word27 `numbers`. The phrase **their numbers are the direction** plausibly supplies the coordinate **p27 / word20**. This coordinate interpretation is a hypothesis, but it selects the 12-rune word at p27 rune offset79: `EORNSOOCAEYEE`.
- Removing two outer runes at each end, as directed by p57's **WE MUST SHED OUR OWN CIRCUMFERENCES**, leaves the 8-rune core `NSOOCAEY`, GP29 indices `[9,15,3,3,5,24,18,26]`.
- The p57 clear target is `DIUINITY` (GP29 transliteration of DIVINITY), indices `[23,10,1,10,9,10,16,26]`, with GP-prime sum376.
- The existing p28 report independently selects p28 word28 from the p57 `FIND→28` route. Its line6 is the visible DH line.
- The signed 2016 message has word29 `the` and word30 `direction`; the existing p29 self-index report selects p29 word30 `JYJE` and gives its H4 packet.

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

1. The **values** in the pad are traceable to p28/p29 source objects, but the exact concatenation order `[b,g,K,p−1,p+K,g⁻¹,K,F]` is not yet explicitly selected by a first-party instruction. This is the weakest premise.
2. The output `DIUINITY` is already suggested by the clear p57 instruction; this is not recovery of unknown plaintext.
3. Repeating the eight-symbol vector with period8 over p27 or p29 does not produce prose. The candidate is local to the eight-rune core, not a page decoder.
4. The signed 2013 DH protocol supplies no documented KDF or payload cipher. Do not infer that the shared secret2 is a GP29 additive key merely because it participates in this candidate.

## Decisive next test

Derive the key serialization **blindly from p28/p29 only**, without looking at the p27 core or target, and determine whether a source-ordered readout uniquely gives the same eight values in the same order. Then seek one independent source-selected holdout. If the order cannot be fixed before consulting the core, or no independent consequence follows, retire the pad as a retrospective numerical fit.

Reproduce from the original canonical transcription and corpus with:

~~~sh
node sims/lp2_p27_dh_additive_pad_candidate_sft.cjs
~~~

The SFT reports the exact source selectors, H/H4 values, candidate pad, plaintext, checksum relations, and negative repeated-period controls. It deliberately labels the result **candidate-only**.

Related established inputs: `im-results/lp2-p27-divinity-dh-cube-receiver-gate.md`, `im-results/lp2-p57-find28-p28-centerword-dh87-loop.md`, `im-results/lp2-p29-direction-selfindex-packet.md`, and the signed 2016 source `resources/cicada2016-4gq25.md`.