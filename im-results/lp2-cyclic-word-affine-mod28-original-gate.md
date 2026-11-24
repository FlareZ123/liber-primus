# Cyclic whole-word BASE29 affine register: exact modulo-28 singleton obstruction

**Agent20, 24 November 2026 — Director [#2474](https://github.com/FlareZ123/liber-primus/issues/2474).** The proposed length-preserving end-around integer cipher escapes the previously established modulo29 endpoint theorem, but it is excluded for direct native GP29 English by a new exact low-modulus obstruction. No unknown plaintext or authentic creator key recovered.

## Frozen model and source

The 2013 authenticated BASE29 example and p57 circumference wording motivate examining a cyclic modulus; neither supplies a creator-selected cipher. For a complete printed word of length L, use canonical GP0 big-endian integer P, M=29^L−1, zero-based global complete-word clock t. On integers 0..M−1 use C=(aP+b+d*t) mod M, where a is a unit modulo every occupied M. Fix the extra all-28 representation M to itself; this makes the map a bijection over all 29^L fixed-width words. No skipped F, clock resets, private word keys or altered segmentation. This choice was made before reading original candidate outputs. The earlier [fixed-width endpoint theorem](lp2-word-base29-unit-invariant.md) does not cover it: a=29 gives a cyclic digit rotation; with b=13,d=17 at t=0, [1,0]→[0,14] and [2,0]→[0,15]. Thus the low digit depends on a higher digit.

Canonical input: lp2-transcription.txt blob 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7 and lp2-corpus.json blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. The transcript omits runeless physical p50; removing line/page wrap markers before splitting on the actual printed punctuation reproduces 2,896 words, 12,956 runes and 83 singletons, with full exact rune-array equality to the canonical source. This uses the complete-word tape including cross-page carries.

## The new all-key invariant

Because 29≡1 mod28, M is a multiple of28 for every L. Therefore on ordinary representatives:

    sum(c_j) ≡ a sum(p_j) + b + d*t (mod 28).

Every lawful a must be a unit modulo28. In particular, on ordinary singleton words, C−d*t modulo28 is a fixed permutation of P. For any slope d, neither a nor b changes the histogram of these residues. The exceptional singleton EA (index28) is fixed by the chosen bijection and occurs four times in original ciphertext; remove those four before analyzing the 79 ordinary singletons.

Across all 28 possible d residues, the number of distinct ordinary residuals is:

    27,28,25,26,27,23,27,26,27,25,27,27,26,26,
    26,25,26,24,26,23,28,28,27,28,26,26,27,26.

Minimum23 (d=5,19), therefore **at least24 distinct decoded singleton symbols** including fixed EA. This is independent of key size, higher-digit carry, digit direction, language score, and even which singleton vocabulary one grants (any fixed symbol permutation still needs 24 types). The largest possible mass in the most frequent three, eight, or twelve ordinary decoded types is 22,46,59 of79 respectively. Even if all four exceptional EA words are accepted, twelve ordinary types plus EA cover at most63 of83. The direct native A/I/O constraint is stronger.

An explicit, tiny witness excludes even the A/I-only subcase without any search. Both A=24 and I=10 reduce to10 modulo14. Hence two ordinary singleton positions with equal t mod14 must have equal C mod14. Original word ordinals 54 and516 differ by462=33×14 but are S=15 and O=3 respectively, whose residues differ. Both are ordinary representatives. This contradiction holds for all integer a,b,d.

Full finite reduction for the A/I/O grammar: 12 unit multipliers ×28 offsets ×28 slopes=9,408 residue keys; maxima A/I=13/83, A/I/O=18/83. A deliberately generous alphabet {F,U,O,I,E,A,Y,AE,EO,OE,IA,EA} attains only52/83. This last set is a sensitivity check, not a claim about author vocabulary. The model forces a near-full-alphabet inventory of standalone plaintext symbols, inconsistent with ordinary native prose and the project's already-used A/I/O control assumption (see [independent H2 singleton gate](lp2-h2-cyclic-allsecret-singleton-mask-original-gate.md)). The algebraic result is exact conditional on preserved printed words and the stated zero-representation contract; it does not exclude symbolic lists or an unknown segmentation layer.

## Positive controls and decision

The exact same modular inverse with a=29,b=13,d=17 recovers all 20 words/95 runes of the authentic clear p57 control. A second planted control extracts the 32 A/I tokens from the normalized LP1 reference preceding section56 (excluding metadata lines), treats them as a compact singleton tape and recovers the projected modulo14 clock and intercept (3,9) uniquely from ciphertext alone. This is a projection-gate positive, not a claim to recover the entire large integer key. The extra all-28 representation also round-trips. The original obstruction precedes any full-key search or original-language holdout; no expensive search is warranted because there is no compatible key under the declared grammar.

Reproducer: [standalone CJS](../sims/lp2_cyclic_word_affine_mod28_original_sft.cjs), run from repository with Node. The original-input calculation and positive controls were executed directly in the invocation's JS runtime; the saved CJS reproduces them using the pinned source files. No CI is required for the inexpensive algebra.

**Decision:** retire the exact globally affine end-around whole-word law. The prior modulo29 endpoint proof and this modulo28 singleton proof apply to different moduli. A nonlinear clock, state-dependent multiplication, altered boundaries, nonstandard standalone-symbol plaintext, or a genuinely different handling of the extra representative remain outside the stated theorem. Do not retune the model without a new independently source-selected operation.
