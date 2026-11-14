# Source factor GF(29^238): p36 field operations and DH3301 exponent-11 stream tests

**Status:** a newly exact table-to-p3 GF(29²) projection through (X+1)^((29^238−1)/840) reproduces the original p3 red quadratic and the signed 2013 BASE29 quadratic, but the direct nonperiodic shifted trace cipher remains negative. Separately, the signed 2013 DH23 exponents 15/6 now additionally match exact original-source GF(29^238) power subgroups on p36 and one p3/p39 orientation; neither a common-base DH equality nor 60 direct root-derived stream inverses recovers plaintext. Earlier original p36/R238 multiplication, source-p36 semilinear keyed Frobenius compositions, exponent-11 inversion, power-11/relative-trace streaming, direct trace-of-powers additive streaming, and frozen DH-share power equalities all give bounded negatives. The original p36 238-rune field element now also has absolute trace **11** and previously established norm **2**, an exact but post-discovery pairing with the signed 2013 BASE29 3301 quadratic-root trace11 and signed DH23 shared value2; source-page controls and direct 238-block field trace/norm readouts below find no plaintext. New source-fixed norms 23/6 for the two marked 119-prefix orders match signed DH23 scalar values, but establish no decoding operation. A newly derived canonical norm of the p36 field element equals the signed DH23 shared secret `2`, and its GF(29²) norm has a precise relation to the p3 red-field generator. The natural pairwise, scalar and EA-key interpretations were tested on untouched original LP2 ciphertext with native-GP positive controls; all are negative. **No unknown plaintext, authentic key or destination recovered.** The norm correspondence is intermediate evidence, not an established cipher instruction.

## Why these are plausible finite operations

The original 32×8 LP2 base60 table, as the degree-254 polynomial of GP29 residues, factors over F29 into explicit small factors times a **unique monic irreducible degree-238 polynomial R238**. Physical LP2 p36 has **exactly 238 GP runes**. Other agents have already rejected interpreting p36 as a direct LFSR output/keystream under R238, and exponent inverses 1033/3301 on p36 itself.

A different fully specified field mechanism is multiplication in the 238-dimensional extension GF(29^238). Set `K` to the p36 source rune indices read as ascending field coefficients modulo R238. Multiplication by K is reversible because K is nonzero in this field. If K were a provided key, the literal cipher `C=K·P mod R238` would produce random-looking 238-rune ciphertext blocks from recognizable plaintext. The same p36/2013 source chain includes a separately reconstructed DH3301 client exponent class `e≡11 mod550` from an unsigned participant transcript; the GPG-verified signed source authenticates the general DH protocol, not this exchange. A separate all-six φ(e) mod29/Wisdom-square selector audit uniquely selects e=1661 under one-based cell indexing (cell 21 = 151, the 36th prime, hence p36). This is page-selection evidence, not a cipher or key. The smallest positive representative 11 is coprime to 29^238−1, permitting the literal test `P=C^(11⁻¹ mod (29^238−1))`, but the new selector does not select this exponent for a stream recurrence.

The two operations test different cipher ideas. A p36 key page and exponent lifting are **hypotheses**; authorial selection is not established.

## Test on exact original inputs

The [single-file reproducer](../sims/p36_grid238_dh11_field_multiplication_sft.cjs) regenerates R238 coefficient-for-coefficient by dividing the original table polynomial by the exact irreducible small factors with degrees 1,1,2,3,9. It uses Node.js BigInt for the exponent and exact polynomial arithmetic mod29. The p36 seed and original 12,956-runic stream come directly from the pinned corpus.

**Multiplication inverse:** Test K and its reversed coefficient orientation. Divide each complete original 238-rune ciphertext block by K in GF(29^238), using either original or reversed input-block coefficient order. The book clock begins at physical p0; a second physically motivated clock begins immediately *after* the 238 p36 key runes, so the key page is never credited as its own plaintext. This yields 54 book-clock blocks or 16 post-p36 blocks per orientation pair, all tested without fitted phase.

| Key/source orientation | Book-clock mean IoC (54 blocks) | Largest book-clock block IoC |
| --- | ---: | ---: |
| K printed; C printed | 0.0346023 | 0.0381520 |
| K printed; C reversed | 0.0346181 | 0.0377265 |
| K reversed; C printed | 0.0344086 | 0.0364500 |
| K reversed; C reversed | 0.0345091 | 0.0373365 |

All post-p36 blocks are likewise below IoC **0.045**; the mean is approximately **0.0343–0.0349**. The original complete ciphertext IoC is **0.0344784**, whereas the planted native-GP paragraph IoC is **0.0675460**. No field-divided original block approaches source GP prose.

**DH exponent 11:** Read p36 as one field element in printed or reversed coefficient order. Invert the fixed exponent 11 and reapply exponent 11 to the output.

| p36 field coefficient order | Decoded IoC | Decoded first 25 GP tokens |
| --- | ---: | --- |
| Printed | **0.0345353** | R D E D IA S B X TH OE L A W U T L M O P H IA R NG M M |
| Reversed | **0.0338262** | F F N F AE A C IA H R U X A I I G G M L P TH L R N P |

Both outputs are nonlinguistic by the same predeclared GP coincidence threshold. For all transformations the original input is reproduced exactly when reencryption is applied. A 238-rune plaintext plant made by repeating the source-solved p57 text is encrypted then recovered **238/238** under every tested inverse. This validates implementation and detection capacity; it does not constitute evidence of an unknown-page decryption.

## Direct p36 semilinear source-key field inverse (Agent 45, 14 November 2026)

**A new complete original-cipher inverse was attempted; no plaintext was found.** The already recovered original numerical table defines a monic irreducible degree-238 factor \(Q_{238}\) over GF29, and physical p36 supplies a **source-visible complete 238-rune key** \(K\). The preceding field multiplier and unkeyed Frobenius studies were *separate operations*. Their genuinely distinct combination provides two classical invertible **semilinear field ciphers**, each directly decoding a complete 238-rune block:

- \(C=\operatorname{Frob}(K\cdot P)\). Reverse using \(P=K^{-1}\cdot\operatorname{Frob}^{-1}(C)\).
- \(C=K\cdot\operatorname{Frob}(P)\). Reverse using \(P=\operatorname{Frob}^{-1}(C\cdot K^{-1})\).

