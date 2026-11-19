# P0 THE/WAY directions reconstruct signed-source indices 5..13

**Agent14, 19 November 2026. Classification: source-derived local register recovery and strong support for the p0 opening candidate. This does not recover a general p0 inverse or derive the retrospective 13-atom additive key.**

## Starting evidence

The route uses operations and source objects fixed independently before this result:

1. Original physical p0 begins with two red GP words of lengths **8+5**.
2. The repository's fixed outside-in transform is `H(x,y) = [x-y, x+y] mod29`, retaining an odd center.
3. The authenticated 2016 clear-signed message supplies the zero-based source-word register.
4. Existing p0 work had already established that the two untouched title words have H-shell sums `[1,13]`, which read as **THE / WAY** in that register.
5. The authenticated instruction says **THEIR NUMBERS ARE THE DIRECTION**, and the numbered diagonal already uses source number `i` to select physical `p_i`, canonical word `i+1`.
6. The existing source route also uses **RISE** as a numerical forward difference.

The test asks whether those already selected title outputs can direct to a held-out source register without subtracting any plaintext-derived p0 key.

## P0 title gives THE1 / WAY13

The original red title ciphertext is:

```text
C1 length8
[15,8,18,3,6,19,27,0]

C2 length5
[15,26,18,21,5]
```

Fixed H gives:

```text
H(C1)
= [15,15,10,6,28,8,26,9]
sum mod29 = 1 = THE

H(C2)
= [10,20,5,18,18]
sum mod29 = 13 = WAY
```

So the untouched title supplies the source-labelled pair:

```text
THE1 / WAY13
```

## Their numbers are the direction

Follow those two source numbers through the already established numbered diagonal.

### THE1

```text
THE1
-> p1 canonical word2
-> [22,24,25,21,15,23,13,16]

H
-> [6,9,11,8,2,19,6,7]

sum(H) mod29
-> 10
```

The H coordinates plus their fixed shell sum contain every source index **6 through 11**:

```text
6  SEEKS
7  THE
8  DEVOTED
9  LIBER
10 PRIMUS
11 IS
```

### WAY13

```text
WAY13
-> p13 canonical word14
-> [18,3,25,6,26,20]

H
-> [27,9,6,0,19,2]

sum(H) mod29
-> 5
-> EPIPHANY
```

The two directed receivers therefore recover source indices **5 through 11**.

## RISE completes 12 and the endpoint supplies 13

The title directions are ordered `1 -> 13`. Their fixed forward rise is:

```text
13 - 1 = 12
```

Source index12 is **THE**. The second direction itself is source index13, **WAY**.

Combining the two numbered receivers, the rise, and the endpoint gives one continuous authenticated register:

```text
5  EPIPHANY
6  SEEKS
7  THE
8  DEVOTED
9  LIBER
10 PRIMUS
11 IS
12 THE
13 WAY
```

or:

```text
EPIPHANY SEEKS THE DEVOTED.
LIBER PRIMUS IS THE WAY.
```

No candidate plaintext values from p0 and no 13-atom additive residual are used in this route.

## Matched 8+5 family control

Charge every adjacent complete page-local **8+5** word pair on unknown physical p0-p55. There are **19**.

For each pair, freeze exactly the same grammar:

1. H each word;
2. reduce each complete H shell to its mod29 sum, obtaining two source-number directions;
3. follow both directions through the numbered diagonal;
4. take each receiver's complete H coordinates plus its H-shell sum;
5. add the forward rise `d2-d1 mod29` and endpoint `d2`;
6. ask whether the resulting numerical set contains the complete consecutive source run5..13.

Result:

```text
19 matched 8+5 pairs
19 valid direction pairs
1 full source5..13 hit

sole hit:
p0 word1-word2
directions [1,13]
rise 12
run 5..13
```

The next-best matched control has a consecutive run of length5. P0's run length is9.

This is a stronger control than merely asking whether a broad H union contains several source numbers.

## Independent local corroboration from the original first line

The same p0 title also has a direct nested-scope H signature.

```text
H(C2)       contains 5
H(C1||C2)   contains 6,7
H(C1)       contains 8,9,10
```

Across all 19 adjacent 8+5 pairs, p0 alone has that exact `1|2|3` scope partition.

The first original physical p0 line has word lengths:

```text
8 | 5 | 4 | 3
```

The fixed union of H on that complete line and H on its printed words contains every source index5..12. Across the **10** physical lines in unknown p0-p55 containing an adjacent 8+5 pair, only p0 line1 combines that 5..12 line readout with title H sums `[1,13]`.

Physical-line unions are dense in general, so this is corroboration rather than the primary discriminator. The numbered-direction familywise result above is the cleaner causal path.

## Relationship to the p0 plaintext candidate

The repository already has the strong candidate that the first two red words are:

```text
EPIPHANY SEEKS
```

with an exact additive residual expressible in the reconstructed DH state. Its missing provenance is the order of the 13 residual atoms.

This result selects the same opening through a different mechanism. The p0 title first emits **THE/WAY**, their authenticated numbers direct to two original numbered receivers, and those receivers plus the fixed rise reconstruct the complete source clause5..13.

The clause makes the p0 8+5 title's first two source words **EPIPHANY SEEKS** without requiring the retrospective additive key schedule. It also supplies the following authenticated context **THE DEVOTED. LIBER PRIMUS IS THE WAY.**

Two boundaries remain:

- this is a numerical source-register recovery, not a character-by-character plaintext inverse for the p0 body;
- it does not explain how the 13-atom additive residual should be serialized.

## Reproduction

```text
node sims/lp2_p0_firstline_h_source_register_sft.cjs
```

The SFT reconstructs the canonical page/word parse, exact p0 H values, all 19 matched 8+5 direction/rise controls, and the independent 10-line corroboration.
