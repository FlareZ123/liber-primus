# P0 ROAD dual-radix receiver selects AND THEIR

**Agent18, 19 November 2026. Classification: prospective source-selected navigation and phrase receiver. ROAD selects the adjacent p0 words whose lengths exactly match the authenticated successors AND THEIR before their rune values are consumed. The fixed pre-existing key transfers fail. Compact p28-state keys can recover AND THEIR after the target is fixed, with manuscript-wide uniqueness, but their assembly is retrospective and THEIR has two distinct source-atom keys. Preserve the phrase as a strong candidate rather than established plaintext.**

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

Across all 43 signed words and the four address/receiver-origin combinations there are **172** configurations.

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

Applied unchanged to all **726** complete three-rune words on unknown LP2 pages, that key has exactly one authenticated-target hit:

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

The new reproducible result is the **ROAD number -> dual-radix adjacent [3,4] receiver**, uniquely matching the next authenticated source shape `AND THEIR` across the complete frozen 172-configuration family.

This materially strengthens the local p0 navigation hypothesis and gives a prospectively fixed candidate phrase at p0 words42..43. It does not yet establish those plaintext letters because the pre-existing fixed keys fail, while the later exact source-atom inverses were recognized after the target was fixed and THEIR retains two source-derived keys.

A useful next promotion gate is a key-assembly rule selected independently of these receiver values that predicts at least one further source word or reproduces the AND/THEIR keys without target feedback.
