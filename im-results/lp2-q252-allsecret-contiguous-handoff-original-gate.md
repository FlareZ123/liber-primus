# Complete secret-alphabet test of a direct H/G table-quotient handoff

**Agent 2, 16 November 2026. Classification: bounded original-source negative.** No unknown Liber Primus plaintext, authored cipher key, or continuation is recovered. This excludes a *direct contiguous-copy / single fixed-alphabet* interpretation of a previously established, independently constructed 252-symbol table quotient; it does **not** adjudicate the authors' intent in forming that quotient.

## Distinct question and the human-visible candidate

The original Liber Primus numerical rectangle printed across physical LP2 pp49–51 has 256 cells in 32 rows of eight. Earlier investigations discovered that the conventional-base60 byte tape, read as a GF(29) polynomial in high-to-low source order, is exactly divisible by the degree-four product of two source-linked quadratics:

- **H2013:** the signed 2013 \`BASE29 3301 → 3QO\` example, interpreted in the already-stated ascending polynomial coefficient convention, yields \`3+26X+24X²\`;
- **Gp39:** the original p39 three red runes give \`27+5X+15X²\`.

Their product is \`23+21X+11X²+17X³+12X⁴\`. The 256 original byte residues, divided in source order by this product, have **zero four-residue remainder** and an exactly **252-slot GF(29) quotient Q**, beginning \`[0,12,9,28,2,25,23,21,18,28,21,17,17,8,15,21,7,21,18,7]\`. These source and arithmetic claims were **already established**, not rediscovered here; see [historical factor source](2013-base29-gf29-grid-factor.md), [complete factorisation](lp2-grid-complete-gf29-factorization.md), and [radix caveat](lp2-p50-radix-dualfactor-discriminator.md).

An actionable, previously unresolved interpretation would be that the quotient *directly reproduces* some 252-symbol secret or manuscript passage, with its 29 GP alphabet symbols relabelled. This would be a short, recognizable, period-plausible substitution transport, and a direct copy might expose original text or a known-passage alignment without an externally missing key. **Weakest premise:** no original clue says that the table is a copy of any rune passage, that the quotient should be extracted, or that only a fixed alphabet substitution connects them.

We ask the strongest **source-order direct-copy question** without selecting any substitution key: under **every possible fixed 29-symbol bijection**, how long can any contiguous Q fragment reproduce any contiguous original rune fragment? We also grant *every 29→29 deterministic map, including noninjective assignments* as an even more permissive comparator. These are two exact finite classes, not guesses about letters or Vigenère phases.

## Full unchanged original-input test

Use canonical \`resources/liber-primus/lp2-grid-256.json\` (256 bytes; original byte SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`) and \`resources/liber-primus/lp2-corpus.json\`. The latter supplies:

- All **12,956** original p0–55 ciphertext GP indices in physical source order; p50 contains no runes.
- All **12,901** within-physical-page consecutive GP29 differences, *not* artificially computed across original page edges.
- The independently **85-rune p56 known plaintext** recovered by the authentic first 84 consumed prime-minus-one shifts and the literal plaintext-F nonconsuming position 56, followed by the original **95-rune clear p57**, forming a **180-rune genuine known-plaintext register**.

For the quotient Q and its exact reversal, exhaust every pair of possible contiguous starts in Q and each receiver. A single fixed symbol map must use the *same* output every time an input Q symbol repeats. In the bijective case, distinct source symbols must also remain distinct. Checking these equality/inequality constraints requires **no key search** and covers **all 29! secret alphabets**. The algorithm permits candidate windows to extend across original page edges in the concatenated receiver, so its maxima are generous upper bounds for stricter page-local matches.

| Original receiver | Q order | Best fixed bijection, consecutive symbols | Best arbitrary fixed deterministic map, consecutive symbols |
| --- | --- | ---: | ---: |
| Unknown p0–55 ciphertext, 12,956 runes | Printed | **17** | **22** |
| Same unchanged unknown ciphertext | Reversed | **18** | **20** |
| Unknown within-page ciphertext differences, 12,901 positions | Printed | **17** | **22** |
| Same unchanged differences | Reversed | **17** | **21** |
| Independently solved p56 plaintext + clear p57, 180 GP runes | Printed | **13** | **20** |
| Same independently known cleartext | Reversed | **13** | **19** |

The strongest actual original-cipher bijection fragment, length **18**, is from reversed Q at quotient offset53 to concatenated unknown ciphertext offset3200. This is a fit under a **freely inferred** map and supplies **no readable plaintext or repeated cryptographic key**. The longest even noninjective window is 22 signs. In particular, *no original tested receiver contains a contiguous 23-symbol Q handoff under any fixed deterministic 29→29 mapping*, and **no 19-symbol handoff under any alphabet permutation**, across either natural Q orientation. Re-encryption under a post-fitted short map would be a tautological substring match, not independent cryptanalytic evidence.

## Exact implementation control and consequence

[Standalone Windows-compatible CommonJS source test](../sims/lp2_q252_allsecret_contiguous_handoff_sft.cjs) derives Q again from the untouched original 256 bytes, checks its four zero residues and fixed prefix, reconstructs and asserts authentic p56 plaintext from original ciphertext, and evaluates the six receiver/orientation pairs for both mapping classes. An **independent 95-rune genuine clear-p57 control** is deliberately planted into a synthetic 252-symbol stream at fixed offset60 under the secret affine bijection \`x↦7x+3 (mod29)\`; the all-secret matcher must recover the entire 95-rune interval with no access to that key. The known inverse \`25(x−3) mod29\` recovers 95/95 signs; replacing one planted symbol by a contradictory value destroys the full-length match. These planted controls establish detector capability, **not manuscript plaintext**.

The experiment changes one research decision: **do not expect the H/G-derived Q252 sequence to be a verbatim section of existing LP2 runes or the authentic ending, merely disguised by one global monoalphabetic map.** Even arbitrary nonbijective relabelling cannot yield a 23-sign contiguous copy. It leaves unchanged the live possibility of a *key stream* rather than a copied plaintext, differing chapter or word clocks, an intermediate transposition, variable-length code, field operation, or author-selected secret source. None is authorized by the numerical correspondence alone.

A meaningful next handoff would be an **independent source instruction** choosing a non-copy reversible operation, exact operand/clock, and an untouched chapter prediction. Another unconstrained GF29 permutation or rephasing of this failed direct-copy route would repeat an exhausted assumption and would not generate unknown LP2 plaintext.
