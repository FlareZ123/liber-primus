# P57 SHED, p50 graph, and a 76-to-180 terminal inverse: exact original-input decision

**22 November 2026, Agent 2. Classification: source-constrained bounded negative. No recovered unknown-page plaintext, authentic key or independently selected cipher operation.**

## Human-visible premise and frozen receiver

The genuinely solved LP2 p57 says **“WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE.”** Physical p49–51 print the 32-row, 8-column base60 table; its strict rectangular interior has 30×6 = **180** cells and its one-cell perimeter has **76**. The two already-known terminal pages contribute **85 original p56 plaintext runes plus 95 clear p57 runes = 180**, while the immediately preceding encrypted p55 has **76** original runes. This uniquely suggests the affordable experiment: treat the 256 printed numbers as zero-based **successor pointers**, place solved p56 plaintext followed by p57 plaintext into the interior in row-major order, and walk each perimeter cell along its successors to the first interior cell. Read the resulting 76 GP29 symbols as a prospective p55 message or one-use key.

This is motivated by the printed geometry and p57’s vocabulary. Its weakest assumptions are that the intended operations are successor links and first-interior termination, that the rim is read clockwise from the upper-left, and that the clear terminal runes are placed row-major rather than by the author's unknown receiver.

## Exact original controls and result

The reproducer reads the committed `resources/liber-primus/base60-grid.json`, `lp2-corpus.json`, and `lp1-plaintext-reference.txt`. It reconstructs the 85-GP plaintext of p56 by excluding the literal 128-hex hash field, and verifies the real p56 cipher **85/85** under successive `prime−1` addition with transparent plaintext-F skips (84 consumed primes). The 95-GP clear p57 text matches all 95 original rune indices.

All **76 perimeter cells** reach the interior within **one to four** p50 successor hops. Their first-interior destinations number **49 distinct cells**, and the hop-depth distribution is **53 at one, 16 at two, six at three, one at four**.

The exact 76-rune direct readout, here romanized using the source GP29 digraph conventions, is:

```text
RTHTHURNBYISCNDTGOOSECSFCWTHWTHTHTHYBDTHEWTHMRTWRHIETHTHAEITTTRFNATHTHANFISPIFTRPWRTSUEI
```

Its IoC is **0.06210526**, which merely reflects sampling repeated symbols from genuine solved English at 49 targets. It is **not intelligible text** and agrees with the original p55 ciphertext at only **8/76** locations. A high IoC in this construction is not independent evidence of a recovered message.

Using this readout as a p55 one-use additive key, and separately using the rune’s indexed GP value, assigned prime modulo29, or prime totient modulo29 with **each sign**, yields six full 76-rune candidate outputs. Their IoCs are **0.03649–0.04316** against original p55 ciphertext **0.03789474**. None yields coherent GP29 plaintext. The same fixed perimeter order is used for all six tests; no dictionary fitting or phase optimization is performed.

## Stronger all-secret test of a local graph instruction

A graph-following reversible cipher might be much less simple than direct key transfer. To test a genuinely broader **necessary condition**, grant the creator an **arbitrary secret deterministic 29-symbol unary function** `f`, without fixing its substitution table, and demand on every known strict-interior edge:

```text
label(cell) = f(label(successor(cell)))
```

Of 180 interior cells, **130** have their successor also inside. The function exists only if every occurrence of an identical input rune has the same output rune. Optimize the unknown function freely by taking the most frequent output per input class, which gives the exact minimum possible error count.

| Known 180-symbol register | Secret unary `f`, mandatory errors /130 | Allow separate secret `f` per row parity | Allow separate secret `f` per column parity | Best nonzero affine `f(x)=ax+b mod29` |
| --- | ---: | ---: | ---: | ---: |
| Real encrypted p56, clear p57 | **92** | **80** | **76** | **12/130 matches** |
| Authentic plaintext p56, clear p57 | **91** | **84** | **78** | **14/130 matches** |

For the genuine plaintext register there are **22 input classes** but **20 conflicting classes** even when every secret output is independently chosen. These figures are exact lower bounds, independent of the permutation of GP29 labels or the choice of a key phrase for `f`. An original-graph **positive encrypted plant** using `f(x)=1−x mod29`, with alternating labels on its 2-cycle and fixed label on its 11-cycle, satisfies **all 256 graph edges** and returns **zero** forced mismatches. The test therefore detects a real secret unary emitter when one is present.

This exclusion concerns a **single fixed unary function**, and the tested row/column parity variants. It leaves dependence on additional state, symbol position, multiple inputs, a non-GP intermediate register, the original table as key material rather than a graph, or another author-selected traversal open.

## Null calibration and decision

A separate seeded 50,000-trial control shuffled the **unchanged multiset of 256 original table bytes** among the original 256 cells and repeated the same perimeter first-interior analysis. An exact full **76/76 interior reach** occurred in **35,767/50,000 = 71.534%** of controls; the conjunction with at most 49 distinct landing cells occurred in **26,382/50,000 = 52.764%**. Thus total reachability and 49 destinations are ordinary properties of similarly shaped random functional graphs, not meaningful evidence of a special cipher path. These exploratory controls use a 32-bit xorshift generator seeded `0x33013301`, Fisher-Yates permutation, and the unchanged 32×8 boundary.

**Decision:** Retire the frozen p57 SHED → p50 successor → first-interior → p55 direct message/additive key and stationary/row- or column-parity unary graph cipher. Do not expand it into arbitrary state machines on the strength of this null-compatible geometry. Continue only if an independent original clue supplies a missing state update, terminal address, or a ciphertext-derived actual plaintext.

**Reproduction:** [Windows Node22 SFT](../sims/lp2_terminal_p50_successor_inner180_sft.cjs) · [Passing CI run 44992925551](https://github.com/FlareZ123/liber-primus/actions/runs/44992925551). The earlier [failed run 44992808841](https://github.com/FlareZ123/liber-primus/actions/runs/44992808841) was a Windows CRLF section-split bug, fixed before the passing run; it produced no research result.
