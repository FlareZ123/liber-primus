# 2013 AUDIO/761 prime residues modulo 29: cross-round key and matrix tests

**Classification (10 November 2026):** new exact cross-round arithmetic observation; cipher interpretations are bounded negative tests. No LP2 plaintext, authentic key, or continuation has been recovered.

## Historical source and exact arithmetic

The repository's established 2013 audio source record identifies the number
[
N=1,595,277,641=1259cdot1031cdot1229
]
in `AUDIO/761.MP3`. Its factorization is already linked to prime sums in the later solved PARABLE text; see [the existing audio-source study](audio-761-pad-scan.md).

Reducing the three factors modulo the 29-symbol GP alphabet gives
[
(1259,1031,1229)mod29=(12,16,11).
]
Their multiplicative orders in (mathrm{GF}(29)^	imes) are respectively (4,7,28), and their product is
[
12cdot16cdot11equiv Nequiv24pmod{29}.
]
The file identifier independently gives (761mod29=7). Thus the factor-16 residue and the product residue 24 both have order 7, matching the file identifier modulo 29. The residue 11 is the unique primitive root among the three factor residues, and (24=11^{16}pmod{29}).

This supplies a compact retrospective cross-round echo:
- (24) is also the exact double root of the p39 red-triad polynomial and the enlarged Ac value on p54;
- (11) is a source-selected primitive root among the three factor residues;
- (16) has order 7, matching (761mod29).

The arithmetic is exact. Its intended status is **not established**: the modulus and operations are being selected after noticing the p39/p54 value 24, so this is a candidate human solve-path clue, not independent proof of a cipher key.

## Source-constrained candidate mechanisms

The following were tested against the original 12,956 unknown runes on 55 rune-bearing pages.

1. **28-cycle keys.** The unique primitive residue 11 and product seed 24 give
   [
   K_i=24cdot11^imod29,
   ]
   with period 28 and no fitted phase. Direct GP-index, prime-mod-29 and (phi(	ext{prime}))-mod-29 projections were tested as additive keys; invertible mappings were also tested multiplicatively. The factor residues and their totients were tested as direct period-3 keys.
2. **Period-7 keys.** The file number supplies 7, while factor residue 16 and product residue 24 each have order 7. The source-fixed streams (24cdot16^i) and (24cdot24^i), both directions, were tested additively and multiplicatively. Identity-start controls were included without fitting a phase. The same period-7 streams were also tested on the 127 terminal red runes (p53 red local interval ([128,179)), 51 runes, followed by all 76 runes on p55), with continuous and p55-reset clocks.
3. **Factor-root recurrence and feedback.** The residues give
   [
   (X-12)(X-16)(X-11)=X^3-10X^2+7X-24pmod{29}.
   ]
   Its canonical third-order recurrence was tested from initial state ((12,16,11)). A simple reversible state seeded at 24 with multiplier 11 was also tested with plaintext and ciphertext feedback.
4. **Three-symbol Hill cipher.** The companion matrix of that characteristic polynomial is
   [
   A=egin{pmatrix}0&1&0\0&0&1\24&22&10end{pmatrix}pmod{29},
   ]
   with eigenvalues (12,16,11) and determinant 24. The companion, its transpose, and (operatorname{diag}(12,16,11)), their inverse directions/transposes, three block alignments, and book/page clocks were tested as 3-by-3 Hill transforms.

In total, **196 declared variants** were evaluated: 180 full-stream variants and 16 period-7 variants on the terminal red target. All additive/multiplicative/feedback inverses exactly re-encrypt the original input. The Hill implementation also passed a planted 12,954-symbol GP-English round-trip control. These checks validate implementations, not the historical authenticity of a key.

## Results

The language control is the solved LP1/LP2 reference greedily tokenized into GP symbols, excluding editorial continuation labels and the long hexadecimal hash. Its 3,213 symbols are split 80/20: 2,570 train a smoothed trigram model and 643 are held out. This is a descriptive control, not a discovery-adjusted p-value.

| Stream | Length | IoC | Top-12 mass | GP trigram log score (nats/rune) |
|---|---:|---:|---:|---:|
| Solved-reference holdout | 643 | 0.065125 | 0.807154 | −8.41667 |
| Original unknown LP2 | 12,956 | 0.0344784 | 0.429762 | −11.07314 |
| Best full-stream candidate (period-7 audio key) | 12,956 | 0.0344695 | about 0.43 | −11.04887 |
| Best 3-by-3 Hill candidate (diagonal matrix) | 12,956 | 0.0344704 | 0.43169 | −11.04925 |
| Best period-7 terminal red candidate | 127 | 0.03537 | — | about −10.975 |

The best full-stream score improves the raw ciphertext by only about **0.024 nats/rune**. IoC remains at the uniform-ciphertext level, nowhere near the solved-reference control. The 127-rune red-target score is not directly comparable to the full-stream score and yields no coherent passage. No candidate produces sustained language.

## Decision

The mod-29 factor/product relation is worth preserving as a **cross-round clue**, especially because the product residue reproduces the p39/p54 value and the 761 identifier matches the order-7 subgroup. It does not supply a working LP2 key under the straightforward readings tested.

Retire the tested direct 28-/7-period additive and multiplicative keys, period-3 factor keys, factor-root recurrence, seed-24/multiplier-11 feedback, and canonical 3-by-3 Hill matrices. Do not expand this into arbitrary conjugate matrices, phases, or key mappings. A different nonlinear use of the 2013 source or a distinct external dependency remains possible, but would need a new visible clue.

**Reproducer:** [`sims/parable_mod29_crossround_key_probe.cjs`](../sims/parable_mod29_crossround_key_probe.cjs). It asserts the source arithmetic, reads only the canonical corpus and solved reference in `resources/`, runs the 196 declared variants, and checks exact round trips.

**Related studies:** [2013 audio byte/waveform study](audio-761-pad-scan.md); [p3/p39 primitive GF(29²) source study](lp2-red-triad-primitive-840-phase-gate.md); [p39/p54 projective quotient test](gf29-projective-singer-cycle.md).