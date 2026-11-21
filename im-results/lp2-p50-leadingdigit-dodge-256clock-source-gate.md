# Source-selected p50 high-digit repeat-dodge candidate: exact original inverse

## Decision

The original p49–51 source table has exactly 256 two-character radix-60 entries. Its high digits lie in `0..4`, and **60 of 256 are zero**. An independently established original-ink observation finds **33 of 86** adjacent-identical rune events at high-digit-zero table phases (static index, first rune). This makes a source-driven zero-step mechanism worth testing. The specific reversible cipher below is **excluded on the original ciphertext without guessing plaintext or a secret GP29 shift**.

Original p0–55 contains 12,956 GP29 runes and 86 adjacent-equal observations. **All 256 possible table-clock starting cells fail** to admit a complete cipher-consistent path. With continuous clock, the latest failure is at global zero-based rune offset **979**; restarting the same clock at the nine original physical chapter boundaries still fails, latest by global offset **1038**. The rejection is exact for this proposed operation, not a score threshold or an English-prose judgment.

[Original-input SFT](../sims/lp2_p50_leadingdigit_dodge_256clock_sft.cjs) · [successful Windows Node22 CI execution](https://github.com/FlareZ123/liber-primus/actions/runs/44932217639)

## Candidate operation and why its key is source-constrained

From the printed original grid `resources/liber-primus/lp2-grid-256.json`, let `d[t]` be the first radix-60 digit of the cell at cyclic index `t mod 256`. The exact digit histogram is `[60, 58, 65, 56, 17]`. The 2016 authenticated continuation says “their numbers are the direction,” while the original repeated-rune localization independently singled out these printed leading zeros; a zero cipher step is therefore a motivated attempt at interpreting the numbers. The proposed arithmetic register has a cumulative GP29 shift `K_t` with `K_(t+1) = (K_t + d[(t+1) mod 256]) mod 29`. To encrypt plaintext rune `P_i`, propose `C_i = (P_i + K_t) mod 29`; when it equals the preceding emitted cipher rune, advance clock `t` once, retry the SAME plaintext rune using `K_(t+1)`, then advance the clock once for the next rune. A failed dodge may preserve a doublet precisely if `d[(t+1) mod256] = 0`. The initial shift itself can be any of the 29 GP29 values and cancels from the necessary path test.

This is the minimal GP29 additive, cumulative 256-clock, one-retry interpretation. Other table interpretations require their own source-selected receiver.

## Exact plaintext-independent inverse feasibility test

At source position `i`, track every possible number of prior extra clock advances `s` in a finite set `R_i`. For a chosen table start `h` and original observed `delta_i = (C_i - C_(i-1)) mod29`:

- A normal one-step path remains at `s` only when `delta_i != 0`. A repeated output would have triggered the dodge.
- An extra-step path reaches `s+1` exactly when `delta_i = d[(h+i+s+1) mod256]`, since retrying the same plaintext rune changes the emitted cipher rune by precisely that source-table digit.

The inverse begins at `R_0={0}`. Empty `R_i` is an **algebraic impossibility** for any plaintext and any fixed starting additive GP29 key. All states are retained; there is no beam pruning, null ranking, word dictionary, key-fitting or top-k threshold. Eight authentic forward-encrypted 12,956-rune controls (four table starts × continuous/chapter resets), with source p56/57 GP29 plaintext repeated, **all pass exact full-cipher feasibility and exact plaintext reconstruction under their realized key clocks**. The controls emit 88–110 repeated cipher rune events, in the original ballpark. The original rejects in both modes.

| Clock convention | Tested starting phases | Complete original paths | Earliest unavoidable failure | Latest failure |
| --- | ---: | ---: | ---: | ---: |
| Continuous from original p0 | 256 | 0 | 122 | 979 |
| Restart at each of nine original chapter heads, same start phase | 256 | 0 | 122 | 1038 |

## Interpretation and remaining route

This eliminates the tempting *literal* explanation of the previously established p50 leading-zero/doublet association as a **fixed additive GP29 cumulative shift driven by the printed high digits with exactly one retry**. It strengthens the reason to demand a genuine reversible consumer instead of promoting the 33/86 source association to a decipherment rule.

It does **not** rule out a keyed nonaffine conjugation (which can make nonzero retry differences arbitrary), an independent word disk, skipping selected glyphs such as F, varying chapter-specific initial phases, more than one retry, different table reading orders, or higher-entropy interpretation of the p50 entries. None of those extra rules is selected by this source evidence or decoded here. **No unknown-page plaintext, authentic key or destination was recovered.** Earlier source localization remains described in [the event-bearing-word controlled p50 result](lp2-doublet-gap-nonstationarity-ordering.md), and the independently tested five-phase Quagmire model has its own [full-affine forward control](lp2-clock-quagmire-full-affine-original-model-gate.md).
