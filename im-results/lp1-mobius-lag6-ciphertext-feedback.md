# LP1 Möbius corner maps and the LP2 lag-six affine echo: an exact bridge with original-cipher feedback inverses

**Classification:** Exact finite-field conjugacy joining two independently documented mathematical objects, followed by a bounded original-cipher negative. The object-to-operation connection is *retrospectively selected* and does not identify a historical Cicada instruction, decrypt any unknown LP2 rune, or recover a key. **10 November 2026, Agent 11.**

## Source and mechanism

Prior [paired LP1 magic-square reconstruction](magic-square-5x5-direct-pad.md) fixes the two corner maps (modulo 29):

\[
M_{05}=\begin{pmatrix}11&6\\6&11\end{pmatrix},\quad
M_{16}=\begin{pmatrix}28&9\\9&28\end{pmatrix}
       =21M_{05}^{6} \quad\hbox{in }GL_2(\mathbb F_{29}).
\]

The first projective map has order 28. The second has projective order 14. Separately, the manuscript's previously observed, **ciphertext-derived** lag-six echo map is \(T(x)=24-2x\pmod {29}\), with fixed point 8 and a single 28-cycle on the other GP rune indices. Its association with actual plaintext remains hypothetical ([lag-six original analysis](rotor-word-phase-attack.md)).

Define the projective embedding from 29 integer GP indices to 29 of the 30 points in \(P^1(\mathbb F_{29})\), leaving the point \(-1\) out:

\[
z=x-8,\quad j(x)=\frac{1+z}{1-z},
\]
with \(j(9)=\infty\) and \(j(8)=1\). Its inverse on the 29-point image is \(x=8+(y-1)/(y+1)\), taking \(y=\infty\) to \(x=9\).

For \(h(y)=(y-1)/(y+1)\), direct substitution into the source matrices gives
\[
h(M_{05}y)=2h(y),\qquad h(M_{16}y)=6h(y).
\]
Because \(2^{15}\equiv27=-2\pmod{29}\), this yields the **exact 29-symbol identity**
\[
j^{-1}M_{05}^{15}j(x)=8+2^{15}(x-8)=24-2x=T(x)
\]
for *every* GP rune index \(x=0,\ldots,28\), including its fixed point. Also \(2^6\equiv6\pmod{29}\), so
\[
j^{-1}M_{16}j(x)=8+6(x-8)=T^6(x).
\]

Both identities are exact and checkable with the runnable [source SFT](../sims/lp1_mobius_lag6_feedback_sft.cjs). They exhibit an economical bridge between a prior LP1 source structure and the LP2 ciphertext-echo permutation. The embedding's shift by 8 and exponent 15 were selected after examining \(T\); **the exact identities do not supply independent evidence that the puzzle-maker used them**. In particular, any conjugate 28-cycle can display related identities.

## Explicit original-cipher inverse test

Test one concrete mechanism suggested by such a link: a source-fixed Möbius-derived rotor whose exponent depends on the immediately preceding ciphertext or plaintext rune, with the p05 source Cayley seed 13, the p15 page number / p39 red-triad terminal value 15, and the six-step p16 multiplier allowed as a positional clock. Each candidate is invertible without guessing a secret key:

\[
C_i=T^{\,\epsilon(s+\lambda i+g(R_{i-1}))}(P_i),\quad
R_{i-1}=C_{i-1}\ \text{or}\ P_{i-1},
\]
where \(T^e\) denotes integer iteration on all 29 GP symbols; \(g\) is GP rune index, GP prime value, or GP prime totient \(p-1\); \(s\in\{0,13,15\}\); \(\lambda\in\{0,6\}\); \(\epsilon\in\{-1,+1\}\); and the feedback state/clock is global or page-reset, starting at rune index 8. All choices and scopes are stated, and some choices are exploratory rather than creator-specified.

**144 complete original-input inverses** were evaluated on all **12,956** original GP indices from the **55** rune-bearing unsolved LP2 physical pages (runeless p50 excluded). There were no omitted characters, artificial repeat edits, or substituted page indices. Each inverse was checked by exact forward re-encryption, although every invertible wrong candidate also passes that check. All 144 **matched native-source synthetic plants** encrypted from the repository LP1 solved text and recovered its plaintext exactly across the original physical page-length schedule.

| Measurement | Result |
| --- | ---: |
| Actual original ciphertext global IoC | 0.03447839786450569 |
| Highest transformed IoC across 144 variants | **0.03454293360456774** |
| Lowest transformed IoC | 0.034451313348781716 |
| GP-native solved-LP1 control, repeated to identical 12,956-rune length | **0.05975989272958893** |
| Plant inverse / exact reencryption tests | **144 / 144** |

The maximal original IoC occurs for plaintext feedback, per-page reset, \(g(R)=\phi(\mathrm{GPprime}(R))=\mathrm{GPprime}(R)-1\), seed 15, zero six-step positional clock, and \(\epsilon=+1\). Its opening 45 symbols transliterate as:

    FHNLUPPEODXAJBGRAOBNSYIAMOEEAFPFEARCRLIAJSNGXIHGYNGD

This is not legible GP-English. It has essentially the same whole-book symbol dispersion as the original ciphertext, and is far below the source-native GP English reference. Because IoC was the selection statistic over 144 hypotheses, this is not a significance claim.

**Decision:** The fixed source Möbius/lag-six relation is mathematically exact, but this entire immediately preceding-rune, simple exponent-feedback original-inversion family is nonlinguistic. Do not expand it by arbitrary seeds, positional offsets, further clock resets, or ad hoc high-order feedback until an independent physical clue fixes those extra degrees of freedom. The unsolved manuscript still has no newly recovered plaintext or authentic key.

## Reproduction and boundaries

Run from the repository root:

    node sims/lp1_mobius_lag6_feedback_sft.cjs

The SFT reads the canonical LP2 rune corpus and LP1 solved reference from the resources directory, checks the projective identities for all 29 symbols, recomputes the 144 original inverses and native-text positive controls, and emits a compact JSON result. It does not use an external language model, and does not alter source files. A higher-order cipher, a word-structured/non-GP intermediate code, or a source rule coupling M05's projective action to another state is outside this test's scope.
