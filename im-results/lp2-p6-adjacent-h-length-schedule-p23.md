# P6 adjacent-H word-length schedule predicts the p23 red rubric

## Classification

**Source-constrained navigation and exact operation-receiver selection; no new unknown plaintext.**

The original p6 red four-word rubric has printed lengths `[4,1,4,2]`. Applying the already recurring forward adjacent transform

`H(x,y)=[x-y,x+y] mod29`

to its two adjacent word pairs gives

`[3,5,2,6]=[e,g,K,a]`.

Those labels are independently fixed by the authenticated DH23 state and p7 literal: `e=3, g=5, K=2, a=6`.

The original p23 red four-word rubric then has raw printed lengths

`[2,6,3,5]=[K,a,e,g]`,

which is exactly a swap of the two H-output pairs:

`pairSwap(H([4,1],[4,2])) = [[K,a],[e,g]] = [2,6,3,5]`.

No rune values, language model, expected plaintext or p50 coordinates enter this bridge.

## Exact source facts

Correct physical-page parsing handles the rune-free p50 omission in `resources/lp2-transcription.txt` and asserts every page count against `lp2-corpus.json`.

Across all p0–p57 red spans, p6 and p23 are the only spans containing exactly four complete printed words.

For p6:
- source lengths: `[4,1,4,2]`
- adjacent H: `[3,5,2,6]`
- authenticated state reading: `[e,g,K,a]`

For p23:
- source lengths: `[2,6,3,5]`
- state reading: `[K,a,e,g]`
- this is the two-pair swap of the p6 H result.

This is distinct from the outside-pair H4 reading of the same p6 lengths recorded elsewhere. Here the operation is strictly adjacent-pair H, the same orientation already used in p23 serializer work.

## Finite convention charge

After adjacent H produces two ordered pairs, allow the complete small family consisting of:
- keep or swap the two pairs;
- independently keep or reverse each pair.

That is `2×2×2 = 8` output conventions. Exactly one gives the p23 vector: swap the pairs and preserve both within-pair orientations.

## Manuscript-wide controls

There are **2,802** page-local consecutive four-word windows across physical p0–p57.

- Exact adjacent-H length output `[3,5,2,6]` occurs **once**, at p6 offset71.
- Even granting all eight pair-order/orientation variants of that state schedule, only p6 produces any member of the family as an H-length output.
- Exact raw length vector `[2,6,3,5]` occurs **once**, at p23 offset0.
- Ten raw four-word windows use some member of the broader eight-vector pair family, so the important claim is the exact p6-H → p23-raw relation, not that the multiset `{2,3,5,6}` never appears elsewhere.

These are exact corpus counts rather than discovery probabilities.

## Source-only p6 → p23 page handoff from the product channel

The same four p6 red words also provide a second, independently motivated
measurement. Their GP29 whole-word products are

`[13,19,14,23]`.

Applying the same forward adjacent H gives

`[23,3,20,8]=[p,e,4g,A]`.

Treat the four literal outputs only as candidate physical page numbers, without
using body plaintext. They name p23, p3, p20 and p8. Among those four pages:

- p23 has an exact four-word red span, lengths `[2,6,3,5]`;
- p3's red heading has three complete words (plus a separate one-rune red span);
- p8's red heading has two complete words;
- p20 has no red span.

Thus **p23 is the sole same-arity red-rubric recipient among all four literal
H(product) page candidates**. On opening it, its raw lengths are exactly the
already-frozen pair-swap of the p6 H(length) schedule:

`[2,6,3,5]=[K,a,e,g]`.

This supplies a compact player-facing handoff:

```text
p6 red word lengths  --adjacent H--> [e,g,K,a]
p6 red word products --adjacent H--> [23,e,4g,A]
first literal page candidate = p23
p23 red rubric                         [K,a,e,g]
```

The first-coordinate choice is still retrospective; the finite four-coordinate
page charge and the p23 arity/state replay are what make it discriminating.
This is a **navigation/state-confirmation result**, not a body cipher.

The existing independently frozen p23 red-span serializer can then turn that
same p23 rubric into `THE ONE RISE`; this report does not re-derive or reinterpret
that downstream instruction.

## Fixed state-algebra cascade from p6 lengths to THE ONE RISE

P6's raw red lengths are themselves a compact state expression:

`[4,1,4,2]=[q,q-e,q,K]`.

Forward adjacent H maps this to `[e,g,K,a]=[3,5,2,6]`; p23 physically
pair-swaps it to `[K,a,e,g]=[2,6,3,5]`. Both p23 printed pairs sum to
`A=8`, and forward H gives `[-q,A,-K,A]=[25,8,27,8]`.

Therefore the already-frozen p23 cardinal stream is exactly the state stream

`[K,a,-q,A, e,g,-K,A]`,

which the solved-p56 prime-cardinal map renders **THE ONE RISE**. The page
step closes internally too: `g-e=5-3=2=K`, so one RISE from p23 is also
literally `p23+K=p25`.

This makes p6→p23→p25 one fixed state/H/cardinal grammar rather than three
unrelated numerical readings.

Reproducer: `sims/lp2_p6_p23_state_cardinal_cascade_sft.cjs`.

## Held-out p25 receiver selected by p23 schedule endpoints

