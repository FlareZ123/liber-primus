# P22 source square contains a unique mixed-radix VERIFY OPENPGP edge

**Agent24, 19 November 2026. Classification: intermediate source-structured cross-source bridge. No unknown LP2 plaintext, creator key, or complete inverse is claimed.**

## Why this object was opened

The existing p49 -> p55 -> p22 route now selects the original LP1 5x5 square carried by p22. The already reproduced literal consumer recursively sheds the square's circumferences to its sole-prime center 809, then reads:

```text
809 mod 256 = 41
p50[41] = 1O
drop-f base59 = 83 = GP0(EMERGE)
```

The authenticated 2016 signed message independently contains the word `NUMBERS`, also with GP0 83, in the sentence:

```text
... their numbers are the direction.
```

This gave a bounded reason to ask whether the source square's literal geometry contains a direction-sensitive consequence under the already active p50 numeral states.

## Source square

The exact LP1 source square is:

```text
434   1311  312   278   966
204    812  934   280  1071
626    620  809   620   626
1071   280  934   812   204
966    278  312  1311   434
```

Every noncentral value occurs as a 180-degree-opposed pair.

Two individual source values are relevant under the fixed original p50 table:

```text
278  mod 256 = 22 -> p50[22] = 0x
1071 mod 256 = 47 -> p50[47] = 1G
```

Under the conventional 60-symbol table alphabet:

```text
0x = 59 = GP0(VERIFY)
```

Under the globally frozen post-MUST drop-f base59 alphabet:

```text
1G = 75 = GP0(OPENPGP)
```

The authenticated 2016 signed body's final two alphabetic words are exactly:

```text
VERIFY OPENPGP
```

with one-based word positions 42 and 43. VERIFY is the signed body's only GP0-59 word; OPENPGP is its only GP0-75 word.

## Finite geometry and radix charge

The test does not pick the 278 -> 1071 edge after reading the target phrase.

It charges every directed 8-neighbor edge of the literal 5x5 source square. There are 144 directed edges. It then charges all four fixed radix pairs:

```text
base60 -> base60
base60 -> base59
base59 -> base60
base59 -> base59
```

For each edge and radix pair, the two source integers are reduced modulo256, read through the original p50 cells, and compared with every adjacent GP0 word pair in the authenticated 43-word 2016 body.

The complete result is:

| Radix pair | Authenticated 2016 adjacent-word hits |
|---|---:|
| base60 -> base60 | 0 |
| base60 -> base59 | 2 |
| base59 -> base60 | 0 |
| base59 -> base59 | 0 |

Both surviving hits are the same source-number relation duplicated by the square's 180-degree symmetry:

```text
r1c4 278 -> r2c5 1071
r5c2 278 -> r4c1 1071
```

and both decode:

```text
59 -> 75
VERIFY -> OPENPGP
```

There is no other authenticated 2016 adjacent-word hit anywhere in the charged edge/radix family.

As a matched known-text control, the identical 144-edge x 4-radix family was tested against all adjacent word pairs of solved p57. It yields zero hits under all four radix pairs.

## Self-describing transition

The surviving pair has an unusual internal property:

```text
first source number, read base60 -> 59 = VERIFY
second source number, read base59 -> 75 = OPENPGP
```

Thus the first numeric output is also the radix used for the second read.

This is a compact explanation for why the one surviving edge uses 60 -> 59 instead of a fixed radix. It is still retrospective: the current route entering p22 is already in the globally frozen post-MUST base59 state. Director #1688 expressly allows that one global state and rejects per-edge radix retuning. No first-party source has yet been found that says a new square instruction resets the first cell to conventional base60.

Therefore this result **does not authorize a second radix switch**. Treat the self-description as a concrete candidate for a future source-authentication test.

## Center bridge to the same signed source

The established center read also has a new cross-source identity:

```text
809 -> base59 83
GP0(EMERGE)  = 83
GP0(NUMBERS) = 83
```

In the authenticated signed body, NUMBERS occurs once, at word27, immediately inside:

```text
their NUMBERS are the DIRECTION
```

This makes the signed 2016 instruction a natural external consumer to inspect after the p22 EMERGE state. It does not by itself prove that GP0 equality is the intended handoff.

## OpenPGP continuation gate

The literal signed identifier `7A35090F` was tested only under obvious fixed representations: the full hexadecimal integer, high and low byte, first and last 16-bit halves, and each of its four bytes. Each representation was reduced modulo256 and read under both base60 and drop-f base59.

None maps to a GP0 value of any word in solved p57 or the authenticated 2016 body.

This is a clean stop. Existing Director #1201 already found that an authenticated OpenPGP envelope supplies verification and location handoff without a first-party rule selecting signature fields as an LP2 key. The present result strengthens the literal instruction to verify OpenPGP; it does not revive unsourced fingerprint, key-ID, signature-byte, or KDF searches.

## Decision

Preserve the square edge as a source-structured candidate because:

1. the source geometry is fixed before the read;
2. the complete 8-neighbor family is small and charged;
3. the complete four-radix pair family selects only 60 -> 59;
4. the only signed adjacent-word result is the exact final authenticated phrase VERIFY OPENPGP;
5. the hit is duplicated only by the square's built-in 180-degree symmetry;
6. the identical family has no adjacent p57 hit.

The missing premise is equally specific: a source-visible rule must justify entering this square edge in base60 despite the upstream post-MUST base59 state. Without that rule, this remains intermediate evidence rather than an authenticated operation.

## Reproduction

```text
node sims/lp2_p22_square_verify_openpgp_edge_sft.cjs
```

The SFT reconstructs the square from the repository LP1 reference, parses the exact authenticated 2016 cleartext, charges all 576 directed edge/radix configurations, verifies the p57 negative control, and checks the bounded OpenPGP-ID stop.
