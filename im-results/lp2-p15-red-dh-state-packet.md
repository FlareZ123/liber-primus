# P15 red spans encode a source-only DH23 state packet and cross-segment with p6

**Agent 2, 28 November 2026. Classification: new original-artifact state-serialization evidence plus one prospectively frozen cipher negative. No unknown LP2 plaintext, authenticated unknown-page key, complete inverse, or continuation endpoint is recovered.**

## Decision

Physical p15 contains two red rune spans separated in the page design by the proved 4×4 Fibonacci/prime number grid and the infinity mark. In canonical rune order they are adjacent spans at offsets 0..8 and 9..19. Both are bounded by red 13-dot punctuation; the lower span is 11 runes long. The complete original red-span census already established that **p6 and p15 are the only two 11-rune red spans double-bounded by red 13-dot marks**.

Treat each printed red word with three elementary GP29 observables:

- **L** = printed rune length;
- **S** = GP0 sum modulo 29;
- **P** = GP0 product modulo 29.

The five p15 red words then give, in natural physical reading order,

```text
            L   S   P
top W1      4  11   0
top W2      5   8  26

lower W1    4  22  10
lower W2    2   6   5
lower W3    5   5   0
```

Against the independently reconstructed DH23 state

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3, q=4, F=0
```

the same table reads

```text
top W1      (q, A^-1, F)
top W2      (g, A,    B^-1)

lower W1    (q, p-1,  K*g)
lower W2    (K, a,    g)
lower W3    (g, g,    F)
```

This is **not** a plaintext claim and the labels were recognized after the state was known. The important new fact is that the underlying relations are source-only, internally redundant, and unusually constrained before any DH names are attached.

## Source-only internal packet

Forget the DH labels. Call the five descriptor triples `a,b,c,d,e`. Natural order satisfies all of:

```text
a.L = c.L
b.L = e.L
e.S = b.L
d.P = b.L
a.P = e.P = 0
a.S * b.S = 1 mod29
c.P = d.L * b.L mod29
```

The standalone census tests **every same-page consecutive five-word window** in the canonical 58-page LP2 transcription. The only hit is p15 starts

```text
[0,4,9,13,15].
```

Natural order is also the sole one of all **5! = 120** permutations of the five observed descriptors satisfying the frozen relations. Charging only the eight obvious physical orientations of the two red spans gives the same result: only top-to-bottom, left-to-right order passes.

The lower p15 three-word descriptor sequence

```text
[(4,22,10), (2,6,5), (5,5,0)]
```

is itself unique among every same-page consecutive three-word window. Its five other word-order permutations have zero exact hits.

These are post-discovery finite-family diagnostics, **not discovery-wide p-values or authorship probabilities**.

Reproducer: `sims/lp2_p15_red_dh_state_packet_sft.cjs`.

## The p6 twin exposes the same state through native sums and products

The p6 lower red11 twin has native printed lengths `[4,1,4,2]`. Its four word descriptors are

```text
            L   S   P
p6 W1       4  13  13
p6 W2       1  19  19
p6 W3       4   7  14
p6 W4       2  26  23
```

The **sums** are exactly

```text
[13,19,7,26]
= [b-K, B, g+K, B^-1],
```

while the **products** are exactly

```text
[13,19,14,23]
= [b-K, B, -b, p].
```

Again, arbitrary DH-expression naming is cheap because the state algebra is highly saturated. These equalities matter here because the *same elementary product statistic* is already independently selected by the p7 five-red-word inverse register, and p6/p15 are independently selected as the only double-13-bracketed red11 pair.

## Mutual cross-segmentation of the two red11 twins

The strongest new cross-page consequence is obtained without fitting a rune key.

### P15 word lengths segment p6

The lower p15 span has printed lengths

```text
[4,2,5] = [q,K,g].
```

Use those three lengths, in printed order, to partition the eleven p6 red runes. Take GP29 products of the resulting segments, exactly the statistic already used by the established p7 product register:

```text
p6 under p15 [4,2,5] segmentation
products = [13,27,15]
         = [b-K,-K,b].
```

Applying the repository's pre-existing outside-in

```text
H3(x,y,z) = (x-z, y, x+z) mod29
```

gives

```text
H3([13,27,15]) = [27,27,28].
```

This last H3 observation is recorded only as a compact consequence; the p15/p6 pairing does not independently authenticate H3.

### P6 word lengths segment p15

Transfer the p6 native lengths in the other direction:

```text
p6 lengths = [4,1,4,2].
```

Partition p15's lower red11 span by those lengths and again take segment products:

```text
p15 under p6 [4,1,4,2] segmentation
products = [10,5,12,0]
         = [K*g,g,a*K,F].
```

Thus the two uniquely paired red11 objects are not merely equal-length ornaments: **each one's native word-boundary pattern turns the other's raw eleven runes into a low-complexity packet in the same independently reconstructed DH23 state**.

This is the main positive result of this invocation.

## A natural q-block key use was frozen before grading and fails

The new four-scalar packet

```text
[10,5,12,0] = [K*g,g,a*K,F]
```

has exactly four lanes. That suggests one immediate low-flexibility test against the two already target-blindly selected p6 q-block receiver sets.

The source-only preregistration fixed:

```text
block1 pages   [32,33,34,35]
starts         [30,132,4,25]
arities        [3,4,2,5]

block3 pages   [37,38,39,40]
starts         [146,57,132,71]
arities        [4,6,5,4]
```

and used the four packet scalars as **one constant additive key per lane**, reusing the same four-lane schedule on both q blocks. The only charged freedom was global additive sign.

Chronology:

1. source-only decoder committed: `2210d346963440fa7002804002999e9737bad6cc`;
2. complete raw inverses for both signs committed, still without target plaintext: `902056616e926958043972fa8054665088e99a22`;
3. only then was the authenticated 2016 signed-source target read and graded.

The target words are

```text
block1: YOU WILL BE FOUND
block3: LUCK BEWARE FALSE PATHS
```

with GP-rune arities exactly

```text
[3,4,2,5] and [4,6,5,4].
```

Post-freeze result across all **33 target runes**:

```text
sign +1 : 2 / 33 rune positions, 0 / 8 complete words
sign -1 : 0 / 33 rune positions, 0 / 8 complete words
```

So the literal “cross-segment products are the four q-block lane shifts” model is rejected. Do **not** rescue it by adding phases, word-specific signs, exceptions, or fitted scalar transforms.

Pretarget reproducer: `sims/lp2_p15_crossseg_qblock_pretarget_sft.cjs`  
Frozen output: `im-results/lp2-p15-crossseg-qblock-pretarget-output.json`  
Post-freeze grader: `sims/lp2_p15_crossseg_qblock_grade_sft.cjs`

## What this changes

The DH-state serialization is no longer confined to the p6/p7 reversed-boundary/product observations. A second original mathematical page, p15, contains a **self-consistent five-word descriptor packet** that reconstructs most of the same state through length/sum/product relations, and its uniquely paired red11 layout composes with p6 in both directions.

That materially strengthens the interpretation that these red mathematical objects share a state vocabulary. It does **not** yet say how that state acts on encrypted body text.

The correct next gate is therefore narrow:

1. seek a source-visible operation or receiver that specifically consumes the p15/p6 mutual packet;
2. require a prediction on an original object not used to recognize these relations;
3. freeze the complete operation before plaintext grading;
4. reject another generic additive/H/state-expression expansion absent a new authored selector.

The tempting direct q-block additive consumer has already been killed here, so the structural positive should not be inflated into a decoder claim.
