# Conditional EAST → OF compass selector in the original p0–p2 grid

**Agent43, 21 November 2026. Classification: conditional semantic successor hypothesis; no authenticated unknown LP2 plaintext or actual cipher recovered.**

## Human-route idea and provenance

The January 2016 Cicada-signed sentence “Its words are the map, their meaning is the road, and their numbers are the direction” supplies an historical reason to try the *meaning of the previously deciphered word* as a compass instruction. In the existing conditional 27×27 proposal, fixed source E–O–D and ciphertext TH–N–C decrypt to **EA–S–T = EAST**. The earlier source-only gate left two possible starts for the next block, **(4,10) and (6,12)**, with no source-only way of choosing.

The original E–O–D source node has first outer **E at (6,10)** and center **O=3**, giving **φ(O)=2**. If the already decoded EAST is interpreted as “move two columns east from this E outer,” it selects **(6,12)**. The surviving rival (4,10) is two rows **north** of the same anchor. This rule consults the preceding word's proposed meaning, then fixes the next original input before deciphering it.

## Exact frozen comparator

The previous gate separately fixes the next H–T–H unit mirror: H(20,25), next to the source D(20,24), belongs to one radius-one equal-outer mirror, H(18,27)–T(19,26)–H(20,25); L(20,23) belongs to none. Applying the existing center-totient operation gives the fixed key **H–H–H**. Keep the existing down-right (+1,+1) read and first *later* equal-outer radius-seven diagonal mirror stop (or the grid boundary if absent).

| Direction from E(6,10), two cells | Start | Next output under H–H–H | Stop |
| --- | --- | --- | --- |
| **East** | **(6,12)** | **OF** from original J,H | radius-seven mirror outer (7,13) |
| North | (4,10) | EDOF from Y,TH,J,H | the same outer (7,13) |
| South | (8,10) | NGUJHIALRIAPYUHRTHJNGTEA | no mirror before edge, 18 runes |
| West | (6,8) | HDNGUJHIALRIAPYUHRTHJNGTEA | no mirror before edge, 20 runes |

The east branch uniquely yields the candidate next complete word **OF** among the four fixed compass choices, and distinguishes the two starts that survived the prior source-only gate. All four exact source-cell sequences reencrypt under the same fixed key, showing why reencryption itself cannot select the branch. The original input has **479** non-F-center equal-outer mirror nodes and four diagonal radius-seven equal-outer mirrors. The independently calculated EAST phase and key, unique next unit mirror, four outputs and original ciphertext roundtrips all pass in the new source-reading implementation.

## Confidence and next test

The finite selection is useful as a proposed *self-directed* puzzle step, while remaining explicitly **retrospective**. No Cicada-authored instruction identifies the first key outer as compass origin, chooses φ(center) as the step size, or requires the earlier reconstructed 27×27 grammar. The former north/east ambiguity is resolved **only after granting these unproven conventions and the candidate word EAST**. The possibility that “east” instead refers to the eastern border is still open. This result therefore does not promote EAST or OF to established plaintext.

A genuinely new prospective result would need another untouched directional instruction, and must fix the same compass-origin/step/key/stop grammar before its successor ciphertext is examined. Without it, do not extend the candidate route through further postselected coordinates.

**Reproduction:** [Original-input CommonJS SFT](../sims/lp2_p0_east_word_compass_of_sft.cjs) and [successful Windows Node22 manual Actions run 44936405292](https://github.com/FlareZ123/liber-primus/actions/runs/44936405292). Prior frozen state: [EAST source gate](lp2-p0-east-successor-gate.md), [H–T–H following-key test](../sims/lp2_p0_east25_of26_source_state_sft.cjs).
