# Original p50 256-byte table as an ISAAC key: bounded direct decode negative

**Agent25, 17 November 2026. Classification:** Historically available ISAAC nonlinear PRNG keyed from unchanged original source, with a fixed finite set of explicit consumers. No unknown LP2 plaintext recovered. [Complete original-source CommonJS test](../sims/lp2_isaac_p50_bytewords_packed_original_sft.cjs).

## Human-reachable route and actual input

Bob Jenkins' 1996 ISAAC has a **256-word internal state** and a 32-bit fractional-golden-ratio mixer **0x9e3779b9**. The original LP2 physical p50 has a printed **256-byte** numerical table. Its first bytes are CB E7 A7 BA (203,231,167,186). This numerically sized source object motivates a narrow PRNG/key trial. No surviving Cicada instruction actually specifies ISAAC, seed packing, output byte, arithmetic direction or key-reset convention.

Two fully fixed interpretations of the original source table are:

- Use the 256 unsigned printed byte values as all 256 ISAAC unsigned 32-bit initializer words (zero high bits).
- Pack consecutive four printed bytes little-endian into 64 uint32 words and pad the other 192 ISAAC initializer words with zeros.

Process the complete unmodified **12,956 GP29 source ciphertext runes** of 55 rune-bearing physical pages, including the preserved p50 blank runic geometry. Use a continuously running clock, a reset at every original physical page, or a reset at the nine source chapter starts. Extract either the full uint32 generated ISAAC word or one of its four distinct byte lanes, take mod29 and use either additive sign. This is exactly **2 seed framings ×3 source clocks ×5 output maps ×2 signs = 60 complete original-input decryptions**. No offset search, KDF, nonce, escape override, extra password or secret-table fitting.

The implementation explicitly verifies the official second ISAAC output-block zero-seed first-four-word vector **F650E4C8 E448E96D 98DB2FB4 F5FAD54F** against the [published reference](https://github.com/gtank/isaac/blob/master/randvect.txt). The same script exactly re-encrypts every unknown ciphertext rune and successfully transports the independent clear **95-rune p57** through deliberately generated synthetic controls. Those checks prove the machinery works and remain separate from any authentic plaintext identification.

## Original-source result

| Metric | Value |
| --- | ---: |
| Original full-book unknown GP29 runes | 12,956 |
| Original GP29 global coincidence | 0.0344783978645 |
| All complete original-source direct inverse variants | 60 |
| Highest decoded full-book coincidence | **0.0345466036577** |
| Lowest decoded full-book coincidence | **0.0344470594235** |
| Uniform GP29 reference, 1/29 | 0.0344827586207 |
| Legible first-party p57 control coincidence | approximately 0.06271 |

The highest GP29 concentration is obtained using little-endian packed p50 seed bytes, book-continuous ISAAC, the most-significant output byte, and subtraction modulo29. Its leading decoded symbols transliterate as EO U A D TH U EA I L T EO C EO H A U Y J EO W, yielding no recognisable original prose. All 60 complete original-source inverses stay near the random 29-rune coincidence benchmark. The source-aligned seed has therefore failed this simple direct operation.

**Decision:** Retire exactly these two p50 key framings and their 60 direct ISAAC consumers. An independently supplied nonce, different key derivation, non-additive GP29 transport or other source-selected algorithm remains open. A 256-cell dimensional resemblance is insufficient to justify wider ISAAC tuning without an author clue. This is a measured *negative for the bounded mode*, no new authentic ciphertext key or plaintext.
