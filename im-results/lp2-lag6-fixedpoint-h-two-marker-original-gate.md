# Lag-six fixed-point H versus terminal word morphology: exact reversible two-marker gate

**Agent 10, 14 November 2026. Classification:** original-cipher necessary-condition negative and explicit source-table cipher inverse. **No unknown LP2 plaintext, authentic key, or final destination recovered.** [One-file Node22 CJS reproducer](../sims/lp2_lag6_fixedpoint_h_two_marker_sft.cjs) passed on original GitHub sources in [Windows Actions run 43600858992](https://github.com/FlareZ123/liber-primus/actions/runs/43600858992).

## Original clue and falsifiable interpretation

The previously observed, independent LP2 word-local lag-six relation is

`C[i] = T(C[i-6]) = (24-2*C[i-6]) mod29`.

The only fixed point of `T` is GP29 index **8 = H**. The manuscript's **86** adjacent repeated ciphertext runes independently suggest a one-symbol escape (index **28 = EA** is an existing native GP symbol and a possible transparent repeat indicator). A concrete hypothesis is that the ciphertext gives two positional plaintext readouts: output a repeat of the preceding cipher rune when the plaintext is EA, and output `T` of the word-local sixth-back cipher rune when the plaintext is H. This is an *analyst-proposed* interpretation, not a Cicada instruction. Crucially, it would turn real ciphertext matches into visible plaintext **H** positions, independent of any hidden alphabet or key.

To make it **reversible**, when the two special ciphertext outputs coincide, EA takes `C[i-1]` and H deterministically takes `C[i-1]+1 mod29`. The other 27 plaintext symbols are mapped bijectively, in canonical GP29 rank order, onto the other 27 ciphertext symbols, with a cyclic rank shift read from the original p49–51 **32×8** numeric table. That shift uses source row = previous ciphertext index 0..28, source column = within-word offset modulo8, byte reduced modulo27; at earlier within-word offsets without six-back the 28 ordinary symbols use modulo28. The first entire-book rune uses the first grid byte as an additive initial value. The previous ciphertext rune persists across printed word boundaries, while the six-back H rule resets at each word; original 2,896 word boundaries and 12,956 runes remain unchanged. Each step is an invertible 29-way permutation for a given ciphertext state, so the model has no hidden erasures or unstated key draws.

The weakest assumptions are substantial: the original book does not assign H or EA to either statistical feature; the table is not explicitly designated as this cipher's rank-shift key; the selected lag-six transform itself was first discovered through ciphertext analysis. The key-independent consequence below is nonetheless a decisive rejection **if** the proposed transparent H/EA reading is correct.

## Untouched original ciphertext: 31 forced word-final H letters

Parsing the canonical first 55 rune-bearing source pages and joining true words across print wrapping gives **2,896 words / 12,956 GP runes**. Among **559** words of at least seven runes, there are exactly **1,290** within-word `i≥6` positions. The canonical ciphertext has **80** lag-six T matches, including **32** at the *last rune of a word*. Exactly one of those 32 also equals the immediately preceding ciphertext rune, so the reversible tie rule assigns that one event to EA. The remaining **31** word-final matched events force the last **plaintext** rune to GP H under *every possible assignment of the other 27 symbols*. This conclusion is **key-independent** and does not require testing the p50 table shift.

For each of three existing source-native historical-English registers, sample independently a real GP-encoded English word from the same original length class at each of the **559** fixed slots. The GP encoder preserves the 29-rune alphabet and standard attested `TH/NG/EO/OE/AE/IA/EA` contractions, with declared `QU→CW, V→U, K→C, Z→S` aliases. To avoid assigning impossible zero probabilities in rare long-length classes, use a Jeffreys `+0.5` numerator and `+29×0.5` denominator pseudocount for the final-H category. The **exact Poisson-binomial upper tail** computes the probability of at least 31 terminal H symbols, with independent draws conditional on the printed word-length inventory:

| Source-native reference | Expected terminal H among 559 | P(≥31 terminal H) |
| --- | ---: | ---: |
| Shakespeare, first 300,000 chars | **6.5935287901** | **2.52781965395 × 10⁻¹²** |
| Gibran, *The Prophet* | **4.4305242541** | **6.14192151548 × 10⁻¹⁷** |
| Emerson, *Essays* | **5.0761220315** | **3.35924114937 × 10⁻¹⁵** |

These source-dependent tail probabilities are **conditional model failures**, not discovery-wide p-values proving that lag-six arithmetic was intentionally authored. This test relies on preserved word boundaries and ordinary source-like English morphology, so languages with many H-final words, arbitrary plaintext encodings, and different marker assignments are outside its scope. The conclusion survives free secret permutations for the other 27 GP symbols because the 31 special-output positions are fixed by the proposed cipher itself.

## Explicit all-rune inverse and controls

The same SFT fully decrypts the unmodified 12,956 original ciphertext runes with the original 256-byte table and then **reencrypts every rune exactly**. A deterministic source-native Shakespeare control draws GP words matched to every original word length, encrypts them with the **same** state transitions, and recovers all **12,956/12,956** exactly. Planted text/cipher have GP29 indices of coincidence **0.06059673635 / 0.03471989451**, respectively; thus this cipher can hide ordinary native-GP language while suppressing many adjacent copies.

The actual original reverse has IoC **0.03531670712**, close to the unchanged ciphertext **0.03447839786** and far below the native plant. It produces **515** GP H and **86** GP EA runes globally, and no coherent plaintext. A native-language positive additionally yields **68** adjacent ciphertext repeats, **31** six-back T matches, and **10** word-final T matches under the same reversible encoder. Those single positive-plant counts are diagnostic, not intended as fitted distribution targets.

## Decision for Director #867

**Reject the specific transparent EA-as-doublet / H-as-lag-six-T cipher**, even allowing any unknown key or invertible mapping on the remaining 27 plaintext letters. It forces at least 31 word-final H symbols on the untouched manuscript, grossly inconsistent with independently calibrated GP-English word morphology. The direct p50-table keyed realization also fails to recover native-GP prose, although every original and planted symbol roundtrips.

The source lag-six anomaly may reflect a different hidden state, a sparse cipher-structure event, a word-boundary design, or statistical search selection. Its fixed point H is now a useful **negative discriminant**: any future proposal interpreting the `T` matches as transparent H letters must account for the same original 31 word-final markers before attempting expensive keys. A genuinely new candidate should derive a reversible key schedule or marker from an independently visible creator clue and predict original text beyond its source-fitting window. Do not rescue this model by postselected alphabet aliases, adjusted word endings, or arbitrary inserted deletion paths.
