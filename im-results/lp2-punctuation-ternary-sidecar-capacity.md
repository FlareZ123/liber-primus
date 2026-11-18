# Two capacity obstructions for fixed-position punctuation-coded LP2 anti-repeat encoders

**18 November 2026 · Agent 7 · Director Issue [#1420](https://github.com/FlareZ123/liber-primus/issues/1420). Evidence:** an exact source-size cardinality bound against one explicitly defined possible lossless anti-repeat sidecar. This recovers **no plaintext, creator-selected exception, key, decoder, or continuation destination**. [Original-corpus Node22 SFT](../sims/lp2_punctuation_ternary_sidecar_capacity_sft.cjs) · [passed Windows execution](https://github.com/FlareZ123/liber-primus/actions/runs/44249350951).

## Decision and strongest competing mechanism

A universal fixed-length encoder that deterministically excludes most repeated-rune outputs needs another channel to preserve arbitrary plaintext information. The independently source-observed GP29 alphabet, extremely low ciphertext-adjacent-repeat count, and physical manuscript punctuation make its non-word marks a potentially human-visible exception channel. The manuscript has no instruction to reinterpret those marks as ternary digits. The competing possibility is a reversible keyed or plaintext-coupled feedback cipher that produces a low repeat rate for this particular plaintext, without enforcing a global low-repeat output restriction. This bound does not address that competitor.

**Decision:** freeze all original physical-page rune lengths and punctuation *locations*. If the only mutable plaintext-dependent material besides those runes is at most three independently chosen symbol states at each of the **200** printed non-word mark locations, then **no injective mapping from arbitrary length-matched GP29 plaintext to a fixed-length runic output with at most 86 within-page adjacent doubles can exist**. If the encoder instead guarantees *each original page's observed individual repeat budget*, even **four** independent states per punctuation location are insufficient. These are two distinct universal-output classes, each too restrictive for the available sidecar; neither class is independently attested as Cicada's actual cipher. A method changing word-gap positions, printed numbers, page layouts, colors, hidden external files, output lengths, or using a smaller plaintext input alphabet is outside this obstruction.

## Source-anchored symbols, positions and upper bound

Read the unmodified [canonical physical-page rune array](../resources/liber-primus/lp2-corpus.json) and independently verify every one of its 12,956 runes against the original-page transcription [lp2-transcription.txt](../resources/lp2-transcription.txt). Exactly **55 physical pages** have unknown runes, and physical p50 is a purely numeric table. In the rune transcript the first 55 segments contain **175 ordinary `.` marks, 17 `&` breaks, 8 `$` illustrated-section boundaries**, exactly **200 positions**. These transcription glyph classes are editorial renderings of distinct printed delimiters, not proven three-way switchable physical marks. Treating all 200 positions as independently selectable ternary states therefore deliberately **overstates** the available channel capacity.

The original book has **12,901 within-page next-rune locations** and **86 equal-adjacent pairs**. For any *fixed* GP29 plaintext-to-output encoding restricted to at most 86 doubles, the number of possible runic outputs is

`A = 29^55 Σ_{k=0}^{86} C(12901,k) × 28^(12901-k).`

There are `29^12956` possible input rune books of those fixed page lengths. Their ratio is the exact binomial lower tail:

`q=A/29^12956 = Pr[Binomial(12901,1/29) <= 86] = 1.0708074748627 × 10^-98.`

Consequently any lossless sidecar must hold at least

`ceil(-log2(q)) = ceil(325.450254184) = 326 bits.`

Even an unconstrained ternary readout of every original mark location has only

`3^200 = 2^(316.992500144)`

distinguishable states, a **deficit of 8.457754040 bits**. Restoring universal injectivity under the same artificial ternary model requires **at least six additional independent ternary slots**, since `200+5` slots fall short and `200+6` exceed the lower bound. The six numeral glyphs recorded elsewhere in the transcription, `7,1,2,3,4,5`, are physical printed numbers, not a source-authored six-trit supplement. Their mere count is not evidence for a cipher.

If the actual original mark *inventory* is also immutable, only its assignment to the 200 fixed locations can vary. It has `200!/(175!17!8!)` distinct identity arrangements, **125.201342697 bits**, a much larger conditional deficit of **200.248911487 bits**. Actual image-specific distinctions and the original mark placement further constrain the construction; no additional entropy is inferred from a glyph's color without an explicit authored rule.

## Stronger per-page restriction also excludes a four-state sidecar

If a proposed anti-repeat encoder enforces the **original per-page budgets** rather than just an overall sum of 86 repeats, page `j` of length `L_j` can generate only runic outputs with at most its original `r_j` repeats. The exact product-cardinality lower bound for its sidecar is

`B_page = -Σ_j log2 Pr[Binomial(L_j−1,1/29) ≤ r_j] = 430.561201348 bits.`

Every `L_j` and `r_j` is recomputed directly from the 55 verified original arrays, with observed `r_j` from **0 through 5**. The main requirement of `≤86` repeats in the *entire* output permits more books than this stricter per-page bound. Its original-source deficit is therefore larger than the whole-book **325.450254184 bits**; it is not correct to apply the 430.56 result to a model that constrains only the global repeat count.

Now grant each of the same 200 fixed mark locations **four independently writable symbol states**, even though the manuscript has no authenticated four-ary punctuation codec. Their maximum capacity is `200 log2(4)=400 bits`, **30.561201348 bits short** of the conditional per-page requirement. Such an encoder requires **at least 16 extra independent four-state slots**, even under these generous assumptions. A four-state punctuation register *is* large enough (400 > 325.45) for the weaker whole-book global repeat cap, so the original three-state whole-book obstruction must not be generalized to any four-state global construction. The actual ink inventory, mark locations and numbers remain frozen in both calculations; a designer could exploit a completely different carrier or a stateful bijection.

The extended [SFT](../sims/lp2_punctuation_ternary_sidecar_capacity_sft.cjs) independently verifies all 55 original-page repeat budgets and prints the stricter bound. It passes the same Windows Node22 runner in [run 44251217983](https://github.com/FlareZ123/liber-primus/actions/runs/44251217983).

## Exact positive and original gates

[The standalone Windows-compatible SFT](../sims/lp2_punctuation_ternary_sidecar_capacity_sft.cjs) consumes the two published immutable input sources; confirms every original GP symbol, the source counts 12,956/12,901/86, and all 200 visible mark classes; calculates the 86-repeat binomial tail by recurrence; and checks four roundtrip cases of an independently coded 200-trit integer serialization. That positive shows an arbitrary 200-trit packet can be uniquely represented if the 200 mark identities really were freely mutable. It is an information-capacity sanity check, never a claim to have decoded the actual punctuation.

The original physical p27 twelve-rune printed word at offsets79–90 contains independent repeated pairs at local destinations5 and11. The whole-book ≤86 theorem includes that actual source word with no edits, but it is deliberately **not** a word-by-word theorem and does not imply that each printed word can carry only one exception. The already closed one-null-per-word R3 failure is documented independently in [the p27 hard-obstruction analysis](lp2-p27-two-disjoint-doublets-one-null-hard-obstruction.md).

Both tested models also fix the number and positions of words and printed line/page boundaries. Moving even a small subset of the **2,727** word-delimiter glyphs, changing the **594** source transcription line wraps, using the physical-image colors, or allowing more than 86 repeated runes in outputs would change the counting experiment. Such alternatives need their own independently authored operation and a complete decoder, rather than interpreting this negative as a general impossibility of compression or cryptography.

## Follow-through

The original manuscript supplies no authenticated mapping of punctuation marks to ternary symbols, no rule locating overflow symbols, and no instruction for reconstructing a changed anti-repeat alphabet. Accordingly, **do not invest in fitting ternary punctuation opcodes to ciphertext**. Any new claim of a universal 29→low-doublet GP29 encoder with unchanged page lengths should exhibit at least 326 bits of recoverable side information; a secret key independent of the plaintext cannot fill the missing per-input states. For the more plausible input-dependent feedback route, require a manuscript-selected state update and a contiguous independently testable plaintext prediction. These exact three-state-global and four-state-pagewise punctuation-only transports are retired. The two stopping rules are conditional, and the actual manuscript's cipher remains unresolved.
