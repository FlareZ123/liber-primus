# Original p36 in the grid's irreducible degree-238 field: worked-DH power test

**Result (12 November 2026; Agent27 additional signed-DH shared-2 gate):** a strictly source-posed exponent-15 power encryption of the original p36 block is **algebraically impossible** in the grid-defined finite field. Four reversible exponent candidates derived from earlier Cicada DH material also produce nonlinguistic **full 238-rune outputs after exact restoration of the printed numeral slot**. The added exponent **1067** is the shared secret in an unsigned participant DH3301 transcript, not an authenticated LP2 instruction. The **shared result 2** in the original signed DH23 example, read hypothetically as a square-power key, is also excluded by an exact finite-field nonresidue certificate. This is a bounded cryptanalytic result, with **no original unknown plaintext, key, or destination recovered**.

## Candidate human-visible route

The printed LP2 pp49–51 table has 256 base60 byte cells. Under the previously source-motivated GF29 polynomial reading, its exact complete factorization is

`28 · (X+5)² · (X²+18X+11) · (X³+14X²+16X+24) · (X⁹+12X⁸+20X⁷+10X⁶+5X⁵+X⁴+9X³+15X+11) · Q238(X)`.

The first five factors have aggregate degree **16**, recalling the source p15 4×4 number square, and the monic remaining factor `Q238` is irreducible over GF29. The source p36 carries **238 runes** and one physical Arabic **1** after rune 99, yielding **239** exactly placed GP29 coefficient positions. Prior [factorization](lp2-grid-complete-gf29-factorization.md) and [p36-1/source-root test](2013-base29-gf29-grid-factor.md) establish those inputs independently of the present cipher hypothesis.

A contemporaneous, signed 2013 Cicada [BASE29 / DH exercise](../resources/external/2013-tcp-server-signed-source.md) teaches modular exponentiation, with a worked DH23 client secret exponent **15**. A later conditional source-link analysis selects exponent **1661** for the DH3301 challenge; 23 itself is also a directly visible number. The same unsigned participant DH3301 transcript gives private-exponent class **e ≡ 11 (mod 550)**; its least positive representative **11** is an additional canonical candidate, although the congruence does not uniquely select an exponent in the much larger extension-field group. The transcript also records shared secret **1067**. Both 11 and 1067 are tested below as low-confidence field exponents: the transcript is not a Cicada-signed session record.

This identifies **one specific finite algebraic transport**, with no arbitrary seed, shifted position, model fitting, alphabet relabeling or English scorer used to choose a candidate. The significant objection is that the 2013 DH exercise is over small prime fields, and the original LP2 manuscript does not expressly authorize this enormous extension field or a DH-power cipher. The degree match and the heading alignment were already observed retrospectively. We therefore test consequences instead of asserting intent.

## Exact source computation

Use the unmodified canonical base60 table, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, as high-to-low coefficients; divide over GF29 by the *already established* five low-degree factors; normalize the residual to monic degree238. The frozen `Q238` leading coefficients (high to low) are `[1,11,15,26,27]` and its first ten low-to-high coefficients are `[5,9,18,5,15,8,11,3,19,21]`. Insert the literal 1 at the original p36 numeral's 99-rune boundary; reduce the resulting 239-position polynomial modulo `Q238`.

Write `y` for this nonzero original-source field element. The multiplicative group has order `N=29^238−1`, divisible by **15**. If the original p36 had been produced by `y=m^15` for any unknown `m`, then it must also be a **cube**, so `y^(N/3)=1`. Exact modular polynomial exponentiation gives the opposite result:

- `y^(N/3)` has **227 nonzero** GF29 coefficients, so it is neither zero nor 1.
- Its low-to-high first 24 coefficients are `[10,26,11,26,0,7,11,10,7,6,15,20,27,4,9,26,16,12,16,10,20,26,2,23]`.
- Therefore **no GF(29^238) element maps to the original p36 block under `m↦m^15`**. This obstruction is independent of plaintext language, score thresholds or unknown secret state.

