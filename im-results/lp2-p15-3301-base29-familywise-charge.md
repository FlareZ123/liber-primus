# P15 3299→3301 is generator-authenticated; the `+K`/BASE29 semantics are not independent evidence

**Agent1, 28 November 2026. Classification: bounded source-only familywise charge for Director issue #3431. No unknown plaintext, body key or unique descriptor→DH role map is claimed.**

## Decision

The exact numerical bridge from physical p15 to **3301** is real and independently source-supported, but not for the reason the earlier dual-example report implied.

The p15 number-grid mechanism was solved on 11 November:

```text
N(n) = |3301 - prime(distinctFibonacci[n] + 1)|.
```

Its red-origin spiral begins

```text
selected primes  [2, 3, 5, 7, 13, 23]
printed cells    [3299,3298,3296,3294,3288,3278].
```

Therefore

```text
3299 + 2 = 3301
```

is already the first inverse step of the established grid generator, before any DH role names are attached. The same established mechanism gives five immediate controls:

```text
3298 + 3  = 3301
3296 + 5  = 3301
3294 + 7  = 3301
3288 + 13 = 3301
3278 + 23 = 3301.
```

So p15 **does independently select the Cicada anchor 3301** through its solved number-grid mechanism. What it does not independently establish is that the first offset `2` should be called the DH shared key `K`, or that the page instructs a solver to run the 2013 `BASE29` command on that anchor.

The authenticated historical source still matters: it contains the worked command `BASE29 3301 -> 3QO`. That is a genuine historical cross-reference to the same independently recovered number. But it is not fresh evidence selecting the ambiguous p15 descriptor→DH role map, and it has no currently held-out p15 BASE29 consequence.

## Familywise raw-offset charge

To test whether `3299 + 2 = 3301` is uniquely striking even before invoking the already-solved generator, charge every one of the 16 original grid cells against a deliberately small, source-visible signed offset family.

The offset labels are frozen before scoring:

- structural counts: upper-red word count `2`, lower-red word count `3`, total red-word count `5`, grid side `4`, red-dot bracket count `13`, physical page index `15`;
- each red word's elementary `(L,S,P)` descriptors, which are source-only observables already used elsewhere in the p15 analysis;
- both signs for every value;
- no DH labels, state expressions or historical command outputs.

This gives `16 × 21 × 2 = 672` labeled candidates. There are **9 labeled hits across four distinct grid cells**:

```text
3299 + 2  = 3301   top word count
3299 + 2  = 3301   lower W2 length

3298 + 3  = 3301   lower word count

3296 + 5  = 3301   total red-word count
3296 + 5  = 3301   top W2 length
3296 + 5  = 3301   lower W2 product
3296 + 5  = 3301   lower W3 length
3296 + 5  = 3301   lower W3 sum

3288 + 13 = 3301   red-dot count
```

Even the **structural-count-only** subfamily already has four different grid cells that land on 3301. Thus a post-hoc search for “small p15 number which makes some grid cell equal 3301” is non-identifying.

The red ink does independently select 3299 among those cells. Once that red origin is fixed, the required offset is 2. But p15 itself offers at least two raw origins for that same value (`top_word-count=2` and `lower-W2-length=2`) before the much stronger established explanation is used: **2 is the first selected prime of the grid generator**. That generator explanation is the source-supported one because it continues unchanged over all sixteen cells.

## BASE29 consequence

The ordinary positional conversion is exact:

```text
3299 = [3,26,22]_29 = 3QM
3301 = [3,26,24]_29 = 3QO.
```

The historical server example authenticates `3301 -> 3QO`. It does not authenticate the semantic labels previously attached to these digits:

```text
3299 = [e,B^-1,p-1]
3301 = [e,B^-1,-g].
```

Those names inherit the p15 state vocabulary whose descriptor provenance remains non-identifying after #3399 and #3422. Numerically the digit vectors are correct; semantically they are conditional.

There is also no fresh held-out BASE29 output available from this bridge. The generator's next fifteen cells are strong held-outs for the **3301/Fibonacci-prime mechanism**, but they do not test BASE29: they were already the evidence that established the generator. Converting another known integer to base29 would be deterministic arithmetic, not a new manuscript prediction.

## Consequence for the solve path

The clean causal statement is now:

```text
original red 3299
  -> established red-origin Fibonacci/prime spiral
  -> independently recovered anchor 3301
  -> historical recognition: authenticated Cicada command BASE29 3301 -> 3QO.
```

That is a plausible human clue path from p15 to the historical 2013 source. It should replace the stronger claim

```text
3299 + K = 3301
```

as evidence for the p15 DH role assignment.

Accordingly:

- **preserve** p15→3301 as established original-artifact evidence;
- **preserve** the 2013 `BASE29 3301 -> 3QO` command as a historically exact cross-reference and a reason BASE29 is a legitimate Cicada operation;
- **downgrade** `+K` and the digit labels `[e,B^-1,p-1] -> [e,B^-1,-g]` to conditional state-compatibility notation;
- do **not** use this worked example to select among p15 descriptor-role maps or to justify new body-key layers without a separate authored consumer.

This resolves the familywise ambiguity without discarding the genuine 3301 convergence.

## Reproduction

Run:

```text
node sims/lp2_p15_3301_base29_familywise_charge_sft.cjs
```

The SFT reconstructs the first six generator inversions, exhausts the 672 raw signed offset candidates, verifies the nine labeled/four-cell collision count, isolates the red-origin offset-2 ambiguity, and verifies `3299=3QM` / `3301=3QO`.