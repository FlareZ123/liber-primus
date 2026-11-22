# Printed grid as a GP29 polynomial diffusion filter: original-input inversion

**Classification (10 November 2026): a source-constrained, fully reversible cipher hypothesis with an exact two-orientation obstruction and two negative full-original inversions.** No newly recovered LP2 plaintext, key, authorial mechanism or destination.

## Candidate solve path

The original LP2 pp49–51 grid is 256 two-character base60 byte values, in 32 rows of eight. Rather than assuming each byte is a repeating additive key, interpret the printed row-major sequence as coefficients of a finite-field convolution over the 29-rune GP alphabet. The already established `(X−24)^2` factor in the source coefficient polynomial, together with the conspicuous Ac rune (GP index 24) on p54, motivates one additional **source-computed** quotient. This hypothesis is separate from a repeating grid pad, LFSR keystream, Shamir interpolant, or arbitrarily fitted Hill matrix.

The original near-exclusion of adjacent doublets further motivates an exact, invertible output map through the 28 nonzero elements of F29. In this construction, adjacent source ciphertext equality is represented by register value 28; the GP29 plaintext itself remains an unrestricted 29-symbol register, and is permitted to contain 28 elsewhere. This distinction is necessary for **full reversibility**.

Let `P_n` denote source-native GP29 plaintext indices, zero before the start, and `a_j` one chosen coefficient vector. The complete forward cipher is

```text
Y_n = (sum(j=0..min(n,m-1), a_j * P_(n-j))) mod 29
Delta_n = 0                        when Y_n=28
Delta_n = 15^Y_n mod 29            when 0 <= Y_n <= 27
C_n = (C_(n-1) + Delta_n) mod 29   with C_(-1)=0
```

Here 15 has multiplicative order 28 in F29, so **each of the 29 Y-values maps to one of the 29 differences uniquely**. Consequently every native-GP plaintext encrypts to exactly one cipher sequence; if `a_0 != 0 mod29`, the inverse is unique and can be computed causally without searching a secret key. The 86 original `Delta=0` events are fully preserved as `Y=28`.

This is a cryptanalytically attractive **hypothesis**, not a historical instruction. No known LP2 page directly says to use convolution, this field-element assignment, or a zero-state causal boundary.

## Four frozen source variants and original-input result

Use `resources/liber-primus/base60-grid.json` (256 canonical bytes), their mod29 residues, and their quotient after exactly two divisions by `X−24` in F29. Preserve the canonical coefficient vector and test its reversal for each of those two sources. These **four** variants are source-fixed; there is no fitting on unknown ciphertext. There are **12,956** original unsolved symbols, 86 exact zero-difference events.

| Printed coefficient source | Tap orientation | `a_0` | Original outcome |
| --- | --- | ---: | --- |
| Raw 256 bytes | Printed forward | 0 | Exact zero-state contradiction: original first difference has discrete-log rank **1**, while `a_0=0` forces `Y_0=0` for every plaintext |
| Double-root quotient (254 coefficients) | Printed forward | 0 | Same exact contradiction |
| Raw bytes | Reversed | 22 | Exact full inverse; GP IoC **0.0345112377**, GP `EA` **446** occurrences; unreadable prefix |
| Double-root quotient | Reversed | 9 | Exact full inverse; GP IoC **0.0344531722**, GP `EA` **440** occurrences; unreadable prefix |

The two inverse prefixes are, respectively,

```text
RFAOYIAPIBOEXTIAHEOJAOEJGLLEOUPFIPGTHWDPBNAEAJEOLNTPDLYA...
PJAAEHIEOUTCWJHOEUYYEYNGLIIALEASTHMFWIANJIATHJNGEAOOETH...
```

These are full 12,956-rune reconstructions from the actual source, with no omitted original doublet. For comparison the unsolved ciphertext has IoC **0.0344783979**; the independent GP-encoded solved-LP1 plaintext control used by the runner has IoC **0.0613506820** and **106** GP `EA` symbols over the same 12,956-rune repeated-reference length. The actual two inverse outputs have minimum frequencies **404** and **415** among all 29 letters, meaning an unrestricted secret **single alphabet permutation** cannot turn their symbol distribution into that particular source-native control distribution.

For both invertible variants, original plaintext-to-cipher reencryption reproduces the authentic **12,956/12,956** GP runes exactly, and both independently generated source-native LP1 controls recover **12,956/12,956** original plaintext indices. Those are implementation tests; any invertible transform round-trips wrong-key ciphertext. Here both full inverses remain near-uniform and produce no coherent language, which is the negative evidence.

## Separate fixed-sentinel interpretation

The related, stronger **escape-preserving** interpretation supposes original `Delta=0` directly denotes one reserved plaintext GP symbol and consumes no polynomial-filter input. Inverting the 12,870 nonzero ranks with source-fixed reversed taps yields an impossible direct reserved-symbol partition: `EA` appears **464** (raw filter) or **415** (quotient) times among the **non-escape** output positions. Even granting *any* of the 29 letters as an arbitrary secret reserved symbol, the least frequent decoded output letter appears **391** (raw) or **406** (quotient) times in those non-escape positions. A one-symbol fixed escape convention cannot use this source filter while preserving its reserved symbol in the unchanged plaintext alphabet. With per-page reset those minima are **416** and **404**, respectively. This is an exact input obstruction within the stated reserved-symbol encoding; it does not apply to the full reversible 29-value mixing model above, which naturally permits the intermediate sentinel to diffuse.

## Reproduction and decision

[Runnable Node.js 22 CommonJS SFT](../sims/grid_polynomial_diffusion_inverse.cjs) uses only canonical committed source inputs and imports the shared original source-native plant from [the separate evolving-state study](../sims/ink256_grid256_lfsr_inversion.cjs). All four original cases, zero-state contradictions, full reencryption and planted controls ran successfully in [manual GitHub CI 42901073513](https://github.com/FlareZ123/liber-primus/actions/runs/42901073513), requiring no packages.

**Decision:** Neither zero-state printed-order polynomial nor reversed direct-GP29 polynomial deconvolution recovers unknown LP2 language. The exact forward-input contradiction rejects the first two finite models; the invertible reversed models are fully implemented and linguistically negative. This leaves unknown IVs, alternative state boundaries, other source-selected filter operations, intermediary non-GP alphabets, and unlocated historical keys untested. In particular, another unmotivated polynomial tap search would add fitted degrees of freedom without explaining why a 2014–2016 human solver would select the algorithm.
