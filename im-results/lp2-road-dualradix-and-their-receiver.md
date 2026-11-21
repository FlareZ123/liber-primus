# P0 ROAD dual-radix receiver selects AND THEIR

**Agent18, 19 November 2026. Classification: prospective source-selected navigation receiver with later ambiguity reconciliation. ROAD selects adjacent p0 words whose lengths match authenticated successors AND THEIR before their rune values are consumed. Later work compresses their post-target DH keys, while an independent PATHS route reaches the same four-rune receiver and THEIR fails the solved-control ordinal self-index holdout. A separate ROAD zero-bracket extends the source-only geometry to a seven-rune NUMBERS-shaped receiver, where the distinct-DH-field inverse family fails completely. Preserve the navigation geometry as the strongest result; AND/THEIR remain candidate letters.**

## Chronology and sealed target

The receiver and target were frozen in:

- `workplace/agent18-road-dualradix-and-their-precommit.md`
- precommit `c88cec29190070d4eb7013069499c7c220681745`

before this invocation consumed the p0 rune values at offsets 189..195.

Upstream work had already recovered candidate `THE ROAD` and Agent11 had already fixed ROAD's base29-number direction fact:

```
ROAD GP = [4,3,24,23]
base29(ROAD) = 100798
100798 mod 256 = 190
```

The authenticated 2016 source continues:

```
... THE ROAD, AND THEIR NUMBERS ...
```

so the next two alphabetic targets are prospectively fixed as `AND THEIR`, with GP lengths 3 and 4.

## Unique source-only dual-radix landing

Use the exact operation family suggested by the 2016 statement that word numbers are the direction:

1. take each authenticated signed word's GP sequence as a base29 numeral modulo256;
2. charge both zero-origin and one-origin p50 address conventions;
3. read the selected p50 token in both documented live numeral alphabets, base59 and base60;
4. charge a shared zero-origin or one-origin receiver convention;
5. require the base59 and base60 outputs to be starts of adjacent p0 words, in that order;
6. before reading receiver runes, require those two p0 word lengths to equal the next two authenticated signed-word GP lengths.

Across all **41 signed words that have two following alphabetic words** and the four address/receiver-origin combinations there are **164** configurations.

Fourteen configurations land the two radix outputs on adjacent p0 word starts. Exactly **one** also matches the next-two-word source lengths:

```
source word       ROAD (signed index23)
number mod256     190
address origin    one
p50 zero index    189
token             3C
receiver origin   zero

base59(3C)        189 -> p0 word42 start189, length3
base60(3C)        192 -> p0 word43 start192, length4

next source words AND THEIR
next GP lengths   3   4
```

Thus ROAD's number and the two live radices select the exact adjacent source shape `AND THEIR` without scoring English or opening the receiver values.

The raw p0 receivers, opened only after the precommit, are:

```
word42 offsets189..191 = [0,6,9]
word43 offsets192..195 = [19,12,20,9]
```

## Sealed fixed-key transfers fail

The precommit first required transfer of keys that already existed before these receiver values were opened.

The established earlier AND key:

```
[HERE[a], DH[p], b] = [10,20,15]
```

gives

```
[0,6,9] - [10,20,15] mod29 = [19,15,23] = MSD
```

rather than AND.

The four frozen four-rune keys also miss THEIR:

```
ROAD [12,5,1,4]      -> WWMC
WILL [12,6,18,27]    -> WGTHJ
GOOD [18,18,23,20]   -> UDYE
LUCK [17,16,4,22]    -> THAETT
```

This is a genuine negative transfer. The phrase candidate must not be promoted by pretending an old key worked.

## Post-target source-atom audit

After the prospectively fixed target was opened, the exact additive differences were inspected.

The p28 state is already fixed:

```
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2)
```

and the selected HERE/DH lines provide one-based state-index lookups.

Define the deliberately broad **source-atom set** of 21 labeled atoms:

- seven direct DH-state values;
- seven `HERE[field]` values;
- seven `DH[field]` values.

Each key slot independently chooses one atom, and both additive signs are charged. This family is intentionally broader than the compact representations below.

### AND

The exact required subtraction key is

```
[5,26,15] = [g, HERE[p], b]
```

with the alias `g = HERE[K] = 5`.

The complete three-slot family contains:

- 18,522 labeled configurations;
- 9,826 distinct numeric key/sign operations.

Against every distinct authenticated three-rune 2016 target, the selected receiver has five distinct authenticated-target operations total. **AND has exactly one distinct numeric key**, the key above.

Applied unchanged to all **726** page-local three-rune fragments on unknown LP2 pages, that key has exactly one authenticated-target hit. The page-local count includes ten incomplete page-edge fragments; the canonical cross-page parser contains 716 complete three-rune words:

```
p0 word42 offsets189..191 -> AND
```

### THEIR

One compact subtraction key is

```
[17,23,10,5]
= [HERE[g], p, HERE[a], HERE[K]]
```

with the last slot also representable as direct `g=5`.

A second distinct source-atom operation also yields THEIR:

```
[12,6,19,24] with addition
= [DH[a], a, B, DH[g]]
```

The complete four-slot family contains:

- 388,962 labeled configurations;
- 167,042 distinct numeric key/sign operations.

Against every distinct authenticated four-rune target, there are three distinct authenticated-target operations total; **THEIR has two distinct numeric keys**, the two above.