Here \(\operatorname{Frob}(x)=x^{29}\) in \(\mathbb F_{29}[X]/Q_{238}\), which is a 238-dimensional GF29-linear automorphism, and \(K^{-1}\) is computed **exactly by polynomial extended Euclid**, with \(KK^{-1}=1\) at every coefficient. There are no guessed secret parameters. This source construction is a motivated hypothesis rather than a printed author instruction.

Test both original p36 coefficient directions, both original ciphertext coefficient directions, the complete book clock (54×238 unmodified glyphs) and the first rune **after p36** clock (16×238), and both displayed semilinear operations: **16 frozen original-cipher inverses** covering 12,852 or 3,808 glyphs each. For every model the decoded original GP29 symbol IoC remains **0.03442106–0.03452453**, near uniform \(1/29=0.03448276\), and the rune readouts are incoherent. No page plaintext or keys beyond the source p36 element were recovered.

The independent positive control takes the authentic **first 238 native GP29 runes of Gibran**, encodes them under each of the two complete semilinear operations with both original p36 key orientations, then exactly recovers all **238/238** native runes in **all four** plants. A separate Frobenius inversion regression verifies the entire 238×238 field map. Thus the outcome is a genuine negative original-cipher readout under a fully reversible, functioning source-derived decoder, rather than a failure to implement field inversion.

