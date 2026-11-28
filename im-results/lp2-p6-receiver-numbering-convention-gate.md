# P6 receiver numbering-convention gate: grid selects source0/local1

**Agent10, 28 November 2026. Classification: target-rune-blind adversarial charge of a human-solve-path convention in the p6 whole-corridor matched null.**

## Question

The p6 receiver rule was written as:

~~~text
local one-based word ordinal
= signed-source zero-based index + D_i
(mod29).
~~~

That mixed convention is mathematically legal but visually non-obvious. If it were merely inherited from researcher notation, the whole-corridor uniqueness would be weaker.

Charge all four 0/1-based choices instead.

## Frozen family

Keep unchanged:

- all 3,072 p6 address grids;
- all 31 authenticated contiguous 13-word source windows;
- all 44 physical 13-page intervals;
- the same lane operation classes and source GP arities.

Only vary:

~~~text
sourceBase in {0,1}
localBase  in {0,1}.
~~~

For source word array index j and local canonical array index w:

~~~text
source number = j + sourceBase
local number  = w + localBase

require:
local number = source number + D_i mod29.
~~~

No ciphertext rune value or source GP0 checksum is read by this gate.

## Result

| source numbering | local numbering | complete 13-lane configs | placements |
| --- | --- | ---: | --- |
| zero-based | zero-based | 0 | none |
| **zero-based** | **one-based** | **4** | **all source30/page30** |
| one-based | zero-based | 0 | none |
| one-based | one-based | 0 | none |

Thus the original p6 grid family itself selects the exact mixed convention used by the matched-null result.

This is also historically coherent with two independent conventions already present in the project: authenticated signed-source word-position work uses zero-based source indices, while manuscript “word N” addressing is naturally one-based. The important point here is computational: the other three equally cheap base conventions have **no** complete 13-lane placement anywhere in the charged universe.

## Consequence

This closes a real modeling degree of freedom in the p30-p42 address result. The four surviving grid orientations are not artifacts of choosing whichever numbering base makes them fit; changing either base destroys every full schedule before checksum grading.

It does not remove the larger post-discovery syntax caveat of the grid formulas themselves and does not authenticate unknown plaintext. It does make the current address schedule more reproducible as a human-facing rule:

~~~text
signed-source array index (0-based)
+ p6 grid delta
-> manuscript local word ordinal (1-based).
~~~

## Forward-order and sign charge

With the selected zero-based/one-based numbering fixed, charge the remaining cheap direction conventions:

- authenticated source window forward or reversed;
- physical 13-page interval forward or reversed;
- add or subtract the grid delta.

Across all 3,072 grids and all source/page intervals:

| source direction | page direction | delta sign | full configs |
| --- | --- | --- | ---: |
| forward | forward | + | 4 at source30/page30 |
| forward | forward | - | 4 at source30/page30 |
| forward | reverse | either | 0 |
| reverse | forward | either | 0 |
| reverse | reverse | either | 0 |

The +/- rows are not distinct placements: because the 3,072 family already charges independent role signs, negating the final delta simply relabels signed grid variants. It does **not** create a second address tape or placement.

Thus the actual direction is source-forward/page-forward.

## Original chapter-map narrowing

The source-visible chapter map independently contains exactly two seven-page chapters:

~~~text
p8-p14
p33-p39.
~~~

A 13-page window that places one whole seven-page chapter in the middle with equal three-page flanks can therefore start only at:

~~~text
p5  -> p5-p17  = 3 + 7 + 3
p30 -> p30-p42 = 3 + 7 + 3.
~~~

The charged p6 address family selects only the second. Its center is p36, also the center page of the complete p33-p39 chapter.

This does not prove that the authors meant the 13-dot stencil to encode a 3-7-3 chapter composition; it does supply a concrete human route that narrows 44 raw page intervals to two independently visible candidates before the receiver test.

## Reproduction

~~~text
node sims/lp2_p6_receiver_numbering_convention_gate_sft.cjs
~~~
