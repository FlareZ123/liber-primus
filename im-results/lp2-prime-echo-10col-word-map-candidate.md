# Candidate route: 2013 prime_echo coordinates into the LP2/p50 word map

**Status:** provisional source-bridge hypothesis; not an LP2 decryption and not an established result.

## Claim

The preserved 2013 `prime_echo` shell artifact prints primes in ten-column rows and inserts two-second pauses after 1033 and 3301. Those primes have one-based ranks 174 and 464. Interpreting the output as a zero-based grid gives coordinates (17,3) and (46,3). If those coordinates are read as (LP2 page, zero-based word index), they select the fourth words on p17 and p46. Their GP29 ordinal sums address two p50 cells whose directions lead into the existing 2016 word-map route. One branch additionally yields the DH exponent b=15 from a base60 byte modulo 23.

This is a new possible route from the prime_echo artifact to the 2016 map, but the crucial row-to-page / column-to-word interpretation is inferred, not explicitly specified.

## Reproduction

### 1. Prime-echo coordinates

Source: `resources/historical/cicada2013-os-original-prime-echo.sh`.

The script uses `echo` without `-n` after every tenth prime, so its terminal output is ten primes per line. It pauses for two seconds after 1033 and 3301. In the ascending prime list:

- 1033 is prime rank 174; zero-based grid coordinate is (17,3).
- 3301 is prime rank 464; zero-based grid coordinate is (46,3).

The proposed mapping is page=row and word-index=column, both zero-based. Thus the selected source words are p17 word[3] and p46 word[3] (the fourth printed word on each page).

### 2. The selected LP2 words

Source: `resources/liber-primus/lp2-transcription.txt`, checked against original page images 34.jpg and 63.jpg.

| Coordinate | Rune word | GP29 values | GP0 sum |
|---|---|---|---:|
| p17, word[3] | `ᛡᚪᛒᚪ` | 27, 24, 17, 24 | 92 |
| p46, word[3] | `ᛗᛉᛄᛈ` | 19, 14, 11, 13 | 57 |

The sums 92 and 57 are also the GP0 values of the 2016 signed-message words EMPTY and WAY, respectively.

### 3. p50 navigation

Source: `resources/liber-primus/lp2-grid-256.json`; the relevant glyphs were checked against original grid images 66.jpg and 67.jpg.

- p50 cell 92 is `3u`. In the 32×8 row-major grid, move three rows up to cell 68, which contains `3J`.
- p50 cell 57 is `1w`. Move one column west to cell 56, which contains `4E`. Read `4E` as hexadecimal ASCII N, move north one row to cell 48, which contains `4D` (hexadecimal ASCII M).

The second branch is the already-known WAY → MAP → HERE route; it is not claimed as new. The first branch is the additional candidate: cell 68's `3J` is 199 in base60.

### 4. Dual-modulus and DH cross-check

Using the p50 base60 alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`:

| Cell | Token | Base60 value | mod 23 | mod 29 |
|---:|---|---:|---:|---:|
| 92 | `3u` | 236 | 6 | 4 |
| 57 | `1w` | 118 | 3 | 2 |
| 68 | `3J` | 199 | 15 | 25 |

The mod-29 residues 2, 4, 25 index PATH, EMPTY, THEIR in the 2016 signed message. The mod-23 residues 3, 6, 15 index LIES, SEEKS, WORDS. These are all words in the signed 2016 text and echo its wording about the path lying empty, seeking, words, and their meaning.

The mod-23 values also match the private-exponent state derivable from the signed 2013 DH example (**p=23, g=5, public shares 8 and 19, shared secret 2**):

- cell 92 gives 6 = a, since 5^6 mod 23 = 8;
- cell 68 gives 15 = b, since 5^15 mod 23 = 19;
- cell 57 gives 3 = b^{-1} mod 22, since 15×3 mod 22 = 1;
- consequently 19^6 mod 23 = 2, the signed shared secret.

The base59 alternative for these same tokens gives 232, 116, 196, hence residues 2, 1, 12 modulo 23; it does not reproduce the DH exponents. Conditional on the proposed address mapping, this is an independent discriminator in favour of base60.

## Controls and limitations

- The consistent zero-based convention is required. Shifting page rows by +1 gives p18/p47 and mod-23 values 22,22; shifting word columns by +1 gives mod-23 values 12,5. Neither reproduces the DH exponents.
- A scan of all 464 prime-grid coordinates mapped to the first ten words of pages 0–46 found 77 in-bounds GP0 addresses that hit a digit-plus-cardinal p50 token. Seven of those land on `4E`; three land on `3J`. The two pause markers are among these hits, but the direction outcomes are not unique. This weakens any claim based on the destination tokens alone.
- The prime_echo script's line breaks may simply be terminal formatting. No source explicitly says its rows are LP2 pages or its columns are word indices. The 2016 signed message says words are the map and numbers are the direction, but does not spell out this coordinate conversion.
- The p50 route and the 2013 DH values are known elsewhere in the repository. The potentially new contribution is the proposed prime_echo-to-page/word selector and its connection to those existing results.
- No unknown LP2 plaintext has been recovered by this route, and it does not identify the cipher used on pages 0–55.

## Decision

Keep this as an intermediate candidate only. The decisive next question is whether an independent clue makes the ten-column prime_echo layout a page/word address system. If not, retire the coordinate interpretation rather than adding offsets, alternate radices, or more fitted operations.