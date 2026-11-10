# Authentic LP2 cipher clock across large-dot punctuation

**Evidence classification, 10 November 2026, Agent 22:** independently known historical plaintext and exact original-ciphertext forward/inverse test. This establishes a narrow, genuine operating rule for **solved LP2 physical page 56** (original JPEG `73.jpg`). **It does not decrypt any unknown pages or assert their cipher uses the same clock.**

## The source-specified choice

The complete original-page colour annotation records three large dot stencils on solved LP2 p56, counted at exact original rune offsets:

| Offset, immediately after that many runes | Dots | Visible role |
| ---: | ---: | --- |
| **5** | **13** | After red five-rune heading `AN END` |
| **45** | **10** | Before the page's non-runic SHA-512 hexadecimal digest |
| **85** | **13** | After the final encoded prose rune |

A [CicadaSolvers structural overview](https://www.cicadasolvers.com/wiki/liber-primus/liber-primus-structural-overview/) observes the numerical correspondence of large-dot stencil counts to ASCII controls `10 = LF`, `13 = CR`, and `23 = ETB`. This is an **interpretive analogy, not an established decoder rule**: the final 23-dot mark is actually on solved page 57 after the complete message. The printed marks definitely separate visual text features, but whether they alter a cryptographic key state is a distinct question.

The solved p56 cipher is independently known: for GP29 ciphertext rune `C_i`, subtract `prime_j − 1` modulo 29, starting `j=0`, except the single literal unencrypted `F` at **rune offset 56**, which does **not** consume a prime. In historic GP spelling the plaintext begins **`AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO`** and finishes **`IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE`**. It totals **85** original runes. The 128 hex digits of the displayed hash are outside that GP-rune count.

The two **internal** original dot events have a finite, source-fixed key-clock interpretation family:

- `pass`: punctuation is not a prime-consuming rune and leaves key index unchanged;
- `advance`: punctuation consumes one additional prime, as though it encodes one control symbol;
- `reset`: the next rune restarts from `prime_0 = 2`.

These are exactly **nine** distinct state rules for the page's two internal dot events. The terminal mark at rune index 85 cannot affect this page's plaintext.

## Complete original-input result

The [single runnable source-input test](../sims/lp2_punctuation_solved_clock_sft.cjs) reads the original 85 ciphertext rune indices and all three physically annotated marks. It constructs the independent known GP-encoded plaintext, uses the historically established F interrupter, and scores *every original rune* under each candidate clock. A separate import of the existing [authentic solved-page regression](../sims/solved_cipher_regression.cjs) checks the true known inverse independently of the competing clock implementation.

| After 13-dot at 5 | After 10-dot at 45 | Exact plaintext runes / 85 | In each interval [0,5), [5,45), [45,85) |
| --- | --- | ---: | --- |
| **pass** | **pass** | **85** | **5 / 40 / 40** |
| pass | advance | 46 | 5 / 40 / 1 |
| pass | reset | 48 | 5 / 40 / 3 |
| advance | pass | 6 | 5 / 0 / 1 |
| advance | advance | 6 | 5 / 0 / 1 |
| advance | reset | 8 | 5 / 0 / 3 |
| reset | pass | 6 | 5 / 0 / 1 |
| reset | advance | 6 | 5 / 0 / 1 |
| reset | reset | 8 | 5 / 0 / 3 |

All nine variants exactly reproduce the original ciphertext when **their own** decoded symbols are forward-reenciphered: bijectivity alone is not evidence of a correct clock. Only the one true historical no-event key-state mode decodes **all 85** externally known runes. In particular, advancing one prime at the hash-introducing 10-dot mark misdecodes 39 of the subsequent 40 runes, while restarting the stream there misdecodes 37.

**Result:** the authentic prime-totient cipher on solved LP2 p56 runs continuously **across both internal 13-dot and 10-dot marks**. Its key counter is based on **eligible GP runes**, with the known literal-F skip, and does not consume an extra step at either physical control stencil. The presence of a hexadecimal digest is not a key-state reset under this solved-page mechanism.

This is a useful restriction on any proposed **universal** punctuation-based reset/advance clock. An unknown LP2 cipher could explicitly use other state semantics; the remaining manuscript is still undeciphered. The ASCII-control analogy, on its own, cannot authorize overwriting or restarting a cipher register.

**Reproduction:** [`sims/lp2_punctuation_solved_clock_sft.cjs`](../sims/lp2_punctuation_solved_clock_sft.cjs) with Node.js 22; [successful manual-only GitHub Actions run 42884523947](https://github.com/FlareZ123/liber-primus/actions/runs/42884523947) via the existing [physical-line and page-turn workflow](../.github/workflows/physical-line-initial-crosspage-manual.yml), dispatch input `punctuation-clock`.
