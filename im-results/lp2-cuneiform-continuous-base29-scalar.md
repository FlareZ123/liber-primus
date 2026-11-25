# Cuneiform chapter as one BASE29 scalar-multiplication register

**Agent28, 25 November 2026. Decision:** exhaustive short-unit scalar key search with genuinely withheld pages. All four independent native-literary plants recover their exact multipliers and directions and all 6,720 runes. The original p33–39 remains nonprose under all tested source-fixed receivers and both independently selected blind winners. No unknown LP2 plaintext, authentic key or destination.

## Source and distinct operation

The repeated cuneiform motif on physical p33–39 conventionally reads 1033 / 3301. The actual 2013 protocol serialized integers in BASE29. This supports testing, but does not authenticate, the hypothesis that the entire 1,680-rune physical chapter is a single fixed-width radix29 integer. [Earlier 1033/3301 multiplication](lp2-word-base29-1033-3301-modmult-gate.md) resets modular arithmetic at each of 2,896 printed groups, unlike the continuous carry here. [P0 title-prime block multiplication](lp2-p0-prime729-base29-modular-product-original-gate.md) uses a different chapter and 13 block resets. Neither earlier negative covers this spacing-independent continuous register.

Freeze all source GP indices including red runes, in physical order, page lengths 214,261,271,238,228,228,240. Let M=29^1680. Decode either P=aC mod M or P=a^(-1)C mod M. Use both conventional most-significant-first (MSB) and the distinct least-significant-first (LSB) digit order, separately. The direct operands are 1033, 3301 and their product 3,409,933. Additionally exhaust all units 1≤a<29³: 23,548 scalar values, plus the product, both directions = 47,098 candidates per orientation. No offset, interleaved map, F exemption, arbitrary added constant, other clock or phase selected.

The exact division recurrence processes least-significant digits first: p_i=((c_i−h_i)*inv(a mod29)) mod29; h_(i+1)=(h_i+a*p_i−c_i)/29, with h_0=0. Multiplication uses z_i=a*c_i+h_i, p_i=z_i mod29, h_(i+1)=floor(z_i/29). Intermediate values are below 100 million for every tested multiplier; no approximate BigInt conversion. Induction shows these are exact modular inverses and carry lies in 0..a−1. This is not digitwise multiplication.

## Predictive experiment

Use only the least-significant five physical pages to select a key and arithmetic direction. MSB-first fits p35–39 (1,205 runes) and withholds p33–34 (475); LSB-first fits p33–37 (1,212) and withholds p38–39 (468). For each independently selected orientation, freeze the winning scalar/direction and actual carry before decrypting its higher-significance two-page continuation. These are two independent receiver evaluations with different development/holdout sets, not a blinded orientation selection over both holdouts. Language scoring is the fixed smoothed native GP29 trigram log-likelihood ratio relative to a uniform rune prior, trained on the nine known-native sections, Gibran and Shakespeare. The four untouched Emerson windows begin at GP offset130000, with 1,680 runes each. Test source scalars and two independently chosen hidden three-digit units, crossing both directions and both orientations.

| Input | Selected scalar / inverse operation | Fit LR nats/rune | Held-out LR | Exact withheld |
|---|---|---:|---:|---:|
| Emerson 0 MSB | 1033 / divide | +0.988653 | +0.980257 | 475/475 |
| Emerson 1 MSB | 19837 / multiply | +1.023399 | +1.011674 | 475/475 |
| Emerson 2 LSB | 3301 / divide | +0.963398 | +0.982501 | 468/468 |
| Emerson 3 LSB | 21421 / multiply | +0.961937 | +1.068035 | 468/468 |
| Original MSB | 23243 / multiply | −1.656377 | −1.870443 | nonprose |
| Original LSB | 6526 / divide | −1.658032 | −1.827573 | nonprose |

All four known correct scalars and directions rank first, all 4,834 development and 1,886 withheld runes are exact, and every chosen complete plaintext exactly re-encrypts. All 12 original source-fixed direction/orientation combinations are nonprose, best fit −1.850444, best heldout −1.481774. The original blind winner scores match the strongest wrong-key candidate scores in the independent positive searches (−1.604 to −1.658). Original MSB frozen carry17278; LSB frozen carry1377. Both exact source replay, but neither genuine language.

## Scope

This is an exhaustive key-domain search under the exact continuous small-unit multiplicative receiver and fixed native-language selection objective, not an exhaustive mathematical language impossibility. No evidence motivates expanding to arbitrary huge multipliers, offsets, independent page resets or other integer operations merely to rescue this model. The source numbers, BASE29 historical protocol and chapter length are real; the multiplication operation, product, and complete-register interpretation are conjectures.

[Single-file CJS](../sims/lp2_cuneiform_continuous_base29_scalar_sft.cjs), commit fb57ed96. Six raw results [0](lp2-cuneiform-continuous-base29-scalar-0.json), [1](lp2-cuneiform-continuous-base29-scalar-1.json), [2](lp2-cuneiform-continuous-base29-scalar-2.json), [3](lp2-cuneiform-continuous-base29-scalar-3.json), [4](lp2-cuneiform-continuous-base29-scalar-4.json), [5](lp2-cuneiform-continuous-base29-scalar-5.json). Run script with index 0–5. Exact core executed in connected JS on repository sources; standalone Node/Windows CI not independently run. One concurrent GitHub conflict during control3 result persistence was retried and resolved.
