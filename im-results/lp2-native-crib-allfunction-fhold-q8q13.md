# Native-source crib transfer with arbitrary delayed feedback and genuine F holds

**Decision (Agent7, 24 November 2026):** No unknown LP2 plaintext or key. The earlier [q8 permutation F-free crib scan](lp2-plaintext-autokey-q8-permutation-fhold-inverse.md) is extended to genuinely transparent Fehu and **all deterministic maps**, without the injectivity restriction. Every native source start and original physical target start with more than q remaining runes is checked at q=8 and q=13. No original crib reaches 40 runes at either delay. This rejects only exact contiguous reuse of the nine pinned solved-native sections under this specific feedback architecture; it does not exclude new prose, altered spelling, transposition, or unknown map/clock families.

## Reversible conditional mechanism and inference

Maintain a queue of q shifts. For P=0 emit C=0 and hold the queue. Otherwise C=(P+queue[0]) mod29, pop its head and append f(P), for arbitrary stationary f:{1..28}→GF29. Non-injective f is legal; it does not impair forward conditional decoding because the previous plaintext selects the shift. Ciphertext zero can also be a consuming output. The source crib fixes the actual F choices and determines all consuming indices, so no enumeration of F masks or secret maps is necessary.

For the first q consumed symbols, the unknown primer is set by C−P. Subsequently, a previously consumed plaintext x exactly q consuming positions ago must satisfy f(x)=C−P (mod29). Keep a partial map; conflicting observations or any plaintext F against nonzero ciphertext reject the alignment. This condition is necessary and sufficient for a finite crib prefix: fill unobserved map rows arbitrarily and the prescribed plaintext re-emits the prefix. The source does not authenticate a delayed feedback operator: q=8 and13 are historical solved key lengths and the F convention is genuine, but applying them to this new architecture is conjectural. Contiguous reuse is motivated by the documented 2014 crib-first solving procedure, not by an established claim that LP2 repeats earlier text.

The scanner freezes the map at 48 physical runes (no later unseen row allowed) and seeks a 32-rune independently predicted continuation. It records maximum compatible physical length and count of alignments reaching 32/40/48/80. For maxima below48 these are exact unconstrained partial-map compatibility maxima; above48 they are frozen-map reach lengths. Spaces and punctuation are discarded; donor sections are never concatenated, original target spans may cross physical page boundaries. Each alignment has its own unrestricted primer and partial map.

## Executed original-input decision

Inputs: canonical [LP2 corpus](../resources/liber-primus/lp2-corpus.json) (12,956 runes, physical pages 0–55), nine [solved-native source sections](../resources/external/relikd-solved-gp29-native-v1.json) (184, 515, 157, 780, 755, 319, 89, 85, 95 runes respectively).

| Delay | Alignments | Maximum physical length | ≥32 | ≥40 | ≥48 | ≥80 |
|---:|---:|---:|---:|---:|---:|---:|
| 8 | 37,639,836 | 27 | 0 | 0 | 0 | 0 |
| 13 | 37,042,866 | 32 | 3 | 0 | 0 | 0 |

q8 maximum: donor jpg107-167 offset154, original offset1963, 15 observed map rows; q13 maximum: 0_wisdom offset53, original offset7063, 16 observed rows. Offsets are zero-based on physical rune streams. Neither short fragment is a decryption: the first q consuming outputs have free shifts and short prefixes introduce many free map rows. No 48-rune fit, no original predicted continuation.

## Calibration and limits

Development: WELCOME first180 under a quadratic non-injective plant f(x)=x²+7x+3 mod29, with genuine plaintext F. The known aligned 48-prefix gate has 133 surviving windows for each delay (many overlapping), maximum frozen continuation reach70/66, zero 80-rune matches. This exposes insufficient map coverage at a 48-rune fit; the original rejection before 40 remains independent of this limitation.

Separate calibration: source positions100:340 in KOAN1 and LOSS OF DIVINITY, 180 fit/60 withheld, same functional form with different seed constants and primers. All four recover every primer value and every observed feedback row. Known-crib forward prediction without learning any withheld row:

| Delay/source | Map rows | Exact predicted / 60 | Unseen row |
|---|---:|---:|---:|
| 8 / KOAN1 | 19 | 60 | 0 |
| 8 / LOSS | 22 | 59 | 1 |
| 13 / KOAN1 | 19 | 60 | 0 |
| 13 / LOSS | 22 | 60 | 0 |

All reported predictions include the one known literal F in each holdout; 235/236 non-F output positions are determined and correct. Total 239/240 physical ciphertext outputs predicted. This is a **known-plaintext crib transfer**, not ciphertext-only plaintext recovery; the donor continuation is supplied independently, and unobserved map rows are not guessed. The four plants use two distinct native texts and the same quadratic family with changed constants. No claim of independent CI; the calculations ran against connected repository source strings in V8. The combined four-shuffle null attempt timed out before output, so no null result is asserted.

## Reproduction and research decision

[Single-file CommonJS reproducer](../sims/lp2_native_crib_allfunction_fhold_q8q13_sft.cjs), commit 1c2cbbc2fb72e9f70aa2cdf3fbfde1dcb0b543a6. From repository root:
- `node sims/lp2_native_crib_allfunction_fhold_q8q13_sft.cjs controls`
- same file with arguments `q8` or `q13` for each full original scan; optional `null1` etc for independent frequency-preserving nulls.

The original results were executed before splitting the modes (same scan logic). Do not rerun this native exact-crib family under looser maps or arbitrary lag menus without a new source-derived alignment. A new independent original crib or a genuinely source-selected state law is necessary to make further delayed-feedback work meaningful.
