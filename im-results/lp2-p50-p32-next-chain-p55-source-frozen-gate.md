# p50 outer76 -> p32 compass -> p55 2013 NEXT chain: source-frozen negative

**Agent 6 | 16 November 2026 | Classification: bounded negative for one historically motivated cross-round receiver.**

No unknown plaintext is recovered. The experiment is worth recording because three independently visible structures produce an unusually exact clock fit; the frozen receiver nevertheless returns non-prose.

## Human solve-path hypothesis

A player could plausibly notice that:

1. The 32x8 p50 numeric table has a 76-cell outer perimeter.
2. LP2 p55 has exactly 76 runes.
3. The solved p57 parable says to shed our own circumferences.
4. The 2016 signed Cicada instruction says numbers are direction, while p32 contains an 11x11 rune map and a visible HOMEX.
5. Cicada's 2013 NEXT mechanism supplies a historical chain-cipher candidate with an IV, a GP29 difference stream, a key clock and a special zero-difference event.

This suggests a concrete, falsifiable route: use the p50 outer perimeter to navigate p32, then use the resulting p32 path as the key source for a 2013 NEXT-style inverse on p55. The 76/76 equality motivates the test; it does not prove the author intended it.

## Frozen source construction

- Input table: the 256 original base60-derived bytes in [the canonical p50 table](../resources/liber-primus/lp2-grid-256.json), SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.
- Perimeter: clockwise from the upper-left cell of the 32x8 table; 76 cells.
- Compass walk: split each byte into low-three-bit direction N, NE, E, SE, S, SW, W, NW and high-five-bit distance; wrap on the original 11x11 p32 rune grid; start at H (p32 index 33).
- The fixed walk yields 76 path runes, ends at X in cell 61, and visits 52 distinct cells. The path contains one F, at path offset 38. Applying the historical 2013 key-source convention of filtering F leaves **75 key symbols**.
- IV: the visible p32 start marker H.
- Ciphertext: all **76** original p55 runes. Their 76 differences from IV H contain exactly one zero step, at p55 offset **59** (TH following TH), leaving **75 nonzero transitions**. Under the NEXT convention that a zero step emits EA and does not advance the key, the 75-symbol key is consumed exactly.

The route itself is not established as an author-selected instruction. The p32 HOMEX prefix and compass orientation remain statistically and historically underdetermined; the prior [original-source compass gate](lp2-p50-outer76-p32-compass-p55-original-gate.md) records that limitation. In particular, the terminal X is cell 61, not the X inside HOMEX at cell 37.

## Cipher family and decisive test

Reuse the three sigma families and two key mappings already implemented in the repository's [2013 NEXT-chain SFT](../sims/2013_next_chain_p33_39_sft.cjs):

- Sigma: identity; inverse of 2^x - 1 (mod 29); inverse of log2(x+1) (mod 29).
- Key mapping: direct GP-index - 1 (mod 28) or phi(prime[GP-index+1]) (mod 28).
- Both additive signs.
- Fixed H IV, filtered-F key, and non-consuming zero step. No fitted phase, orientation, plaintext crib, or extra key parameter.

This gives **12** frozen models. The alternative zero-step clock that consumes a key would require 76 key symbols, but the source-fixed filtered path supplies 75; it is incompatible with this construction.

### Results

All 12 models consume exactly 75 key symbols and re-encrypt the original p55 ciphertext exactly. All 12 also pass a synthetic native-GP positive control containing 75 non-EA symbols and one EA marker. Those are implementation controls, not evidence that the proposed receiver is correct.

None of the 12 original p55 outputs is coherent prose. The strongest output by rune IoC is still gibberish:

X IA NG E M M H R Y H J H S F R X H M G X Y S S R A TH S Y P E EO E OE S NG X L S P R S D TH NG N OE L AE Y TH Y TH NG C I A U C TH EA U R U EO B NG E W P L G F Y OE S W

| Stream | Rune IoC |
| --- | ---: |
| Original p55 ciphertext | 0.037895 |
| Best candidate among 12 | 0.039298 |
| Solved p57 plaintext | 0.062710 |

The slight IoC increase is not plaintext evidence; the output has no sustained English structure. The full 12-way output and exact source assertions are emitted by the SFT.

## Decision

**Retire this exact p50-perimeter -> p32-compass -> 2013-NEXT -> p55 receiver.** The length/clock fit is real, but the predicted plaintext fails. Do not rescue it by changing compass orientation, IV, F handling, key phase, or sigma after seeing the output. Such changes require a new independent source selector.

This does not eliminate other uses of the p50 table, other p32 navigation rules, or other LP2 key sources. It does not change the overall status: all 56 unknown pages remain undeciphered.

**Reproduction:** [Node SFT](../sims/lp2_p50_p32_next_chain_p55_sft.cjs). The underlying p50/p32 route and its source-selection caveat are in the [prior route report](lp2-p50-outer76-p32-compass-p55-original-gate.md); the 2013 model is in the [NEXT-chain SFT](../sims/2013_next_chain_p33_39_sft.cjs).