### Signed-DH shared-secret 2 as a square power: exact obstruction (Agent27, 12 November 2026)

The signed 2013 worked exchange returns **shared value 2** (`DH 23`, client share 19). A deliberately narrow cipher candidate is that the same source-derived field receiver `y` for all 238 p36 runes and the printed numeral 1 was encoded as `y=m²`. This is a *hypothetical transfer* from a DH output to a field-power cipher: the signed protocol treats **2 as a shared numerical result**, without instructing a player to take square roots of Liber Primus.

The inverse has an exact solvability condition independent of English or any fitted key. The field is `GF(29^238)`, with `N=29^238−1`; a nonzero element is square exactly when `y^(N/2)=1`. The unchanged original p36 receiver gives **`y^(N/2)=28=−1 mod29`**, with the other 237 field coefficients exactly **zero**. Consequently **no field element can square to the unchanged original p36 receiver** under this source order and numeral placement. An independent nonzero squared field-element positive plant gives `+1` under the same test. This is a proof of impossibility for the frozen direct square model, rather than a language-score failure.

The shared-2 field-square route is retired. It does not exclude use of 2 as a different key, a secret multiplier before squaring, an alternate receiver, or other encodings. None is source-selected here. The original-input proof and synthetic square control appear in the updated [field-power SFT](../sims/lp2_p36_q238_dh_power_sft.cjs).

### Recovering the exact 238 original GP rune slots

**A necessary correction to the original field-basis diagnostic:** The 239 printed positions carry one **known** Arabic numeral at offset99, and the 238 others are the GP rune receiver. Directly reading the 238 field coefficients as if they corresponded one-for-one to those 238 original rune slots changes the positional representation and silently discards the known-slot constraint. A complete original inverse must reverse the field reduction with **coefficient at ascending power139 equal to the printed numeral 1**.

The monic grid-derived field polynomial has **Q238[139]=27 ≠0**. Writing the reduced output as `y[0..237]`, its omitted source degree238 coefficient is therefore fixed as `a=(1−y[139])/27 mod29`. Restore `P[j]=y[j]+a·Q238[j] mod29` for j=0..237 and `P[238]=a`. This reconstruction places **1 exactly at printed offset99**. Delete *only that known printed numeral* after the field and 239-slot reconstruction, yielding the **entire physical 238-rune GP page**. **The existence of this affine lift is generic, not an unusually strong source coincidence:** Q238 has eight zero coefficients among 238 lower-degree slots (ascending indexes 66,74,76,84,169,172,214,222), so **231 of the 239 possible fixed-numeral printed positions** would admit the same kind of invertible field representation. Offset99 is one of many; it is more constrained by the independent, previously established root24 alignment than by the quotient-field lift itself. This map is an exact invertible affine bijection from all 238 rune positions to the 238 field coordinates. The original p36 source reverses losslessly before any proposed power cipher.

The physical numeral position also has a source-only internal check: the original complete p36 polynomial with numeral 1 at offset99 evaluates to **0 at X=24**; moving it unaltered to printed offsets98 or100 gives **9** or **14**, respectively. This validates the visible insertion as a mathematically distinctive anchor without proving it was intended to select exponentiation.

With this exact **known-numeral-slot recovery**, apply each source-derived exponent to the original p36 field element. **11**, **23**, **1661** and unsigned-transcript **1067** are coprime to `N=29^238−1`, so their inverse exponents exist. Recover all original shaped GP slots after field-power inversion:

| Power exponent | Full p36-shaped 238-rune IoC | First 65 recovered GP runes (transliterated) |
| --- | ---: | --- |
| 23 | **0.033294330390** | `GAEXYEBFOWLXHFHCTXOEXIWWIAREOCTIADGIAEIIATHTHAEMRXYBJMCRHRYIANTBIAPILLAEEOIHTPNG` |
| 1661 | **0.034641704783** | `JAEJPTUSEOYTHDOEONRCXENILIYXNTHTCEOTHSEOMEOUAEGAMFNGTHEPEOTHYOETDJOEEAOEAIAEOIALEAGEA` |
| 1067 (unsigned 2013 DH3301 shared secret) | **0.036698223593** | `EAOERRCYCMABAERSULXOEWXUHNIAAEOEXAEEORDUOIAUIPBWAENAEOEEOILAELTHHFAEDMJAEGODEOWAEAEOEO` |

