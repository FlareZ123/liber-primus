# Reusing the authentic LP1 DIVINITY key on unsolved LP2

The full-book authentic LP1 key transfer and a further **source-selected p55 strict-word-interior DIVINITY test** both fail to recover unknown GP29 plaintext. A separate later selective literal-F bigram Viterbi study of both authentic LP1 keys also finds no LP2 language; see [the skip-mask study](lp2-historical-vigenere-skip-viterbi.md).

**Classification: bounded negative for direct key reuse.** The authentic Vigenère key recovered from LP1 pages 03–04 does not produce English-like plaintext when transferred directly to LP2 pages 0–55.

## Source-derived hypothesis

The repository's [authentic LP1 p03/p04 recovery](../sims/authentic_lp1_p03_p04_vigenere_recovery.cjs) establishes a GP29 Vigenère-subtraction key:

- Key indices: [23, 10, 1, 10, 9, 10, 16, 26].
- GP transliteration: D I U I N I T Y (the GP alphabet merges U/V; the intended Latin keyword is DIVINITY).
- In the recovered p03/p04 stream, 11 specific ciphertext F positions are recorded as literal and do not consume key positions. For LP2, the tested generalization was to treat every F as literal/non-consuming; the alternative was to consume a key position for every rune.
- The original LP1 recovery carries key phase continuously across pages 03–04.

This is a concrete historical mechanism and key, not a guessed keyword. A human solver might reasonably ask whether the same key was reused elsewhere in the manuscript. The transfer test therefore keeps the cipher operation fixed and varies only the plausible starting phase, page clock, and literal-F treatment.

## Test

Original LP2 input is resources/liber-primus/lp2-corpus.json: 55 rune-bearing unsolved pages, 12,956 runes. The 32 configurations are:

- Eight starting phases of the established 8-rune key.
- Global continuous phase or reset at each page.
- Treat ciphertext F as a literal, non-consuming symbol or process it as an ordinary Vigenère symbol.

No reverse key, Atbash, new transposition, or fitted per-page key was introduced.

As in the adjacent source-key gate, settings are ranked on the first 90 runes of 25 pages 0–27 with at least 180 runes, then frozen and scored on the next 90 runes of 22 pages 28–55 with at least 180 runes. The same smoothed GP29 trigram model is trained on the first 240,000 characters of the pinned Shakespeare control. Scores are average conditional log probability in nats per scored rune; less negative is more English-like.

## Result

The best of all 32 settings is:

- Page-reset clock.
- Starting phase 3.
- Literal-F skip enabled.
- Vigenère subtraction with the authentic DIVINITY key.

Its training score is **−6.085958** and its untouched holdout score is **−6.309511**. Applying it to complete LP2 pages gives **−6.213561** overall and **−6.252783** on pages 28–55. The page-28 output begins:

    O AE U S L T Y OE Y EO E J I Y Y I EA S EO F Y L T B D X D F S T A EO J OE EO M X H T X E EA F W R P TH I OE R S F L N D OE G EA M C TH OE D C R Y OE EO F NG EA F L N W X TH C T F T EO F T W IA B NG S A

This is not recognizable plaintext.

The most direct transfer of the authentic LP1 clock—global continuous phase 0 with literal-F skip—scores **−6.200952** on training and **−6.247175** on holdout. The raw LP2 ciphertext scores **−6.179907** and **−6.215354** respectively. For scale, a deterministic random 5,000-symbol GP sequence scores **−6.254534**, while the known LP2 plaintext controls for pages 56 and 57 score **−3.473939** and **−2.420295**.

The best training fit does not generalize. Neither the exact source clock nor any of the 31 nearby phase/clock/F variants recovers language.

## More literal p57 instruction: DIVINITY on the 43 runes within p55 words

The solved p57 instruction says to **shed our own circumferences** and **find the divinity within**. This singles out a different original-cipher target from the earlier whole-book key transfer: strip the first and last rune of each original *complete* printed word on p55, then use the historical GP29 Vigenère key `DIVINITY` on the remaining interior stream in order. There is a second historical cue for the key: the actual LP1 stage 03/04 inverse uses `DIVINITY`, mapped by original GP spelling to indices **[23,10,1,10,9,10,16,26]**. The all-numeric p50 and image artwork are not used.

The p55 beginning rune is a **carry from p54**, so p55 has one 1-rune incoming fragment and **16 complete new words** with 75 runes, of which **43 are strict interiors**. The exact source p55 word-length sequence is **[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**. The sole F cipher rune in the selected interior stream occurs at zero-based position **11**. The direct GP29 inverse is `P[i]=(C[i]-K[j mod 8]) mod29`, with phase0 and no guessed offsets. Two historically motivated clocks are distinguished: all 43 cipher runes consume a key symbol, or the ciphertext-F at position11 remains literal and does not consume a key symbol, mimicking the solved earlier LP1 F-bypass convention.

| Fixed original p55 interior treatment | Key consumed | IoC of decoded 43 runes | Rune J count | Recoverable GP29 prose? |
| --- | ---: | ---: | ---: | --- |
| Direct DIVINITY, all runes consume key | 43 | **0.05094131** | **7/43** | No |
| Direct DIVINITY, ciphertext F literal/non-consuming | 42 | **0.03322259** | **3/43** | No |

For comparison, the untouched original p55 interior stream has IoC **0.03433001**, and a frozen 43-rune substring of the truly solved p57 has IoC **0.05647841**. The no-skip output's relatively elevated IoC arises alongside **seven GP J symbols** in just 43 positions; it is not readable source-GP English. Its exact output is:

`AE F J AE X NG J IA D A IA M C F O R J O W J J C W U M IA J H U AE IA N NG TH U NG N E D OE J U B`

The literal-F treatment is still cipher-like:

`AE F J AE X NG J IA D A IA F R U N X H M IA L I G P J T X TH B F Y R M E E NG U H M F O H B H`

The [new independent 43-rune SFT](../sims/p55_divinity_within_43_sft.cjs) asserts every original p55 word offset and key index, both frozen forward round-trips, and an exact forward/inverse on 43 original **solved p57 plaintext runes** as a positive source-language plant. The literal-F variant's inverse is replayed with its fixed original bypass mask; it does not assert that all arbitrary plaintexts can be encoded losslessly under an unspecified F-detection rule.

**Decision:** the p57 phrase provides a compelling human-facing proposal for both *target* and *historical key*. The direct authentic GP29 Vigenère consumer does not recover plaintext under either originally motivated F convention. This is a bounded failure of the proposed direct 43-rune operation, not a verdict on p57's instructions, p55's possible underlying language or another uniquely sourced reversible mechanism.

## Conclusion

Direct reuse of the authentic LP1 DIVINITY Vigenère key across all LP2, **including the specifically motivated 43-rune strict p55 interiors**, is not supported. This does not exclude reuse of the keyword in a different role, a different cipher layer, or a source-dependent key schedule; those would require a separately sourced operation.

## Reproduction

Run from the repository root:

    node sims/lp2_divinity_key_reuse.cjs

The script reads pinned resources, verifies that the key matches the established LP1 recovery script, emits source hashes and all 32 scores, and reports the best decoded samples. No CI workflow was created or modified.
