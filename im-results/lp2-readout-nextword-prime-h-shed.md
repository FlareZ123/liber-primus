# Split READ OUT receiver's immediate word yields SHED under frozen prime-H

**Agent2, 19 November 2026. Classification: cross-object transfer with matched-family discrimination. The prime-weight H operation was fixed on the independently selected EA109 two-rune receiver, then applied unchanged to the immediate complete word after the split READ OUT receiver. It yields GP0(SHED)=64. Across all 23 complete-word-bounded 23-rune center-F spans, this is the sole SHED hit under the same next-word consumer. The result is not chronologically blind to p0 word22's already published ciphertext, so it should be treated as a strong transfer/receiver discriminator rather than independent plaintext recovery.**

## Frozen split receiver

The existing READ / OUT navigation fixes:

`GP0(READ)=55 -> p50[55] base60 = 80`

`GP0(OUT)=20 -> p50[20] base60 = 102`.

This selects p0 offsets **80..102**, exactly words18..21, 23 runes with center F at offset91.

The immediate following complete word is p0 word22 at offsets103..104:

`[8,12]`.

No candidate plaintext is used in the operation below.

## Transfer the fixed prime-H consumer

Agent4's EA109 prospective holdout fixed the operation:

1. replace each GP rune index by its canonical GP-prime weight;
2. compute the raw two-input H difference and sum.

For p0 word22:

`[8,12] -> [prime(8),prime(12)] = [23,41]`.

Raw H:

`H(23,41) = (-18,64)`.

The sum component is exactly:

`64 = GP0(SHED)`.

This is a source word already independently established as an executable instruction in solved p57.

The operation is transferred unchanged. Its use here was motivated by the two-rune receiver type, not by fitting an additive key to THE.

## Split versus whole READOUT sibling

Director #1706 independently selected the whole READOUT sibling p0 receiver **166..188**, also a complete-word-bounded 23-rune center-F span.

Its immediate following complete word is p0 word43, which has **three runes**.

The prime-H consumer is a two-input operation fixed on two-rune words, so the whole READOUT sibling fails the consumer type without any arithmetic.

Thus the downstream grammar discriminates:

- split **READ OUT** -> next word is two runes -> prime-H -> SHED64;
- whole **READOUT** -> next word is three runes -> fixed consumer does not type-check.

This is useful evidence for the spacing/instruction interpretation even though the p0 bytes were already known before this transfer was proposed.

## Matched center-F family census

Exhaust every complete-word-bounded 23-rune span on the 55 rune-bearing unknown pages.

There are:

- **614** complete-word 23-rune spans;
- **23** whose exact center rune is F;
- **22** of those with a following complete word;
- **5** whose following word has exactly two runes and therefore accepts the fixed prime-H consumer.

For those five, compute the GP-prime difference magnitude and sum and ask whether either equals `GP0(SHED)=64`.

There is exactly **one** hit:

`p0 80..102 -> next word22 [8,12] -> primes[23,41] -> sum64`.

The whole READOUT sibling is outside the arithmetic family because its following word has length3.

This matched family is source-defined by the same 23-rune center-F geometry that selected the two p0 READOUT receivers; no English scoring or plaintext candidate is used in the census.

## Frozen post-SHED state

The solved p57 route independently establishes that **MUST SHED** changes the global p50 numeral alphabet from conventional base60 to the uniquely valid order-preserving drop-`f` base59 alphabet. That state is already familywise audited and must be carried globally rather than reselected per edge.

Under that frozen post-SHED state:

`SHED64 -> p50[64]=22 -> base59 120 = GP0(PARABLE)`.

The pre-switch base60 control gives122.

Continue without changing radix:

`PARABLE120 -> p50[120]=0g -> base59 41`.

Then:

`p50[41]=1O -> base59 83 = GP0(EMERGE)`.

So the transferred instruction has an existing executable continuation:

`READ OUT -> immediate word -> prime-H -> SHED -> PARABLE -> 41 -> EMERGE`.

This continuation is inherited from the independently audited solved-route numeral state. It does not authenticate p0 plaintext by itself.

## Relation to the local THE candidate

The same p0 word22 is the conditional THE receiver in the DH-packet work. The prime-H result does not depend on that candidate plaintext or its retrospective additive key.

Accordingly, preserve two separate statements:

- value-changing inverse `[8,12]-[a,p]=THE` remains conditional on the packet-selector mechanism;
- original ciphertext `[8,12]` independently supports **SHED64** through the fixed prime-H transfer and matched-family census.

The SHED result is therefore a cleaner source-facing instruction consequence than using THE as a premise.

## Decision

Preserve this exact candidate execution path:

`READ OUT -> p0 80..102 -> immediate p0 word22 -> GP-prime H sum64 -> SHED`.

Then carry the already selected global state:

`SHED64 -> base59 PARABLE120 -> 41 -> EMERGE83`.

The strongest remaining caveat is discovery chronology: word22's bytes had already been inspected in the THE work before prime-H was transferred from EA109. The matched-family uniqueness substantially constrains the coincidence, but a truly blind external consequence from SHED/EMERGE would provide stronger evidence.

Do not tune the H component, prime map, word length, or radix after this result. A successor should consume SHED or EMERGE under an already frozen rule and predict untouched source data.

## Reproduction

Run:

`node sims/lp2_readout_nextword_prime_h_shed_sft.cjs`.

The SFT derives both split and whole READOUT p0 receivers, verifies the immediate-word type distinction, applies canonical GP-prime H, exhausts all 23 matched center-F spans, and checks the already frozen base59 SHED continuation.
