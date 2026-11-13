# 2013 PARABLE prime triplet: source-motivated BBS direct inverse gate

**Decision (13 November 2026, Agent45):** The 2013 761.MP3 numeric tag and the independently authenticated p57 PARABLE clause sums jointly suggest one *mathematically natural but historically unselected* three-prime BBS key construction. Its direct GP29 additive consumers fail on all 12,956 unchanged unknown original LP2 runes. More decisively, the selected Blum modulus/seed has exact source-state period 612, permitting an all-secret, key-independent collision test: both original book and visual-chapter clocks fail every 4,428 matched source-native English control window even if every BBS state owns an unrelated secret GP29 symbol permutation. **No original plaintext or authentic key recovered.** The relevant observation is a bounded negative, not a claim that the creators intended Blum–Blum–Shub.

## Why this exact hypothesis deserves one test

The previously established [original 2013 MP3 carrier](../results/README.md) stores the exact value **1,595,277,641 = 1,031 × 1,229 × 1,259**, which equals the product of the original solved p57 PARABLE's three body-clause Gematria Primus prime sums. This is a real cross-year source relationship, without an authenticated downstream cipher instruction ([previous exact source report](source-derived-prime-clause-seed.md)). Of its three prime factors, **1,031 ≡ 3 (mod 4)** and **1,259 ≡ 3 (mod 4)** meet the usual Blum–Blum–Shub (BBS) requirement; the remaining **1,229 ≡ 1 (mod 4)** gives an available seed, coprime to the modulus. The resulting minimal numeric proposal is:

- modulus `N = 1,031 × 1,259 = 1,298,029`, seed `s = 1,229`;
- `x_(n+1) = x_n² mod N`, with `x_0 = s` or conventional `x_0 = s² mod N`;
- GP29 keystream either from five consecutive BBS parity bits in MSB-first/LSB-first order with rejection of values 29–31, or direct `x mod29` / `floor(x/29) mod29` (the latter two are *not* canonical BBS output);
- plain output `(cipher ± keystream) mod29`, with restarts at book, nine source-visible visual chapters, or printed physical pages.

The original clues select the three factors but **do not select BBS, the extraction, the reset convention or the additive consumer**. This gate deliberately does not expand into a broader PRNG family, seek favorable phases, or adjust a candidate from ciphertext.

## Exact source-state period: a stronger all-secret gate

The BBS state obtained from the original three factors, `x -> x² mod 1298029` starting at `1229`, has exact period **612**, with no preperiod; starting from conventional `1229² mod N = 212412` gives the same 612-state cycle shifted by one squaring step. These are exact integer facts, independently asserted in [the source-native, 612-state SFT](../sims/lp2_p57_prime_triplet_bbs_period612_allsecret_sft.cjs). Their significance is a **secret-key-independent invariant** for a much broader cipher than additive shifts.

Grant the hypothetical author a different *arbitrary unknown 29-symbol bijection* `π_x` for **every one of the 612 BBS states**, with no constraint on its parameter, alphabet, additive structure, or relation to the other 611 maps. If a book/chapter-local plaintext symbol `P_i` produces `C_i = π_(x_i)(P_i)`, then `x_(i+612)=x_i`, hence **`C_i = C_(i+612)` exactly when `P_i = P_(i+612)`** for every eligible pair. This identity is unaffected by a source-unselected secret per-state alphabet and holds with either raw or squared start. It does assume a **state-only, stationary, length-preserving symbol bijection**, and no hidden ciphertext-correlated updates, bypass/escape, or different position clock.

| Frozen original scope, lag 612 | Original equalities / eligible comparisons | Rate | Minimum native GP control rate | Matched windows at or below original |
| --- | ---: | ---: | ---: | ---: |
| Continuous unknown LP2 book | **455 / 12,344** | **0.03686001** | **0.05419637** (Shakespeare) | **0 / 4,428** |
| Reset at nine source-visible visual chapters | **272 / 7,752** | **0.03508772** | **0.05159959** (Emerson) | **0 / 4,428** |

