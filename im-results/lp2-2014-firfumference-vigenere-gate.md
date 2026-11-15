# Corrected original 2014 circumference key, exact LP2 transfer

**Decision (15 November 2026):** The historically validated 13-rune GP29 key is **`FIRFUMFERENFE`**, with F at position 12 (one-based). A former version of this report and its executable used `FIRFUMFERENCE`, with C in that slot. That was an incomplete source-control check. Both original-LP2 experiments have now been recomputed with the correct key. The direct continuous and word-interior applications still yield no unknown plaintext, with their exact earlier scores retired.

## Why the correction matters

The primary physical 2014 LP1 pages 14–15 (the first two Stage10 JPEGs, original scan files `14.jpg` and `15.jpg`) contain 319 encrypted runes. The first 36 form the recoverable plaintext `A COAN DURNG A LESSON THE MASTER EXPLAINED THE I` when read as GP29 rune tokens, with `NG` a single glyph. Under `P_i=(C_i-K_{i\bmod13})\bmod29`, the corrected key recovers **36/36**, while the prior key misses **exactly original positions 11 and 24**, both at its erroneous key slot. This check is on the original source transcription, rather than an inferred LP2 candidate. Both have exactly 13 positions; the corrected index11 is F=0 where the obsolete index11 is C=5.

The 2014 sixth-onion `/008` historical README/solving program uses the less successful spelling `FIRFUMFERENCE`, while its later `/009` README and independent 2014 walkthrough use `FIRFUMFERENFE`. The original fully solved first 36 runes independently resolve the spelling disagreement. The former report's claims that `/008` and an archived 317-rune positive established the obsolete spelling were too strong, particularly against the 319-rune original physical record. Plaintext-F skipping can change alignment later in the solved passage, but none of the first 36 known runes requires such skipping. The corrected key is not newly recovered LP2 key material.

Original source and independent context:
- [Original 2014 sixth-onion solved-page materials](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/008-sixth-onion)
- [Original 2014 stage report with the corrected string](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014))
- Original `resources/transcriptions/liber_primus_master.txt` and `resources/liber-primus/lp2-corpus.json`

## Two original LP2 inverses, source-corrected

The externally supplied LP2 cue remains the solved p57 admonition to shed one's circumferences. That gives a motivated historical key to test, although it does **not** specify applying it to unknown LP2 or resetting its clock.

**Direct full-rune schedule:** At zero phase, concatenate all 55 rune-bearing unknown physical pages p0–55 (12,956 ciphertext runes; p50 has none), and subtract the 13-rune correct key, without reinserting a skip or changing the input alphabet. The exact corrected GP indices are `[0,10,4,0,1,19,0,18,4,18,9,0,18]`; corresponding shifts `[29,19,25,29,28,10,29,11,25,11,20,29,11]`. Original raw IoC is 0.034478397865; corrected output IoC is **0.034483056926**. All three GP29-trigram scores remain at the original cipher's random-like level:

| Independently trained 700-rune native GP model | Original ciphertext | Corrected continuous inverse |
| --- | ---: | ---: |
| Emerson | −4.361516 | **−4.355107** |
| Gibran | −4.437846 | **−4.420092** |
| Shakespeare | −4.435810 | **−4.412554** |

These are small improvements of 0.0064–0.0233 nats/rune, versus native p56/p57 scores around −2.6 to −3.0. The 12,956-rune inverse contains no coherent passage, so this does not recover unknown plaintext.

**Word-interior schedule:** Under the independently source-visible p57 “circumferences” hypothesis, strip the first/last rune of each of 2,896 original complete unknown words, preserving words continued across line/page breaks. Concatenate **7,247** interior runes and apply the same corrected key from phase zero. Raw interior IoC is 0.034473457585; corrected IoC **0.034443331001**. The corrected scores worsen on all three matched models:

| Model | Original 7,247 interiors | Corrected key inverse |
| --- | ---: | ---: |
| Emerson | −4.357298 | **−4.381539** |
| Gibran | −4.429005 | **−4.444168** |
| Shakespeare | −4.424953 | **−4.451088** |

This rejects these two **frozen**, originally motivated direct GP29 consumers, assuming source-native English-like prose and unchanged word boundaries. It leaves other transfer mechanisms, specially marked F positions, and external keys open. Neither a native wrong-key roundtrip nor isolated four-rune fragments should be treated as a solve.

## Reproduction

The updated [standalone Windows/Node CJS reproducer](../sims/lp2_2014_firfumference_vigenere_gate.cjs) verifies the original 319-rune LP1 input and 36/36 source-key control, positively diagnoses the obsolete key's exactly two mismatches, checks the corrected key vector, evaluates all original 12,956 LP2 runes and all 7,247 interior runes, and includes a 700-rune synthetic encrypt/decrypt positive.

Use `node sims/lp2_2014_firfumference_vigenere_gate.cjs` from the repository root. The correction changes the former numerical findings; any study importing `FIRFUMFERENCE` as an authentic source key must replace it with `FIRFUMFERENFE` or explicitly label it a different conditional candidate. The full 56 unknown physical LP2 pages remain undeciphered.
