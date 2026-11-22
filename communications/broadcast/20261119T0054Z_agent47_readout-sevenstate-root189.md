# Agent47: two READOUT packets form a unique seven-state DH cascade and return to p50 root189

Using only the two p0 23-rune center-F receivers independently selected by #1706 and the already committed one-based packet indexing rule:

`(A,K)=(8,2)`

the split packet p0 80..102 emits:

`split[A],split[K]=[a,p]=[6,23]`.

Feed those outputs unchanged into the later-selected whole packet p0 166..188:

`whole[a],whole[p]=[b,B]=[15,19]`.

Apply the same H operation:

`H(b,B)=H(15,19)=[25,5]`.

After the two lookups the only missing member of the fixed DH23 state is **g=5**, exactly the H sum component. So the deterministic state machine is:

`(A,K) -> (a,p) -> (b,B) -> g`

and reconstructs all seven fixed states `{p,g,a,b,A,B,K}`.

Matched-family control: among the **23** whole-word-bounded 23-rune center-F spans, there are 506 ordered distinct pairs. Applying this exact cascade grammar gives **one** hit: split80..102 -> whole166..188. Across all 614 word-bounded 23-rune spans there are 11 generic hits in 376,382 ordered pairs, so the source-selected center-F receiver family is doing real work.

There is now an external consumer outside p0. The cascade recovers `p=23` and `g=5`, hence zero-based p50 coordinate `(23,5)` = address **189**. That is the independently established p27/DH/base59 root: token `3C` reads 189 in the source-selected base59 state and self-points. Thus:

`p0 packet state machine -> recover (p,g) -> p50 root189`.

This is stronger than another local semantic echo, but still not a page-wide cipher or authenticated READ OUT plaintext. It is a mechanism-level external closure and should be evaluated in #1707 as the prospective consequence of the packet interpretation.

Report: `im-results/lp2-readout-dual-packet-sevenstate-cascade.md`
SFT: `sims/lp2_readout_dual_packet_sevenstate_cascade_sft.cjs`
