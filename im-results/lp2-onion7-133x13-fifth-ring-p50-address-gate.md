# Onion7 133, the 13×133 LP2 chapter, and a 256-cell fifth-ring decoder: direct original-input result

**Agent 31, 22 November 2026. Classification: new bounded source-constrained decoding experiment, negative for direct GP29 prose.** The manuscript still has **56 unsolved physical LP2 pages**, and this experiment recovers **no unknown plaintext or authenticated key**.

## What a 2014 solver could notice

The surviving 2014 Onion7 HTML has literal `<title>133</title>` and `<div id="331">`. The untouched LP2 physical pages **p8–p14** contain **1,729 runes**, exactly **13 × 133**. If a solver writes those consecutive source runes into 13 rows of 133, the fifth nested rectangular perimeter (zero-based inset four) is a source-exact **256-rune** circuit: top 125, right 4, bottom 124, left 3. The original numerical p50 table has exactly **256 two-character tokens**. These independently visible quantities motivate a cheap first attempted operation: use each printed numeral's byte value as an address into the circuit, then read the selected rune. The alternative source interpretation deletes lowercase `f` from the base60 alphabet, giving a 59-digit alphabet; clockwise and counterclockwise perimeters are both charged in advance.

**Strongest objection:** 13×133 reflow is imposed by the analyst, and the manuscript never commands the ring depth, clockwise starting corner, numeral→rune address, or a decoder. The 256 count may arise from common binary dimensions. A successful local numeral alignment alone cannot authenticate a cipher. The test therefore asks only whether the most immediate keyed address reading already produces plaintext on unmodified source data.

## Exact original register and outcomes

Source chapter order: physical LP2 p8 through p14, all **1,729 original GP29 indices** concatenated without interposed text. Lay them row-major in **13×133**. Fifth ring: coordinates (row4,col4) to (row8,col128), clockwise starting at its top-left corner. Original physical p50 three-page 32×8 table is read in printed row-major order. Token `ab` maps to `radix·digit(a)+digit(b)`; the resulting 256 addresses fall within 0–255 under both predeclared radices. Counterclockwise is the same source ring indexed with `(256−address)%256`. No plaintext, padding, zero skips, IV, phase fit, or higher cipher layer was introduced.

| Source-fixed direct address reading | Equal-rune unordered pairs / 256 positions | GP29 IoC | Observed interpretation |
| --- | ---: | ---: | --- |
| Original ring, before reordering | **1,117** | **0.034221814** | Near uniform |
| Radix 60 / clockwise | **1,179** | **0.036121324** | No readable GP prose |
| Radix 60 / counterclockwise | **1,320** | **0.040441176** | No readable GP prose |
| Radix 59 / clockwise | **1,184** | **0.036274510** | No readable GP prose |
| Radix 59 / counterclockwise | **1,317** | **0.040349265** | No readable GP prose |

These are original-input computations, not assumed random samples or known-key decryptions. The two higher counterclockwise collision rates are substantially below the approximately **0.06** GP29 collision level of independently readable source text in the same project, but that alone does not exclude an intermediate coded alphabet.

**Conditional null rather than an unsupported coincidence claim.** Freeze the original ring's exact 256-rune multiset and all 256 original p50 addresses, including repeated pointers; perform 5,000 fixed-seed Fisher–Yates position shuffles. The number of same-symbol pairs at addressed locations has:

| Radix / direction | Shuffle mean pairs | SD | Observed z | Add-one upper tail | Add-one lower tail |
| --- | ---: | ---: | ---: | ---: | ---: |
| 60 / CW | 1,238.4664 | 52.5409 | −1.1318 | 0.88022 | 0.12537 |
| 60 / CCW | 1,239.5374 | 51.9496 | +1.5489 | 0.06999 | 0.93221 |
| 59 / CW | 1,238.5142 | 52.9369 | −1.0298 | 0.86183 | 0.14337 |
| 59 / CCW | 1,239.2756 | 53.3334 | +1.4573 | 0.08838 | 0.91322 |

A strict random-uniform linguistic claim is unnecessary; the shuffle controls demonstrate that the observed reordering's frequency concentration is ordinary given its source inputs. None of the four readings has a causal path to sustained GP English. The p50 address list has repeated entries, so this particular table↔ring map is not invertible without auxiliary information; it cannot be declared a complete cipher.

## Decision and remaining possibility

**Retire this four-way direct numeral-address readout as an LP2 plaintext extraction.** Preserve the physical 13×133 and inset-4/256 arithmetic only as a conditional visual/number navigation prompt. A genuinely useful continuation requires an independent contemporaneous source fixing at least the ring placement and output meaning, then a reversible operation predicting untouched original ciphertext. Arbitrary coordinate rotations, alternate ring depths, hidden Caesar keys, or another source-unselected layer would restart a search already unsupported by these data.

The original p29/p50 shared polynomial root24, p56 known prime-totient cipher, and p57 solved PARABLE remain established independently and supply no selector for this fifth-ring output. See [authoritative current research synthesis](../results/README.md) and [the original Onion7 133/331 cycle work](lp2-onion7-133331-fullcycle-table-carrier.md) to avoid conflating this direct ring addressing with previous LCG table traversals.

[Reproducer](../sims/lp2_onion7_133x13_fifth_ring_p50_original_sft.cjs) reads only the committed original corpus, table and period HTML. It fixes all source dimensions, computes the four exact readouts and four 5,000-shuffle controls with seed `0x0b13a322`, and checks original results. Requires Node 22. No external files are modified.
