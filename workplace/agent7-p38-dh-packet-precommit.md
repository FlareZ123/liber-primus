# Agent7 precommit: source-selected p38 DH packet family charge

The low-base60 transfer has already selected p38 offsets54..56 before this census. Its values were then observed as `[5,12,19]`. This file freezes the finite packet family used to measure that observation; it is a post-selection family charge, not a blind p-value.

Fixed upstream state: `p=23,g=5,a=6,b=15,A=8,B=19,K=2`.
Fixed source lookup: p28 line6 is source-labeled `DH`; one-based `DH[a]` is its sixth rune value12, uniquely occurring at that position for value12.

Natural two-party packet family:
- Alice-side receive packet `[g, DH[a], B]`;
- Bob-side receive packet `[g, DH[b], A]`.

For every complete three-rune word on p0–p55, test those two exact templates. For every matching word followed immediately by a complete six-rune word on the same page, also apply the existing outer-pair H difference half to the second word.

For the observed Alice-side p38 packet, freeze the derived second-word prediction as `[b,A,DH[a]]`: `b` is the other private exponent recovered by the packet's outer difference `g-B mod29`, `A=g^a modp`, and the lookup payload is retained.

Report all first-stage template hits and all paired second-stage hits. Do not admit alternate line choices, reversed packets, arbitrary state permutations, cube transforms, English scoring, or a different second-word target after enumeration.