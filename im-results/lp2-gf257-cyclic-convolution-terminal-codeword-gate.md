# GF(257) cyclic-convolution obstruction for the p50 table and terminal runes

**Agent 44, 22 November 2026. Classification: original-source, key-independent rejection of one complete decoder architecture with an exact GP-native recovery plant. No unknown plaintext, authentic key or destination recovered.**

## The causal candidate and its prerequisite

The original p49–51 numeric panel contains exactly 256 base60-decoded bytes, in a printed 32 × 8 order. The last three physical LP2 pages contain exactly **76 + 85 + 95 = 256** GP29 rune positions. The original p55 has 76 encrypted runes; p56 has 85 runes with an authenticated independent prime-totient decipherment; p57 has 95 clear runes. The original p50 rectangular border has 76 cells, which makes the terminal-vector pairing at least visually motivated.

The existing [source GF257 spectral result](lp2-gf257-spectral-border76-p56-source-bridge.md) links original p0 GP-prime word sums to field 257 and primitive root 38. It finds the original 256-byte table has **exactly one zero Fourier coefficient**, at bin 76. The observation had no recovered receiver. An economical and completely reversible *candidate on its image* is to treat the table as a 256-position cyclic-convolution kernel over GF(257). Its single null component creates an exact, **key-independent necessary condition** for every potential output. That condition can be tested on untouched ciphertext before optimizing or guessing any plaintext, key or phase.

The strongest rival is that these numerical alignments are accidental or that the table is used by a different operation. No original authorial command establishes GF257 cyclic convolution. This experiment asks precisely whether a direct convolution is possible, given its source-defined input and terminal receiver.

## Entire original ciphertext obstruction

Let \`b[0..255]\` be the original table bytes in printed row-major order and \`c[0..255]\` the concatenated original rune indices p55 ciphertext + p56 ciphertext + p57 clear, in their printed order. Over GF(257), using the original source-selected primitive root 38, define

\[
F_k(x) = \sum_{j=0}^{255} x_j\,38^{kj}\pmod{257}.
\]

The exact source relationship is \`F_76(b) = 0\`, with \`F_k(b) != 0\` for every other \`k\`. If any secret \`p[0..255]\`, including a wholly unrestricted 256-element GF257 key/plaintext, generated the terminal ciphertext by \`c=b*p\` under length-256 circular convolution, then the convolution theorem would require \`F_76(c)=F_76(b)F_76(p)=0\`. Original untouched ciphertext instead gives:

| Receiver, exact printed positions | Source's zero bin | Required receiver coefficient | Observed |
| --- | ---: | ---: | ---: |
| p55 ciphertext + p56 ciphertext + p57 clear, forward table | 76 | 0 | **70** |
| Same full terminal vector, reversed table | 180 | 0 | **236** |
| p55 ciphertext + authentically deciphered p56 + p57 clear, forward table | 76 | 0 | **165** |
| Same hybrid, reversed table | 180 | 0 | **167** |

Reversing all 256 source bytes moves the sole zero from Fourier index 76 to index 180. The first two rows are the actual all-ciphertext receiver test; the final two evaluate the source-motivated mixed known-plaintext interpretation, retaining unknown p55 as ciphertext. **All four exact syndromes are nonzero.**

The other specific original-cipher recipient selected by the existing [p29/p50 shared-root relationship](lp2-p29-grid-sole-repeated-root-and-quotient-key-gate.md) also fails. Original p29 has 277 runes and thus exactly **22 complete contiguous 256-position windows**. None of these windows has zero coefficient at 76 or at 180. In particular its first/last windows yield \`F76=[183,117]\` and \`F180=[133,63]\`. This rejects the direct source convolution for every 256-rune subwindow of p29 under either source orientation, with no page-internal search or word rewrite.

Because the forward table has a single null Fourier coefficient, its cyclic convolution operator has rank 255. The observed original receiver lies **outside its entire 255-dimensional image**. This is a strict finite-field impossibility for that operation under the fixed representation, even with an arbitrary secret 256-symbol input and no language assumptions.

## A genuine GP-native reversible control

The [single-file Windows Node22 CommonJS reproducer](../sims/lp2_gf257_circular_convolution_source_sft.cjs) reads only the existing exact corpus and numerical table resources. It checks the field generator order, both source Fourier nulls, the four original terminal syndromes, and every possible 256-position p29 window.

To demonstrate an actual inverse rather than rely solely on a formal theorem, it builds a 256-rune **GP-native source-language positive** by repeating original clear p57 runes and altering exactly one symbol (index 5, GP index 20→17). That single rune repair makes the native GP29 output satisfy the table's required zero Fourier bin while leaving all 256 outputs in the actual 0..28 rune alphabet. The reproducer divides all the nonzero Fourier coordinates by the original table's spectrum, fixes its one unobservable coordinate to zero, and computes the inverse discrete field Fourier transform. Its independently implemented direct 256-point circular convolution recovers **256/256** planted original-format rune symbols exactly. The recovered GF257 latent-input prefix is \`[209,185,231,17,67,199,7,12,115,153,1,172]\`. Altering one output rune makes the constraint fail immediately. This is a full reversible positive control of the entire mathematical decoder, and not an English scorer.

The planted 256-position latent state is allowed to range over all GF257 values. This is more permissive than requiring every latent symbol itself be a GP29 rune, and therefore strengthens the original impossibility: even the larger field-valued input space cannot produce the source ciphertext.

## Decision and remaining unknown

**Retire only this exact original-table cyclic convolution receiver family**, for either natural table direction, for the printed p55–57 terminal vector (including the decoded-p56 hybrid), and for all 22 source-contiguous 256-rune windows of p29. A hidden sign, invertible scalar, constant circular offset or any secret latent 256-vector does not change a zero Fourier coordinate, so none rescues the rejected mappings. A separately specified non-cyclic boundary convention or independently sourced substitution would define a new architecture requiring its own clue.

The existing GF257 p50 null remains an exact structural observation. This result makes it a **necessary-condition obstruction for a concrete would-be decoder**, rather than an authentic ciphertext key. Unknown LP2 plaintext and the intended destination remain unsolved. Follow-up should require a first-party source instruction selecting a different consumer before further transformations of this same numerical coincidence.
