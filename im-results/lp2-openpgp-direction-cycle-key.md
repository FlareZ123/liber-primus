# OPENPGP key from the two authenticated signed-word direction cycles

**Agent25, 19 November 2026. Classification: source-derived post-discovery key compression for the p0 OPENPGP candidate; stronger than the prior fitted segment formula, but still below established-plaintext status because an independent seven-rune holdout failed.**

## Frozen upstream

Use the already frozen authenticated-word direction rule:

```text
s_i = low60(p50[i]) - i - GP_length(word_i) mod29
```

and the independently reconstructed p28 DH state:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2, e=3
```

The direction graph on the first 29 authenticated words has exactly two cycles:

```text
HELLO -> MAP -> ROAD -> HELLO
THE   -> SEEKS -> AND -> THE
```

The original p50 low digits at those cycle nodes are:

```text
HELLO MAP ROAD = [23,15,27] = [p,b,-K]
THE SEEKS AND  = [1,6,20]   = [a-g,a,p-e]
```

No unknown LP2 ciphertext is used to obtain either cycle or these six raw values.

## One source-state shell

Use the already frozen H orientation on the endpoints of the first cycle:

```text
H(p,-K), b
= [p+K,p-K,b]
= [25,21,15]
```

For the second cycle, reverse its raw three-value serialization and insert the source exponent action `a^e mod29` between `a` and `a-g`:

```text
[p-e, a, a^e, a-g]
= [20,6,13,1]
```

because `6^3 mod29 = 13`.

Together:

```text
[25,21,15,20,6,13,1]
```

This is exactly the previously published outside-in H shell of the p0 OPENPGP candidate key.

Invert that odd H shell:

```text
[23,3,24,1,18,17,27]
```

which is exactly the seven-rune additive key previously discovered from the target word.

## Charged family

Two finite charges prevent treating the exact serialization as an uncounted free choice.

Across all **256** nearby signed-word arithmetic/length conventions already used in the state-bridge audit, only **two algebraically equivalent syntactic modes** reproduce both semantic 3-cycles. Both require GP length, zero-addressed base60, the low token component, subtraction of word number, and subtraction of word length. They differ only by the cancelling `digitOrigin/numberOrigin` pair. The canonical zero-origin form alone preserves the raw cycle values above and therefore the exact shell.

For the final source-state serialization, charge:

- first cycle: two endpoint orientations × three positions for the center = **6** forms;
- second cycle: source/reversed order × six members of the established cube orbit × four insertion positions = **48** forms.

Among **288** combined forms, exactly **one** yields the seven-coordinate OPENPGP shell: normal first-cycle endpoints with the center last; reversed second-cycle raw order, exponent `e=3`, with the powered center inserted third.

This is a finite post-discovery family charge, not a discovery-wide p-value.

## Exact original-cipher consequence

The receiver is independently source-selected:

```text
GP0(OPENPGP)=75
p50[75]=2v
base60(2v)=177
p=23 => centered packet starts at p0 offset166
```

The first seven original runes at offsets166..172 are:

```text
[26,16,13,10,2,23,11]
```

Subtract the direction-cycle-derived key:

```text
[26,16,13,10,2,23,11]
-
[23,3,24,1,18,17,27]
mod29
=
[3,13,18,9,13,6,13]
=
OPENPGP
```

Thus the OPENPGP segment no longer needs its earlier coordinate-by-coordinate DH expression to supply the key.

## Independent holdout

The same derived seven-rune key was applied, without retuning, to the independently selected p0 ROAD/NUMBERS receiver at offsets228..234.

Subtraction yields GP indices:

```text
[2,12,2,0,19,16,18]
```

and addition yields:

```text
[19,18,21,2,26,21,14]
```

Neither is recognizable GP-native plaintext. This is a failed holdout for treating the derived key as a reusable seven-rune packet key.

## Decision

Upgrade the **OPENPGP segment only** from a target-fitted DH inverse to a source-derived candidate key. The exact receiver, key and candidate plaintext now arise from one cross-source chain:

```text
authenticated 2016 words
-> p50 low-digit direction graph
-> two semantic cycles
-> p28 DH state identities + H/cube
-> exact seven-rune key
-> source-selected p0 receiver
-> OPENPGP
```

The other warning-packet segments PATHS, VERIFY and BEWARE still lack a shared source-selected key generator. The failed NUMBERS holdout also blocks promotion of OPENPGP to established plaintext. The next useful test is a genuinely independent receiver or a source rule that derives another packet key before its plaintext is inspected.

## Reproduction

```text
node sims/lp2_openpgp_direction_cycles_key_sft.cjs
```

Windows Node22 workflow **44448342113** passed on commit `c0af05e4dcd16abf1f0eccf5831bb5d5b74a734a`.
