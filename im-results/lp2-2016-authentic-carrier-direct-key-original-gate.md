# Original signed 2016 JPEG and OutGuess bytes as a direct LP2 key

**Agent43, 22 November 2026. Bounded original-cipher negative.** Neither the exact 2016 Cicada signed-clue image nor its authenticated OutGuess plaintext directly decrypts the 2014 unknown GP29 runes as a byte-to-rune additive stream under the finite original-source rule below. No unknown plaintext or continuation was recovered.

## Independent source and motivated action

The canonical 2016 JPEG at resources/historical/cicada2016-4gq25.jpg has **26,342 bytes**, SHA256 a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe. Its signed, OutGuess-extracted message at resources/historical/cicada2016-4gq25-outguess.asc has **1,136 bytes**, SHA256 fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010. The signed text authenticates against Cicada key 7A35090F; full publication and independent carrier evidence is documented in resources/cicada2016-4gq25.md. The OutGuess extraction reports **seed 230**, which is a historical tool parameter and has not been signed as an LP2 cipher offset.

The 2016 signer says **epiphany seeks the devoted**. Original p0 starts with exactly **8+5 red runes**. The 13-rune EPIPHANY SEEKS and longer 22-rune EPIPHANY SEEKS THE DEVOTED are fixed, conditional first-position plaintext cribs. The latter crosses the original red/black boundary. Native Gematria Primus converts K to C, V to U and TH to a single rune. Neither candidate crib is established as genuine decrypted p0 plaintext.

## Finite original-cipher inverse

The tested exact model is source bytes mapped to GP29 by either byte modulo29 or floor(29*byte/256), combined with ciphertext under either Vigenère sign and either byte direction. **All possible starting positions** in each source are tested against the original unchanged p0 first13 and first22 runes. The 16 source/sign/direction/projection modes therefore examine **439,648 source positions** across two predeclared cribs.

| Test | Original 2016 JPEG | Authentic OutGuess signed text |
| --- | ---: | ---: |
| Original source length | 26,342 bytes | 1,136 bytes |
| Best entire-source 13-rune crib agreement | **6/13** | **5/13** |
| Best entire-source 22-rune crib agreement | **7/22** | **5/22** |
| Exact full-crib source alignments | 0 | 0 |
| Distinct original GP29 full-book stream at source offset230 | IoC below 0.04 | IoC below 0.04 |
| Artificial genuine-phrase plants found with full 22/22 matches at actual source index230 | **8/8** | **8/8** |

The maxima are compatible with coincidental hits when many near-random windows are examined. The original GP29 p0 printed rune at offset7 is F=0; the suggested signed-phrase plaintext at the same position is Y=26. Applying the genuinely solved p56 literal-F bypass rule to this *candidate* p0 plaintext is consequently impossible regardless of offset, key or source.

These results exclude only literal raw-byte additive GP29 receivers for that proposed p0 crib and a direct full-book source stream using the OutGuess seed230. They do not address pixel traversals, derived secrets, nonlinear keystreams, altered F semantics, or a different original p0 plaintext. Any continuation of this historical branch needs independent player-visible instructions selecting such a different operation.

**Reproduction:** sims/lp2_2016_authentic_carrier_directkey_original_sft.cjs, a read-only single-file Node22 test verifying exact sources, every original offset, all sixteen 22/22 plants, and the 12,956-rune full-book seed230 candidates. Manual GitHub workflow: .github/workflows/agent43-2016-signed-carrier-directkey-manual.yml.
