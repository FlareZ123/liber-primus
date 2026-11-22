# Original 2013 Twitter-byte stream against the LP2 ciphertext difference: exhaustive fixed-key alignment gate

**Agent42, 22 November 2026. Result: one previously untested full-GP29 historical-source differential-key transfer and a subordinate, already-excluded 28-wheel transport replication. No unknown LP2 plaintext or authentic key recovered.** The historically sourced offset sweep in inverse A is distinct from earlier direct-C Vigenère/Twitter-stream comparisons; inverse B is strictly weaker than previously established key-independent original-language invariants. The early historical-source candidate comes from the original 2013 Twitter byte dump, while the operation is motivated by the actual **86/12,901** same-rune adjacent pairs on the surviving LP2 pages. The original source does **not** authenticate this cipher rule or a Twitter→LP2 key transfer.

## Causal inverse A: full GP29 first-difference additive running key

A ciphertext-feedback chain can produce low adjacent repetitions if the transmitted **difference**, rather than the transmitted rune, is keyed. Test the reversible, additive GP29 model

```text
C[-1] = 0
C[i]  = (C[i-1] + P[i] + sign*K[offset+i]) mod 29
P[i]  = (C[i] - C[i-1] - sign*K[offset+i]) mod 29
```

Here `P` is ordinary source-native GP29 English, `C` is the complete unmodified ciphertext over all 55 rune-bearing physical pages p0–55, and `K` comes directly from the 2013 byte stream. All page boundaries, word breaks and rune values remain untouched. A zero difference is legal; the model does not incorporate an independent rejection draw, skip, hidden alphabet, changed word boundaries or a second cipher layer. Those additions require a separate source-supported instruction.

The repository's original 2013 offset-labeled hexadecimal archive contains **988 nonoverlapping records** covering exactly **64,167 bytes**, with no holes. Each byte-to-GP29 conversion is frozen before reading the candidate plaintext:

1. `byte % 29`, producing 64,167 key runes;
2. `floor(byte*29/256)`, producing 64,167 key runes;
3. `byte & 31`, discarding values 29–31, producing 58,121 key runes.

Both forward and reverse complete-byte tape orientations and both additive signs are allowed. We even grant **every possible contiguous full-length key alignment** with the 12,956-rune original manuscript. This is **590,360 exhaustive offset/variant combinations**. It is a stronger source-transfer test than trying just the obvious offset zero or direct subtraction on `C[i]`.

## Fixed English instrument and blind heldout

The independently pinned Shakespeare first-300k text, encoded under the source-verified 29-rune spelling (`ING→NG`, `IO→IA`, `QU→CW`, `V→U`, `K/Q→C`, `Z→S`), supplies 217,106 reference runes. Its fixed smoothed GP unigram probabilities `q[x]` define one completely specified log likelihood ratio against uniform:

`L(P) = Σ log(29*q[P[i]])`.

Select key offsets using **only global original rune positions 0–349**. For each of the 12 variants, reserve a genuinely independent original holdout of **350 runes at global position 6600**, using the identical origin offset and source stream clock through all intervening runes. We show the best offset per variant, without optimizing any model on that holdout.

| Source byte map | Tape direction | Inverse sign | Offsets checked | Best offset | First350 LLR | Holdout350 LLR |
|---|---|---:|---:|---:|---:|---:|
| modulo29 | forward | − | 51,212 | 13,893 | −172.174 | −310.611 |
| modulo29 | forward | + | 51,212 | 12,262 | −148.221 | −353.267 |
| modulo29 | reverse | − | 51,212 | 29,484 | −163.903 | −345.786 |
| modulo29 | reverse | + | 51,212 | 25,263 | −154.790 | −344.054 |
| scaled29 | forward | − | 51,212 | 22,113 | −165.605 | −311.368 |
| scaled29 | forward | + | 51,212 | 2,540 | −166.004 | −278.649 |
| scaled29 | reverse | − | 51,212 | 9,384 | −156.384 | −283.617 |
| scaled29 | reverse | + | 51,212 | 40,692 | −161.085 | −283.243 |
| low5/discard | forward | − | 45,166 | 18,466 | −162.504 | −358.054 |
| low5/discard | forward | + | 45,166 | 42,645 | −147.746 | −254.017 |
| low5/discard | reverse | − | 45,166 | 26,749 | −170.857 | −294.692 |
| low5/discard | reverse | + | 45,166 | 11,585 | −161.214 | −326.798 |

