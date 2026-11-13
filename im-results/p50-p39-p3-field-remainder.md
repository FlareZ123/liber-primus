# p50 / p39 / p3 finite-field quotient

## Result

Let P50(X) be the degree-255 polynomial whose descending coefficients are the 256 values in resources/liber-primus/base60-grid.json, reduced modulo 29.

The red polynomial on p39 is

\[
F_{39}(X)=27+5X+15X^2=15(X-24)^2.
\]

The red polynomial on p3 is

\[
F_3(X)=13+23X+2X^2,
\]

so in the quotient field we have \(u^2=3u+8\), a representation of GF(29²).

The following operation is exact:

1. Divide P50 by F39 in GF(29)[X].
2. Reduce the quotient modulo F3.

The remainder is

\[
\boxed{19+13u}.
\]

The element \(19+13u\) has multiplicative order 840, the full order of GF(29²)^\*. It is therefore a primitive element of the field.

The scalar 15 in F39 matters. Dividing only by \((X-24)^2\) gives \(24+21u\); dividing by the full p39 polynomial gives \(19+13u\). The coefficients 19 and 13 coincide with the first rune M/GP19 of the p27 title and its 13-dot separator. This is an observed alignment, not proof of intended use.

Reproduction:

\`\`\`sh
node sims/p50_p39_p3_field_remainder.cjs
\`\`\`

The script checks exact divisibility and verifies the order of the resulting field element.

## Conditional p53 cross-round selector (not an upstream premise)

A previous p27-title/gridfold/p53 construction assigns p53 word26 under the proposed GP-prime-sum-to-page/word mapping; its rune indices are [12,1,17] and its GP-prime weights sum to 105. Closed Issue #129 found no independent source selecting that combined mapping, so word26 is not a source-fixed target.

A later-preserved secondary transcript labels decimal digit reversal/factorization as NUMBER, giving

\[
105\rightarrow501=3\times167.
\]

167 is prime #39, but this is conditional arithmetic only. The contemporaneous February 2013 Twisted witness cited in Issue #71 documents BASE29/DH/NEXT, not NUMBER/COUNT/PRIMES; the surviving NUMBER examples are retrospective, and the archived server implementation is reconstructed. Do not treat this p53 route as an authenticated instruction or independent confirmation of the p3/p39 selector. The exact p50/F39/F3 quotient stands independently of this p53 construction.

## Original visual p33–39 chapter as two full 840-element cycles: keyless two-time-pad gate (Agent41, 12 November 2026)

An independently sourced **840-order** field generator appears above, and the unmodified original-image chapter boundary rule fixes physical **pp33–39** as precisely **1,680 GP29 runes**, two full 840-symbol cycles. This suggests a materially different hypothesis: irrespective of the details of the GF841-to-GP29 output projection, an **additive key that repeats after 840 positions** must cancel when the two original 840-rune halves are subtracted. A key switching sign between the two halves likewise cancels when their ciphertexts are added. This test requires **no guessed key, key phase, field coefficient projection, page-specific alignment or plaintext model for decoding**. Its weakest premise is that the historical source actually intends the original visual chapter as a single repeated-key unit; no such authorial instruction survives.

Using the exact original pp33–39 source-order runes, the 840 first-half minus second-half GP29 differences have **28/840 zero values** and full 29-bin chi-square **32.07143 against uniform**, essentially random-like. Under a source-native GP29 alphabet and the editorial-heading-excluded solved-LP1 English reference, same-position English differences have expected zero count **51.0959** and the original histogram has **chi-square 59.97964 relative to the native model**. Across **all 1,399 overlapping 1,680-rune native controls** available in that 3,078-rune GP-normalized source, the smallest zero count is **34** and the largest same-native chi-square is **38.67556**; the original lies outside both finite control ranges. Under alternating-sign reuse, the 840-position ciphertext *sum* is likewise random-like: **30/840** zeros, **chi-square 78.86094 against the corresponding native-sum model** versus native-control maximum **41.93322**. Reusing an arbitrary secret 840-tap pad on a 1,680-rune actual solved-LP1 GP native plant cancels **exactly** under both same-sign and opposite-sign modes.

**Stronger all-secret period840 result.** The exact **28** equal-symbol pairs are preserved by **any arbitrary secret positionwise GP29 bijection reused at the same position in each 840-rune cycle**, including nonlinear 29-symbol S-boxes and arbitrary affine/repeating-additive masks; equality does not depend on the hidden mapping. The 1,399 native English controls have **34–70** equal pairs, whereas the original has 28. The SFT also plants 840 distinct invertible affine alphabets and verifies this exact equality invariant. The *full difference histogram* adds the stronger test only for additive masks, because numeric differences themselves are not preserved by nonlinear bijections. The original difference histogram is random-like; matching its best 29-way constant shift still gives chi-square **59.75424** against the native difference distribution, above the entire calibrated native range (maximum **38.67556**). This covers even a chapter-half constant additive offset without inventing a preferred phase.

Together these are source-shaped **key-independent exclusions** of a 840-period, positionwise bijective GP29 key on this visual chapter when both 840-rune halves are expected to encode natural GP-English in native order. They include every 840-period GP29 field-generator projection and all stationary secret symbol relabelings. They do **not** reject independent keys for different parts, a non-additive mechanism, a separate 91-rune p33 register, non-native prose, or an original source-clock transition not visible in the chapter map. The native comparison is a finite solved-LP1 reference, not a universal theorem about all English. **No previously unknown rune was decrypted.** [Standalone CommonJS SFT](../sims/lp2_p33_39_period840_twotimepad_sft.cjs).

## What the primitive element does—and does not—establish

The derivation supplies a source-constrained primitive field element rather than an arbitrary guessed key. I tested the most direct interpretations against the LP2 stream and the p27 section:

- \(g^i\) and \(g^{-i}\) as additive or multiplicative field keystreams;
- constant field addition and multiplication by \(g\) and \(g^{167}\);
- discrete-log substitution and power maps with exponent 167 or its inverse modulo 840;
- the p3/p39 119-prefix pair mapped through \(\log_g\), then repeated as a 238-rune Vigenère key on the p27 section;
- the existing Q238/GF841 recurrence with p53-derived seed-lane rotations 16/17 (both 1-based/0-based conventions) and output phases 15, 16, 17, 18, and 105.

None recovered readable plaintext. These are bounded negative tests, not proof that the field element has no intended use. In particular, do not expand into unconstrained field-operation or phase searches without an independent source clue.

The p27 section used for the Vigenère check is the 1433-rune run beginning at p27 and ending immediately before the next 10-dot marker on p32. Its leading rune is M/19; removing that header leaves 1432 runes. The 238-rune key derived from the paired p3/p39 prefixes did not decrypt this section.


## Source-quotient GF(29²) field-projection feedback gate (Agent 29, 11 November 2026; bounded negative)

The exact table quotient supplies the primitive multiplier \(g=19+13u\), while p54's enlarged Ac supplies \(\beta=24\). The p3 polynomial fixes \(u^2=3u+8\). In the source-defined basis \(1,u\), the four elementary maps from GF(29²) to the rune field are the two coordinates \(a,b\), the field trace \(\operatorname{Tr}(a+bu)=2a+3b\), and norm \(N(a+bu)=a^2+3ab+21b^2\). These give a compact candidate state cipher:

\[
c_i=p_i+\epsilon\,\pi(s_i)\pmod{29},\qquad
s_{i+1}=g^{\pm1}s_i+24f_i\pmod{29},
\]

where \(\pi\in\{a,b,\operatorname{Tr},N\}\) and \(f_i\) is either recovered plaintext or ciphertext. The source fixes \(g\), its field, and the visible scalar 24; the state-feedback architecture is a motivated test, not an authenticated instruction.

The original 12,956-rune stream was tested under all four projections, both generator directions, both output signs, continuous-book and physical-page-reset clocks, plaintext and ciphertext feedback, and all 841 initial GF(29²) states: **13,456 inversions per projection, 53,824 total**. Selection used a Shakespeare-trained GP trigram model (first 240,000 characters; 174,998 training runes), with the final 60,000 characters and independent Gibran text as native-English controls. The train/held-out split is physical p0–27 (**6,761** runes) versus p28–55 (**6,195**).

The best training-selected candidate is coordinate \(a\), \(g\), negative output sign, book clock, ciphertext feedback, seed \((28,22)\): training **−8.53818** and held-out **−8.78636** nats/rune. The best held-out score anywhere in the 53,824-model family is coordinate \(b\), \(g\), positive sign, book clock, plaintext feedback, seed \((4,3)\): **−8.58103**. The best trace and norm training candidates score **−8.59048/−8.86209** and **−8.54437/−8.77873**, respectively. Native-GP control windows score **−2.35403 to −2.93073**, so every original candidate remains far outside the language range. Separate 12,956-rune Gibran positive plants recover exactly under all four projections, and the best original candidate re-encrypts all **12,956/12,956** runes.

This rejects the tested source-quotient primitive-field coordinate/trace/norm-feedback family as a direct native-GP decoder. It does **not** reject other output maps, nonlinear state transitions, other source-selected scalars, or non-GP intermediates. No plaintext or authentic key follows. The exact reproducer is [sims/p50_quotient_gf841_feedback_sft.cjs](../sims/p50_quotient_gf841_feedback_sft.cjs).

## Caution about the historical DH material

An exploratory calculation \(31^{167}\bmod1433=1329\), followed by reductions of 1329 into the p50 table, is not an authenticated DH construction. The archived 2013 DH 3301 exchange uses session-specific server parameters; it does not establish p=1433, base 19, value 31, or exponent 167 as a deterministic protocol. Do not promote numerical projections of 1329 to evidence. Likewise, the observed relation \(\log_z(19+13u)=533=550-17\) is not meaningful without an independent source fixing that 550/17 relationship.

## Exact cross-link to the p55 fold matrix

The p55 three-source matrix has characteristic polynomial \((X-21)(X^2-15X+18)\), with its two non-base-field eigenvalues \(u^{83}=18+22u\) and \(u^{727}=26+7u\). The p50 quotient element is not merely another order-840 element: direct field arithmetic gives

\[
g^{127}=u^{83}=18+22u,\qquad
g^{323}=u^{727}=26+7u.
\]

The conjugacy is exact: \(g^{323}=(g^{127})^{29}\), since \(127\cdot29\equiv323\pmod{840}\). The exponents have source-compatible readings: 127 is the last zero-based position of p53's 128-rune black prefix; 323 is p53 word26's final GP rune B/17 multiplied by the p27 red-title length 19; and 83 is the p50 global row-major index of token 3D. The updated reproducer checks these identities from the original grid and corpus inputs.

This is a precise cross-artifact algebraic correspondence. The p55 matrix's irreducible quadratic component has the same characteristic polynomial as multiplication by \(g^{127}\); equivalently, its 2D component is similar over GF(29) to the regular-representation matrix for multiplication by \(g^{127}\) in the p3 basis \(u\). The similarity basis itself is not source-selected. The source exponents are candidate selectors, not proof of intended use.

The simplest direct use—multiplication of fixed adjacent two-rune GP29 pairs by a field element or a period-840 field schedule—is already contained in the all-secret pair-bijection exclusion in sims/lp2_gf841_pair_phase_allsecret_sft.cjs. The literal p55 Hill3 inverse and the one signed-word evolving-matrix state are also negative on their source-marked original spans. No cipher operation, direction or clock is selected, and no unknown plaintext is recovered.

## Direct polynomial quotient as message/key — bounded negative (Agent3, 11 November 2026)

This tests direct interpretations of the source-linked dual-factor relation. The authenticated 2013 TCP-server challenge supplies `BASE29 3301 → 3QO`, whose digits are `[3,26,24]`; the p39 red/DH23 factor is `G=27+5X+15X²`. Their product has leading coefficient 12; its monic normalization is `F(X)=X⁴+28X³+13X²+9X+14` over GF(29).

Read the original p50 base-60 row-major bytes as high-to-low coefficients, reduce mod 29, and divide by `F` in GF(29)[X]. The remainder is exactly `[0,0,0,0]`; the degree-251 quotient `Q` has **252 GF(29) symbols**. This is distinct from the previously reported `P50/G mod F3 = 19+13u` primitive-field remainder and from the earlier 127-pair quotient forcing/multiplier recurrences.

The direct readouts were fixed to source order, without phase, reversal, permutation, padding or extra cipher layers:

1. **`Q` as GP29 plaintext.** The canonical corpus transliteration begins `FEONEATHAEDNGEEANGBBHSNGWNGEWTHSIEEOTHLU...`; IoC **0.03633087**, Gibran-trained GP trigram score **−12.23942** nats/rune. It has no word boundaries and is not readable plaintext.
2. **`Q` as one BASE29 big-endian integer.** The 252 digits form a **1,220-bit / 153-byte** integer. Its first bytes are `0a 21 2d 90 ff 3f 0e 10`; only **45/153 (29.4%)** bytes are printable ASCII and byte entropy is **6.68863 bits**. Its SHA-256 is `2a9f63b2e880a23f5e717f106b1829970ee26712fccf7a0e0d9a1c62bf919819`. No recognized file signature or clear payload appears.
3. **`Q` as the source-authenticated BASE29 numeral string.** Use the exact 2013 alphabet `0123456789ABCDEFGHIJKLMNOPQRS`, which maps the published example `3QO` back to digits `[3,26,24]`. The quotient renders as **252 ASCII bytes**, beginning `0C9S2PNLISLHH8FL7LI72FAIC2K1HJLC92J16NHP3MPN45ONP2KF8I58EO7LF798A2C3RKRD7KJ0LHSQ` and ending `R7CFKJG5PRAGJNI52K6GKP78QEFPLEHH63B8R2K9LDL8RRS679K3OCPGDLDPB539I09NE1QDI2E8RJ46`; SHA-256 `7a629c5caf4b04fc695054646117c6e2fdd925ca492e12f210a02ce249a949d8`.
4. **The two fixed serializations as direct p56 preimage candidates.** The 153-byte integer and 252-byte BASE29 numeral string each miss the exact p56 target under SHA-512, SHA3-512, BLAKE2b-512, SHAKE256(64), and Whirlpool (**0/10**). Whirlpool's `abc` known-answer check passes. Full digest values and the exact target are preserved in [the hash-preimage report](archive-hash-preimage.md#source-derived-p50-dual-factor-quotient-as-p56-preimage-candidates).
5. **`Q` as a repeating additive key.** Repeating the 252 symbols continuously over all **12,956** original unknown runes gives:
   - raw ciphertext: IoC **0.03447840**, trigram **−12.27633**;
   - `C−Q`: IoC **0.03449675**, trigram **−12.28142**;
   - `C+Q`: IoC **0.03448428**, trigram **−12.27338**;
   - `Q−C`: IoC **0.03449675**, trigram **−12.28945**.

   All **50** complete 256-rune output windows for each direction fall below the worst of **88** held-out native-GP Gibran windows (worst native score **−9.13104**). Exact inverse/re-encryption checks pass on all 12,956 original runes.

This is a bounded negative, not a rejection of the algebraic factor relation. The experiment is conditional on the conventional base-60 table interpretation. A pre-2014 MIRACL manual (2007) and Sendmail V8.10–V8.12 (2002) document the exact base-60 alphabet, but no Cicada artifact links p50 to either implementation; base60 is the stronger conventional working interpretation, not authenticated authorial intent. Issue #337's source-use question remains distinct. Retire only the direct GP29 plaintext, the two direct BASE29 serializations as p56 preimages, and the period-252 additive-key reading. No authentic key, plaintext or source-selected parity frame follows.

Reproducer: [`sims/p50_dualfactor_quotient_direct_gate.cjs`](../sims/p50_dualfactor_quotient_direct_gate.cjs).

## Frozen Q252 polynomial-evaluation consumer over the source GF(29²) (Agent32, 12 November 2026)

**Status:** bounded original-input negative, with a native-GP full-length positive plant. The exact source-side relation supplies a 252-coefficient polynomial \(Q(X)=P_{256}(X)/(H(X)G(X))\), and the separate p3 quadratic supplies \(\mathbb F_{29^2}=\mathbb F_{29}[u]/(u^2-3u-8)\). The previously recovered table/p39 quotient element \(g=19+13u\) has order 840. These are fixed original inputs, but the **choice to evaluate Q at successive powers of g and use the values as an additive letter keystream is a new hypothetical decipherment operation**; no original source authenticates that readout.

The frozen experiment evaluates \(Q(g^i)\) using the canonical ascending polynomial coefficients and original field basis, with no fitted seed, phase, shuffle, password, output alphabet or ciphertext-key feedback. It emits one GF29 rune per point by four standard fixed projections: constant coordinate \(a\), \(u\) coordinate \(b\), trace \(2a+3b\), and norm \(a^2+3ab-8b^2\). Each of the four streams repeats after 840 characters, and each is tested with sign ± on the complete unmodified **12,956-rune** unknown LP2 original under the continuous-book and original-physical-page-reset clocks. These are 16 fully specified additive inverses, with exact forward reencryption.

A Gibran *Prophet* native-GP trigram model is trained on the first 70% of its 62,696 normalized runes and evaluated independently on the remaining 18,809 (heldout score **−8.33528** nats/rune). The original scores **−12.87659**. The **best** of all 16 transformed originals, coordinate \(a\), physical-page reset, positive sign, scores **−12.85142**, GP29 IoC **0.034489**; across the 16 proposals scores span **−12.92938 to −12.85142**, and IoC spans **0.034450 to 0.034517**, indistinguishable in linguistic terms from the original ciphertext (IoC 0.034478). Every proposal stays far below the native holdout language score. A 12,956-rune native-GP plant matching the original page lengths recovers and re-encrypts exactly under **all 16** configurations, establishing implementation correctness without identifying historical encryption.

The full 16-projection original-and-native-positive test passed a [manually dispatched GitHub Actions run 43271198022](https://github.com/FlareZ123/liber-primus/actions/runs/43271198022) using Node.js 22, with all other workflow probes skipped. The exact SFT includes source-image-adjudicated 256-byte stream SHA verification, Q252 zero remainder, all 16 round trips, native GP plants, and linguistic separation.

The polynomial identities are verified exactly, the original byte-stream SHA-256 is pinned, \(g^{840}=1\), and the experiment has no discretionary key fitting. This **rejects this finite, unshifted Q252-polynomial-evaluation additive-key family** as a direct English-GP29 decoder of the original book. Other operations on Q, non-additive readouts, external sources and hidden-key mechanisms remain open. No plaintext, authentic key or endpoint was found. [Reproducer](../sims/p50_q252_gf841_polynomial_eval_sft.cjs).

## Literal base60 versus f-skipping base59 factor discriminator (Agent 3, 12 November 2026)

The original physical pp49–51 table prints 256 two-character numeral tokens, not authenticated binary bytes. The conventional digit alphabet `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx` has 60 characters; the unused lowercase `f` also allows a specific competing 59-character alphabet with that character removed. This is the **one** historically discussed base59 alternative, with a fixed alphabet and no free offset, symbol substitution or fitting. Its precise consequences can be decided by arithmetic.

Read the original 32×8 tokens in printed row-major order, with each token `XY` equal to `base·index(X)+index(Y)`. Interpret those 256 integers as the **descending coefficients** of a degree-255 polynomial over GF(29). Use the two already documented, independently sourced factors in their printed order:

- `H(X)=3+26X+24X²` from the authenticated 2013 signed TCP example `3301 → 3QO`, treated *conditionally* as a quadratic.
- `G(X)=27+5X+15X²` from the original p39 red numbers, likewise treated as a polynomial.
- Their product is `F(X)=23+21X+11X²+17X³+12X⁴` over GF(29), or monic `14+9X+13X²+28X³+X⁴`.

| Frozen interpretation | P mod H | P mod G | P mod F |
| --- | --- | --- | --- |
| Conventional 60-character digit alphabet | `[0,0]` | `[0,0]` | **`[0,0,0,0]`** |
| Exactly the same tokens with lowercase `f` removed (base59) | `[20,17]` | `[22,12]` | `[8,19,1,7]` |

A predeclared **matched source-number control** uses the other p33 cuneiform label, 1033, which the same historical BASE29 convention renders as `16I` and would provide polynomial `1+6X+18X²` if treated identically. Its remainder is **`[3,24]` under base60** and `[8,21]` under base59; thus the exact factor coincidence is specific to the originally demonstrated 3301 example, rather than any printed p33 number. The interpretations change **220/256** cell values. Reversing the **complete** coefficient list instead of using source-order descending coefficients fails both radices: product remainders are `[25,8,18,24]` in base60 and `[14,9,27,24]` in base59. A fully prespecified degree-four divisor would divide a uniform random GF29 polynomial with probability `29⁻⁴`, roughly 1.41×10⁻⁶, but these factors and the polynomial model were noticed retrospectively; that figure is **not** a valid significance test for author intent.

**Decision:** exact divisibility jointly supports the *conventional base60, row-major, descending-coefficient* working parse over the specific base59 alternative, independently of any language score. This materially narrows which numerical interpretation to prioritize in future source-selected polynomial investigations. It does not establish that Cicada intended the quadratic reading, exclude all potential nonstandard radices, or produce a rune/plaintext inverse. Earlier quotient and feedback negatives above remain conditional on this base60 reading.

[Source-exact CommonJS SFT](../sims/p50_radix59_vs60_factor_gate_sft.cjs).

**Extension across every originally marked red inscription (Agent47, 13 November 2026).** The original ink annotations list **18 red spans** across the unresolved manuscript. Each source span's exact GP29 indices was independently matched against the source corpus, then tested as a GF29 polynomial in both printed-source directions: **36 complete tests per digit alphabet**. Under the conventional base60 table the **only** original marked factor is the previously known p39 red triple at local offset119, forward (1/36). The competing f-deleted base59 table has **zero marked factors (0/36)**. The original signed 2013 factor H also divides only the base60 source. This strengthens the bounded source-family interpretation, but the radical mathematical interpretation was already established by **Agent3 on 12 November**, and the red-span divisor's previous uniqueness under base60 was established in an earlier source SFT. The new addition is the complete **base59 red-family holdout**. The same original [CJS SFT](../sims/p50_radix59_vs60_factor_gate_sft.cjs) now asserts all 36 against both radices; the standalone previously duplicated comparison has been consolidated into this section. All claims remain conditional on the creator actually intending the GF29 polynomial model.


## Current assessment

The exact quotient `P50/F39 mod F3 = 19+13u` is reproducible and has an exact p55-matrix eigenvalue correspondence. Its direct power, discrete-log, pair, and source-quotient coordinate/trace/norm-feedback interpretations remain nonlinguistic under the bounded original-input tests documented above. The separate dual-factor polynomial quotient `P50/(H·G)` gives 252 GF29 symbols. Its direct GP plaintext, both direct BASE29 serializations as p56 preimages (0/10 across five 512-bit families each), and period-252 additive-key readouts are all negative. The pre-2014 MIRACL and Sendmail sources strengthen base60 as the conventional alphabet, but do not authenticate Cicada's use of it on p50. The p53/2013 NUMBER selector remains a hypothesis; no source instruction selects a parity frame, transfer or tested trace-feedback architecture.

A single source-visible transfer was also tested: apply the p40 red-heading's sorted 8-column order [0,4,7,1,2,5,6,3] as a standard columnar readout of the p50 32×8 table, then treat that sequence as descending GF(29) polynomial coefficients. This breaks the p39 repeated-root factor at the first division by X−24: the remainder is **26**, whereas physical row-major order gives **0** and continues to divide exactly. The p40 column key therefore does not preserve the p50/p39 polynomial bridge under this natural columnar transfer. This is one fixed source-selected negative, not a permutation sweep; it does not prove the physical row-major order was intended as a cipher consumer.

Retain the algebraic relations as intermediate evidence; no plaintext, authentic key or intended operation is established.

Related work:
- results/README.md — authoritative p3/p39 polynomial and current synthesis
- im-results/p27-title-gridfold-p53-closure.md — source of the selected p53 word26
- im-results/2014-magic-square-direction-map.md — historical NUMBER/DH context
- im-results/lp2-q238-119prefix-lfsr-seed-test.md — prior Q238/GF841 recurrence work
- sims/grid_bigint_factors.cjs — p50 table polynomial construction
