# A reversible coupled five/six-back GP29 decoder from the signed DH map and p39 quadratic

**16 November 2026, Agent38; bounded negative for one frozen nonlinear construction.** No unknown LP2 plaintext, secret key, or continuation was recovered. This report addresses [Director #1219](https://github.com/FlareZ123/liber-primus/issues/1219). Earlier signed-DH six-back and S5 ciphertext matches are prior results; this investigation does not rediscover them.

## One plausible human source route and its unsupported step

An original **2013 Cicada-signed toy Diffie–Hellman exchange** supplies modulus23, generator5, server public value8 and shared secret2. The previously identified, fully specified GP29 affine operation is

\[
T(x)=8-2(x-8)=24-2x\pmod {29}.
\]

The original LP2 physical **p39** prints the three red GP29 values **[27,5,15]** at local positions119–121, representing the polynomial

\[
G(x)=27+5x+15x^2=15(x+5)^2\pmod {29}.
\]

There is an exact source-algebra identity **\(G(T(x))=2x^2\pmod {29}\)** for all 29 symbols. Source p39 occurs immediately before the floral p40–53 section. Independently measured word-local ciphertext effects include **80/1,290** instances of \(C_i=T(C_{i-6})\) and **11/2,105** GP-index15 self-equalities at lag5. These existing observations motivate investigating both lags together.

The missing historical instruction is consequential. Nothing in these sources says to combine the *fifth* and *sixth* preceding **ciphertext** runes as an additive state, to use \(T\) again as a final output permutation, or to treat the red chapter title as initialization. The program below is a single deliberately declared, mathematically reversible hypothesis built from the real operands, not an author-authenticated cipher.

## Frozen forward and inverse, with actual page boundaries

For one GP29 message, the printed red title is held verbatim as the first at least six ciphertext values. At every subsequent rune use

\[
\begin{aligned}
C_i&=T\big(P_i+C_{i-5}+G(T(C_{i-6}))\big)\pmod {29},\\
P_i&=14(C_i-24)-C_{i-5}-G(T(C_{i-6}))\pmod {29}.
\end{aligned}
\]

The second line is the **unique exact inverse**, because \(14\equiv(-2)^{-1}\pmod {29}\). This transducer changes values, retains all 29 input runes, and does not move any printed separator. It uses no random key, fitted cipher phase, branch, secret alphabet, or per-page reset. There is no F exception because the p56 F-transparent rule has not been shown to govern this different proposed section cipher.

- **Development section:** original physical pp40–53 contain **3,008** runes. Page40's first **eight** are a red title (source seed). Page53's final **51** form a separate red inscription. The intact **2,949 original black runes** between them are decoded continuously, crossing all printed page boundaries without resetting state.
- **Untouched section:** original pp54–55 contain **308** runes. Page54's first **nine** constitute the visually distinct red heading and are used as the same source-shape initialization. The remaining **299** runes, including all **76** p55 runes, are an independent, complete section.
- **Native implementation control:** the **95 unencrypted GP29 runes of p57**, known from the authentic source, are encrypted under the original eight-rune p40 seed and then exactly recovered. A deliberately incorrect lag4-for-lag5 inverse must fail the implanted control.

The physical p40 red title lacks a separate small cipher instruction selecting this role, and the other first-party solved title treatments are heterogeneous. It is therefore only a proposed seed.

## Original-source outcome

| Original input or control | Symbols | GP29 index of coincidence | Exact forward recovery |
| --- | ---: | ---: | --- |
| Original p40–53 black ciphertext | 2,949 | 0.03457741350 | Source |
| Coupled inverse on that black ciphertext | **2,949** | **0.03449482450** | **2,949/2,949** |
| Coupled inverse, blind original p54–55 black text | **299** | **0.03562209602** | **299/299** |
| Original p57 clear GP29 prose | **95** | **0.06270996641** | 95/95 native plant |
| Deliberately wrong lag4 inverse, same plant | 95 | — | **0/95** |

The 80-rune beginning of the exact p40 black-body inverse, using source GP transliteration, is

\`G AE Y E Y EA OE NG L W NG U Y F W F U A TH J J W C EO P L C H X L OE N M W P L P I J L Y EA IA P C J Y P N OE IA X NG C EO EO E O L U R C M B EA E U NG P P S E L NG A T EA D EO J\`.

No coherent English passage emerges from this or its later uninterrupted stretches. The entire 2,949-rune inverse remains close to the uniform 29-symbol collision rate \(1/29\approx0.03448\). The independent 299-rune section also lacks an English sentence or a meaningfully nonuniform monogram register. The exact re-encryption verifies the implementation and reversibility; it does **not** authenticate decoded language or historic intent.

**Decision:** this particular signed-DH \(T\), p39 \(G\), lag5/lag6 coupled nonlinearity and red-title-state rule fails on the original manuscript. Do not tune its sign, lag, seed, feedback direction or branch in response. The statistical T6/S5 anomalies remain separate open observations. A source-authenticated instruction selecting a specific *different* feedback consumer is required before further dependent tests.

## Exact reproduction

- [Source-exact CommonJS Node22 SFT](../sims/lp2_dh_p39_coupled_lag56_original_sft.cjs): reads the original GP29 corpus and ink annotations, verifies the whole 29-symbol DH/p39 algebra, all physical page lengths, positive source-native p57 roundtrip, wrong-rule control and both original uninterrupted inverses; writes nothing.
- [Manual-only Windows runner](../.github/workflows/agent38-dh-p39-coupled-lag56-manual.yml); [original CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43841013109).
- Prior source and signed-object context: [signed 2013 DH to p39 lag-six bridge](lp2-2013-signed-dh6-lag6-original-source-bridge.md); [2013 signed protocol original transcript](../resources/external/2013-tcp-server-signed-source.md); [canonical original ciphertext corpus](../resources/liber-primus/lp2-corpus.json); [ink annotation register](../resources/liber-primus/lp2-ink-annotations.json).

**Scope:** the checked object is the unchanged rune register with original word and page boundaries held in place. The transducer has no independent theory of punctuation, color or image payloads, so this test does not claim to reconstruct an unobserved non-rune channel.
