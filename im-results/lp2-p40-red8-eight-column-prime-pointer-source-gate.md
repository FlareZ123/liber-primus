# LP2 pp40–53: a source-table eight-column changing-state cipher gate

**Agent14, 12 November 2026. Status:** bounded negative for one frozen nonstationary original-inverse hypothesis, plus original-image observation. [Manual Windows Node22 run 43269294181](https://github.com/FlareZ123/liber-primus/actions/runs/43269294181) passed. No unknown plaintext, source-authenticated algorithm, key, or destination recovered.

## Independent original source and competing possibilities

The source-visible chapter pp40–53 has **3,008 original GP29 runes**. It begins with eight distinct red heading runes, indices [0,9,19,26,6,23,25,8], and has **3,000 = 8×375** body runes. The same chapter includes the **32×8 / 256-byte** printed number table. Solved p56 demonstrates subtracting totients of primes modulo29. The signed 2016 text refers to words, meaning, numbers and direction, but supplies no explicit per-column state update or lookup opcode. A counter updated from a rune's published GP prime weight is a plausible finite experiment, not a validated original cipher instruction.

The [already-executed all-secret static column entropy gate](lp2_p40_red8_allsecret_columnar_entropy.md) rules out one static substitution alphabet per column under native GP-English controls. The [existing 32×94 source-table additive study](lp2_p40_p53_red_primezero_grid_source_gate.md) rules out stationary grid pads under four literal layouts. A ciphertext-driven pointer is a genuinely different 32-row consumer.

### Static original floral artwork

The elaborate side frames are visually identical between all fourteen original JPEGs, 57.jpg–70.jpg. Decode the original images to **2400×3600 grayscale 8-bit**, take the fixed left rectangle (0,600,550,3000) and right rectangle (1850,600,2400,3000), and compare raw pixel bytes. Each side's entire raster is **byte-identical on all 14 pages**. The first twelve SHA256 hex digits are 7016a273a480 (left) and 4a96c7db2e54 (right), respectively, for every source page. This exact source check indicates the repeated floral frames do not carry any visible page-changing state or page-specific key there. The p53 closing cicada and red body are elsewhere, beyond these crop rectangles.

## One complete frozen nonstationary operation

The eight red GP indices initialize eight 5-bit row pointers S[0..7]. Retain those eight printed rune symbols unchanged as header/IV metadata. For each of the **3,000** remaining source-order body symbols at index t, select column c = t mod8, row r = S[c] in 0..31, read the original table byte at index 8r+c, and reduce that byte modulo29. Decode with P[t] = (C[t]−(byte mod29)) mod29, matching the subtractive direction of solved p56. Update **only column c**, after reading the original ciphertext symbol, with S[c] = (S[c] + GPprime(C[t])) mod32. State persists through all physical page boundaries, including the runeless table page50. This gives a fully reversible ciphertext-feedback transform with zero secret key, no fitted phase, no changed original glyph, and a naturally 32×8 byte-addressable register.

The exact source does not prescribe these state updates or the modulo29 byte reduction; those are the model assumptions under test.

## Original and source-native control results

| Stream | GP29 IoC |
|---|---:|
| Unchanged 3,000-rune original body | **0.0345444036901** |
| Full 3,000-rune candidate inverse | **0.0345908636212** |
| Initial pp40–50, 2,466 decoded body runes | **0.0346064694860** |
| Independent pp51–53 continuation, 534 decoded runes | **0.0347900021783** |
| Independently sourced 3,000-rune native-GP Shakespeare plant | **0.0629789929977** |

The original decoded source begins: **A NG F D N D B J P TH G N X C C EO U X D M M T AE F EO W U IA J Y J J H AE TH P U M H F**. Neither the initial body nor the p51–53 continuation yields coherent prose or a recognizable message. The last eight pointer values are [2,31,26,7,5,8,20,27].

The source inverse precisely re-encrypts **3,000/3,000 original body rune values**, keeping the eight red IV glyphs intact. A separate GP29-normalized Shakespeare plant encrypts and recovers **3,000/3,000** genuine native GP plaintext runes. Repeating that native decryption with two swapped source-heading seeds fails the plant. These are correct-input and wrong-key controls; an arbitrary reversible transform also forward-reconstructs its own ciphertext, so this does not establish a true cipher.

## Decision and reproducibility

**Retire this precise GP-prime-increment, per-column 32-row pointer decoder for original GP29 English plaintext.** The artwork and dimensions motivate the finite test, while no known 2014 authorial instruction supplies a unique state update, output alphabet, or whole-chapter plaintext consumer. Reopen only if a new authenticated source selects different executable state/key derivation and predicts untouched original text.

[One-file source-input SFT](../sims/lp2_p40_red8_eight_column_prime_pointer_sft.cjs) is Node22 CommonJS with no third-party libraries. It uses the canonical original LP2 GP29 and printed table datasets, a pinned independent Shakespeare positive plant, exact forward inverse and wrong-state assertions. All three source-input studies passed the [manual-only Windows workflow](https://github.com/FlareZ123/liber-primus/actions/runs/43269294181).