**Across the entire 590,360-combination search, no training score exceeded −100, and none exceeded zero.** Every top-ranked candidate's untrained original holdout score remained strongly negative. There is no native-English run or supported cipher word at any candidate offset. This conclusion compares the tested models to the given English register, rather than claiming an information-theoretic impossibility for any hidden plaintext.

## Exact forward/inverse positive

To calibrate the same scoring instrument, take the **first 12,956 actual Shakespeare GP-native runes** as a planted plaintext and encrypt under the declared chained cipher with the 2013 `byte % 29` tape from **secret offset 761**. The exact inverse recovers **all 12,956/12,956** planted runes. Run the identical blind 51,212-offset screening on the first 350 encrypted runes: it chooses precisely offset **761** as its unique winner, with first350 LLR **+154.463**; its second-best alignment scores **−161.107**, a margin greater than 315. The full-length native-plaintext plant ensures the negative is not caused by the original manuscript's length, the scorer being unable to recognize source-native GP, the key orientation, the difference sign or an incapable search procedure.

## Ancillary inverse B: 28-wheel EA-repeat transport already excluded independently of the source key

The first mechanism permits all 29 ciphertext differences but does not deliberately suppress repeated ciphertext runes. To respond to the manuscript's strongest anomaly without an arbitrary redraw rule, test a *separate* exactly reversible architecture. Reserve `P=28` (the comparatively rare native GP rune EA) for the zero step, and map ordinary plaintext indices 0–27 bijectively to the 28 **nonzero** steps:

```text
C[-1] = 0
step[i] = 0                                  if P[i] = 28 (EA)
step[i] = 1 + ((P[i] + K[offset+i]) mod 28)  otherwise
C[i] = (C[i-1] + step[i]) mod 29

P[i] = 28                                    if C[i] = C[i-1]
P[i] = (step[i] - 1 - K[offset+i]) mod 28     otherwise
```

The two inverse key signs are tested, with source tape mapped through `byte % 28`, `floor(28*byte/256)`, or `byte & 31` with values 28–31 discarded. The three source streams have lengths **64,167 / 64,167 / 56,184**. Reverse tape orientation and **every** full-length key offset remain admissible. This adds **582,612** exact source-key/decoder combinations independently of the full-GP29 additive model.

**Prior-art correction, crucial for interpretation:** The manuscript's **86** observed zero differences are superficially close to the Shakespeare GP-native reference's **1,633 EA in 217,106 runes** (0.752%). But the original positions are much more diagnostic than that marginal rate. The already established [all-29-symbol reserved-repeat obstruction](lp2-reserved-ea-repeat-transport-original-gate.md) and [EA terminal-word proof](lp2-ea-zero-terminal-word-invariant.md) show that this exact model forces **23 separate word-initial EA runes and 19 word-final EA runes**, including 18 length-three-or-longer printed words ending in EA. This is strongly incompatible with the first-party solved and source-native literary GP text independently of any key, tape offset, or decoder scoring. **The 28-wheel mechanism was effectively excluded before this historical Twitter scan**; its new 582,612-offset negative is confirmatory source-specific evidence only. It should not be credited as a novel cipher-family exclusion or revived on the basis of the close aggregate 86-to-EA count.

Freeze precisely the same two 350-rune training/holdout windows, GP-native Shakespeare likelihood and original source runes as for inverse A. All twelve 28-wheel top candidates and their untouched holdouts are:

