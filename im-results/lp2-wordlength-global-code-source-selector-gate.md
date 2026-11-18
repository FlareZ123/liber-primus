# LP2 global word-length exception channel: source-selector gate

**Decision: close Director Issue #1463 as source-selector absent (18 November 2026).** No original unknown-page plaintext, key, complete cipher inverse, or destination was recovered. This is a bounded rejection of the proposed *2016-word-length global exception-channel reading as an actionable decoder*, not a proof that every conceivable global side channel is impossible.

## Question

Could the PGP-signed 2016 instruction that Liber Primus words form a map, their meaning a road, and their numbers a direction select one globally invertible code in which the printed word-length register carries the information lost by a 29-to-28 anti-repeat emitter? Such a decoder would have to recover both the original plaintext word lengths and every exception position, including the two disjoint doublets inside original p27 word 1476, without an unprinted per-word key table.

## Source-selector decision

The preserved 2016 signed object is [resources/historical/cicada2016-4gq25-outguess.asc](../resources/historical/cicada2016-4gq25-outguess.asc). It identifies words, meaning, and numbers as relevant concepts, but it does **not** specify word length as the numeric register, a permutation or ordering of the word-length sequence, a length-to-state map, an exception code, a state update, a starting position, page/chapter reset semantics, or a receiver that reconstructs the original word lengths. “Numbers” is not uniquely distinguishable here from the Gematria Primus prime values, word prime sums, rune positions, or word lengths.

The earlier signed 2012 source is a useful human-solve-path comparison: it uses path/road language but also explicitly says “Let the Chorus be your guide”; the original MIDI note-and-time ordering supplies the executable selector. See [the preserved signed message](../resources/historical/cicada2012-midi-email.asc). The 2014 GEB route likewise used explicit title/exchange/word/letter coordinates. The source audit in [Issue #1304](https://github.com/FlareZ123/liber-primus/issues/1304) found no first-party semantic-to-index codebook or start/stop rule in the 2016 clue. None of these historical precedents selects a global code over LP2 word lengths.

A competing interpretation of “numbers are the direction” is currently being explored from the first-onion participant `count` examples: GP word-prime sums such as PARABLE=449 and FIND=151 are paired with `*`/`+` suffixes, while p57 clause sums are emirps. That source is explicitly an unsigned participant reconstruction, and the proposed mapping from suffixes to cipher-pointer direction remains conjectural; it points to word numbers, not a defined word-length permutation. Preserve it as a separate lead, not as proof of this issue's premise ([Agent4 handoff](../communications/broadcast/20261118T103654388Z_agent4_p57-count-emirp-direction.md)).

## Original-input constraints already measured

The canonical original LP2 register contains **12,956 runes, 2,896 printed words, and 32 physical-page word carries**. The 86 adjacent-equality events comprise **63 internal** and **23 word-boundary** events. Per word, the exception-count distribution is **2,812 with zero, 82 with one, and two with two**; the p27 stress word is index 1476, length 12, with two disjoint internal doublets.

Agent3's original-source one-step model (E_i=f(L_{i+1}-L_i)) is not a lossless exception decoder. The measured forward mutual information is **56.154 bits total**, leaving **505.543 conditional bits**; the reverse alignment is weaker. A centered three-word length tuple has **276.120 empirical bits**, but fails its within-chapter shuffle control (**p=0.14495**) and still leaves **285.193 residual bits**. See the full [word-length conditional-independence and exception report](lp2-printed-wordlength-conditional-independence-original-gate.md) and [Issue #1456](https://github.com/FlareZ123/liber-primus/issues/1456).

The complete word-length multiset has **8,791.876 bits of theoretical ordering capacity**. This establishes only that many possible orderings exist; it does not identify which ordering is intended, encode the 86 exception events, or let a decoder recover the plaintext length sequence. Capacity is not a code. A globally chosen permutation would need an independently sourced rule and an exact inverse.

The obvious source-visible global orders have already been tested separately: p15's 16-cell Fibonacci order against the 2,896=16×181 word layout; p50's eight-column order against 2,896=8×362; and all standard unkeyed ragged rectangular word transpositions at widths 2–256. These fixed receivers do not restore calibrated native-GP English word-length grammar. Their scoped results are consolidated in the [word-length report](lp2-printed-wordlength-conditional-independence-original-gate.md). They do not exclude every possible global or stateful code, but they provide no selector for this one.

## Relevant independent prior art

A separate external implementation interpreted the same 2016 map/road/direction sentence by using an LP1 word list as a codebook, indexing it by ciphertext-word position, cumulative rune offset, or word length, and using the selected entry's GP prime value modulo 29 or 28 as a per-word direction/shift. It ran **4,176** original-cipher decodes on page heads 0–2; its planted controls recovered, but the best original score (**4.484**) remained below its stated bar (**6.632**). This is a negative for that specific direct key-schedule reading, **not** a test of every global exception side channel. See the pinned external [MEASURED-CEILING report](https://github.com/Dukotah/cicada3301/blob/6b945291ed298c14ccf8c73603f695a28f6a7e35/liber-primus/MEASURED-CEILING.md) and [reproducer](https://github.com/Dukotah/cicada3301/blob/6b945291ed298c14ccf8c73603f695a28f6a7e35/liber-primus/analysis/round37/C1-composed-clue-readings/sweep.py).

## Decision and reopening condition

No first-party artifact selects a global permutation/order or finite-state distribution code over printed word lengths, specifies how the original plaintext lengths are recovered, or defines a clock that survives the 32 page carries and p27's double-doublet word. Constructing a higher-order automaton, choosing a permutation from the large theoretical space, or adding exception-specific state now would manufacture the missing instruction rather than test one. No new synthetic SFT is justified until the source fixes that operation.

Close #1463 at **source selector absent**. Reopen only if an independently authenticated source supplies the length register, global order/state transition, start/reset and inverse, or if an independently constrained mechanism produces a substantial original plaintext passage and a correct withheld-page prediction. Do not reopen the retired memoryless ΔL family or the already-tested p15/p50/all-width unkeyed word-order variants under new names.
