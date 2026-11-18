# Original LP2: arbitrary wordwise progressive GP29 shifts cannot encode native-English long words

**Agent 1, 18 November 2026.** Exact original-cipher, vocabulary-conditional exclusion. No unknown Liber Primus plaintext, historical key or continuation recovered.

## Clue-motivated decision

Original LP2 has authentic printed word breaks, but its 29-symbol ciphertext is almost unigram-uniform. First-party solved LP1 and LP2 p56 use elementary modular shifts; the signed 2016 message explicitly draws attention to *words* and *numbers*. The previously completed [all-cut affine-per-word gate](lp2-anycut-affine-wordlength-original-gate.md) excluded **stationary** substitutions of entire long English words. A natural new possibility gives **each word its own progressive alphabet**, advancing the shift with each successive rune. Such within-word motion might evade the original stationary-affine obstruction without requiring an external one-time pad.

The independently testable, fully unknown-key family is

\[
C_{w,j}=P_{w,j}+a_w+j b_w\pmod{29},\qquad
a_w,b_w\in\{0,\ldots,28\}.
\]

Both intercept and slope are independently secret and arbitrary for **every** word. No trial key is inferred from the original ciphertext, and no rule for computing either is assumed. The plaintext register is the existing fixed TextBlob GP-native English vocabulary, with the source-calibrated GP digraph transliteration, QU→CW, V→U, K/Q→C, Z→S, ING→NG and IO→IA. The model retains source rune order and the original word-length multiset, though it grants **every possible new word boundary** below.

## A complete key-free inverse invariant

Taking successive first differences removes the unknown intercept. Taking a **second** difference removes the unknown slope as well:

\[
C_{j+2}-2C_{j+1}+C_j =
P_{j+2}-2P_{j+1}+P_j\pmod{29}.
\]

Thus a candidate word of length \(n\) is compatible with **some** of the \(29^2=841\) secret intercept/slope pairs if and only if its \((n-2)\)-symbol second-difference signature matches the signature of a native-English GP word of exactly that rune length. This condition is *necessary and sufficient* for that word's additive positional-affine mapping, including zero slope. It can be checked without testing any key or fitting language scores.

The unmodified original GP29 corpus supplies **12,956 runes and 2,896 complete printed words**, including all 32 word carries across original page boundaries. The reference is the same pinned, unaugmented 29,157-row TextBlob lexicon used in earlier repository controls. No reference word was added after seeing the original matches.

### Original printed words

| GP rune length | Original printed words | Compatible with at least one GP-native dictionary word under **any** slope/intercept |
| ---: | ---: | ---: |
| 4 | 513 | 488 |
| 5 | 317 | 39 |
| 6 | 256 | **1** |
| 7 | 216 | **0** |
| 8 | 156 | **0** |
| 9 | 78 | **0** |
| 10 | 52 | **0** |
| 11 | 32 | **0** |
| 12 | 18 | **0** |
| 13 | 4 | **0** |
| 14 | 3 | **0** |

The lone six-rune original printed match is p35, rune offset65. Its dictionary form is **REVOIR**, a coincidental conditional word fit unless another clue authenticates those two secret coefficients. The failure starts with **all 216 seven-rune original words**, so a paragraph cannot be repaired by choosing different progressive Caesar keys.

### Arbitrary resegmentation, all source start positions

To grant the cipher an even stronger escape, disregard *every printed word boundary*. For each length \(n\) scan **all** original contiguous \(12,956-n+1\) rune windows, including windows crossing physical pages or previously printed separators. Compare their fixed second-difference signatures against **all** existing GP-English lexicon words of that length.

| Rune length | Dictionary distinct signatures | All original starts checked | Compatible windows |
| ---: | ---: | ---: | ---: |
| 6 | 4,636 | 12,951 | **93** |
| 7 | 4,776 | 12,950 | **2** |
| 8 | 4,325 | 12,949 | **0** |
| 9 | 3,397 | 12,948 | **0** |
| 10 | 2,388 | 12,947 | **0** |
| 11 | 1,450 | 12,946 | **0** |
| 12 | 767 | 12,945 | **0** |
| 13 | 379 | 12,944 | **0** |
| 14 | 153 | 12,943 | **0** |

The two seven-rune all-cut matches start at full-stream zero-based offsets **527** and **12,141**; there are **no** eight-to-fourteen-rune matches anywhere in the entire original source. The zero is unsurprising for a nearly uniform ciphertext *without a planted English word*: under independent uniform GP29 source windows, the expected count of eight-rune matches against all 4,325 distinct signatures is only **0.094153**, and of nine-rune matches against 3,397 signatures is **0.002550**. These are simple marginal expectations, not significance claims or a fitted ciphertext null. The value of the result is the **exact mathematical incompatibility with an assumed native-English long-word plaintext family**, not statistical evidence that the author chose any particular encryption architecture. Original printed word lengths require **343 words of eight or more runes**, distributed over lengths 8–14. Consequently no resegmentation preserving those source word lengths can restore this native GP-English register under independently changing linear-in-word shifts. This is an all-secret mathematical obstruction, regardless of proposed slope keys, source word addresses, reset phases or title-derived intercepts.

## Positive, scope and next decipherment decision

A separate positive generated one true native-GP reference word at **each of all 2,896 original word lengths** and independently encrypted each under its own deterministic secret \(a_w,b_w\). The same signature oracle accepts every length-four-or-longer planted word, and the corresponding secret decoder recovers **all 12,956/12,956** genuine planted GP runes. This protects against a false exclusion caused by the invariant, word parsing or 29-way modular arithmetic. The [single-file Node22 CommonJS reproducer](../sims/lp2_word_progressive_affine_signature_sft.cjs) uses only the canonical corpus, full original transcription and pinned dictionary, and asserts the exact printed and all-cut counts.

**Decision:** retire GP-native English under wordwise progressive Caesar with a freely unknown *linear* word-position shift, even if original word boundaries are freely moved while retaining the original word-length multiset. This extends the previous stationary wordwise affine exclusion to a changing-within-word key. More complex within-word nonlinear states, altered word lengths, a ciphertext transposition or a different plaintext language remain possible, and would require an independent source-selected operator and a withheld plaintext prediction. No recovered manuscript text is claimed.
