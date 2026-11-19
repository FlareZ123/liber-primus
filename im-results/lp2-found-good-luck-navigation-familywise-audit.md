# Familywise audit of the p0 FOUND -> GOOD -> LUCK navigation chain

**Agent19, 19 November 2026. Director task #1739. Classification: negative for a reusable literal digit-letter p50 navigation grammar. The observed FOUND -> GOOD -> LUCK receiver chain remains a real source/ciphertext chronology fact, while the charged family, nulls, and a sealed transfer failure do not support using this grammar to select further unknown plaintext.**

## Frozen family

The audit uses no receiver rune values and no additive decryption keys.

Inputs are restricted to:

- the authenticated 43-word 2016 message;
- canonical GP29 word values;
- promoted zero-based `GP0(word) -> p50 cell` addressing;
- the original 256 p50 tokens;
- the two live token alphabets, conventional base60 and drop-f base59;
- zero- and one-origin numeric outputs;
- p0 complete-word starts and ends;
- the literal digit-letter relation already used by the route: the leading digit equals the number of occurrences of the token letter in the next authenticated word;
- equality between the selected p0 word length and the next authenticated word's GP29 length.

A logical source edge succeeds when at least one charged radix/origin/start-end mode satisfies all of those conditions. Duplicate numeric modes count as one logical edge when measuring source-order runs.

## Source-only literal stage

Before p0 geometry is consulted, exactly five of the 42 authenticated adjacent source pairs satisfy the literal digit-letter relation:

```text
DEVOTED -> LIBER : GP0=102 -> 0W, LIBER has 0 W, next GP length5
ITS     -> WORDS : GP0=41  -> 1O, WORDS has 1 O, next GP length5
YOU     -> WILL  : GP0=30  -> 2L, WILL has 2 L, next GP length4
FOUND   -> GOOD  : GP0=36  -> 0s, GOOD has 0 s, next GP length4
GOOD    -> LUCK  : GP0=35  -> 0d, LUCK has 0 d, next GP length4
```

The first two are useful controls because the relation exists before any p0 output is opened.

## Complete charged compound family

After charging both radices, both origins, both boundary classes, and next-word length, only three logical source edges survive:

```text
YOU   -> WILL : 2L, base60 / zero, p0 start141, length4
FOUND -> GOOD : 0s, base59 / one,  p0 end52,    length4
GOOD  -> LUCK : 0d, base60 / zero, p0 start39, length4
               0d, base59 / zero, p0 start39, length4
```

Thus the actual tape contains one two-edge logical run:

```text
FOUND -> GOOD -> LUCK
```

at authenticated source indices 35, 36, 37.

The source punctuation gives a natural descriptive stop: FOUND ends a sentence, and GOOD LUCK is the next complete two-word sentence. This alignment was observed after the run was known, so it is retained as source context rather than assigned an independent probability.

## Sealed transfer: DEVOTED -> LIBER

The source-only stage leaves DEVOTED -> LIBER as a clean unused literal relation.

Before inspecting its p0 geometry, the #1739 issue comment sealed:

```text
GP0(DEVOTED)=102
p50[102]=0W
literal relation: LIBER contains zero W
LIBER GP length=5
0W numeric value=32 in both live alphabets

charged receiver positions:
zero origin = 32
one origin  = 31

prediction:
one charged start/end class must select a complete five-rune p0 word
```

The holdout fails exactly.

Both offsets31 and32 are interior to zero-based p0 word5:

```text
word5 = offsets23..33, length11
```

Neither offset is a word start or end, and the selected word length is 11 rather than5. No alternate token reading, nearby offset, or new origin was tried.

## Exact token-multiset calibration

For each authenticated source edge, replace its actual addressed token by every one of the 256 original p50 token instances. A token instance qualifies only when it passes the literal relation and at least one frozen numeric boundary/length mode.

For the specific two-edge source position FOUND -> GOOD -> LUCK:

```text
FOUND -> GOOD qualifying token instances = 17
GOOD  -> LUCK qualifying token instances = 22

ordered distinct qualifying pairs = 361
all ordered distinct token pairs = 256 * 255 = 65,280

specific-pair rate = 361 / 65,280
                   = 0.005530024509803922
```

Across all 42 source edges, the random-token expected logical edge count is **1.57421875**. Summing exact pair probabilities over all 41 consecutive source positions gives an expected **0.11446078431372546** two-edge runs. This expectation also supplies an 11.45% union-bound ceiling for the chance of at least one run under the token-assignment null.

A separate exact 256-way cyclic rotation of the intact p50 token tape preserves the whole token multiset and local tape order:

```text
rotations with at least one two-edge run = 25 / 256
maximum run length over rotations        = 4
observed rotation0                       = 3 logical edges, 1 run, max length2
```

The observed run therefore does not stand alone as a rare familywise token-tape event.

## Page/word-preserving boundary calibration

Keep the actual p50 tokens and authenticated source order fixed. Circularly translate the complete p0 start/end geometry through every one of the page's **262** rune phases while preserving every word's original length.

Results:

```text
boundary phases with at least one two-edge run = 11 / 262
maximum run length                             = 2
observed phase0                                = 3 logical edges, 1 run, max length2
```

For the actual FOUND and GOOD tokens specifically, the two-edge FGL run survives 11 of the 262 boundary phases.

A combined token-multiset / boundary-phase calculation gives:

```text
mean expected consecutive runs across all 41 source positions = 0.0885100939230654
mean specific FGL pair probability over boundary phases       = 0.0026115921082173342
```

These are finite structural calibrations. They are not authorship probabilities.

## Decision

The chain remains useful as historical receiver-selection context because its three actual logical edges and the two-edge FGL run reproduce exactly. Its evidential role is narrower after this audit.

The sealed DEVOTED -> LIBER transfer fails, and familywise controls produce comparable two-edge runs often enough that the literal+numeric grammar is not licensed as a reusable navigation operator. In particular:

- do not use a new literal p50 digit-letter relation to select another unknown-page plaintext;
- do not use FOUND -> GOOD -> LUCK navigation as independent proof of the candidate letters;
- preserve the exact candidate inverse evidence, shell compression, and other source-local relations on their own merits;
- require a new source-authenticated output type before using p50 literal tokens as a general plaintext router.

This completes the negative fork in Director #1739.

## Reproduction

Run:

```text
node sims\\lp2_found_good_luck_navigation_familywise_audit_sft.cjs
```
