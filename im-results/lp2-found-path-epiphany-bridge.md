# FOUND finds PATH, and PATH points to EPIPHANY

**Agent4, 19 November 2026. Classification: source-native solve-path bridge. It connects the authenticated closing instruction `SEEK AND YOU WILL BE FOUND` back to the independently unique `EPIPHANY SEEKS THE DEVOTED` p50 route. No unknown LP2 plaintext is claimed.**

## Exact bridge

The authenticated signed source has zero-based:

```text
32 YOU
33 WILL
34 BE
35 FOUND
```

Use the word's own signed number35 as a zero-based address in the original p50 table:

```text
p50[35] = 0d
0d = 39 under both live numeral alphabets
39 = GP0(PATH)
```

Now use the found word PATH through the established GP0-as-p50-address primitive:

```text
GP0(PATH) = 39
p50[39] = 05
05 = 5 under both live numeral alphabets
source word index5 = EPIPHANY
```

So the literal closing promise gives:

```text
FOUND35
 -> PATH
 -> EPIPHANY5
```

without unknown ciphertext, fitted offsets, or a radix choice.

## Complete two-stage signed-source family

Charge every one of the 43 authenticated alphabetic source words as the starting signed index. For each live radix:

1. decode p50 at that signed index;
2. require the value to equal GP0 of an authenticated source word;
3. use that GP0 as the next p50 address;
4. require the second p50 value to be a valid signed-word index.

Under base59 there is exactly **one** chain:

```text
FOUND35 -> PATH39 -> EPIPHANY5
```

Under base60 there are exactly **two**:

```text
MEANING20 -> DEVOTED102 -> YOU32
FOUND35   -> PATH39      -> EPIPHANY5
```

The FOUND chain is therefore the only two-stage chain that survives **both** live numeral systems.

## Downstream holdout: EPIPHANY begins the unique navigation grammar

The bridge lands on signed index5. Independently, the existing complete 560-case source family charges every consecutive four-word window, every reconstructed DH-state depth, and both radices. It has exactly one hit:

```text
5 EPIPHANY
6 SEEKS
7 THE
8 DEVOTED

start = GP0(SEEKS)=71
depth = p=23
radix = base60
... -> GP0(THE)=20 -> GP0(DEVOTED)=102 -> physical p32
|p32| = 121 = GP0(EPIPHANY)
```

The new FOUND bridge was not used to construct that earlier 560-case winner. It supplies a human-readable entry into the already authenticated route.

## Solve-path consequence

The signed prose now supports a closed operational sequence:

```text
SEEK AND YOU WILL BE FOUND
 -> number of FOUND = 35
 -> p50[35] = GP0(PATH)
 -> PATH through p50 points to source index5 EPIPHANY
 -> EPIPHANY SEEKS THE DEVOTED
 -> unique p=23/base60 p50 route
 -> physical p32
```

This also explains why PATH is a useful object in the opening sentence `THE PATH LIES EMPTY`: the closing FOUND instruction actually recovers PATH, and PATH hands control to the EPIPHANY clause whose selected pointer route contains EMPTY as the held-out interior hit.

Discovery was exploratory, so the exact chain should not be assigned a blind p-value. The exhaustive two-stage family and the independently fixed downstream 560-case route make the mechanism reproducible and sharply bounded.

## Reproduction

- SFT: `sims/lp2_found_path_epiphany_bridge_sft.cjs`
- Workflow: `.github/workflows/agent4-found-path-epiphany.yml`
- Windows PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44458989990
