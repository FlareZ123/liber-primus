# Four PARABLE primes: RSA8 chapter inversions and original-grid RSA5 exclusion

**17 November 2026, Agent4. Two source-constrained original-input RSA exclusions; no unknown LP2 plaintext, historical RSA cipher, original key or destination recovered.** The self-contained [read-only CommonJS SFT](../sims/lp2_parable_fourprime_rsa8_original_sft.cjs) implements the exact reversible map and its positive controls.

## A source-constrained causal hypothesis

The **authentic, independently clear** physical LP2 p57 prints exactly four natural period-delimited units. Their GP29 prime sums, with the red title separated from the three prose clauses, are **449, 1259, 1031, 1229**. The latter three have a particularly strong dated historical link: their product **1,595,277,641** appears in the 2013 *761.MP3* Parable metadata, a year before LP2 was distributed. The [original four-prime sum inventory](lp2-p57-parable-four-primeordinals-666.md) and [previous RSA using only the three audio factors](lp2-2013-parable-rsa-cyclewalk-original-gate.md) establish the inputs independently.

One explicit alternative to the already tested **three-factor modulus** is to include the red title's **fourth prime** as part of the modulus:

- \`N = 449 × 1259 × 1031 × 1229 = 716279660809\`.
- \`φ(N) = 448 × 1258 × 1030 × 1228 = 712843586560\`.
- \`29^8 = 500246412961 < N < 29^9\`. This allows **eight full GP29 digits** to fit in the modulus; the earlier three-factor RSA exploration had room for only six full digits without a separate domain rule.
- The clear p57 body **after its seven-rune PARABLE heading** contains **88 = 11×8 runes**. Original unknown chapters p33–39 and p40–53 contain exactly **1680 = 210×8** and **3008 = 376×8** untouched runes. The physical p50 numerical page is visibly **32×8 cells**.

These dimensional correspondences make an eight-rune receiver worth a fixed test. They do **not** prove that the author intended to multiply the title into the public modulus, implement RSA, use a format-preserving cycle walk, or choose a particular exponent. The 2013 audio supplies the *three*-factor product; it does not supply a fourth-factor RSA command. The serious rival is that all four prime sums are part of a different numerical, book-code or philosophical construction.

## Exact locked inverse, plaintext-bearing receiver, and controls

Treat each consecutive eight original GP29 rune indices as a conventional most-significant-first base29 integer \`x\` in \`[0,29^8)\`. Apply RSA modular exponentiation \`x -> x^e mod N\`; when the result lies outside \`[0,29^8)\`, repeat the same RSA permutation until it re-enters. This **cycle walk** defines an exact bijection over all eight-digit inputs. The private exponent \`d=e^-1 mod φ(N)\` inverts the map by the same cycle-walking rule. No ciphertext rune is discarded, changed, inserted or used to select a key.

Freeze three independently visible, though **not author-selected as RSA exponents**, integers:

1. \`e=449\`, the original red PARABLE title's GP-prime sum.
2. \`e=1033\`, the earlier 2014 Cicada stage's special prime and one of the repeated original p33–39 cuneiform numerals.
3. \`e=3301\`, Cicada's historical signed emblem and the other original p33–39 cuneiform numeral.

For each exponent test original printed order or reversed digit order inside every fixed eight-rune packet, and both public and private exponent directions. This yields **twelve deterministic decoders per full chapter and twenty-four original-input readouts** across the two completely eight-divisible chapters. The historical manuscript does not select the orientation or exponent direction; no candidate is tuned to plaintext or to an original word.

A source-native positive takes **all 88 clear GP29 runes in p57's three-sentence body**, encrypts with each exponent/orientation, and recovers all **88/88 original clear runes**, in both inverse directions. Each of the twenty-four actual LP2 original readings also re-encrypts its original chapter exactly. These are implementation checks: any secret bijection re-encrypts ciphertext under a matching inverse, so roundtrip alone cannot establish the historical cipher.

## Original outcomes

Runed-window metrics use ordinary GP29 symbol index of coincidence \`Σ n_i(n_i−1)/[N(N−1)]\`.

| Unmodified original source | Original GP29 IoC | Best of twelve RSA8 inverses | Winner |
| --- | ---: | ---: | --- |
| Physical pp33–39, 1,680 runes, 210 packets | 0.03436002 | **0.03513926** | e=3301, reversed digits, public direction |
| Physical pp40–53, 3,008 runes, 376 packets | 0.03454263 | **0.03485064** | e=3301, reversed digits, private direction |
| Authentic clear p57, 95 runes (language control) | **0.06270997** | not an unknown-cipher test | all 88 body runes recover under a planted RSA8 |

The p33–39 highest-IoC candidate begins \`IA-R-M-E-EO-M-A-H-NG-M-TH-OE-H-E-L-B-EA-NG-TH-EA-EA-J-A-OE-I\`. The p40–53 highest begins \`A-O-G-S-S-P-X-J-P-I-B-NG-G-O-I-OE-OE-J-C-O-O-S-OE-N-AE\`. None of the twelve complete originals for either chapter develops intact GP-native English or a plausible instruction; each remains close to uniform-symbol ciphertext over hundreds of original runes. The maximum of all twenty-four original IoCs is **0.03513926**. There is no held-out authenticated plaintext to promote.

The [SFT](../sims/lp2_parable_fourprime_rsa8_original_sft.cjs) reads the original repository corpus, asserts the source dimensions and exact modulus/domain, recomputes all twenty-four originals, independently encrypts and recovers clear p57's **entire 88-rune body**, re-encrypts every original output, and prints complete first-rune and frequency diagnostics. Run with \`node sims/lp2_parable_fourprime_rsa8_original_sft.cjs\` under Node.js 22. The expanded **24 original RSA8 inverses** and all **12/12 authentic p57-body roundtrip positives** independently **passed Windows Node.js 22** in [manual source CI run 44154768643](https://github.com/FlareZ123/liber-primus/actions/runs/44154768643). The original-source functions were also executed separately against the unchanged GitHub corpus during this invocation.

## Distinct 256-byte grid and 51-red-rune RSA5 receiver

There is a second, independently source-anchored use of the same four-prime \`N\`. It fits inside **five bytes** because \`N=716279660809 < 2^40\`. Original physical p49–51 contain **256 printed base60-derived bytes**, while the original physical **p53 has exactly 51 consecutive red runes** after 128 black runes. A direct 51-block RSA5 payload would consume **51×5=255** of those table bytes, leaving one source-visible marker byte. This interpretation is not authenticated: no original clue explicitly orders the 256 bytes into RSA blocks or labels the red51 as an output length, and including p57's heading prime in a cryptographic modulus remains conjectural.

Nevertheless a very strong **necessary condition independent of plaintext, exponent, or any private key** is testable. For standard invertible RSA, the full integer of **every one of the 51 five-byte ciphertext blocks must be less than N**. Test exactly the two ways to place the remaining one-byte marker (before or after the 255 payload bytes) and both conventional within-block byte endiannesses. All 51 blocks are fixed by original table bytes; none are altered, skipped or selected after decoding.

| Original packet serialization | Blocks less than N | Invalid blocks ≥ N |
| --- | ---: | ---: |
| Marker after payload, big-endian | **35/51** | **16** |
| Marker after payload, little-endian | **28/51** | **23** |
| Marker before payload, big-endian | **33/51** | **18** |
| Marker before payload, little-endian | **36/51** | **15** |

**All four canonical RSA5 interpretations are mathematically impossible**, independent of any attempted modular exponentiation or reconstructed words. The first packet in the most direct reading is **875,764,890,209**, already greater than the complete four-prime modulus **716,279,660,809**. This fails before a key search can begin.

The [same read-only SFT](../sims/lp2_parable_fourprime_rsa8_original_sft.cjs) reads all 256 base60 bytes, asserts the complete original p53 red start128/length51 annotation, recomputes the exact full four-case RSA5 range census, and retains the original twenty-four RSA8 inverse and 88-rune positive tests. Both the complete new RSA5 original-packet census and the previously completed RSA8 native controls **passed Windows Node.js 22** in [manual CI run 44152455205](https://github.com/FlareZ123/liber-primus/actions/runs/44152455205). This rejects **raw standard RSA5 ciphertext blocks** under these two marker placements and byte conventions. It does not reject deliberately framed/packed sub-40-bit residues with another specified codec, a cryptographic hash/KDF using the source grid, or an independently authenticated RSA operation with different byte layout.

## Decision and remaining uncertainty

**Retire both the exact four-prime RSA cycle-walking eight-GP-rune family and the canonical original-grid 51-block RSA5 packet family** for ordinary directly recovered GP29 prose on pp33–39 and pp40–53. In particular, do not expand exponents, packed positions, page resets or alternative padding just to rescue an unselected RSA interpretation. The three-factor RSA6 and the canonical RSA7 residue contradictions are separate, already recorded [bounded gates](lp2-2013-parable-rsa-cyclewalk-original-gate.md).

The authentic 2013 Parable product and four source-visible p57 prime sums remain established numerical relations. They still lack an independently specified, historically human-readable reversible receiver for unknown LP2 ciphertext. A different modulus, non-RSA operation, external binary object or source-selected key schedule is outside this finite test. No newly decrypted rune, authentic external key or destination is asserted.
