# LP2 shared physical-line-reset additive GP29 pad, held-out original gate

**18 November 2026, Agent38. Director Issue #1522. Classification: completed bounded original-cipher negative with a source-shaped planted positive, an untouched original holdout, and a solved-page incompatibility control.** No unknown LP2 plaintext or authentic key is recovered.

## Frozen family and human-visible clock

The exact original transcription contains 594 physical printed rune lines across the 55 rune-bearing unknown pages. Those lines flatten rune-for-rune to the canonical 12,956-rune ciphertext. The longest line has 26 runes.

Issue #1522 tests one deliberately simple reading of that visible layout:

`C[l,j] = P[l,j] + k[j] mod 29`

Every physical printed line starts the same shared additive GP29 pad at local rune offset zero. There is one unrestricted secret key symbol `k[j]` for each local line column `j=0..25`. The test has no per-line IV, phase scan, alternate direction, extra page or chapter reset, F bypass, transposition, or nonlinear state.

This line clock is separately motivated by the current source-constrained terminal route: finite historical `prime_echo` consumption reaches the original p55 line3/line4 boundary. The present experiment asks whether that visible unit is also the clock for a reusable value-changing additive layer.

## Exact source reconstruction

The SFT parses `resources/liber-primus/lp2-transcription.txt` by original physical newline and keeps canonical runes only. It asserts all of the following before fitting:

- 594 unknown physical rune lines;
- 12,956 total unknown runes;
- maximum line length 26;
- exact equality between the line-flattened sequence and `lp2-corpus.json`;
- exact page reconstruction with no line crossing a physical page boundary.

The predeclared split is the same independent split used for the adjacent page-reset test:

- **train A:** even physical pages p0-p38, 20 pages, 216 lines;
- **train B:** odd physical pages p1-p39, 20 pages, 228 lines;
- **untouched holdout:** all rune-bearing p40-p55, 15 pages, 150 lines, 3,316 runes.

The first 24 line columns are well supported in both training halves. Even column 23 has 36 A lines and 41 B lines. Columns 24 and 25 are sparse, with only 8/7 and 1/2 A/B observations respectively.

## Exact attack

The language objective is frozen before fitting. It is the same GP29 first-order model used in #1519, trained only from the 3,568 source-encodable runes in `resources/liber-primus/lp1-plaintext-reference.txt`, with unigram pseudocount 0.5 and bigram pseudocount 0.25.

For a shared line-reset additive key, the complete maximum-likelihood key under this fixed model is available by exact Viterbi dynamic programming with 29 key states per local line column. Training uses only within-line transitions, so the optimizer does not gain an artificial advantage from assuming that a line break is a plaintext boundary. Held-out scoring restores the original physical-page rune order and includes transitions across line wraps.

## Planted positive

A deterministic seed creates source-shaped plaintext in the exact original page and line geometry, then encrypts it with one random 26-symbol line-reset GP29 pad.

The exact attack recovers the strongly supported portion of the planted key perfectly:

- train A: **24/24** first key symbols;
- train B: **24/24**;
- A+B: **24/24**;
- independent A/B fitted-key agreement: **24/24**.

Across all 26 columns, the two fitted keys agree 25/26; the only instability is in the extremely sparse tail. The planted untouched holdout has native score **-2.565130926 nats/rune**, perplexity **13.00236**. Decoding with the recovered A+B key gives **-2.565609656 nats/rune**, perplexity **13.00859**.

A genuine solved control, clear p57, scores **-2.582917098 nats/rune**, perplexity **13.23569** under the same frozen language model.

The attack therefore has high power on the exact line-reset family.

## Original LP2 result

The two independently fitted original keys have:

- **0/20** agreement on the first 20 strongly supported columns;
- **0/26** agreement across the complete line key.

On the untouched p40-p55 holdout:

| Fitted key | Held-out nats/rune | Perplexity |
| --- | ---: | ---: |
| train A | **-4.277953797** | **72.09277** |
| train B | **-4.322565484** | **75.38177** |
| A+B | **-4.313876548** | **74.72962** |
| planted native | **-2.565130926** | **13.00236** |
| planted decoded | **-2.565609656** | **13.00859** |
| genuine solved p57 | **-2.582917098** | **13.23569** |

One hundred deterministic random wrong keys on the original holdout span **-4.373912996 to -4.263775911 nats/rune**, with median **-4.322013491**. All three fitted original keys lie inside this wrong-key band.

The first 150 p40 runes under the A+B fitted key are nonlinguistic GP transliteration and contain no coherent unknown plaintext.

## Independent solved-page incompatibility control

The same physical-line parser continues directly onto solved p56. Its 85 ciphertext runes occupy five lines of lengths **20, 19, 6, 22, 18**. The independently established p56 plaintext is:

`AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE`

For a shared additive line-reset pad, the implied quantity `C-P mod29` must be identical across all lines at every shared local column. There are 20 comparable p56 columns with at least two lines, and **0/20** satisfy that necessary condition.

This is expected because p56 has its separately established prime-totient/plaintext-F cipher. It also shows that a genuine Cicada solved page does not accidentally masquerade as the line-reset architecture.

## Decision

The exact #1522 family is rejected as a direct receiver for ordinary native GP29 plaintext. One shared additive GP29 pad restarted at physical printed-line rune offset zero does not produce a stable key across disjoint original training pages and does not transfer to untouched p40-p55 material above random wrong-key behavior.

This leaves the physical line clock available for genuinely different mechanisms. In particular, the result does not decide arbitrary per-column substitutions, stateful transforms, transpositions, or source-selected value streams that use the same visible line boundaries. Those require separate evidence and separate tests.

## Reproduction

The read-only Node22 CommonJS SFT is [`sims/lp2_shared_line_reset_additive_pad_sft.cjs`](../sims/lp2_shared_line_reset_additive_pad_sft.cjs).

Windows Node22 execution passed in [GitHub Actions run 44391407100](https://github.com/FlareZ123/liber-primus/actions/runs/44391407100). The job environment explicitly ran `sims/lp2_shared_line_reset_additive_pad_sft.cjs` and logged the exact figures above.
