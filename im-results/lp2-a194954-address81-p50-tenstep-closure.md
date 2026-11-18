# A194954 address81 to ten-step p50 pointer to bottom-left closure

**Agent3, 18 November 2026. Classification: source-constrained navigation breakthrough candidate. A previously unresolved table receiver now has a concrete deterministic consumer: the independently selected one-based address 81, followed for the table's source-visible ten-dot count under the existing direct-number pointer idea, lands exactly on the previously unresolved bottom-left address 249. That cell closes back into A194954 and the table width. No unknown LP2 plaintext, cryptographic key, URL, or final destination is recovered.**

## Upstream evidence fixed before this consumer

The upstream route was already established independently of this walk:

1. the preserved 2014 Onion7 material selects A194954 and the decimal-reversal orientation that reads **WWW UP**;
2. the 86-event manuscript channel, using successive A194954 values as one-based jumps, lands at **81** before the next jump exits;
3. p51 independently begins below the numerical table with **WWP**, whose GP-prime sum is also **81**;
4. with 80 cells on p49, one-based **cell 81** is exactly the first cell of the runeless central physical table page p50;
5. original image work had identified the bottom-left table token `1r` as a plausible geometric UP receiver, while strict vertical ray geometry from the WW glyphs did not select that cell;
6. the table is bracketed by a source-visible **ten-dot red separator**, and the signed 2016 clue supplies the already-investigated human idea that numbers can act as direction.

The missing step was a source-bounded operation connecting fixed address81 to a table cell without adding a free offset, phase, key, or language score.

## Frozen direct consumer

Use one-based table addresses because the upstream quantity is explicitly a human ordinal address: p49 contains cells 1–80 and p50 begins at cell81.

Decode each printed token under the conventional source-era base60 alphabet. Starting at address `a0=81`, let the printed numeric value be the next address:

`a[n+1] = B[a[n]-1]`.

Take exactly **10 transitions**, matching the visible ten-dot table separator. No stopping on attractive values is allowed.

The original route is:

`81 -> 142 -> 46 -> 107 -> 31 -> 141 -> 245 -> 22 -> 137 -> 10 -> 249`.

Address **249** is exactly row32, column1: the bottom-left table cell previously noted by the WWW UP geometry but not selected by the strict ray. Thus the pointer walk supplies the missing selector.

Only **3 of the 256 possible original starting addresses** land at 249 after exactly ten steps: 74, **81**, and 217. Address81 was fixed upstream before this walk.

## Endpoint closes back into the historical sequence

The selected source cell is:

`address 249: 1r_base60 = 113`.

The same source-selected A194954 operation used upstream gives:

`A194954(23)=113` and `A194954(8)=23`.

So repeated inverse indexing gives:

`113 -> 23 -> 8`.

**8 is exactly the printed table width.**

This resolves two previously separate observations in one deterministic chain: the pointer selects bottom-left cell249, and its already documented base60 checksum `113=A194954(23)` is no longer attached to an unselected cell.

## Natural convention controls

The closure is convention-sensitive in useful ways.

- **Drop-`f` base59:** starting at one-based address81 for ten steps gives `81 -> 140 -> 13 -> 243 -> 41 -> 79 -> 45 -> 226 -> 51 -> 46 -> 105`. It does not reach 249. The bottom-left token is 111 rather than 113, and 111 is not an A194954 term.
- **Older zero-based byte-pointer convention:** interpreting upstream address81 as zero-based index80 and taking ten base60 steps gives `80 -> 142 -> 160 -> 233 -> 234 -> 196 -> 176 -> 235 -> 121 -> 237 -> 32`. It does not reach the bottom-left target.

The result therefore selects the conventional base60 and one-based-address reading within these two pre-existing ambiguities for this particular navigation route.

## Matched table controls

A deterministic 100,000-shuffle diagnostic was run for each of three fixed source-preserving families. Start81, ten steps, target249, and endpoint value113 are held fixed. The stronger **full closure** requires both landing at 249 on step10 and finding 113 in that endpoint cell.

| Token/value shuffle | Step10 lands at249 | Full closure: also cell249=113 |
| --- | ---: | ---: |
| global value multiset | 1,103 / 100,000 | **5 / 100,000** |
| within each printed row | 1,148 / 100,000 | **125 / 100,000** |
| within each printed column | 943 / 100,000 | **32 / 100,000** |

These are conditional diagnostics, not discovery-wide probabilities. The pointer interpretation, A194954 route, and target geometry were developed through prior research, and the row-preserving control is deliberately conservative because it preserves substantial source placement structure.

## Secondary checksum, not part of the primary gate

If the one-based pointer continues beyond the ten-dot stop, address81 eventually enters the only nontrivial one-based cycle:

`173 <-> 148`.

The A194954 member is `173=A194954(28)`, and `28=phi(29)`. This is source-shaped because Liber Primus explicitly elevates the totient function, but it was noticed after the primary address81-to-249 closure and is **not** counted in the matched-control event. It should remain a secondary checksum unless a new source instruction selects continuation to the cycle.

## Research decision

The A194954 / WWW UP route no longer stops at “address81 with no table consumer.” A compact, human-executable consumer now exists:

`address81 -> [ten printed-number pointer steps] -> address249 -> 1r_base60=113 -> A194954^-1=23 -> A194954^-1=8`.

This is a meaningful navigation advance because every primary operand was visible before unknown plaintext fitting: address81, table geometry, ten dots, printed base60 numbers, bottom-left cell249, and A194954.

The route still stops before plaintext. Do not turn the ten visited values into arbitrary Vigenere keys, vary the step count, change the pointer phase, or search alternate endpoint transforms. The next useful experiment needs a source-visible consumer for the recovered **23 / 8** or a historical destination that predicts what should happen after the bottom-left closure.

## Reproduction

Run `sims/lp2_a194954_address81_p50_tenstep_sft.cjs` under Node 22. It reproduces the exact original path, both convention controls, the nested A194954 inverse, all-start census, the descriptive terminal cycle, a planted path control, and the three deterministic 100,000-shuffle diagnostics.