Each of those two exact keys, applied unchanged to all **514** complete four-rune unknown-page words, hits an authenticated target exactly once:

```
p0 word43 offsets192..195 -> THEIR
```

The two target keys do not occur as literal contiguous substrings of the selected HERE line, DH line, or their frozen outside-in H serializations. No common line-fragment key assembly has been recovered.

### Later distinct-field compression

Agent15 subsequently charged a stricter family that uses **distinct DH field labels** and lets each slot independently choose direct, HERE or DH lookup, under both signs.

- AND: 7P3 × 3^3 × 2 = **11,340** configurations. Only two distinct authenticated operations survive: AND under `[g,p,b]` / `[direct,HERE,direct]` and ARE under another field sequence. The sealed target therefore leaves the same AND key `[5,26,15]`.
- THEIR: 7P4 × 3^4 × 2 = **136,080** configurations. Exactly one authenticated operation survives in the entire family: `[g,p,a,K]` / `[HERE,direct,HERE,HERE]` = `[17,23,10,5]`, subtracting to THEIR.

This removes the second repeated-field THEIR key from the broader source-atom audit and materially narrows the post-target freedom. The lookup masks remain retrospective. See `im-results/lp2-road-and-their-distinct-state-key-family.md`.

## Later reconciliation: exact letters remain unresolved

Three later checks separate receiver evidence from plaintext evidence.

### State56 ordinal transfer supports the address, not the word AND

The solved-p56 control authenticates the literal self-index consumer `nX`: at the word's GP0 address, the current page rune must be the nth X seen from page start.

For AND:

```
GP0(AND)=56
p50[56]=4E
p0[56]=E, exactly the fourth E
```

This is a genuine transfer. It does **not** identify AND uniquely because authenticated MAP and SEEK also have GP0=56 and therefore inherit the identical `4E` event. State56 is independently important, but the ordinal hit belongs to the number rather than one lexical preimage.

THEIR does not transfer:

```
GP0(THEIR)=34
p50[34]=3H
p0[34]=N
H-count through offset34 = 1
```

so the solved-control self-index consumer rejects the literal `3H` continuation.

### Same receiver has an independent PATHS alternative

Agent1 independently selected p0 word43 / offsets192..195 through NUMBERS and IS boundary edges, then charged a 32-key DH packet family across all p0 four-rune words. Its sole authenticated hit is PATHS. Agent1 explicitly ranks that word43 PATHS route below an earlier PATHS receiver because its raw-cipher return is weaker, yet it is a concrete counterexample to treating a target-family unique hit at word43 as decisive plaintext evidence.

See `im-results/lp2-p0-paths-dual-boundary-alternative.md`.

### ROAD zero bracket extends geometry to NUMBERS, while the inverse fails

Independent ROAD-key work selects the two literal p50 `00` cells:

```
192, 229
```

Their strict interior has length36. Starting from the already selected p0 word43 start gives:

```
192 + 36 = 228
```

and p0 offset228 is exactly the start of a seven-rune word. Thus ROAD now supplies a source-only receiver-length chain:

```
p0 189 length3
p0 192 length4
p0 228 length7

signed successors:
AND   THEIR   NUMBERS
3     4       7
```

The first two positions were sealed before their values were opened. The 228 receiver value test is **not blind in this invocation**, because its ciphertext had already been exposed during boundary checking.

To avoid rescue by a tuned key, apply the exact distinct-field grammar already defined independently by Agent15: every permutation of all seven DH field labels, every direct/HERE/DH lookup mask, and both signs. This is

```
7! × 3^7 × 2 = 22,044,960
```

labeled configurations. Against all authenticated seven-rune signed targets `DEVOTED / NUMBERS / OPENPGP`, the p0 word51 receiver at228 has **zero operations**.

The ROAD zero-bracket therefore strengthens the navigation/shape route and simultaneously rejects a direct transfer of the current distinct-field value-changing grammar to NUMBERS.

See `im-results/lp2-p50-2016-empty-path-zero-bracket-gate.md`.

## Downstream stop

The obvious next plaintext-number navigation does not continue:

```
GP0(THEIR) = 34
p50[34] = 3H
base60 = 197
base59 = 194
```

The relevant p0 locations lie in a five-rune word and in the already selected four-rune word, while the next authenticated source word `NUMBERS` has seven GP runes. This bounded one-hop continuation therefore fails.

## Decision

The new reproducible result is the **ROAD number -> dual-radix adjacent [3,4] receiver**, uniquely matching the next authenticated source shape `AND THEIR` across the complete frozen 164-configuration family.

This materially strengthens the local p0 navigation hypothesis. Later evidence strengthens that conclusion while making the literal word43 plaintext less certain: Agent15 compresses the AND/THEIR post-target keys, Agent1 supplies an independent PATHS inverse at the same word43 receiver, THEIR fails the solved-control ordinal self-index, and the ROAD zero bracket extends the source-only shape through a seven-rune NUMBERS receiver whose full distinct-field inverse family is null.

The productive promotion gate is therefore **receiver-specific prediction**. A key/state transition must be selected independently of word43 values and distinguish THEIR from PATHS, then predict a fresh receiver or exact plaintext before its values are consumed. The navigation geometry should not be conflated with a solved plaintext assignment.
