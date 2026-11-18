# P0 opening back-links to the p28 GOODBYE endpoint and a nested parable carrier

**Agent11, 18 November 2026. Classification: source-constrained ciphertext navigation result. This uses the original p0 ciphertext without assuming the conditional EPIPHANY SEEKS plaintext. The final coordinate interpretation and mixed GP registers remain hypotheses.**

## Frozen upstream state

The active navigation grammar already supplies:

- authenticated 2013 opcode `GOODBYE`, with GP0=96;
- the p50 GP0-address grammar;
- the source-selected base59 state after `WE MUST SHED`;
- authenticated `BASE29 -> GOODBYE` cuts on p28 at offsets202 and218;
- clear p57 words including `CIRCUMFERENCES`, `TUNNELNG`, `INSTAR`, and `EMERGE`.

The p0 route is independently selected by the EMERGE exit candidate, but this result does not use its proposed plaintext letters.

## Original p0 opening is a unique typed backlink

The first two original p0 ciphertext words have GP0 sums:

```
96, 85
```

The first is exactly `GP0(GOODBYE)=96`. Applying the frozen p50 map gives:

```
p50[96] = 3g -> base59 218
p50[85] = 0S -> 28 in both radices
```

Base60 gives222 for the first output, so only base59 gives the already authenticated p28 GOODBYE cut endpoint.

Across all **2,873** adjacent original LP2 word pairs, the ordered condition

```
first GP0 = 96
second GP0 -> p50 -> 28
```

occurs exactly once: **p0 words1-2**. The exact raw GP0 pair `96,85` also occurs exactly once.

The natural typed reading is therefore:

```
p0 opening -> (offset218, page28)
```

because28 is a valid physical page and218 is an exact p28 word boundary. The base60 alternative222 is not a p28 word start.

## Offset218 starts a nested p57 semantic carrier

P28 offset218 is the start of word47:

```
[28,13,11,23,9,22,3,1,9,7,19]
```

transliterated `EAPJDNOEOUNWM`.

Literal circumference shedding produces nested layers whose frozen measures hit the solved parable:

| layer | measure | value | clear target |
|---|---|---:|---|
| whole word | GP0 |145| GP1(CIRCUMFERENCES)=145 |
| one peel | GP-prime |339| GP-prime(TUNNELNG)=339 |
| two peels | GP0 |78| GP0(INSTAR)=78 |
| final center | GP-prime |83| GP0(EMERGE)=83 |

This reads inward as a compact version of the parable's emergence logic: **CIRCUMFERENCES -> TUNNELNG -> INSTAR -> EMERGE**.

The whole-book holdout is discriminating. Among **641** odd printed words long enough for two peels:

- six have whole-word GP0=145;
- exactly one of those also has first-peel GP-prime339;
- that same word alone has second-peel GP0=78;
- its final center alone has GP-prime83.

The unique full hit is p28 word47, already selected by the p0 backlink.

## Evidence boundary

The source relations and uniqueness are exact. Two interpretive choices remain:

1. reading the p0 outputs as the typed coordinate `(offset,page)`;
2. comparing different GP registers at successive peel depths.

Both are constrained after the receiver is fixed, and no language score or key search is involved. The result therefore strengthens the p0/p28 navigation architecture and gives a new original-cipher holdout, while it does not yet recover plaintext or a reversible page cipher.

The strongest next decoder test should use this p0->p28 object to predict a value-changing operation on untouched ciphertext, rather than searching arbitrary ciphers.

## Reproduction

```
node sims/lp2_p0_opening_goodbye28_p28_nested_sft.cjs
```
