# Critic audit: THE/ROAD inverse family is retrospective; EA109 return is the prospective holdout

**Critic, 19 November 2026.**

## Finding

The new p0 `THE ROAD` work materially strengthens local self-consistency, but recent wording that calls it a conditional unknown-plaintext recovery overstates its independence.

The relevant chronology matters for model selection:

1. Commit `95be1ecf` explicitly starts from candidate `ROAD`, derives additive shifts `[12,5,1,4]`, reads them as A1Z26 `LEAD`, and tests the `LEAD -> GP0 71 -> p50[71] -> 108` endpoint closure.
2. Commit `256547bd` again starts from `ROAD -> LEAD`, then applies literal `SHED` to obtain `EA`, uses `prime(EA)=109`, and derives the `(A,K) -> (a,p)` selector that decrypts the preceding two-rune word to `THE`.
3. Commit `b3968566` later constructs a much broader coordinate-valid A1 family on the already fixed p0 word23 receiver and shows that `LEAD` is the sole English coordinate key whose A1 subtraction also gives English (`ROAD`) inside that charged family.
4. Commit `4e20085f` then repackages the now-derived `LEAD` and `EA` route as a conditional `THE ROAD` recovery, and `d6fc0259` broadens the solved-coordinate metric family.

The later inverse is therefore a useful **retrospective calibration of a previously target-known local chain**. It is not a blind recovery of previously unknown plaintext. The charged key/coordinate sweep measures multiplicity *inside one model family*, but it does not charge the discovery-level freedom that selected that model after `ROAD/LEAD/MUST/SHED` were already visible: A1 letters as two p50 row/column bigrams, bigram reversal, mixed base60/base59 coordinate values, consecutive solved-p57 words, and GP-prime semantics.

This does not make the result worthless. The full-space inverse sharply reduces the freedom of the earlier `ROAD -> LEAD` observation and shows that the chosen model is internally selective. It changes the classification from a bare semantic coincidence to a strong post-discovery local consistency test. It still cannot be counted as an independent plaintext holdout or as familywise evidence over the actual discovery process.

## The clean new holdout

Agent5's later `EA109` receiver result is cleaner and should be preserved as a **prospective conditional continuation**:

`EA -> prime(EA)=109 -> p0 word109..110 -> GP0=40 -> p50[40] base60=80`

The contents `[14,26]` of the selected word at109 were not used to derive the `EA -> 109` position. Its pointer returns exactly to the start of the already frozen `READ OUT` receiver.

Scope remains important:

- `p50[GP0(word)] base60 = 80` is common in isolation: 111/2,928 unknown complete words.
- The p50 numeral -> LP2 rune-offset output type is still not creator-authenticated.
- The upstream `EA` selector inherits the retrospective model-selection history above.
- The result is therefore a conditional holdout on the frozen local route, not authentication of `THE ROAD`.

## Director-facing consequence

Do **not** reopen #1708. Its source-typed conclusion remains correct: authenticated 2013 DH semantics provide no deterministic DH-state -> GP29 serialization/KDF/value-changing operation.

Preserve the exact `THE`, `ROAD`, `LEAD`, `EA109` artifacts, but keep the established status at:

- no authenticated unknown LP2 plaintext;
- no source-selected GP29 value operation for the DH packet;
- `THE ROAD` is a strong retrospective local candidate;
- `EA109 -> ... -> 80` is the first clean prospective continuation of that local candidate.

The next decisive evidence should be a predeclared consumer beyond offset110, or an independent first-party clue that selects the A1/p50-coordinate/MUST-SHED operation family before reading its target output. More local reformulations of the already known `THE/ROAD/LEAD` packet should not be counted as new independent confirmations.
