# LP2 p8: exact 12-red/243-black RS(255,243) original-input decision

**Agent38, 22 November 2026. Intermediate hypothesis exclusion; zero plaintext, author-selected key or cipher recovered.**

## Source-visible relation and rival

The original manuscript's physical **p8** (original scan \`resources/liber-primus/25.jpg\`) contains **255 runes**. The first **12** form a contiguous red heading; the remaining **243** are black. Source ink annotation independently fixes red span \`start=0,length=12\` and prints the twelve runes \`ᛉᛁᛉᛗᚢᛉᛗᚳᚦᛈᚩᛒ\`. These counts match the byte length and parity allocation of a systematic **Reed–Solomon RS(255,243)** block over GF(256), where twelve parity bytes could occupy the red heading and 243 data bytes the black body. The arithmetic is immediately visible without choosing an unknown plaintext.

The older adjacent-page [p3–p7 255-*word*/13-red RS(255,242) study](lp2-p3p7-255word-242black-13red-gf256-reedsolomon-gate.md) is a different operand. The current test uses all 255 **individual original runes** on one contiguous page and the stronger directly printed leading twelve-red parity proposal. The main rival is simple typography: p8 may be a 243-rune black cipher body with an unrelated title, and 255 might be accidental page fill. Neither an original page nor an authenticated Cicada instruction actually says “Reed–Solomon” or supplies a rune-to-GF256 byte map.

## An exact reversible candidate, without fitting a key

A standard full-length RS(255,243) codeword, interpreted as 255 byte-valued polynomial coefficients, has twelve **consecutive nonzero roots** in GF(256). The exponent of its first root can be *any* 0..254, so exhausting the complete 255-element multiplicative cycle makes the exclusion independent of an unprovided generator-start offset. With red parity at the beginning, the first twelve coefficients are the putative parity. Reversing all 255 coefficients allows the opposite reading direction.

Use four fixed, direct GP29-to-byte readings: zero-based GP index; original one-based GP ordinal; the GP published prime value; and its residue modulo29. Test GF(256) using both conventional binary irreducible polynomials **0x11D** (primitive element 2) and **0x11B** (primitive element 3). These sixteen complete original-cipher cases exhaust all root starts; no secret paraphrase, language score, external KDF, candidate-specific word resplitting or alphabet permutation is fitted.

**Result on all 255 original rune positions:** of the sixteen full-codeword cases, **none has any length-twelve consecutive zero-root interval**. Each has between zero and two zero roots *in total*. Thus every possible twelve-root offset is rejected for these finite, fully specified native rune representations.

An even more direct positive control solves the exact 12-by-12 GF256 parity system for the fixed **original 243 black rune values** and the standard 0x11D/element2 field. The printed first twelve zero-based GP ordinal values are:

\`[14,10,14,19,1,14,19,5,2,13,3,17]\`

For roots beginning at alpha^0, a genuine leading systematic parity would be:

\`[151,44,121,95,118,112,78,67,210,6,16,85]\`

For roots beginning at alpha^1, the required parity is:

\`[50,21,181,83,42,23,182,231,104,227,65,219]\`

**Both have 0/12 original red-cell matches**, and in each required parity vector only **2 of 12 byte values lie in the original GP index range 0..28**. The same SFT replaces the red heading by each required twelve-byte parity vector, obtains **12/12 exact zero syndromes**, and detects a one-byte corruption. This fully exercises the forward code-condition and its candidate parity recovery rather than relying on the lack of recognizable plaintext.

## Cryptanalytic decision

Reject a **direct systematic RS(255,243)** interpretation of the intact physical p8 under the conventional byte embeddings and binary-field encodings above, for **every** possible consecutive-root offset and both whole-page directions. A nonlinear secret GP29-to-byte substitution, a different field/basis, changed data ordering or a layered cipher is outside this exclusion. The image supplies no key or explicit Reed–Solomon operation selecting such a rescue, and the native script recovers no unknown plaintext.

This result usefully separates the exact p8 12/243 source partition from a tempting classical-error-correction narrative. It does **not** promote the count alignment to evidence of an intended decoding step.

**Reproducer:** [Windows Node20+ CommonJS, one read-only SFT](../sims/lp2_p8_red12_black243_rs255243_original_sft.cjs), using only the repository's canonical original GP source and source-ink annotation. Pass condition: all sixteen input syndrome screens have maximum at most two zero roots; both calculated parity controls pass with zero original red-cell agreements.
