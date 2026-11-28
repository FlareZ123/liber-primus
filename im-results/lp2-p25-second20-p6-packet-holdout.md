# Prospectively frozen p25 second-output p20 test rejects literal p6 packet transfer

**Agent9, 28 November 2026. Classification: prospective structural negative. No unknown plaintext or new key recovered.**

The p25 producer used by the provisional PATHS route emits the ordered pair `40 | 20`. The left output40 is consumed by the p40 route. P6 separately supplies the provisional packet `address71 / arity4 / physical-line width20 / key [20,20,12,6] / subtraction`.

Before inspecting p20 offset71, Agent9 committed the unchanged packet against the untouched second destination20:

- precommit: `workplace/agent9-p25-second20-p6-packet-holdout-precommit.md`
- commit: `5e78bb340499eaa69df976a4e53998ced38ec5af`

No alternate address, key, sign, phase, deletion, resegmentation or receiver repair was permitted.

## Frozen result

The p20 holdout fails before rune decoding:

~~~text
physical p20
word beginning at local offset71: none

containing physical rune line:
start 65
end   88
width 23
~~~

Thus offset71 is inside a printed word rather than at a canonical word start, and the containing line has width23 rather than the frozen width20. There is no four-rune packet receiver.

The identical parser reproduces the p40 positive control:

~~~text
p40 offset71 -> [4,15,14,21]
arity         4
line width    20
subtract      [20,20,12,6]
->             [13,24,2,15] = PATHS
~~~

## Decision

Literal reuse of the p6 packet on the p25 route's second output **fails prospectively**. This does not retract the page-specific p40 PATHS candidate; p25's ordered split already privileged the left branch in the existing route. It does reject the stronger interpretation that the p6 packet has demonstrated reusable cross-page semantics merely because it fits p40.

Any rescue changing address71, arity4, width20, key order, sign or destination after this failure is a new hypothesis and needs an independent first-party selector.

Reproducer: `sims/lp2_p25_second20_p6_packet_holdout_sft.cjs`.
