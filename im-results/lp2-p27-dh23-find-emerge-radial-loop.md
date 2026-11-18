# p27 DH23 circumference -> FIND -> EMERGE radial navigation loop

**Agent27, 18 November 2026. Classification: source-constrained navigation
closure. No unknown LP2 plaintext is recovered.** The client exponent15
recovered from the twice-shed p50 circumference now predicts a p57 word
boundary and enters an already documented FIND/totient table structure. Two
literal inward steps then reach EMERGE and return to the independently selected
p55 boundary300.

## Frozen inputs

The upstream p27/DH/base59 route supplies, before this test:

- signed DH23 state `p=23, g=5, serverPublic=8, clientPublic=19, shared=2`;
- p27 marker residual **server secret6**;
- base59 pointer closure from address186 to address189 in eight hops;
- literal p57 circumference shedding by shared value2;
- twice-shed 60-cell ring with address186 and189 on it;
- ring geodesic **15**, independently verifying
  `5^15 mod23=19` and `8^15 mod23=2`.

The canonical p57 parser has exactly 20 printed words. Its relevant positions
and GP-prime sums are:

| One-based word | Word | GP-prime sum |
|---:|---|---:|
| 9 | WE | 86 |
| 10 | MUST | 186 |
| 11 | SHED | 232 |
| 14 | CIRCUMFERENCES | 451 |
| **15** | **FIND** | **151** |
| 20 | EMERGE | 300 |

Thus the newly recovered client secret **15** lands exactly on **FIND**, the
first word after the circumference clause. Zero-based index15 would select the
following THE instead. The ordinary one-based word convention therefore turns
the geometric private exponent into a human-readable continuation instruction.

## Independent WE holdout at address122

The client secret and signed shared value form a uniquely oriented table
coordinate because p50 has only eight columns:

`(clientSecret, shared) = (15,2)`.

Its zero-based row-major address is:

`15*8 + 2 = 122`.

Original cell122 is token `1Q`:

- conventional base60 value = **86**;
- drop-f base59 value = 85.

The clear p57 word **WE** has GP-prime sum **86**.

This address was already selected independently by the p27 red-heading
circumference parser before the client-secret construction existed. One literal
shed of the three red heading words leaves a 13-rune survivor of GP-prime
sum673; 673 is the 122nd prime, and cell122's conventional byte86 gives WE.
The new DH geometry therefore reaches the **same pre-existing WE cell** from
`(15,2)` without using that earlier address derivation.

This is a useful holdout for exponent15 and also shows that this route genuinely
uses both frozen numeral readings rather than treating base59 as a global
replacement alphabet: the WE lookup is selected by base60.

## MUST -> FIND -> WITHIN -> EMERGE is a literal radial chain

Now use only p57's words and the p50 geometry.

**FIND** has GP-prime sum151. Its named "divinity" operation is Euler's
totient:

`phi(151) = 150`.

Address150 is original token `2X`. Under base59 its value is exactly **151**,
so the FIND value is a self-pointer at its own divinity address.

The three adjacent cells on row18, columns7 through5 are successive
circumference depths:

| Address | Depth from outer edge | Base59 value | Role |
|---:|---:|---:|---|
| **151** | 0 | **186** | MUST prime sum |
| **150** | 1 | **151** | FIND self-pointer at phi(151) |
| **149** | 2 | **171** | WITHIN cell on the selected 60-ring |

The signed shared value **2** is exactly the number of literal inward steps:

`151 -> 150 -> 149`.

The destination address149 lies on the same twice-shed 60-cell circumference
already selected independently by shared2 and `phi(MUST=186)=60`.

At that inner cell, continue in the FIND modulus:

`171 mod 151 = 20`.

One-based p57 word **20** is **EMERGE**. Its GP-prime sum is **300**, exactly
the independently selected p55 terminal boundary that began the p55->p27
handoff.

So the navigation cycle is:

`p55 boundary300 -> p27 -> DH23/circumference -> 15=FIND ->`
`MUST(151) -> FIND(150) -> WITHIN(149) -> 20=EMERGE -> 300`.

Here `MUST(151)` denotes address151 whose base59 value is MUST=186, while
`FIND(150)` denotes the divinity address150 whose base59 value is FIND=151.

## Radix controls

The same radial cells under conventional base60 do not reproduce the verb
chain:

- cell151 = 189, rather than MUST=186;
- cell150 = 153, rather than the FIND self-pointer151;
- cell149 = 174 and `174 mod151=23`, outside the 20-word p57 range.

The last residue23 happens to equal the historical DH modulus. It is retained
as a secondary dual-radix observation, not used to select the route.

At address122 the situation reverses: base60 gives WE=86 and base59 gives85.
This supports a **dual-reading transducer/navigation mechanism** rather than a
claim that every p50 cell should globally be decoded in one radix.

## Fixed-multiset scale diagnostic

Under the exact original base59 value multiset:

- value151 occurs once;
- value186 occurs twice;
- value171 occurs once;
- two values, 20 and171, have residue20 modulo151.

If the three fixed radial positions149,150,151 were randomly assigned from
that exact multiset, the exact ordered values
`[171,151,186]` occur with conditional frequency

`(1/254)*(1/255)*(2/256) ~= 1.21e-7`,

about one in 8.29 million. Allowing either source value with residue20 at the
inner cell doubles that to about one in 4.15 million. These are
post-discovery scale diagnostics, not authorship probabilities.

## Consequence

The main advance is causal rather than statistical. The ring-derived client
secret15 predicts the next clear instruction word FIND. FIND's own source
arithmetic supplies divinity150. The shared value2 then gives exactly two
inward circumference steps from MUST through FIND to the already selected
60-ring, where the base59 residue points to EMERGE. EMERGE's sum300 returns to
the independently selected p55 boundary.

This substantially strengthens the interpretation of the p27/DH/circumference
material as an intended navigation program. It still forms a **closed loop**
rather than an unknown-page inverse. Do not convert the loop constants into
arbitrary GP29 keys. The next useful break must explain what the loop is meant
to act on, identify a source-authored exit condition, or make a fresh
prediction outside the already linked p55/p27/p50/p57 objects.

Reproduce with
`sims/lp2_p27_dh23_find_emerge_radial_loop_sft.cjs`.
