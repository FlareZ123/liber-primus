# P57 19×4 source schedule gate for p55

**Agent2 · Director issue #1668 · 18 November 2026. Classification: source-selection result. One new exact cardinality is established; no unknown LP2 plaintext, key, cipher, or destination is recovered.**

## Decision

The clear p57 source independently contains **19 body words and four printed periods**, giving the exact product **19×4=76**. This matches both the 76 original p55 runes and the 76 cells of the printed 32×8 table perimeter.

That relation strengthens the case for testing a 4×19 schedule once. It still does not select a unique 76-step receiver. The p57 page gives no decimal numerals, its four periods do not divide the rune stream into four equal rows, and several equally source-natural word-number functions produce different 76-position schedules.

Close #1668 on the negative fork. Preserve 19×4=76 as an exact source-visible structural relation. Reopen the schedule family only if a first-party clue fixes which word quantity supplies the update and how that update consumes p50/p55.

## Frozen source facts

The canonical p57 transcription has 95 GP29 runes in 20 complete printed words: the seven-rune heading PARABLE plus 19 body words. Their rune lengths are:

`[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6]`.

The page prints four periods. Counting runes before each period places them at cumulative rune offsets **7, 37, 67, 95**, giving clause lengths **7, 30, 30, 28**. The four marks therefore provide a count of four while failing to provide four equal source rows.

The exact original p55 page contains 76 runes. The unchanged numerical table has 32 rows and 8 columns, so its one-cell outer perimeter contains `2×32 + 2×8 − 4 = 76` cells.

## The new 19×4 relation

Excluding the separately printed PARABLE heading leaves exactly 19 body words. The four authored periods give an independent p57-local count of four. Thus:

`19 body words × 4 periods = 76`.

This relation does not depend on p55 being reshaped as 4×19, and it does not borrow the row count from the target. It is therefore a cleaner motivation for the already tested 19-column family than the earlier observation `76 = 4×19` by itself.

## Why p57 still does not define one 76-step schedule

### Competing source-native 76-rune passages

Whole-word boundaries alone admit two different contiguous 76-rune spans:

- printed words 4–19, INSTAR through AND;
- printed words 5–20, TUNNELNG through EMERGE.

The literal circumference reading also yields two distinct 76-rune objects when the PARABLE heading is retained and one edge is removed from each of the 19 body words: remove-first and remove-last. Both constructions were already tested against p55 in prior source gates and do not recover plaintext.

### Competing source-native word numbers

P57 prints no decimal number. If the four periods are provisionally treated as four row states and the 19 body words as columns, at least three direct quantities are visible for every word without fitting plaintext:

- word rune length modulo 4;
- sum of GP rune indices modulo 4;
- sum of GP prime weights modulo 4.

Applying each quantity as the per-column row rotation produces three distinct 76-position permutations. No p57 wording chooses one of these numerical representations.

The GP-prime-sum modulo-4 version is already covered by `im-results/p57-bodyword-prime-sum-p55-columnar-gate.md`: both rotation signs were tested on the untouched p55 source and produced nonlinguistic output. Testing the other two merely because they remain available would expand the cipher menu after seeing failure, contrary to the issue gate.

### Missing value operation

Even a uniquely chosen position schedule would leave another independent decision unresolved. P57 does not specify whether the p50 perimeter values are shifts, ranks, bytes, symbols, or state updates, and it does not select a reversible operation that combines them with p55. Earlier exhaustive stationary ring orientations and direct numeric key families already fail. The present result supplies no reason to reopen those families under a new fitted clock.

## Reproduction

`sims/lp2_p57_19x4_p55_schedule_source_gate_sft.cjs` reads the canonical transcription, corpus, and numerical table. It asserts the 95-rune p57 parse, 20/19 word counts, four periods, period offsets, 19×4=76 product, p55 length 76, perimeter size 76, both contiguous whole-word 76 spans, both one-edge 76 constructions, absence of decimal numerals, and three distinct source-natural modulo-4 schedules.

Windows Node 22 CI passed: https://github.com/FlareZ123/liber-primus/actions/runs/44413602888

## Research consequence

The useful discovery is the p57-local **19 body words × 4 periods = 76** relation. Treat it as a structural clue that can support a future receiver once an operation is independently specified. It currently supplies neither a unique schedule nor a cipher.