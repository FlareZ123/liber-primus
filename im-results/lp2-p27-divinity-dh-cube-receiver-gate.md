# p27 DIVINITY core does not decode under the DH-derived GP29 cube

**Agent35, 21 November 2026. Classification: bounded negative on the most directly selected p27 receiver for the DH-derived cube.** No unknown plaintext recovered.

## Why this receiver is worth one fixed test

The p27 instruction parser already selects a specific eight-rune core:

- The p27 body contains the 12-rune word **EORNSOOCAEYEE** at rune offset79.
- Among all **18** complete 12-rune words on unknown physical pages p0–p55, it is the unique word whose whole GP-prime sum is **562**, with **phi(562)=280**, and whose twice-shed interior has GP-prime sum **376**.
- The p57 solved controls are **INSTAR** with GP-prime sum280 and **DIUINITY** with GP-prime sum376.
- Literal twice-shedding of EORNSOOCAEYEE gives the eight-rune interior **NSOOCAEY**.

This is a source-motivated receiver candidate from the p57 instruction **WE MUST SHED OUR OWN CIRCUMFERENCES TO FIND THE DIVINITY WITHIN**. It is not itself plaintext and the checksum matches are not a cipher.

Separately, the p28 DH23 state supplies the candidate GP29 operation. With (p,g,a,b,A,B,K)=(23,5,6,15,8,19,2), the exponent is independently represented by:

- g−K = 3;
- a/K = 3;
- b⁻¹ mod(p−1) = 15⁻¹ mod22 = 3.

Since gcd(3,28)=1, cubing is a reversible permutation on GP29; its inverse exponent is19 modulo28. The p27 red19+13 object also gives H(19,13)=[6,3]=[a,e], but that cross-object check was recognized after the cube candidate and is corroboration, not prospective validation.

The p28 cube-bridge report tested its p28 selector word and broad p0 consumers, but not this exact p27 DIVINITY core. This is the fixed direct-cube receiver test; a separate provisional additive-pad candidate is assessed below.

## Frozen operation

On the eight GP29 indices of NSOOCAEY, apply exactly one of:

\[
P_i=C_i^3 \pmod {29}
\]

or its inverse

\[
P_i=C_i^{19} \pmod {29}.
\]

No rune offset, permutation, key, phase, iteration count, or alternate exponent is searched. Both maps are verified as inverses over all29 residues. The operation is a candidate LP2 field permutation; it is not specified by the signed 2013 TCP protocol as a KDF or payload cipher.

## Result

Input: **NSOOCAEY**, GP29 indices [9,15,3,3,5,24,18,26].

| Operation | Output GP29 indices | Transliteration |
|---|---|---|
| x→x³ mod29 | [4,11,27,27,9,20,3,2] | **RJIAIANLOTH** |
| x→x¹⁹ mod29 | [5,19,18,18,22,7,14,11] | **CMEEOEWXJ** |

Neither output equals the solved p57 target DIUINITY or any complete p57 word. Neither is recognizable plaintext. The transformation is reversible, but reversibility alone does not establish that it is the intended operation or that the selected core is ciphertext.

## Separate provisional additive-pad candidate

The direct cube/inverse-cube result above remains negative. A distinct candidate is now recorded in [`lp2-p27-dh-additive-pad-candidate.md`](lp2-p27-dh-additive-pad-candidate.md), with a source-locked reproducer at [`lp2_p27_dh_additive_pad_candidate_sft.cjs`](../sims/lp2_p27_dh_additive_pad_candidate_sft.cjs).

The signed 2016 message's one-based words20 `their` and27 `numbers` plausibly select p27 word20. Its twice-shed core is `NSOOCAEY`. p28's DH readout and word28 shell, together with p29 word30's H4 packet, supply the values for the candidate pad `[b,g,K,p−1,p+K,g⁻¹ mod p,K,F]=[15,5,2,22,25,14,2,0]`. Subtracting this vector modulo29 maps the core to the expected p57 target `DIUINITY`.

The candidate has useful checksum closures (`sumPrime(key)=309=3×sumGP0(core)=3×103`; `sumPrime(target)−sumPrime(key)=67`, the 19th prime), but the exact serialization order is **not source-fixed**. The pad also fails as a repeated period-8 page key. It therefore remains a local, provisional mapping of an already expected word—not an authenticated KDF, unknown plaintext recovery, or page decoder. The direct cube rejection above is unchanged.

## Decision

Reject the **direct one-step cube and inverse-cube transforms on the p27 NSOOCAEY DIVINITY core**. This closes the most obvious p27 receiver for the DH-derived GP29 cube bridge. It does not refute the p28 DH state, the p27 circumference/prime-sum selectors, or other independently selected receivers. The cube result itself does not supply a post-DH KDF, rune serialization, payload clock, or unknown plaintext. A separate eight-symbol additive-pad serialization is now documented below, but its order is not source-fixed; it maps only the already expected p27 core to DIUINITY and fails when repeated over p27/p29, so no authenticated KDF or page decoder has been established.

Do not widen into repeated cube-orbit applications, alternate exponents, rotations, permutations, or other p27 spans without a new original clue that selects them before output is inspected. The p27 FIND THE DIVINITY route remains a selective structural/navigation mechanism, not a recovered page decryption. The separate additive-pad candidate maps only the already expected eight-rune core and is not a recovered page decryption.

## Reproduction

Run from the repository root:

~~~sh
node sims/lp2_p27_divinity_dh_cube_receiver_sft.cjs
~~~

The source-locked SFT reproduces the unique p27 12-rune selector among the 18 unknown-page words, the p57 INSTAR/DIUINITY controls, the DH exponent and inverse, the two exact outputs, and the full-register round-trip check.

Related evidence:
- p27 source selector: im-results/lp2-p27-find-divinity-operation-gate.md
- p28 DH/cube derivation: im-results/lp2-p28-dh23-gp29-cube-bridge.md
- original p27 selector SFT: sims/lp2_p27_redheading_we_must_shed_sft.cjs
- provisional p27 additive-pad candidate: im-results/lp2-p27-dh-additive-pad-candidate.md
- p27 additive-pad candidate SFT: sims/lp2_p27_dh_additive_pad_candidate_sft.cjs
- original p28 cube SFT: sims/lp2_p28_dh23_gp29_cube_bridge_sft.cjs