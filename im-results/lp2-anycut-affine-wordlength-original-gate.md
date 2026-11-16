# All-cut original ciphertext excludes affine-encrypted native GP words of length 8–14

**Agent10, 16 November 2026; Director [#1208](https://github.com/FlareZ123/liber-primus/issues/1208).** An original-input, exact key-independent necessity test. It recovers **no** unknown plaintext, authenticated key, or source-chosen decoding mechanism.

## Why this matters for the intended solve path

The original manuscript strongly resembles natural word-length segmentation, while its 83 one-rune tokens use 28 of 29 GP glyphs. The first-party 2016 hint names the manuscript's *words* and their *numbers*. A human might therefore consider changing the positions of visible word breaks and rekeying each resulting word with a simple numerical GP29 transform. The previous all-key Caesar gate applied only to the source's **existing** printed words; Director #1208 allows an unknown, possibly context-dependent new segmentation. This result removes the requirement to know **any** of the new word breaks or any per-word affine keys.

Assume the unchanged 12,956 GP29 ciphertext runes retain their source order. Candidate plaintext words can begin and end at **any** inter-rune cut, including cuts that cross printed hyphens, punctuation or physical page seams. For each new word, grant an independent arbitrary secret affine map
`C_j = a_w P_j + b_w (mod 29)`, with `a_w = 1..28` and `b_w = 0..28`: all 812 choices are allowed at every word. Their key schedule can be arbitrary. Only the reconstructed word-length **multiset** is assumed to remain the manuscript's original printed multiset; it need not preserve their printed sequence.

The independent plaintext register is exactly the repository's previously pinned 29,088-entry TextBlob GP-English vocabulary with its existing GP normalization (`QU→CW`, `V→U`, `K/Q→C`, `Z→S`, GP digraphs). This is a **conditional native-English gate**, with no claim about the unknown original language, abbreviations, alternate spellings or true author intent.

## Complete all-key signature

For a word `x=(x_0,...,x_{n-1})`, take the first `j>0` with `x_j != x_0`, then map every position to `(x_i-x_0)/(x_j-x_0) (mod 29)`. A constant word has its own separate invariant. Since 29 is prime, multiplication and addition by an unknown invertible affine key leave this signature **exactly invariant**. Conversely, two words with the same signature are related by an affine key. Thus checking dictionary signatures exhausts every secret `(a_w,b_w)`, without key search or language-score tuning.

Construct this signature for the fixed vocabulary and scan **every possible consecutive n-rune window** of the complete original p0–55 ciphertext. This is a strict superset of all possible word positions under any resegmentation preserving ciphertext order.

| Window length n | Distinct reference affine patterns | Original windows checked | Original windows matching one |
| ---: | ---: | ---: | ---: |
| 5 | 3,332 | 12,952 | 1,649 |
| 6 | 4,593 | 12,951 | 73 |
| 7 | 4,745 | 12,950 | 4 |
| 8 | 4,318 | 12,949 | **0** |
| 9 | 3,417 | 12,948 | **0** |
| 10 | 2,416 | 12,947 | **0** |
| 11 | 1,488 | 12,946 | **0** |
| 12 | 783 | 12,945 | **0** |
| 13 | 404 | 12,944 | **0** |
| 14 | 160 | 12,943 | **0** |

The original printed length multiset contains **156 length-eight words**, 78 length-nine, 52 length-ten, 32 length-eleven, 18 length-twelve, four length-thirteen and three length-fourteen. Any candidate reconstructed segmentation with that multiset must contain those lengths. No such segment can be an affine image of **any** word in the fixed reference dictionary, regardless of its start offset. Thus **all** length-multiset-preserving GP29 affine-per-word encoders are incompatible with reference-register plaintext, even after granting freely reordered lengths, completely unknown boundary positions and 812 independent keys per word. A stronger or source-authenticated general mechanism may change original rune order, use evolving state within words, alter plaintext lengths, or use a different language register.

## Positive, alternative and limits

The standalone test constructs a separate **12,956-rune / 2,896-word GP-native positive** from independent reference words at every original source word length, reorders the entire source length multiset by the bijection `i→17i mod 2896`, and encrypts each word under a different known nonzero GF29 multiplier and offset. It recovers **12,956/12,956** exact plaintext runes and passes the same affine signature oracle on **2,896/2,896** word tokens. The source's authentic rune tape and original word count/lengths are separately asserted against the untouched transcription.

A control relaxing the entire affine family to independent **arbitrary 29! secret rune permutations** finds many matching equality patterns on original 8–14 windows (including **32** length-fourteen possibilities). That stronger nonlinear family is **not** excluded by this test. Such equality-pattern matches do not recover words; they permit enormous unconstrained secret alphabets, and no original clue currently supplies the required secret permutations or their word-boundary state. A rune-level permutation/transposition or an English vocabulary outside the pinned register likewise escapes this gate.

## Research decision

**Retire any further affine per-reconstructed-word key derivation under the source's original word-length multiset and fixed GP-English register.** There is no value in trying more page primes, chapter phases, additive/multiplicative combinations or inferred word-cut movements inside that family: the obstruction is present at *all* possible substring starts before keys are chosen. For #1208, a credible next decoder must supply an independently motivated **within-word-changing operation, altered transmitted length profile, rune transposition, or explicit nonlinear/variable-length state map**, then recover a long contiguous original plaintext passage under blind holdout and exact forward encryption.

[Self-contained source-locked Node22 CJS reproducer](../sims/lp2_anycut_affine_wordlength_original_sft.cjs). Inputs: original `resources/liber-primus/lp2-corpus.json`, `lp2-transcription.txt`, and unchanged pinned `resources/control/english_wordfreq_textblob.txt`. No optimization on original ciphertext and no hidden key. This is an exact finite-vocabulary family exclusion, not an LP2 decipherment.
