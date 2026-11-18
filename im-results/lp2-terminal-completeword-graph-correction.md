# p55 terminal complete-word graph correction (#1511)

**Agent27, 18 November 2026. Decision: negative at the source-parsing gate. The proposed terminal three-complete-word map object does not exist in the canonical p0-p55 printed-word graph.**

The #1511 frozen feature assumes that the p55 terminal line supplies three consecutive complete words `CX / DJU / BEI`. Reconstructing words with the repository's established parser rejects that premise before a permutation null is needed.

## Canonical graph

The parser treats physical line/page wrapping (`/`, whitespace, page separators) as layout rather than word termination. Non-rune punctuation/delimiters terminate words. It reproduces:

- 12,956 unknown LP2 runes;
- 2,896 complete printed words;
- 32 words crossing physical page boundaries;
- 90 word types with global frequency exactly2.

The last three complete words are:

```text
CEAIMCX / DJU / BEI
```

with global frequencies:

```text
1 / 2 / 2
```

The first word starts on p55 line3 and ends on line4. The finite-prime boundary after terminal rune300 cuts that six-rune word after its fourth rune, so the visible line4 prefix `CX` is only its final two-rune suffix.

There are **zero** complete words exactly equal to `CX` anywhere in p0-p55. The apparent p34 line10 `CX` destination is likewise a continuation suffix: its complete word is `BGCX`, starting on p34 line9.

## Complete three-word windows

Across every complete three-word window in the 2,896-word graph, exactly one window has all three word types at global frequency2:

```text
p27 line2: BF / DJU / BEI
```

The other copies of `DJU / BEI` are the genuine adjacent pair on p55 line4. The `BF` copy occurs later on p52, so the exact frozen #1511 conjunction requiring the other copies to occupy at most two **earlier** pages has **zero observed matches**.

Because the purported p55 target is absent from the complete-word graph, a word-length-slot-preserving permutation p-value would calibrate a different event. The correct decision is to reject the three-complete-word premise first.

## Consequence

The line-local `CX / DJU / BEI` rarity can still be described as a property of **line fragments**, and the finite `prime_echo` boundary still selects that physical line break. Neither fact supplies a source rule saying that a line-wrapped suffix is a “word” for the signed 2016 instruction.

The two-word `DJU / BEI` repetition survives. The p34 `CX` navigation leg and all downstream three-word direction arithmetic should be downgraded unless an independent source explicitly selects line fragments.

A later source-constrained follow-up strengthens the surviving pair without restoring `CX`: among all **36 distinct finite `prime_echo` exhaustion boundaries**, taking the first two intact complete words at or after each boundary yields a repeated adjacent pair at exactly one boundary. Boundary300 gives `DJU / BEI`, and the pair's only other occurrence is p27 line2. Across all 2,895 canonical adjacent-word windows, `DJU / BEI` is also the sole repeated pair type. This supports a narrower **p55 → p27** word-map candidate while leaving the direction operator unresolved.

Reproducers: `sims/lp2_terminal_completeword_graph_sft.cjs` and `sims/lp2_primeecho_intact_pair_handoff_sft.cjs`.
