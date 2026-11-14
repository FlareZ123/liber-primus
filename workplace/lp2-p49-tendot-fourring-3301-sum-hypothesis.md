# Candidate p49 ten-dot / four-ring integer checksum for the printed 256-cell table

**Agent 20, 14 November 2026. Evidence class:** exact original-source arithmetic and an unconfirmed human solve-path hypothesis. **No new unknown Liber Primus plaintext, cipher key, or next-stage destination is recovered.** This is *not* an independently authenticated checksum, and the arithmetic association remains post hoc.

## Observable operands and direct numerical result

- The original physical LP2 **p49** text ends with an upright, **ten-red-dot** punctuation stencil immediately before the numeric grid. The independently image-audited same stencil also appears at p36, p38, and p56; it functions as a block marker, not an established number. See [cross-release original-JPEG geometry and four placement controls](../im-results/lp1-lp2-red-stencil-cross-release.md).
- The printed table is exactly **32 rows by 8 columns** over physical pp49–51. Peeling this width-8 rectangle yields precisely **four concentric rings**, previously documented as 76, 68, 60 and 52 cells ([existing terminal geometry study](../im-results/lp2-p50-76-perimeter-180-interior-source-partition.md)).
- **3301** is the puzzle's original identifying number. Its appearance here is a *hypothesized* normalization, not a printed p49 instruction.
- The unchanged source transcription **resources/liber-primus/lp2-grid-256.json** contains 256 two-character numerals. Under the previously studied conventional sixty-digit alphabet, their 256 byte values have SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**.

The **new exact original-table observation** is

\[
\sum_{i=0}^{255} B_i=\boxed{33,006=10\times3301-4}.
\]

This permits a *conditional* human-readable checksum interpretation: the ten-dot marker supplies the factor 10, the four table circumferences supply 4, and 3301 supplies the multiplier. It would give a player a way to check the unusual base-60 reading and table transcription before using the complete bytes. No source says to add the values, subtract the number of rings, or use the marker as a factor. An arithmetic fit does not authenticate this putative checksum.

## Source-fixed radix discrimination

In the conventional 60-symbol alphabet, the **256 literal printed tokens** have high-digit index sum **424** and low-digit index sum **7,566**. Consequently their summed numeric value for an otherwise unchanged positional base \(r\) is

\[
S(r)=424r+7566.
\]

If the hypothesized checksum were genuinely intended, it would select exactly **\(r=60\)**:

\[
424r+7566=33010\quad\Longrightarrow\quad r=60.
\]

The previously compared *valid* radix-59 alternative uses the otherwise same alphabet **omitting lowercase f** and yields total **32,499**, not 33,006. Five formerly disputed external readings at flattened cells 45, 50, 165, 172 and 246, when applied together in place of the original-image-adjudicated values, yield **33,035**, also failing the putative checksum by 29. These are useful discriminator consequences **if and only if the checksum premise is real**. The joint H/G polynomial divisibility already discriminates the same two radix readings, so this must not be counted as an independently established decoder or as a new proof that base60 is intended.

The sum is **permutation-invariant**: reversing every byte or applying an arbitrary row/column rearrangement preserves it. It cannot select a route, table traversal, cipher clock, GP-rune alphabet or key. A one-byte original-value edit can invalidate the equality, so the equation could serve as a weak error check, but many compensating edits preserve it. The five-cell historical alternative is a pre-existing control, not a blind withheld prediction.

## Decision and falsification standard

This is a narrow potentially useful *source-shape arithmetic constraint*, preserved in [the exact CommonJS reproducer](../sims/lp2_grid_3301_tendot_checksum_sft.cjs). The runner fixes the original 256-byte SHA, page and row geometry, source alphabet, digit sums and original values; compares the rival 59-symbol reading and independently recorded five-cell variant; and demonstrates edit sensitivity and ordering invariance. Run with Node.js 22:

    node sims/lp2_grid_3301_tendot_checksum_sft.cjs

**Do not expand it into an encryption model or promote it to an established Cicada instruction.** The choices of ten dots, four rings and 3301 were connected after seeing the byte sum, amid a heavily searched manuscript. Repeated 10-dot punctuation elsewhere and the absence of a printed numerical operation are substantial objections. Independent author-linked evidence saying “sum the table,” or an unfitted prediction on newly recovered original bytes, would be needed to recognize an intentional checksum. Until then it supplies no causal path beyond a conditional radix and transcription check. The manuscript's 56 unknown pages remain unsolved.
