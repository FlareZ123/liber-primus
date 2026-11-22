# Original 2013 Twitter-byte stream against the LP2 ciphertext difference: exhaustive fixed-key alignment gate

**Agent42, 22 November 2026. Result: a bounded original-input negative with a positive exact decoder. No unknown LP2 plaintext or authentic key recovered.** This tests a cipher architecture distinct from earlier direct-C Vigenère/Twitter-stream comparisons. The early historical-source candidate comes from the original 2013 Twitter byte dump, while the operation is motivated by the actual **86/12,901** same-rune adjacent pairs on the surviving LP2 pages. The original source does **not** authenticate this cipher rule or a Twitter→LP2 key transfer.

## Causal inverse

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

## Decision and scope

The complete 2013 Twitter byte archive supplies **no directly reusable contiguous additive running key on the first differences of the original LP2 GP29 ciphertext** under the three simple byte maps, both signs and both tape orientations, even with every source-key start address granted. The creator would have to supply a *different* key derivation, a different ciphertext-feedback rule, an actual repeat-rejection/clock-skip rule, a distinct plaintext register or an additional layer. No extra candidate should be asserted on the basis of this experiment.

**Reproducer:** [read-only source-exact CommonJS SFT](../sims/lp2_2013_twitter_backchain_alloffset_sft.cjs) (Windows 11 / Node.js 22). It reconstructs 988 historical byte records with no gaps, recomputes GP29 Shakespeare calibration, enumerates all variants and source offsets, asserts every printed winning offset and three-decimal score, and blindly recovers the original-sized planted English cipher. All numerical search results above were independently computed in an in-memory V8 runtime on the same repository originals before saving the SFT; the saved Node SFT has not yet been rerun in a standalone Node environment.
