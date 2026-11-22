# Direct p15 Fibonacci-prime 16-value pad against the original p49–51 256-byte grid

**11 November 2026; bounded source-to-source negative.** The fully solved physical p15 4×4 Fibonacci-prime numerical spiral contains 16 numbers, while the p49–51 physical manuscript displays exactly 256 byte-valued base60 tokens. A designer could repeat the 16-position source order to cover the 256 bytes. The original 2013 Cicada 761.MP3 operation supplies a historically demonstrated bytewise XOR, and the familiar rune-prime alphabet also suggests direct GP29 addition/subtraction. The literal **fixed-phase zero-offset** 16-periodic transfers do not recover an ordinary file, ASCII/plaintext, or native-GP language from the original table. This source-key test is distinct from the previously published **AES-256/ChaCha20/RC4** derivation using 16 packed 16-bit integers; that work is already recorded in [the packed Fibonacci key code](../sims/fibonacci_spiral_key_derivation.cjs) and [AES grid source trial](../sims/fibonacci_square_grid_payload.cjs).

## Frozen source inputs and key convention

- Source grid: `resources/liber-primus/lp2-grid-256.json`, original images **66.jpg–68.jpg** (physical p49–51), printed **32×8** in row-major order. Exactly 256 values range 0–255. Byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The table is a source-derived transcription, and some byte readings have prior original-image adjudication; no fresh corrections made.
- Source key page: original **32.jpg**, physical **p15**. Read the exact four-neighbour spiral beginning at its uniquely printed red **3299**, then right/down/left/outward, as proved in [the complete 16-cell mathematical solution](../results/lp2-p15-fibonacci-prime-spiral.md). The p15 key candidate consists of original displayed absolute differences **D**; a second equally directly source-derived key uses the recovered Fibonacci-indexed primes **P**. No key byte is fitted to p50.
- Key D (natural spiral order): `3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516`.
- Key P (recovered prime values): `2,3,5,7,13,23,43,79,149,263,463,829,1481,2593,4507,7817`.

For each of the two 16-value keys, set `k_i = key[i mod 16]`, with **i** being the zero-based canonical row-major p50 cell ordinal. Test three byte inverses `B_i XOR (k_i mod 256)`, `B_i+k_i mod256`, `B_i−k_i mod256`. Separately map the original bytes `B_i mod29` to GP indices and apply `±(k_i mod29)` in the same fixed phase. This is exactly **six full-byte and four GP29** source-selected direct operations, with no offset search, byte reversal, altered grid topology, algorithm tuning or LLM scoring.

## Original-input result

| Source 16-value pad | Direct byte inverse | Printable bytes of 256 | Longest printable ASCII run | First eight output bytes |
| --- | --- | ---: | ---: | --- |
| D: printed p15 differences | XOR | 95 | 5 | `28 05 47 64 B9 23 C4 21` |
| D | subtract | 88 | 4 | `E8 05 C7 DC 89 1F C4 21` |
| D | add | 98 | 4 | `AE C9 87 98 39 BB 38 4D` |
| P: recovered p15 primes | XOR | 98 | 5 | `C9 E4 A2 BD 6C FA 55 F8` |
| P | subtract | 97 | 4 | `C9 E4 A2 B3 54 D6 53 68` |
| P | add | 96 | 5 | `CD EA AC C1 6E 04 A9 06` |

No byte output begins with JPEG/PNG/PDF/ZIP/gzip/7z/GIF/Ogg/PGP-ASCII file magic. All six remain near the random-buffer baseline of approximately 95 printable text bytes out of 256. They contain no sustained readable ASCII passage.

| GP29 conversion (from original byte modulo29) | Full 256-symbol decoded IoC |
| --- | ---: |
| D + | 0.035079657 |
| D − | 0.034283088 |
| P + | 0.035079657 |
| P − | 0.034436275 |

These four GP outputs remain near uniform `1/29≈0.034483`. The independent **256-rune native Shakespeare GP control** used by the same script has IoC **0.061427696**. The hypothesis is a direct native-language decoder, so these near-uniform values are a bounded negative, rather than proof that no unusual intermediate register exists.

## Implementation, positives and decision

The [CommonJS source SFT](../sims/p15_fibonacci_16byte_p50_grid_direct_pad_sft.cjs) computes both keys by calling the pre-existing **source image's 16-cell spiral generator**, asserts that every printed cell matches the recovered prime formula, and hashes the original p50 256-byte table. All **six byte** operators and **four GP29** operators have exact 256/256 inverse round-trip controls. The independent native-GP plant is encoded from a Shakespeare excerpt; it is recovered at **256/256** runes, with preserved native prose IoC **0.061427696**. The test is run through the manual-only [Fibonacci 256-bit workflow's `literal-pad` probe](../.github/workflows/fibonacci-spinal-key-256.yml): [successful run 43088137428](https://github.com/FlareZ123/liber-primus/actions/runs/43088137428).

**Decision:** reject repeating either the actual p15 printed 16-value sequence or its exactly recovered 16 Fibonacci-indexed primes as a phase-zero, straight byte XOR/add/sub or GP29 additive mask against the original 256 printed table. This neither establishes an LP2 key nor rules out keyed permutations, different source-selected alignment, later compression, or genuine ciphertext beyond p50. Further such variants would require an independent primary-artifact instruction fixing the operation, key reduction or traversal. The existing AES/stream-cipher tests should be reused instead of recreated.
