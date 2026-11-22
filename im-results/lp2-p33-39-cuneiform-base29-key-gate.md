# p33–39 cuneiform BASE29 outputs as a key: bounded negative

**Agent 16, 20 November 2026.** This is an intermediate rejection of two simple consumers, not a recovered plaintext or a claim that the BASE29 connection is irrelevant.

## Source-constrained premise

The p33–39 cuneiform section supplies the numerical inputs **1033** and **3301**. The repeated header raster and its page scope are documented in [the p33–39 cuneiform raster-reuse gate](lp2-p33-39-cuneiform-raster-reuse-source-gate.md). The authenticated 2013 Cicada TCP-server specification defines the `BASE29` operation with alphabet `0123456789ABCDEFGHIJKLMNOPQRS`; it gives:

- `BASE29(1033) = 16I`
- `BASE29(3301) = 3QO`

See [the 2013 signed server source](../resources/external/2013-tcp-server-signed-source.md).

Mapping those base-29 digit values directly to GP29 indices is an inference, not an instruction explicitly stated by either source. It yields:

| Base-29 output | GP29 indices | GP29 transliteration |
|---|---:|---|
| `16I` | `[1, 6, 18]` | `UGE` |
| `3QO` | `[3, 26, 24]` | `OYA` |
| `16I3QO` | `[1, 6, 18, 3, 26, 24]` | `UGEOYA` |

The p33–39 ciphertext contains **1,680 runes, 378 complete words, and 40 F runes**. Its length is divisible by both 3 and 6. That makes the two three-symbol outputs, and their six-symbol concatenation, a plausible short key candidate. The chapter is the fixed target; the key begins at phase zero and runs continuously across its page boundaries.

## Tests and results

The reproduction script is [`sims/lp2_p33_39_cuneiform_base29_key_sft.cjs`](../sims/lp2_p33_39_cuneiform_base29_key_sft.cjs). It reads the canonical LP2 corpus, transcription, and TextBlob word-frequency lexicon; no fitted phase, alphabet relabeling, page permutation, or key search is used.

The first test treats each candidate as a repeating additive GP29 key, in both directions. Word boundaries remain at their original positions.

| Key | Direction | Dictionary words / 378 | Coverage |
|---|---|---:|---:|
| `16I3QO` / `UGEOYA` | `P=C−K` | 27 | 7.14% |
| `16I3QO` / `UGEOYA` | `P=C+K` | 25 | 6.61% |
| `3QO16I` / `OYAUGE` | `P=C−K` | 27 | 7.14% |
| `3QO16I` / `OYAUGE` | `P=C+K` | 23 | 6.08% |
| `16I` / `UGE` | `P=C−K` | 26 | 6.88% |
| `16I` / `UGE` | `P=C+K` | 21 | 5.56% |
| `3QO` / `OYA` | `P=C−K` | 29 | 7.67% |
| `3QO` / `OYA` | `P=C+K` | 27 | 7.14% |

The untransformed ciphertext has 22 dictionary hits (5.82%). The decoded strings remain nonlinguistic; the small coverage changes do not constitute plaintext evidence.

The second test applies the established p56 F-transparent rule: plaintext F passes through without consuming a key symbol. A phase-state reachability test, independent of English scoring, finds **no complete legal inverse** for any of the eight fixed-key/sign combinations:

| Key | Direction | First impossible rune offset | Cipher rune | Containing ciphertext word |
|---|---|---:|---|---|
| `16I3QO` | `P=C−K` | 20 | G | `FTEOEEAAIASG` |
| `16I3QO` | `P=C+K` | 89 | J | `JL` |
| `3QO16I` | `P=C−K` | 162 | G | `XTHGD` |
| `3QO16I` | `P=C+K` | 34 | D | `YDBTR` |
| `16I` | `P=C−K` | 38 | U | `UJH` |
| `16I` | `P=C+K` | 141 | J | `EPJOWUEANGW` |
| `3QO` | `P=C−K` | 71 | Y | `AJAEGYMWD` |
| `3QO` | `P=C+K` | 71 | Y | `AJAEGYMWD` |

Finally, the six- and three-digit sequences were used as ordinary column-rank keys for the corresponding 6- and 3-column transpositions, in both inverse directions and both header orders. None of these outputs admits a complete segmentation using the same TextBlob GP29 lexicon. This is only a bounded rejection of that simple columnar interpretation, not an exhaustive transposition search.

## Decision

Reject the direct repeating additive-key and simple columnar-key interpretations of `16I` and `3QO) for p33–39. The F-transparent result is decisive for those exact fixed-phase key schedules. Do **not** infer that the BASE29 conversion is a false clue: the outputs could still be addresses, selectors, or inputs to a different source-specified operation. No further cipher families or fitted phases are justified by the current evidence.

Reproduce with:

```sh
node sims/lp2_p33_39_cuneiform_base29_key_sft.cjs
```
