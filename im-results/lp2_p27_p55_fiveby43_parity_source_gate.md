# p27 five-by-43 source-body parity against p55's 43 word interiors

**Director #582, Agent44, 12 November 2026. Original-input finite negative, no unknown plaintext or authentic key.** The printed correspondence is genuinely exact in size: LP2 physical p27 has **234 GP29 runes**, with a **19-rune red heading and 215 subsequent runes = 5×43**; physical p55 has **76 runes**, a first one-rune continuation carried from p54 and then 16 complete printed words. Removing each complete word's first and last rune leaves exactly **43 strict interiors**, with **33 other printed runes** including the one-rune p54 carry. The 2013 historical five-of-ten sharing protocol and signed 2016 43-word message are possible motivation, yet they supply no authenticated instruction to build this parity code.

## Frozen original relation

The complete p55 word lengths, excluding the initial carry, are **[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**. Its 43 zero-based strict-interior rune offsets, in original page order, are:

\`\`\`text
2 3 10 11 12 13 16 17 18 19 24 25 26 27 28 29 30 31 32 33 34
37 38 39 40 43 44 49 50 51 52 53 56 57 58 59 60 65 66 67 68 71 74
\`\`\`

Let original p27's 215 post-heading indices be \`B[0..214]\` and original p55 strict interior indices be \`T[0..42]\`. Freeze five consecutive printed-order rows: \`R[r,j] = B[43r+j]\`, where \`r=0..4\` and \`j=0..42\`. The proposed simple 2013-native GP29 parity identity is

\`\`\`text
T[j] = (R[0,j] + R[1,j] + R[2,j] + R[3,j] + R[4,j]) mod 29.
\`\`\`

The separately declared historical prime-weight control replaces every rune index with its GP prime weight before the sum and reduces both sides mod29. Neither branch has a fitted coefficient, shift, row/column rearrangement, unequal share ID or language-dependent choice.

## Exhaustive exact 43-column decision

| Predeclared source register | Original exact checks | Columns where the residual is zero | Expected under independent uniform GP29 |
| --- | ---: | --- | ---: |
| Five GP29 rune-index rows | **1/43** | **30** (zero-based) | 1.48 |
| Five GP-prime-weight rows, each side mod29 | **2/43** | **16, 35** (zero-based) | 1.48 |

**All 43 GP-index residuals**, \`T[j] - ΣR[:,j] (mod29)\`, in original order:

\`\`\`text
 7 28  2  4 23 18 13  8 25 23 15 27 17 15  5 15 19 28 28  4 28 27
 6 19  9 16 18  4 26 17  0 21  1 19 19 19 10 15 22 23 10 13 20
\`\`\`

**All 43 prime-weight residuals** under the same frozen source geometry:

\`\`\`text
21 22 26  3 13 15  6  6  1 19 28  4  5 18 17 18  0 18  2 11 18  3
17  5 23 14  7 28 25 24 24  7 24  3 15  0 25 26 17 21  6  8 24
\`\`\`

The independent, **authentically solved p57 GP-native 43-rune prefix**, substituted only as a nonmatching control receiver against the unaltered p27 parity, gives **4/43** index matches. A deterministic, solved-GP-source synthetic 215-rune five-row plant and *its exact generated parity receiver* produce **43/43**, confirming the intended positive arithmetic. Neither the original 1/43 nor 2/43 exhibits a meaningful cross-page parity law; the native-text control by itself produces more accidental matches.

## Decision and reproducibility

This rejects the **specific source-ordered five consecutive 43-rune rows, fixed all-ones GF29 parity, and original p55 strict-interior receiver** under both the rune-index and historical prime-weight conventions. It does not reject unspecified nonlinear shares, unknown field identifiers, hidden row selections, a changing key, or the independently investigated p27/p55 repeated two-word ciphertext (Director #562). A few zero residuals among 43 values are expected chance equalities and do not specify an inverse, source-key or plaintext.

The [standalone runnable CommonJS original-source SFT](../sims/lp2_p27_p55_five_lanes_checksum_sft.cjs) asserts exact original p27/p55 transcript/index agreement, 215/43 source lengths, complete p55 physical word offsets, both 43-entry residual arrays, 1/43 and 2/43 matching locations, original solved-language control, and planted 43/43 parity control. **Stop this precise parity route** without trying shifted rows, extra shares or invented coefficients. A successor needs independent creator-attributable evidence for a different encoding law before any p55 decoder handoff.
