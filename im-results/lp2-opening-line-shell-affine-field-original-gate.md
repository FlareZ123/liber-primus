# Original p0–2 line-shell GF29 affine interpolation

**Agent7, 23 November 2026. Conditional original-cipher source-operand negative, no recovered plaintext or authenticated key.** [Single-file source-exact reproducer](../sims/lp2_p0_p2_line_edge_affine_interpolation_original_sft.cjs) · earlier [source observations](lp2-opening-line-edge-complete-alphabet.md).

## Source-led proposed inverse

The original 2013 Cicada OS says **“THE KEY IS ALL AROUND YOU”** and original solved p57 speaks of **shedding circumferences**. The original p0–2 printed 33 black rune lines, following an independent 13-rune red header, yield exactly 66 exterior runes and 650 interior runes. All GP29 glyphs first appear within the first 46 external glyph positions. The previously reviewed source geometry, page rune inventories and 33 actual line widths are checked byte-for-byte by the SFT. The red heading is excluded from the target.

This test is materially distinct from the [historical Vigenère first-occurrence alphabet transfer](lp2-opening-line-edge-complete-alphabet.md), the separate [custom alphabet red13 autokeys](lp2-p0-edge29-red13-evolving-autokey-original-gate.md), or period13/50 stationary column alphabets: consume **each printed line's own first and last runes as two boundary conditions of one linear shift key**.

For each original black line of width \`L\` and original endpoint GP indices \`a\`, \`b\`, uniquely interpolate over the source's 29-prime field, where all actual widths are 7–25 and \`L-1\` is invertible:

\`\`\`text
K[j] = a + j*(b-a)*inverse(L-1) (mod29), j=1..L-2
P[j] = C[j] - K[j] (mod29)
\`\`\`

No guessed seed, F skip, rotation, keyed alphabet, phase, reset, or plaintext-scored parameter enters the 650-rune decoder. Original line endpoints remain untouched. The obvious weakest premise is an unauthenticated transfer of finite-field interpolation to these visible line shells; neither original signed source instructs that operation. The fact that a field interpolation is uniquely defined does **not** prove it is the author's code.

## Actual original result

| Original black-line interior partition | Original IoC | Candidate IoC |
| --- | ---: | ---: |
| All 650 runes | **0.034149579234** | **0.034367666232** |
| First 225 p0 runes | — | **0.035158730159** |
| Disjoint 425 p1–2 runes | — | **0.033740288568** |

The output starts \`AE W P R TH Y I H H B E T IA AE G A Y Y AE O R EA J H H L T L G B L AE C OE OE H Y EA T H OE M D U W D I U A O U Y P S F EO EA W W L TH\`. The full 650 decrypted rune spellings are printed by the SFT. There is no coherent original native-GP prose, ciphertext key, or destination in the original p0 segment or the disjoint p1–2 continuation. The original output remains close to 29-ary uniformity.

The SFT verifies **716/716** black original runes after exact candidate re-encryption, preserving the 66 exterior runes. An independent planted native-English positive consists of actual original p57's 95 known-clear GP runes repeated into 650 positions, forward encrypted with the 33 original source endpoint pairs and line widths, then recovered **650/650 exactly**. The exact arithmetic implementation works when the proposed encoder really was used.

**Decision:** retire this one fully frozen source-shell affine-interpolation GP29 inverse on original p0–2. Any new source consumer needs an independently printed operation assigning another endpoint transformation or key clock; tuning interpolants or line lengths after observing the output would not advance decoding. This does not disprove unusual 29-symbol edge coverage or any unknown original cipher mechanism. All 56 actual unsolved LP2 pages remain unsolved.
