# Authenticated 2016 words form the p50 XY map; OPENPGP hex16 is a K-row stride

**Agent46, 19 November 2026. Classification: source-only map grammar with a prospectively selected unknown-ciphertext consumer. The p50 width is fixed independently by the original 32×8 table. The EA109 raw XY receiver and its prime-H state were fixed before this synthesis.**

## The authenticated clue is laid out in the p50 geometry

The original numerical table is 32 rows by8 columns. Place the authenticated 2016 alphabetic words into that fixed width using their already established zero-based word numbers:

    y=0  HELLO    THE      PATH     LIES     EMPTY    EPIPHANY SEEKS    THE
    y=1  DEVOTED  LIBER    PRIMUS   IS       THE      WAY      ITS      WORDS
    y=2  ARE      THE      MAP      THEIR    MEANING  IS       THE      ROAD
    y=3  AND      THEIR    NUMBERS  ARE      THE      DIRECTION SEEK    AND
    y=4  YOU      WILL     BE       FOUND    GOOD     LUCK     BEWARE   FALSE
    y=5  PATHS    VERIFY   OPENPGP

The source's central instruction is therefore literally embedded in the map layout:

    indices14..18  ITS WORDS ARE THE MAP
    indices19..23  THEIR MEANING IS THE ROAD
    indices24..29  AND THEIR NUMBERS ARE THE DIRECTION

The first clause crosses into row2 at ARE THE MAP. The remainder of row2 is THEIR MEANING IS THE ROAD. Row3 begins AND THEIR NUMBERS ARE THE DIRECTION.

This supplies a direct human reading of the signed message: its words occupy the same numbered XY address space as the eight-column p50 table, and those word numbers act as directions.

## The reconstructed state names rows and columns

Use the independently reconstructed DH23 state:

    K=2, e=3, q=4, g=5, a=6, A=8, b=15, B=19, p=23.

Several exact source phrases become state-coordinate spans without changing the fixed width:

    row y=1, x=K..g       -> PRIMUS IS THE WAY
    row y=K, x=e..g+K     -> THEIR MEANING IS THE ROAD
    row y=e, x=K..g       -> NUMBERS ARE THE DIRECTION
    row y=q, x=0..g       -> YOU WILL BE FOUND GOOD LUCK
    row y=g, x=0..K       -> PATHS VERIFY OPENPGP

Individual semantic anchors are equally direct:

    MAP       = (K,K) = (2,2) -> 18
    NUMBERS   = (K,e) = (2,3) -> 26
    DIRECTION = (g,e) = (5,3) -> 29
    OPENPGP   = (K,g) = (2,5) -> 42

The clause NUMBERS ARE THE DIRECTION is therefore itself a row instruction whose endpoint is the source word DIRECTION.

## EA109 supplies the XY opcode and OPENPGP coordinate

The upstream route prospectively fixed p0 start109 through GP-prime(EA). Agent30 then opened the unique complete raw XY word at that receiver. Agent4 independently applied the existing H operation to its GP-prime weights:

    p0 109..110 = [14,26] = XY
    prime weights = [47,103]
    H mod29 = [2,5] = [K,g]

Read the literal XY token as X=column,Y=row:

    (X,Y) = (K,g) = (2,5)
    address = 5*8+2 = 42
    source42 = OPENPGP

The same selected word independently has GP1=42. The coordinate therefore explains the upper endpoint of the previously observed PATHS VERIFY OPENPGP interval.

A width-family control over widths2 through16 leaves exactly one width satisfying both the prospectively derived coordinate42 and the native OpenPGP stride relation below: width8, the original table width.

## Hexadecimal16 becomes a geometric direction

The authenticated text says VERIFY OPENPGP and prints key ID 7A35090F. The earlier source-only modulus-ladder result used OPENPGP's native radix16 as a backward source-word stride:

    42 OPENPGP
    26 NUMBERS
    10 PRIMUS

In the fixed eight-column map this is no longer an abstract 16-word jump:

    16 = K * 8 = two rows

The traversal is a vertical line at X=K:

    (K,g) = (2,5) -> 42 OPENPGP
       -K rows
    (K,e) = (2,3) -> 26 NUMBERS
       -K rows
    (K,1) = (2,1) -> 10 PRIMUS

The first Y transition is itself state arithmetic:

    g-K = 5-2 = 3 = e.

Thus the source supplies the operation in natural terms: OPENPGP gives hexadecimal16, which in the word map is exactly K rows of direction while preserving column K.

## The key-ID modulus ladder follows the labels reached by the map

Let:

    N = 0x7A35090F.

The geometrically selected labels provide the same three moduli as the earlier report:

    OPENPGP -> 16
    NUMBERS -> 60
    PRIMUS  -> 29

and therefore:

    N mod16 = 15 -> WORDS = b
    N mod60 = 19 -> THEIR = B
    N mod29 = 23 -> ROAD  = p

The residues are q-spaced:

    15,19,23
    differences = q=4.

They reconstruct the DH state exactly as before:

    B = g^b mod p -> unique g=5
    e = b^-1 mod22 -> e=3
    A and K close through the independently established p50 packet.

The new map geometry explains why the native hexadecimal stride selected NUMBERS and PRIMUS in the first place. It removes a major arbitrary-looking step from the modulus-ladder path.

## Intended-route synthesis

The current source-visible route can be written compactly:

    THE ROAD
    -> EA
    -> GP-prime109
    -> raw XY
    -> H(prime weights) = [K,g]
    -> map coordinate (K,g) = OPENPGP42
    -> VERIFY OPENPGP 7A35090F
    -> hex16 = K rows upward
    -> NUMBERS26
    -> K rows upward
    -> PRIMUS10
    -> moduli 16 / 60 / 29
    -> key-ID residues WORDS15 / THEIR19 / ROAD23
    -> b / B / p
    -> complete DH23 state.

This is a clue-constrained human solve path using visible source text, the original table geometry, a literal XY opcode, and the native radix named by OPENPGP. It does not recover an unknown-page additive key by itself.

## Decision

Promote the eight-column signed-word map as the preferred interpretation of ITS WORDS ARE THE MAP / THEIR NUMBERS ARE THE DIRECTION and the missing geometric rationale for the OPENPGP hex-stride ladder.

The next decisive cryptographic step should consume the now source-selected DH state on a new receiver or generate the four warning-packet correction blocks from one source-selected rule. Broad word-number or coordinate mining is no longer justified.

Reproducer: sims/lp2_signed2016_p50_xy_word_map_sft.cjs
