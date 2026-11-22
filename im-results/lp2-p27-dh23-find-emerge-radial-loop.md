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

## EMERGE300 closes through the base59 pointer root (Agent9 extension)

A further source-exact closure uses the already selected terminal word **EMERGE**, whose GP-prime sum is **300**, and the literal size of the p50 table, **256 cells**. Interpreting the word sum as a table address modulo the visible table size gives **300 mod256 = 44**. Under the same base59 pointer reading already used upstream, original cell44 enters the exact path:

`44 -> 226 -> 72 -> 161 -> 214 -> 247 -> 189`.

This reaches the existing DH root cell189 in exactly **6 edges**, matching the independently recovered signed server secret **6**. More specifically, the EMERGE branch first joins the established MUST186 pointer path after exactly **2 edges**, matching the signed shared value **2**, and the merge node is **72**, exactly the GP-prime sum of p57 **THE**. From that point both paths share the same tail `72 -> 161 -> 214 -> 247 -> 189`. Root189 is again zero-based table coordinate **(23,5)**, the signed DH modulus and generator.

The fixed original graph keeps the observation in perspective. Exactly **11/256 = 4.296875%** source addresses are six edges from root189. Among the 20 printed p57 words, however, EMERGE is the only word whose prime-sum residue selects one of those depth-six addresses. Stronger, **EMERGE is the only one of all 20 printed p57 words whose own rune length equals the pointer depth selected by its prime-sum residue**: six runes and six edges. Conventional base60 does not reproduce the closure: from address44 it enters an 11-cycle and never reaches root189. The modulo256 address reduction is a new, table-sized operation rather than an authenticated first-party opcode, so this strengthens the existing navigation interpretation but does **not** authenticate a cipher receiver, unknown plaintext, or an exit from the loop.

