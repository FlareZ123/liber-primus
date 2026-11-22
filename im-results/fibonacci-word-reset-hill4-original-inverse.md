# LP2 p15 Fibonacci-prime square as a word-reset 4×4 Hill cipher: source-fixed original inverse

**Classification:** original-source-derived cipher-family exclusion with exact reversible native-language control. No historical original LP2 plaintext or key found. Agent 14, 10 November 2026.

The manuscript's printed LP2 p15 **4×4** number square is a concrete, independently visible source for a field-29 Hill matrix. The existing [continuous four-rune-block study](../sims/fibonacci_square_hill4_gate.cjs) tested 128 naturally derived matrix settings on the full unsegmented original rune stream. It did **not** test resetting the 4-rune block frame at **every printed word**, or a reversible treatment for the unavoidable one-, two- or three-rune tails. The current original-input experiment closes that separate, creator-plausible interpretation without fitting an unknown matrix.

## Source-derived matrix families and invertible short blocks

The original printed p15 table, read row-major as a matrix, is

```text
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

Every cell is exactly `|3301 − p|`, where `p` is the explicitly indexed Fibonacci-position prime in [the existing source-frozen p15 test](../sims/fibonacci_square_hill4_gate.cjs). The four determinate 4×4 matrix families, reduced mod29, are the printed distances, the underlying primes, their one-based prime ordinal numbers, and the Fibonacci indices. Each family has eight D4 orientations (rotations/reflections). For each orientation the four operations `K`, `K⁻¹`, `Kᵀ`, `(K⁻¹)ᵀ` span the two conventional transform directions and row/column-vector reading. No key entries are optimized against the ciphertext.

Parsing the **same 2,896 original printed LP2 words / 12,956 rune positions** as the canonical parser, consider two ways to block a word: **left alignment** fills complete four-rune blocks from its left edge and leaves its 1–3-symbol residue on the right; **right alignment** places the residual short block on the left and fills complete blocks from there. For the residue, test two exactly reversible conventions:

1. **Identity residue:** pass the final short block unchanged, apply the selected 4×4 matrix only to full blocks.
2. **Principal-matrix residue:** use the `r×r` top-left minor of the selected 4×4 matrix on a residual block of size `r∈{1,2,3}`. A setting is eligible only when all needed residue minors are invertible. Decode with the original minor and re-encode using its *own inverse*, not the top-left slice of the inverse full 4×4 matrix.

Thus the exhaustive source-defined discrete family has **4 × 8 × 4 × 2 × 2 = 512** configurations. Exactly **16** have a singular short-block minor and are excluded as noninvertible under the stated principal-matrix model. The other **496** configurations all successfully decode and exactly re-encode the entire **12,956/12,956** original positions with no padding, dropped marker, inserted rune, or guessed IV. This demonstrates cryptographic invertibility; it alone is not evidence of a correct decoder.

## Source-independent language decision on original ciphertext

A frozen GP29 within-word bigram language model is trained exclusively on the checked-in [native-GP Shakespeare reference](../resources/control/shakespeare_first300k.txt), with 0.1 additive smoothing per successor symbol, before any LP2 scoring. Each candidate's mean log-probability per printed within-word bigram is evaluated on the original reconstructed plaintext candidate. The original GP29 index-of-coincidence (IoC) is measured separately, against native-source controls.

| Source/data | Word-internal GP29 bigram mean log probability | Whole-stream IoC |
| --- | ---: | ---: |
| Untransformed original LP2 ciphertext | **−6.3351092** | **0.0344784** |
| Best of all 496 word-reset source-matrix inverses | **−6.2636763** | 0.0344676 |
| Full range over all 496 original candidates | **−6.4510 to −6.2637** | **0.0344415–0.0345591** |
| Native-GP solved LP1 reference | **−2.3396149** | *not necessary for decision* |
| Native-GP Shakespeare word reference | **−2.2670617** | *not necessary for decision* |
| Native-GP Shakespeare, exactly original 2,896 word-length slots | **−2.2928870** | **0.0600097** |

The best original candidate is the **printed-distance** matrix, D4 orientation index **1** (horizontal reflection of the displayed matrix), direct `K`, right-aligned blocks, and identity tail. Its first twelve GP-transliterated words are **DXTEOPEONGW SUTHO IOLL FJOE ONTH NEWBCEATSTRH NATBOE UEABIA PBN EOJTH GOOH BDP**, with no coherent authenticated plaintext. Note that any setting passing several short blocks unchanged is potentially artificially favored by isolated raw plaintext-looking digrams, so the best score is **not** promoted as a decipherment.

## Independently planted exact recovery

Select exactly 2,896 source-native GP-English Shakespeare words matched to **each original LP2 word length** (total 12,956 GP runes), then encrypt them with the frozen printed-distance p15 matrix. Apply both alignment conventions and both reversible tail strategies. In **all four** whole-book source-native plants, the decoder independently recovers **12,956/12,956** original native runes exactly, with English bigram mean **−2.2928870**. The original corpus has no configuration close to that native-language regime.

The native ciphertext plant itself becomes near-uniform for the principal-minor tail (`IoC≈0.03506` for left alignment), demonstrating that this mechanism can hide most simple plaintext statistics while preserving recoverable English when the proper decoder is used. The identity-tail plants retain more plaintext-symbol bias (`IoC≈0.03895`), as expected.

## Decision and limitation

**This directly motivated, fully reversible source-family is a documented negative:** the p15 Fibonacci-prime 4×4 Hill operations, when reset at every literal original printed word with either natural alignment and either lossless leftover rule, do not recover ordinary GP-encoded English from the full original LP2.

The study does **not** exclude a different nonlinear transformation, a secret key matrix derived by an independently signaled operation from the square, cross-word 4-block mixing with state, a higher-rate representation, a different plaintext language, or a source-authenticated segmentation other than the printed word boundaries. The previously tested continuous 4-rune-block model remains distinct and independently negative. Do not expand this exact matrix family into unconstrained search of arbitrary 29⁴ or 29¹⁶ keys unless a new clue supplies those degrees of freedom.

**Exact reproducer:** [CommonJS single-file test](../sims/fibonacci_word_reset_hill4_inverse.cjs). The script imports the repository's canonical word parser and field29 matrix primitives, uses only checked-in source documents, reports all original configurations and four full-length synthetic plants, and runs through the existing manual CI selector `word-reset-hill4`. [**GitHub Actions run 42923779307: passed**](https://github.com/FlareZ123/liber-primus/actions/runs/42923779307). Existing workflow tasks remain gated off in this run.
