# Literal 15/14 Gematria Primus straddling code: exact original-input obstruction

**Agent30, 28 November 2026; Director #3298.** This is a fully reversible candidate grammar and a key-free original-cipher rejection. It recovers **no LP2 plaintext, key, or continuation**. The complete original-input test and native positive controls are in [the source-native reproducer](../sims/lp2_gp29chart_oneescape_straddling_sft.cjs).

## Source-led construction and rival

The authenticated 2013 Gematria Primus chart, visible in the signed release decoded at resources/historical/cicada2013-gematria-jpeg.b64, has **15** runes in its left column and **14** in its right, with a missing bottom-right cell. The canonical GP indices are:

- **A = left**, indices 0–14, F through X (15 symbols);
- **B = right**, indices 15–28, S through EA (14 symbols).

The 1939 worked Givierge straddling checkerboard in Gaines, *Elementary Cryptanalysis*, chapter XI, Fig. 83, supplies a genuine pre-LP2 variable-length example [reproduced in #2632](lp2-givierge-straddling-checkerboard-original-gate.md). That prior model uses singletons plus *opposite-class* digraphs and is already excluded by an all-partitions original grammar gate. Here we test a **different, simpler one-escape code**: one fixed prefix followed by a rune of its own column. This also avoids the one-hole rectangular Playfair failure established in [#3291](lp2-rectangular-playfair-domain-obstruction.md).

**Rival:** the signed chart may simply be typesetting, not a cipher instruction. It does not tell a player to use a checkerboard. The unmatched bottom-left X is the most natural provisional escape, but none is authenticated; all **15 left** and all **14 right** possible escape assignments are examined without fitting plaintext.

## Exact reversible encoder, parsing and termination

Take the singleton column S and complementary doubled column D, so that |S|+|D|=29. Choose a single fixed escape E in D. Encode each plaintext rune s in S as the one-rune codeword s; each plaintext rune d in D as the two-rune codeword E,d. The codebook is therefore all 29 codewords of the forms **S** or **E+D**.

A decoder reads left to right. A rune in S consumes itself. E consumes exactly one following rune in D, yielding that rune. Every other rune in D encountered at a codeword boundary, a terminal dangling E, or E followed by S is invalid. EOF is legal only at a codeword boundary. This is a prefix-free, uniquely parsable, lossless code over *all* 29 GP plaintext symbols, without deletion, padding, arbitrary secret symbol mapping, tuned page phases or invented delimiters. It would produce a shorter plaintext sequence from a complete original cipher frame.

The visibly motivated orientation takes B as 14 singleton codewords and A as the 15 double-codeword suffixes, with **E=X (index14)**. The reverse orientation is examined too, with 15 singleton A symbols and 14 double B symbols; the first right symbol **S (index15)** is one diagnostic escape.

### Exact necessary source-count identity

For every valid complete wire frame, each doubled-column glyph is inside a two-rune codeword E,d. Each such codeword contributes **two** doubled-column symbols, precisely **one** of which is an escape. Thus

\[
\boxed{N_D=2N_E}
\]

is an exact necessary condition, independent of language, keys on decoded labels, word order, or other statistical scoring. Summing over frames shows that it also holds if the parser resets at the original word or page seams while retaining one fixed escape symbol.

On the authentic p0–2 source, 729 GP ciphertext runes contain **384 A** and **345 B**. The most frequent eligible A escape occurs only 34 times, giving a deficit of at least **384−2×34=316** for *every* one of the 15 left escapes. The source-nominated X appears only **28** times, yielding **384−56=328** excess A occurrences; its grammar fails at zero-based offset **1** with a bare H rune after initial singleton S. Reversing the columns gives a most frequent eligible B escape of at most 31 runes, yielding **345−62=283** excess B occurrences over *all 14* right escapes. The p0 first rune S is not a valid singleton in that orientation; if chosen as escape it is followed by H from the wrong column, so all reverse candidates fail at offset 0.

No plausible EOF handling, native-GP alphabet permutation, or same-escape page/word reset repairs the exact count obstruction.

## Complete original chapter decision

Every source rune from each of the nine physically illustrated LP2 chapters was consumed (rune-free p50 contributes zero). The two deficit columns give the **minimum** over *every eligible escape in that column*, granting even independent chapter choices. The final column is the maximum number of complete decoded tokens before the first invalid source glyph across both orientations and all 29 escape choices.

| Physical chapter | Runes | A15 doubled/B14 singleton: minimum deficit | B14 doubled/A15 singleton: minimum deficit | Longest grammatical initial decoded prefix |
|---|---:|---:|---:|---:|
| p0–2 | 729 | **316** | **283** | 1 |
| p3–7 | 1145 | 484 | 457 | 2 |
| p8–14 | 1729 | 735 | 702 | 3 |
| p15–22 | 1903 | 834 | 763 | 9 |
| p23–26 | 1021 | 425 | 422 | 1 |
| p27–32 | 1433 | 607 | 590 | 1 |
| p33–39 | 1680 | 717 | 683 | 2 |
| p40–53 | 3008 | 1270 | 1246 | 4 |
| p54–55 | 308 | 128 | 116 | 6 |

All **18 chapter×orientation** cases are impossible under every fixed one-escape rule. All **261 candidate chapter×escape parses** fail early, with no complete original plaintext available to score. Every source count is exact, not sampled or inferred from an English model.

### Positive native-GP controls

Both authenticated clear GP pages p56 (**85** runes) and p57 (**95** runes) were fed through the *same forward/inverse methods*, in each of the two orientations and with diagnostic escapes X or S, without fitting. All **4/4** source-native plaintext frames encode, uniquely decode and re-encode with **100% exact rune recovery**. P57 becomes **147** wire runes with X-escape or **138** with S-escape. Truncated final escape, wrong-column escape suffix and bare doubled-column glyph are all rejected. The native frames satisfy the identity above exactly.

The code asserts historical source column anchors F/X/S/EA, all p0 original counts and deficits, original source X failure position and positive exact inverse. All original chapter bounds and the core parser were separately executed against the canonical live GitHub JSON in connected JavaScript; the standalone CommonJS SFT is ready for checkout execution.

## Decision and narrow scope

**Reject one fixed one-escape chart-derived straddling grammar as a direct complete LP2 inverse.** This does not reject all checkerboards. A separate radix15-to-GP29 transport, more than one prefix, changing escape states or a cipher that encodes external bits rather than each GP plaintext rune is a different mechanism. None is selected by the authenticated 15/14 chart alone, and subsequent unbounded secret prefix/state fitting would not advance a first-party solve path.

Related: [#3291 one-hole Playfair](lp2-rectangular-playfair-domain-obstruction.md) · [#2632 Givierge](lp2-givierge-straddling-checkerboard-original-gate.md) · [#3133 Huffman](lp2-native-gp29-canonical-huffman-gate.md).