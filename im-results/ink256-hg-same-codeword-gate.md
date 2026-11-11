# Ink-event register as a second p50 H/G codeword: exact original-source obstruction

**11 November 2026, Agent 47. Classification: bounded original-input negative for Director Issue #359.** No unknown Liber Primus plaintext, key, or source-selected decoder is recovered.

## Why this particular consumer can be tried without key fitting

Two visibly countable original objects each have exactly **256 elements**: the 32×8 two-character numerical table across physical pages 49–51, and the chronological sequence of **225 red runes plus 31 thirteen-dot punctuation marks** over physical pages 0–57. Separately, a signed 2013 Cicada BASE29 example and the physical p39 red triad give the independently fixed GF(29) factors

\[
H(X)=3+26X+24X^2,\quad G(X)=27+5X+15X^2,\quad
F_{\mathrm{monic}}(X)=X^4+28X^3+13X^2+9X+14.
\]

The printed table's canonical base60 values satisfy both factors when read as descending-power GF29 coefficients. The candidate consumer is therefore a literal second 256-symbol codeword: might the independently visible 256 ink events obey the same exact source-defined four equations? This test requires no unknown plaintext, cipher key, invented parity locations, or training on the intended output.

The original rune classes are mapped to zero-based GP index, one-based GP ordinal, or the printed GP prime values. Each thirteen-dot mark is separately read as zero, its visible count 13, or the total count of such marks 31. That is **nine fixed source-based event encodings**, retaining every event and its original page/rune order. Every nonzero global affine GF29 recoding \((a x+b)\bmod29\) is then allowed, covering **812** alphabet relabelings per encoding, a stronger key-independent gate than trying only Caesar shifts.

## Exact original-input outcome

The original 256-byte table is the unchanged positive H/G/F codeword, with all four syndrome coefficients zero. The 256 event readings are not F codewords:

| Red-rune symbol | Marker value | Four GF29 syndrome coefficients (constant term first) |
| --- | ---: | --- |
| Zero-based GP index | 0 | [20,4,22,13] |
| Zero-based GP index | 13 | [0,22,19,2] |
| Zero-based GP index | 31 | [8,9,26,18] |
| One-based GP ordinal | 0 | [11,19,10,28] |
| One-based GP ordinal | 13 | [20,8,7,17] |
| One-based GP ordinal | 31 | [28,24,14,4] |
| GP prime values | 0 | [27,16,9,21] |
| GP prime values | 13 | [7,5,6,10] |
| GP prime values | 31 | [15,21,13,26] |

For a 256-term constant sequence, the F syndrome is [14,3,19,3]. Therefore a global affine relabeling has syndrome \(a\,s+b[14,3,19,3]\) modulo29. None of the **9×812=7,308** proposed recodings annihilates the original-event syndrome. In particular, the source-natural zero-based GP rune / literal 13-dot count fails the two component checks separately, with H syndrome **[13,16]** and G syndrome **[25,11]**.

A second exact question follows from the printed **32 rows** and **31 markers**: can each *red-only* segment between consecutive thirteen-dot marks encode one complete eight-byte table row by an arbitrary, but stationary, deterministic function? The 31 marks partition the red stream into **32 source-chronological segments**, **15 of which are empty**. The other 17 segments are pairwise distinct. All **32 table rows are distinct**. Consequently an arbitrary stationary row decoder \(f(\mathrm{red\ segment})\), even one chosen after seeing the table, can match **at most 18/32 rows**, with **at least 14 unavoidable mismatches**. An independently supplied row index, extra positional state or the intervening black ciphertext would change this premise.

### Independent black-stencil starting point (source-anchored extension)

The original p7 image also has **the only black thirteen-dot stencil**, at physical p7 after local rune 194, co-located in rune coordinates with a separate red thirteen-dot mark. Chronological event ordinal **50** (zero-based) is therefore a unique *visually selected* possible origin for the otherwise circular 256-event stream. The exact original-source extension of the reproducer rotates the complete event register either to place this black mark first or to begin immediately **after** it, keeping the unchanged numeric table in its printed row-major order. The nine symbol/marker conventions and all **812** affine recodings remain fixed.

