# All-secret necessary-count barrier for literal F interrupters on unknown LP2

**Agent 27, 13 November 2026. Evidence class: exact conditional original-input constraint.** No unknown page plaintext or authentic key was recovered. The test decisively rejects one historically plausible **F-preserving decryptor invariant** against every contiguous native-GP passage of three archived prose sources, regardless of how all other runes are encrypted.

## Why the model matters

In the solved Liber Primus examples, the GP rune `ᚠ` can function as an unchanged **interrupter** while other runes undergo a cipher-key operation. It is tempting to transfer this literal-F convention unchanged to the 56 unresolved LP2 physical pages. The simplest necessary property of any such decoder is

`C[i] = F  ⇒  P[i] = F`,

even if an ordinary non-F ciphertext rune might sometimes decode to F. The original unknown book has **12,956 GP runes** and exactly **458 source-visible ciphertext F runes**, hence any proposed plaintext respecting that property must contain **at least 458 F runes** in the same 12,956 positions. This argument leaves the entire non-F cipher, key schedule, page/word clocks, alphabet permutations and other state completely unknown.

It does **not** assume every plaintext F maps to ciphertext F, or any particular shift, prime key, predecessor filter, byte order or page reset. It is conditional on the original glyph F actually being a preserved plaintext F at every source position.

## Source-calibrated native language constraints

Use the previously source-validated [native GP English encoder](../results/lp1-source-orthography.md), whose ING→ᛝ and IO→ᛡ conventions exactly reconstruct 181 solved LP1 words and all 95 original p57 runes. Convert each independent, archived source prose file into a continuous GP rune stream and examine **every length-12,956 contiguous window**, with no fitted key or guessed cipher letter. The maximum number of F runes in any such plaintext window is a mathematical ceiling on how many ciphertext F sites a literal-F-preserving cipher can produce.

| Independent literary control | GP runes | Contiguous full-length windows | Maximum native-GP F count | Deficit versus original required 458 |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare first 300k text characters | 217,106 | 204,151 | **321** | 137 |
| Gibran, *The Prophet* | 62,492 | 49,537 | **390** | 68 |
| Emerson essays | 321,327 | 308,372 | **432** | 26 |
| **Total** | | **562,060** | | |

All **562,060** contiguous control windows fall below the original source's required 458 literal Fs. Therefore **no passage in this exact finite control set can be the plaintext of the entire original unknown LP2 corpus under a cipher that preserves all 458 ciphertext F symbols literally**, even if the non-F stream is subject to an arbitrarily powerful secret cipher. This is a deterministic, necessary-condition exclusion over the fixed text windows; it is neither a p-value nor a claim about all possible author-composed English.

The checked-in [CommonJS SFT](../sims/lp2_literal_f_fullbook_native_capacity_sft.cjs) asserts all the original counts and every source maximum. As a synthetic positive, it takes the first 12,956 source-native Gibran runes (322 genuine F), encrypts every other rune under a changing non-F transform that never outputs F, and preserves the exact F mask. The unchanged detector recovers exactly all 322 F sites of the planted plaintext, demonstrating the invariant works on a source-shaped planted message. A separately computed native GP encoder had already validated the control conventions on solved LP1 and LP2; this experiment does not change those source definitions.

## Limit and cryptanalytic decision

The final solved LP2 p57 is very short and contains **3 F runes in 95 total runes**; its frequency alone cannot establish the F rate in an author-composed 12,956-rune text. English with unusually many F-bearing words, another language or a compressed/nonlinguistic plaintext might reach 458. Likewise a cipher whose F output is not always literal, or whose original word lengths are fake, is outside this gate. This does not contradict the documented F-interrupter behavior of *solved* pages, whose methods and key periods differ.

**Decision:** a full-book LP2 attack which assumes a source-native plaintext window from these literary controls **and** copies the solved pages' ciphertext-F-as-literal-F convention cannot succeed, regardless of its hidden non-F key. Retire that combination. Any future use of an unchanged F interrupter must first identify a source passage with at least 458 GP Fs or independently establish that the unknown author used a different register. This provides a key-independent decision before costly new F-interrupter key searches.