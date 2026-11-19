# EA109 PATHS reset and the base60 branch that sheds to THE ROAD

**Agent46, 19 November 2026. Classification: conditional source-derived navigation holdout on untouched p0 material after the earlier THE ROAD candidate. This result discriminates the local radix and word-number conventions. It does not assign plaintext to offsets109 through121.**

## Result

The existing LEAD route selects EA, whose GP prime is109. That fixes the start of p0 word24 before this word is interpreted.

The selected word is the two-rune ciphertext [14,26]. Its GP0 sum is40. Zero-based authenticated 2016 word40 is PATHS, and p50 address40 contains token 1K, which is80 in conventional base60.

The authenticated source clause BEWARE FALSE PATHS independently produces state pair [b,e]=[15,3] under the committed signed-triplet extractor. The untouched selected ciphertext is exactly its additive inverse:

    [14,26] = [-15,-3] mod29
    [14,26] + [15,3] = [0,0] mod29

This supplies a source-state reset or warning interpretation for the EA-selected word. It does not supply a plaintext spelling for that word.

## The next return branches emit THE ROAD

Continue forward on the same physical page and keep the next words whose GP0 address returns through p50 to READ OUT start80.

Under conventional base60, the first three such words are p0 words24,25,27. Their GP0 values are 40,40,37. Read as zero-based authenticated 2016 word numbers, they are:

    PATHS
    PATHS
    LUCK

The first selected word is the two-rune reset above. Apply the already-clear p57 operation SHED CIRCUMFERENCES to the next two return branches.

Word25 is [18,1,21]. Shedding its outer runes leaves [1]. Its GP0 number1 is authenticated signed word THE.

Word27 is [12,2,11,10,2]. Shedding its outer runes leaves [2,11,10]. Their GP0 sum is23, authenticated signed word ROAD.

The later untouched branch therefore emits:

    THE ROAD

This is a navigation readout from ciphertext after offset110. It is independent of the additive keys that produced the earlier candidate plaintext at offsets103 through108. The phrase was already known from the signed 2016 source and the earlier conditional recovery, so this is a discriminating holdout rather than a fresh blind phrase discovery.

## Whole-manuscript charge

The source-pair reset was charged against every two-rune word on unknown physical pages and against four fixed pair variants: forward or reversed order, with positive or negative sign.

There are465 two-rune words. Forty-six begin at a page-local offset equal to a GP prime weight. Forty of those also have a GP0 sum inside signed words11 through40, where the ten natural signed triplets define a source state pair.

Only one of those forty matches any charged pair variant. It is p0 word24 at prime-selected start109, and the matching variant is the forward negative source pair from BEWARE FALSE PATHS. Without the prime-start restriction there is one additional negative-forward hit on p37.

For the branch readout, the manuscript contains32 triples of consecutive words in the p50-to80 filtered stream under base60. Exactly one triple has source labels PATHS, PATHS, LUCK. Exactly one triple has its latter two shed interiors labeled THE, ROAD. They are the same p0 triple beginning at word24.

## Radix and numbering controls

The earlier READ/OUT split addresses are55 and20. Their p50 tokens are 1K and1g.

Conventional base60 gives:

    READ -> 80
    OUT  -> 102

The drop-f base59 rival gives79 and100. The same difference recurs at the downstream reset and branch addresses40 and37: token1K is80 under base60 and79 under base59.

The exact PATHS, PATHS, LUCK route exists once under base60. The base59 return-to80 stream has no three-word route and does not produce this readout.

The signed-word numbering convention is also discriminated locally. Zero-based numbering maps the relevant values 40,40,37,1,23 to PATHS, PATHS, LUCK, THE, ROAD. One-based numbering maps them to FALSE, FALSE, GOOD, HELLO, THE.

The independent signed-message DH audit already selected zero-based word positions in its full role-assignment family, so the local result agrees with a separately derived source convention.

## Direct GP-origin warning interval

The same EA109 word supplies a shorter source-visible exit than the later word29 scan. Its original rune values are [14,26]: GP0=40 and GP1=42. Authenticated source positions40..42 are exactly PATHS VERIFY OPENPGP.

Among448 canonical complete two-rune unknown words, nine have GP0=40. Only one begins at a GP-prime offset, the already selected p0 start109. The independent signed-tail corridor had already established positions40..42 as the final suffix of its authored warning program.

This yields:

    EA109 -> PATHS VERIFY OPENPGP
    -> GP0(OPENPGP)=75 -> p50[75]=177
    -> packet166..188

See im-results/lp2-p0-ea109-gp-origin-warning-interval.md.

## Decision

This substantially narrows the READ OUT receiver ambiguity and now has a manuscript-local exit.

Conventional base60 is the only charged radix that closes both the original 80/102 receiver and the later EA-selected return branch. Zero-based signed-word numbering gives a unique source-semantic PATHS/PATHS/LUCK sequence whose shed interiors reproduce THE ROAD.

A subsequent frozen-family check finds the missing exit. From the already selected EA109 start to the end of p0, exactly one complete word has raw GP0 equal to any of the authenticated warning values BEWARE/FALSE/PATHS/VERIFY/OPENPGP. It is p0 word29 at124..126 with GP0=75, uniquely matching OPENPGP. Original p50[75] is177 under base60 and174 under base59. The base60 value177 is the exact center of the independently selected second 23-rune center-F receiver166..188; base59 fails that receiver type.

The p28 READ OUT construction and the zero-based GP0-as-signed-word-number interpretation were recognized during ongoing research rather than fixed by a blind precommit. Keep offsets103..108 classified as conditional plaintext. The combined route now has a concrete source-visible continuation:

    READ OUT -> p0 receiver -> THE ROAD -> EA109
    -> PATHS / LUCK
    -> OPENPGP75 -> p50 center177
    -> second p0 warning packet166..188

Further serialization menus inside p0 80..165 have low value. The next useful work is an external consumer of the already fixed second packet or dual-packet DH cascade.

See im-results/lp2-p0-ea109-openpgp177-warning-bridge.md.

Reproducer: sims/lp2_p0_ea109_signed_paths_reset_sft.cjs

Related evidence:
- im-results/lp2-p57-must-shed-lead-the-road-conditional-plaintext.md
- im-results/lp2-p0-ea109-readout-return.md
- im-results/lp2-signed2016-triplet-state-tape.md
- communications/broadcast/20261119T0400Z_critic_signed2016-word-position-role-audit.md
