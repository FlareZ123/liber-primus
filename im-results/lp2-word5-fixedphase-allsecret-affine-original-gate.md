# Word-local five-phase affine cipher: original LP2 decision

**Status: conditional original-cipher exclusion; no plaintext or authentic key recovered (17 November 2026).** The original 55 rune-bearing unsolved physical pages p0–p55 contain 12,956 GP29 runes in 2,896 printed words. The canonical transcription and original physical-word continuity are the fixed inputs. This report tests a completely invertible *direct* affine family suggested by the LP2 five-dot motifs and the anomalous distance-five repetitions. The family is precise and bounded, so its failure does not exclude a five-position mechanism with moving slopes, feedback, substitutions or additional layers.

## Source-motivated model and exact invariant

For word `w`, within-word rune coordinate `j` and `p=j mod 5`, consider

`C[w,j] = a[p]·P[w,j] + b[w,p] (mod 29)`,

where the five nonzero slopes `a[0..4]` are **completely secret** and each `b[w,p]` is also **completely secret and independent for every word and phase**. This already grants 14,480 unconstrained offsets across 2,896 words. As `29` is prime and each slope is nonzero, the codec is lossless; synthetic original-shaped GP29 English plants, encrypted with independent hidden phase offsets per word, exactly invert in the SFT.

Every within-word five-back difference obeys

`C[w,j]−C[w,j−5] = a[p]·(P[w,j]−P[w,j−5]) (mod 29)`.

Thus each of the five phase-conditioned difference histograms is only permuted by multiplication by nonzero `a[p]`. Its index of coincidence (IoC), including the count-weighted average over the five phases, **cannot be changed by any choices of the secret offsets or slopes**. A simpler wordwise `C=P+key(word)+phase offset` model has the same invariance for the phase-conditioned adjacent `C[j]−C[j−1]` differences.

The observed original lag-five phase counts are **872, 584, 350, 190, 109**. Their exact GP29 difference IoCs are **0.0341429760, 0.0347987500, 0.0344821940, 0.0333054859, 0.0378865104**; count-weighted original **0.0344995653**. The analogous adjacent phase counts are **872, 3397, 2715, 1835, 1241**; their count-weighted IoC is **0.0353591261**.

## Independent native-GP language controls

Two distinct English corpora in `resources/control/` are greedily encoded into the documented GP29 source orthography (including `ING` and `IO`), and 2,896 words are independently drawn with each original printed word length held fixed in every trial. The seed for the 32-bit LCG is `0x13a5c023`. Each control corpus supplies **3,000** independent full 12,956-rune, exact-geometry trials. Every trial has all five observed word/phase histograms computed by the same code. This conditional calibration covers English comparable to these two sources, not all possible plaintext languages or orthographies.

| Invariant | Original | Gibran native controls | Shakespeare native controls |
|---|---:|---:|---:|
| Adjacent-difference weighted GP29 IoC | 0.03535913 | min 0.04401521, mean 0.04580943 | min 0.04214097, mean 0.04372801 |
| Five-back-difference weighted GP29 IoC | 0.03449957 | min 0.04012625, mean 0.04314134 | min 0.04035122, mean 0.04458337 |

**Zero of 3,000 controls from either corpus** has a count-weighted IoC as low as the authentic LP2 ciphertext for either invariant. The phase-specific five-back IoC minima are **not individually all excluded**: 12 of 3,000 Gibran controls fall below original phase four alone. The weighted statistic combines all source phases and is the intended bound; isolated individual-phase significance is not claimed.

**Decision:** Under original GP29 word boundaries and ordinary source-native English, the direct five-phase affine cipher with a *global* slope per phase and arbitrary hidden offset per word/phase is incompatible with the measured original corpus. Arbitrary word-specific slopes, transpositions, nonnative plaintext, nonlinear feedback, inserted/dropped runes and additional cipher layers remain outside this theorem.

## Separate five-back equality clue

Within the 2,105 authentic within-word distance-five sites, **104** have identical runes. Of these, **11** are the rune S (GP index 15). A source-conditioned rejection null independently shuffles the runes within each of the 441 eligible repeated-symbol words, preserving the word's exact rune multiset and the **exact original adjacent-equality mask**. The deterministic 3,000-trial control has **mean total 76.24** (range 48–105; just one trial at least 104) and **mean S 2.173**, maximum eight S events; zero trials reach 11 S events. The S selection is retrospective and this is a Monte Carlo conditional anomaly, not an established cipher opcode or an authenticated plaintext crib.

Independently sampled native English words with the original word lengths give approximately **121.7** (Gibran) or **123.0** (Shakespeare) five-back equality sites, with about 4–5% of 3,000 native controls below the original 104. Hence the **total 104** is not intrinsically a strong native-language exclusion; the stronger five-phase affine exclusion uses the *value distribution of the lag-five differences*.

## Reproducibility and next fork

The single original-source and native-positive test is [`sims/lp2_word5_shift_difference_original_sft.cjs`](../sims/lp2_word5_shift_difference_original_sft.cjs). It reads `resources/liber-primus/lp2-corpus.json`, the original printed text transcription and the two source-native language control texts. All critical original counts and inverse invariants are asserted. The original runes are the fixed observation; no source words, keys, or plaintext were learned from them.

A genuinely different original-text attack allowing `a[w,p]` *also to be secret and free per word* uses exact triplet affine consistency to search source-native plaintext candidates for the authentic 57 length-11…14 printed words. It is implemented separately in [`sims/lp2_wordlocal_affine5_allsecret_dictionary_sft.cjs`](../sims/lp2_wordlocal_affine5_allsecret_dictionary_sft.cjs). That broader model has no globally invariant frequency statistic and needs independent plaintext evidence; fitting an arbitrary letter-to-rune map within each short word is insufficient as a historical solve.
