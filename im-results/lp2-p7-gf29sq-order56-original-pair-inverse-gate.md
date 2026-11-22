# Source p7 polynomial GF29²: exhaustive 56-state pair-clock original inverse

**Agent15, 22 November 2026. Status: exact conditional original-cipher negative; no unknown LP2 plaintext.** This independent original-cipher consumer extends the p7 red-product/p8 fixed-root relation in [the source discovery](lp2-p7-p8-original-red-polynomial-fixedpoint.md). Execution: [Windows Node22 PASS, run 45048798222](https://github.com/FlareZ123/liber-primus/actions/runs/45048798222).

## Why the manuscript suggests this experiment

Five original wholly red complete p7 words give GP29 index products **[11,26,8,15,2]**. Their ascending polynomial is P(x)=11+26x+8x²+15x³+2x⁴ (mod29). Exactly P(x)−x=2(x−3)(x−4)(x²−8) (mod29). The next p8 red two whole words have products **[4,3]**, its entire GF29 fixed-point set in reverse order; the red heading ends with index17=P'(4). This remarkable relation is source-exact, although both the coefficient convention and cipher operation are still hypotheses.

The factor x²−8 is irreducible over GF29. Its root α has **exact multiplicative order56**, equal to the unsolved p0–55 physical page count. A natural reversible operation would treat adjacent GP29 rune pairs as one element in GF29²=GF29[α]/(α²−8) and multiply by a field unit. This uses an explicit source-derived field and a complete two-rune inverse, instead of a freely guessed multi-round cipher.

For secret nonzero key u+vα, the pair (a,b) encrypts to (c,d)=(ua+8vb,va+ub) mod29. The **exact inverse** is

    (a,b)=(u*c−8*v*d, u*d−v*c) * inverse(u*u−8*v*v) mod29.

Every one of the **840** nonzero GF29² elements has nonzero norm. We tested all 840 candidate secret units, independently for each original page, with both adjacent-pair phases (0/1) and an unchanged leftover edge rune: **1,680 fully reversible original-page decoders**. No plaintext words or cipher scores selected their keys.

## Complete original-page and native-control results

Input is the exact canonical 12,956-rune GP29 corpus and the independent nine-section solved-GP-native source register. For every original page, the reported candidate IoC is the **largest across all 1,680 reversible decoders**. The comparison is the **smallest IoC among every same-length contiguous solved-native section window**, deliberately giving the candidate its most favorable comparison.

| Original page | Runes | Cipher IoC | Best any secret field unit IoC | Min solved-native window IoC | Native windows |
| --- | ---: | ---: | ---: | ---: | ---: |
| p0 | 262 | .03430727 | **.03705654** | .05539469 | 1,325 |
| p9 | 268 | .03345631 | **.03678238** | .05536922 | 1,301 |
| p16 | 267 | .03353890 | **.03812903** | .05536313 | 1,305 |
| p23 | 213 | .03188945 | **.04127912** | .05390203 | 1,521 |
| p40 | 231 | .03335216 | **.03850932** | .05428195 | 1,449 |
| p55 | 76 | .03789474 | **.04561404** | .04561404 | 2,304 |

**All five long, independent original pages miss every same-length native solved window**, even with an arbitrary per-page key drawn from every possible field unit. The short p55 does not yield a strict exclusion because its best exactly equals the native window minimum. The six original page maxima were asserted as exact IoC count numerators [2534,2632,2708,1864,2046,260], so the figures are deterministic and key-exhaustive.

We additionally tested an **exploratory, not universally reversible** transparent-cipher-F filter, prompted by the genuine p56 F exception. By excluding original ciphertext F from pair grouping, then leaving its original position unchanged, the best p0/p9/p16/p23/p40 IoCs are **.04132666/.03921404/.03843879/.03986181/.03963862**. All five remain below all native controls. This additional filter is a conservative sensitivity screen; newly decrypted F would make its clock ambiguous, and it must never be called a complete lossless decoder. For p55 the maximum is .04807018, not an exclusion.

The SFT checks exact original forward reencryption for every original-page winning field unit. An independent 262-rune genuinely solved GP source passage encrypted using a nontrivial field unit decrypts **262/262**. Therefore the principal negative is a working inverse with an exhaustive independent key grant.

## 56 physical-page α power clock

A more source-constrained candidate advances the multiplier by α at every physical page, including rune-free p50, and resets adjacent pairs at each page. All **56** possible initial phases were evaluated on every one of the **12,956** original encrypted runes. The original IoC is **.0344783978645**; the **best** α-clock phase (49) gives **.0344876802392**, essentially unchanged. Algebra explains the lack of mixing: even powers α^(2k)=8^k rescale each coordinate; odd powers α^(2k+1)=8^k α swap/rescale the two coordinates. They do not generate general within-page diffusion.

## Cryptanalytic decision

A fixed-page GF29² paired-field multiplication or division, even granting all 840 secret keys separately per page, cannot be the sole direct inversion to ordinary native-GP English of p0, p9, p16, p23 and p40 under the tested source-aligned pairing and all solved-native controls. The specific globally advancing α^page source clock likewise yields no meaningful original plaintext.

This does **not** exclude a source-identified changing field state within a page, nonlinear update, resegmentation, alternate receiver or separate intermediate register. The original polynomial fixed-root and derivative correspondence itself remains exactly reproducible and potentially meaningful. Its [seven-state nonlinear orbit](lp2-p7-red-polynomial-seven-cycle-original-gate.md) is another unverified and mathematically distinct route.

**Next causal decision:** identify an original physical instruction that selects a specific reversible use of the polynomial or its field root and an actual unknown-page receiver before pursuing more free parameters. The source does not itself say to use the 56-page number as a cipher.

**Reproduction:** [complete Windows11 Node22 CJS SFT](../sims/lp2_p7_field56_original_pair_inverse_sft.cjs) · [Windows CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45048798222). The SFT reconstructs the five original coefficient words and p8 roots, checks all field roots and all 840 units, exhausts both pair orientations on six source pages, tests all 56 global clock phases, compares every solved-native window and roundtrips genuine GP plaintext.