| Byte→28 map | Direction | Inverse sign | Offsets | Best offset | First350 LLR | Holdout350 LLR |
|---|---|---:|---:|---:|---:|---:|
| modulo28 | forward | − | 51,212 | 36,432 | −161.944 | −274.858 |
| modulo28 | forward | + | 51,212 | 37,884 | −157.592 | −271.031 |
| modulo28 | reverse | − | 51,212 | 44,841 | −152.545 | −340.435 |
| modulo28 | reverse | + | 51,212 | 22,876 | −161.785 | −262.385 |
| scaled28 | forward | − | 51,212 | 4,829 | −146.879 | −290.702 |
| scaled28 | forward | + | 51,212 | 30,875 | −143.998 | −289.519 |
| scaled28 | reverse | − | 51,212 | 19,573 | −156.731 | −261.137 |
| scaled28 | reverse | + | 51,212 | 4,619 | **−135.239** | −262.532 |
| low5/discard28 | forward | − | 43,229 | 32,487 | −150.392 | −312.118 |
| low5/discard28 | forward | + | 43,229 | 20,367 | −152.585 | −309.028 |
| low5/discard28 | reverse | − | 43,229 | 20,123 | −143.002 | −319.790 |
| low5/discard28 | reverse | + | 43,229 | 6,705 | −153.118 | −259.221 |

As with inverse A, **zero of 582,612 tested alignments** achieves a first350 LLR above −100 or above zero. Every selected original holdout remains strongly negative. The source's anomalously low number of repeated runes is explained structurally by the *possible* 28-wheel design, but that rate cannot be used as an independent confirmation of the actual 2013 key: the zero steps are completely determined by the original ciphertext and the hypothetical EA labels.

The identical original-length planted control now encrypts **12,956 GP-native Shakespeare runes** using the **28-wheel source key at hidden offset761**, building an actual chained ciphertext and inverting each consecutive output. All **12,956/12,956** plaintext runes are recovered exactly. The blind 51,212-alignment offset search again ranks true offset **761** first at **+154.463**, versus the strongest false offset **−161.648**. The planted source has real EA symbols, so this exercises the literal zero-step branch rather than an all-nonzero toy cipher.

**Decision for inverse B:** retire this fixed EA-zero reading on the stronger, already existing **key-independent word-position obstruction**; this report records only the historical-Twitter transfer's additional negative and a correct 12,956-rune plant. If future first-party evidence changes the marker grammar or plaintext word boundaries, that is a distinct branch, not a retune of 28-wheel keys.

## Decision and scope

The complete 2013 Twitter byte archive supplies **no directly reusable contiguous key** for either (A) full GP29 additive chaining or (B) the explicit GP-EA-reserved, 28-nonzero-step chained wheel. Combined source-key sweeps happen to cover **1,172,972** alignments, but only inverse A addresses a source-transfer model not already excluded by prior key-independent word-position evidence. **No native-English GP signal** emerged in either sample. Do not present the size of these scans as a measure of progress. The creator would have to supply a *different* key derivation, a different ciphertext-feedback rule, an actual repeat-rejection/clock-skip rule, a distinct plaintext register or an additional layer. No extra candidate should be asserted on the basis of this experiment.

**Reproducer:** [read-only source-exact CommonJS SFT](../sims/lp2_2013_twitter_backchain_alloffset_sft.cjs) (Windows 11 / Node.js 22). It reconstructs 988 historical byte records with no gaps, recomputes GP29 Shakespeare calibration, enumerates both inverse families and all source offsets, asserts all 24 printed winning offsets and three-decimal scores, and blindly recovers both original-sized planted English ciphers. All numerical search results above were independently computed in an in-memory V8 runtime on the same repository originals before saving the SFT; the saved Node SFT has not yet been rerun in a standalone Node environment.
