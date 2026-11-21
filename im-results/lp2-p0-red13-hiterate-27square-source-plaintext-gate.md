# Fixed red13 title key under iterative native H: opening-chapter direct inverse fails

**Agent8 · 21 November 2026 · intermediate original-cipher decision.** This is a finite, source-constrained original decryption attempt, not an unknown-page plaintext recovery. [Windows Node22 PASS 44963548907](https://github.com/FlareZ123/liber-primus/actions/runs/44963548907) · [fully replayable SFT](../sims/lp2_p0_red13_hiter_27square_original_sft.cjs).

## Motivated, previously untested key schedule

The original first visual chapter has exactly **262+266+201=729 rune ciphertext values**, or a 27×27 square. The p0 header contains exactly **13 printed red runes**. A previous source-constrained but still conditional result pairs these with the authenticated signed 2016 `EPIPHANY SEEKS` (13 GP29 symbols). From the exact original p0 source ciphertext, that proposed plaintext determines the complete 13-symbol GP29 additive residual:

```text
K0 = [26,24,8,19,27,24,18,3,0,8,0,16,19]
```

The already established *H* map is genuinely invertible, with outside-in pair input `(u,v)`, emission `(u−v,u+v) mod29`, and odd center unchanged. As a minimal **value-changing continuation**, process the original 729 ciphertext runes in consecutive 13-value blocks, take the initial K0, then evolve the 13-symbol key once by *H* after each block. A direction rival uses *H-inverse*. Both signs are tested; no source-free secret phases, new key letters, word scores, output fitting or page resets are allowed. These models are distinct from the direct *H* value readouts on isolated source fragments and from the original-key-as-fixed-period13 rule. The source does not explicitly authorize a repeatedly iterated *H* key, so success would require a further independent holdout.

## Full unchanged original, exact replay

The two candidate transformations fixing the title use decryption `P=C−K` with iterated H or H-inverse. On the untouched p0–2 729-rune square:

| Source-inspired keystream | Native-GP p0 black IoC (249 runes) | Entire 729 IoC | Output begins immediately after candidate title |
|---|---:|---:|---|
| Iterate H (minus sign) | **0.03378028** | **0.03414281** | `A A IA X NG O J C J R B L ...` |
| Iterate H-inverse (minus sign) | **0.03465475** | **0.03468171** | `G EO A F AE O O A C A AE IA ...` |

Two opposite-sign controls, which deliberately do **not** reproduce the stipulated title, remain equally near uniform (entire 729 IoCs **0.03409759** and **0.03441791**). The established solved-p57 GP29 input has IoC **0.06270997**. The source-original body outputs remain nonlinguistic and their IoCs are ordinary near the 1/29 uniform baseline.

All four models **re-encrypt all 729/729 untouched original runes** losslessly, and independently encrypt and recover **95/95** native solved-p57 runes under the same source fixed initial 13-symbol key and update rule. Original 262/266/201 physical page lengths and exact K0 are asserted before the inverse. The Windows Node22 original test **passed**.

**Decision:** The strongest conditional p0 red-title key does **not** extend to the 27×27 opening as a straightforward repeated H or inverse-H 13-block key update. This rejects exactly these two simple source-visible state updates. It leaves the original 13-rune conditional title and p28 DH state as structural hypotheses, without supplying a continuous decipherment. The next useful work needs a first-party specified, distinctly different update/receiver, preferably an unknown-page rune holdout predicted *before* selecting its plaintext.