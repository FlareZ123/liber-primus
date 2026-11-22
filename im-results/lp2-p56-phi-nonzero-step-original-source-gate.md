# Solved-p56 prime-totient key projected onto the GP29 nonzero-step channel

**Agent 12, 13 November 2026. Decision:** a historically motivated fixed composition has no original plaintext recovery. The complete original 12,956-rune inverse and a 95-rune GP-source-shaped positive plant **passed [Windows Actions 43486391480](https://github.com/FlareZ123/liber-primus/actions/runs/43486391480)**. The original decoded frequencies remain nearly uniform across all four predeclared sign and clock choices. No LP2 plaintext, authenticated unknown key, complete cipher or final destination was found. This is an intermediate negative and should not be promoted to established findings.

## Why this operation was worth one finite test

The solved LP2 p56 cipher adds `φ(p_n)` modulo29 to native GP29 plaintext, with its historical literal-plaintext-F exception. Independently, LP2's 86 adjacent-equal rune pairs among 12,956 original symbols motivate the **conditional**, reversible GP29 nonzero-step output channel. Earlier [EA zero-step work](lp2-fibonacci-ea-zero-step-gate.md) used one Fibonacci 28-key; it did not test the solved-p56 totient stream as that channel's key. The 2013 signed challenge supplies a precedent for modular exponentiation, while the prior exact GP29 lossless model uses 15 as a primitive root of the multiplicative group of order28. This gives one small, executable combination from two existing historical mechanisms. There is **no authenticated Cicada instruction** that places the p56 key inside an exponential step, chooses generator 15, assigns EA to a zero step, or uses a GP28 key instead of p56's GP29 key. A negative can decide this exact composition without chasing further key phases.

## Frozen reversible model and original inputs

Physical LP2 p0–55 supply 55 rune-bearing original pages, 12,956 source GP29 indices and 86 same-page adjacent-equal transitions; runeless p50 is retained as an empty physical page. Let `q_n` be the `n`th positive prime, starting `q_0=2`. Use the source-specified totient stream projected into the order-28 exponent register:

`K_t = φ(q_t) mod28 = (q_t - 1) mod28`.

The nonzero GP29 residues are the 28 different powers of 15, which is primitive modulo29. At the beginning of each physical rune-bearing page, transmit the first rune unchanged as the state seed `C_0=P_0`. For each remaining rune of that page, define `δ_i=(C_i-C_{i-1}) mod29` and decode:

- If `δ_i=0`, `P_i=28` (GP rune EA).
- Otherwise `P_i=(log₁₅(δ_i) ± K_t) mod28`.

The direct encoder is `C_i=C_{i-1}` for EA and `C_i=C_{i-1}+15^(P_i ∓ K_t) mod29` otherwise. Both are exact inverses and no ciphertext position is discarded. Two clock choices were frozen: `t=i` (page-local) or `t=sum of prior rune-bearing page lengths+i` (book-continuous). The source original **first rune at every page** is transmitted as a state seed and excluded from the lexical frequency diagnostic; both signs are examined under both clocks. The 2014 solved p56 cipher's literal-F exception is **not** silently imported: these are mathematically different channels and the zero step is the only special case of this proposed new channel.

The known-key source regression uses the genuine *clear* LP2 p57 GP29 symbols as plaintext. One symbol at p57 position8 is explicitly replaced with EA to plant the zero-step branch. Each sign encrypts and recovers all **95/95** planted runes exactly, including that forced adjacent repeat. The original 55-page decryption and forward encryption also replay **12,956/12,956** source ciphertext runes. Exact replay only validates implementation because every key of a bijective family can replay its own inverse.

## Original input decision

Every reading has precisely **12,901** noninitial decoded symbols. Original observed ciphertext IoC is **0.0344783979**; the genuine original clear p57's 95-rune IoC is **0.0627099664**. The four full-book decoded GP29 indices give:

| Key clock | Decode sign | IoC on all 12,901 noninitial original runes |
| --- | --- | ---: |
| Page-local | `log₁₅δ − K` | **0.0352761909569** |
| Page-local | `log₁₅δ + K` | **0.0352910446820** |
| Book-continuous | `log₁₅δ − K` | **0.0352842427334** |
| Book-continuous | `log₁₅δ + K` | **0.0352710714691** |

All are close to a uniform 29-symbol register. The source p0 noninitial sample under the primary page-local subtract convention opens:

`F U N P Y N N W O N S Y D F A B OE NG B B F R EO G U S OE H`.

This is a raw GP transliteration of decoded runes, **not** a discovered phrase or authentic plaintext. Neither sign yields a sustained GP-native language register; there is no independent cue for introducing more cipher stages. The 86 source repeats become EA by construction and therefore supply no independent confirmation that EA is the authentic plaintext symbol. The model would need a new source-selecting instruction, not a fitted generator, phase or word reset, to merit another test.

## Reproduce and limited conclusion

Run `node sims/lp2_p56_phi_nonzero_step_original_sft.cjs` from the repository root on Windows Node22. It reads the unchanged `resources/liber-primus/lp2-corpus.json`, independently constructs all needed primes, asserts the source 55-page/12,956-rune/86-repeat totals, verifies 15's full 28-element multiplicative order, asserts authentic p57 source IoC, tests both signs on the 95-symbol planted control, checks all original forward inverses, and verifies all four frozen decoded scores. The manual-only [workflow](../.github/workflows/lp2-p56-phi-nonzero-step-manual.yml) ran successfully on Windows, with no per-commit trigger.

**Specific result:** the p56 prime-totient stream projected modulo28 fails to make original LP2 ciphertext linguistically recognizable through this exact GP29 predecessor-nonzero-step inverse. It is a distinct finite negative from the earlier Fibonacci key and direct additive p56 transfers. It does not rule out other source-derived keys, alphabet/state conventions, or a genuinely different unknown cipher. No additional search over seeds, clocks, rotations, generators or cipher layers is warranted without independent original evidence.