These rotations are mathematically distinct checks: the component (G(X)=X^2+10X+25=(X-24)^2) has a double root, while (X^{256}-1) is square-free over GF(29) because 29 does not divide 256. Thus F does not divide (X^{256}-1), and cyclically shifting 256 coefficients need not preserve their H/G syndrome.

The two possible black-anchored starts yield zero H/G/F codeword matches across **2 × 9 × 812 = 14,616** original-input recodings. Under the source-natural GP index plus literal-thirteen marker, the four F syndrome coefficients are **[28,22,7,6]** (black mark first) and **[6,8,21,27]** (immediately after). Both differ from zero and from the unrotated **[0,22,19,2]**. The exact first/after-black syndromes for all eighteen cases and the strict source event-coordinate assertion are preserved in the same SFT.

Combining the original chronology and the two source-anchored rotations gives **21,924** independently checked event-recoding/black-anchor configurations with no direct F codeword. This new gate resolves a particular original visual selector, rather than selecting the event offset after seeing the table. The black marker could still be a start for a genuinely different, source-specified stateful operation; this finite negative does not establish that any such operation exists.

### Independent 2014 256-byte candidate: no common H/G codeword

The surviving 2014 Stage04 `<!--1033-->` 256-byte object (canonical bytes pinned in [the prior source-identity SFT](../sims/lp2_stage04_256_direct_identity_sft.cjs), SHA-256 `d8c0f83cf91d0deda658035e3eb07712b12e72b36ed0e471a71a2fe07dd14ba6`) is the same size as the LP2 p49–51 printed table, an independent historical candidate for reuse of a 256-byte register. Applying the **unchanged** printed-order H, G and F code checks to those actual bytes gives H syndrome **[1,22]**, G **[15,4]**, F **[7,18,17,16]**. All are nonzero, in contrast to the LP2 table's four zero coefficients. Reversing the 2014 bytes gives F **[3,11,17,11]**, also nonzero. This rejects literal shared H/G-codeword formatting of the two original 256-byte objects under either of their two simple recorded byte orders. It does not refute another, unspecified relation. The checked-in reproducer now asserts the 2014 original-order residues against the existing source fixture.

## What this settles

The known p50 H/G four-check format cannot be copied **literally** onto the 256 red-plus-thirteen-dot event register under these nine source-grounded encodings or any of their 812 affine recodings. A second, independent stationary red-segment→eight-byte-row interpretation also has an exact duplicate-input contradiction. Both observations are constraints on *literal reuse*, not a rejection of nonlinear encryption, a positional map, an external key, or a rule selecting a different set of 256 coefficients.

This result is distinct from the existing same-ordinal stationary **byte→event lookup** obstruction ([prior original-input report](ink256-grid256-source-lookup.md)), the 256 **contiguous ciphertext** window H/G census ([prior report](lp2-256window-dual-factor-codeword-gate.md)) and the 32 **all-rune fragment** digest tests ([prior report](grid-section-digest-screen.md)). The red-only segment test deliberately does not conflate its 15 empty intervals with the all-rune partition's two empty intervals.

The next useful step on Issue #359 still requires an original instruction selecting the coefficient carrier, clock and decoding operation. The table's four global checks alone do not supply these or decode any of the unknown 12,956 runes. Avoid launching new affine variations of this failed literal channel.

**Independent Node.js 22 CI:** [successful manual original-source run 43112081147](https://github.com/FlareZ123/liber-primus/actions/runs/43112081147) executed the full 21,924 affine/anchor checks and the separate red32 table inverse. Both steps passed.

**Reproduction:** [single-run CommonJS source test](../sims/ink256_hg_same_codeword_gate_sft.cjs) reads exactly the checked-in canonical table, GP alphabet and original ink annotations, asserts the table positive and all nine original syndromes, exhausts all 7,308 global affine maps, and proves the 14-row stationary-record lower bound. No fresh corpus transcription, OCR, historical-source search or fitted plaintext model is needed.
