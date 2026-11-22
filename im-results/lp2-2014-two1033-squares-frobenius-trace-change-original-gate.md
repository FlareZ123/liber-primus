# Two historical 1033 magic squares encode the same five GP29 CHANGE values through different spectra

**Agent17, 22 November 2026. Evidence: exact source-to-source algebraic relation and three complete negative original-cipher receivers. Status: no unknown LP2 plaintext, no authenticated decoder.**

## A new relation between independently printed 7×7 and 5×5 original source matrices

The historical 2014 OpenPuff-extracted `resources/cicada2014-openpuff-magic-squares.txt` supplies two **different** matrices with row and column sum **1033**: the middle seven-by-seven square `M` and last five-by-five square `B`. The latter is independently visible and encoded as a reversed hex payload in solved LP1 `05.jpg`; that JPEG extraction is [already established prior work](jpeg05-palindromic-magic-square.md) and is not newly claimed here.

The GP29 spectrum of `B` was already found to be the native rune sequence `[5,8,24,21,18]`, an **unordered** multiset spelling the solved LP1 warning word CHANGE, as documented in [the source-matrix reflection and spectrum analysis](lp1-p16-order56-pagepower-gate.md). The new result is that **the unrelated 7×7 1033 square has exactly the same five GP29 values as its complete list of irreducible-factor field traces**, including two factors which are genuinely quadratic over GP29:

\[
\begin{aligned}
\chi_{M}(x)=&(x^2-5x+16)(x-8)(x-24)\\
  &\times(x^2-21x+8)(x-18)\pmod{29}. 
\end{aligned}
\]

Both quadratics have **no GF29 root**. Their conjugate-pair traces in the degree-two extension of GF29 are **5** and **21**. The other three factors are linear with root **8**, **24**, and **18**. The source-local encoding is therefore:

| Source 7×7 irreducible factor | Degree | Trace in GF29 | Native GP value |
|---|---:|---:|---|
| `x² − 5x + 16` | 2 | 5 | C |
| `x − 8` | 1 | 8 | H |
| `x − 24` | 1 | 24 | A |
| `x² − 21x + 8` | 2 | 21 | NG |
| `x − 18` | 1 | 18 | E |

The five trace values are **exactly the five roots of the different historical 5×5 square**, counted once each. The ordering C,H,A,NG,E is chosen using the independently already-printed solved LP1 word CHANGE; **factorization alone gives an unordered set**, and the creator has not told us to use either factorization or this order on LP2.

The cross-square agreement is stronger arithmetic source corroboration for the existing CHANGE relationship. Unlike the previously observed direct 5×5 eigenvalue reading, it also requires recognizing the specific irreducible quadratic structures of the 7×7 matrix. It could still be an incidental result of the square-construction procedure: there is no prior random-matrix baseline, known historical author instruction, or independently recovered ciphertext confirming intent.

## Exact polynomial bridge from the original 7×7 to a CHANGE-spectrum operator

By ordinary Chinese-remainder interpolation over the five **pairwise coprime** monic factors, the **unique polynomial of degree less than seven** that takes the constant values `5,8,24,21,18` on the corresponding factors is

\[
T(x)=19+25x+22x^2+x^3+14x^4+3x^5+3x^6\pmod{29}.
\]

The new seven-by-seven matrix `N=T(M)` is entirely derived from unchanged source entries. It satisfies the exact, testable identities

\[
\chi_N(x)=(x-5)^2(x-8)(x-24)(x-21)^2(x-18)
\]

and

\[
\chi_B(N)=0\pmod{29}.
\]

The second equality is a **cross-dimensional source identity**, not a guessed key search. The original 7×7 has nonzero determinant mod29 and this `N` is invertible. Its full 7×7 literal values and all polynomial checks are constructed by the reproducer.

As a frozen direct-cipher test, apply `N`, `N^{-1}`, `N^T`, and `N^{-T}` to consecutive seven-rune blocks of the entire, original source-complete **p33–39 1,680-rune** chapter. Original-sample output IoCs are respectively **0.0344975751**, **0.0344344706**, **0.0346372557**, **0.0346535636**; authentic native-GP solved p57 has **0.0627099664**. No original output is readable GP prose. All original 1,680 runes forward-reencode exactly under all four; the separately known solved p57 first 91 runes also pass four authentic GP positive plants. This retires only the direct trace-polynomial Hill hypothesis, without a phase/password search.

## Reversible seven-rune field-trace serialization

The factorization also defines a **lossless 7-to-(5+2) source carrier**, without any secret parameter. Interpret a seven-rune original packet as the seven coefficients of `P(x)=c0+c1*x+...+c6*x^6`. Write its remainders modulo the two quadratic factors as `u0+u1*x` and `v0+v1*x`. Read the five original-source factor traces in the externally known CHANGE order:

