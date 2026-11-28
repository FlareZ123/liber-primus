# Agent2 research route to test: 2014 three authentic magic squares yield candidate entire 2013 DH packet without importing 2013 numbers

The earlier Stage7 source reports and H/circumference broadcast remain the rigorous input; this is a significant **algebraic completion** of that candidate key schedule, *not unknown plaintext* or proved author-selected instruction.

Starting from *only* the authentic 2014 OpenPuff `magicsquares.txt` 5×5(3301),7×7(1033),5×5(1033), and fixed GP29:

```text
  3301 and 1033 are both primes.
  φ(3301) mod29 = 23                   → candidate DH p
  det of three original squares mod29 = [10,2,3]
  (10/2) mod29 = 5                     → candidate DH g
  (3301−1033) mod29 = 6               → candidate exponent a
  (10/2)·3 mod29 = 15                  → candidate exponent b
  5^6 mod23 = 8                        → public A
  5^15 mod23 = 19                      → public B
  8^15 mod23 = 19^6 mod23 = 2         → shared K
```

All seven fields match the **independently authenticated 2013 DH transcript** exactly, and original p8 Roman XIX independently matches predicted B19. This derivation uses no 2013 **numerical input**, only the q29 algorithm and source arithmetic hypotheses. Euler φ is a genuine Cicada/solved-page operation, giving a plausible original human action; HOWEVER ***choosing* `φ(3301) mod29` as p, determinants as g/e and product b=g·e is retrospective and not instructed in 2014**. In fact p23=φ3301 mod29 is algebraically **dependent** on g5=−3301 mod29 because φ3301=3300; do not count as an independent match. The remarkable source packet must still predict an original cipher *operator* and untouched receiver to become an authenticated solution.

A geometric single-rule candidate is also now explicit. The 2014 original square sizes5/7/5 can be made all5×5 by obeying p57 'shed circumferences' **only on the larger middle 7×7**. Apply exactly `H(x,y)=[x−y,x+y] mod29` to the published top-left/top-right corners of all three equal-sized squares in original order. Entire 6-number tape is `[19,8,9,2,5,17]`; the positions encode **B19,A8,K2,g5** and other entries9=(b−a) and17=φ1033 mod29. H was independently explored in p6 but no instruction yet connects to 2014 top corners. This is a *specific human-solve-path hypothesis*, not permission to fit a cipher family.

Repro `node sims/lp2_2014_three_square_dh_spectral_bridge_sft.cjs`, consolidated `results/README.md`, and `im-results/lp2-2014-three-square-dh-eigenspectrum-convergence.md` in commits [82dccd5](https://github.com/FlareZ123/liber-primus/commit/82dccd5fcbc5708bddb972a11ad1e9202b4db5b2), [5f0a748](https://github.com/FlareZ123/liber-primus/commit/5f0a748e33e8d5a38bbbadb7e3ef35f33e859237) and [cfa6fb7](https://github.com/FlareZ123/liber-primus/commit/cfa6fb760d2942887cecd01db3dc64bb31b6c724). Checked original p55 43-word interior mirror H, source 2-sided similarity and original p8 red title12 literal additive H tape all fail to yield prose; these bounded negatives are preserved. **Suggested next decision:** find source-specific original *cipher consumer* or explicit p6 H-to-Stage7 instruction. Do not duplicate generic key hunting.
