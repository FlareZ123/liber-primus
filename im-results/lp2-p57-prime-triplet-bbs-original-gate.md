# 2013 PARABLE prime triplet: source-motivated BBS direct inverse gate

**Decision (13 November 2026, Agent45):** The 2013 761.MP3 numeric tag and the independently authenticated p57 PARABLE clause sums jointly suggest one *mathematically natural but historically unselected* three-prime BBS key construction. Its direct GP29 additive consumers fail on all 12,956 unchanged unknown original LP2 runes. **No original plaintext or authentic key recovered.** The relevant observation is a bounded negative, not a claim that the creators intended Blum–Blum–Shub.

## Why this exact hypothesis deserves one test

The previously established [original 2013 MP3 carrier](../results/README.md) stores the exact value **1,595,277,641 = 1,031 × 1,229 × 1,259**, which equals the product of the original solved p57 PARABLE's three body-clause Gematria Primus prime sums. This is a real cross-year source relationship, without an authenticated downstream cipher instruction ([previous exact source report](source-derived-prime-clause-seed.md)). Of its three prime factors, **1,031 ≡ 3 (mod 4)** and **1,259 ≡ 3 (mod 4)** meet the usual Blum–Blum–Shub (BBS) requirement; the remaining **1,229 ≡ 1 (mod 4)** gives an available seed, coprime to the modulus. The resulting minimal numeric proposal is:

- modulus `N = 1,031 × 1,259 = 1,298,029`, seed `s = 1,229`;
- `x_(n+1) = x_n² mod N`, with `x_0 = s` or conventional `x_0 = s² mod N`;
- GP29 keystream either from five consecutive BBS parity bits in MSB-first/LSB-first order with rejection of values 29–31, or direct `x mod29` / `floor(x/29) mod29` (the latter two are *not* canonical BBS output);
- plain output `(cipher ± keystream) mod29`, with restarts at book, nine source-visible visual chapters, or printed physical pages.

The original clues select the three factors but **do not select BBS, the extraction, the reset convention or the additive consumer**. This gate deliberately does not expand into a broader PRNG family, seek favorable phases, or adjust a candidate from ciphertext.

## Original-input results

[Runnable CJS SFT](../sims/lp2_p57_prime_triplet_bbs_gate_sft.cjs) reads unchanged `resources/liber-primus/lp2-corpus.json`, checks original length **12,956**, verifies the product and BBS integer-safe modulus, evaluates **48** completely pinned direct inverses (2 starts × 4 projection types × 3 clocks × 2 signs), and tests **48/48 exact synthetic forward/inverse round trips** using authentic clear p57 GP symbol values as the planted message.

| Metric | Source-exact value |
|---|---:|
| Original unknown LP2 12,956-rune collision IoC | 0.034478397864506 |
| Minimum decoded IoC, all 48 | 0.034450181351864 |
| Maximum decoded IoC, all 48 | 0.034527371625890 |
| Highest book-clock decoded IoC | 0.034517207485145 |
| Highest chapter-clock decoded IoC | 0.034527371625890 |
| Highest page-clock decoded IoC | 0.034518649291745 |
| Independently printed *cleartext* p57 IoC (95 runes, reference only) | 0.062709966405375 |

The largest IoC occurs in the chapter-reset, raw-seed, MSB-bit output, positive-sign variant. All decoded streams remain nearly uniform and indistinguishable in this diagnostic from the original cipher. The 95-rune p57 control is much shorter and must not be read as a universal hard cutoff, but the 48 candidate values give no sign of a normally letter-distributed GP plaintext. The independent byte-level proof of source identity and the other 2013 PRNG families have been covered elsewhere; this report records only the new BBS direct consumer.

**Disposition:** Retire these 48 direct BBS additive constructions from the original-cipher route. Plaintext-F bypass, unknown position clocks, nonadditive source-selected consumers and any genuinely new BBS-specific clue are outside this gate. In particular, a synthetic round trip is a correctness assertion, never evidence for an unknown original plaintext. Do not promote the speculative BBS connection to `results/README.md` without an independently visible original operation or recovered text.

### Reproduce

Run `node sims/lp2_p57_prime_triplet_bbs_gate_sft.cjs` from repository root. It prints all 48 variant statistics, key constants, and planted round-trip count. Requires Node.js 22 or another supported Node.js version; no dependencies and no network.

