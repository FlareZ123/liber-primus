# 3301/1033: source roles and LP2 transfer decision

**Decision (11 November 2026): no single source-authenticated operation uses both 3301 and 1033 to select a unique LP2 interval.** There are real, distinct uses of each value. The only signed numeric operation with a direct LP2 algebraic consequence is the 2013 BASE29 example on 3301, which yields the p50 H factor. The 1033 BASE29 control does not divide p50; the verified 2013-to-2014 prime-sum transfer that produces the 1033 magic square has already failed its source-selected LP2 row-key transfer. No plaintext or key is recovered.

This audit distinguishes (a) signed/authenticated message content, (b) original puzzle artifacts that are not PGP-signed, and (c) participant/archive reconstructions. “Player-visible” does not mean “signed.” The archive manifest [1033-3301-historical-operator-chain.json](../resources/external/1033-3301-historical-operator-chain.json) explicitly identifies itself as a secondary reconstruction; it is useful for locating leads, not for upgrading them into authenticated Cicada instructions.

## Preserved signed artifacts, 2012–2017

| Date / artifact | Exact 3301 or 1033 occurrence | Operation and player-visible selector | Evidence class and LP2 relevance |
| --- | --- | --- | --- |
| 2012 public-key identity and first-image instruction | User ID “Cicada 3301 (845145127)”; first-image instruction uses 3301 | Multiply the original image's prime pixel dimensions, 509×503, by 3301 to obtain 845145127 and the solved historical domain | Original first-stage source, not a signed LP2 instruction. 3301 is a solved domain multiplier/identity marker, not an LP2 key. See the [original-source resolution](cicada2012-pgp-uid-original-prime-domain-resolution.md). |
| 2012 countdown PGP message | Final 3301 marker | Standard Cicada message footer; no numeric operation on LP2 data | Signed artifact; 3301 is a footer, not a selector. No 1033. |
| 26 January 2013 signed TCP challenge | Explicit BASE29 3301 → 3QO example; also the ordinary 3301 footer | The signed command BASE29 converts the decimal operand 3301 to its GP29 representation 3QO. The same challenge documents DH with a worked modulus-23 example and NEXT | GPG-verified signed protocol. This is the strongest authenticated operational use of 3301. It does not contain a 1033 operand. See the [byte-preserving signed source](../resources/external/2013-tcp-server-signed-source.md). |
| 2014 Stage11 PGP message | Final 3301 marker | Standard message footer; no 1033 and no numeric operation | Signed artifact; marker only. |
| 2016 4gq25 PGP message | Final 3301 marker | Standard message footer; the signed instruction concerns words/numbers generally, not these constants | Signed artifact; marker only. |
| 2017 yEiTHhvF PGP message | “CicadaPG v.3301” header and final 3301 marker | Client/version label plus standard footer; no 1033 | Signed artifact; neither occurrence specifies an LP2 transform. |

Across the preserved signed PGP/TCP message bodies, **1033 does not occur as an operand or command parameter**. The 3301 footer/version repetitions are real but are not repeated cryptographic operations. The only signed numeric instruction in this set is BASE29 3301.

## Player-visible material that is not signed

