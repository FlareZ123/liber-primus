# Signed EPIPHANY / DEVOTED words independently select physical p32

**Agent8, 19 November 2026. Classification: authenticated-source page selector and solve-path handoff. No unknown LP2 plaintext, key, or complete cipher inverse is recovered.**

## Source relation

The authenticated 2016 message contains the exact clause:

`EPIPHANY SEEKS THE DEVOTED`

Using canonical Gematria Primus ordinal values:

- `GP0(EPIPHANY) = 121`;
- `GP0(DEVOTED) = 102`.

Physical LP2 p32 contains exactly **121 runes**.

Using the established whole-word GP0 to zero-based p50 address primitive, address102 contains token `0W`. That token decodes to **32** under both documented live numeral alphabets, base59 and base60.

The two named words therefore select the same page through independent source properties:

```text
EPIPHANY -> GP0 121 -> page with 121 runes -> p32
DEVOTED  -> GP0 102 -> p50[102] = 0W -> 32 -> p32
```

The wording order also agrees with the numerical direction: EPIPHANY occurs first, DEVOTED later.

## Pointer convergence and source-selected cycle phase

The same zero-based base60 table used above gives a stronger relation before any p32 ciphertext is consumed:

```text
GP0(EPIPHANY)=121 -> p50[121]=237 -> p50[237]=32
GP0(DEVOTED)=102  -> p50[102]=32
```

The two named words converge on state32 under the same byte-as-next-address operation, with EPIPHANY one step farther away. State32 then gives `32 -> 115`, and 115 is a member of the established 11-cycle. The resulting source-selected phase is:

`115 -> 247 -> 192 -> 0 -> 203 -> 68 -> 199 -> 47 -> 76 -> 114 -> 197 -> 115`.

This links the authenticated phrase to both the physical page number and a fixed phase of the existing table cycle. Re-running the bounded whole-p32 additive family at phase115, with address, successor, row, and column schedules, row/column clocks, and both signs, gives 16 fixed outputs. The best IoC is **0.04049586776859504** and remains visibly nonlinguistic. The phase removes a start-state ambiguity without rescuing the direct additive consumer.

## Whole signed-source control

Charge every authenticated 2016 word as the possible rune-count word and every authenticated word as the possible p50-address word. For a hit:

1. the first word's GP0 must equal the exact rune count of an LP2 physical page;
2. the second word's GP0 must address p50;
3. the decoded p50 token must equal that physical page number.

Under zero-based p50 address and zero-based physical-page output:

- base59 has exactly one hit: **EPIPHANY / DEVOTED -> p32**;
- base60 has two hits: **EPIPHANY / DEVOTED -> p32** and **EMPTY / LIES -> p51**;
- only EPIPHANY / DEVOTED has the same forward order as the signed source.

The base60 rival is reversed in the actual message: LIES precedes EMPTY.

## Origin and radix family

Charge p50 address origin in {zero, one}, numeral radix in {59, 60}, and physical-page output origin in {zero, one}. This gives eight source-readable configurations.

The exact named pair EPIPHANY / DEVOTED succeeds only with:

```text
p50 address origin = zero
page output origin = zero
radix = 59 or 60
```

The radix ambiguity disappears because `0W` has value32 in both alphabets.

The one-address / one-page alternatives map EPIPHANY with repeated occurrences of THE to p32 through token `0X=33`. Those alternatives do not implement the clause's named receiver DEVOTED. The authenticated grammar therefore supplies a source-level discriminator in addition to the numeric family.

## Consequence for the 11x11 p32 construction

P32 has exactly 121 runes, so the selected page has the unique square size implied directly by EPIPHANY's number:

`121 = 11^2`.

On the source-order 11x11 reflow, the established GP-prime checks are:

- first-row prime sum = **563**;
- first-column prime sum = **569**.

These equal the exact width and height of the authenticated 2016 image.

Earlier work correctly retracted the claim that the p32 tree and 2016 tree are the same source artwork. The present selector does not use visual identity. It reaches p32 from the authenticated words and the original p50 table, so the different stock-art lineages no longer leave p32 itself unselected.

The 11x11 reflow and 563/569 axis relation now sit on a more plausible human solve path:

```text
signed phrase EPIPHANY ... DEVOTED
  -> p32 by rune count and table pointer
  -> 121 = 11^2
  -> source-order 11x11
  -> GP-prime top/left sums 563/569
  -> authenticated image dimensions 563x569
```

This still does not specify a traversal or decryption operation for the 121 ciphertext runes.

## Relationship to the ROAD zero route

A separate Agent8 result uses the frozen ROAD source numbers `[12,5,1,4]` as p50 coordinates and reaches both literal `00` cells. Those zeros select state0 of the existing p50 pointer graph, whose forward row-major cycle has length11.

The present result independently selects p32 and, through the same table pointer operation, fixes cycle phase115 after the EPIPHANY/DEVOTED convergence at state32. Together with the ROAD zero route, the source supplies two routes into the same 11-cycle: zeros select state0, while the named signed clause selects state115 through p32. Direct phase0 and phase115 additive consumers and simple cycle-to-square coordinate readings fail, so the remaining missing element is the authored cycle-to-square readout.

## Decision

Promote the EPIPHANY / DEVOTED relation as a **source-selected p32 handoff**.

This materially improves the status of p32 as the intended 2016 clue receiver. It does not promote any existing p32 cipher proposal. A useful successor must consume the selected p32 11x11 object through an operation fixed by source evidence and produce a withheld plaintext, key, or destination prediction.

## Reproduction

Run:

`node sims/lp2_epiphany_devoted_p32_selector_sft.cjs`

The SFT reads the authenticated 2016 message, canonical LP2 corpus, and original p50 table. It reconstructs GP0 word values, audits all eight origin/radix configurations, asserts the complete signed-word/page family, and checks the p32 121-rune plus 563/569 prime-axis facts.
