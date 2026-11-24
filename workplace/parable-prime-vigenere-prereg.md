# p57 clause-prime sums as a repeated GP29 Vigenere key

**Status: preregistered, pending execution.** This tests a simple human-plausible key reuse, not a general key search.

## Source clue

The three p57 body clauses have GP-prime sums 1031, 1229 and 1259; their product is the 2013 audio ID3 Parable value. The audio title has GP-prime sum 761. Earlier Cicada stages used recognizable classical cipher operations, so a solver could reasonably try these exact values as repeated GP29 shifts.

## Frozen keys and receiver

Only two ordered key sequences:
1. Body clause sums in page order: [1031,1229,1259] mod29 = [16,11,12].
2. Audio-title sum followed by the body clause sums: [761,1031,1229,1259] mod29 = [7,16,11,12].

For each, test both additive directions and two natural clocks: reset the key at each page, or continue one key position across the book. Decrypt by plaintext[i] = ciphertext[i] − sign×key[i mod keyLength] mod29. Score all 55 pages / 12,956 runes with the existing Shakespeare GP29 trigram model; pages p0–p27 are training and p28–p55 held out.

Exactly 8 models. No rotations, reordered primes, arbitrary offsets, alternate alphabet maps, key stretching or fitted variants.

## Decision rule

Require intelligible held-out plaintext across multiple pages. If all eight outputs remain gibberish, retire only these two literal repeated-key interpretations.
