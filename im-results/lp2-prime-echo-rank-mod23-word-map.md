# Candidate: prime_echo block counts mod DH23 → 2016 word map

**Status:** provisional cross-round navigation hypothesis. It does not decrypt an unknown LP2 page and is not an established cipher mechanism.

## Source facts

The preserved `resources/historical/cicada2013-os-original-prime-echo.sh` emits the prime sequence through 3301 and pauses for two seconds after 1033 and 3301. These values have prime ranks 174 and 464. The first pause therefore separates the stream into:

- first block: 174 primes, ending at 1033;
- trailing block: 290 primes, from the next prime through 3301;
- total: 464 primes.

A signed 2013 DH example in the repository uses modulus p=23 (with g=5, public shares 8 and 19, shared secret 2). The 2016 signed message is indexed zero-based in the existing research corpus. Its relevant word positions are 4=EMPTY, 13=WAY, 14=ITS, 15=WORDS, 18=MAP, 25=THEIR, and 26=NUMBERS.

Important caveat: the signed DH example's p=23 is a worked exchange, not proven to be an organizer-fixed LP2 parameter. The p28 page's 23-rune DH line is a second structural echo, but neither fact by itself proves that prime counts should be reduced modulo 23.

## Proposed prime-count selector

Take the natural counts [total, first block, trailing block] = [464,174,290] and reduce modulo 23:

`[464,174,290] mod 23 = [4,13,14]`.

These are exactly the 2016 signed-message word positions:

- 4 → EMPTY
- 13 → WAY
- 14 → ITS

Read in the signed message's own order, the selected words are **EMPTY … WAY ITS**. The operation uses the prime ranks/block lengths, not the ten-column terminal layout. The earlier row→page / column→word interpretation has been retired and is not relied upon.

## Feed the selected words through the p50 map

Using the manuscript's GP29 ordinal values (GP0) gives:

| 2016 word | GP0 address | p50 token |
|---|---:|---|
| EMPTY | 92 | `3u` |
| WAY | 57 | `1w` |
| ITS | 41 | `1O` |

The p50 table is the 256-cell row-major grid in `resources/liber-primus/lp2-grid-256.json`.

- **WAY → MAP → HERE:** cell 57 contains `1w`; move west one cell to 56, which is GP0(MAP) and contains `4E`. Read `4E` as hexadecimal ASCII N; move north one row to cell 48, GP0(HERE), which contains `4D` (hexadecimal ASCII M). This is the already-known WAY→MAP→HERE route, not a new result.
- **EMPTY → WORDS/THEIR:** cell 92 contains `3u`; move three rows up to cell 68, which contains `3J`. In base60, `3J` = 199; 199 mod 23 = 15 (WORDS) and 199 mod 29 = 25 (THEIR).
- **ITS → WORDS/NUMBERS:** cell 41 contains `1O`. In base60, `1O` = 84; 84 mod 23 = 15 (WORDS) and 84 mod 29 = 26 (NUMBERS).

The same dual-modulus reading of the first two addresses gives:
- cell 57: base60 118; mod 29 = 2 (PATH), mod 23 = 3 (LIES);
- cell 92: base60 236; mod 29 = 4 (EMPTY), mod 23 = 6 (SEEKS).

Thus the selected map cells index PATH, LIES, EMPTY, SEEKS, THEIR, WORDS, and NUMBERS in the signed 2016 message. In particular, ITS maps to WORDS and NUMBERS, while WAY enters the established MAP route. This echoes the 2016 instruction that its words are the map and their numbers are the direction.

## DH and radix cross-check

The base60 values at p50 cells 92, 57, and 68 are 236, 118, and 199. Modulo 23 they give [6,3,15], matching the private-exponent values a=6, e=3, b=15 derivable from the signed 2013 DH example:

- 5^6 mod 23 = 8;
- 5^15 mod 23 = 19;
- 15×3 mod 22 = 1;
- 19^6 mod 23 = 2, the shared secret.

The base59 alternative does not produce the same word-map or DH matches. For example, the same cells 92, 57, 41, and 68 decode to 232, 116, 83, and 196; their residues do not yield the corresponding 2016 words and DH exponents. This is conditional support for base60 at these addresses, not proof of a global radix rule or of the p50 table's later transition semantics.

## Controls and limitations

- Modulo 29, the natural GP alphabet size, gives [464,174,290] → [0,0,0], i.e. the same 2016 word index three times; it does not yield the EMPTY/WAY/ITS set.
- Modulo 43, the canonical word count of the signed message, gives [34,2,32] → BE, PATH, YOU, not the same coherent phrase.
- The use of p=23 is motivated by the signed DH example and the p28 DH structural clue, but applying it to prime counts is still an inference. No source explicitly says “reduce prime ranks modulo 23.”
- The two-second pauses are source-observable, but the prime_echo artifact's authorial status should not be assumed beyond what its provenance supports.
- This route reconstructs already-known words from the signed 2016 message and a p50 navigation loop. It does **not** recover unknown LP2 plaintext, identify a complete cipher, or resolve the final Cicada destination.

## Decision

Keep this as an intermediate candidate, not an established result. The decisive next test is to find an independent source cue that selects p=23 as the modulus for the prime-count map, or a blind holdout from the same source that predicts an unknown LP2 word. If that selector cannot be found, reject the route rather than trying more moduli, offsets, or reordered arithmetic.