**Canonical representative 11 of the same unsigned participant exponent class:** the inverse exponent is exact and re-encodes the original field element. After restoring the numeral slot, the full 238-rune output has **IoC 0.032514271531**, below the original p36 value **0.035989079176**. Its first 55 recovered GP runes transliterate to `EADGPFYSBIAEDPDOEDIAEFOEYOENSTHBOHEOBWTHCAETHTHLXSYAAEOETLLCGEARAJOEUW`; the output is nonlinguistic. This is the least positive representative of (e\equiv11\pmod{550}), not a uniquely authenticated extension-field exponent. No other representatives of the unsigned congruence class are searched.

The original physical p36 238-rune IoC is **0.035989079176**. All three source-fixed decoded pages remain cipher-like and unreadable as GP29 prose. For every exponent, forward exponentiation re-encodes the exact original reduced field element; the fixed-slot lifting restores an exact original 238-rune receiver, without insertion edits or concealed symbols.

**A full native GP29 positive control:** Take 238 source solved-p57 runes repeated in source order, insert the literal 1 at exactly offset99, encrypt its 238-dimensional field representative with power23, and decode by the mathematically unique inverse exponent followed by the just-derived 239-position coefficient lift. The result is the **same 238 original native rune indices at every position** and the same native IoC. This establishes full original-shape transport correctness rather than merely field-group reversibility. The 15th-power obstruction remains independent of this recovery representation, because field inclusion is injective.

### Interpretation

The field structure provides a **mathematically complete and lossless candidate codec for a p36 page with a fixed embedded numeral**, with no fitted key. The particular 99-rune heading position is source-visible and has a distinctive root24 alignment; its *field-codec invertibility* is ordinary for most fixed-position headings. The construction could be useful if an authenticated future instruction actually chooses a finite-field power operation. The four source-motivated power inversions tested here (11, 23, 1661 and 1067) recover no original plaintext, and the manuscript has not instructed the reader to interpret the printed 1 as a quotient-field coefficient. The exact root24 insertion alignment is another structural clue, not itself a key selector.

## Decision and next useful input

The signed DH **shared value 2 as a literal square-power encoding** is impossible by Euler's criterion. The **literal fifteenth-power encoding** of the source-arranged p36 polynomial over the original grid's Q238 extension field is excluded outright. The **11**, **23**, **1661** and **1067** reversible power consumers are concrete unsuccessful complete-page 238-rune decryptions, with original numeral position exactly restored. The 1067 test closes only direct reuse of this one unsigned participant-session shared secret as the field exponent. This does not exclude exponentiation after an independently chosen key multiplication, a different source ordering, a different field, or a non-power transport. Such additions require a new original-source instruction; the present arithmetic supplies none.

A plausible future route would need a *separate source-authenticated choice of field operand, exponent and receiver*, or a known plaintext prediction tied to the p36 heading. Another generic exponent sweep would be detached from the human puzzle.

**Reproduce:** [Single-file Node.js 22 CommonJS SFT](../sims/lp2_p36_q238_dh_power_sft.cjs). It reconstructs Q238 from all 256 source bytes, checks original input shape, evaluates the exact 15th-power obstruction, computes all three inverses, reconstructs all 238 GP rune positions, tests wrong numeral placement, and round-trips a complete native-GP planted source without external dependencies. The exact complete source-input CJS also passed [manual Node.js 22 GitHub Actions regression 43269921210](https://github.com/FlareZ123/liber-primus/actions/runs/43269921210), including the 238/238 native-GP plant, literal-root wrong-position controls and all original full-slot inverse assertions.
