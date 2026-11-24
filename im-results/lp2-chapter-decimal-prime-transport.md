# Chapter-wide GP0 BASE29 to decimal chart-prime transport (#2627)

**Decision, Agent 2, 24 November 2026: reject the exact unpadded decimal concatenation codec.** All nine complete original chapter intervals have zero valid prime-token parses; two also begin with a noncanonical zero. No unknown plaintext/key.

## Model

The signed 2013 BASE29 integer operation and literal 29 Gematria prime weights motivate this exploratory numeric representation; neither independently selects concatenation of unpadded decimal chart-prime strings. It is distinct from the rejected prime-product transport (#2629). A tree-filename screen for prior decimal prime concatenation/transport found no matching experiment.

Freeze the existing nine source-rune intervals [0,729,1874,3603,5506,6527,7960,9640,12648,12956], used in the direct LP1 running-key SFT. Interpret each complete ciphertext interval as a single ordinary big-endian base29 integer with GP0 digits. Render its decimal expansion canonically, and match the literal strings of the first 29 primes (2..109) with no padding, reversal, inferred delimiter, or arithmetic offset.

For each digit boundary i, let W_i be the exact number of complete parses of the prefix. Set W_0=1; for each matching prime string of length l at i, add W_i to W_(i+l). BigInt counts are exact; minimum/maximum token count and one deterministic backpointer path are retained. The source is rejected if W_end=0. Even if nonzero, multiple paths require independent boundary information; do not select English guesses from them. Compare reconstructed BASE29 digits to the original, preserving any loss of leading zeros explicitly.

## Executed original-cipher result

Pinned chart/corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; corrected transcription f7b534a33edeb212d427329798438325307463d7; external solved reference 1b064ef6d85819b7d96adaff31a82d1ec551598f. Source tape agrees exactly with the corrected transcription for all 12,956 unknown runes.

| Chapter (1-based) | Runes | Decimal digits | Farthest reachable boundary | Full parses | Lost leading zeros |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 729 | 1066 | 0 | 0 | 0 |
| 2 | 1145 | 1675 | 2 | 0 | 0 |
| 3 | 1729 | 2529 | 0 | 0 | 0 |
| 4 | 1903 | 2781 | 2 | 0 | 1 |
| 5 | 1021 | 1492 | 0 | 0 | 0 |
| 6 | 1433 | 2096 | 3 | 0 | 0 |
| 7 | 1680 | 2457 | 1 | 0 | 0 |
| 8 | 3008 | 4397 | 0 | 0 | 1 |
| 9 | 308 | 451 | 5 | 0 | 0 |

Zero full original candidates. Prefix strings are 646189691861, 19625045412543, 151692120005, 17882177087226, 812858535528, 277665982641220, 5445311459874, 900622179033, 22312605632158126. No language score was used.

## Constructed solved-source controls and non-injectivity

All nine controls are built by replacing each native rune by its decimal chart prime, concatenating, encoding the integer in base29, decoding back, and running the exact DP. All nine recover the decimal integer and admit the true source length; that is necessary, not evidence of a unique plaintext. The authentic source-token path exists by construction. The reported source rune reference is external, not a new exact ciphertext replay.

| Solved reference | Source runes | Min–max recovered runes | Decimal digits in exact parse count |
| --- | ---: | --- | ---: |
| WARNING | 184 | 180–199 | 10 |
| WELCOME | 515 | 495–598 | 44 |
| WISDOM | 157 | 150–182 | 13 |
| KOAN1 | 780 | 758–913 | 64 |
| LOSS OF DIVINITY | 755 | 744–859 | 53 |
| KOAN2 | 319 | 310–375 | 24 |
| jpg229 | 89 | 86–103 | 8 |
| p56 AN END | 85 | 84–95 | 5 |
| p57 PARABLE | 95 | 94–106 | 6 |

Exact p57 parse count 147,456; p56 40,960; WARNING 1,061,683,200. Minimal explicit collision: chart digits [0,1] (F,U) emit decimal 2||3 = 23, exactly as digit [8] (H), whose chart prime is 23. Both give the same single BASE29 digit [23]. The encoding cannot be injective even for very short source strings. A source-provided boundary channel would be necessary and would define a different representation.

## Reproduction

`node sims/lp2_chapter_decimal_prime_transport_sft.cjs` gives the exact BigInt counts and original obstruction table. Core executed in JS tool runtime on pinned inputs; standalone CJS wrapper is provided for reproduction. No new CI. Retire this precise codec before any key or language fitting; do not expand to padded primes, alternate bases, offsets or freely chosen segmentation without independent evidence.
