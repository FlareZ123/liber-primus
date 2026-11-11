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

## Original 158-rune cipher transfer test: independent positive and conditional negatives

**Agent 10, 11 November 2026, decision-grade original-input test.** The historic solved-p56 prime-totient mechanism supplies a frozen concrete candidate: a prime counter starting at index zero, key value `K_j=(prime_j−1) mod29`, GP29 subtraction and only literal GP-F exceptions (both ciphertext and plaintext F at index 0, with no clock advance). Preserve all original p49 66 runes and p51 92 runes and their original global book coordinates **12,048–12,205**. Transfer exactly that same output law with these *a priori* clock alternatives at the ten-dot/256-byte table: **0** (solved-p56 precedent, table non-consuming), **10** (printed mark size), and **256** (one advance per printed byte). This is a test of a borrowed mechanism, not evidence the unsolved pages actually use it.

There are exactly **six** original GP-F ciphertext positions in the bridge, at compact indices `[3,33,69,123,126,157]`. Enumerating all 64 skip decisions gives a necessary *key-independent-of-language* feasibility gate: if an encrypted rune at a consuming step equals `K_j`, it would decode to GP-F even though a literal GP-F could only appear as ciphertext GP-F, contradicting the transferred original solved-page law.

| Frozen clock jump | Fewest incompatible output events | Fully legal F-skip masks / 64 | Best decoded Emerson-trained GP-trigram log-score, nats/rune |
| ---: | ---: | --- | ---: |
| **0** | **1** | None | Not applicable |
| **10** | **0** | 31, 63 | **−13.74019** |
| **256** | **0** | 19, 51 | **−13.34684** |

The zero-step candidate has a decisive exact contradiction at bridge index **102**, physical **p51 local offset36**, original GP ciphertext **E=18**. Its unique surviving prior counter is 99, with ordinary prime **541**, so `(541−1) mod29 = 18`: consuming it would output forbidden plaintext F while the actual ciphertext is E. This conclusion does not depend on an English scorer or on selecting an F skip mask.

The ten-dot and table-byte jumps survive this *necessary* gate but recover no readable original plaintext. Independent Gibran-native GP controls of equal length score **at least −8.42446** under a model trained on separate Emerson GP prose (324,630 runes); the best original survivor is only −13.34684 and its IoC is **0.03290** (native GP prose has substantially higher linguistic structure). A source-native planted English control in each candidate clock inverts exactly. This confirms the implementation, not historical correctness.

For calibration, granting **every possible 0–256 prime-index jump** while retaining the same original glyphs yields **51 of 257** jump sizes with at least one legal F-skip mask; thus the survivorship of 10 and 256 is not a unique key signature. This exhaustive comparison ranks alternative jumps **only as a specificity check**, without proposing their fitted values as clues or expanding the authentic source-based cipher family.

**Current decision:** Direct transfer of p56's exact *zero-step* prime-totient/F-exception mechanism is excluded by the p51 contradiction. The two plausible source-sized clock-advance variations satisfy the skip syntax but fail native-language discrimination, so none recovers the sought key, original plaintext, or table semantics. Any viable successor must introduce an independently visible way in which the original table affects the key, plaintext register, or state. The arithmetic `158=2×79` remains retrospective.

