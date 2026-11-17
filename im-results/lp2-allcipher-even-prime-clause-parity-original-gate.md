# All-symbol source-prime short-clause parity gate for a fixed secret F image

**17 November 2026, Agent22. Classification: original-source, key-independent conditional negative. No authentic unknown LP2 plaintext, key, or cipher architecture recovered.** Reproduction: [CommonJS Node22 SFT](../sims/lp2_prime_clause_secret_even_rune_sft.cjs) · [manual Windows original-input run](https://github.com/FlareZ123/liber-primus/actions/runs/44082958643) (**PASS**, Windows Node.js 22, 17 November 2026, original corpus and matched 2,000-null test).

## Independent clue and decisive original-cipher question

The first-party 2013 `761.MP3` metadata records `Parable 1595277641`, exactly the product **1259 × 1031 × 1229** of three GP-prime sums from Cicada's clear p57 Parable clauses, established in the existing [original source study](author-native-prime-clause-discriminator.md). Independent known-clear sections contain 22 actual prime-summed short clauses among 32, and 24 of those 32 have odd GP-prime-sum parity ([prior exact gate](lp2-f-literal-prime-clause-parity.md)). If the unsolved plaintext shares that authorial prime-sum habit and clause boundaries, a cipher preserving symbols and prime-sum paragraph framing must respect the parity of its plaintext. This supplies a potential *plaintext-independent* test of a stationary secret GP29 bijection; a rival hypothesis is that unknown LP2 uses different clause authoring, boundary placement, or an evolving non-F-preserving cipher.

Only GP F has an even prime weight, **2**; all remaining 28 GP primes are odd. Suppose a fixed unknown secret ciphertext rune `q` denotes plaintext F. For a displayed clause `u` of length `L`, its decrypted GP-prime sum parity is necessarily

```
primeSumParity(u, q) = (L - count(u, q)) mod 2.
```

This remains true under every possible secret bijection of the other 28 rune values. Every actually prime-summed plaintext clause of length at least three must satisfy odd parity, so the count of odd-parity clauses under candidate `q` is a strict upper bound on the number of prime-summed clauses. There are exactly **29** candidate `q` values; the test is an exhaustive all-secret necessary-condition screen for a *fixed* F image, with no tuning of the other alphabet symbols.

## Original experiment and complete result

The untouched canonical 55 rune-bearing physical LP2 pages contain **12,956 GP29 runes** and **175** printed clauses under `.`, `&`, `$`, `§` delimitation. Use the 70 short clauses with **≤40** runes, retaining both headings and original physical page continuations. The maximum allowable count of prime-summed clauses across **all 29 secret-F image candidates** is **44/70**, attained by ciphertext TH; literal ciphertext F permits **37/70**.

| Ciphertext rune proposed to represent plaintext F | Maximum odd-parity short clauses |
| --- | ---: |
| TH | 44 |
| NG, AE | 42 each |
| S | 41 |
| U | 40 |
| E | 39 |
| Literal F | 37 |

The complete score vector in canonical GP order `F,U,TH,O,R,C,G,W,H,N,I,J,EO,P,X,S,T,B,E,M,L,NG,OE,D,A,AE,Y,IA,EA` is:

```text
37,40,44,35,37,35,34,37,36,38,38,35,35,38,34,41,33,38,39,35,35,42,32,36,31,42,36,37,32
```

This quantity depends on relative *rune counts and clause boundaries*, not on guessed language; however, selecting TH for its 44 score after testing all 29 is postselection. A matched null therefore **refits all 29 candidates in every replicate**. Independently shuffle all original GP rune symbols *within each original physical page*, maintaining every page's frequency inventory, printed punctuation, entire book clause-length profile and page geometry. Xorshift32 seed `0x33012026`; 2,000 replicates. The null maximum has mean **42.919/70**, and **697/2,000** replicates equal or exceed the original 44, add-one probability **698/2001 ≈ 0.34883**. There is no significant original evidence for TH or any other fixed ciphertext image of F under this diagnostic.

The 55-page corpus split at physical page28 does not provide a common winner: p0–27 has NG scoring 26, while p28–55 has H scoring 23 (the p50 table has zero runes). This is descriptive rather than an additional preregistered significance test.

Under the conditional transfer of the solved Cicada short-clause **prime-sum rate 22/32** to the original 70 unknown short clauses, an expected **49** should be prime-valued. Even the optimal fixed cipher-F rune allows at most **44** such clauses, so **at least five printed-clause parity states would have to change** to attain that solved-language rate. This is only a cross-genre heuristic requirement: the unknown book could legitimately contain fewer prime-valued clauses. Do not interpret five as proof of a hidden deletion, an F bypass, or a particular cipher.

## Source-native positive and decision

The companion original-input SFT reconstructs the four known cleartext Cicada sections used in the existing parity calibration (32 short clauses, 24 odd). It applies a genuine bijective F↔TH swap, and the exact 24/32 odd states transfer to the new TH ciphertext rune. This shows that a truly stationary secret image of F preserves the necessary statistic in a source-native positive, without revealing the remaining 28 mappings.

**Decision:** The fixed-F-bijection / prime-clause upper bound provides no usable clue-selected mapping, original plaintext or key. The strongest postselected candidate is ordinary under the refitted source null. The conditional 49/70 solved-style threshold does not warrant excluding all stationary substitutions because the rate and boundaries are not established for unsolved LP2. Preserve the gate for evaluating a future independently discovered plaintext candidate or a cipher that predicts its F image *before* inspecting its clause statistics. Do not extend this into an unanchored pagewise F-search.