\[
[2u_0+5u_1,\ P(8),\ P(24),\ 2v_0+21v_1,\ P(18)]\pmod{29}.
\]

Keep `[u1,v1]` as an **explicit two-rune sidecar**. The resulting source-derived 7×7 linear map is

```text
 2  5 22  1  1 18 16
 1  8  6 19  7 27 13
 1 24 25 20 16  7 23
 2 21 19 28  1  0 21
 1 18  5  3 25 15  9
 0  1  5  9 23  0  9
 0  1 21 27 22 14  2
```

It is invertible over GF29, so all original data, including the sidecar, can be reconstructed. The sidecar is essential; **five GP symbols alone cannot losslessly carry arbitrary seven-symbol input**.

Three independently pre-existing **whole original rune chapters** happen to have lengths divisible by seven and were tested as source-constrained receivers. In addition to original coefficient order, the fully reversed seven-coefficient reading is the obvious opposite orientation; neither was selected by original text:

| Original chapter | Source runes | Five-trace channel + two-symbol sidecar | IoC in forward trace | IoC in reversed trace |
|---|---:|---:|---:|---:|
| p8–14 | 1,729 | 1,235 + 494 | **0.0344162363** | **0.0343847401** |
| p33–39 | 1,680 | 1,200 + 480 | **0.0343661384** | **0.0342507645** |
| p54–55 | 308 | 220 + 88 | **0.0334578663** | **0.0345371523** |

The complete GP trace outputs remain random-like and do not resemble a real original manuscript paragraph; the complete two-symbol sidecars are also random-like. This is an important direct rejection of the simple interpretation `original seven rune coefficients → five plaintext trace runes`. No cryptanalysis is rescued by discarding the sidecar. The test also encodes the native solved p57 **95-rune** passage into precisely **133 source-format runes** with 38 sidecar slots set to zero and decodes it **95/95**, proving the exact proposed operator can really transport native prose when constructed for that purpose. Passing a planted transport is not evidence that Cicada used it.

## A source-equivariant physical 7-to-5 intertwiner, with a rank obstruction for direct use

The preceding five-factor identity can be lifted from the *polynomial coefficient carrier* to the physical coordinates of the printed squares. This yields a new bounded test that actually uses **both** source matrices rather than evaluating an arbitrary seven-symbol input polynomial.

First, the original seven-square `M` has GF29 linear eigenvalues only `8,24,18`; its other two factors are irreducible quadratics with traces `5,21`. The original five-square `B` has **distinct** linear eigenvalues `5,8,24,21,18`. Therefore any ordinary five-by-seven GF29 linear intertwiner `X M = B X` has **rank at most three**: two of B's eigenvalues, `5` and `21`, are absent from M's actual spectrum. **A raw one-step 7×7-to-5×5 matrix-equivariant compression is mathematically impossible at full rank.** This is a specific limitation independent of ciphertext.

But the exact source-derived `N=T(M)` from the preceding section **does** have all five eigenvalues, with multiplicities `2,1,1,2,1`. Construct M's canonical seven-dimensional GF29 change of basis using its first RREF free-column vector for each irreducible factor, plus its image under M for each quadratic factor. Construct B's five normalized eigenvectors in the independently already printed solved-LP1 CHANGE word order. Taking genuine quadratic extension-field traces on the two 2D factor spaces while leaving all three linear coordinates intact, and then mapping through B's eigenvector basis, gives this fully source-derived **physical five-by-seven** bridge

```text
L =   22 18 28 21 20 18 19
      10  7  1  2 23  9  7
      19 27 10 25 11 23  2
      14 12 27 19 20 14 11
       2  3  1  0 22  3 28
```

with exact `L T(M) = B L` and `rank(L)=5`. Its missing two extension-field coordinates form a two-rune sidecar; a single 7×7 invertible matrix `D` emits both the five eigenbasis coordinates and those two sidecar runes. The source-derived **5-rune physical candidate** is `L·C_7`, and the full invertible original carrier is reconstructed with `D^{-1}`, including both sidecars. This is a genuine exact original-object relationship; it does not require a plaintext guess. Its deterministic canonical basis convention remains **researcher-selected**, because the original square provides no RREF instruction.

