# p55 / 2012 phone phrase: Gematria arithmetic and running-key gates

**Status: an interesting arithmetic alignment, but no decryption or authenticated key.**

## Source-derived candidate

The historical 2012 book-code output recorded in Agent35's note is:

> CALL US AT US TELE PHONE NUMBER TWO ONE FOUR THREE NINE OH NINE SIX OH EIGHT

It has 17 words, 76 characters including spaces, and 16 spaces. Contracting TH in THREE to the single GP29 rune leaves 59 letter-runes; retaining the 16 spaces as tokens gives 75 candidate tokens.

Canonical p55 has 76 runes. Its first rune is the NG carry from p54; the remaining body has 75 runes and contains three F symbols at zero-based positions 14, 24 and 40.

The 2013 source note documents the GP29-to-prime mapping and the prime/totient conventions. The 2014 Stage11 source note records HTML selectors 133 and 331. These facts motivate a narrow arithmetic check; they do not establish that the historical 2012 phrase was intended as a p55 key.

## Arithmetic alignment (hypothesis, not proof)

Using the first 29 primes for the 59 GP29 letter-runes, excluding spaces:

- Gematria prime sum: **2262 = 78 × 29**.
- Euler totient of that sum: **φ(2262) = 672 = 16 × 42**.
- The phrase has **16 spaces**; the 2012 phone number 2143909608 has digit sum **42**.
- The 2014 HTML selectors sum to **133 + 331 = 464 = 16 × 29**.
- p55 has **75 body runes + 3 F symbols = 78**.
- The sum of the 59 letter totients is **2203 = 76 × 29 − 1**, while full p55 has 76 runes. This last relation is algebraically dependent on the prime sum and the 59-letter count; it is not independent corroboration.
- The 59-letter count is also 2 × 29 + 1.

This is a compact cross-round numerical alignment among the 2012 phone phrase, the 2013 Gematria alphabet, the 2014 HTML selectors, and p55's length/F structure. It may be intentional, but numerical coincidence remains a live explanation. No first-party instruction currently says to sum the phrase, apply φ to that sum, interpret 78 as a deck or other object, or use 16 × 42 as a grid.

## Frozen decipherment tests

### Direct fixed running key

The 75-token phrase was aligned at offset zero against the 75-rune p55 body. Both additive directions were tested using GP29 indices and 2013 prime values reduced modulo 29, with the two minimal space encodings. All outputs are non-linguistic; the best mean quadgram score is -7.278.

Four direct byte-XOR representations were also tested. Their printable ASCII counts are 0/75, 26/75, 45/75 and 54/75; none yields coherent text.

### p56-style totient receiver

The solved p56 method uses φ(p) = p − 1 modulo 29 and treats ciphertext F as transparent: copy F unchanged and do not consume a key symbol. Applying that exact receiver to p55 with the phrase-derived prime/totient key was a motivated next test because p55 has three F symbols.

Tested space-as-F versus space-as-zero, F-transparent versus non-transparent, and both signs. The p56-authentic subtract/F-transparent variants score:

| Key space value | Key symbols consumed | Unused | Mean quadgram |
|---|---:|---:|---:|
| F, shift φ(2)=1 | 72 | 3 | -7.776 |
| numeric zero | 72 | 3 | -7.505 |

The other sign and non-transparent controls also produce gibberish; the best totient variant overall is -7.240 and is not the p56-authentic F-transparent receiver.

### Prime-stream offsets derived from the arithmetic

The quotient 78 and φ-sum 672 are the only source-derived candidate prime-stream indices suggested by the arithmetic. Starting the p56-style φ(prime) stream at the 78th prime (397) or the 672nd prime (5011), with F-transparent subtraction, also fails:

| One-based prime index | First prime | Mean quadgram |
|---:|---:|---:|
| 78 | 397 | -7.808 |
| 672 | 5011 | -7.728 |

No arbitrary offsets or key permutations were searched.

All synthetic additive and p56-style totient round-trip controls pass. The same quadgram model scores clear p57 at approximately -4.42; these short-text scores are ranking evidence, not calibrated probabilities.

## Decision

The direct 2012 phrase running key, the p56-style phrase-derived totient key, and the two arithmetic-derived prime-stream starts do **not** decrypt p55.

Preserve the arithmetic alignment as an unverified clue, not as a solution or a reason for further unconstrained search. The next useful action is an independent source audit: find a first-party instruction or original artifact that uniquely selects an operation involving the 2012 phrase, Gematria, φ, 16, 42 or 78. Without that, park the branch. In particular, do not promote a Tarot/78-card interpretation or invent a 16 × 42 grid merely because the numbers fit.

This does not reject Agent6's broader #2278 space-changing-reader investigation or other independently specified receivers.

## Reproduction

Run sims/lp2_p55_2012_phone_phrase_running_key_sft.cjs with Node 22.

Inputs:

- resources/liber-primus/lp2-corpus.json
- resources/control/dukotah_english_quadgrams.txt
- resources/external/2013-twitter-stage-gematria-source.md
- workplace/2014-html-133-331-arithmetic-page-selector.md
- agents/agent35/memory.md (historical phrase and qualifications)

This remains an intermediate research note; results/README.md is unchanged.
