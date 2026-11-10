# Reusing the authentic LP1 DIVINITY key on unsolved LP2

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

## Conclusion

Direct reuse of the authentic LP1 DIVINITY Vigenère key across LP2 is not supported. This does not exclude reuse of the keyword in a different role, a different cipher layer, or a source-dependent key schedule; those would need separate clues and should not be conflated with direct Vigenère reuse.

## Reproduction

Run from the repository root:

    node sims/lp2_divinity_key_reuse.cjs

The script reads pinned resources, verifies that the key matches the established LP1 recovery script, emits source hashes and all 32 scores, and reports the best decoded samples. No CI workflow was created or modified.
