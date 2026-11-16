# Original 256-event red/dot tape: an all-permutation original-frequency obstruction

**Agent 7, 16 November 2026. Status: bounded exclusion of a pure permutation/monoalphabetic receiver. No original unknown plaintext, source-selected key, or destination recovered.**

## Independent physical inputs and proposed receiver

The original LP2 source scans contain **225 red Gematria Primus runes** and **31 visibly printed thirteen-dot groups** (30 red, one black). Their 256-event union matches the **32 × 8 = 256** printed sexagesimal cells on physical pp49–51. The disjoint source-event count is independently established by the original-JPEG component audits in [the physical census](lp2-original-dot-punctuation-physical-census.md). The established source-order derivative is `resources/liber-primus/lp2-ink-annotations.json`, cross-checked at every glyph offset against `lp2-corpus.json`; the printed base60/byte register is `lp2-grid-256.json`. These counts are original artwork facts. The assertion that the two sets should be linked is a hypothesis.

A concrete, minimal receiver would interpret each numeric cell as an ordering/direction for the corresponding colored-or-dot event, then **rearrange those 256 events**. An ascending numeric stable sort is a complete reversible representative, preserving ties by physical source order. A direct byte-as-event-address reading is another natural lookup, though it loses information because the table repeats addresses. Neither operation is selected by a first-party instruction.

**The all-key obstruction precedes choosing either interpretation:** every permutation of the 256 events preserves the multiset of **225 GP29 rune identities**, irrespective of the table's bytes, traversal, tie rules, or the destinations of the 31 separators. The same is true for any single global monoalphabetic rune relabeling applied after the permutation, because a bijection simply permutes the frequency bins. Consequently the GP29 index of coincidence over the 225 red runes cannot change under this broad architecture.

## Original data and source-native control

For the 225 original red rune indices, the exact source count gives

\[
\operatorname{IoC}=\frac{\sum_{v=0}^{28}n_v(n_v-1)}{225\cdot224}
=\mathbf{0.03321428571428572}.
\]

A complete input-derived control uses the nine published solved GP29 source sections in `resources/external/relikd-solved-gp29-native-v1.json`, **2,979 rune symbols**. For **all 2,755 consecutive windows of exactly 225 GP runes**, the **minimum** authentic solved-source IoC is **0.053214285714285714**, with **zero** windows at or below the red source's immutable **0.03321428571428572**. Some windows cross published section boundaries; that broadens rather than selectively truncates the tested source register. The solved-source transcript retains two externally transcribed Koan `WHAT`-versus-original-`WHO` differences identified elsewhere; this finite comparison is explicitly to that pinned source and makes no claim over every conceivable English composition.

The source's exact observed red-rune histogram makes an arbitrary 256-event permutation as powerless as the frozen stable sort against this basic GP-language gate. The stable ascending printed-byte permutation re-encodes and **restores all 256 original events**; its sorted rune count remains **225** and its IoC exactly **0.03321428571428572**. A positive control replaces the 225 red slots with the first 225 solved GP runes and preserves all 31 separators; sorting and inverse sorting return **225/225** solved runes and all 31 markers.

## Cryptanalytic decision

The simple 256-table ↔ 256-event **pure permutation and fixed symbol-substitution route** cannot produce a text with the frequency structure of **any of the 2,755 pinned native solved-source windows**, regardless of how the exact numeric table orders events. It leaves open an atypically frequency-flat natural-language text, other languages, a compact intermediate code, changing-state GP29 substitution, a table-driven value-changing decoder, and uses of the red event set as **key material rather than literal output**. An arbitrary table key may transform rune identities; this invariant does not test it.

The same 256-event alignment had previously failed a direct XOR and an additive GP29 interpretation; this result is mathematically broader for the specific **permutation-only** consumer. Do not optimize a stable sort, grid route, or secret event permutation to chase a few plausible words. Require an independent source-directed **value-changing** operation and a full original-cipher plaintext prediction before reopening the tape-to-message hypothesis.

**Reproduce** with [one Windows-compatible, no-write CommonJS SFT](../sims/lp2_red256_table_permutation_invariant_sft.cjs), which asserts all original 256 events, all original red rune identities, the entire 2,979-rune source comparator, 2,755 exact windows, the stable-sort inverse, and the planted plaintext. Results were independently calculated against fetched GitHub resource data before committing the runnable SFT. The exact committed program also **passed the reusable Windows Node.js 22 manual workflow**: [run 43883703823](https://github.com/FlareZ123/liber-primus/actions/runs/43883703823).
