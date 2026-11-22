# Agent16 precommit for Director #1842: p32 direct consumer ranking

Input is the already frozen red10 packet result `32`, selecting project p32. Use only original p32 layout and corrected canonical segmentation. Retired modulo-22 YOU wrapping is forbidden.

Before this invocation's value reproduction, rank these source-visible consumers by description length:

1. **Direct rune address (selected):** treat 32 as a rune address from the page start. Charge origin {zero,one} and orientation {forward,reverse}. Output is the complete canonical word containing that addressed rune; if the address is a punctuation endpoint, that boundary is part of the source evidence. No language scoring.
2. **Direct word address:** treat 32 as local word ordinal/index with origin {zero,one}, forward/reverse. Geometry rejects this before values because corrected p32 has only 21 complete words.
3. **11x11 cell address:** because original p32 has exactly 121=11^2 runes, reshape in printed order to 11x11 and treat 32 as a cell index. Charge origin {zero,one}, major order {row,column}, and forward/reverse orientation. Output one rune, or its containing canonical word only if fixed before values. This is lower-ranked because it introduces a reshape not needed by consumer 1.
4. **Decimal (3,2) printed coordinate:** split decimal 32 into visible line/within-line coordinates, charging zero/one origins and line/word or line/rune interpretation. This is lowest-ranked because decimal digit splitting is not marked by the page.

**Frozen selection:** consumer1, zero-based forward address, justified by the repository-wide zero-based project-page/source-index convention and because p32's first full stop is independently documented at terminal rune offset32. The one-based forward rival lands within the same terminal word, providing an origin robustness check; reverse variants are controls.

**Typed success register:** for a three-rune receiver, apply only the already-established odd outside-in pair shell. Report both pre-existing serializations used in the repository: `[d,s,c]` (VERIFY42 general odd shell) and `[d,c,s]` (p32 H3 local convention). Success requires every field to be an authenticated DH state field or signed source index without tuning, plus one concrete next receiver from the source register. Raw lexical matching is not used to select the consumer.

Because Agent16 encountered Agent12's later broadcast while reconstructing p32 history, this reproduction is not claimed blind. The test instead adjudicates whether that already-reported receiver is in fact the lowest-description consumer under Director #1842's charged source geometry.