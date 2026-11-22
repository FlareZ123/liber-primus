# Original p15 width-16 backward FIR: complete all-secret inverse on p16–22

**Agent31, 22 November 2026. Classification: exact original-cipher model rejection.** All **43,046,721** stationary sixteen-coefficient GF(29) backward-filter inverses compatible with the first sixteen authentic one-rune words have been enumerated. **Zero** remain compatible with the first ten additional genuine two-rune words. The result recovers no unknown LP2 plaintext or authentic key. It closes the reverse temporal orientation of the already-tested forward FIR16 family, without making a broader claim about nonstationary or differently registered ciphers.

## Reversible original-to-plaintext hypothesis

The original physical p15 Fibonacci-prime 4×4 square supplies a **16-value** source operand and an outward reading spiral. Its immediate successor, original physical **p16–22**, contains **1,744 ciphertext GP29 runes**, with 17 complete one-rune words and 69 complete two-rune words according to the canonical original word boundaries. This makes a 16-symbol local reversible transform worth testing as an alternative to the previously excluded forward causal filter. The **direction toward later ciphertext** is an explicit exploratory rival hypothesis; no first-party manuscript instruction selects this filter.

For every original chapter-local offset \\(t\\) with \\(t+15<1744\\), let

\\[P_t = \\sum_{j=0}^{15} h_j C_{t+j} \\pmod {29},\\]

where the entire secret kernel \\(h_0,\\ldots,h_{15}\\) ranges over GF(29) freely. If \\(h_0\\ne0\\), encoding is reversible **backward** from a fifteen-symbol terminal IV:
\\[C_t = h_0^{-1}\\left(P_t-\\sum_{j=1}^{15}h_j C_{t+j}\\right) \\pmod {29}.\\]
The search generously includes kernels with \\(h_0=0\\), which are not reversible under that direct rule, so an empty result covers the proposed invertible family without overlooking a singular exception.

A native-GP English singleton is **A, I or O**, GP29 indices 24, 10, 3. The sixteen original ciphertext windows at the first sixteen one-rune word positions have full matrix rank **16** in GF(29), so each of **\\(3^{16}=43,046,721\\)** potential singleton assignments identifies *one unique complete secret 16-tap inverse*. A seventeenth original singleton and the original two-rune word positions constitute entirely held-out constraints. The generous dictionary accepts every distinct two-rune GP encoding from the full checked-in TextBlob word-frequency resource, exactly **189** permissible rune-pairs.

## Direct original result

| Exact original constraint | Surviving hidden kernels |
| --- | ---: |
| Sixteen authentic singleton-word assignments, all keys | **43,046,721** |
| Seventeenth singleton also A/I/O | **4,451,310** |
| First two two-rune words match native GP dictionary | **224,504** |
| First six two-rune words | **561** |
| First seven two-rune words | **123** |
| First eight two-rune words | **29** |
| First nine two-rune words | **3** |
| First ten two-rune words | **0** |
| All 69 original two-rune words | **0** |

The original 17 singleton sites, 69 double sites, and all original 1,744 ciphertext symbols are source-frozen. No key or shifted phase is selected from the cipher output. The exact zero at the tenth independent two-rune word is an algebraic **incompatibility under the explicitly declared native-English dictionary assumptions**; it is not an IoC-only heuristic.

## Positive recoverability and boundaries

The original sixteen p15 printed numbers, read row-major and reduced modulo29, supply a **reversible** planted kernel whose first coefficient is **10**. A complete English-dictionary GP source plant retaining all original p16–22 word lengths was encrypted backward with that kernel. The same sixteen-singleton linear inversion **recovered all sixteen exact planted coefficients** and **1,729/1,729** nonterminal-IV plaintext runes. Every held-out original-shaped singleton and two-rune word then passed. This positive is a *model check*, not an authentication of the p15 numbers as a real key.

The earlier [forward temporal FIR16 search](lp2-p15-causal-fir16-allsecret-word-inversion.md) also failed the first ten two-rune words for every secret inverse, although its survivor counts differ. Together, both one-sided stationary **16-tap** GP29 linear filters with a single continuous p16–22 clock are incompatible with native-GP English for any secret coefficients. A changing kernel, word/page reset, different plaintext encoding, transparent-runic skips or layered encryption remains outside these two model gates. Further ad hoc orientations need a separately visible author clue.

**Reproduce:** [original-source CommonJS SFT](../sims/lp2_p15_anticausal_fir16_allsecret_source_sft.cjs); [successful Windows Node22 full source and plant run 45061515721](https://github.com/FlareZ123/liber-primus/actions/runs/45061515721); [manual workflow](../.github/workflows/agent31-p15-anticausal-fir16-original-manual.yml). These source files and the complete 43-million enumeration were committed and run against original repository inputs.
