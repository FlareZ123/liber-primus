# External 27×27 route: complete block-39 continuation gate

**Research class (10 November 2026):** executable original-input conditional exclusion of *uniquely predicted continuation*. It recovers **no authenticated unknown Liber Primus plaintext, key, cipher method, or destination**. The externally proposed route through block 38 is treated as a hypothesis, without accepting its English text as established.

## Question and frozen inputs

The public [27×27 source-node/totient proposal](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption) claims 115 GP runes in 38 selected blocks ending "GO, DO AS I ASK." Its reports 00–15 purport to predict properties of each next block. The next-text challenge is whether these rules identify a *specific new source, ciphertext placement, and plain reading* after the last published block, rather than merely accepting many analyst-selected matches.

The input is the [original 729-rune p0–p2 matrix](../resources/liber-primus/lp2-corpus.json) in row-major 27×27 layout. The published [block-38 walkthrough](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/blob/main/plaintext-i-found/38-i-ask.md) fixes the source `(11,13),(12,13),(13,13)`, original key values `(16,19,28)`, ciphertext cells `(5,17),(6,17),(7,17),(8,17)`, cipher values `(26,14,14,21)`, phase `p=0`, accumulated sum `S=32`, and outer-state `a=0`. These source coordinates and values are asserted against the original matrix in code before any continuation enumeration.

The independent [full Reports 00–15 original-input reproducer](../sims/external27_block39_complete_gate.cjs) implements the published arithmetic and geometry: Möbius and totient signatures, modulo-29 3-key subtraction with both physical source orientations and optional source-centre totient, cyclic phase, seven-threshold rule, exact source axis, centre/radius parity, nonmirror test, next-block direction and endpoint parity, exact ray offset, local ink-independent leftmost-mode condition, and all four squarefree-GCD constraints. No prospective English plaintext is used to select positions. The separately published Report 16, which demands complete dictionary words, is applied as an **after-enumeration language diagnostic**, not as a geometric selector.

## Complete successor prediction and enumeration

The published last block entails the following next-block profile:

| Rule or property | Computed next-block requirement |
| --- | --- |
| Derived 3-key signature, phase, sum | `(0,+1,0)`, `p=1`, `S=33` |
| Physical source | Horizontal, nonmirrored, even-row and even-column centre, even radius |
| Ciphertext axis | Diagonal, **leftmost first** |
| Ciphertext leftmost/start | Odd row, even column, and exactly on an eight-ray line from prior leftmost `(8,17)` |
| Ciphertext end | Odd row |
| Own leftmost-mode filter | Direct mode, allowing `μ(n90(L))∈{0,+1}` |
| Other restrictions | At least 2 runes per block, 4 squarefree-GCD tests |

Exhaustively enumerate the full grid without following any selected English words. Distinct source orientations count separately because the repeated numerical key changes order.

| Outcome | Original 729-rune matrix |
| --- | ---: |
| Compatible source-node derivations, up to orientation | **86** |
| Distinct compatible physical source nodes | **73** |
| Compatible oriented derived keys | **172** |
| Compatible diagonal ciphertext geometries of all allowed lengths | **132** |
| Complete source/key/cipher continuations surviving all four GCD checks | **21,818** |

This is an exact count under the specified published rules, not a success probability. The key and location remain **dramatically underdetermined** at the next step. As an input crosscheck, the prior source-only enumeration by Agent 13 independently found 172 directed source choices before the complete prospective cipher gate; the count is consistent.

## Original-language diagnostic and conditional control

Freeze a modest, independently sourced English vocabulary using `resources/control/shakespeare_first300k.txt`: map each word into the canonical 29-rune GP alphabet, retain GP words of length at least 2 appearing at least three times, and add the one-rune words I and A. The resulting dictionary has **1,882** encoded words. For each original-input continuation, test whether **every decrypted rune** can be partitioned into complete vocabulary words, for candidate spans of **at least seven runes**. Smaller blocks are deliberately excluded from this particular diagnostic because many short words arise by chance. Dynamic programming selects a maximal-frequency segmentation; it does not alter ciphertext, source, or key candidates.

**Observed:** one of the 21,818 candidates is fully segmented at seven runes; **none** is segmented at nine or more. The sole seven-rune candidate is `ME TIS NO` (with "TIS" taken literally from Shakespeare's archaic register). Its configuration has original source centre `(26,18)`, radius 6, original source indices `(10,6,25)`, centre totient enabled, forward source orientation, next ciphertext `(17,8)` through `(11,14)` on an up-right diagonal. The reading has no compelling connection to the claimed preceding "GO, DO AS I ASK."

For a conditional null, **hold all seven physical block-38 source and ciphertext cells fixed**, independently shuffle the other **722** grid runes without changing their multiset, and rerun *the entire source and ciphertext enumeration and the same fixed dictionary* for each of **100** deterministic permuted grids, seed `0x35002739`. This conditions the control on the last reported block being exactly as described.

| Language measurement | Original | 100 frozen-previous-block shuffles |
| --- | ---: | ---: |
| At least seven-rune complete-vocabulary candidate count | **1** | Mean **0.65**, range **0–4** |
| Shuffles with at least as many as original | | **43/100** |
| Empirical upper-tail, plus one | | **44/101 = 0.43564** |

Thus the one long, word-segmentable candidate is **not** exceptional under this conditioned null. Nor do the route rules imply a unique next plaintext or source key. A route that intentionally terminates at block 38, a legitimate next word missing from the small Shakespeare vocabulary, non-English plaintext, or an additional predeclared continuation criterion remain outside this exclusion.

**Crucial inferential distinction:** this is a powerful test of the published continuation framework's *predictive specificity*, not a refutation of every 27×27 route or of any independent unsolved manuscript cipher. Re-encrypting any of these candidates with its selected three-rune key trivially reproduces its chosen original ciphertext, so such a round trip does not authenticate the source selection. The model's selection rules and dictionary were published or frozen before the candidate scan; the prior 38-block route was itself selected retrospectively from the manuscript, so null tail values are conditional rather than overall discovery significance.

## Reproduce and next research decision

Run `node sims/external27_block39_complete_gate.cjs 100` using Node.js 22. The program asserts every physical input and core enumeration count, prints all input, forecast, lexicon, original source/cipher candidates, and the full 100 null counts. [Successful original-source Windows Actions job 42807113300](https://github.com/FlareZ123/liber-primus/actions/runs/42807113300) executed this exact audit in ~25 seconds. No proprietary packages, unexplained coordinate edits, or external network access are required at runtime.

Meaningful subsequent work requires a **new independently justified selector** for the next source key, origin/direction/length, or a recovered continuation artifact. Adding more word-score tuning to these 21,818 choices will not establish plaintext. A convincing expansion would freeze the additional selector *before examining new decrypted text*, report the remaining candidate count, decode original hidden material, and predict material not used to design the rule.
