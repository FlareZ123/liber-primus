# P15 Fibonacci-prime spiral as a signed-BASE29 key: original p19 obstruction

**21 November 2026, Agent10. Bounded source-motivated negative. No unknown LP2 plaintext, authentic key or original cipher recovered.**

## Proposed human route and its limits

Physical LP2 p15, source `resources/liber-primus/32.jpg`, prints a red-origin 4×4 decimal spiral. Its previously established complete authored rule is `abs(3301 - prime(distinctFibonacci[n]+1))`, `n=0..15`. The resulting original spiral values are:

```text
3299 3298 3296 3294 3288 3278 3258 3222
3152 3038 2838 2472 1820  708 1206 4516
```

A genuinely earlier Cicada signed TCP operation explicitly taught **BASE29 3301 -> 3QO**, with big-endian base29 digits `[3,26,24]`. The same source-number operation would serialize the visible red starting value 3299 as `[3,26,22]` (`3QM`). This suggests testing a **source-defined integer-to-GP rune conversion** before inventing a password, S-box, or KDF.

Two exact digit serializations respect the visible sixteen-cell order: canonical minimal-width BASE29 gives **47** digits, because 708 has only two digits `[24,12]`; preserving three base29 digit places for *every* printed cell inserts the single leading zero/F before 708 and gives **48** digits. The fixed-width variant is an additional reasonable framing hypothesis, not an authenticated instruction. Either stream becomes a candidate cyclic GP29 key.

The weakest premise is **cycling these printed digits as a rune key**. Neither the source grid nor the signed historical BASE29 example instructs a p15 receiver, periodic key, cipher sign, or reset. We therefore test only an ordinary additive receiver and the already authenticated solved-p56 plaintext-F bypass, and stop on failure.

## Bounded test and decisive algebraic result

The direct `P=C±K` candidate, read in original rune order with phase zero, gives the following GP29 indices of coincidence over **all 1,744 original pp16–22 runes**. For comparison, original clear p57 has **0.062710** and uniform GP29 has **0.034483**.

| Source digit stream | C−K | C+K |
| --- | ---: | ---: |
| Canonical 47-digit key | 0.03426945 | 0.03475698 |
| Fixed-width 48-digit key | 0.03451618 | 0.03480041 |

None reads as sustained GP-native prose. More decisively, test **all 47 or 48 starting phases** of each key, both arithmetic signs, on unmodified **physical p19 (271 runes)** under the actual solved-p56 plaintext-F-transparent forward semantics. If plaintext rune F/0 occurs it emits ciphertext F/0 and does *not* advance the key. A ciphertext F/0 may also arise from a non-F plaintext with a consumed key digit; the inverse considers both possibilities. Every other ciphertext must consume a key digit and decode to non-F. This dynamic program never guesses F positions and is **exactly key-independent of any plaintext-language score**.

| Source key | Inverse | Phases admitting full p19 | Furthest reachable original prefix, best phase | First failure, phase 0 (zero-based) |
| --- | --- | ---: | ---: | ---: |
| 47 canonical | C−K | **0/47** | 69/271 | 2 |
| 47 canonical | C+K | **0/47** | 109/271 | 1 |
| 48 fixed-width | C−K | **0/48** | 125/271 | 2 |
| 48 fixed-width | C+K | **0/48** | 101/271 | 1 |

Thus even allowing a fresh arbitrary key phase at p19 cannot make either authentic-source BASE29 stream a solved-p56-style additive key for its own visible chapter. The test is stronger than an IoC failure: the proposed cipher grammar cannot re-encrypt the unchanged original p19 ciphertext for *any* plaintext. All four models positively encode and admit the full original 95-rune **clear p57** as a separate synthetic native-GP control with correct F bypass.

The p15 printed 139 black-body runes were independently checked at red20 offset, but the p19 full-length contradiction already rules out a uniform p15→p16–22 key schedule even when page reset phase is free. This does **not** rule out a genuinely distinct nonlinear operation or a creator-supplied extension of the Fibonacci generator, since those are new mechanisms, nor does it disprove the actual sixteen-cell arithmetic solution.

## Decision

Retire **BASE29 serialization of the sixteen printed p15 numbers as a directly repeated additive GP29 key**, including its literal F-transparent p56 variant. The input serialization is source-derived; the cyclic key consumer was exploratory and **does not survive** a complete original page. Do not attempt further offset/score tuning unless a new source instruction selects a different operation and untouched receiver.

**Single-file Windows-compatible Node22 SFT:** [`sims/lp2_p15_spiral_base29_fkey_source_sft.cjs`](../sims/lp2_p15_spiral_base29_fkey_source_sft.cjs). Source arithmetic control: [p15 Fibonacci-prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md). The exact original-input SFT passed on **Windows Node.js 22** ([manual Actions run 44958528735](https://github.com/FlareZ123/liber-primus/actions/runs/44958528735)). The SFT reads `resources/liber-primus/lp2-corpus.json` unchanged and asserts all original values, all-phase p19 obstructions, exact decoder semantics, and planted clear-source controls.
