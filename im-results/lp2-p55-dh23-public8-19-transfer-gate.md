# P55 DH23 public-value transfer: exact shared-secret gate

**Agent46, 24 November 2026. Classification: source-constrained cryptanalytic hypothesis, exact original-input computation, negative plaintext result.** No unknown LP2 plaintext, authentic key, or final destination recovered.

## Question and source-selected inputs

The existing p57 → p28 route proposes the standard DH23 tuple from the original p28 line and selected word:

| Field | Value |
|---|---:|
| Modulus p | 23 |
| Generator g | 5 |
| Private exponents a,b | 6, 15 |
| Public values A,B | 8, 19 |
| Shared value K | 2 |

The same route identifies p55 as the terminal encrypted page. Separately, the p55 word-interior parse gives 43 interior runes and 32 boundary runes from its 16 complete printed words. Reading the interior and shell as big-endian BASE29 integers gives N=8P and E32=43Q, where P is a 206-bit prime and Q a primitive root modulo P. This parse excludes the one-rune NG carry from p54, so its field interpretation remains conditional; the competing full-page parse retains that carry and gives a 43/33 split. See the p28 DH23 route (im-results/lp2-p57-find28-p28-centerword-dh87-loop.md), the existing p55 field/DLP report (im-results/lp2-p55-shed-public-values-64bit-exponent-exclusion.md), and the full-page subgroup analysis (im-results/lp2-p55-shedprime-gp29-subgroup-dh-obstruction.md).

A direct, clue-constrained continuation worth testing is to use p55's (P,Q) as a larger DH group and p28's source-derived A=8, B=19 as the two public values. Compute x8=log_Q(8) and x19=log_Q(19), then the common secret S=8^x19=19^x8 mod P. The p55 interior has exactly 43 runes, so the frozen simple receiver is the zero-padded 43-digit big-endian BASE29 representation of S, added to or subtracted from those 43 runes. No phase, key search, KDF, IV, offset, or alternative radix is introduced.

## Exact recovery of the second private exponent

The existing CADO-NFS run 45124056922 (https://github.com/FlareZ123/liber-primus/actions/runs/45124056922) computed the common-base virtual logarithms for Q and 19 modulo the large prime factor R. Its validated factor-base log queries give:

    R = 101149063843788281988908603592862658065019147521
    M = 630311729907820
    P - 1 = M * R

    log_Q (virtual base) = 97177182119505488787450641888952849267188113103 mod R
    log_19 (same base)  = 20905766984553842032252330728926955680769982593 mod R

Dividing the two virtual logs cancels the unknown common base and gives x19 mod R. The smooth factor M is handled exactly by Pohlig–Hellman on Q^R and 19^R, with factorization M=4*5*41*49477*15535963; BSGS is needed only for the 15,535,963 factor. CRT gives:

    x19 mod M = 250111533132869
    x19 mod R = 6815506799009285993122362359156876822583567294
    x19 = 48172886698956987221079890492492408812251247376225574769254429

Direct original-field exponentiation verifies Q^x19 mod P = 19. The previously recovered x8 also verifies Q^x8 mod P = 8:

    x8 = 14347449201966638813083683299370469317053765371148427588804751
    S  = 8^x19 = 19^x8 mod P
       = 16332999776445290238782640827039054129387814227074519629787635

This is a complete, independently checkable conditional DH shared secret, not a fitted key.

## Original p55 receiver result

The exact 43-digit BASE29 key is applied to the 43 original word-interior runes, retaining their 16 source word slots. Both reversible directions round-trip exactly, and the same key has a planted positive control on the first 43 runes of clear p57.

| Direction | GP29 index of coincidence | Original-order readout |
|---|---:|---|
| Subtract S-key | 0.0509413068 | MOEPAETHIAEAFLOETHTHPMFTMIRIAINGTHUOEPNGWUINLNGLCPNGWEAFPIAOE |
| Add S-key | 0.0431893688 | MIAJTSGYMXBAEIASUNSLNGNYAX |

Neither output forms coherent English or a sustained readable phrase. IoC alone is not decisive here because the 43-rune register consists of stripped word interiors, not complete words; the exact word-preserving readouts are the relevant negative. The p57 positive control confirms the implementation and direction handling, not the historical correctness of the candidate.

## Full-page 43/33 alternative and direct-generator obstruction

To avoid relying only on the page-local 43/32 shell, the complete p55 parse retains the incoming carry as exterior material. Its 33-rune shell integer is:

    E33 = 1369636156327157530854965033451154339299654501152
    ord_P(E33) = (P-1)/5

This exact subgroup structure suggests one other simple, source-tied DH candidate: use E33 as the subgroup generator and reuse the p28 private exponents a=6,b=15. Its shared secret is E33^90 mod P = 7257953848910658229691929268430073526528673165416577329201674. Converting that value to 43 BASE29 digits and applying both signs to the same 43-rune interior gives:

| Direction | IoC | Original-order readout |
|---|---:|---|
| Subtract | 0.0332225914 | MOPTFENGNAEAEBLMYNGLXOETSWUEOATHWSXCWEOOEXSMEOIAUSITCW |
| Add | 0.0487264673 | MBJAEBSRINXINNDBJAERFIARFCUANNOESCTMTNXNGNYCEADBF |

Neither is readable. A literal transfer of p28's generator g=5 into P is also incompatible with its public values: 5 has order (P-1)/2, while 8, 19, and 2 are quadratic non-residues modulo P and therefore cannot be public values in the subgroup generated by 5.

## Decision

Retire these exact p55 DH23 transfers. The page-local 43/32 (P,Q) group yields a fully verified DH secret for public values 8 and 19, but its fixed 43-rune BASE29 consumer does not recover plaintext. The complete-page 43/33 subgroup alternative also fails under the source-derived exponents. The direct use of g=5 with the p55 prime field is algebraically incompatible with the p28 public values.

This does not exclude every DH/KDF or every possible p55 mechanism. It does mean there is no basis for broadening these candidates into mode, phase, encoding, or KDF sweeps. Reopen only if a new original clue specifies a different consumer or key representation. Keep this as an intermediate negative; do not promote it to results/README.md.

Reproducer: sims/lp2_p55_dh23_public8_19_transfer_sft.cjs.