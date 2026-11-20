# P26 FOURTH-D/H packet: source-selected navigation, not an LP2 cipher

**Issue:** [#1949](https://github.com/FlareZ123/liber-primus/issues/1949)  
**Source-first freeze:** [Agent2 freeze](../workplace/agent2-1949-source-first-freeze.md)  
**Deterministic test:** [p26 receiver SFT](../sims/lp2_p26_way_map_four_receiver_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44675841329)  
**Existing receiver analysis:** [p28 fourth-D/H holdout report](lp2-p28-here-4d-gcd-holdout.md)

## Decision

**Negative for a cipher opcode; retain only a bounded navigation/meta-instruction candidate.** The p26 packet is a selective structural correspondence, but it does not independently select a non-circular `FOURTH D; H` inverse. Its `FOUR` and `57→56` features depend on an inferred table-token parser; the base60 radix is not author-authenticated; the `TH` suffix needs an extra GCD choice beyond standard DH; and the H operation is borrowed from the already-exposed p28 DH/H interpretation. The frozen p29 holdout is not plaintext. No unknown-page cipher inverse or continuous plaintext is recovered.

## Source-to-p26 chain and its status

1. **Source text.** `FIND THEIR WAY HERE` occurs in the community-derived solved-LP1 WELCOME transcription. It is not a Cicada-signed plaintext source. The authenticated 2016 signed message supplies the broad “words are the map / numbers are the direction” instruction, but does not define the parser, digit choice, radix, origin, or movement rule.
2. **Four-word readout.** WELCOME has 124 words and 121 four-word windows. Exactly one emits `FOUR` under zero-based GP0 word sums, p50 token lookup, and first-character GP29 digits: `FIND / THEIR / WAY / HERE`, addresses `[42,34,57,48]`, tokens `[0S,3H,1w,4D]`, high digits `[0,3,1,4]`. The charged one-based, GP0−1, GP-prime and low-digit alternatives do not reproduce this source hit.
3. **Unknown-page family.** The 56 unknown pages contain 3,176 four-word windows; four emit high-digit `FOUR` under GP0 (p5, p23, p26, p31). Only p26 also contains the unique unknown-page adjacent GP0 edge `57→56`. The p26 window is `E / SAOE / CHISFIN / POENG`, GP0 `[18,61,57,56]`, table tokens `[0F,3G,1w,4E]`, original rune offsets 197–210.
4. **Movement family.** Across the solved-source census, 731 adjacent pairs contain 81 eligible one-step moves and 11 eligible composite moves; there are zero literal `57→56` hits and one composite hit, WELCOME `WAY→HERE` via `57→56→48`. This does not make the first leg a source-adjacent pair. In the signed 2016 message, `WAY` (word14) and `MAP` (word19) are separated by “Its words are the”. WELCOME's literal adjacency is `WAY HERE` (`57→48`), not `WAY MAP` (`57→56`). The p50 table does encode `57 --1w (west)--> 56 --4E (hex N)--> 48`, but the next p26 ciphertext word has GP0 95, not 48.
5. **Radix.** Base60 gives bytes `[15,196,118,254]` and residues `[15,22,2,22]`, the unique p26 DH23 packet hit. Drop-`f` base59 gives `[15,193,116,250]` and residues `[15,19,0,18]`, with no packet hit. The original p50 table has no radix legend; the base60 alphabet has external MIRACL precedent, not an author-supplied Cicada instruction. The tested unknown-window readout counts also change under charged alternatives: GP0/high 4, GP0/low 0, GP0+1/high 4, GP0−1/high 2, GP-prime/high 0, GP-prime mod256/high 0, GP-prime+1 mod256/high 6.
6. **GCD/DH.** For base60 residues, adjacent pairing gives GCDs `[1,2]` (`U,TH`), crossed pairing gives `[1,22]` (`U,OE`), and outer pairing again gives `[1,2]` (`U,TH`). The first `gcd(b,p−1)=1` is the standard DH invertibility condition. Applying GCD to the final `(K,p−1)` pair to obtain `2=TH` is an additional choice, and two pairings give the same result. The DH23 tuple is a pre-Cicada textbook example; it does not independently authenticate this final-pair operation. The `TH` needed for `FOURTH` is therefore not selected by the source chain.

## Frozen receiver and holdout

The source-first freeze records that p28's fourth-D output had already been exposed before this audit; the p28 target is explicitly **not blind**. The p29 coordinates were frozen before reading p29 values.

The claimed local map is

\[H(x,y,z)=(x-z,\;x+z,\;y)\pmod{29},\]

with inverse \(H^{-1}(d,s,y)=(15(d+s),\;y,\;15(s-d))\pmod{29}\). The fixed receiver and controls produce:

| Receiver | Original rune offsets | Input GP indices | H output | GP transliteration |
|---|---:|---:|---:|---|
| p28 fourth D (already exposed) | 47–49 | `[20,23,14]` | `[6,5,23]` | `GCD` |
| p29 predeclared holdout | 0–2 | `[2,23,6]` | `[25,8,23]` | `AEHD` |
| p57 fourth-D solved-page control | 87–89 | `[9,23,18]` | `[20,27,23]` | `LIAD` |
| p28 fifth-D negative control | 70–72 | `[25,23,1]` | `[24,26,23]` | `AYD` |

The inverse reconstructs each three-rune input exactly. That is the expected algebraic round trip of a reversible three-symbol map, not evidence of a page cipher. `GCD` is an operation label, not recovered prose; the predeclared p29 holdout is `AEHD`, not `WAY`; the p57 control is `LIAD`; the p28 fifth-D control is `AYD`. p56 has only three D runes and therefore no fourth-D receiver. No tested span approaches 150 contiguous runes.

The SFT also finds that the p50 route reaches address48, whose offset48 rune is `L` and whose D count through that page is only one; the proposed current-page self-index does not close. The immediate p26 ciphertext continuation is address95. Shared-secret word probes yield `SAD` or `JLM`; only 41 of 795 three-rune words are signed-K English hits, not a unique source-selected readout.

## Interpretation and scope

The chain's strongest supported content is navigation/meta-structure: a WELCOME-derived `FOUR` correspondence, a p26 `57→56` edge, and a base60-dependent DH-shaped packet. It does not prove that Cicada authored the token-first-digit parser, chose base60, intended the final-pair GCD, or selected the p28 H transform. The p28 `GCD` result cannot validate its own upstream selector because that output was already known when the p26 source-first freeze was made. The untouched p29 holdout fails to provide independent plaintext.

**Close #1949 at navigation/meta-instruction only. Retire the p26 packet as an LP2 cipher opcode.** Do not assemble further p29 derivatives or extend H over arbitrary page spans without a new first-party selector. The p28 local READ OUT/HERE and DH investigations remain separately scoped; this result does not invalidate them.

**Reproduction:** `node sims/lp2_p26_way_map_four_receiver_sft.cjs`. The existing manual Node22 runner passed on original inputs in [Actions run 44675841329](https://github.com/FlareZ123/liber-primus/actions/runs/44675841329).
