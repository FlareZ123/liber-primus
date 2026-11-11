# p27/p55 repeated 7-gram: periodic-key gate

**Status:** intermediate negative; no plaintext or key recovered.

## Source observation

The exact seven-character ciphertext string ᛞᛄᚢ-ᛒᛖᛁ occurs exactly twice in the first 55 rune-bearing LP2 page segments:

- Physical p27, printed line 2, raw character offset 10; page-local rune offset 28; line-local rune offset 8.
- Physical p55, printed line 4, raw character offset 3; page-local rune offset 70; line-local rune offset 2.

It is six runes with a word separator between two three-rune words. The repeated phrase is a ciphertext observation, **not** a known-plaintext crib. Its two occurrences align under several simple clocks:

- Page-reset rune clock, period 6: offsets 28 and 70 are both phase 4; the six rune phases are [4,5,0,1,2,3].
- Line-reset rune clock, period 6: offsets 8 and 2 are both phase 2; phases [2,3,4,5,0,1].
- Line-reset character clock, period 7 counting the hyphen: raw offsets 10 and 3 are both phase 3; rune phases [3,4,5,0,1,2].

This makes period-6 and period-7 reset clocks plausible hypotheses to test, but does not select either cipher.

## Tests

The canonical transcription was parsed as 55 rune-bearing pages and checked rune-for-rune against resources/liber-primus/lp2-corpus.json: **12,956/12,956** symbols matched. Printed line breaks were retained separately from rune positions.

1. **Phase-specific IoC screen.** For page-reset rune, line-reset rune, and line-reset character clocks, the nonempty phase bins for periods 2, 3, 6, 7, 14 and 21 were measured; period 42 was also tested for the page-reset rune clock. Across these bins, phase IoCs stayed in **0.03282–0.03633** (full ciphertext IoC **0.03448**). Known plaintext controls score **0.06271** IoC for the 95-rune p57 Parable and **0.05969** for the 3,705-rune LP1 plaintext reference. A simple additive periodic key merely Caesar-shifts each phase and preserves its IoC; these source-selected clocks show no English-like phase distribution.

2. **Exact period-6 page-reset key search.** The 29-symbol GP alphabet was searched exhaustively over all 29^6 keys for both Vigenere P=C-K and Beaufort P=K-C. A GP trigram model trained on the first 240,000 characters of resources/control/shakespeare_first300k.txt was fitted on physical pages 0–27 (6,705 trigrams) and evaluated on held-out physical pages 28–55 (6,141 trigrams). Exact factor-table aggregation and variable elimination find the global training maximum, not a heuristic key sample.

| Model | Exact best training score | Held-out score | Best key (GP names) | Repeated anchor output |
|---|---:|---:|---|---|
| Raw ciphertext | −6.24697 | −6.22479 | — | — |
| Period-6 page-reset Vigenere | −6.03150 | −6.23439 | J D D J G R | B W M D A AE |
| Period-6 page-reset Beaufort | −5.97916 | −6.15945 | R F R Y AE F | TH E O EO S T |

The held-out samples remain gibberish. For scale, the same model scores the known p57 plaintext at **−2.57187** and the LP1 plaintext reference at **−2.47790**. The small training improvement is not a decryption; the exact best key does not generalize to readable holdout text.

## Interpretation and scope

The repeated p27/p55 7-gram is a real and unusually specific alignment marker. It is not evidence that the phrase is plaintext, nor that a period-6/7 additive cipher is intended. The period-6 page-reset Vigenere/Beaufort family is exhaustively negative under this GP29 English trigram test. The phase-IoC screen also argues against simple additive periodic keys at the listed page/line clocks and periods, assuming an English-like plaintext register.

This does **not** exclude nonlinear feedback, a true OTP or derived OTP-class stream, arbitrary per-page keys, non-English registers, or another source-selected state machine. Do not respond by broadening to arbitrary periods or key rotations. If the repeated anchor is used again, it should constrain a separately motivated nonlinear/stateful operation rather than trigger another blind additive-key sweep.

## Reproduction

Run from repository root:

node sims/p27_p54_periodic_key_gate.cjs

The script asserts the exact two anchor occurrences, checks the line transcription against the canonical rune corpus, records SHA-256 fingerprints of its three source files, reproduces the phase-IoC screen, and exactly maximizes the period-6 page-reset Vigenere/Beaufort models.
