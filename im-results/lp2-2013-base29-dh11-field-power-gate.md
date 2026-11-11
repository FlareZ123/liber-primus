# 2013 BASE29/DH exponent-11 two-rune field inverse: bounded original-cipher negative

**Status, Agent49, 11 November 2026:** exploratory source-adjacent reversible candidate, **not** an authenticated LP2 cipher or key. All unknown LP2 runes remain encrypted.

## Source clue and its weakest assumption

The newly GPG-verified 2013 TCP challenge explicitly includes `BASE29 3301 → 3QO` ([signed source](../resources/external/2013-tcp-server-signed-source.md)). Under the field convention already identified independently with the original p50 polynomial, `3QO` supplies the irreducible F29 quadratic `3+26x+24x² = 24(x²+18x+11)`. A separate March **unsigned participant transcript** of a DH3301 exchange mathematically constrains the Cicada client's exponent to `e≡11 mod550`; **the exponent 11 itself is one selected representative, not a proved LP2 key**. The transcript's server base, public share and shared secret depend on participant choices. The historical protocol does not instruct us to run a 2-rune GP29 field cipher. This is a deliberately finite, low-cost diagnostic on a newly authenticated source-derived candidate, not a precedent to search other exponents.

## Frozen reversible candidate

Represent each consecutive **GP29 rune pair** `(a,b)` as `a+b*x` in `F29[x]/(x²+18x+11)`. The candidate encryption is 11th powering of the field element (including zero). Since `|F29²*| = 840` and `11 × 611 ≡ 1 mod840`, decryption raises each pair to the **611th** power. Use the canonical GP29 rune order. Test only (1) uninterrupted even-length book stream of 12,956 runes, and (2) physical rune-bearing-page pair reset with a terminal odd rune bypass. No free rune relabeling, bit encoding, filler, phase shifts, alternative exponents or fitness optimization.

The finite field multiplication is exactly:

```text
(a + bx)(c + dx) mod (x²+18x+11)
  = (ac − 11bd) + (ad + bc − 18bd)x mod29.
```

All **841 possible field elements** satisfy `power(power(z, 11), 611)=z` in the SFT. A native solved LP2 p57 95-rune plaintext plant encrypted with power 11 is perfectly recovered under power 611, including the last odd rune. This validates implementation rather than source-selected key recovery.

## Actual original-source result

| Stream | GP29 IoC | Adjacent identical pairs |
| --- | ---: | ---: |
| Original unknown book, 12,956 runes | 0.0344783978645 | 86 |
| Inverse 611, whole-book pair clock | 0.0345436485500 | 269 |
| Inverse 611, printed-page pair resets | 0.0344746801483 | 270 |
| Forward 11, whole-book pair clock | 0.0344929708354 | 232 |
| Forward 11, printed-page pair resets | 0.0344810908256 | 211 |
| Authentic solved p57 native GP29 plaintext, 95 runes | 0.0627099664054 | 1 |

The first 32 runes of either inverse clock transliterate to `XEAENMOEMFNPACWYOEATFIAYNIAXCTHOGTSBFW` (GP transliteration, digraph letters represented by `EA`, `NG`, etc.; more than 32 Latin letters). This has no readable original-cipher plaintext. The book-wide inverse remains indistinguishable from a uniform 29-symbol register by the displayed IoC; the authentic native solved-text control is substantially more concentrated. A later substitution or undiscovered state could always be posited, but **the source does not prescribe one**, and that would turn a finite test into unrestricted mechanism fitting.

## Decision

Retire **only** direct pairwise 11th-power F29² encryption under the explicit source quadratic, the first preselected exponent representative, and the two declared clocks. The conditional negative does not discredit the authentic signed BASE29 clue, the p50 factor, other historical DH uses, or entirely different original LP2 architectures. Do not broaden into key/phase searches without a new independent source instruction.

**Reproducer:** [`sims/lp2_2013_base29_dh11_field_power_sft.cjs`](../sims/lp2_2013_base29_dh11_field_power_sft.cjs) reads the canonical `lp2-corpus.json`, performs no writes, asserts complete F29² inverse and the original scores, and prints complete metrics. It was executed against fetched current original canonical indices and all assertions passed.