[Source-native Windows Node22 reproducer](../sims/lp2_p36_q238_semilinear_original_sft.cjs) · [successful original-source CI run 43541805434](https://github.com/FlareZ123/liber-primus/actions/runs/43541805434), dispatch-only suite \`semilinear-p36\` in existing p36 field workflow. The runner asserts the full 256-byte table SHA256, every field factor, 238-rune source key, all 16 original readouts and separately generated complete positive plants.

**Decision:** retire these two exact \(K\)-keyed semilinear field inverses as direct GP29 plaintext decoders. A different key, nontrivial stateful field consumer or alternative source-selected carrier remains outside this result; absent a new authored selector, no phase or higher-Frobenius search is justified.

## Fixed 144-byte payload under original p36 field key (Agent 7, 11 November 2026)

The earlier p36/R238 block-multiplication experiment used native-GP language scores. The authenticated historical BASE29 operation supplies a separate, finite *binary* register hypothesis: encode a fixed arbitrary 144-byte payload as one big-endian integer, expand it into 238 base-29 digits, then multiply by the original 238-rune page-p36 key in \(F=\mathrm{GF}(29^{238})\). Since \(256^{144}<29^{238}<256^{145}\), **all** arbitrary 144-byte plaintext frames are representable, whereas arbitrary 145-byte plaintext frames are not. The original field element is interpreted in the same ascending coefficient convention as the red triads. A valid inverse must map **every complete ciphertext block** into an integer strictly below \(2^{1152}\), before any byte contents can be read. This is a source-conditioned necessary condition independent of English scoring or a guessed compression format.

On exact original 238-rune ciphertext blocks, invert multiplication by the original p36 key in either of its two coefficient directions, with either coefficient direction for the incoming blocks. Test a book-start clock (54 blocks) and a strict post-p36 clock starting at global rune **8,944** (16 blocks). Counts of decoded blocks meeting the required 144-byte capacity:

| p36 key coefficients | Original block coefficients | Book start (of 54) | Immediately after p36 (of 16) |
| --- | --- | ---: | ---: |
| Ascending | Ascending | **4** | **0** |
| Ascending | Descending | **1** | **1** |
| Descending | Ascending | **2** | **0** |
| Descending | Descending | **6** | **1** |

The exact inverse and forward field multiplication reproduce **every input 238-rune block**; a source-keyed, independently specified 144-byte ASCII plant recovers all its bytes. No eligible original byte frame begins with any of the eight predeclared gzip/bzip2/XZ/ZIP/PNG/7z/PDF/Zstd headers. The **capacity failures alone** decisively exclude this *particular direct source-key, fixed 144-byte encoding* regardless of language or hidden compression inside a 144-byte frame. They do not exclude 145-byte frames with restricted high bits, variable-length bit packing, a different key or an unobserved cipher layer. The source does not explicitly instruct field multiplication, so this is a narrow inversion gate. [Reproducer](../sims/p36_q238_direct_144byte_transport_sft.cjs).

## Source-anchored three-element norm correspondence (Agent 7, 11 November 2026)

A new exact field calculation strengthens the **source-selected numerical link** between the same three geometrically constrained rune sequences. This is a possible clue, without an LP2 decryption. Let \(Q_{238}\) be the original p50 table's published irreducible factor and interpret each printed GP29 source vector as an *ascending-coefficient* element of \(F=\mathrm{GF}(29^{238})\). The degree-238 field norm is \(N_{F/\mathbb F_{29}}(S)=S^{(29^{238}-1)/28}\). The pair of **119-rune** prefixes is selected from the two uniquely red marked inscriptions at physical **p3:119** and **p39:119**; p36 is an entire **238-rune** source page. No ciphertext plaintext, guessed seed, or secret alphabet is fitted:

| Frozen source vector | Original-length field norm | 2013 DH23 example relation |
| --- | ---: | --- |
| p3 first 119 followed by p39 first 119 | **23** | Signed challenge's modulus 23 |
| p39 first 119 followed by p3 first 119 | **6** | Server exponent 6, uniquely derived from signed \(5^6\bmod23=8\) |
| All p36, printed order | **2** | Signed challenge's computed shared secret 2 |

The third equality \(N(p36)=2\) was independently established earlier in this report by Agent 13; the two prefix-order norms **23** and **6** are the new calculations. Both were independently checked by Euclidean polynomial resultants and modular exponentiation over the full original Q238 field. The self-consistency is exact at every coefficient, not a text-likelihood comparison.

A fixed **1,500-trial source-prefix permutation null** shuffles each original 119-rune prefix separately, preserving each prefix's exact GP29 multiset, then recalculates both order-specific norms with the same field and fixed target values 23/6. Seed 0x7f330123: 56/1,500 shuffled pairs match the first norm, 50/1,500 match the second, and **2/1,500** match both. The conditional add-one tail is **3/1,501 ≈ 0.002**. This is conditional on the chosen construction, numeric targets, and controls; the broader project's historical model search is not included. The three value alignments could therefore still be post-selected numerical coincidences. No printed instruction directly selects the norm, and the 2013 signed source does not mention LP2 or GF(29^238).

A separate original-manuscript comparator preserves the first **119 runes** of every physical unsolved page that contains at least 119 (52 pages), then tests every unordered increasing-page-index pair under the **same** ascending-field-coefficient norm rule. Of **1,326** possible page pairs, **56** have forward norm23 and **48** reverse norm6. Exactly **four** have both: **(3,39), (7,24), (21,31), (23,33)**. The uniquely red-marked pair (3,39) is therefore among several original-manuscript pairs exhibiting the same two scalar values; the equality does not identify the red pair by itself. Its independent source rationale is precisely the red offset119 annotations. This wider comparator further limits any uniqueness or global-significance claim from the 1,500 within-prefix shuffles.

**Decisive cipher gate:** the full field elements do **not** obey DH public-share equalities \(A^{15}=B^6\), \(A^6=B^{15}\), or the secondary participant-example \(A^{11}=B^{331}\) in either coefficient orientation or prefix order. Their coordinate mismatches, documented immediately below, prevent a direct shared secret/key from this reading. The norms may encode scalar annotations, but they do not by themselves determine the reversible LP2 cipher or recover unknown plaintext. Do not launch unrelated norm/trace searches without a separate clue that fixes their values in advance. [Single-file original-source verification](../sims/p36_q238_trace_x_and_dh_shares_sft.cjs).

The same unaltered 119+119 source geometry selects the **canonical quadratic involution** of the 238-degree extension over its fixed 119-degree subfield: \(E\mapsto E^{29^{119}}\), its relative trace \(E+E^{29^{119}}\), and its relative norm \(E E^{29^{119}}\). For each prefix order and each source coefficient orientation, compare these three 238-coordinate outputs directly to p36 in either orientation. All **24** exact original-input comparisons fail, with at most **14/238** matching coordinates. The original p36 element itself has only **5/238** coordinates matching its own conjugate, so it cannot literally be the relative trace or norm of a prefix-derived field element (these would be fixed by the involution). This closes the most natural degree-238 = 2×119 field-conjugation readout without an extra fitted isomorphism or unprovided key. The same SFT implements the full-field exact check.

## Original-source DH-share equality and trace-of-X-power stream (Agent 7, 11 November 2026)

This is a distinct original-input test of the published 238-dimensional field, using **no fitted ciphertext plaintext, state, or variable phase**. Its strongest premise is speculative: if printed p36 is one field public value and the two independently marked 119-rune prefixes preceding p3/p39 red triads supply another, the source-authenticated 2013 DH23 example suggests checking the exponents **6** (server) and **15** (client). The values 11 and 331 come from the separately archived DH3301 participant transcript, where 331 was participant-generated rather than a Cicada-selected exponent. Both constructions rely on the unproven decision to cast GP29 runes into GF(29^238) field elements.

With p36 as \(A\) and the two possible p3/p39 119-prefix concatenations as \(B\), test the exact field identities \(A^{15}=B^{6}\), \(A^{6}=B^{15}\), and, as a weak secondary comparator, \(A^{11}=B^{331}\). Both ascending and descending original coefficient orientation are fixed before examining the answers. The results below count identical coordinates out of **238** and must equal **238/238** to indicate a DH relation:

| Coefficient order | 119-prefix order | A^15 versus B^6 | A^6 versus B^15 | A^11 versus B^331 |
| --- | --- | ---: | ---: | ---: |
| Descending | p3,p39 | 10 | 9 | 10 |
| Descending | p39,p3 | 15 | 12 | 8 |
| Ascending | p3,p39 | 9 | 7 | 5 |
| Ascending | p39,p3 | 11 | 6 | 8 |

**None of the twelve equations holds.** A field exponentiation positive control \( (X^6)^{15}=(X^{15})^6 \) holds coefficient-for-coefficient. This retires these exact two-source public-share readings; it does not exclude a shared secret encoded elsewhere, altered framing, or a genuinely specified key-derivation function.

A second direct source-motivated operation treats the complete original p36 238-rune vector as \(S\in GF(29^{238})\) and uses the quotient indeterminate \(X\) as the field clock. For each runic position emit \(K_i=\operatorname{Tr}_{GF(29^{238})/GF(29)}(S X^i)\), and invert \(P_i=C_i\pm K_i\bmod29\). This differs from the previously tested **power-11 state recurrence**: the state advances by multiplication with the field element \(X\), and the output is the canonical field trace. Newton sums derived from the full original polynomial give the fixed first basis traces \(238\bmod29=6,\ 18,\ 4\). Four unadjusted original full-book cases were tested:

| p36 coefficient order | Subtract trace IoC | Add trace IoC |
| --- | ---: | ---: |
| Ascending | 0.03445646 | 0.03448517 |
| Descending | 0.03455266 | 0.03447779 |

The unchanged original IoC is **0.03447840**; independently recovered native GP prose is typically substantially higher. All **12,956** original ciphertext symbols re-encrypt exactly for each of the four bijective additive candidates, and independent planted solved-page GP symbols also invert exactly. Neither order/sign produces a language-frequency change indicative of authentic plaintext; in particular reencryption is a necessary software invariant, not a key-identification test. The source does not command the trace stream, so this is a deliberately bounded mechanical negative.

[Exact source-based CommonJS single-file test](../sims/p36_q238_trace_x_and_dh_shares_sft.cjs) computes the monic field polynomial from all original 256 table bytes, checks the byte SHA-256, validates the source rune counts, and carries both independent comparisons.

## DH3301 six-representative Wisdom-square selector audit (Agent 7, 11 November 2026)

The separate unsigned DH3301 participant transcript gives the client exponent class e≡11 mod550. The six representatives in the ordinary range 1–3300 are 11, 561, 1111, 1661, 2211, 2761; all reproduce client public share 2800 under base 2757 modulo 3301. The signed 2013 server challenge authenticates the general DH protocol, not this specific participant exchange.

The 2013 Wisdom / 2014 Stage04 5×5 square is transcribed in resources/external/derived/2014-stage04/05-square.txt. Testing the proposed human-solve bridge φ(e) mod29 as a one-based row-major cell number across all six representatives yields cell values 18, 272, 245, 151, 226, 366. Only e=1661 selects a prime-valued cell: cell 21 = 151. Since 151 is the 36th prime and physical p36 has exactly 238 runes (the degree of R238), this gives a discriminating page selector.

This is not a decryption and the bridge is still inferred: neither the signed DH source nor the participant transcript explicitly says to use φ(e) mod29 as a cell address. The convention matters: zero-based array indexing instead leaves two prime-valued alternatives (131 and 199, prime ranks 32 and 46). The printed grid's ordinary one-based cell numbering is the natural human convention, but it must remain an explicit assumption. Full table and reproduction: see im-results/dh3301_phi29_wisdom_square_selector_audit.md and sims/dh3301_phi29_wisdom_square_selector_sft.cjs.
## Power-11 state recurrence and relative-trace output (Agent 30, 11 November 2026)

**Human-solve-path hypothesis.** The p36 page has exactly 238 runes, matching the degree of the unique monic irreducible factor R238 of the original table polynomial. The DH3301 exponent class comes from an unsigned participant transcript, not the signed 2013 source. The all-six φ(e) mod29/Wisdom-square selector audit now selects e=1661 and p36 under the inferred one-based cell rule; it does not select e=11 for a stream recurrence. Treating p36 as S0, iterating S[n+1] = S[n]^11, and emitting the canonical relative trace Tr_GF(29^238)/GF(29)(S[n]) remains a separate, unsupported hypothesis. Its original-cipher test remains negative; do not infer an LP2 key from the selector.

The power map is reversible because 11 is coprime to `N = 29^238 − 1`. The source-fixed clock excludes p36 itself: use the inverse power map to extend **8,706** key symbols backward from the first post-p36 position, then emit **4,012** symbols forward from S0. No fitted phase, reset, coefficient orientation or output projection is used. The Newton-sum trace coefficients are independently checked against the direct Frobenius trace for both S0 and the backward-anchored state; the two implementations agree around the seed boundary.

| Candidate | GP29 trigram score (nats/rune) | IoC |
|---|---:|---:|
| Raw non-p36 ciphertext (12,718 runes) | **−4.146319** | **0.03447201** |
| `P_i = C_i − Tr(S_i)` | −4.156198 | 0.03448689 |
| `P_i = C_i + Tr(S_i)` | −4.178054 | 0.03447899 |
| Held-out native-GP Shakespeare reference | **−2.462215** | **0.05880750** |

The 12,718-symbol key is nearly uniform (IoC **0.03450489**; bin counts 396–501). Both decryptions score below the raw stream and remain ciphertext-like. A 12,718-rune native-GP plant is recovered exactly. The raw key-stream SHA256 is `f1ee9989af5ee270ba3730eac4aac6540cabb1b3d52a7120d35c75911f172e4d`; the monic R238 lower-coefficient array SHA256 is `65cb6ea001c65a85b38d24bca37049c806e52efd24b334fb3ad0d0087213184c`, and the printed p36 seed array SHA256 is `a53ded5a907795ae4c57a2a75bd3fba5a5c7093ac092d40fb7f7f8a7eda91491`.

**Decision:** retire this specific p36-seeded power-11 / relative-trace additive stream. It does not disprove every nonlinear state update or field output, but do not repeat this exponent/trace model or tune its phase. Reproduction: [C++ key generator](../sims/p36_dh11_power_trace_stream_sft.cpp) and [Node scorer](../sims/p36_dh11_power_trace_score_sft.cjs).

## Canonical subfield norm and signed DH23 correspondence (Agent 13, 11 November 2026)

The degree-238 irreducible factor R238 from the original p50 table defines \(F=GF(29^{238})\). Read the 238 original p36 rune indices as the same ascending-coefficient field element \(S\) used by the preceding tests. The canonical norm to the unique quadratic subfield \(E=GF(29^2)\) is

\[
v=N_{F/E}(S)=S^{(29^{238}-1)/840}.
\]

Exact arithmetic gives:

- \(v^{841}=v\), so \(v\in E\);
- \(v^{56}=1\), \(v^{28}=28=-1\), and \(v^8=16\ne1\), so \(v\) has order 56;
- \(v+v^{29}=0\) and \(v\,v^{29}=2\);
- \(v^2=-2\) in \(E\);
- by transitivity, \(N_{F/GF(29)}(S)=2\).

The final scalar is exactly the shared secret 2 in the authenticated 2013 DH 23 worked example. This is not an approximate numerical match.

The p3 red field is \(u^2=3u+8\), with \(z=23-2u\) of order 840 and \(N_{E/GF(29)}(z)=11\). The signed DH23 example supplies client exponent 15; the repeated red stencil count supplies 10. In the subfield basis \(1,v\), the unique one of the two embeddings satisfying the source orientation is \(u\mapsto16+19v\), hence \(z\mapsto20+20v\), and exact arithmetic gives

\[
\boxed{v=10z^{15}}.
\]

The other conjugate embedding gives \(-v\). This explains the same \(X^2+2\) minimal polynomial: \(z^{15}\) has norm 18, and multiplication by 10 changes that norm to \(10^2\cdot18=2\pmod{29}\). The p39 red factor independently has constant \(27=-2\).

A further exact group calculation uses the p3 red root itself as a discrete-log base. In the basis \\(1,u\\), the p3 root is \\(u=(0,1)\\) and the p36 relative norm is \\(v=(19,26)\\). Direct enumeration in \\(E^\\times\\) gives

\\[
u^{705}=v,\\quad u^{840}=1,\\quad u^{420}=-1,\\quad v^{56}=1,\\quad v^{28}=-1,
\\]

so \\(\\operatorname{ord}(u)=840\\), \\(\\operatorname{ord}(v)=56\\), and \\(\\log_u(v)=705\\). The post-discovery factorization \\(705=15\\times47\\) links the signed DH23 client exponent 15 and the 15th prime 47. This factorization is **not** an independent source instruction; no source says to use 705 or 47 as a key index. A single p56 \\(\\varphi(\\text{prime})\\)-clock transfer to p36 at prime ordinals 15, 36 and 705 was tested and failed ([bounded transfer gate](./p36-prime36-p56-totient-transfer-gate.md)).

**Evidence classification and null:** the field norm and displayed identities are exact computational derivations from the original table factor and p36 rune vector. The 2013 DH23 value 2, p3 quadratic, exponent 15, p39 factor and 10-dot marks are source observations. The choice to combine them through this norm is still a hypothesis. For a uniform nonzero field element, the norm to \(E^\times\) is uniform; landing in the two roots of \(X^2+2\) has probability \(2/840=1/420\). This is an interesting cross-round correspondence, not proof of intended use or recovered key.

### Frozen uses of the correspondence

The p3 basis fixes \(z=23-2u\). The p36 norm fixes the first post-p36 state at \(v=10z^{15}\); the 238-rune p36 page is excluded from the target stream. The following small, source-motivated interpretations were tested without fitted phase:

| Operation on the non-p36 stream | GP29 trigram score (nats/rune) |
|---|---:|
| Raw 12,718-rune non-p36 ciphertext | **−4.146319** |
| GF(29²) pairwise additive mask, either sign | −4.170027 / −4.182917 |
| GF(29²) pairwise multiplicative mask, either direction | −4.173347 / −4.180728 |
| Scalar trace/norm readouts of \(z^n\), additive or multiplicative | −4.149838 to −4.172129 |
| EA/log-15 key \(K_i=\log_{15}(2\cdot11^i)=27+3i\bmod28\) | −4.172220 |
| EA/log-15 norm-power key \(K_i=27\cdot11^i\bmod28\) | −4.175757 |
| EA/log-15 norm-power key \(K_i=27\cdot15^i\bmod28\) | −4.171158 |
| Held-out native-GP Shakespeare reference | **−2.462215** |

The pairwise field clock uses \(z^n\), with exponent 15 at the first post-p36 pair and the same clock extended backward before p36. The scalar trace and norm tests use the corresponding one-rune readouts. The three EA schedules use the p36 absolute norm 2, the p3 root norm 11, and the red primitive root 15; their clocks are fixed at the first post-p36 rune. All tested inverses re-encrypt/decrypt their independent native-GP plants exactly. None improves the original stream, and none produces recognizable plaintext.

### The natural 56-physical-page cycle

The exact order of \(v\) is 56, matching LP2's physical page numbers 0–55. This motivated one frozen, no-phase page-key hypothesis: use \(v^p\) as the quadratic-field key on page \(p\), its norm \(2^p\) as a scalar key, and the corresponding EA/log-15 page key \(\log_{15}(2^p)=27p\bmod28\). Page 36 is the seed and excluded from the target; page 50 is the numeric table and has no rune stream. Absolute physical page numbers are retained, so the 54 target rune-pages are not renumbered.

The quadratic pair stream is continuous across page boundaries; the key for each pair is selected by the physical page of its first rune. This produces 6,359 pairs, including 22 pairs crossing a page boundary. All pair/scalar transforms and the page EA schedule pass exact independent native-GP positive plants.

| Source-fixed page-key interpretation | GP29 trigram score (nats/rune) |
|---|---:|
| Raw 12,718-rune non-p36 stream | **−4.146319** |
| Pairwise additive \(C-v^p\) | −4.183299 |
| Pairwise additive \(C+v^p\) | −4.146166 |
| Pairwise multiplicative \(C/(v^p)\) | −4.160070 |
| Pairwise multiplicative \(C\,v^p\) | −4.158521 |
| Scalar shift \(C-2^p\) | −4.140094 |
| Scalar shift \(C+2^p\) | −4.144959 |
| Scalar multiply \(C\,2^p\) | −4.151665 |
| Scalar divide \(C/2^p\) | −4.153366 |
| EA/log-15 page key \(K_p=27p\bmod28\) | −4.172348 |
| Held-out native-GP Shakespeare reference | **−2.462215** |

The \(C-2^p\) score improves on raw by only 0.0062 nats/rune and remains nowhere near native GP; \(C+v^p\) differs from raw by only 0.00015. Neither is a language signal. No output yields recognizable plaintext.

**Decision:** the order-56/page-count correspondence is real, but the natural one-key-per-page scalar, quadratic-field and EA interpretations do not decrypt LP2. Do not extend this family with fitted phases, alternate alignments or arbitrary functions of the page number.

**Decision:** retain the p36 norm as an unexplained, reproducible source-linked algebraic correspondence. Reject the direct GF(29²) pair masks, scalar trace/norm masks, and the three norm-derived EA schedules. Do not turn the exact norm identity into an assertion about authorial intent, or reopen this branch with arbitrary additional projections, powers or phases. Reproduction: [single-file Node.js SFT](../sims/p36_norm_dh23_ea_key_sft.cjs).

## Source-selected p36 element: absolute trace 11 and norm 2 (Agent17, 12 November 2026)

The independently motivated **same original p36 element** in \(F=\mathrm{GF}(29^{238})\) has two scalar invariants: full-extension **trace = 11** and full-extension **norm = 2**. Importantly, **both comparison values arise from the independently recovered *signed* 2013 server challenge**, without relying on the later unsigned participant DH3301 exchange. The original `BASE29 3301 → 3QO` example gives coefficients `[3,26,24]`; normalize the corresponding quadratic by the inverse of24 modulo29 to `H(X)=X²+18X+11`. Its two field roots have **trace −18 ≡ 11 (mod29)**. The same signed challenge's worked `DH 23` example has **shared secret2**, matching p36's previously known norm. This creates an exact pair **(Tr(p36),Norm(p36))=(Tr(root of H), DH23 shared secret)=(11,2)** from two documented signed examples and the original manuscript. Independently, 11 happens to equal the residue class of the reconstructed private exponent in an *unsigned* participant DH3301 exchange; that weaker coincidence is unnecessary for the signed source pair. The act of selecting a 238-degree field trace/norm remains an inferred operation, and no unknown plaintext is fitted.

The input is the canonical 256-byte base60 table, interpreted as the ascending GF29 polynomial and divided by the independently documented degree1,1,2,3,9 factors to produce the monic degree238 irreducible \(R_{238}\). Read the **entire physical p36, exactly 238 runes**, in printed GP29 order as \(A\) in \(F\). Newton power sums compute \(\operatorname{Tr}_{F/\mathbb F_{29}}(A)=11\). An *independent 238×238 multiplication-by-A matrix* has diagonal sum **11** as well; these implementations do not share a trace formula. The Euclidean Sylvester resultant gives \(\operatorname{Norm}_{F/\mathbb F_{29}}(A)=2\), reproducing the prior norm result. Reversing source coefficients gives **trace21 / norm26**, so the precise original rune direction matters.

**Finite original-source comparison:** among **36 physical unsolved pages with at least238 runes**, examine both their first and last original 238-rune windows, in each coefficient direction. These give **144 registered source windows** (some duplicates), with the conjunction trace11 and norm2 **only for p36 printed order**; it appears twice because the full p36 page is exactly238 runes, making its first and last windows identical. Thus the same condition matches **one unique physical page**, not two independent successes. In a source-multiset-preserving reproducible **400-shuffle p36 control** with xorshift32 seed `0x16330611`, trace11 occurs 10 times, norm2 18 times, and both together **0 times**. These are finite controls for this now-selected pair of numbers, not a pre-registered significance claim; the multi-agent search has examined many numeric correspondences.

**Literal plaintext consumer gate:** applying the complete field trace or field norm to consecutive **238-rune original ciphertext blocks from the very first rune** emits **54 GP29 symbols**, not a recoverable page of ciphertext-length plaintext. The first seven original norm outputs are GP indices `[2,7,4,9,22,13,18]` (**TH W R N OE P E**); the first seven traces are `[18,17,24,6,24,15,27]` (**E B A G A S IA**). The full two outputs are nonlinguistic and no source instruction selects such a one-symbol-per-block codec. Direct trace/norm thus supplies no usable plaintext, regardless of the p36 scalar agreement. Previous multiplication, inverse-power and relative-trace cipher tests remain negative.

**Complete reversible-algebra candidate, minimal polynomial:** rather than reducing a 238-rune original source block to only one trace/norm symbol, reconstruct the **entire monic degree238 minimal polynomial of the original p36 element** \(\alpha\) over GP29. The signed 2013 BASE29 challenge explicitly provides a quadratic polynomial example, so polynomial coefficients are a more constrained original-source readout than trying arbitrary field-secret multipliers. Use the Newton power-basis trace, form \(\mathrm{Tr}(\alpha^i)\) for \(i=0,\ldots,475\), and run Berlekamp–Massey over F29 to recover all coefficients from the recurrence. **The recovered minimal polynomial has full degree238**, leading coefficient1, penultimate coefficient18 (trace11), and constant2 (norm2); its complete polynomial **evaluates exactly zero at the original 238-rune p36 field element**, independent of the trace recurrence. Reading its 238 nonleading coefficients as GP29 runes in either order gives **IoC 0.03506719**, close to the original scrambled GP29 distribution rather than native plaintext. The initial 22 coefficient runes are `TH H J AE EO J L I EA R EA AE S L I EO EO S Y I L P`, with no coherent text. This is a complete source-driven polynomial conversion; **it fails to reveal p36 plaintext** and has not been authenticated as Cicada's intended decoder. [Minimal-polynomial original-rune SFT](../sims/p36_gf29238_minimal_polynomial_sft.cjs) checks the exact 238-rune coefficients and full root identity.

**Signed-DH23 Möbius exact bridge and decisive original-input pole gate (Agent17, 12 November 2026).** The original p3 quadratic field fixes \(u^2=3u+8\). The *signed* 2013 DH23 example has server and client private exponents exactly **6** and **15** from the independently stated \(5^6=8\) and \(5^{15}=19\pmod{23}\). Earlier original-p36 relative-norm work fixes \(v=N_{F/GF(29^2)}(p36)=10(23-2u)^{15}=19+26u\). An unexpectedly short, now exact cross-source relation is

\[
\boxed{v=\frac{-6u}{u+15}=19+26u\quad\text{in }GF(29)[u]/(u^2-3u-8).}
\]

Both coefficients **6 and15** come from the same signed 2013 worked exchange, and `u` and `v` were selected from source p3/p36 before this algebraic bridge was recognized. The equality checks directly: \((u+15)(19+26u)=-6u\pmod{29}\). The denominator \(u+15\) has multiplicative **order15**, the numerator \(-6u\) has **order840** and trace/norm **(11,2)**, and \(v\) has **order56**, equal to the physical unknown-page count. Here \(\gcd(15,56)=1\) and \(15\cdot56=840\), so the factorization of orders is exact. The sign, rational form and registration were discovered after the original norm; the mere existence of a compact identity among multiple historical numbers does **not** establish puzzle-maker intent. The LP1 *MOBIUS* word is a general thematic clue, without a printed instruction pointing to this specific function.

A concrete **forward/inverse** historical-operation test follows from the same exact formula: interpret two adjacent GP29 runes as one \(a+bu\) field element and apply the *same* fractional-linear transformation \(f(x)=-6x/(x+15)\) throughout the original manuscript, or its inverse \(f^{-1}(y)=15y/(-6-y)\). Both are invertible on the projective line, but **not defined on all ordinary two-rune inputs**: the forward input pole is scalar \(-15=14\) (GP pair \([14,0]\)), and the inverse input pole is scalar \(-6=23\) (GP pair \([23,0]\)). Across exact original p0–55 ciphertext, the two poles occur respectively **7/7** with book-continuous phase0, **3/8** with book-continuous phase1, **6/6** with page-reset phase0, and **4/9** with page-reset phase1. In both page-reset phases, several poles occur **inside printed words**, so interpreting only original word separators as the projective point at infinity cannot repair this literal direct GP29 pair codec. This is an exact source-only impossibility for the unaugmented two-rune transform under these four natural alignments. An additional explicit infinity escape/transducer would need its own source clue. No unknown LP2 plaintext or effective key follows. [Single-file Möbius-and-poles SFT](../sims/p36_dh23_mobius_signed_original_pole_sft.cjs) asserts the original signer-derived DH exponents, exact field identity, orders, complete corpus pair counts, and internal printed-word pole exceptions.

**Finite totalization and full-source test (Agent17, 12 November 2026).** The projective pole obstruction above is avoidable by a standard, explicit **finite permutation** convention: set \(f(-15)=-6\) while retaining \(f(x)=-6x/(x+15)\) at every other element of \(GF(29^2)\). Its exact inverse sets \(g(-6)=-15\) and otherwise uses \(g(y)=15y/(-6-y)\). The unused finite output \(-6\) is filled by the lone excluded input, so this is an exact 841-element bijection without an escape symbol, secret bit or additional ciphertext. Exhaustive enumeration confirms all 841 inverse identities and the original source identity \(f(u)=19+26u\). The pole by itself therefore excludes the *literal partial-field decoder*, but **does not exclude this finite totalized form**.

The finite totalized direct and inverse maps were then applied without fitted keys to **all 12,956 unchanged original p0–55 rune indices**, as 2-rune \(a+bu\) symbols, under book-continuous and page-local registers, with both natural pair phases (the unmatched first/last rune is copied). All eight decodes roundtrip exactly to the original. The original IoC is **0.0344783979**. The eight output IoCs are **0.0344750019, 0.0344742988, 0.0345346879, 0.0344753117** (book), and **0.0344821632, 0.0344733813, 0.0344812100, 0.0345148720** (page). The maximum across **220** individual original page/phase/direction outputs is **0.0391608392** (p49, n=66); no page-local output exceeds 0.04 or gives coherent native-GP plaintext. Known solved p56/p57 GP-rune sequences roundtrip under both phase conventions. These are original-input negatives for this **fixed, complete Möbius permutation**, not an exclusion of changing projective states or another source-selected register. No human-visible 2014 source is known to select the finite-pole convention. [Standalone totalized Möbius original-input SFT](../sims/p36_dh23_totalized_mobius_original_sft.cjs).

**Complete-field 238-rune transfer (Agent17, 12 November 2026).** The same signed-DH23 constants 6/15 admit a distinct direct decoding test in the **full GF(29^238) field** obtained from the original 32×8 table factor. The polynomial generator \(X\) is **different from the p3 quadratic root \(u\)**, so the exact \(f(u)=19+26u\) relation is **not** an identity for \(f(X)\). This is a separate, weaker transfer hypothesis requiring a 238-rune block clock. Apply totalized \(f(x)=-6x/(x+15)\), \(f(-15)=-6\), and its exact inverse \(g\) to each complete 238-rune original ciphertext block. Registers are (1) book order, **54 complete blocks** with 104 unconsumed trailing runes; (2) after p36 at global rune offset **8,944**, **16 complete blocks** with 204 unconsumed trailing runes. Two coefficient directions and both forward/inverse operations produce **eight original-input decodes**.

The concatenated 54-block GP29 IoCs range **0.03445762–0.03449087**; 16-block post-p36 outputs range **0.03438671–0.03461296**, with maximum individual 238-rune block IoC **0.03815197**. All are nonlinguistic (raw full-book IoC **0.03447840**). Under a different, fixed **144-byte payload per block** interpretation, all output base29 integers would need to fit below \(2^{1152}\): just **1–6 of 54** blocks per byte orientation/direction fit for the book clock, and **0–2 of 16** for the post-p36 clock. Hence no full-register 144-byte model survives this necessary capacity condition. Every original input field block re-encrypts exactly and a planted 238-rune solved p57 GP passage roundtrips. This rejects the declared **constant-coefficient** full-field Möbius mapping on these clocks and the corresponding 144-byte direct-byte models. Further stateful or field-embedding ideas need an independent source selector. [Full-field SFT](../sims/p36_dh23_fullfield_mobius_original_sft.cjs) · [successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/43161213252).

**Decision:** the joint trace11/norm2 match to the *signed BASE29 3301 and DH23 worked examples* makes the existing p36/2013 numeric route more constrained, but **does not establish p36 as a decryption key, authenticate the unsigned participant exchange, or select an encoder for the unsolved text**. Pursue a historical operation that concretely consumes both invariants and predicts an untouched original interval. Do not launch unfixed secret polynomial, norm or trace searches merely because these two scalars coincide. [Complete standalone original-source SFT](../sims/p36_gf29238_trace11_norm2_original_sft.cjs).

## Table-derived canonical GF(29²) projection lands exactly on p3's red quadratic (Agent 21, 13 November 2026)

**New exact cross-artifact identity.** The unmodified original pp49–51 numerical table specifies the monic irreducible `R238` and hence the field `F=GF29[X]/R238`. This field has the unique subfield `GF(29²)`, whose multiplicative group has order `840`. From its standard power-basis element `X`, perform the single explicitly specified field operation

```text
N = 29^238 - 1
u = (X + 1)^(N / 840) mod R238
```

**The resulting element satisfies exactly `u²=3u+8`**. Equivalently `13+23u+2u²=0` in GF29, which is precisely the **original p3 red three-rune inscription** at page-local offset119 when read as ascending polynomial coefficients. Its multiplicative order is 840, so `u` is a primitive element of this degree-two subfield. A second exact derived bridge to the **authenticated 2013 BASE29 3301 → 3QO** worked example is `z=23−2u`, for which `z²+18z+11=0`, the monic form of the 2013 coefficient polynomial `3+26z+24z²`.

**Independence of the field checks.** Once an element satisfies the p3 quadratic, its full multiplicative order 840 follows from that quadratic being primitive. The `z=23−2u` identity is then a deterministic affine change of basis between two known irreducible GF29 quadratics. These verify exact arithmetic and the cited source numerals; they are **not additional independent evidence** that the selected shift or its field projection was intended by Cicada. The shift-1 uniqueness is limited to a retrospectively chosen 29-member `X+c` family; an authorial selector remains missing.

**Discriminating finite choice:** Replace the scalar shift `1` in the projected `X+1` with **every** GF29 scalar `c=0,...,28`, with the source polynomial, exact subfield exponent, target p3 red quadratic and coefficient orientation otherwise unchanged. **Exactly `c=1`** gives a root of the p3 quadratic; the other 28 fail. This is an algebraic identity over the entire original 256-byte table, independent of any language model or chosen substring. Its surprise is conditional on choosing this shift/projection construction after reviewing extensive p3/p36/p50 work; the manuscript has a printed numeral 1 on p36, but no recovered authorial text explicitly instructs `X↦X+1` and `N/840`.

**Original-cipher decision:** The most direct two whole-span additive inverses use the unprojected full-field generator `X+1`: for the **696 unchanged pp37–39** runes, subtract or add the absolute-GF29 trace of successive powers `(X+1)^1,(X+1)^2,...`, starting immediately after p36. Their resulting GP29 IoCs are **0.0343008352** and **0.0348259324**, versus original **0.0344662201**; neither yields native plaintext. The projected `u` is period840, and independent previously recorded all-key 840-period repeated-position inverse exclusions already apply when treating it as an unchanging periodic GP29 mask across the 1,680-rune pp33–39 chapter. Thus the exact table→p3→2013 chain is a **structural source linkage**, with no selected encryption clock, nonperiodic field consumer, recoverable key or plaintext.

[Complete source-exact CommonJS reproducer](../sims/p36_signed_dh15_power_membership_sft.cjs) reconstructs R238 from the unchanged table and checks the p3 relation, signed 2013 quadratic, all 29 shifts and two original pp37–39 inverses. This new identity provides a sharply defined candidate clue chain for future work. Do not tune more shifts, phases or roots against ciphertext; the missing causal input is an independently readable instruction for consuming this field element.

## Signed DH23 exponents as exact original field-power memberships (Agent 21, 13 November 2026)

**Result classification: exact, reproducible source-to-source algebraic correspondence; bounded negative literal inverse; no recovered plaintext.** The authenticated 2013 DH23 example fixes the server exponent **6** and client exponent **15**. Independently, the original p50 256-byte table fixes the irreducible monic degree-238 polynomial `R238` over GF29, and the printed physical p36 supplies exactly 238 GP29 coefficients. These facts prompt a specific reversible field-power interpretation without fitting a secret polynomial.

**Source-format boundary.** The `A` in this subsection uses the **238 GP runes only**, as ascending field coefficients, and deliberately omits the physically printed Arabic `1` after rune99. The separate [complete-p36 literal-numeral codec](lp2-p36-q238-dh-power-gate.md) inserts that `1` in the full 239-position original page and reduces modulo the same `R238`; its resulting field element is **not a cube and cannot be a 15th power**. The subgroup-positive and subgroup-negative statements concern *different encodings* of the same printed source, so neither selects the correct source interpretation or constitutes a lossless full-page decoder without an explicit rule for the numeral.

Write `F=GF(29)[X]/R238`, `N=29^238−1`, and `A` for the *unchanged* physical p36 rune vector in printed order as ascending polynomial coefficients. **Both** `A^(N/3)=1` and `A^(N/5)=1`; since 3 and 5 each divide `N` only once, these two equations are necessary and sufficient for `A` to be an exact **15th power** in `F`. Reversing the physical p36 order does **not** yield a 15th power. A separate source-shaped element, `B=reverse(p39[0:119] || p3[0:119])`, lies in both the square and cube subgroups: `B^(N/2)=B^(N/3)=1`. Therefore **B is an exact sixth power**. Here the first 119 original runes of both pages are independently singled out by their red three-rune inscriptions following local offset 119. The choice to reverse their concatenation was among historically considered readout orientations; it is **not** an author-specified register.

One tempting interpretation fails decisively: `A^6 != B^15` on the original two elements, so their power memberships **do not** reconstruct public DH shares of a common base. Another exact constraint rules out all powers of the canonical polynomial-basis element: `Norm_F/GF29(X)=5` has multiplicative order 14 in GF29×, while `Norm(A)=2` has order 28. Consequently `A≠X^e` for **every** integer exponent `e`. The field root or generator would require a separately selected base.

All **15** roots of `Z^15=A` can nevertheless be constructed without searching plaintext. Put `M=N/15`, `β₀=A^(15^(−1) mod M)`, and `ζ=(X+1)^(N/15)`. Exact computations verify `β₀^15=A`, `ζ` has multiplicative order 15, and every root is `β_j=β₀ζ^j` for `j=0,...,14`. Their coefficient vectors have GP29 IoC **0.03315–0.03890** and no readable original-p36 text. The corresponding direct BASE29-to-byte attempts in the source analysis also provide no recognizable message; no root index or serialization is historically prescribed.

The second exponent can be inverted just as completely. Because the field-group order has exactly three factors of two, form the cube root `C=B^(3^(−1) mod (N/3))`, apply Tonelli–Shanks to obtain one square root of `C`, and multiply by the three cube roots of unity and the two signs. This enumerates **all six** exact sixth roots of the original marked-prefix element `B`; every root replays `Z^6=B` without modifying source runes. Their 238-rune coefficient-vector IoCs are **0.03208878, 0.03343616, or 0.03531539** (each with its sign-paired counterpart), again unreadable as native GP29 prose. This completes the literal root-coefficient family for **both** signed DH exponents and does not select an authorial root key.

To make this a concrete plaintext prediction, hold out all **696 unchanged physical pp37–39 ciphertext runes**, beginning immediately after p36. For each of all 15 roots, clock the consecutive field powers `β_j,β_j²,...`, read either their canonical constant coefficient or their absolute GF29 trace, and add or subtract that stream modulo 29 from the original 696 GP indices. This is **60 complete fixed original-cipher inverses** with a frozen reset, no ciphertext fitting, and no ad hoc key phase. The native-output IoC range is only **0.033961796–0.035305549**, against the original **0.034466220**; no candidate yields coherent plaintext. Independently solved p57 has IoC **0.062709966** as a short native-GP illustration. All roots are exactly verified by 15th-power replay. This negative limits these two literal stream readouts, while the new power-membership facts remain conditional algebraic observations.

**Reproduction:** [standalone source-exact CommonJS SFT](../sims/p36_signed_dh15_power_membership_sft.cjs), which rebuilds the original degree238 factor, asserts the full table byte SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, checks both power-subgroup memberships, constructs every root, and runs the 60 original-source plaintext gates. The numerical match to signed exponents 6/15 is an *after-the-fact* choice made among many investigated page and field structures; a 15th power alone is a one-in-15 property of random nonzero field elements. A cryptanalytic breakthrough still requires an independently recognizable source-selected root, operation, and target text.

## Decision and next useful question

Retire the direct reusable-p36 field multiplier, literal DH3301-exponent-11 inverse, p36-seeded power-11/relative-trace stream, and the natural subfield-norm interpretations documented above. The p36 absolute **trace11** matches the normalized signed BASE29 3301 example's quadratic-root trace, and its absolute **norm2** matches the signed DH23 shared secret; both are source-linked correspondences within the same signed 2013 protocol. The direct pair masks, scalar projections, norm-derived EA clocks and the finite-pole Möbius permutations on 2-rune and full 238-rune registers fail on original ciphertext. Keep this as intermediate evidence; do not promote it to an LP2 key or cipher. A future experiment requires a new independent clue selecting a different reversible operation and specifying exactly which original runes it acts on.
