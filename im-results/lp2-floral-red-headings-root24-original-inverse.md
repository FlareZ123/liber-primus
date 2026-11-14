# Floral red headings share the p39/table root 24: bounded original inverse

**Agent16, 14 November 2026.** The original red headings on **physical p40** and **physical p54** each form a printed-order polynomial over GF(29) with root **24**. This is an additional exact cross-page relation to the known p29/table double-root-24 structure and p39 red triad. Its interpretation as an intentionally authored checksum remains **unproven**. A source-derived quotient-as-repeating-key inverse on both complete chapter bodies recovers no unknown plaintext or authentic key.

## Independent original-source inputs

Canonical rune values: [untouched LP2 corpus](../resources/liber-primus/lp2-corpus.json); exact original red span locations: [ink annotations](../resources/liber-primus/lp2-ink-annotations.json); original printed base60 cells: [grid dataset](../resources/liber-primus/base60-grid.json). For printed GP indices a0,..,an−1, form the **high-first polynomial** H(x) = Σ ai × x^(n−1−i) modulo29. The two original starts of the floral-bordered p40–55 chapters give:

| Red heading | Original GP29 indices | H(24) | H′(24) | Exact quotient by (x−24), high-first coefficients |
| --- | --- | ---: | ---: | --- |
| p40 first 8 red runes, F N M Y G D AE H | [0,9,19,26,6,23,25,8] | **0** | 18 | **[0,9,3,11,9,7,19]** = F N O J N W M |
| p54 first 9 red runes, A M NG D IA TH X I M | [24,19,21,23,27,2,14,10,19] | **0** | 4 | **[24,15,4,3,12,0,14,27]** = A S R O EO F X IA |

Both are **simple roots** because H′(24) is nonzero. Their final original red symbol is uniquely determined by the earlier red indices under a one-symbol GF29 parity-at-24 rule. The first rune of the p40 header is GP F=0, so its nominal degree-seven polynomial has effective degree six; retain the initial quotient zero without rewriting the source.

Across **all 18 original red spans on physical LP2 pp0–57**, these **two** and only these two have H(24)=0 under the same high-first convention, including solved red-heading controls p56 and p57. The p40 and p54 heads are naturally pre-identified by the ornate chapter boundary, rather than selected from arbitrary word windows.

Exhaustively permuting each of the two frozen heading multisets gives **1,440/40,320** p40 permutations and **6,218/181,440** p54 permutations with the same zero. Their independent-product proportion is **0.00122394** under this narrow conditional null. This is **not a discovery-wide probability**, since the root24 focus and mathematical representation were recognized during a large historical search. The p40 rune-sum modulo29 is already zero, so its separate root at x=1 holds under every permutation.

## Why root24 was already relevant and what weakens it

The original printed 256-byte grid polynomial and physical p29's 277-rune coefficient polynomial each have a **double root at x=24** over GF29. These established exact results and the original p39 red triad are documented in [the p29 source quotient report](lp2-p29-g-original-quotient.md) and [complete table factorization](grid-bigint-factor-page53.md). Also, zero-based **table row24 begins with literal 00**, selecting a 64-byte suffix whose direct hash/XOR attempts are negative ([source-fixed test](lp2-p54-row24-grid64-p56-hash-gate.md)).

**Important coefficient-orientation objection:** p39's original red triad is [27,5,15]. It equals 27+5x+15x² = 15(x−24)² in **low-first** order; in the high-first convention used above for p29, the table, p40 and p54 it has a **double root at 23**, rather than 24. The manuscript has supplied no authorial instruction resolving this ambiguity. Do not assert that all five objects prove one creator-designed common polynomial code.

## Source-derived key and complete original-cipher result

The root24 equalities determine exact seven- and eight-rune quotients of p40 and p54 without fitting. As a cheap fully reversible candidate, use each quotient as a phase-zero cyclic GP29 additive key on its following entire chapter body, trying both direct signs. Do not modify original red symbols or word boundaries.

| Original chapter body | Runes | Original IoC | Subtract quotient IoC | Add quotient IoC |
| --- | ---: | ---: | ---: | ---: |
| p40–p53 after its 8-red heading | **3000** | 0.034544403690 | **0.034471935089** | **0.034371901745** |
| p54–p55 after its 9-red heading | **299** | 0.033489708424 | **0.034903818096** | **0.036048573545** |

All four decode attempts remain close to uniform 29-symbol ciphertext (uniform IoC 0.034482758621), with **no sustained readable GP text**. Each re-encodes the original ciphertext exactly and all four positive plants using solved p57 native GP29 recover every original plant rune (3000 or 299). These are implementation controls, not evidence for authentic key material.

**Decision:** preserve the newly noticed paired red-heading root24 equalities as a source structural constraint and candidate *single-parity* relation. **Retire** their simplest quotient-as-repeating-additive-key original inverse. A historical instruction specifying coefficient order and a concrete operation is still needed. Further ad hoc phases, permutations and stacked ciphers are unjustified absent such evidence. No unknown-page plaintext, key, or final destination has been recovered.

**Reproduction:** [one read-only Node22 CommonJS SFT](../sims/lp2_red_floral_root24_quotient_key_sft.cjs) checks original spans and coefficients, all exact roots and nonroots, the 7/8 source quotients, both whole-chapter inverses and exact native-GP planted controls. [Successful read-only Windows GitHub Actions run](https://github.com/FlareZ123/liber-primus/actions/runs/43543857247).
