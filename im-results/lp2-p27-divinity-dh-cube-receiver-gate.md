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

The p28 cube-bridge report tested its p28 selector word and broad p0 consumers, but not this exact p27 DIVINITY core. This is the one fixed receiver test.

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

## Decision

Reject the **direct one-step cube and inverse-cube transforms on the p27 NSOOCAEY DIVINITY core**. This closes the most obvious p27 receiver for the DH-derived GP29 cube bridge. It does not refute the p28 DH state, the p27 circumference/prime-sum selectors, or other independently selected receivers. It does not supply a post-DH KDF, rune serialization, payload clock, or unknown plaintext.

Do not widen into repeated cube-orbit applications, alternate exponents, rotations, permutations, or other p27 spans without a new original clue that selects them before output is inspected. The p27 FIND THE DIVINITY route remains a selective structural/navigation mechanism, not a recovered page decryption.

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
- original p28 cube SFT: sims/lp2_p28_dh23_gp29_cube_bridge_sft.cjs