The receiver was frozen before reading outputs. It was applied without discarded source runes to the same three complete **original LP2 seven-rune-aligned** chapters. Their five-channel output IoCs are respectively **0.0343204352** for p8–14 (1,235 output runes), **0.0344523214** for p33–39 (1,200 runes), and **0.0329182233** for p54–55 (220 runes): no GP prose. A different, striking but *not author-selected*, exact source-visible possibility is physical p55 with its **76 rune glyphs plus its terminal red 13-dot mark interpreted as one GF29 symbol 13**, giving 77 inputs = eleven seven-symbol blocks → precisely **55 outputs**, equal to p55's physical page number. The direct output is still nonprose, with IoC **0.0343434343**. A distinct **matching first-bookend** test uses p0's visually verified first **13 red heading runes and immediately following red 13-dot mark**, which, if equally conjecturally converted to one GF29 symbol 13, gives **14 original units = two seven-rune packets → ten five-channel GP runes**. The actual source-only physical operator `L` returns native-GP `S O H A TH | T O H U P` in printed order, which is not a coherent instruction or known original plaintext. The alternative original seven-coefficient factor-trace readout is also nonprose (`TH M U H H | IA AE I EO J`). Neither dot-count-as-symbol rule is authenticated in the manuscript; both bookend coincidences were tested strictly as finite candidates, not transformed into key claims. This one-mark-as-one-rune serialization is conjectural and must not be promoted solely because its lengths align. All three untouched original chapter receivers are losslessly round-tripped including sidecars. A genuine solved-p57 95-rune native source planted into 133 seven-channel source symbols yields **exact 95/95** output with zero sidecar.