[Complete CommonJS original-source reproducer](../sims/lp2_tendot_prime_transfer_gate.cjs) · [successful manual Node 22 workflow run 42927687738](https://github.com/FlareZ123/liber-primus/actions/runs/42927687738) (dispatch `tendot-prime-transfer`).



## Two 10-dot intervals and a complementary 24-hour arithmetic (provisional)

The four standalone 10-dot marks occur in source order at physical p36:99, p38:186, p49:66 and p56:45. Their global post-rune offsets are **8,805, 9,358, 12,114 and 13,001**. Pairing them in source order gives two enclosed rune intervals:

| Mark pair | Rune interval | Base-60 decomposition |
| --- | ---: | ---: |
| p36 → p38 | **553** | **9×60 + 13 = 09:13** |
| p49 → p56 | **887** | **14×60 + 47 = 14:47** |

The two lengths sum exactly to **1,440 = 24×60**. Their hour parts sum to 23 and their minute parts to 60, so the pair reads as **09:13 + 14:47 = 24:00**. This is an exact source-coordinate arithmetic relation; reading rune counts as minute durations is a **hypothesis**, not an established cipher rule. It is notable that the p49/p56 pair brackets the route from the 256-byte base-60 table's preceding marker to the solved p56 hash-introduction marker, while the p36/p38 pair brackets the five numbered paragraphs.

The terminal p57 23-dot stencil is also structurally composite in the normalized source templates: its 5×5 pattern `.###. / ##### / ##### / ##### / #####` contains the 13-dot pattern `.#. / ### / ### / ### / ###` as a subset, with **ten additional cells** (the two top-row flanks and the two outer columns in the lower four rows). Consequently the complete punctuation census can be rewritten exactly as:

`31×13 + 4×10 + 23 = 32×13 + 5×10 = 466`.

This is consistent with the 31 internal 13-dot separators delimiting **32 fragments**, and the four internal 10-dot boundaries plus the terminal 10-cell extension closing **five macro-sections**. The resulting five source intervals are **[8,805, 553, 2,756, 887, 135]** runes. The 23-dot mark is at the end of p57 (global 13,136), so its 13-dot core is a terminal closure, not a new interior fragment. This dual-framing interpretation is source-supported geometry plus a structural hypothesis; it does not establish that the five macro-sections are cipher reset points.

### One fixed affine table-pad consequence tested

A minimal way to turn the two marked interval lengths into a direction over the 256-byte table is the affine traversal

`K[i] = grid[(553 + 887·i) mod 256]`.

Here `887 mod 256 = 119` and `gcd(119,256)=1`, so the rule visits every table byte exactly once before repeating. I tested this single source-fixed order as a period-256 additive GP29 pad under both natural byte mappings (`byte mod 29`, `floor(29·byte/256)`), both signs, and global-continuous or per-page key reset: **eight cases, no fitted key or parameter search**.

| Candidate | Rune IoC | English quadgram score (nats/quadgram) |
| --- | ---: | ---: |
| Original ciphertext | **0.03447840** | **−17.13158** |
| Highest-IoC affine case: scale29, page reset, subtract | **0.03452555** | **−17.26724** |
| Best-quadgram affine case: scale29, global, subtract | **0.03446244** | **−17.20931** |

The two candidate maxima are different configurations; neither is language-like, and both quadgram scores are worse than raw.

Across all eight candidates, IoC stays in **0.03445396–0.03452555**, effectively the random 29-symbol baseline **1/29 = 0.03448276**; quadgram scores range **−17.29012 to −17.20931**, all worse than the unmodified ciphertext. The most IoC-favourable case is still nonlinguistic, and the best quadgram case is worse than raw. Thus the obvious affine use of the two interval lengths as a 256-byte offset/stride pad is **negative**. This does not test a clock-driven fragment traversal, a nonlinear state, or any other use of the 24-hour relation.

**Reproducer:** [`sims/lp2_dual_10dot_24h_affine_pad_sft.cjs`](../sims/lp2_dual_10dot_24h_affine_pad_sft.cjs). The existing [base-60 stream study](./base60-seeded-stream.md) supplies independent planted-recovery controls for the underlying reversible byte-to-GP stream family.


This is a useful restriction on any proposed **universal** punctuation-based reset/advance clock. An unknown LP2 cipher could explicitly use other state semantics; the remaining manuscript is still undeciphered. The ASCII-control analogy, on its own, cannot authorize overwriting or restarting a cipher register. Likewise, the 09:13/14:47 complement is not an authenticated time-key: no traversal or state rule derived from it has yet recovered plaintext. The affine-pad negative excludes only the one direct 256-byte use tested above.

**Reproduction:** [`sims/lp2_punctuation_solved_clock_sft.cjs`](../sims/lp2_punctuation_solved_clock_sft.cjs) with Node.js 22; [successful manual-only GitHub Actions run 42885417113](https://github.com/FlareZ123/liber-primus/actions/runs/42885417113) via the existing [physical-line and page-turn workflow](../.github/workflows/physical-line-initial-crosspage-manual.yml), dispatch input `punctuation-clock`.
