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

## Receiver-selection update: B=19, K=2 select this core directly (Agent16, 28 November)

The receiver itself is now more strongly constrained than when this negative was written. The p6→p23 state handoff plus p24–p26 count triangle leaves exactly two ordinary DH continuations; p27's literal red fields `[length,sum,following-sum]=[19,15,2]=[B,b,K]` select `(b,B)=(15,19)`. Using the selected **B=19** as a zero-based p27 word number lands exactly on `EORNSOOCAEYEE`; using **K=2** as the symmetric shedding depth gives `NSOOCAEY`.

A discovery-aware finite charge grants every state value `{K,e,q,g,a,A,b,B,p}` as the p27 word number, both zero/one-based origins, every state value as the shedding depth, and every complete p57 word as the checksum target. Requiring both core length and GP-prime sum leaves exactly one hit: **B=19, zero-based; K=2; NSOOCAEY → DIUINITY (8 runes, prime sum376)**. See [the focused receiver report](lp2-p27-dh-state-word19-divinity-receiver.md) and `sims/lp2_p27_dh_state_word19_divinity_receiver_sft.cjs`.

This strengthens the receiver selection but does not alter the cipher verdict below: direct cube/inverse-cube still fail exactly, and no rune-level inverse follows from the checksum.

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

## Separate retrospective additive-pad fit

The direct cube/inverse-cube result above remains negative. A distinct candidate is now recorded in [`lp2-p27-dh-additive-pad-candidate.md`](lp2-p27-dh-additive-pad-candidate.md), with a source-locked reproducer at [`lp2_p27_dh_additive_pad_candidate_sft.cjs`](../sims/lp2_p27_dh_additive_pad_candidate_sft.cjs).

The earlier signed-2016 page/word orientation was underdetermined, but the newer local DH-state route now selects this same receiver without that guess: p27 red fields fix `B=19,K=2`, zero-based p27 word19 is `EORNSOOCAEYEE`, and shedding two runes from each side gives `NSOOCAEY`. The p28 DH readout and word28 shell, together with the candidate p29 word30 H4 packet, supply the values for `[b,g,K,p−1,p+K,g⁻¹ mod p,K,F]=[15,5,2,22,25,14,2,0]`. Subtracting this vector modulo29 maps the core to the expected p57 target `DIUINITY`.

The candidate has useful checksum closures (`sumPrime(key)=309=3×sumGP0(core)=3×103`; `sumPrime(target)−sumPrime(key)=67`, the 19th prime). The receiver coordinate is now independently constrained by the local `B=19,K=2` route, but the exact serialization order is still **not source-fixed**. The pad fails as a repeated period-8 page key. Agent42 subsequently exhausted all 2,520 cyclic orders of its exact multiset, both signs, arbitrary group phases and ordinary/F-hold modes: best original support 21/47, 17/52 and 29/68 on p27/p28/p29, even with per-page key choices. Four planted keys recovered exactly with 160/160 withheld true words retained. See the consolidated additive-pad report for the finite-register scope. It is a retrospective mapping of an already expected word, not an authenticated KDF, unknown plaintext recovery, or page decoder. The direct cube rejection above is unchanged.

## Decision

Reject the **direct one-step cube and inverse-cube transforms on the p27 NSOOCAEY DIVINITY core**. This closes the most obvious p27 receiver for the DH-derived GP29 cube bridge. It does not refute the p28 DH state, the p27 circumference/prime-sum selectors, or other independently selected receivers. The cube result itself does not supply a post-DH KDF, rune serialization, payload clock, or unknown plaintext. A separate eight-symbol additive-pad serialization is now documented below, but its order is not source-fixed; it maps only the already expected p27 core to DIUINITY and all cyclic orders of its exact multiset fail the finite native-word periodic receiver, so no authenticated KDF or page decoder has been established.

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