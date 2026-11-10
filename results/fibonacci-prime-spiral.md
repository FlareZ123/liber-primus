# LP2 page 15: exact Fibonacci-indexed prime spiral

**Classification:** exact numerical construction previously documented by the Cicada community, independently reproduced in this repository. **No newly discovered formula, recovered LP2 plaintext, or actual key.** Agent 10 reproduced the prior finding on 2026-11-10.

## Historical status

This exact Fibonacci-prime spiral was **already documented by external Cicada researchers**. See [Wulfic's MASTER_TRACKER](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) section 3.3 and [Cicada Research Notebook session 03](https://cicadanotebook.com/sessions/3.html), which reports 43 related prime/Fibonacci streams tested without recovered plaintext; an earlier [Uncovering Cicada wiki explanation](https://uncovering-cicada.fandom.com/wiki/Onion_7%3A_numbers_on_page_15) describes the 3301-relative spiral. The local reproduction, regression tests, and bounded additional direct-key screens are useful confirmation and integration. **They do not constitute the discovery of a new key-generation clue.** More square-derived streams need independent motivation and held-out plaintext evidence.

[Successful local CI reconstruction](https://github.com/FlareZ123/liber-primus/actions/runs/42752147981).

## The actual 4×4 square

LP2 page 15 (original JPEG \`32.jpg\`) prints these 16 numbers, with **3299 in red**:

| | | | |
|---:|---:|---:|---:|
| 3258 | 3222 | 3152 | 3038 |
| 3278 | **3299** | 3298 | 2838 |
| 3288 | 3294 | 3296 | 2472 |
| 4516 | 1206 | 708 | 1820 |

The 16 entries are **all exactly** explained by one indexed-prime construction. Define \`p_k\` to be the kth prime, \`F_n\` the nth Fibonacci number with \`F_0=0\`, \`F_1=1\`, and \`a_n=abs(3301-p_(F_n+1))\`. Retain the **first 16 distinct Fibonacci values** (the value 1 occurs at both F1 and F2), calculate their corresponding primes, and place the resulting \`a_n\` values in a **clockwise outward spiral**, starting at row 2, column 2 (the red 3299). The full readout is:

| Spiral position | Unique Fibonacci number | Prime ordinal | Actual prime | \`abs(3301-prime)\` |
|---:|---:|---:|---:|---:|
| 1 | 0 | 1 | 2 | 3299 |
| 2 | 1 | 2 | 3 | 3298 |
| 3 | 2 | 3 | 5 | 3296 |
| 4 | 3 | 4 | 7 | 3294 |
| 5 | 5 | 6 | 13 | 3288 |
| 6 | 8 | 9 | 23 | 3278 |
| 7 | 13 | 14 | 43 | 3258 |
| 8 | 21 | 22 | 79 | 3222 |
| 9 | 34 | 35 | 149 | 3152 |
| 10 | 55 | 56 | 263 | 3038 |
| 11 | 89 | 90 | 463 | 2838 |
| 12 | 144 | 145 | 829 | 2472 |
| 13 | 233 | 234 | 1481 | 1820 |
| 14 | 377 | 378 | 2593 | 708 |
| 15 | 610 | 611 | 4507 | 1206 |
| 16 | 987 | 988 | 7817 | 4516 |

In particular, the final **1206** and **4516** arise because the two largest primes exceed 3301, requiring the *absolute value* of the difference. The highlighted center supplies the unambiguous visual starting point. Each of the sixteen values, their precise spatial order, and the 3301 reference point are explained without free per-entry choices.

**Interpretation:** this is a precise, clue-derived prime-selection mechanism with a Fibonacci index schedule and an explicit spiral reading order. It supplies viable mathematical material for constructing or recognizing a cipher key. It does **not** demonstrate that these integers are an LP2 keystream or distinguish all possible uses of the clue.

## Newly identified red-title arithmetic, interpretation provisional

The red line directly above the square has two rune words, **`ᚠᚢᛚᛗ`** (four runes) and **`ᚪᛠᚣᛟᚪ`** (five). Summing the *assigned GP prime values*, rather than the rune indices, gives **149** for the first word and **489** for the second. Their total is **638 = 29 × 22**. The 149 is exactly the square's Fibonacci-indexed **35th prime** (`p_(34+1)=149`), and **22** is the immediately preceding Fibonacci prime ordinal (`21+1`), selecting **`p_22=79`**. Both 79 and 149 occur consecutively in the square's outward reading. The second title word has the highest GP prime-value sum of **all 317 five-rune words** in the canonical unsolved corpus.

This can be evaluated with a fixed, falsifiable cross-section relation: for adjacent four- and five-rune ciphertext words `A B`, require `sum_GP(A)=p_(F_i+1)` and `sum_GP(A)+sum_GP(B)=29×(F_(i-1)+1)`, using consecutive square primes and their one-based ordinals. Only five numerically possible sum pairs arise: **(13,103), (23,151), (43,218), (79,327), (149,489)**. There are **74 actual 4→5 word transitions** among 2,896 LP2 words; **only this red title** satisfies the relation. Of all **513 × 317 = 162,621** possible length-stratified four-/five-rune word pairings, three satisfy any of those sum pairs. Under reshuffling within word lengths while retaining the observed word sums and 74 eligible adjacency slots, the expected number of matching pairs is **0.00136514**. This value also upper-bounds the chance of at least one match *for that previously specified relation* by the union bound.

**Crucial limitation:** this relation was noticed **after** examining the red title. The rarity calculation is descriptive and must **not** be interpreted as a calibrated discovery p-value, because other numerical relations could have been selected. The title's appearance, original transcription and exact arithmetic are independently reproducible; their cryptographic interpretation is **unknown**. No rune plaintext, key stream, or passage follows deductively from the alignment. The hypothesis is a prioritized structural lead, rather than a proven cipher mechanism.

**Independent red-span checksum check:** There are 18 color-marked rune spans across the full LP2 source. Exactly three have GP prime-value sums divisible by 29: page 15's nine-rune title (**638**), page 40's eight-rune heading (**435**), and page 53's complete 51-rune red passage (**2262**). Under exact page-local sliding controls preserving the lengths and joint relative offsets of all red spans on each page, at least three zero-residue spans occur with probability **0.018672**. That apparently small tail is **post-selected by the page-15 observation**. Excluding page 15, the two independent later matches have a control tail **0.087956**. Moreover, residue **24** also occurs three times, and the observed largest residue-bin occupancy (three spans) occurs in approximately **53.4%** of 200,000 seeded page-local randomizations after accounting for the 29 possible residues. Consequently, the apparently exact 29-checksum is **not independently supported** as a global red-ink coding rule; it supplies no new key. Reproducible source-linked controls: [red-span prime checksum and heldout test](../sims/red_span_prime_checksum_holdout.cjs).

A separate **low-confidence** known-plaintext probe assumed the nine title runes spell `FIBONACCI`, which would require ignoring the source's four-/five-rune word break. The direct Fibonacci-square/grid-derived candidate-pad families found no match of at least six out of nine positions, nor at least six of eight encrypted positions when ᚠ is literal. An exact exhaustive scan of **4,294,967,296 historical PHP MT seeds**, across five output reductions, both additive signs, optional ciphertext chaining, two carrier orientations and three ᚠ clock conventions, found **two exact eight-rune crib fits**, seeds `1536212283` (reduction 2, sign −1, chained, first F consumes) and `3495297226` (reduction 0, sign +1, chained, first F consumes). Both fail an immediate 150-rune independently decoded page-15 continuation (IoC respectively **0.03409** and **0.03669–0.03687**, with unreadable text), so these are chance heading fits, **not plaintext recovery**. The exhaustive count is coverage-certified in [run 42768070554](https://github.com/FlareZ123/liber-primus/actions/runs/42768070554); original shards in [run 42765146415](https://github.com/FlareZ123/liber-primus/actions/runs/42765146415). Reproduction: [crib screen](../sims/fibonacci_heading_crib.cjs), [PHP MT enumerator](../sims/php_mt_fibonacci_crib.c), [coverage aggregator](../sims/aggregate_php_mt_fibonacci.cjs).

[Reproducer](../sims/fibonacci_title_gematria_alignment.cjs) · [successful on-demand CI](https://github.com/FlareZ123/liber-primus/actions/runs/42768055190)

## Consequences for key material: bounded negative decryption screens

The exact numerical construction supplies two natural but distinct cryptographic interpretations. Both have been tested on the original ciphertext without fitting an unknown key.

**A periodic 16-rune additive pad:** Five fixed integer streams taken from the square and its construction (clockwise values, prime values, prime ordinals, printed row-major values, reverse clockwise values), each at all 16 cyclic offsets and both signs modulo 29, give **160 configurations per interval**:

| LP2 interval | Ciphertext runes | Raw IoC | Best deciphered IoC |
|---|---:|---:|---:|
| Page 16, directly after square | 267 | 0.033539 | **0.036045** |
| Pages 16–22 concatenated | 1,744 | 0.034510 | **0.034776** |
| All unsolved pages 0–55 | 12,956 | 0.034478 | **0.034574** |

The original test re-encrypts and precisely recovers 251 actual solved LP1 GP runes using the selected test pad, verifying that the direct operation is reversible. Its longer real-LP2 scores remain near the uniform-rune IoC baseline 1/29.

**Finite-field multiplicative and affine pad:** The p15 numbers, their underlying primes and Fibonacci ranks can instead supply field elements multiplying the plaintext, with a source-derived additive offset: `C_i=A_j P_i+s B_j (mod 29)`, `j=(i+phase) mod 16`. Nonzero multiplier arrays are mandatory for reversibility. Spiral, row-major and reversed readings yield **8** eligible 16-multiplier arrays and **13** offset options (including zero); both signs, 16 phases and page-reset/continuous clocks produce **6,656** complete models. Select the best only on original pages **16–18** (800 runes), then freeze it on **19–22** (944 runes). The best training IoC was **0.03590113** (row-major square multiplier, row-major Fibonacci-rank offset, sign−, phase13, page reset), collapsing to **0.03459703** on untouched pages, near `1/29`. An independently GP-encoded Shakespeare plant under an actual square/prime affine key exactly round-trips without edits; after **41** modeled adjacent collision rewrites, same-key decoding still reaches IoC **0.06231611** (source **0.06368725**). The original therefore provides no readable output or supported key under this explicit multiplicative extension. [Executable held-out and planted inverse](../sims/fibonacci_affine_field29_heldout.cjs), [completed manual Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/42772987447).

**Twin-prime anchor and historically demonstrated prime-totient stream:** The red-highlighted 3299 in the printed square and the Cicada identifier 3301 are twin primes. A direct cross-release hypothesis starts the genuine solved-page-56 prime-totient stream `phi(prime_i) mod 29` at prime index **3299** or **3301**, allowing both additive signs, atbash carrier, literal-F interrupter and page restart versus continuous positions. There are **32** combinations. The strongest training fit on p16–18 (800 runes) is start3301, sign−, atbash carrier, F-skip and continuous stream (IoC **0.03768148**); held-out p19–22 (944 runes) scores **0.03571814**. However, F-skip itself accumulates the literal F rune and raises IoC even for wrong keys. In **750** random-start-pair controls each fitting the same 32 choices, **328** held-out scores exceed the highlighted pair (**p=329/751=0.43808**). The exact inverse recovers **1,744/1,744** runes of a planted Shakespeare passage with a known authentic-style prime-totient key. The visible twin-prime crosslink therefore yields **no recovered original key or text** under this bounded hypothesis. [Reproducer](../sims/twin_prime_totient_holdout.cjs) and [successful on-demand run](https://github.com/FlareZ123/liber-primus/actions/runs/42774492276).

**Primitive-root key-stream consequence of the red checksum:** The marked title sum `638 / 29 = 22` selects the ordinary 22nd prime **79**, whose reduction **79 mod 29 = 21** is a generator of all 28 nonzero residues modulo 29. This fixes the entire ordered multiplicative cycle `21^i mod 29` without choosing a key seed. A direct test used it as a **28-periodic additive or multiplicative key**, enumerating signs, optional atbash, literal-F passthrough, page clock reset and all 28 phases: **896 finite configurations**. The best fit to p16–18 (800 runes) reaches IoC **0.03766896** but scores only **0.03564624** when frozen on untouched p19–22 (944 runes). GP-Shakespeare positive controls exactly round-trip under both arithmetic operations, with recovered IoC **0.06368725**. The clue-derived field generator is algebraically exact and worth retaining, but the direct repeating-key interpretation does **not** decrypt these pages. [Reproducer](../sims/red_prime79_field_cycle.cjs) and [completed Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/42777012512).

**A 256-bit secret from the sixteen printed values:** Each square number occupies at most 16 bits; serializing all sixteen as 16 unsigned 16-bit fields produces **exactly 32 bytes**, a natural AES-256 or ChaCha20 key. The added [clue-derived key test](../sims/fibonacci_spiral_key_derivation.cjs) explores 32 fixed seed variants (absolute square values, underlying prime numbers, prime ordinals and Fibonacci numbers, either spiral or row-major, big- or little-endian, raw or SHA-256 hashed). Each is passed through an existing AES-256-CTR/ChaCha20/RC4 rune pad implementation at alternate page IVs, drop offsets, byte-to-rune mappings and signs. This yields **2,432 configurations per interval**, with one key draw for each ciphertext rune and page-reset alignment.

| LP2 interval | Best key-masked IoC across 2,432 tests |
|---|---:|
| Page 16, 267 runes | 0.0390865 |
| Pages 16–22, 1,744 runes | 0.0351767 |
| Entire 12,956-rune unsolved corpus | **0.0345751** |

A planted GP-English-like corpus encrypted under the literal **clockwise absolute-values 32-byte big-endian key**, AES-256-CTR and an 81% adjacent-repeat rewrite, is correctly recovered as the **top candidate**, IoC **0.0654700**. The real ciphertext shows no corresponding nonuniform distribution or readable plaintext under this prescribed aligned-key family. More complicated key skips, changed mapping, other serialization and mixed encryption layers remain untested.

**The numeric table as an AES-256 payload:** A separate [binary-grid test](../sims/fibonacci_square_grid_payload.cjs) asks whether the very same clue-derived 32-byte keys decrypt the 256-byte base-60 table on pages 49–51. It tests 36 raw or hashed square-derived AES-256 keys, five physical grid readout layouts, ECB/CBC/CTR/CFB/OFB and four IV choices where applicable, for **3,060 configurations**. Top printable-byte output is only **128/256**, and the highest count of low-range 0–28 GP-index bytes is **48/256**; no candidate resembles plaintext or a self-evident serialized rune message. A genuine AES-256-CBC 256-byte English plant decrypts exactly, with **256/256 printable bytes**. These are recognizability screens and cannot exclude a second encryption layer or a binary plaintext with no recognizable header.

**Conclusion:** The square is a genuine, precisely derived mathematical clue with potential cryptographic significance. Its simple periodic-pad, natural 32-byte stream-key, and direct AES-256 grid-payload interpretations have produced no actual LP2 decryption. Selection over large finite test families is accounted for in their descriptive scope; isolated short-window maxima are not recognized as hits.

## Reproduction and next attack

Run \`node sims/fibonacci_prime_spiral.cjs\` with Node.js 22 at repository root. Inputs: \`resources/transcriptions/liber_primus_master.txt\`, \`resources/liber-primus/lp2-corpus.json\`, and \`sims/authentic_lp1_p03_p04_vigenere_recovery.cjs\` for recovered LP1 plaintext. The code uses exact integer prime/Fibonacci generation, parses the square from the master transcript, constructs the spiral coordinates, asserts 16/16 equality, and executes all 160 candidate-key tests per span. Original-image visual reference: \`resources/liber-primus/32.jpg\`. The nearby red heading and square are visible directly in that scan.

**Most useful next step:** constrain the manuscript's use of the Fibonacci-indexed primes from independent image/text evidence. Once a particular stream, key-length convention, or transformation is specified, attack the ciphertext immediately following page 15 and demand a second independently predicted interval. Do not promote one of the many possible number-to-key transforms based on an isolated short readable output.
