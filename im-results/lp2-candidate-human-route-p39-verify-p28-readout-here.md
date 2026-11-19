# Candidate human solve path: p39 VERIFY OPENPGP -> authenticated source numbers -> p28 READ OUT HERE

**Agent6, 19 November 2026. Classification: integrated intended-route hypothesis, not established full decryption.** Every operation below already has a reproducer in the repository. The weakest link is the p39 VERIFY output, whose receiver is strongly source-selected but whose shed→p50 output family has a nontrivial manuscript-wide source-vocabulary hit rate.

## 1. The solved manuscript points back into the number table

Solved p57 says:

```
SHED OUR OWN CIRCUMFERENCES
FIND THE DIVINITY WITHIN
AND EMERGE
```

The frozen shedding/page-pointer route gives:

```
p57 body
 -> shed first/last runes
 -> 50 interior runes
 -> p50
 -> B=19
 -> p33
 -> shed p33 first black body
 -> 39 interior runes
 -> p39.
```

P39's unique red title is the DH-state literal:

```
[-K,g,b] = [27,5,15].
```

## 2. DIVINITY selects one p39 receiver

The independently built p50 reverse-tree grammar has cumulative counts:

```
depth a=6   -> 42  = FIND
depth 7     -> 53  = LIKE
depth 10    -> 78  = INSTAR
depth b=15  -> 105 = DIVINITY
depth 20    -> 121 = EPIPHANY
depth 24    -> 131 = CIRCUMFERENCES
```

Charge all six as zero-based p39 rune addresses. Only `DIVINITY=105` lands on any printed word start, and it lands exactly on a `g=5` word:

```
p39[105..109] = [8,6,4,12,16].
```

Its center is `q=4`, and its outer-H shell is entirely state:

```
[B+K,p+1,p,p-g,q].
```

Apply the already solved instruction once:

```
SHED CIRCUMFERENCE
[8,6,4,12,16] -> [6,4,12]
GP0 = 22 = p-1
p50[22] -> 59
GP0(VERIFY) = 59.
```

Within p39, this is the only one of ten five-rune words whose identical shed→p50 operation lands on any authenticated 2016 word GP0. Across all unknown pages, however, the family is permissive: 50/318 five-rune words land on some authenticated source word and 12/318 land on VERIFY. Thus this step is a **prospective VERIFY candidate whose force comes from prior receiver selection**, not a standalone rarity proof.

## 3. VERIFY has an exact source continuation

In the signed 2016 message:

```
word41 = VERIFY
word42 = OPENPGP.
```

The preserved detached/clear-signed artifact verifies under Cicada's public key. Existing source audits correctly classify the OpenPGP packet fields as ordinary signature metadata unless a new first-party selector says otherwise.

The natural human instruction is therefore:

```
VERIFY OPENPGP
 -> trust the authenticated signed message.
```

This gives a manuscript-internal reason to promote the signed message from external research material to an intended solve-path input.

## 4. The verified message supplies the DH state and operation class

Zero-based authenticated word positions give:

```
PATH       2 = K
LIES       3 = e
EMPTY      4 = q
EPIPHANY   5 = g
SEEKS      6 = a
THE        7 = g+K
DEVOTED    8 = A
WORDS     15 = b
THEIR     19 = B
ROAD      23 = p
DIRECTION 29 = GP modulus.
```

These values close the ordinary DH23 state exactly.

The source phrase `THEIR NUMBERS ARE THE DIRECTION` then selects the native-base60 low/right p50 pointer. `NUMBERS` and `DIRECTION` converge into the same route and reach:

```
... -> OUT(20) -> FIND(42) -> physical p28.
```

Authenticated word numbers also select a first-party GP29 cube operator:

```
C(x) = x^3 mod29,
```

with a unique state/source cycle under exponent3.

## 5. P28 yields READ OUT, then HERE

P28 supplies the unique center-plus-one-based-word28 source object:

```
[9] | [28,24,10,1,20].
```

The language-free external p50 relation selects one raw six-rune output across the charged p28 families:

```
[4,28,23] | [3,1,16]
 -> READ | OUT.
```

The exact p28-specific two-part exponent schedule remains the main local premise. P57 circumference grammar constrains the object but its independent holdout favors removal-count semantics, so it does not authenticate exponent27 by itself.

READ OUT then has a direct downstream consequence on p28 line1. That line has source-typed `[p,g,K,g]=[23,5,2,5]` geometry. Apply the already established forward H transform to the first two fragments and obey the recovered word OUT by taking the outer pair:

```
H(P,C) = HE
H(J,W) = RE

HE + RE = HERE.
```

HERE is absent from the authenticated 2016 vocabulary, so it is an unknown-page instruction/checkpoint candidate rather than a copied source word.

Finally:

```
GP0(HERE)=48
p50 low/right:
48 -> 13 -> 4 -> 37 -> OUT(20) -> FIND(42) -> p28.
```

Thus HERE closes into the same independently authenticated pointer route.

## Architectural interpretation

The candidate human path is:

```
solved LP prose
 -> p50/p33/p39
 -> VERIFY OPENPGP
 -> authenticate signed 2016 clue
 -> signed word numbers reconstruct DH23 + GP29 cube + p50 direction
 -> FIND p28
 -> READ OUT
 -> HERE
 -> same pointer route back to p28.
```

This architecture explains why a signed external message, the number table, the DH literal, p57's circumference language, p39's red title, and p28's READ OUT/HERE checkpoint all belong to one puzzle rather than separate coincidence hunts.

The strongest unresolved point remains the p28-specific two-part power schedule, especially the word exponent27 versus the independently favored circumference removal-count exponent9. The p39 VERIFY step also needs an independent downstream consequence stronger than source-vocabulary matching before it should be treated as established.

Reproducers include:

- `sims/lp2_p39_divinity_within_verify_sft.cjs`
- `sims/lp2_signed2016_word_position_dh_sft.cjs`
- `sims/lp2_signed2016_wordnumber_cube_operator_sft.cjs`
- `sims/lp2_p28_readout_familywise_audit_sft.cjs`
- `sims/lp2_p28_readout_here_page_start_sft.cjs`
