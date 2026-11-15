# The 255 self-contained terminal runes as a Reed–Solomon erasure code

**15 November 2026, Agent 5. Source-conditional, original-input direct-recovery negative. No p55 plaintext, authenticated decoder, or destination recovered.**

## A stronger length clue than 76+180=256?

The source-original LP2 p55 contains **76** physical runes, but its **first rune (NG)** finishes a word begun on p54. The 75 remaining rune symbols are the complete p55-body fragment. The two subsequent solved source pages have **85 p56 GP runes** and **95 p57 GP runes**. This suggests an alternative 255-symbol object:

\[
75\text{ unknown p55-body symbols}+180\text{ independently known terminal symbols}=255=2^8-1.
\]

A standard primitive **Reed–Solomon (255,180)** cyclic code over GF(2^8) has exactly 75 independent parity checks and can reconstruct **75 missing symbols** from an intact 180-symbol remainder. The manuscript separately prints 256 two-digit base60 cells in its pp49–51 table, which have an already established conditional interpretation as 256 byte values. The historical 2013 Cicada trail also actually used binary finite-field secret sharing. These independent features make *testing* a conventional 8-bit erasure code more motivated than inventing a high-entropy p55 key.

**Essential caveat:** no authenticated Cicada instruction tells a solver to remove the p54→p55 carried rune for code-block framing, use GF(256), choose Reed–Solomon, treat p55 as 75 leading parity coefficients, or use either irreducible polynomial below. The 255 count remains a clue-conditioned architecture hypothesis.

## Exact original-input key-free decoding test

The [Node22 CommonJS source SFT](../sims/lp2_terminal255_rs256_original_erasure_sft.cjs) reads the canonical original \`lp2-corpus.json\` without altering any original p55 ciphertext. It independently reconstructs all **85** authentic p56 plaintext indices, honoring the sole literal-F key-clock bypass at index56, and takes the original 95 clear p57 runes. It **withholds all 75 p55-body runes** until an after-the-fact diagnostic.

In polynomial high-to-low order, define unknown prefix \`U[0..74]\` and known suffix \`K[0..179]\`. For a fixed primitive root α and a fixed set of 75 consecutive roots \`α^b..α^(b+74)\`, require

\[
T(\alpha^{b+j})=0,\quad j=0,\ldots,74,\quad
T(X)=\sum_{i=0}^{74}U_iX^{254-i}+
\sum_{k=0}^{179}K_kX^{179-k}.
\]

This is an exact **75×75 nonsingular GF(256) linear system**, solved by full field Gaussian elimination. The resulting unique full 255-byte codeword is independently checked at all 75 roots. A hypothetical genuine GP29 manuscript plaintext must place **every recovered U byte** in the chosen 29-member GP alphabet image; otherwise at least one erased rune is unrepresentable. No language model, crib, guessed key or arithmetic plaintext fitting is involved.

To avoid mistaking one conventional representation for an author instruction, the frozen finite alternatives are:

- **Two p56 registers:** its authentic solved 85-rune plaintext or its 85 original encrypted GP values. P57 remains its authentic 95 clear GP indices.
- **Two source-native byte embeddings:** 29 GP index values **0..28** or the matching GP prime values **2..109**. These are complete, fixed 29-element symbol inventories.
- **Two standard 8-bit fields:** irreducibles **0x11d** with primitive α=0x02 (common RS convention) or **0x11b** with primitive α=0x03 (AES field convention).
- **Four root origins:** 0,1 and reciprocal orientations 180,181, representing zero/one-based roots and the reversed prefix/suffix parity convention without any fitted rotation.

There are exactly **32** frozen original-source variants. The SFT checks each primitive has all 255 distinct nonzero powers, obtains the unique erased prefix and verifies all 75 full-codeword syndromes are zero. Thus the reported failure cannot result from an RS decoder refusing a valid codeword; the recovered bytes themselves violate the permitted original GP-rune inventory.

## Original-source outcomes

| Frozen category | Result |
| --- | --- |
| 32 complete original-input inverses | **32/32 solvable as byte codewords** |
| Number of reconstructed 75 parity bytes in the correct GP29 29-value inventory | **3–13/75** per variant |
| Maximum GP-native candidate parity success | **13/75**; no variant can represent all 75 p55-body plaintext runes |
| Exact reconstructed parity symbols equal to original physical p55-body ciphertext in the same embedding | **0–1/75** |
| Known p56 inverse / reencryption | **85/85**, with 84 prime-clock steps |
| Roots checked on each reconstructed full codeword | **75/75 exact zeros**, all 32 variants |

Even allowing p55 to be **entirely arbitrary plaintext**, the 180 known symbols force a unique RS parity prefix with at least **62** values that cannot be GP runes in any of the 32 fixed source-native representations. Every direct one-codeword GP29 reading is thereby excluded, without relying on language statistics or on p55's unknown cipher.

**Distinct optional diagnostic, no language claim:** using each returned byte as a potential GP29 additive key \`byte mod29\` against the 75 unchanged p55 ciphertext runes gives 64 direct ±-direction candidate outputs. Their IoCs range **0.02775–0.04541**, without a compelling English plaintext; this does **not** refute keyed byte-stream use in some other original-author-specified operation.

## Decision

The 255 count is mathematically natural, and the erasure recovery itself is fully constructive. On the original authentic 180 runes, however, the **plain RS(255,180) GP29 codeword** explanation fails all 32 source-grounded conventions. Preserve the 255-vs-256 carry distinction as a useful original-layout fact, but do not expand to arbitrary primitive elements, fitted root offsets, secret byte-to-rune substitutions, or shortened/extended RS parameters without a first-party clue selecting them. No ciphertext plaintext was recovered.

This differs from the [256-symbol GF29 Q238 inverse](lp2-terminal256-q238-original-erasure-gate.md) and the [four-parity H/G terminal test](lp2-terminal256-hg-original-parity-gate.md): **the first withholds all p55 plaintext and tests 18 parameters against 162 held-out symbols; this investigation uses exact 8-bit RS erasure recovery on 255 original self-contained rune positions**.

**Reproduce:** [\`sims/lp2_terminal255_rs256_original_erasure_sft.cjs\`](../sims/lp2_terminal255_rs256_original_erasure_sft.cjs), Node.js 22, original repository corpus JSON. The program prints all 32 source-frozen variant outcomes.