Reproduce with [the source-exact SFT](../sims/lp2_p27_dh23_emerge_pointer_closure_sft.cjs); Windows Node22 run [44415537918](https://github.com/FlareZ123/liber-primus/actions/runs/44416324199) passes.

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

## Source-selection gate #1950 (Agent1, 20 November 2026)

This audit is confined to the p27/p50/p57 route. It does not use p0 or p28 candidate outputs as selectors or holdouts.

### Frozen selection family

The canonical p57 parser supplies 20 printed words. For every word, the audit tests GP0 and GP-prime sums, direct addressing when the sum is below256, and reduction modulo the literal 256-cell table. This yields **74 candidate start configurations**.

The signed DH tuple is p=23, g=5, serverPublic=8, clientPublic=19, shared=2. With p50's eight columns, valid coordinate alternatives are zero-based (p,g)=189, zero-based (p,shared)=186, and one-based alternatives (p,g)=180, (p,serverPublic)=183, (p,shared)=177. clientPublic=19 cannot be a column in an eight-column table; zero-based serverPublic=8 is also out of range. Both base60/base59 readings and both word-to-root/root-to-word orientations of the same forward map were charged: **1,480 configurations**.

There are three raw depth/length hits, but only two distinct paths because WITHIN's direct and modulo256 addresses are both115:

- **EMERGE**: GP-prime300, modulo256 start44, forward base59 to root189 in six edges. Six is the p27-derived server secret, not a signed public DH field.
- **WITHIN**: from shared coordinate186, forward base60 reaches GP-prime address115 in five edges, matching public generator5. This is a genuine competing path, but it uses the pre-SHED radix after the p57 text has already said WE MUST SHED; under the post-SHED base59 state, 186 does not reach115.

The only candidate that joins the fixed MUST186 path at a DH-derived depth, continues to root189 at a DH-derived total depth, has its own rune length equal to that total, and merges on a p57 word-sum node is EMERGE: it enters after **2** edges at **72=GP-prime(THE)** and shares the remaining four edges to root189. The entry depth matches signed shared2; total depth6 matches the independently manuscript-derived p27 server secret.

### SURFACE internal holdout and exact-multiset controls

The p57 word **SURFACE** (word8) has GP0 address67, and original p50[67]=3C, the same token as root cell189. The four original 3C copies are at 67,162,189,247. EMERGE's seven-cell path visits columns [4,2,0,1,6,7,5], leaving column3; SURFACE67 occupies that missing column. Scanning all20 p57 GP0 target words finds SURFACE as the sole word whose address contains the root token. Across all74 candidate starts, the frozen fixed-point/seven-distinct-column/duplicate-in-missing-column rule has exactly one original completion: **EMERGE → 189/3C → 67/SURFACE**.

Two conditional randomization controls preserve the exact 256-token multiset. Both freeze the eight MUST-path edges, the root fixed point, and the upstream p27 selector cell254=39; all remaining246 tokens are shuffled with fixed seeds.

- **Depth/merge family:** across all74 candidate starts, all possible first merge positions on MUST, the extended DH-derived depth set, and all p57 word-sum merge labels, **2,355/50,000 = 4.710%** shuffles produce at least one depth/merge/word-length match (Wilson95% interval **4.528–4.899%**). The depth/merge coincidence alone is therefore supportive but not rare under this conditional family.
- **Full fixed-point/column completion:** across all74 starts, all20 p57 GP0 target words, and all eight possible missing columns, **211/100,000 = 0.211%** shuffles produce at least one completion (Wilson95% interval **0.184–0.241%**). Of these,203 end at189 and21 leave column3. This is a substantially stronger internal p57 holdout than the six-edge match alone.

These are conditional familywise diagnostics given the already selected p27 route, not global probabilities of intentional design. SURFACE is a distinct p57 internal target and survives the all-word family scan; it is not an unknown-page plaintext holdout and the route was not prospectively blinded to the solved p57 text.

### Source-selection decision

The source clues make the navigation hypothesis plausible: p57 says circumferences and EMERGE; the authenticated 2016 message says words are a map and their numbers are direction; the p50 object is a literal 256-cell table; and the p27/DH route supplies a source-selected start, root, and path. But none of these sources uniquely specifies **300 mod256**, the cell-value-as-next-address operation, or stopping at the first fixed point. The 2016 message motivates word-number navigation but does not state a wrap rule and postdates the 2014 release. The signed 2013 TCP/DH source supplies the DH tuple and a NEXT command, but NEXT stores client-supplied text; it does not define a table-pointer walk. The contemporaneous 2014 participant record establishes conventional base60 table decoding/byte serialization, not a base59 cyclic address space or fixed-point termination. See the [2016 signed clue](../resources/historical/cicada2016-4gq25.md), [2013 signed TCP/DH source](../resources/external/2013-tcp-server-signed-source.md), and [2014 author-era alphabet audit](lp2-p50-author-era-alphabet-source-audit.md).

**Decision:** completion criterion (a) is not met. Criterion (b) is met as a precise partial negative: the EMERGE→SURFACE structure is reproducible and has a meaningful p57-internal holdout, but the modulo256 wrap and pointer/termination rule still lack a source-authenticated selector. Retain it as constrained navigation evidence, not an authenticated address codec, key, cipher, or unknown plaintext. Do not continue word-depth/modulo mining unless a new first-party clue selects the wrap/receiver operation.

Reproduce with [the extended source-exact SFT](../sims/lp2_p27_dh23_emerge_pointer_closure_sft.cjs). The script uses fixed PRNG seeds 0x19502026 and 0x1950F00D; its randomization tests are conditional on the frozen p27 path and cell254.

## Consequence

The p27/DH/circumference chain remains a strong **navigation** hypothesis, and the SURFACE duplicate is a genuine internal p57 cross-check. The new familywise audit narrows the claim: the depth/merge match alone occurs in 4.71% of conditional token shuffles, while the full fixed-point/column completion occurs in 0.211%. Neither statistic authenticates the modulo256 operation. The missing ingredient is not another numerical coincidence; it is an original clue or historically grounded convention that selects the cyclic wrap, pointer direction, and fixed-point receiver rule before looking at the output. No unknown LP2 plaintext is recovered.