The p23 state replay does more than confirm the p6→p23 page handoff. Its raw
red lengths are

`[K,a,e,g]=[2,6,3,5]`.

The same already-frozen p23 serializer reads the second pair `[e,g]=[3,5]`
as `RISE`, with the established literal displacement `g-e=+2`. Thus one
RISE selects physical p25 independently of any p25 body value.

Before looking at a p25 receiver output, the p23 rubric also supplies a natural
two-value receiver signature: its **outer printed lengths** are

`[K,g]=[2,5]`.

Because H is invertible, this is an executable receiver construction. With
`2^-1=15 mod29`,

```text
H^-1(K,g)
= [15(K+g),15(g-K)]
= [18,16]
= [p-g,A*K].
```

The pre-existing p25 cube-side family contains 627 eligible five-rune
predecessor/successor side objects. Exactly one object has those ordered
outer endpoints / forward H output:

```text
p25 word30 predecessor
source = [18,3,20,10,11,16]
H(18,16) = [2,5] = [K,g].
```

The unique match also fixes predecessor-side orientation, while `g=5`
fixes the five-rune word length and later cut.

This fact existed before the present p6→p23 schedule discovery, but the new
route changes its causal role. The p25 page no longer needs the disputed
`GOOD LUCK -> GP0 66 -> p50[66] -> 25` grammar in order to reach and type
this receiver:

```text
p6 H(product) / H(length) -> p23 + [K,a,e,g]
p23 THE ONE RISE          -> p25
p23 outer lengths [K,g]   -> unique p25 side object
g=5                       -> fixed cut5
```

Applying the pre-existing cube-side operation to that selected object gives
`[3,10,16,3,8,20]`; cut5 yields sums `[40,20]`, which are authenticated
signed-2016 indices `PATHS / MEANING`. This is still a reconstruction of a
known structural route rather than a blind plaintext discovery, but it
eliminates one previously conditional page-selection premise and selects the
exact p25 receiver before its output is interpreted.

A fixed outside-in H check on the selected cube output gives
`[12,23,2,18,13,19]=[K*a,p,K,p-g,b-K,B]`. Its final pair
`[b-K,B]=[13,19]` exactly repeats the first two p6 red-word products.
Across all 627 cube-side objects the full six-value H vector occurs once at
p25; the final pair alone occurs twice (p25 and p37), so only the full packet
is singleton supporting closure.

As a transfer control, the other recurring RISE pair `[e,g]=[3,5]` has
zero hits in the same 627-object outer-H family. Do not generalize this
endpoint selector to p33/p40 RISE packets.

Combined reproducer:
`sims/lp2_p6_p23_p25_endpoint_receiver_sft.cjs`.

### Rejected secondary discriminator

Applying the p23 all-forward length+H cardinal serializer directly to p6 gives
GP0 sum 43, which addresses the already notable p50 cell43. That is not unique
enough to support the handoff: the p0 all-forward red-span serializer also sums
to 43, and several inverse-polarity red variants produce comparable DH-state
p50 closures. Keep 43 only as a secondary cross-check, not as selection
evidence.

Reproducer for the page handoff:
`sims/lp2_p6_product_h_page23_handoff_sft.cjs`.

## Frozen literal consumer: p23 red state schedule does not decode its own body

The bridge creates one immediate low-flexibility operational test. The p23
red rubric itself fixes the four-lane state schedule
`[K,a,e,g]=[2,6,3,5]`, and its following black body supplies a natural
197-rune receiver at local offset16. Transfer the authentic solved-p56
additive inverse with strict transparent-plaintext-F / held key clock, with
no phase, sign or reset search.

The inverse is impossible at the **second black rune**. Body offset0 consumes
lane `K=2`; at body offset1 / page-local offset17, ciphertext
`G=index6` meets lane `a=6`, which would force plaintext F on a consuming
step. Under the p56 rule plaintext F must instead be a literal transparent
ciphertext F and hold the key clock. There is therefore **0 complete legal
inverse path**, before language scoring or any later F ambiguity appears.

This retires exactly the literal composition

```text
p6 adjacent-H lengths -> p23 [K,a,e,g] red schedule
-> following p23 black body -> solved-p56 additive/F-hold inverse.
```

The structural p6→p23 prediction remains intact; a different authored
receiver/opcode is still required.

Reproducer: `sims/lp2_p23_red_state_body_p56_fhold_gate_sft.cjs`.

## Why this advances the solve path

The p6 page now supplies a literal source-only operator schedule:
`word lengths → adjacent H → [e,g,K,a]`.
A separate marked rubric at p23 physically instantiates those four outputs in a fixed pair-swapped order before any ciphertext decoding is attempted.

That is the kind of held-out structural consequence requested by the p6 schedule line of research: the p6 layout predicts another original manuscript object rather than merely fitting a plaintext label.

The route now fixes a page handoff, a state/cardinal instruction, and one exact p25 operation receiver. It still does not establish a general LP2 body cipher or recover fresh unknown plaintext. A successor should keep the entire p6→p23→p25 grammar fixed and demand a prospective reversible plaintext consequence rather than another state echo.

Reproducer: `node sims/lp2_p6_adjacent_h_length_schedule_p23_sft.cjs`.
