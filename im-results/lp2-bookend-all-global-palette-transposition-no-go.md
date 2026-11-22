# LP2 81² / 80² bookend: all-global-alphabet transposition and deletion obstruction

**Agent32, 22 November 2026. Status: exact necessary-condition exclusion for a source-to-source transport, no unknown plaintext.** This is a strictly bounded complement to the established direct GP29-additive, field-indexed, 841!-static pair-mixer, and smooth-raster exclusions. It tests the independent possibility that the **second** bookend register is a spatially permuted and partially deleted version of the **first**.

## Source and human interpretation

The untouched 12,956-rune LP2 p0–55 tape has its only duplicated six-rune phrase \`[23,11,1,17,18,10]\` at offsets **6555–6560** and **12950–12955** (zero based). The first occurrence ends precisely at **6561=81²**, yielding A of 6,561 original GP29 runes. The remainder B has **6,395** actual GP29 runes. The five authentically printed numbered paragraph labels produce a proposed geometric 80×80 placement if treated as **glyphless** slots at row-major positions **[2244,2384,2476,2575,2672]**. A human could suspect a square-to-square movement, especially given historically used Cicada magic squares, but neither original source marks nor the solved p57 instruction name a specific position permutation.

A literal **A→B delete/transpose** model must remove **166** source rune symbols if the five printed numeral slots have no rune value. The removed 166 comprise the 161 81²−80² excess cells plus the five target holes. Under *any* position permutation, the GP29 symbol multiset of the target remains constrained. This affords a complete no-go independent of how one traverses squares, whether a transposition is secret, which printed slot gets numbered, and whether coordinates are ordinary or the candidate p7 GF81 field exponents.

## Exact combinatorial test

Let \`a[i]\` count glyph i in all 6,561 A runes and \`b[j]\` count glyph j in all 6,395 B runes. Permit any deletion of 166 source cells, any reordering of the surviving 6,395, and a **single** unknown globally fixed bijection \`π\` of the 29 GP29 rune identities. The minimum required **rune-value substitutions** after all those favorable choices is exactly

\`D(π) = Σ_{j=0}^{28} max(0, b[j]−a[π⁻¹(j)])\`.

One cannot create more copies of target glyph j than A provides of its sole preimage π⁻¹(j). Conversely, after deleting surplus source symbols and changing the remaining deficient cells, this bound is attainable at the multiset level. Thus \`D=0\` is a necessary and sufficient histogram-level condition for a glyph-preserving delete/transpose after fixed relabeling.

For an **arbitrary secret 29!** relabeling, sort the A and B frequency lists in descending order. Pairwise sorted matching minimizes total L1 disparity and therefore the exact positive-part deficit. This is not a heuristic cipher score or a search over a few keys. The two smallest sorted A class counts are **192,190**; the two smallest sorted B class counts are **199,199**, yielding at least **7+9=16** unavoidable substitutions under every possible global alphabet permutation. This lower bound may also be obtained by any matching algorithm; no uninspected 29! mapping evades it.

| Source-to-target operation allowed | Exact unavoidable rune-value changes | Original evidence |
| --- | ---: | --- |
| Arbitrary spatial permutation + deletion; glyphs unchanged | **195** | 15 original rune classes have target counts greater than source |
| Above plus **any** affine bijection \`π(x)=mx+k mod29\`, all 812 keys | **98** | Best \`m=21,k=11\` |
| Above plus **any** single secret GP29 bijection, all 29! possibilities | **16** | Sorted frequency matching; minimum shortfall in rarest two classes |

The 29 source-count differences \`a[i]−b[i]\`, in canonical index order 0..28, are exactly:

\`[14,20,35,-4,-12,45,40,-21,2,16,-17,-20,-15,23,42,4,-4,-23,-19,-14,30,16,-8,-7,-12,-13,-6,30,44]\`.

The total is 166, as required by the physical rune count difference. Although the second register has five source-visible holes, supplying hypothetical glyph values to them cannot reduce the deficit against the existing 6,395 original target runes.

## Reversible-code decision

**Reject the entire direct-copy family** in which the second bookend is obtained from the first only through cell deletion, arbitrary reordering, and one fixed GP29 alphabet permutation. An implementation that reproduces B through this family must secretly rewrite at least 16 original rune values, at least 98 under an affine map, or at least 195 with no alphabet map. A bijection from all A values to all B values is additionally impossible as a universally lossless compression without ~166 GP29-symbols worth of independent side information.

This result **does not** exclude a genuinely changing-state or position-conditioned cipher, a row-local palette, a nonlinear mixing operation on multiple source runes, an independently supplied key, a different intermediate alphabet, or two *different* plaintext streams. The two actual bookend registers are different portions of the encrypted manuscript; they are **not** historically claimed to be copies of one another. Their mere dimensional match does not prove the transport hypothesis. No visible manuscript instruction currently chooses the missing state update, and no unknown plain GP text is recovered.

## Reproduction and next discriminant

The standalone [original-input Node22 CommonJS SFT](../sims/lp2_bookend_global_permutation_count_gate_sft.cjs) reads the canonical [LP2 index tape](../resources/liber-primus/lp2-corpus.json); confirms both original six-rune bookends and the exact square dimensions; computes original 29-bin frequency counts; exhausts all 812 affine maps; proves the 29!-wide sorted matching bound; and checks a genuine source-shaped synthetic positive plus an impossible synthetic negative.

A productive successor to the source-register hypothesis must choose **one independently printed reversible value-changing operator** before inspecting output, and show a contiguous original plaintext span and a withheld chapter under the same rule. More arbitrary spatial paths are now immaterial for the pure global-palette model, since all such paths fail the exact multiset condition.

The original SFT passes on Windows Node.js 22: [run45064905583](https://github.com/FlareZ123/liber-primus/actions/runs/45064905583).
