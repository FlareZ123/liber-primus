# Source-factorized p50 quotient: direct 32-rune Vigenere plaintext recovery attempt

**Agent30, 21 November 2026. Classification: executed original-source hypothesis test; exact positive plaintext/key recovery; negative on authentic p50 quotient. No unknown LP2 plaintext, author-selected cipher key, or puzzle destination recovered.**

[Windows Node.js 22 independent test](../sims/lp2_q252_period32_language_inverse_sft.cjs) · [successful original-data CI, run 44953900663](https://github.com/FlareZ123/liber-primus/actions/runs/44953900663)

## Human-recoverable proposal, with its weakest premise

The LP2 p49–51 source contains exactly **256 two-digit base60 numeric tokens**, printed as **32×8**. Independently documented source markings on p23 and p39 give a degree-four GF29 factor of its 256 coefficients. This permits a **lossless 252-GP29-coefficient quotient** without a fitted phase. A possible direct message-reading attempt, distinct from applying the quotient as an unknown-page pad, is to decrypt this quotient as its own *252-rune message* under a **period-32** 29-letter Vigenere key. The page's **32 rows** provide a possible source connection for this key period. **Selection caveat:** period 32 was also noticed after examining a preliminary phase-collision scan over periods 1–40, where it happened to rank highest. The visual interpretation and the phase-period score are therefore not independent evidence for an intended cipher. No Cicada instruction selects a Vigenere cipher, a 32-letter key, language without printed word delimiters, or reading the quotient as plaintext. This is a bounded direct-output experiment, not an established intended path.

### Frozen input and exact inverse

Using the repository's original read of [the 256 base60 cells](../resources/liber-primus/lp2-grid-256.json), interpret the 256 bytes as the coefficients of a *descending-degree* GF29 polynomial. Exact division by the original red p23×p39 quartic with descending coefficients \`[5,24,7,16,12]\` produces **252** coefficients and **zero** remainder. The quotient begins:

\`[0,23,10,15,28,2,3,4,20,15,4,6,...]\`.

For every key \`k[0..31]\` in GP29, the candidate plaintext is

\[
P_i = (Q_i-k_{i\bmod32})\bmod29 .
\]

The inverse and exact forward reencryption are always reversible. The 32 key letters are completely unknown; to find them we maximize a *smoothed GP-native 4-gram source-language likelihood*, without using original unknown plaintext. The model is trained on **600,925 independently GP-encoded runes** from three already-checked-in English controls (Shakespeare, Gibran, Emerson), calibrated to the solved LP1 IO/ING rune orthography. The optimizer uses **64 fixed-seed 100-round coordinate-annealing restarts**, selects the best complete 32-letter key by likelihood and prints its complete decoded 252-rune sequence. The routine is deterministic and has no hidden search inputs.

## Real plaintext calibration, then untouched original quotient

A held-out **252-rune authentic solved LP1** passage beginning “WHO ARE YOU WHO WISHES TO STUDY HERE…” is encrypted under a deliberately hidden period-32 key. The identical standalone optimizer (without using the true key as an input) returns:

| Outcome | Actual native-GP positive plant | Original p50 252-symbol quotient |
| --- | ---: | ---: |
| Best log 4-gram likelihood **per scored rune** | **−1.953591** | **−4.206710** |
| Decoded GP29 IoC | **0.064567** | **0.044931** |
| Recovered exact hidden key symbols | **32/32** | No source key available |
| Recovered exact authenticated plaintext symbols | **252/252** | **None authenticated** |
| Human-readable output | Complete source English | No coherent English passage |

The original quotient's *unkeyed* language score is **−7.14715** and rune IoC **0.036330867**. The optimized original output begins in phonetic GP romanization:

\`MIDLSFEATHBIAGNIFIBEDGNTTHLMAYDESEDEAFSEMPUTHFIURGTHTLTNECCPSHADSSHTAFUX...\`

Its isolated short English-looking fragments are expected under a trained English 4-gram score optimized over 32 freely selected key characters. There is no stable phrase, independently source-selected 32-letter key, or held-out original-cipher confirmation.

### Key-independent cross-check

For any fixed period-32 bijective alphabet shift, pairs of ciphertext symbols **32 positions apart in the same key phase** are equal exactly when the corresponding plaintext symbols are equal. On the untouched quotient this phase-pooled coincidence is **41/868 =0.047235**. On **910** source-native solved-LP windows of equal 252-rune length, sampled at source offsets separated by three, approximately **7.0%** have phase-pooled coincidence at or below that value. This is a disfavoring tendency for ordinary source-like English, **not** a mathematical impossibility bound or a preselected significance estimate; the observed source-window percentile is not corrected for the preceding 1–40 key-period scan. The direct recovery experiment above shows a large measured language-likelihood gap with an independently recovered positive.

## Decision

The *source-shaped* original quotient remains a concrete 252-rune encrypted-object candidate. A plain one-layer period-32 Vigenere reading, even after searching arbitrary key symbols with a positive-recovery-capable decoder, does not yield native English. There is no justification for promoting the optimized 32-letter gibberish key into a Cicada discovery.

This experiment leaves the source-marked polynomial factorization intact and does not eliminate other quotient codecs, other key sources, compression, non-GP text, or a cipher whose intended receiver is one of the 56 unknown LP2 pages. It tests one new direct plaintext route, with a real source register, instead of treating a numerical factorization as a solved message.
