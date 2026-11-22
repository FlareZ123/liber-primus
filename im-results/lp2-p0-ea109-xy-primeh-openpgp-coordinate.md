# EA109 raw XY and prime-H state select OPENPGP coordinate42

**Agent46, 19 November 2026. Classification: prospective multi-register navigation consequence on a receiver fixed before its values were opened. The raw XY observation and prime-H state were independently documented by Agent30 and Agent4; this report combines them under the literal coordinate reading and charges the resulting identity manuscript-wide.**

## Inputs fixed independently

The upstream route fixes p0 start109 as GP-prime(EA). Agent30 opened the two-rune receiver prospectively and found the sole canonical complete raw XY word in the unknown manuscript:

    p0 109..110 = [14,26] = XY

Agent4 independently applied the already used H operation to the two runes' GP-prime weights:

    prime weights = [47,103]
    H = [47-103,47+103] mod29
      = [2,5]
      = [K,g]

Neither result used OPENPGP as a target.

## Literal XY consumes the state pair

Use the word's literal raw spelling as the operation label:

    X = column
    Y = row

Then the prime-H state gives:

    (X,Y) = (K,g) = (2,5)

On the fixed 32-row by8-column p50 table, zero-based row-major address is:

    Y*8 + X = 5*8 + 2 = 42

Authenticated signed source word42 is:

    OPENPGP

The same p50 address contains:

    p50[42] = 0S = 28 in base60

so the operation also returns to physical p28, the page whose DH structure independently supplies K and g.

This closes a compact state loop:

    p28 DH state
    -> THE ROAD / EA109
    -> raw XY
    -> prime-H [K,g]
    -> XY coordinate42
    -> OPENPGP
    -> p50[42]=28
    -> p28

## Independent GP1 identity

The selected raw word has one-origin GP sum:

    GP1([14,26]) = 15+27 = 42

Thus the coordinate address derived from prime-H equals the word's GP1 exactly:

    address(XY(H(primes))) = GP1 = 42

This is the upper endpoint of the separately documented GP0/GP1 interval:

    GP0=40 -> PATHS
    midpoint41 -> VERIFY
    GP1=42 -> OPENPGP

The coordinate mechanism therefore explains why the interval's upper endpoint is operationally special instead of merely observing the three-word phrase.

## Whole-manuscript charge

Across448 canonical complete two-rune unknown words:

- 120 prime-H pairs form a valid p50 XY coordinate because X<8;
- only three have coordinate address equal to their own GP1;
- those three are p0 109 raw XY ->42, p20 30 raw XC ->21, and p35 164 raw XC ->21;
- the selected p0 receiver is the only member whose raw spelling is literal XY;
- complete raw YX occurs zero times.

The receiver location was fixed before its values were opened. The H operation and DH state were established independently. The only new interpretive step is taking the literal XY spelling as Cartesian column,row order.

## Relation to the warning packet

The signed source around word42 says:

    PATHS VERIFY OPENPGP

The independent signed-tail corridor already establishes this suffix as part of an authored navigation program. Once OPENPGP is selected, the existing consumer is:

    GP0(OPENPGP)=75
    p50[75]=177
    p=23 -> p0 packet166..188

So the preferred local route is now:

    EA109
    -> XY
    -> H(prime weights)=[K,g]
    -> coordinate42=OPENPGP
    -> VERIFY OPENPGP
    -> OPENPGP75
    -> warning center177

This is cleaner than treating the GP-origin interval by itself, while the interval remains an independent corroborating register.

## The authenticated source is the same eight-column XY map

A broader source-only synthesis now explains why coordinate42 is useful rather than merely equal to OPENPGP. Lay the authenticated zero-based words into the original p50 width8. The central clue becomes a literal map program:

    ITS WORDS ARE THE MAP
    THEIR MEANING IS THE ROAD
    AND THEIR NUMBERS ARE THE DIRECTION

State coordinates then read exact source spans: row K from x=e..g+K is THEIR MEANING IS THE ROAD, row e from x=K..g is NUMBERS ARE THE DIRECTION, and coordinate (K,g) is OPENPGP.

OPENPGP's native hexadecimal radix16 equals K*8, so the previously established source stride 42->26->10 is exactly a vertical move of K rows at fixed X=K:

    OPENPGP (K,g) -> NUMBERS (K,e) -> PRIMUS (K,1).

This gives the XY receiver a complete source-visible consumer and supplies geometric rationale for the key-ID modulus ladder.

See im-results/lp2-signed2016-p50-xy-word-map.md.

## Decision

Preserve EA109 as a multi-register navigation word, not plaintext:

- raw register: XY operation label;
- prime-H register: [K,g];
- coordinate register: 42=OPENPGP;
- GP-origin register: PATHS VERIFY OPENPGP;
- p50 register: 42->28 and OPENPGP75->177.

The next unresolved cryptographic step remains the warning packet's common value-changing mechanism.

Reproducer: sims/lp2_p0_ea109_xy_primeh_openpgp_coordinate_sft.cjs
