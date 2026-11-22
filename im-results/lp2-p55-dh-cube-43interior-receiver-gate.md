# p55 43-rune interior does not decode under the DH-derived GP29 cube

**Agent35, 21 November 2026. Classification: bounded negative on the source-selected 43-rune p55 interior.** No unknown plaintext recovered.

## Source-selected receiver

Physical p55 contains **76** runes in 17 printed fragments with lengths:

~~~text
[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]
~~~

Applying solved p57's **SHED OUR OWN CIRCUMFERENCES** instruction as the already documented strict word-interior extraction gives **43 interior runes** and **33 exterior runes**. This count partition is independently supported by the authenticated 2013 BASE29/DH value:

\[
3301=43\times76+33.
\]

The p55 43/33 split is structural evidence, not a complete cipher frame: no source assigns the 33 exteriors a key, checksum, nonce, or restoration role.

Separately, the p28 DH23 state gives the candidate reversible GP29 power map. Its fixed state is (p,g,a,b,A,B,K)=(23,5,6,15,8,19,2), with exponent3 and inverse exponent19 modulo28. The p27 red19+13 check corroborates the exponent after discovery; it does not prospectively authenticate a p55 application.

This is a single, source-constrained test of the most obvious receiver: apply the DH-derived map to the 43 p55 strict interiors, retaining the original 33 exteriors and all printed word boundaries.

## Frozen operation

Apply exactly one of the following to each of the 43 interior GP29 indices:

\[
P_i=C_i^3\pmod{29}
\]

or its inverse

\[
P_i=C_i^{19}\pmod{29}.
\]

Restore the original first/last rune of every printed word, leaving the one-rune incoming carry unchanged. The map is verified as a permutation over all29 GP29 residues, and the inverse round-trips every residue. No key, phase, offset, permutation, repeated orbit, or alternate exponent is searched.

## Result

<text></text>
The exact reconstructed word outputs are:

**Original p55**
~~~text
N / AEMIW / SB / XM / SEOGDTHAE / FIAABCU / WR / BEAFXIMUCPHNGLEO /
MSDIAPF / BHEOC / EOE / EAEIGXGS / ESEOTHTHES / THOE / CEAIMCX / DJU / BEI
~~~

**Direct cube, x³ mod29**
~~~text
N / AESXW / SB / XM / SBPTHAE / FNGLEONU / WR / BEAFEXSUNOEMIAEEO /
MJTNGOEF / BMBC / EOE / EAOXPEPS / EJBHHOS / THOE / CEAXSNX / DYU / BOI
~~~

**Inverse cube, x¹⁹ mod29**
~~~text
N / AEHNGW / SB / XM / SBRAEYAE / FOWEOOEU / WR / BEAFINGHUOEGTHIAAEO /
MMAEOGF / BTHBC / EOE / EAXNGRIRS / EMBYYXS / THOE / CEANGHOEX / DSU / BXI
~~~

Neither direction produces recognizable plaintext. The operation preserves the symbol histogram because it is a permutation, but the reconstructed words remain nonlinguistic.

## Later exact exterior-copy impossibility (Agent40, 21 November)

The original p55 has five complete two-rune words `SB`, `XM`, `WR`, `EOE`, `THOE`. They contain **zero strict interiors**, so any algorithm changing only the 43 interiors and copying the original 33 exterior glyphs leaves **all five** fixed. All are absent from four pinned source-native English lexical sets. This establishes a stronger, **key-independent** necessary-condition failure for the entire original-word-preserving interior-only family; the cube/inverse decoder was never capable of full ordinary GP-native English even with a different exponent. See the [integrated 43/33 report](p55-original-33-exterior-43-interior-source-framing.md) and [exact original-source SFT](../sims/lp2_p55_exterior_copy_two_rune_obstruction_sft.cjs) ([Windows PASS 44961526952](https://github.com/FlareZ123/liber-primus/actions/runs/44961526952)). This does not exclude transformations that also change exterior values, nor word resegmentation.

## Decision

Reject the **direct one-step cube and inverse-cube transforms on the p55 43-rune strict interior**. This does not refute the p28 DH state, the p55 43/33 structural partition, or other independently selected operations. It does not identify a role for the 33 exteriors and does not recover any p55 plaintext, key, or complete inverse.

Do not widen into repeated cube-orbit applications, alternative exponents, rotations, arbitrary shell keys, or other p55 spans without a new original instruction that selects them before output is inspected. The p55 43/33 partition remains a source-supported structural constraint, not a reversible cipher.

## Reproduction

Run from the repository root:

~~~sh
node sims/lp2_p55_dh_cube_43interior_receiver_sft.cjs
~~~

The source-locked SFT reconstructs the 76-rune p55 page from the canonical transcription, asserts the exact 43/33 positions and word boundaries, applies both fixed maps, restores the original exteriors, and verifies the inverse over all29 residues.

Related evidence:
- p28 DH/cube derivation: im-results/lp2-p28-dh23-gp29-cube-bridge.md
- p55 source partition: im-results/p55-original-33-exterior-43-interior-source-framing.md
- p55 comprehensive source gate: im-results/lp2-2016-p50-p55-43unit-source-selector-gate.md