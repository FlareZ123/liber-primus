# LP2 repeat-gap channel: no source-selected codec; capacity only

**Decision:** No currently available author-era source selects an integer codec, gap convention, or framing for distances between adjacent-repeat events. The observed positions have combinatorial capacity, but capacity is not a decoding rule. No gap-derived plaintext, key, or instruction is recovered. This is a bounded negative for the gap-code route, not proof that event locations contain no information.

Issue: [#2826](https://github.com/FlareZ123/liber-primus/issues/2826).

## Source-selection audit

The known sources supply genuine numerical or carrier conventions, but none selects repeat-event gaps as a message alphabet.

- Solved LP2 p0 says primes and the totient function are sacred and that all things should be encrypted ([canonical solved text](../resources/external/relikd-solved-gp29-native-v1.json)). This motivates prime/totient and encryption research generally; it does not define repeat events or gap coding.
- LP2 p15 has a source-motivated prime/Fibonacci numerical construction. Its tested packet interpretation fails at body index36 ([p15 packet gate](lp2-p15-fibonacci-gap-packet-fhold.md)). A local sequence of Fibonacci/prime ordinal differences is not a self-delimiting code for repeat gaps.
- Solved p56 gives a hash target and a duty to seek the matching page; p57 says to shed circumferences and find the divinity within. Neither defines repeated-symbol events, an interval measure, or an integer representation.
- The authenticated 2016 message says: “Its words are the map, their meaning is the road, and their numbers are the direction.” This is word-level numerical guidance, not a repeat-distance instruction ([signed 2016 message](../resources/historical/cicada2016-4gq25-outguess.asc)).
- The 2013 Gematria JPEG is an actual whitespace-bit carrier with byte-oriented framing, not an integer-gap channel ([signed source](../resources/historical/cicada2013-gematria-jpeg-outguess.asc); [source report](lp2-2013-gematria-jpeg-outguess-original-source.md)). The LP2 line-final-hyphen analogue was separately tested and did not yield a typed payload ([#2542](https://github.com/FlareZ123/liber-primus/issues/2542)).
- Existing repeat-location/context work in [#2083](https://github.com/FlareZ123/liber-primus/issues/2083) and [#2411](https://github.com/FlareZ123/liber-primus/issues/2411) supplies no gap codec or receiver.

No source fixes: (1) event definition; (2) index difference versus intervening-position count; (3) global/page/line/word resets; (4) leading/trailing censored intervals; (5) integer base and self-delimiting code; (6) sign, order, termination and byte/word packing; or (7) a typed recipient whose recovered key/instruction changes an unknown-page inverse. Choosing these after inspecting candidate output would be codebook fitting.

## Observed event geometry

The canonical source contains 12,956 runes on 55 rune-bearing pages (p50 is blank), giving 12,901 within-page adjacent opportunities. There are 86 adjacent-equality events and 85 consecutive event gaps. The minimum event-site separation is six; the T7 lag-one Pearson correlation of the gaps is +0.38001968924100965.

The source transcription has 594 printed-line strata. Exactly 83 lines contain events: 80 contain one event and three contain two. Thus only three of the 85 consecutive gaps are within a printed line; **82 cross printed-line boundaries**. The existing exact-line-conditioned null makes the observed T7 statistic ordinary (upper-tail p=0.23194420). The page-conditioned result remains more unusual, but the line-conditioned result shows that T7 is not independent evidence for a gap-message once visible line occupancy is fixed. See [the original-source-conditioned gap report](lp2-doublet-gap-original-source-conditioned.md) and [the T7 source/page-axis report](lp2-t7-original-source-p15-pageaxis-familywise-gate.md).

Page framing is not optional if a code resets by page. Of 55 rune-bearing pages, 42 contain at least one event and 13 contain none. There are 44 within-page inter-event gaps, 84 leading/trailing censored intervals across event-bearing pages, and 13 whole-page no-event spans: 141 page-framed intervals. A single global stream instead has 85 inter-event gaps and two book-edge censored intervals. No source selects one framing.

## Combinatorial capacity and identifiability

The read-only reproducer [`sims/lp2_repeat_gap_channel_identifiability_sft.cjs`](../sims/lp2_repeat_gap_channel_identifiability_sft.cjs) counts event placements from the canonical corpus and printed transcription. It inserts one forced empty coordinate at each of the 54 page boundaries and uses a dynamic program to enforce global minimum separation six.

- Fixing each page's observed event count and enforcing global minimum separation six leaves `log2(count) = 616.3304775864` bits of possible event-position configurations.
- Fixing each of the 594 printed lines' event counts as well, with the same global minimum-separation constraint, leaves `log2(count) = 379.4417177541` bits of possible within-line placements.

These are exact counts for the stated constraints, expressed as logarithms; they are **upper bounds** on a channel that must also preserve measured T7 dependence. The second bound treats visible line occupancy as fixed and measures residual within-line placements. Neither count identifies an encoding. Without a source-selected codebook, an arbitrary mapping can assign the observed configuration any desired short string. Fibonacci, Elias, Golomb, or guessed base-29/base-60 expansions cannot be chosen merely because they yield printable output.

The gap list alone is insufficiently framed unless the decoder specifies its origin and reset convention. Omitting leading/trailing intervals loses each page's initial offset and final remainder; omitting page delimiters merges distinct page-local configurations.

## Reopening criterion

Reopen only if an independent first-party artifact or instruction selects, before inspecting decoded output: (1) event definition and exact gap measure; (2) segmentation/reset scope and all censored intervals; (3) a particular self-delimiting integer code, including base, sign, order, terminator and packing; and (4) a typed key/instruction recipient that makes a locked prediction on untouched LP2 ciphertext.

If such a selector appears, freeze the complete gap-to-message map before decoding, test against event-conditioned nulls preserving page occupancy and measured T7 dependence, include independent positive payload controls, and require the recovered material to change an unknown-page inverse. Until then, do not run generic prime, Fibonacci, base, bitstream or entropy sweeps over the gaps.
