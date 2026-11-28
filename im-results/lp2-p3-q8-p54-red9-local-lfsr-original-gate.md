# The Q polynomial does not generate p54's red-nine source or decrypt its terminal chapter

**Agent15, 28 Nov 2026. Two preregistered original-source choices, both negative. No unknown LP2 plaintext recovered.**

## A source-licensed polynomial/seed pairing

The p3 marked red trinomial `f(u)=13+23u+2u²` divides `p15(second red11)−p57(solved red7)` *exactly*, fixing quotient `Q(u)=5+5u+14u²+9u³+10u⁴+4u⁵+27u⁶+17u⁷+25u⁸` over GP29. Q has nine coefficients and degree **eight**. The originally unique held-out red-nine heading is p54 `R=[24,19,21,23,27,2,14,10,19]`. This pairing offers two **genuinely natural** and opposite interpretations, precommitted before opening test values at [the original source-pinned hypothesis](../workplace/lp2-p3-q8-p54-red9-local-lfsr-pretarget.md), [claim commit `c0186d3`](https://github.com/FlareZ123/liber-primus/commit/c0186d3263269d36572aab600a44c46b0fd005ca).

A degree-eight GF29 polynomial can be an order-eight recurrence annihilating a nine-rune window; nine coefficients can instead specify an order-nine monic LFSR seeded with all nine red runes. The two questions were fixed separately, so failure of the exact order-eight relation does not justify silently changing the order-nine generator.

## 1. Exact original red-nine annihilator: fails before unknown plaintext

If the red title is an authentic nine-sample window of the degree-eight recurrence with Q as its polynomial, the exact source-only condition is

```text
Σ[j=0..8] Q[j] R[j] = 0 (mod29).
```

In the original p54 **printed** order, the observed residue is instead **16 mod29**, not0. The ninth printed rune has GP index **19**. With the first eight original runes frozen, the uniquely compelled ninth value would be **23** because inverse(25)=7 mod29. Thus the source red9 is *not* a one-window order-eight Q recurrence; a synthetic perfect-match ninth value23 yields exact remainder0 as a positive algebraic control and is not substituted in the manuscript. The other preexisting p15 red-nine heading also has nonzero Q remainder **19**, supplying a second fixed source control.

This is stronger than a failed text-search: this exact hypothesis is algebraically impossible on unmodified first-party red glyphs without some new operation.

## 2. Literal Q nine-register seeded from p54 red9: full original chapter negative

The alternative complete-nine-coefficient LFSR was fixed before its source outputs:

```text
K[n+9] ≡ -(5 K[n] + 5 K[n+1] + 14 K[n+2] + 9 K[n+3]
          + 10 K[n+4] + 4 K[n+5] + 27 K[n+6]
          + 17 K[n+7] + 25 K[n+8]) (mod29),
K[0..8] = original p54 red9 GP0 indexes R.
```

The first ten *post-heading* source-computed key runes `K[9..18]` are **[13,10,18,15,0,3,5,8,8,1]**. Use each new key rune once, continuously on original p54 black223 followed by p55 76 = **299 ciphertext runes**; the first key value is K9, not K0, and there is no p55 page reset.

| Original full 299-rune receiver | Symbol-collision numerator `Σn_r(n_r−1)` | GP29 IoC |
| --- | ---: | ---: |
| Untouched original ciphertext | 2,984 | 0.033489708424 |
| `C−K` | **3,070** | **0.034454894391** |
| `C+K` | **3,054** | **0.034275324909** |
| Minimum across **1,177 genuine solved-GP299 text windows** | **4,956** | **0.055621647101** |

All values use denominator `299×298=89,102`. Both original full-body outputs are nonprose and well below every same-length authentic native GP29 passage. The reproducible script archives original-p55 end and first80 GP rune outputs and hard-pins both collision counts; it also confirms that each candidate precisely forward-reencrypts the entire source **299/299** and that an independent authentic solved-GP299 encrypted plant under the same two public source streams decodes **299/299**. The failure is in original plaintext, not inverse implementation.

## Decision and nonretuning boundary

The source Q polynomial **neither annihilates the original p54 red nine as the printed order-eight recurrence nor produces plaintext from the adjacent 299-rune terminal section when treated as the complete nine-tap recurrence seeded by that heading**. The p54 red9 and Q field relationship `E(Q)·E(R)=[0,20]` stays exact but alone supplies neither of these key schedules. Do not reverse coefficients, swap seed digits, fit phase, alter register depth or add an unknown output alphabet after these explicit failures; only a separate first-party instruction could license a different use.

[Original-byte independent SFT](../sims/lp2_p3_q8_p54_red9_local_lfsr_sft.cjs) reconstructs Q from exact original p3/p15/p57 slices, tests the two red-nine source residues, the forced synthetic positive, both 299-runic additive inverse tests, all 1,177 solved-GP comparison windows and independent positive plaintext plants. No source file mutation or live target needed.