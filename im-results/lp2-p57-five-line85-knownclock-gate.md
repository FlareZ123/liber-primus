# P57's five line interiors: an 85-rune key tested against original solved p56

**17 November 2026, Agent17. Evidence:** source-exact geometric coincidence, decisive bounded negative for a direct key transfer. No new unknown-LP2 plaintext, genuine unknown-page key, or cipher is recovered.

## Human-readable operation and independently known receiver

The final clear physical LP2 p57 prints the PARABLE on five line-wrapped rows whose rune counts are **20, 17, 17, 18, 23**, totaling **95 GP29 runes**. Its instruction to “shed our own circumferences” motivates the literal, reproducible operation **remove the first and last rune on each printed line** without cutting or changing words. Exactly ten printed endpoints are removed, leaving **85 original GP rune indices** in their source order. Independently, the physically preceding solved p56 contains **85 ciphertext runes**. The 95−2×5=85 arithmetic follows automatically from the selected line boundaries, so the count match alone is not proof of intentional key construction.

This differs from the already tested **word-wise** extraction of p57's 55 strict interiors and 75 single-edge remains. It uses physical *line* endpoints rather than a word key, and an actual **independently known plaintext** as the receiver. Original source files are `resources/liber-primus/lp2-transcription.txt` and `resources/liber-primus/lp2-corpus.json`; printed rows reproduce the canonical p57 95/95 GP rune tape exactly.

## Original solved-cipher discriminator

The 2014 independently solved p56 ciphertext uses `P[i] = C[i] − (prime[t]−1) (mod 29)` except at **one** plaintext-F bypass, original page-local offset56. The other **84** p56 positions consume the consecutive prime-totient stream beginning with prime2. Reconstructing the authentic plaintext with this exact rule yields:

`ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE`

Test the line-interior tape `K[i]` as an **unrotated, unreordered 85-position** additive GP29 key on this already-solved 85-symbol page. The standard GP chart gives three natural representations of each key glyph: its ordinal 0–28, prime weight modulo29, or totient of that prime modulo29. Apply either additive direction at original fixed positions, retaining the independently solved position56 as a literal-F bypass. Every direct inverse is exactly reversible and source-native plaintext plants recover in every case.

| Source-native line85 numeral | Exact matches to the original 84 prime shifts | Original solved-p56 plaintext matches /85, subtract | Same, add |
|---|---:|---:|---:|
| GP ordinal | **5/84** | **6/85** | **3/85** |
| GP prime modulo29 | **2/84** | **3/85** | **5/85** |
| GP totient modulo29 | **3/84** | **4/85** | **2/85** |

Even granting the published p56 transparent F position, each candidate misses **at least 79** authentic plaintext positions and **at least 79** true prime shifts.

**All fixed secret alphabets fail, independent of arithmetic.** To avoid merely replacing the failed GP index/prime/totient choices with an arbitrary key alphabet, grant *every possible* fixed, even non-injective function `f: GP29(line-key) → GF29(true p56 prime-shift)`. The exact original witness is already the first and third source interior symbols: `K[0]=K[2]=A` (GP index24) but the true p56 clock requires **1** at position0 and **4** at position2. A fixed function cannot produce both. More strongly, independently give each of the 29 key-input values its most favorable output chosen *after seeing all original targets*. The **globally optimal arbitrary function still matches only 25 of the 84 true p56 clock values**. This bound includes all `29^29` fixed lookup functions, all 29! substitution alphabets, and every fixed affine reading; no extra key can repair the direct line85→p56-clock interpretation without adding time-varying state or permutation. The same original SFT asserts both collision witnesses and this optimized function bound. This is an exact rejection of the tested **direct p57-line85-to-p56 key transfer**, without language guessing, arbitrary key fitting or inferred unknown-page plaintext.

## Result and decision

The source-visible 85-rune correspondence is a **provisional layout observation**. There is no original instruction to apply the line-core symbols as a key to p56, and the independent known-plaintext test refutes the straightforward consumer under either GP29 additive sign and all three native numeric readings. It does not refute the already solved independent p56 prime-totient cipher, nor does it show that line interiors are encrypted or that any unknown page has been deciphered. Do not expand this failed alignment into searched shifts, permutations or key phases without a new manuscript-selected operation.

**Complete standalone original-input reproducer:** [source-only CJS SFT](../sims/lp2_p57_five_line85_p56_knownclock_sft.cjs), Windows/Node22 compatible, with exact source assertions, known p56 plaintext and prime cursor, six original inverses, original-cipher re-encryption, and solved-page encrypted positive plants.

**Windows Node22 original-input execution:** [passing GitHub Actions run 44125650081](https://github.com/FlareZ123/liber-primus/actions/runs/44125650081).
