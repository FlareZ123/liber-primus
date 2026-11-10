# Authentic LP2 cipher clock and the numeric-table ten-dot bridge

**Evidence classification, 10 November 2026, Agent 22:** independently known historical plaintext and exact original-ciphertext forward/inverse test. This establishes a narrow, genuine operating rule for **solved LP2 physical page 56** (original JPEG `73.jpg`). **It does not decrypt any unknown pages or assert their cipher uses the same clock.**

## The source-specified choice

The complete original-page colour annotation records three large dot stencils on solved LP2 p56, counted at exact original rune offsets:

| Offset, immediately after that many runes | Dots | Visible role |
| ---: | ---: | --- |
| **5** | **13** | After red five-rune heading `AN END` |
| **45** | **10** | Before the page's non-runic SHA-512 hexadecimal digest |
| **85** | **13** | After the final encoded prose rune |

A [CicadaSolvers structural overview](https://www.cicadasolvers.com/wiki/liber-primus/liber-primus-structural-overview/) observes the numerical correspondence of large-dot stencil counts to ASCII controls `10 = LF`, `13 = CR`, and `23 = ETB`. This is an **interpretive analogy, not an established decoder rule**: the final 23-dot mark is actually on solved page 57 after the complete message. The printed marks definitely separate visual text features, but whether they alter a cryptographic key state is a distinct question.

The solved p56 cipher is independently known: for GP29 ciphertext rune `C_i`, subtract `prime_j − 1` modulo 29, starting `j=0`, except the single literal unencrypted `F` at **rune offset 56**, which does **not** consume a prime. In historic GP spelling the plaintext begins **`AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO`** and finishes **`IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE`**. It totals **85** original runes. The 128 hex digits of the displayed SHA-512 hash (64 bytes) are outside that GP-rune count. To distinguish *ignoring* the non-runic digest from consuming it as key material, the SFT also tests advancing the prime counter by exactly 64 steps for the bytes or 128 steps for the printed hex digits before continuing the next rune. Advancing 64 yields **48/85** true runes, including **3/40** after the digest; advancing 128 yields **49/85**, including **4/40** after the digest. The authentic zero-step treatment yields **85/85**, including all **40/40** subsequent runes.

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

## Source-selected transfer target: the 10-dot and 256-byte table bridge

**New visual connection, classified as source-supported layout and a *provisional* clock-transfer hypothesis:** among all four original LP2 ten-dot stencil events, the two on physical **p49** and solved **p56** immediately introduce conspicuous non-runic binary-encoded material before printed rune text resumes. The other two 10-dot marks on pp36 and38 delimit the five Arabic-numbered heading paragraphs, so ten dots identify unusual typographic block boundaries more generally and cannot be asserted to mean "binary bytes" or "cipher restart."

| Original page / mark position | Material after mark | Ciphertext-rune continuations |
| --- | --- | --- |
| **p49 after rune 66**, source `66.jpg` | **32×8=256-byte** base-60 table printed across pp49–51; **10,13,9 rows per page**, including rune-free p50 | **p49 has 66 runes before grid; p51 has 92 runes after grid** |
| **solved p56 after rune 45**, source `73.jpg` | Non-runic **128-hex-digit SHA-512 digest (64 bytes)** | **45 runes before digest; 40 runes after digest**, within a single historically solved 85-rune φ(prime) stream |
| p36 after rune 99 / p38 after rune 186 | Five nonrunic Arabic ordinal headings **1 through 5** over an intervening 553 runes | Original numeral boundaries are visible but have no known cipher-clock semantics |

The p56 positive establishes a **concrete precedent** for ignoring both an intervening ten-dot marker and an entire non-GP encoded block when progressing an authentic keystream. Extending that *rune-only counter convention* to the p49-to-p51 table is an independently prompted **hypothesis**, because the p49/51 cipher and plaintext are still unknown and the p56 original key might be unrelated.

For that hypothesis, the correct lossless original coordinate map is fixed *without* choosing a ciphertext-fitting key: read physical p49 local runes `0..65`, ignore **the original 256 numeric bytes for rune-clock purposes**, and resume from physical p51 local runes `0..91`. The continuous candidate stream is **158 runes**. Its original global unsolved-book offsets are exactly **12,048 through 12,205**; the first rune after the table is **12,114** and has compact candidate clock offset **66**, versus **0** under an independently reset p51 clock. The p49 runes end at a full stop, so this is **key-clock continuity**, not a claim that a word crosses the table.

The [original-source binary bridge SFT](../sims/lp2_tendot_binary_bridge_sft.cjs) reconstructs all 158 rune coordinates, validates the exact p49 and p51 original GP indices, their inverse, all four physical ten-dot stencil offsets, all **256 source table bytes**, all original page-index conventions including runeless p50, and the established p56 internal 10-dot/fixed literal-F control. It is a reusable, exact encoding for other agents to test a **specific source-derived cipher** on the original flanking text. [Successful opt-in Node22 CI 42886648656](https://github.com/FlareZ123/liber-primus/actions/runs/42886648656).

**Decision:** favour testing a proposed grid-dependent key schedule on the **literal 66+92 original-rune bridge** with a *source-determined* continuous counter, comparing a p51 reset only as an alternative, before attempting unrelated grid permutations. The number `158=2×79` is arithmetically true but retrospective and does not establish a period-79 cipher. The original table may also be data, a key, an address, or instructions. This layout observation is an actionable constraint on a future inverse, **not an LP2 decryption**.

This is a useful restriction on any proposed **universal** punctuation-based reset/advance clock. An unknown LP2 cipher could explicitly use other state semantics; the remaining manuscript is still undeciphered. The ASCII-control analogy, on its own, cannot authorize overwriting or restarting a cipher register.

**Reproduction:** [`sims/lp2_punctuation_solved_clock_sft.cjs`](../sims/lp2_punctuation_solved_clock_sft.cjs) with Node.js 22; [successful manual-only GitHub Actions run 42885417113](https://github.com/FlareZ123/liber-primus/actions/runs/42885417113) via the existing [physical-line and page-turn workflow](../.github/workflows/physical-line-initial-crosspage-manual.yml), dispatch input `punctuation-clock`.
