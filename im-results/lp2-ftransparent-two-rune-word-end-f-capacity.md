# Original LP2 two-rune words: a new exact capacity under authentic plaintext-F bypass

**Agent 20, 13 November 2026. Classification:** original-source key-independent necessary-condition constraint with finite native-English controls. **No unknown plaintext or true LP2 mechanism recovered.** The constraint is explicitly conditional on the unsolved sections using the *historically authenticated plaintext-F bypass* and retaining their printed word boundaries.

## Source-first mechanism and positive example

The genuinely solved LP2 p56 uses a rule documented in [the corrected F account](lp2-literal-f-fullbook-native-capacity.md): a **plaintext F** (ᚠ, GP index0) is printed as **ciphertext F**, consuming no key. Ordinary non-F plaintext can encrypt to ciphertext F, so the converse is false. The actual solved p56 message has the two-rune plaintext word **OF**, located at original 85-rune plaintext offsets **55–56**. Its final plaintext F is preserved at exactly original ciphertext offset56. Applying the authentic prime-totient key with this bypass reproduces **all 85 original p56 ciphertext runes**. This source example selects a simple, testable consequence of the real historical cipher before choosing any unsolved secret key.

For any two-rune plaintext word \`p0 F\`, the matching two-rune original ciphertext word **must** have F as its last glyph, regardless of the value, length, distribution or source of every other key symbol. Thus a count of printed two-rune cipher words with final F is an **exact upper bound** on the count of two-rune plaintext words ending F. It specifically covers **OF** and **IF**, the ordinary-English exemplars, and other GP words ending with F. The same bound is valid with arbitrarily secret, adaptive or nonuniform keys provided the plaintext-F bypass and word segmentation are genuine.

## Unmodified source counts and finite language controls

Parse the 55 original rune-bearing unsolved LP2 segments as a continuous manuscript: original page and line wraps continue words; printed dash/period/punctuation terminate words. The canonical transcript yields **2,896 printed words / 12,956 rune symbols**. Exactly **448** complete printed words have length two. Only **10** of those have the exact form \`?ᚠ\` (final F), independent of any key.

Source-native GP spellings are pinned to the verified solved-Cicada convention: \`QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA\` followed by longest-match GP rune tokenization. The following source corpus rates and expectations are exact under the declared word-length-matched iid draw model; the exact upper bound 10 applies without that probabilistic assumption.

| Fixed English control | Native-GP 2-rune word tokens | End in plaintext F | Expected ending-F count over 448 slots | Exact binomial Pr(count≤10) |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare first 300k | 11,782 | 1,247 | **47.4161** | **9.24723×10⁻¹²** |
| Gibran, *The Prophet* | 3,674 | 600 | **73.1628** | **1.49862×10⁻²²** |
| Emerson essays | 21,041 | 3,573 | **76.0755** | **7.22421×10⁻²⁴** |

Each comparison conditions on having **exactly 448 two-rune words**, matching the original source class; it does not infer the unknown manuscript's global word-frequency distribution. The reference binomial calculations assume independent length-conditioned source-word draws with replacement, and corpus sampling/model selection prevents interpreting these tiny conditional numbers as global discoveries. Crucially, no guessed secret key can raise the original **10-slot** capacity under the stated authentic bypass rule. The absence of printed F at 438 two-rune word endings is an original source observation.

The genuine solved p56 control independently demonstrates the implication in the actual 2014 cipher: the actual single word OF is encoded preserving its final F at original rune offset56. The fully fixed 85-rune historic prime-totient cipher **re-encrypts exactly** in the SFT, while its other ciphertext Fs can arise from non-F plaintext. This avoids the incorrect, retracted inference \`ciphertext F ⇒ plaintext F\`.

## Meaning for decipherment

This is a direct, key-independent reason to **disfavor transferring the historical solved-page F-bypass to all unsolved LP2 pages while also assuming ordinary source-native English of the three reference registers and unchanged printed word boundaries**. The previous [whole-book F-count correction](lp2-literal-f-fullbook-native-capacity.md) remains true: the total 458 ciphertext Fs permit the overall native-English F counts. The **localized two-rune word-slot constraint** is new and far stronger than that total count.

This observation is compatible with a different unknown-page cipher that does not preserve F, with a hidden non-English or carefully F-avoiding plaintext register, or with word boundaries that differ from the printed ciphertext. It is **not** recovered plaintext, an authenticated fresh key, or a universal no-go for all English. An immediate substantive fork is to seek a mechanism that can account for the original short-word distribution without requiring 40–70 or more natural two-rune F-endings to remain visible. Do not rescue the transparent-F hypothesis merely by fitting another secret pad: the exact word-level capacity does not involve that pad.

[Single-file CommonJS reproducibility and original solved-page positive](../sims/lp2_ftransparent_twoletter_ending_f_capacity_sft.cjs). [Successful real GitHub Actions run 43529185189](https://github.com/FlareZ123/liber-primus/actions/runs/43529185189), after correcting the fact that the rune-free physical p50 is omitted from the original transcript segments.
