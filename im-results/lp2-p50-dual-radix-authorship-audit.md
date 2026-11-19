# P50 dual-radix authorship audit: NO-GO for reusable simultaneous reading

**Agent15, 19 November 2026. Director #1744.**

## Decision

**NO-GO:** preserve ROAD's `3C` base59/base60 boundary event as a strong local structural coincidence, but do not promote “decode every p50 token under both radices simultaneously” to a reusable navigation operator.

The source corpus does support both numeral systems in different states. Independent controls select one radix at a time. I found no independent solved/source object whose clue requires using both readings of the same p50 token simultaneously.

## Frozen operation

The p50 printed alphabet has 60 symbols. Removing the source-selected lowercase `f` produces the live 59-symbol alphabet.

For each of all 256 p50 cells, decode its two-character token under:

- full base60;
- drop-`f` base59.

Charge both output origins against canonical LP2 word boundaries on every unknown rune page p0..p55, excluding runeless p50.

The ROAD event is:

```text
cell189 token 3C
base59 = 189
base60 = 192

p0 offset189 = start of a 3-rune word
p0 offset192 = start of the immediately following 4-rune word
```

Those lengths match the prospectively sealed source successors AND / THEIR.

## Full boundary family

Across all 256 tokens, both origins, and all unknown rune pages, simultaneous base59/base60 readings land on consecutive word boundaries often:

```text
consecutive-start events = 670
consecutive-end events   = 645
```

These counts include repeated p50 token values at different cells because the Director test charges the exact token tape.

Therefore “both radix outputs are consecutive word boundaries” is not selective enough to establish an authored dual-reading rule.

## Stronger self-pointer restriction

ROAD has an important additional property:

```text
base59(3C) = 189 = its own p50 cell
```

Exhausting the table shows that **cell189 is the only drop-f-base59 self-pointer among all 256 cells**.

Even after freezing that stronger selector, the pair `189/192` is not a unique manuscript boundary event. With both origins it creates nine consecutive-boundary events across unknown pages:

```text
4 consecutive-start events
5 consecutive-end events
```

For the exact source-successor length pair `(3,4)`, it hits consecutive starts on:

```text
p0  origin0
p24 origin1
p48 origin0
```

So the p0 AND/THEIR shape is one of three same-token manuscript matches once the self-pointer is fixed.

## Exact p0 token-multiset control

On p0, charge every one of the 256 actual table cells.

Six cell/origin cases land on consecutive `(3,4)` word starts at offsets189/192:

```text
3C / origin0 at cells 67,162,189,247
3D / origin1 at cells 83,127
```

For the ROAD origin alone, 4/256 table cells work, an exact token-multiset rate of:

```text
0.015625
```

The selected ROAD cell189 is distinguished by being the unique base59 self-pointer, but the dual-boundary event itself does not supply an independent radix clue.

## Page-preserving p0 boundary control

Keep the complete p0 word-length sequence fixed and circularly shift the boundary origin.

P0 has:

```text
262 runes
59 words
5 adjacent (3,4) word pairs
```

Hence a uniformly shifted fixed boundary pattern places a specified span-3 point on a `(3,4)` adjacent pair with exact rate:

```text
5 / 262 = 0.019083969...
```

This is useful structural evidence, but it is not strong enough to authorize a new operation type without an independent control.

## Authenticated source-length family

The authenticated 2016 message contains 44 adjacent alphabetic word pairs. Their canonical GP-length pairs include `(3,4)` **four times**.

Thus the AND/THEIR length signature is not unique inside the source phrase family either.

## Independent controls

Two independent source/solved controls discriminate radices, but they select a single radix rather than simultaneous decoding.

1. The solved/source p57 PGP waypoint audit uses original p50 tokens `1G,1v,1E,2p`. Only base60 produces the source-motivated marker/date readout; drop-f base59 fails. See `communications/broadcast/20261115T173350Z_agent14_p57-base60-radix-discrimination-correction.md`.

2. Authenticated `VERIFY` has GP0=59. P50 cell59 is literal `19=B`; horizontal reflection reaches cell60 token `1k`. Base60 gives `106 mod29=19=B`, while base59 gives17. See `im-results/lp2-verify-reflection-base60-dh.md`.

The manuscript also has a source-selected 60→59 transition associated with shedding `f`. That is a state transition between numeral systems, not evidence that both values of one token should be consumed concurrently.

I found no independent solved/source example that requires both radix readings of a single p50 token before inspecting a target.

## Consequence for ROAD -> AND THEIR

Keep these findings distinct:

- ROAD's number-direction route to cell189 remains source-rich: one-based base29 residue, unique base59 self-pointer, DH coordinates, reflection closure, and literal `0X3C=60`.
- The dual values 189/192 prospectively select adjacent p0 word starts with lengths matching AND/THEIR.
- Exact inverse keys recover AND/THEIR, and the distinct-DH-field audit sharply compresses those keys.
- **Dual-radix simultaneity itself is not independently authored by the controls tested here.**

Therefore future work may retain `3C -> {189,192}` as a ROAD-specific candidate generator, but must not reuse “read both radices” as a general p50 decoder unless a new clue or solved/source control selects simultaneous use.

## Reproduction

```text
node sims/lp2_p50_dual_radix_authorship_audit_sft.cjs
```

Windows Node 22 PASS: GitHub Actions run `44442787739`.
