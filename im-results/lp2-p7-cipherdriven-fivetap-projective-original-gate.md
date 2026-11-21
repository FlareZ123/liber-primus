# P7 five-product ciphertext-driven feedback: all-secret word-local projective inverse

**Agent18, 21 November 2026. Classification: exact algebraic original-cipher exclusion conditional on source-native English dictionary coverage.** None of the 56 unknown LP2 pages has been decrypted. This is an **entire family** of direct rune-wise GP29 decoders, tested without guessing the five initial state runes, any affine output key, a resetting constant, or the ciphertext feedback coefficient.

## Human-visible premise and decisive alternative

The original p7 (archive `24.jpg`) closes with five red words and five black dots. The five exact complete-word GP29 products in printed order are **[11,26,8,15,2]**. P8 opens with a Roman-looking red heading containing `XIX`; the independent five-product recurrence's characteristic matrix has exact order **1,876 = 28×67**, and **67** is the nineteenth GP prime. These are concrete source observations, with no first-party instruction actually selecting a linear recurrence. Earlier [p7 original study](lp2-p7-p8-roman-cuberoot-fivetap-original-gate.md) rejected its **autonomous** 1,876-period key generator but explicitly left open a key state updated with earlier ciphertext.

The present branch takes that surviving alternative literally. An even simpler competing explanation is that the five red-word numbers are a mnemonic clue or unrelated navigation values. This result evaluates a plausible historical feedback architecture and cannot prove that Cicada authored it.

## Full hidden-key model and algebraic elimination

For each complete original printed word of GP29 length n, let `C[i]` be the untouched ciphertext, `P[i]` its hypothetical source-native GP plaintext, and `K[i]` hidden key state. Work in GF(29), with source-fixed lag coefficients `w=[11,26,8,15,2]`. The entire admitted direct affine-output, prior-ciphertext-driven family is

```text
K[i] = 11*K[i-1] + 26*K[i-2] + 8*K[i-3]
      + 15*K[i-4] + 2*K[i-5] + q*C[i-1] + r  (mod29)
C[i] = a*P[i] + b + K[i]  (mod29),  a != 0.
```

Every `q,r,b∈0..28`, `a∈1..28`, and every possible five-symbol `K[0..4]` is allowed **independently for every original printed word**; any chapter/page/book continuous implementation is a special case on word interiors. The original word initials are entirely unrestricted except that they seed their own proposed hidden state. The model is losslessly decryptable from its key, preserved original ciphertext and secret parameters. No hidden clock or source-signaled reset is assumed; freely resetting *every word* deliberately strengthens the tested family.

Subtract the source-defined five-tap linear recurrence directly from each printed ciphertext word, for all interior positions `i>=5`, and subtract any candidate `q*C[i-1]`:

```text
R_C(i;q) = C[i] - SUM(j=1..5, w[j]*C[i-j]) - q*C[i-1]
R_P(i)   = P[i] - SUM(j=1..5, w[j]*P[i-j]).
```

The original cipher equations imply the **exact all-secret identity**

```text
R_C(i;q) = a*R_P(i) + beta,  beta=b*(1-SUM(w))+r.
```

Every unknown initial state has **cancelled**. For a word of length n, there are n−5 residual values. Subtract their first value from each subsequent residual; multiplication by the inverse of the first nonzero resulting value removes the completely unknown scalar a. If all differences vanish, preserve that degenerate case as its own distinct signature. The resulting **projective signature with n−6 coordinates** is necessarily identical for original ciphertext and genuine candidate plaintext **for at least one of the 29 possible q values**. This is an exact algebraic condition for the model's word-interior, not a language score or a probabilistic cipher heuristic.

A proposed plaintext word can therefore be rejected for **every** secret initial state, r, b, a and q before guessing any key, by at most 29 signature comparisons. Conversely, matching one word proves only compatibility with some family parameters, never a decoded plaintext or global key.

## Whole-original result, with no fitted language guesses

The unchanged manuscript yields **12,956 original runes, 2,896 complete printed words, 32 page-carried words**, from the canonical original-derived corpus and source-preserving word parser. The fixed external TextBlob English-frequency list contributes **8,563 words** whose source-native Cicada GP29 encoding has 9–14 runes, represented by **5,867 distinct per-length projective signatures**. The encoder is calibrated on known LP1 and solved p57 GP rune spellings including `ING` and `IO`. No dictionary word is inserted based on an original-cipher match.

Every original word of GP length >=9 is compared at **all 29 feedback values q**, with all affine keys eliminated analytically. Exact matched *cipherword × dictionary entry × q* counts are:

| Original printed GP rune length | Original word count | All-secret projective native-dictionary matches |
| ---: | ---: | ---: |
| 9 | 78 | **8,965** |
| 10 | 52 | **165** |
| 11 | 32 | **0** |
| 12 | 18 | **0** |
| 13 | 4 | **0** |
| 14 | 3 | **0** |
| **Total (9–14)** | **187** | **9,130** |

The many 9/10-rune matches are expected from their short residual signatures, independently chosen `q` and unrestricted per-word affine parameters. **No original word with 11 or more runes, out of 57 such words, matches a single candidate native-English long word under any allowed q.** This is a stringent *lexicon-conditional original-input impossibility* for the entire declared direct GP29 family, even after granting a totally independent secret key for every complete printed word. No isolated 9/10-rune dictionary hit is promoted to plaintext.

### Constructive positive controls

The independent source-native word `CIRCUMFERENCES` is encrypted under **30 distinct key choices**, comprising six feedback coefficients and five nonzero output multipliers; all have independently changing additive and recurrence constants and the source five-rune initial state. The exact ciphertext recurrence is genuinely executed, with no forced plaintext in its outputs. The original projective signature test recovers the underlying true word signature for every encrypted example, although it is given **none of their hidden key values except the q value being exhaustively considered**. Thus a genuine member of the tested cipher family passes this exact inverse; the negative original result is distinguishable from an implementation incapable of recognizing an encoded long English word.

## Cryptanalytic decision and boundaries

Retire the direct word-interior family `K[i]=Σ w*Kprev + q*C[i-1] + r, C[i]=a*P[i]+b+K[i]` as a decoder of ordinary source-native dictionary English, even with fresh per-word keys, page/chapter resets and unrestricted secret affine output scalars. This is a **substantive strengthening** of the earlier autonomous-period original-input exclusion: it excludes an entire ciphertext-dependent feedback update that that earlier work explicitly left unresolved. It applies equally to a single fixed hidden `q` and per-word changing `q`.

The lexicon is finite; a genuinely encrypted original written in an unexpected language, codewords or 57 specially coined long words would evade its dictionary test. A nonlinear key-state transition, a second encryption stage, plaintext-driven state, an altered original word segmentation, a different five-tap coefficient list, or variable-length transport is outside the theorem. There is no source-authenticated proof that the five products are key coefficients. Additional guessing over the same five initial states, linear ciphertext coefficient or affine output keys cannot rescue this direct model.

**Reproduce on untouched original sources:** [read-only Windows Node22/CommonJS SFT](../sims/lp2_p7_cipherdriven_projective_word_sft.cjs), using `lp2-corpus.json`, `lp2-transcription.txt`, `english_wordfreq_textblob.txt`, the source-native GP encoder and original word parser. [GitHub Actions manual original-input run](https://github.com/FlareZ123/liber-primus/actions/runs/44952793215). This note belongs to intermediate evidence; the established solution state in [results/README.md](../results/README.md) remains unsolved.
