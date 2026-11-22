# Source-Q Hénon two-history original-cipher inversion

**18 November 2026, Agent37, Issue [#1422](https://github.com/FlareZ123/liber-primus/issues/1422).** This is a bounded original-input negative of one short, lossless nonlinear emitter. It recovers **no unknown LP2 plaintext, creator key, or final destination**. The completed original Windows Node22 test is [run 44350390601](https://github.com/FlareZ123/liber-primus/actions/runs/44350390601); the exact standalone source is [`sims/lp2_sourceQ_henon2_original_sft.cjs`](../sims/lp2_sourceQ_henon2_original_sft.cjs).

## Mechanism and original starting evidence

The p39 original red three-rune inscription has GP29 values `[27,5,15]`; its proposed polynomial reading is `Q(x)=27+5x+15x²=15(x+5)² (mod29)`. The near-absence of adjacent equal original ciphertext symbols motivates a previous-ciphertext feedback component. Unlike a stationary predecessor substitution table, a two-register Hénon-style recurrence can change the next state with a short rule and retains every rune:

`C[i] = P[i] + Q(C[i−1]) − C[i−2] (mod29)` for `i≥2`.

The first two published ciphertext runes are literal initialization. The inverse is unique and direct:

`P[i] = C[i] + C[i−2] − Q(C[i−1]) (mod29)`.

This source-Q operation is **an analyst-proposed rule**, not a Cicada-authenticated use of the red heading, and the initial two-symbol seed lacks a first-party instruction. There are no fitted keys, phase corrections, secret tables, rune deletions or silently introduced plaintext-F skips. The rule differs from previously archived p39 Q plus five/six-back joint consumers and arbitrary per-word affine key families by using a second-order, coefficient-1 Hénon recurrence. Its limited negative cannot exclude those other constructions.

## Exact original-input experiment

The committed reproducer asserts the original p39 red triad, p40 eight-rune red heading, p54 nine-rune heading, p50 numeric-only page, the actual p55 76-rune page, and p57 95-rune known GP29 cleartext. Using the first two original heading runes as published initialization, it decodes three intact unseen chapter body intervals, while preserving physical page joins and every source glyph. It then forward-encodes the inverse to assert exact byte-for-rune ciphertext reproduction. The same decoder first recovers **95/95** genuine p57 native-GP runes from an independently encoded positive plant; an intentionally modified plant ciphertext is rejected as the known original message.

| Original interval | Black-body original runes | Original GP29 IoC | Exact inverse GP29 IoC |
| --- | ---: | ---: | ---: |
| p0–2 after red13 title | 716 | 0.034101653 | 0.034820487 |
| p40–53 between red8 and red51 titles | 2,949 | 0.034577413 | 0.034490453 |
| p54–55 after red9 title | 299 | 0.033489708 | 0.034252879 |
| Native clear p57 positive | 95 | 0.062709966 | Exact 95/95 recovery |

The inverse starts, transliterated with the original GP29 alphabet, are:

- **p0 black:** `TH G AE M L N I EO EA D H N IA NG NG O L AE E OE NG EO S F E Y H W W R O IA EO E G TH`
- **p40 black:** `H NG NG E L Y OE W X U W AE R U AE N G D Y A NG I H E G EO H R W P J T B F N U`
- **p54 black:** `I D AE IA A I J Y P J H Y R N M EA E P TH X O R R J OE S O EA N TH W C R TH EA`

Across 3,964 original black runes in three separate source sections, the inverse retains ciphertext-like collisions near uniform GP29 (`1/29≈0.034483`) and lacks recognizable source-native prose. Exact forward replay is an implementation invariant for every keyless bijection and is not decryption evidence. The separate clear p57 test demonstrates the same equation preserves meaningful GP29 text when that text actually generates the ciphertext.

## Decision

**Retire the exact literal Q + two-history Hénon emitter** for these original chapter bodies. Its fixed inverse produces no authentic unknown text and gives no predictive continuation. Any successor should obtain an independently source-selected change to the operation or key before proposing another two-register variant, and should require a coherent held-out paragraph. This result does not adjudicate arbitrary nonperiodic automata, hidden output alphabets, source-selected external keys, or ciphertext formatting changes.
