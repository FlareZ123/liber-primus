# ROAD key LEAD closes on the independently selected ROAD endpoint

**Agent5, 19 November 2026. Classification: bounded post-discovery self-consistency closure on the p0 THE ROAD candidate. The ROAD additive shifts spell LEAD under ordinary A1Z26, and LEAD reproduces the exact authenticated SEEKS direction number that originally selected ROAD's endpoint. This strengthens the local candidate without supplying a general LP2 key schedule.**

## Frozen upstream facts

The authenticated 2016 sentence and the established GP0 to p50 pointer grammar selected the p0 THE ROAD receiver before LEAD was noticed:

`GP0(SEEKS)=71 -> p50[71] base60=108`

`GP0(THE)=20 -> p50[20] base60=102`.

Those two fixed endpoints enclose p0 words at offsets103..104 and105..108, whose unique signed-source length match is THE ROAD.

At the ROAD receiver, original ciphertext and candidate plaintext are:

`cipher = [16,8,25,27]`

`ROAD   = [4,3,24,23]`.

The required additive shifts are therefore:

`[12,5,1,4]`.

Under ordinary one-based alphabet numbers these spell **LEAD**.

Agent4 already recorded the exact arithmetic and the DH factorization

`[12,5,1,4] = [a*K, g, K*b, b*A] mod29`.

The present test asks a narrower question that was not previously familywise charged: does the key word feed back into the same frozen direction grammar and recover its own receiver boundary?

## Exact closure

Canonical GP spelling of LEAD is `[L,EA,D]=[20,28,23]`, so:

`GP0(LEAD)=71`.

Authenticated **SEEKS** has the same canonical number:

`GP0(SEEKS)=71`.

Therefore the new key word can replace SEEKS in the already frozen pointer step without changing any arithmetic:

`LEAD -> 71 -> p50[71] base60=108`.

Offset108 is exactly the final rune of the ROAD receiver.

The resulting loop is:

`SEEKS / THE -> 108 / 102 -> THE ROAD`

`ROAD -> additive shifts 12,5,1,4 -> LEAD`

`LEAD -> 71 -> 108 -> end(ROAD)`.

This is a same-output-type closure. It does not reinterpret108 as a page, state value or new cipher parameter.

## Finite authenticated-source and numbering control

Freeze the fixed p0 ROAD ciphertext and every distinct authenticated 2016 word whose canonical GP length is four. There are eight:

`LIES, THEIR, ROAD, SEEK, WILL, GOOD, LUCK, PATHS`.

For each target, compute the four additive residues `cipher-target mod29`. Charge the four simple alphabet-number conventions already tested by Agent4:

- A1Z26;
- A0Z25;
- reversed Z1A26;
- reversed Z0A25.

This gives **32 fixed target/convention combinations**. A combination qualifies for the endpoint test when all four residues can be rendered under its convention, the resulting four letters can be parsed canonically in GP, and their GP0 sum addresses a valid p50 cell.

Only one of the 32 combinations satisfies either of the equivalent frozen endpoint conditions:

`GP0(key string)=71`

or

`p50[GP0(key string)] base60=108`.

It is:

`ROAD + A1Z26 -> LEAD -> GP0 71 -> 108`.

No other authenticated four-rune target under the three rival numbering orientations returns the selected ROAD endpoint.

This control does not establish an authorship probability. The A1Z26 reading of the key was recognized after ROAD was proposed. Its value is that the already noticed semantic key word survives the complete nearby source-target/convention family and lands on an endpoint that was independently fixed by authenticated SEEKS before the key word existed.

## Interpretation

The closure makes the 2016 wording unusually literal at the selected receiver. **SEEKS** supplies the numerical direction to the end of ROAD; the numbers required to decrypt candidate **ROAD** spell **LEAD**; LEAD is numerically identical to SEEKS under the same GP0 pointer grammar.

This is consistent with the authenticated sentence that the words are the map, their meaning is the road, and their numbers are the direction. The current evidence still lacks an instruction that says to interpret arbitrary additive residues as A1Z26, and repeating LEAD beyond ROAD already fails. Treat LEAD as a local self-check and possible state-transition label rather than a repeating key.

## Next decision

The useful unresolved question is now more specific. Find a source-visible rule that produces the ROAD shift vector `[12,5,1,4]` from the already selected DH ray `[a,g,K,b]=[6,5,2,15]`. A valid rule should explain the local LEAD label prospectively and make a second adjacent prediction without changing output type.

Do not search arbitrary A1Z26 keys or promote LEAD into a repeating Vigenere stream.

Reproducer: `sims/lp2_p0_road_lead_endpoint_closure_sft.cjs`.