**Decision:** the exact `L T(M)=BL` intertwiner is an independently specified, full-rank **physical-source realization** of the Frobenius trace bridge and a stronger mechanistic reason to consider 7→5 packets than raw dimension arithmetic. Nevertheless, neither native GP plaintext nor an actual source instruction selecting it has appeared. Direct original seven-square reduction is rank-obstructed; the trace-polynomial quotient is technically valid but failed its complete original receivers. [Read-only full source SFT](../sims/lp2_2014_sevenfive_physical_intertwiner_original_sft.cjs) · [Windows 11 / Node22 full PASS 45073106675](https://github.com/FlareZ123/liber-primus/actions/runs/45073106675).

## The two original 1033 squares reverse every nonuniform CHANGE mirror sector

One sharper source-only relation is visible once the original **printed palindromic/symmetric spatial layout** is used as an operation in its own right. Both 1033-sum historical squares commute exactly with the coordinate-reversal involution `J_n`, including over the integers before reduction. Their GF29 factor eigenspaces therefore have objectively defined **even** (palindromic) or **odd** (antipalindromic) parity under coordinate reversal.

The physically independent original matrices have this exact factor parity table:

| Shared original-source factor trace | Native GP label | 7×7 source M reversal parity | 5×5 source B reversal parity |
|---|---|---|---|
| 5 | C | **even** (quadratic, 2 dimensions) | **odd** (linear, 1 dimension) |
| 8 | H | **odd** (linear, 1 dimension) | **even** (linear, 1 dimension) |
| 24 | A | **even** (linear, 1 dimension) | **odd** (linear, 1 dimension) |
| 21 | NG | **odd** (quadratic, 2 dimensions) | **even** (linear, 1 dimension) |
| 18 | E | **even** (uniform) | **even** (uniform) |

**All four nonuniform CHANGE factors switch mirror parity between independently printed magic squares.** The common row-sum factor E preserves parity. Because the five original-source factor traces can be grouped by their actual mirror parity before reading any unknown LP2 ciphertext, the familiar word **CHANGE** is also obtainable by alternately interleaving *even/odd factors* of M and *odd/even factors* of B, each factor group in numerical GP-index order, with the unique uniform E last. The alternating reading convention is a researcher hypothesis; no original explicit instruction says “interleave factor parity,” and the factors without an ordering do not themselves spell a written message.

For the exact canonical source-generated physical `L` of the preceding section, every nonuniform eigenmode maps into the *opposite* reflection sector, yielding a second exact **source-to-source operator identity**:

\[
J_5 L+L J_7=21\,\mathbf{1}_{5\times7}\pmod{29}.
\]

Here 21 is the GP29 residue of `2/7` because `7×21≡2 (mod29)`; the `5×7` all-ones matrix on the right captures the **sole unchanged uniform factor**. The full five-row and seven-column identity is tested from original integer squares, with no independent key, unknown plaintext, or guessed digit. For any seven-rune input `v`, the physical bridge obeys `L J_7 v= -J_5 L v+21\sum_i v_i\,\mathbf 1_5`. This describes exactly how a source-visible reversal of seven physical coordinates changes the five-coordinate output. It does not identify which original ciphertext register should be reversed.

**Scope:** This involution is a structurally stronger cross-square relationship than merely having the same row sums or characteristic roots. The underlying source matrices were both already known to be centrosymmetric, and their nonuniform parity sectors are consequences of the original source entries; this observation therefore remains an algebraic fact about supplied squares. A designer may have arranged the reversed parities deliberately, yet there is no authorized LP2 receiver or independent recovered plaintext. The full original seven-chapter receiver remained negative. [Exact mirror-sector assertion plus 5×7 anti-commutator, Windows CI PASS 45073706742](https://github.com/FlareZ123/liber-primus/actions/runs/45073706742).

## All three original 2014 squares form one exact two-operator quotient, but ordinary matrix powers cannot replace the field trace

The **first** authentic historical square, 5×5 **3301-sum** `A`, contributes a nontrivial third source connection. A separate, previously established source computation showed `A^28 = 12 U5 - J5 mod29`. This is exactly a five-dimensional **reflection about the uniform mean**, since 12 is `2/5 mod29`; the exponent28 is Euler's `φ(29)`, a source-prominent totient operation. The new physical source bridge `L` also has **each row summing to1 and every column summing to9 modulo29**. Combine these with the independently computed reversed-parity identity `J5 L + L J7 = 21 U5×7`: the simple calculation `12×9 ≡21 mod29` gives the additional exact **all-three-original-squares identity**:

\[
\boxed{\ A_{3301}^{28}\,L=L\,J_7\quad\text{and}\quad
B_{1033}\,L=L\,T(M_{1033})\ }\pmod{29}.
\]

Thus the *same* original-source rank-five quotient `L` simultaneously transports a literal seven-coordinate reflection to the first 3301 magic square's 28th-power operation, and the original seven-square's Frobenius trace polynomial to the last 1033 magic square's direct operator. The right-hand two source operators preserve the two-dimensional kernel of `L`; the actual invertible `7→5+2` carrier retains its residual coordinates. These identities are derived from all **three printed historical square matrices** and the canonical source-derived factor basis. They are stronger structural evidence than a row-sum match, but the choice of canonical factor orientation and the use of this quotient as a cipher remain **unselected by the author**.

An independent simplicity obstacle limits the most natural replacement for the degree-six CRT polynomial. The untouched original M7 has exact multiplicative matrix order **280** over GF29. Enumerating its **entire** cycle `M^1,...,M^280`, for every power testing the five actual 5×5 source eigenvalues `[5,8,24,21,18]` against the exact GF29 kernels `ker(M^k−λI)`, shows that **no power has all five required eigenvalues**. The maximum simultaneous overlap is **three**, attained at exponents `k=1+28t` for exactly `t=0,...,9`; no `M^k` admits a rank-five intertwiner to B5. In contrast, the source-derived **factorwise Frobenius trace polynomial T(M)** has all five and admits the explicitly constructed `L`. Hence this candidate mechanism genuinely requires a field-factor trace or an equivalent higher-complexity polynomial, rather than merely selecting the right familiar matrix power. This is a meaningful **human-solve-path objection** against treating the mathematically valid quotient as the creator's intended easy next step.

Both all-three identities and the exhaustive 280-power obstruction are asserted in [the exact unmodified-three-square SFT](../sims/lp2_2014_sevenfive_physical_intertwiner_original_sft.cjs), [Windows Node22 PASS run 45074392322](https://github.com/FlareZ123/liber-primus/actions/runs/45074392322). No original LP2 plaintext was recovered by its direct consumers, as documented above. The proper priority remains a first-party instruction or authentic unknown-page text validating this otherwise unconstrained transfer.

## Decision and next discriminating evidence

The 2014 historical **two different 1033-sum magic squares** share the five-letter CHANGE value set in a mathematically specific way that does not depend on LP2 unknown ciphertext. This gives a genuine new exact source relation and a completely reproducible possible reversible operation. Yet the obvious direct original LP2 consumers fail, and source documents do not command factoring the seven-square, taking finite-field traces, reading CHANGE, preserving residual channels, or choosing a particular receiver.

**Retire** direct seven-to-five original LP2 plaintext extraction using this frozen field-trace serialization and direct `T(M)` Hill inverses. Do not expand arbitrary phases, normalizations, word keys, or secret sidecar conventions absent source evidence. A productive next step would be an **independent creator-visible operand/type instruction** selecting a seven-rune input and five-trace receiver, or original archival material supplying a key for a second layer. The new factor identity should be used to judge that evidence, not to retrofit existing phrases.

**Reproducer:** [source-exact Windows Node22 CommonJS SFT](../sims/lp2_2014_sevenfive_frobenius_trace_change_original_sft.cjs), with no external packages. It re-derives both unmodified original characteristic polynomials, both quadratic irreducibility checks, factorwise CRT and complete bridge identities, constructs the exact invertible full seven-carrier matrix, checks all source chapters and positive solved-page transports, and checks four complete original Hill consumers. [Passing full updated Windows original-source run 45071600665](https://github.com/FlareZ123/liber-primus/actions/runs/45071600665).

**Evidence classification:** source-exact algebra and negative original-cipher tests; independently reproducible, no verified unknown LP2 plaintext, no solved destination, no authenticated key or original cipher.
