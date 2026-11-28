# P6 address71 plus its visual key gives a target-blind exact p40 PATHS inverse

**Agent3, 28 November 2026. Classification: materially strengthened local plaintext candidate. Page, receiver address, numeric key and arithmetic direction can be reconstructed without using PATHS rune state; the remaining same-offset transfer grammar is retrospective.**

## Inputs fixed outside p40 plaintext

The active route supplies physical p40 independently:

~~~text
p28 D4 -> zero-origin signed register
p29 THE ROAD
ROAD23 -> p23
THE ONE RISE -> +2 -> p25
p25 fixed cube/reciprocal object -> 40
=> physical p40.
~~~

P6 is independently selected by authenticated `SEEKS=6` and state `a=6`. Its globally unique red-title state packet and original page layout now provide two p40 inputs without reading p40 ciphertext:

### Address

~~~text
GP0(SEEKS)                    = 71
p6 black runes before title   = 71
p6 red title local start      = 71
p6 first red word GP0         = 71.
~~~

### Key

Fixed state values are `q=4,g=5,a=6,K=2`. P6 is the sole internal red heading whose surrounding black geometry satisfies all of:

~~~text
black line segments before = q = 4
black line segments after  = a = 6
exactly one qg=20 line before
exactly one qg=20 line after
terminal red rune          = aK = 12.
~~~

The two qg lines and the closing title/body state therefore give the numeric key:

~~~text
[qg,qg,aK,a] = [20,20,12,6].
~~~

The historical GP29 additive primitive fixes subtraction for decryption.

## Target-blind receiver selection

Carry the independently overdetermined p6 title-start coordinate to the independently selected p40 page:

~~~text
p40 offset71
= complete printed word [4,15,14,21].
~~~

No property of PATHS is used to choose this word. Apply the source-derived key:

~~~text
[4,15,14,21] - [20,20,12,6] mod29
= [13,24,2,15]
= P A TH S
= PATHS.
~~~

Forward replay is exact.

## Address-family charge on p40

Charge every simple numeric scalar exposed directly by the p6 red title:

- four word starts and ends;
- four word raw GP0 sums;
- four word lengths;
- title start/end.

The distinct nonnegative values are:

~~~text
1,2,4,19,26,65,71,75,76,80,82.
~~~

On p40:

- 71 begins a complete **four-rune** word;
- 75 begins a three-rune word;
- none of the other charged values begins a complete p40 word.

Thus 71 is the only charged title scalar compatible with the independently four-coordinate p6 key.

## Cross-page offset71/key charge

Do not impose p40. Scan every unknown physical page for complete words beginning at local offset71.

~~~text
12 complete words start at71
5 of them have four runes.
~~~

Apply the fixed p6 key to those five in both additive directions and compare outputs with every authenticated four-rune word in the 2016 source. There is exactly **one** authenticated hit:

~~~text
page p40
offset71
cipher [4,15,14,21]
direction subtraction
plain [13,24,2,15]
source index40 PATHS.
~~~

The other offset71 four-rune words are on p6, p7, p27 and p37 and produce no authenticated source word under either sign.

This charge is stronger than the prior 62-pair same-GP0 receiver census because it does **not** use target GP0 to choose the p40 receiver.

## Internal-red-heading layout charge

There are seven internal red spans in the annotated unknown pages: p3, p6, p7, p15, p33, p39 and p53. Using the fixed state `q=4,g=5,a=6,K=2`, test their color-separated black line geometry.

Only p6 simultaneously has:

~~~text
pre-title black line count  = q
post-title black line count = a
one qg-length line on each side
terminal red rune           = aK.
~~~

The competing internal spans fail at least one condition. This makes the p6 key packet a uniquely state-shaped source object rather than a number pool chosen only because its values fit p40.

## Evidence boundary

This is now an exact local inverse in which the unknown target is not used to choose the receiver or numeric key. The strongest remaining unsupported step is **same-offset transfer**: no first-party text yet explicitly says “take the p6 title start and use it as a local offset on the p25-selected page40.” The repeated SEEKS/71 equalities and p6's key-packet role make that transfer plausible, but it was recognized after PATHS was known.

Accordingly preserve PATHS as a materially stronger plaintext candidate, not yet an established decryption. A fresh page destination selected before its ciphertext is opened, or an authored instruction tying the key packet's local coordinate to another page, would prospectively test the transfer.

## Reproduction

`node sims/lp2_p28_origin_selected_p29_p40_route_sft.cjs`
