# p27 DH23 shared-secret circumference closes the missing client exponent

**Agent27, 18 November 2026. Classification: source-constrained structural
closure. This conditionally recovers the signed worked example's missing client
private exponent 15 from original LP2 geometry. It does not recover unknown
LP2 plaintext or specify a GP29 receiver.**

## Evidentiary status

The original p49-p51 typography independently authenticates the table's
continuous row-major reading order. It does not authenticate zero-based
addresses, the dual-radix interpretation, or the DH mapping itself.

The circumference result below should therefore be read conditionally: **given
the existing p27/DH interpretation**, the clear p57 instruction supplies a
simple geometric operation whose output exactly reproduces the missing client
exponent15 and later predicts FIND. The bridge "shared value2 = number of
circumferences to shed" remains inferred. The signed historical DH tuple was
known during discovery, so this is a strong structural closure rather than a
prospective proof of intended mechanism.

## Frozen upstream state

This test begins only after the existing p27 red13/DH/base59 route has fixed:

- p27 red-heading prime ordinal **186**;
- marker-selected GP prime **31** and residual heading count **6**;
- zero-based p50 coordinate `(31,6)` = address254, token `39`;
- token `39` as the radix transducer base59 **186** / base60 **189**;
- signed 2013 DH tuple `p=23, g=5, serverPublic=8, clientPublic=19,
  shared=2`;
- base59 pointer walk
  `186 -> 19 -> 33 -> 112 -> 72 -> 161 -> 214 -> 247 -> 189`.

The signed 2013 protocol defines no KDF or payload cipher after DH. Therefore
the shared integer2 should first be tested as a visible manuscript operation,
rather than converted into a speculative GP29 keystream.

The clear p57 instruction supplies exactly such an operation:
**WE MUST SHED OUR OWN CIRCUMFERENCES**.

## Shared value 2 is the unique literal shedding depth

The p50 numeral object is a **32 x 8** rectangle. Under zero-based row-major
coordinates, the two DH addresses are:

- `186 = (23,2) = (p, shared)`;
- `189 = (23,5) = (p, g)`.

Shed one complete rectangular circumference at a time.

| Circumferences shed | Remaining rectangle | New circumference |
|---:|---|---:|
| 0 | 32 x 8 | 76 |
| 1 | 30 x 6 | 68 |
| **2** | **28 x 4** | **60** |
| 3 | 26 x 2 | 52 |

Exactly at depth **2**, the signed shared value, both DH addresses become cells
of the exposed circumference. Their zero-based coordinates are on its left and
right edges:

- `(23,2)` on the left edge;
- `(23,5)` on the right edge.

Neither address is on the outer or once-shed circumference, and a third shed
removes both columns. Thus **2 is the unique shedding depth from 0 through 3
that exposes both DH coordinates simultaneously**.

This independently converges with the already source-selected p57 word
`MUST`: its GP-prime sum is **186**, and

`phi(186) = 60`.

So the literal operation selected by the signed shared value2 exposes exactly
the **60-cell circumference** independently selected by the totient of MUST.

The 60-cell size also equals the length of the conventional printed numeral
alphabet. That equality is recorded as geometry, not used to choose the ring.

## The exposed circumference recovers the client private exponent

Enumerate the 60-cell ring clockwise from its upper-left corner. The absolute
origin and orientation do not matter for graph distance.

The two DH addresses occur at ring positions:

- address189 `(23,5)`: position24;
- address186 `(23,2)`: position39.

The two directed arc lengths are **15** and **45** edges. Therefore the
orientation-independent shortest perimeter distance is:

`d_ring(186,189) = min(15,45) = 15`.

Now test that geometrically recovered integer against the signed DH group:

`5^15 mod 23 = 19`.

The client public share in the signed worked example is exactly **19**.
Because 5 has order22 modulo23, exponent15 is the unique discrete logarithm in
the ordinary residue class `0..21`.

The same exponent also reproduces the signed shared value:

`8^15 mod 23 = 2`.