The tested source-native English controls are original-length-matched windows at stride127, with **1,608** Shakespeare, **391** Gibran, **2,429** Emerson windows. For book/chapter respectively their minima are: Shakespeare **0.054196/0.051729**, Gibran **0.057842/0.054438**, Emerson **0.055087/0.051600**. The independently solved p57 GP text is exactly re-encoded by the same existing source-native GP29 encoder (**95/95**). A synthetic **12,956-rune** clear-source p57 plant encrypted through arbitrary state-dependent nontrivial affine bijections preserves **both** lag612 collision counts exactly, with automatic 612-state resets at the visual chapters. This is an original-source **conditional finite-English exclusion**, not an English-independent mathematical impossibility and not a decryption.

The fully executable SFT passed actual **Node.js 22 GitHub Actions [run 43496472125](https://github.com/FlareZ123/liber-primus/actions/runs/43496472125)** along with the separate 48 GP29 and 40 BASE29-byte direct BBS consumers. This excludes all **612-state-only repeated cipher-alphabet** constructions under the tested controls, covering even secret outputs that none of the direct additive variants enumerated. Per-page resets cannot have a within-page lag612 pair because the physical pages are shorter; however, a *shared* per-page seed and offset map is separately bounded by the existing general [all-secret page-offset collision gate](../im-results/lp2-pageoffset-allsecret-reuse-gate.md).

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

The largest IoC occurs in the chapter-reset, raw-seed, MSB-bit output, positive-sign variant. All decoded streams remain nearly uniform and indistinguishable in this diagnostic from the original cipher. The 95-rune p57 control is much shorter and must not be read as a universal hard cutoff, but the 48 candidate values give no sign of a normally letter-distributed GP plaintext. The independent byte-level proof of source identity and previously tested 2013 PRNG families have been covered elsewhere; this report focuses on the new two-prime BBS construction, its 612-state universal secret-alphabet gate, and its direct GP29/BASE29 consumers.

## Separate BASE29-byte BBS parity-XOR consumer

The historically authentic 2013 BASE29 numeral conversion and 2014 compressed-file stages motivate an independent binary candidate: serialize the unknown GP29 book or nine visual chapters as minimal big-endian BASE29 integers, then XOR each byte with eight successive parity bits of the same source-prime BBS generator.

The reproducible script evaluates **40** original byte streams (book and nine chapters × two initial states × two byte bit orders), each with an exact involution round trip. The 7,868-byte original whole-book stream begins `08 73 48 43 a5 51 93 dc`. Across all candidates there are **zero** starting signatures for BZIP2, GZIP, XZ, ZIP, PNG, PDF, or ASCII PGP; decoded printable-ASCII fractions span **0.31915 to 0.41613**. Whole-book MSB decoded headers are `5f83ca94e1182523` (raw seed) and `a7924ded2dc2fe22` (squared seed). All scripted assertions passed when executed against the exact original repository corpus. No binary payload or plaintext was recovered. A different framing/consumer would require its own original-source rationale.

**Disposition:** Retire the source-specified two-prime BBS 612-state-only symbol-bijection family under source-native prose on book/chapter clocks, along with the 48 direct GP29 additive and 40 direct BASE29 parity-XOR constructions. Plaintext-F bypass, unknown position clocks, nonadditive source-selected consumers and any genuinely new BBS-specific clue are outside this gate. In particular, a synthetic round trip is a correctness assertion, never evidence for an unknown original plaintext. Do not promote the speculative BBS connection to `results/README.md` without an independently visible original operation or recovered text.

### Reproduce

Run `node sims/lp2_p57_prime_triplet_bbs_gate_sft.cjs` from repository root. It prints all 48 variant statistics, key constants, and planted round-trip count. Requires Node.js 22 or another supported Node.js version; no dependencies and no network.

