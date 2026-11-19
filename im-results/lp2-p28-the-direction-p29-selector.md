# P28 structural DIRECTION selector and the p29 repeated-root gate

**Agent17 original route with Agent18 structural update, 19 November 2026. Classification: source-selected p29 gate with a target-free p28 clause selector.** The canonical p28 held-out candidate `READ OUT THE` ends at offset141. A later structural readout from the four untouched words at offsets142..160 emits authenticated source phrase `THEIR NUMBERS ARE THE`, whose unique continuation is `DIRECTION`. This removes the older dependence on a one-based p28 word self-location, which was retired by the canonical cross-page parser correction. P29 remains the unique unknown rune page carrying the p39 red-triad repeated root24 and the sole rune page sharing a repeated root with the printed numeric table.

No p29 body plaintext inverse is claimed.

## Canonical p28 source/page alignment

The held-out source family fixes authenticated zero-based source index28 `THE` to project p28 and predicts the exact p28 complete-word receiver at offsets140..141. Under the corrected cross-page parser it is canonical word28. The older claim that physical page29, canonical word29, and one-based source word29 form a three-way self-location is retired.

The surviving alignment is:

~~~
source index28 THE
project page p28
held-out receiver offsets140..141 -> THE
~~~

Authenticated source index29 is the immediate follower:

~~~
29 DIRECTION
~~~

## P28 reads the clause before DIRECTION

The four complete p28 words immediately after THE have:

~~~
offsets142..145  GP0 23  length4
offsets146..150  GP0 19  length5
offsets151..154  GP0 22  length4
offsets155..160  GP0 27  length6
~~~

So:

~~~
GP0 vector    [23,19,22,27]
length vector [ 4, 5, 4, 6]
~~~

Apply the fixed forward-H difference half `[x0-x3,x1-x2] mod29` to each vector:

~~~
GP0    -> [25,26]
length -> [27,1]
~~~

Using the established zero-based signed-source register gives:

~~~
25 THEIR
26 NUMBERS
27 ARE
 1 THE
~~~

The untouched p28 structure therefore reads:

~~~
THEIR NUMBERS ARE THE
~~~

The authenticated 43-word source contains that exact phrase once, at indices25..28, followed immediately by index29 `DIRECTION`.

Across all **2,699** canonical page-local four-word windows, this is the sole fixed difference/difference, GP-first readout producing any contiguous four-word signed-source phrase. The four raw p28 words also have manuscript-unique H shells entirely in the established DH/state register. Full evidence and reproduction are in `lp2-p28-numbers-direction-readout.md`.

## Independent THEIR-RISE clause translation

The p33 `THEIR RISE` route independently fixes rise `25-19=6=a`. Applying +6 to the earlier authenticated clause gives:

~~~
19 THEIR   20 MEANING  21 IS   22 THE   23 ROAD
          +6
25 THEIR   26 NUMBERS  27 ARE  28 THE   29 DIRECTION
~~~

Thus the p28 structural readout and the independent +6 clause translation converge on the same DIRECTION endpoint.

## DIRECTION selects p29

The signed instruction says that the word numbers are the direction. The recovered clause ends at source index29 `DIRECTION`. Under the established zero-based source/project-page convention this selects project p29, physical page30.

This page selection is available before inspecting p29's polynomial property.

## Independent p29 test

P39 visibly marks the red rune triple:

~~~
[27,5,15]
~~~

whose high-first polynomial is:

~~~
G(X)=15X^2+5X+27
    =15(X-24)^2 mod29.
~~~

Among all 55 unknown rune-bearing pages, the repeated-root condition

~~~
P(24)=0
P'(24)=0
~~~

holds on exactly one page:

~~~
p29.
~~~

The printed 256-cell numeric table reduced modulo29 also has repeated root24. Charging every unknown rune page against the table, the complete shared-repeated-root census has exactly one page/table hit:

~~~
p29 <-> p50 table, repeated root24.
~~~

Thus the DIRECTION-selected page independently matches the manuscript-wide unique repeated-root relation.

## Current causal route

~~~
p28 READ OUT THE
-> p28 structure reads THEIR NUMBERS ARE THE
-> unique authenticated continuation DIRECTION29
-> project p29
-> independent p39-G repeated-root24 test
-> unique p29 / p50 shared-root relation
~~~

The independent p33 THEIR-RISE clause translation reaches the same DIRECTION endpoint and remains corroborative.

## Remaining gate

The route still does not specify why the p39 red triad should be consumed as a polynomial operation beyond the established factor evidence. It also does not select division versus derivative versus another reversible p29/p50 consumer, serialize a plaintext key, or produce p29 body plaintext.

Existing negative direct quotient-pad, broad G-adic, GF841, and direct DH-power consumers remain retired. New p29 work should require a source-selected operation whose inputs are fixed before ciphertext output is opened.

## Reproduction

- Structural clause readout: `node sims/lp2_p28_numbers_direction_readout_sft.cjs`
- Original p29 repeated-root selector: `node sims/lp2_p28_the_direction_p29_selector_sft.cjs`
- THEIR-RISE source bridge: `node sims/lp2_their_rise_signed_direction_bridge_sft.cjs`
