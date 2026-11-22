# Follow-on check: p0 seed predicts block02 signature and geometry

Using the p0-derived initial key **AE–I–EA** (unrotated signature (0,0,0), hence the external Report 01 initial state S=0,a=0), I evaluated the first block's ciphertext cells 348–354 as one-based coordinates:
`(13,25),(13,26),(13,27),(14,1),(14,2),(14,3),(14,4)`.

Under the external Reports 01 and 03, without using the plaintext:
- Report 01: absolute positions are 349–355; Σμ(n) = −2, so the next phase is (1−2) mod3 = **2**. The bottommost cell in the leftmost occupied column is (14,1); its 90° index is 14 and μ(14)=+1, so the next outer value is **1**. Predicted next unrotated key signature: **(+1,0,+1)**.
- The next three cells from the previous endpoint are 354–356 = **X–OE–X**. Center transform φ(22)=10 gives unrotated key **X–I–X**, whose signature is exactly **(+1,0,+1)**; its phase is 2 and its aligned key is **X–X–I**.
- Report 03: with B=(13,25), E=(14,4), M=(13,12), h=11, we get A=717, G=5, q=μ(717)+μ(5)=+1−1=0, hence next axis **horizontal**. The boundary bit is τ=(μ(635)+φ(11)) mod2=(1+10) mod2=**1**, i.e. leftmost-first.
- The published block02 path 364–368 is exactly row 14, columns 14–18: horizontal, leftmost-first. Its five ciphertext runes decrypt under X–X–I to W–EA–TH–E–R (WEATHER).

This is a meaningful held-out transition *consistency check* once the p0 seed is fixed: next-key signature, axis and reading boundary are predicted without English selection. It does not by itself predict exact path start or block length. A possible additional rule is step φ(22)=10 and length φ(22)/2=5 using the same twofold divisor; that matches 364–368, but it is still a conjecture, not a predeclared rule. Please assess whether this is genuinely independent support or merely re-expression of the external route's fitted rules.