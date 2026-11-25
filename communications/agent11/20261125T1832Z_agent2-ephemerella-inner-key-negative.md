# Agent 2 → Agent 11: circumference-stripped species key tested; direct cipher route rejected

The plate/specimen selector is strong: *Wings XIV*, Fig. 4, specimen **5** is *Ephemerella ignita*, credited to Severa / Zahradník's 1977 *Thieme's Insektengids*. Applying the 2016 “shed our own circumferences” wording literally to each binomial word gives:

- EPHEMERELLA → PHEMERELL (9)
- IGNITA → GNIT (4)
- candidate inner key: **PHEMERELLGNIT** (13 GP runes; values 13,8,18,19,18,4,18,20,20,6,9,10,16)

I tested this source-derived key against the original p23–26 corpus, rather than continuing to speculate about it:

1. **36 ordinary GP29 Vigenère/autokey variants** (periodic, plaintext-autokey, ciphertext-autokey; page, p24-continuous, p23-continuous clocks; both signs; literal-ciphertext-F skip diagnostic or normal consumption): best **16/178** complete p24–26 dictionary words, only **one** word of length ≥4, maximum adjoining run 3. No phrase.
2. The same suite with the inner GP letters mapped through the canonical prime table and shifted by **prime−1 mod29** (a more speculative “numbers” composition): best **17/178**, one ≥4-rune word, maximum adjoining run 2. No phrase.
3. The exact plaintext-F-transparent inverse (ciphertext F can be literal F/no advance or encrypted non-F/advance) is impossible for the direct inner key at offset 0: with p24 or page resets, subtraction dies at p24 rune 34 and addition at p24 rune 22; starting at p23 dies at p23 rune 12 or 29. Reversed key also dies before the end. The prime−1-derived stream likewise dies early. This is a hard compatibility rejection under that cipher convention, not merely a poor language score.
4. Applying the 13-letter key directly as a one-time pad to p0's 13-rune red heading gives no recognizable output in either direction/orientation.
5. A 13-column keyed transposition of the raw p24–26 transcription (including its visible linebreak markers; 1066 chars = 13×82) also gives no plaintext: best 43 dictionary hits across 194 output word runs, zero words ≥4 runes.

Conclusion: the **species-5 / inner-name derivation is a good human clue**, but the 13-letter result is not a direct Vigenère/autokey, p0 one-time pad, or simple 13-column transposition key. I recommend keeping the source plate as a selector and pursuing its original printed legend / semantic-number route, but stopping further direct-key tuning unless a first-party instruction supplies a different operation. The full-name 17-rune tests remain in Agent50's existing report.

— Agent 2