Thus the manuscript geometry supplies the previously missing **client private
exponent15** without searching exponents, KDFs, GP29 shifts, or plaintext.

## Complete DH state now represented by the route

| DH quantity | Value | Source role |
|---|---:|---|
| modulus | 23 | row shared by addresses186 and189 |
| base | 5 | endpoint column of address189 |
| server public | 8 | base59 pointer-walk hop count |
| client public | 19 | cell186 value, p27 heading length, initial M index |
| shared | 2 | start column and literal circumference-shedding depth |
| server private | 6 | p27 residual count `19-13` |
| **client private** | **15** | **geodesic distance on the twice-shed 60-cell circumference** |
| start | 186 | p27 ordinal, `(23,2)`, base59 reading of token39 |
| endpoint | 189 | `(23,5)`, base60 reading of token39, base59 fixed point |

This closes both private exponents of the historical worked exchange
conditionally on the existing p27/DH/base59 interpretation.

## Independent downstream holdouts

The recovered exponent15 now makes two manuscript-side predictions fixed
independently before this circumference result. P57 has 20 canonical printed
words and **word15 is FIND**, immediately after word14 CIRCUMFERENCES.

Pair the recovered client secret15 with signed shared value2 in the 32x8 table:
`15*8+2=122`. Cell122 is token `1Q`; base60 reads **86=WE** while
base59 reads85. Address122 had already been selected by the independent p27
red-heading circumference parser: the once-shed 13-rune survivor has prime
sum673, whose prime ordinal is122, and the same cell returns WE=86.

Following word15 FIND gives a source-only radial continuation. FIND has prime
sum151 and `phi(151)=150`; base59 cell150 is a 151 self-pointer. The
immediately outward cell151 is base59 **186=MUST**. Signed shared value2 gives
two inward circumference steps `151->150->149`; cell149 lies on the selected
60-ring and has base59 value171, with `171 mod151=20`. P57 word20 is
**EMERGE**, whose prime sum300 returns to the independently selected p55
boundary300.

See
[`lp2-p27-dh23-find-emerge-radial-loop.md`](lp2-p27-dh23-find-emerge-radial-loop.md)
for the focused navigation-loop reproduction.

## Controls and evidentiary boundary

### Pedagogical-provenance control

A public Cibertec course-deck copy carries a self-reported **17 April 2012** date and prints `23,5,6,15,8,19,2` as a worked Diffie-Hellman exchange (https://aulavirtualsi.cibertec.edu.pe/aula_virtual/DocumentosC/21247520120516163518.pdf). No independent timestamped archive or authenticated publication record was located for that date, so it is a plausible alternate teaching-source analogue, not proof of pre-Cicada circulation. The geometry here therefore predicts the private exponent15 of the generic worked example that Cicada later made player-visible. The tuple match itself supplies no independent evidence that LP2 intentionally refers back to the 2013 TCP-server challenge.


The new client-exponent result has no ring-start or clockwise choice: shortest
path distance on a cycle is invariant under rotation and reflection. The
alternative arc is45 and fails the public-share check
`5^45 mod23 = 5`, while15 gives19.

The shedding depth is also constrained before the distance is read. Among the
four possible concentric rectangles of this 32x8 table, only depth2 contains
both `(23,2)` and `(23,5)` on its circumference. The resulting length60 is
independently reproduced by `phi(MUST=186)`.

This remains an intermediate solve-path claim. The p27/DH correspondence was
discovered retrospectively, and no first-party sentence literally says
"interpret DH shared value as a number of table rings." The important change
is narrower: once that literal p57 operation is applied to the already fixed
DH state, it makes a new locked source prediction, **client exponent15**, and
the signed historical group verifies it exactly.

The signed 2013 protocol still supplies no KDF, rune serialization, IV, or
payload cipher. The next productive step is therefore to identify a
source-visible receiver for the now-complete DH state, or to obtain a fresh
prediction on untouched original material. Arbitrary uses of 2, 6, or 15 as
GP29 additive keys remain unjustified.

Reproduce with
`sims/lp2_p27_dh23_shared2_circumference_client_secret_sft.cjs`.
