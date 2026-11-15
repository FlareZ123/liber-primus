# The terminal red-nine heading has a 24/19/19 polynomial factor, but its direct five-state inverse fails

**15 November 2026, Agent 41.** New original-ink arithmetic relationship and a bounded actual-cipher test. No unknown LP2 plaintext, authenticated key or destination recovered.

## Exact source-visible relationship

Physical p54 begins with nine red GP runes, exactly [24,19,21,23,27,2,14,10,19]. Reading them as descending GF(29) polynomial coefficients gives

R(X) = 24X⁸+19X⁷+21X⁶+23X⁵+27X⁴+2X³+14X²+10X+19.

Exact synthetic division proves

R(X) = (X−24)(X−19)² (24X⁵+28X⁴+2X³+5X²+2X+11) over GF(29).

The complete linear-root inventory is **19 of multiplicity two, and 24 of multiplicity one**. Neither root divides the remaining quintic. The visibly enlarged first p54 rune Ac has GP index **24**, matching the previously established **double root 24 of the original p49–51 numeric-table polynomial**; the independently marked p39 red three-rune polynomial is 15(X−24)². Thus three original, visually distinct objects share the root 24. The new p54 root 19 repeats the GP index of its second and ninth rubric runes. The p54 polynomial does **not** divide the p50 polynomial: their confirmed common factor here is only X−24.

**Additional exact algebraic property:** the displayed quintic, normalized by inverse 24 modulo 29, is the **primitive irreducible** polynomial Q(X)=X⁵+6X⁴+17X³+28X²+17X+21 over GF(29). Its root α=X mod Q generates the entire nonzero multiplicative group of GF(29⁵), whose order is 29⁵−1 = **20,511,148 = 2²·7·732541**. The Rabin irreducibility conditions hold: X^(29⁵)≡X mod Q and gcd(Q, X^29−X)=1. The three prime-factor order witnesses are α^(N/2)=28, α^(N/7)=7, and α^(N/732541)=16+α+28α²+14α³+28α⁴, none equal to 1. Since these are all distinct prime divisors of N, α has **exact order N**, certifying primitivity; the original fixed nonzero five-register seed yields a maximal-period **20,511,148-symbol** LFSR. This is a mathematically stronger property than merely having the same linear root 24 as the table. The pre-established **degree-nine irreducible factor of the original p50 table polynomial** independently has the same more-specialized property: its monic ascending coefficients [11,15,0,9,1,5,10,20,12,1] define a **primitive** polynomial over GF(29). The group order is **29⁹−1 = 14,507,145,975,868 = 2²·7·13·67·41203·14437**. Polynomial modular exponentiation of X modulo this fixed factor gives nonidentity values for each of the six exponents N/p with p in {2,7,13,67,41203,14437}; e.g. N/2 gives 28 and N/7 gives 25. The degree-nine factor's irreducibility was already certified in grid-bigint-factor-page53.md. This newly checked primitive property, alongside the independently primitive p3 red quadratic, suggests an exploratory finite-field motif across source objects, **without a source-selected field-to-plaintext operation**. The conditional creator-intent objection remains unchanged: ordinary random degree-five polynomials can also be primitive, and the source does not specify a finite-field cipher.


This is retrospectively noticed algebra, with **no first-party instruction** to treat rubric text as polynomial coefficients, and no claim of creator intent or corrected statistical significance.

## One fully frozen value-changing inverse

Conditional on this polynomial being a key schedule, removing its three source-specific linear factors leaves the uniquely determined monic quintic

Q(X)=X⁵+6X⁴+17X³+28X²+17X+21.

A human-executable candidate treats the **first five red runes** [24,19,21,23,27] as initial state and extends the degree-five GF29 register by

K[n+5] = −(21K[n]+17K[n+1]+28K[n+2]+17K[n+3]+6K[n+4]) mod29.

Apply P[n] = (C[n] ± K[n]) mod29 to all **223 black p54 + 76 p55 = 299 ciphertext runes**, with continuous clock at the first black rune. No secret phases, word resets, fitted seeds, reorderings or skip choices.

| Source-original output | GP29 IoC | Language evidence |
| --- | ---: | --- |
| Entire 299, minus key | **0.035240510875** | Nonlinguistic |
| Entire 299, plus key | **0.034095755426** | Nonlinguistic |
| p55 76-rune tail, minus key | **0.035789473684** | No GP-native sentence |
| p55 76-rune tail, plus key | **0.032982456140** | No GP-native sentence |

The fully executed subtract-key inverse begins in GP tokens: O R NG IA O O OE C EA J EA EA C J I G F B IA U EA H R R E F F H OE W IA R AE I S A B Y T W T M T IA R W H F J EO P EO L OE N D O R C A P T B AE AE U N X EA A O A I S B A F AE OE EO L N A R H H P C R G. No continuous readable plaintext emerges with the original word boundaries. Both original 299-rune outputs exactly reencrypt 299/299; a distinct known-clear p57 95-rune native GP source cyclically extended to 299 runes, independently planted under the same frozen keys, recovers 299/299 under each sign. Exact re-encryption is automatic for any bijective key, so these are implementation controls.

The **unsupported premise** is that factoring the visibly marked title *instructs* a five-state LFSR. The original source fixes the operands, but supplies neither that opcode nor an encrypted text/key serialization grammar. This experiment deliberately does not rescue it through new clock origins or alternative language fitting.

## Decision

Preserve the exact p54 heading factorization as a conditional source clue. **Retire this particular direct quintic-based additive cipher:** it does not recover the unknown p55 text or any other page. It differs from previously tested numeric-table degree-nine LFSR seeds because its polynomial is the rubric's own quintic quotient and the clock starts after the visible heading. Further development requires an independent original instruction that prescribes a genuine symbol-changing operation.

[Read-only original-source CommonJS SFT](../sims/lp2_p54_red9_triple_linear_factor_source_gate_sft.cjs) pins the source-byte hash, the actual rubric and terminal-page lengths, each polynomial division, the key recurrence, both signs, the full original exact roundtrips and independently planted plaintext roundtrips. No original artifacts are modified.