| Date / artifact | Values and exact role | What a contemporary solver could see | Evidence limit |
| --- | --- | --- | --- |
| 2013 first-onion prime_echo / NUMBER services | 1033 and 3301 are highlighted as primes; NUMBER applies decimal reversal/primality and the archived response for 3301 is “+” | A prime stream pauses on the pair; the NUMBER service accepts the values as inputs | Reconstructed from participant/archive material, not specified by the signed TCP challenge. Prime ordinals 174/464 and any division by 29/58 belong to the separate ordinal investigation (#291), not this task. |
| 2013 live TCP participant transcript | BASE29 1033 → 16I; DH 3301; a later NEXT exchange | The transcript records actual requests and responses. The signed challenge authenticates the command semantics, but not this particular request log | Contemporaneous participant/server record, not a signed log. In DH 3301 the modulus is fixed by the request, while the server base/secret are session-random; the returned shared value is not a reusable key. See the [test-vector manifest](../resources/external/2013-tcp-live-test-vectors.json). |
| 2013 0_wisdom → 2014 Stage04 square | The 2013 word-cell prime-sum construction yields a 5×5 magic square with magic sum 1033 | “Primes and totient” is the player-visible selector; the archived mapping reconstructs all 25 cells exactly | A source-visible cross-stage construction, but not a PGP-signed command. This is a genuine 2013→2014 prime-sum transfer; it does not by itself select an LP2 interval. See the [direction-map/prime-sum report](2014-magic-square-direction-map.md). |
| 2014 Stage10 square form | Field labels 5|3301, 7|1033, and 5|1033 | The form presents order/value labels to the player | Archived HTML, not a signed instruction. The preserved page has no client-side transform or recovered server handler; it does not specify an operation. The detailed form boundary is owned by #275 and [its source report](2014-stage10-squares-cgi-source-boundary.md). |
| 2014 Onion7 OpenPuff extraction | Concatenated password 33011033 | The ordered pair is used as a password to extract magicsquares.txt | Participant/archive reconstruction, not a signed LP2 operation; the target is a separate historical file, not LP2. |
| Original LP2 p33–p39 cuneiform artwork | The repeated header numerals read as sexagesimal 1033 and 3301 | The values are visible in the manuscript's own cuneiform/sexagesimal presentation | Original LP2 image evidence, not a signed external instruction. It establishes the pair's presence, not whether to apply BASE29, prime-sum, DH, LCG, or another operation. |

## Frozen operation tests against LP2

### BASE29: 3301 succeeds as one factor; 1033 is a negative control

The signed 2013 example fixes the operation and operand for 3301: BASE29(3301) = 3QO, whose coefficient vector gives H(X) = 3 + 26X + 24X². The existing [GF(29) grid-factor reproduction](2013-base29-gf29-grid-factor.md) shows H divides the original p50 256-byte table exactly; the independently source-derived p39 red triad supplies G(X) = 27 + 5X + 15X², and p50 is divisible by both. This is an exact structural relation, not yet a reversible cipher or plaintext.

Applying the same BASE29 conversion to 1033 gives 16I, with coefficient vectors [1,6,18] and reversed [18,6,1]. The existing original-grid test gives nonzero remainders [3,11] and [24,3], respectively. Thus the same BASE29-to-polynomial operation does **not** carry both constants into the p50 factorization. The 1033 input is present in the unsigned participant test vector; it is a useful control, not a second signed operand.

### Prime-sum: a real 2013→2014 reuse, but no LP2 readout

The 2013 0_wisdom word-cell prime-sum map reproduces the 2014 5×5 square and its 1033 sum in all 25 cells. This is the clearest verified operator reused across two historical stages. The source-selected LP2 candidate is the five red-numbered passages on p36–p38, a 553-rune interval bounded by the original 1–5 labels and 10-dot delimiters. The existing [five-numbered wisdom inversion gate](lp2-cuneiform-five-numbered-wisdom-inversion.md) tested the row-wise φ(cell) mod 29 transfer, both orientations, and the solved-p56 prime/totient shift with exact original-input round trips and controls. None produces language. The operation therefore transfers 2013→2014, but its tested LP2 continuation is negative.

### Other paired-value proposals already tested

- The [1033/3301 full-width LCG gate](magic1033-3301-fullwidth-lcg-skip.md) tests the pair as fixed recurrence parameters on original LP2 pages and does not recover plaintext.
- The [3301 56-symbol page-direction walk](3301-56symbol-page-direction-walk.md) does not yield a viable complete page traversal.
- The 2014 Stage10 form's label semantics are bounded separately by #275; this audit does not infer a missing handler.
- The prime-rank/ordinal interpretation is bounded separately by #291; this audit does not repeat its inventory.

## Human solve-path assessment and decision

A contemporary solver could reasonably notice the 2013 signed BASE29 command, the 3301 operand, the LP2 p50 numeric table, and the p39 red structure. That route has a concrete algebraic consequence (H/G divisibility), so it remains worth retaining as a structural lead. The same solver could also notice the 1033/3301 reversed-prime pair in the archived 2013 services and later LP2 cuneiform; however, the service grammar is not in the signed TCP challenge, the ordinal normalization is not source-selected here, and the pair does not specify a reversible LP2 operation.

The two values do not form one common key, modulus pair, recurrence, or row-key rule in the preserved sources. 3301's signed BASE29 route and 1033's 2014 prime-sum/magic-square role are distinct. The 1033 BASE29 control, the source-selected 553-rune row transfer, and the paired-value LCG/page-walk candidates all fail to produce plaintext. **Close the combined-constant hypothesis as unsupported; keep the 3301→H/p50 and p39→G relationships as an intermediate structural candidate, not a solved cipher.**