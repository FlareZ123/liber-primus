# Original-LP2 all-secret word-scalar step cipher: a complete native-word obstruction

**Agent8, 22 November 2026. Original source: all 12,956 unknown physical-page runes and all 2,896 complete printed words. No recovered plaintext or authenticated decryption.** This is a new key-independent test of the specific *ciphertext-step multiplicative* architecture, distinct from direct per-word substitution and word-polynomial shift exclusions. The exact program is [`lp2_wordscalar_delta_nativelexicon_original_sft.cjs`](../sims/lp2_wordscalar_delta_nativelexicon_original_sft.cjs).

## Proposed original-source solve path

One widely repeatable original constraint is only **86 adjacent equal runes** in 12,956 unknown LP2 runes, alongside nearly uniform marginal GP29 frequencies. The authentic Gematria Primus alphabet has 29 ordered symbols. Its last symbol, **EA**, has zero value under one-based ordinal reduction modulo29. A cumulative multiplicative step cipher naturally produces a repeated ciphertext rune precisely when its plaintext value is EA:

```text
k_word ∈ {1,...,28} (arbitrary independent secret for each word)
q(P_i) = (GP0(P_i) + 1) mod 29

C_i = C_prev + k_word * q(P_i)  (mod 29)
```

The **2016 Cicada-signed emphasis on words and numbers** makes per-word key selection a conceivable human starting point, although no first-party instruction states this equation or the key source. To avoid a fitted-key experiment, grant the attacker **all 28^2896 choices** of independent nonzero keys across the original words. Two complete boundary interpretations are frozen: continue previous ciphertext over real word/page boundaries, or reset `C_prev=0` at every complete printed word. Every original cross-page word remains one word. No rune or punctuation is discarded.

## Exact all-secret key elimination

Let `D_i=(C_i−C_prev) mod29` be the ciphertext step within a word, under the chosen predecessor convention. For the hypothesized word cipher `D_i=k_word*q(P_i)`. Normalize any vector `v` by multiplying all entries by the inverse of its **first nonzero entry** in GF29, retaining zero entries. Denote the result `S(v)`. Because `k_word` is a nonzero field element,

```text
S(D_word) = S(q(P_word))
```

holds **for every possible secret word key**. A native candidate that disagrees with the ciphertext's normalized signature is mathematically impossible under this cipher. The only assertion about language is that native plaintext words should be recoverable from a specified contemporary-style English dictionary. This is an exact key-independent dictionary membership test, not a stochastic ciphertext score or an adaptive key search.

The pinned TextBlob English spelling-frequency lexicon `resources/control/english_wordfreq_textblob.txt` has **23,940** words encodable under the standard GP29 native multigraph priorities `ING,TH,NG,EO,OE,AE,IA,EA`, mapping ING to GP NG. For each candidate, the SFT computes `S(GP0+1)` and indexes it by **rune word length**. For each original LP2 printed word, it tests whether **any** native word of the exact same GP length shares the normalized ciphertext step signature, independent of its unknown key.

## All-original results and an independent genuine-English positive control

| Exact original runic word length | Words | Any compatible native dictionary word, continuous predecessor | Any compatible native dictionary word, word-reset |
| ---: | ---: | ---: | ---: |
| 1 | 83 | 83 | 82 |
| 2 | 448 | 448 | 448 |
| 3 | 720 | 404 | 383 |
| 4 | 513 | 38 | 39 |
| **5** | **317** | **0** | **2** |
| **6** | **256** | **0** | **0** |
| **7** | **216** | **0** | **0** |
| **8** | **156** | **0** | **0** |
| **9–14** | **187** | **0** | **0** |
| **All 5+** | **1,132** | **0** | **2** |

A potential small-word match is expected by chance because many short GP vectors share the same one-scalar equivalence class; **none** of the **815 original 6-or-longer-rune words** matches even a single native word under either fixed predecessor rule. In particular, **all** native 6+-rune plaintext dictionaries using this standard GP spelling fail, regardless of the 2,896 hidden nonzero scalar keys.

**Independent native corpus control:** Run the same native GP tokenizer on the actual pre-2014 Kahlil Gibran *The Prophet* text in `resources/control/gibran_prophet_58585.txt`. Among its **4,120 genuine 5+-rune words**, **3,896** have an exact native signature found in the same pinned dictionary. The remaining native 224 illustrate the lexicon's genuine coverage limit. This native control is not used to choose ciphertext keys or tune anything.

**Original-length planted positive:** take source-native Gibran dictionary words of exactly the original 2,896 LP2 printed word lengths, including every original long word. Encode the real GP-native words with independently changing secret nonzero per-word scalar keys, preserving 12,956 symbols and original word boundaries. All **1,132/1,132** native 5+-rune words remain discoverable by the all-secret ciphertext signature after encryption, and every rune reverses under its private planted key. The positive demonstrably detects the modeled mechanism at full-original size.

## What this decides and what it cannot exclude

The 29-ary ciphertext-step / nonzero **word-static scalar** cipher cannot plausibly explain intact LP2 as ordinary GP-native English under either of the two natural original-word predecessor semantics. The apparent 86 EA-compatible zero steps alone are insufficient to rescue it: the remaining words reject the hypothesis even after allowing an arbitrary secret scalar per word. The test is stronger than trying particular GP-prime key generators or table residues, because it eliminates all possible per-word scalars simultaneously.

This does **not** prove the unenciphered manuscript is English, that the printed word boundaries equal plaintext boundaries, that this dictionary contains every possible name or language, or that the intended cipher lacks **within-word evolving keys, position-dependent multipliers, non-GP coding, resegmentation, nonlinear state, escapes, or a supplied one-time pad**. These are materially different architectures. A complete original plaintext/key remains unknown. Consequently any future revival of the one-based multiplicative-step idea should require an independently sourced, **within-word-changing** key schedule with an actual untouched plaintext prediction; exhaustive per-word scalar fitting adds nothing.

[Single-file CommonJS reproduction and positive plants](../sims/lp2_wordscalar_delta_nativelexicon_original_sft.cjs) · [Original rune dataset](../resources/lp2-transcription.txt) · [Native English dictionary](../resources/control/english_wordfreq_textblob.txt) · [Independent 2014-era prose positive](../resources/control/gibran_prophet_58585.txt).
