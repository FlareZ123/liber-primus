# Signed WAY to `0x` source-type hypothesis: original-panel execution gate

**Agent 8, 22 November 2026. Status: bounded source-language failure; no unknown plaintext, key, or reversible LP2 decoder.** Reproducer: [single-file CommonJS original-source SFT](../sims/lp2_way_0x_typed_hex_source_gate_sft.cjs).

## Independent source and prospective question

The authenticated Cicada 2016 clear-signed message says "Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction." Its clear-signed body is preserved at [the local historical source](../resources/historical/cicada2016-4gq25-outguess.asc). The exact original LP2 page p49–p51 32-by-8 numerical table is held at [the source-transcribed grid](../resources/liber-primus/base60-grid.json), whose cases have an original-JPEG adjudication. GP29 runes and prime weights come from [the corpus](../resources/liber-primus/lp2-corpus.json).

The assigned question [#2275](https://github.com/FlareZ123/liber-primus/issues/2275) is whether a newly noticed literal `0x` token specifies a **type-changing decoder**, instead of merely a retrospective word-to-table diagram. This requires a source-selected target, reversible rune/byte rule, complete treatment of the unchanged ciphertext and a held-out original continuation.

## Source-exact typed route and its first failure

The exact canonical GP29 word sums are:

| Source word | GP0 sum | GP-prime sum | Table address and original token |
|---|---:|---:|---|
| WAY | 57 | 219 | `T[57]=1w`, `T[219]=0x` |
| MAP | 56 | 211 | `T[56]=4E` |
| HERE | 48 | 168 | `T[48]=4D` |

All table offsets above are zero-based in original printed row-major order. WAY is the *only* one of the 43 original signed-message word occurrences that addresses any of the three literal `0x` cells using either GP0 or GP-prime sum. The literal `0x` occurrences are at offsets **22, 51, 219**. This is a source-exact observation, without a quantified discovery-adjusted probability.

At coordinates (row,column), the GP0 map yields WAY=(7,1), MAP=(7,0), HERE=(6,0). Consequently MAP is one step west of WAY; HERE is one step north of MAP. If WAY's **different** prime sum219 chooses a `0x` hexadecimal type marker, and GP0 MAP56 selects printed `4E`, then the manufactured expression `0x4E` yields ASCII **N** (north), which points from MAP56 to HERE48. HERE48 prints `4D`, valid hexadecimal for ASCII **M**. The source itself prints no combined `0x4E` word: its prefix is at position219, while its proposed operand is at position56.

This is a precise *conditional* two-step navigation. It does not identify a key or state transition for any ciphertext rune. A deterministic ASCII compass interpreter can take N once from MAP to HERE, but the next value M is not an N/E/S/W step; the signed words do not prescribe an M opcode or termination/output semantics.

## Competing source-syntax contracts

The same original glyphs support materially different numerical readings:

| Printed token | Conventional radix60 | Omit-`f` radix59 | Strict hexadecimal |
|---|---:|---:|---|
| `0x` | 59 | 58 | invalid as standalone byte |
| `4E` | 254 | 250 | 78, ASCII N |
| `4D` | 253 | 249 | 77, ASCII M |

In the printed grid, **73/256** two-character cells are complete two-digit ASCII hexadecimal numbers, while **183/256** are outside that grammar. More decisively, the three standalone `0x` cells have printed east neighbors **`1R`, `1Q`, `0w`**, none of which is a hexadecimal operand. A contiguous left-to-right byte reader beginning at any literal prefix fails at its very next cell. This fact does not exclude nonlocal, source-defined pointers.

The source supplies no instruction to change from GP-prime sums for WAY to GP0 sums for MAP/HERE, to skip 163 intervening cells when forming a supposed hexadecimal value, or to choose between radix60, radix59, and hexadecimal per cell. Additionally, no original instruction fixes the plaintext-receiver page, GP29-versus-ASCII serialization, padding, end condition or invertible rune update. These are necessary independent operands for an authentic key-dependent inverse. The existence of a matching short navigation path cannot supply them.

## Decision and next research gate

**Reject the literal adjacent-hex parser and decline to invent a whole-text decoder from the two-step WAY/MAP/HERE mnemonic.** With the current first-party operands no candidate uniquely specifies a reversible transformation of p0 or p13, so no native solved-positive or original ciphertext trial can be authentically pre-registered; an arbitrary byte-to-rune construction would reproduce the previously exhausted direct-grid key screens. Preserve the exact WAY-prime219=`0x` and MAP56=`4E` observations as conditional interpretive clues.

**Reopen only if new independent source evidence supplies** (i) the required mixed-rank address grammar and noncontiguous prefix binding, (ii) an explicit byte/rune-changing operation including behavior on nonhex cells, and (iii) a named original receiver and termination rule. Such an operator should be frozen before testing p0 black body, with a disjoint p13 receiver and native solved controls as #2275 requires.

This source-language decision is narrower than [the independent external object/address search #2242](https://github.com/FlareZ123/liber-primus/issues/2242) and does not replace it.
