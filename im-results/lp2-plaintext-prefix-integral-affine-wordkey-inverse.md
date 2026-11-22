# Direct cumulative Gematria cipher: original-word key-recovery decision

**Agent50, 22 November 2026. Original LP2 p0–p55, source-native English key-recovery attack. Outcome: no shared two-parameter original cipher or unknown plaintext recovered.** This is a distinct full-word cumulative-plaintext architecture, not the earlier previous-plaintext digraph or ciphertext-feedback recurrence.

## Reversible mechanism and source-motivated alternatives

The complete 2014 LP2 rune-bearing manuscript has 12,956 GP29 ciphertext runes within **2,896 printed words**. Test the source-natural running Gematria accumulator, with an arbitrary secret additive offset for **each word**:

```
C[w,j] = a * P[w,j] + b * sum_{t<j} F(P[w,t]) + k[w]  (mod 29)
a in 1..28, b in 0..28, k[w] entirely free per word
F(P) = GP ordinal index 0..28 OR published GP prime value reduced mod 29
```

Each candidate is perfectly reversible for any nonzero `a`, if its evolving plaintext prefix and private `k[w]` are known. The cumulative score is natural to Gematria Primus and to the book's many sum and prime-number clues, but **no authenticated Cicada instruction selects this cipher**. The two predeclared accumulator sources charge the main ambiguity rather than fitting another unknown map.

Take an independently sourced candidate English word P with the exact original rune-word length. Subtract the initial cipher rune to eliminate **any** word-specific `k[w]`. Two linearly independent later rune equations recover the globally shared `a,b` algebraically over GF29; validate every remaining original rune in the entire printed word. A word contributes at most one vote per recovered key, however many donor lexemes match. This is a direct key search on **the original ciphertext** rather than free-running language scoring.

## Complete original and positive-control results

The frozen donor register has **10,433** unique GP-normalized five-to-fourteen-rune English words from Gibran, Shakespeare and Emerson. The original manuscript has **1,132** printed words of those lengths. Exact printed word starts and their original GP indices are checked against `resources/liber-primus/lp2-corpus.json`; the subsequent solved p56 and clear p57 are expressly excluded, so known English cannot contaminate the unknown-page key ranking.

| Fixed receiver | GP ordinal accumulation | GP prime accumulation |
|---|---:|---:|
| Original cipher × donor full-word comparisons | 1,976,810 | 1,976,810 |
| Exact original whole-word/key matches | 703 | 709 |
| Distinct original words with ≥1 match | 298 | 305 |
| Maximum same global `(a,b)`, private `k[w]` | **5/1,132** | **5/1,132** |
| Maximum shared global `(a,b,k)` | **2/1,132** | **2/1,132** |
| Original-shaped source-English positive, true `(a,b,k)=(3,14,9)` | **1,132/1,132** | **1,132/1,132** |

For ordinal accumulation the five best `(a,b)=(4,13)` words independently resemble ELECT, ALBAN, PRICE, FAULT and TOWER at scattered original word positions [370,838,1179,2163,2491]. For prime accumulation the five best `(a,b)=(14,4)` resemble WEAPON, REELING, ENEMY, NATION, HUNTING at [722,1044,1142,1411,2649]. They do not form adjacent unknown plaintext or yield a transferable book key; the model's positive controls demonstrate the difference between these chance coincidences and genuine recovery.

The independently encoded positive controls use the real original 1,132-word length profile, source-English donor words, and a single undisclosed-to-the-recovery-step key `(a,b,k)=(3,14,9)`. Both GP accumulator variants recover all 1,132 donor word keys exactly; the `k[w]`-private analysis also recovers their common `(a,b)`. The routine checks that every source-rune position participates in the forward rule and exactly matches on inverse recovery.

**Decision:** retire the **word-reset, shared-`a,b`, arbitrary-word-private-offset** cumulative GP ordinal/prime cipher on normal native GP English. This does not exclude separate coefficients per word, a different word segmentation, source-supplied secret initial state, a nonlinear evolving cipher, or a plaintext register unrelated to the tested native-English lexicon. Reopen only if an independent original clue supplies those missing freedoms and a discriminating untouched plaintext prediction.

## Reproduction

[Self-contained Node.js 22 CommonJS test](../sims/lp2_gp29_plain_prefix_integral_keyrecovery_sft.cjs), source commit [`f61ac2c`](https://github.com/FlareZ123/liber-primus/commit/f61ac2ca965ca49780dbec6be6f906a9d07469b9). The committed exact script was executed successfully on all five actual GitHub file contents in the connected V8 runtime with a minimal standard-library adapter; both complete plant recoveries and all explicit assertions passed. It requires only `node:fs`, `node:path` and `node:assert/strict` in a normal Node 22 checkout. Distinct earlier comparison: [plaintext-digraph affine family](lp2-plaintext-digraph-affine-wordkey-inverse.md).
