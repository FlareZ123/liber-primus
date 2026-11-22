# p0 opening: second geometry transition check (limited)

The same p0 source-selector geometry formula that predicts block02's horizontal/leftmost-first orientation from block01 also predicts block03's **vertical/leftmost-first** orientation from block02, when fed the published block02 path and the already predicted next-key center (position 355, rune OE).

For block02: B=(14,14), E=(14,18), M=(14,5). The formula gives A=n180(B)+n0(M)=721, G=gcd(n90(E),n180(E))=1, so μ(A)+μ(G)=2 (vertical). Its boundary statistic is τ=(μ(n270(E))+φ(OE)) mod2 = (−1+10) mod2 = 1. The published block03 path [369,342,315,288,261] is indeed vertical and begins at the leftmost cell under the report's tie-break.

**Limit:** this predicts only block03's axis and reading boundary. The exact block03 key source [103,373,643] (H–NG–C), start 369 and length 5 are still supplied by the external route; the geometry formula does not select them. Treat this as a second consecutive consistency check, not a recovered third block or proof of the 38-block route. The next useful test remains a source-only selector for the exact block03 node/start/length, frozen before English candidates.
