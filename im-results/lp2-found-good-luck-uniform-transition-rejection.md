# Director #1738: bounded common-transition grammar rejects a unified FOUND/GOOD/LUCK key update

**Agent 1, 19 November 2026. Classification: decisive negative on the current compact transition hypothesis. Preserve the common plaintext H-shell structure and cross-object key bridges, but do not treat the three published inverse keys as outputs of one demonstrated cipher-state transition.**

## Starting objects

Published exact additive keys:

```text
FOUND [12,28,10,1,8]
GOOD  [18,18,23,20]
LUCK  [17,16,4,22]
```

Under the already frozen reversible H shell:

```text
FOUND -> [4,20,27,0,10]
GOOD  -> [27,9,24,12]
LUCK  -> [24,10,12,20]
```

A partial recurrence is real:

```text
FOUND shell[2] = GOOD shell[0] = 27 = -K
GOOD  shell[2] = LUCK shell[0] = 24 = p+1
```

That observation is insufficient to define a whole-state update.

## Frozen grammar A: source-state uniform transforms

FOUND has five shell coordinates while GOOD/LUCK have four. Charge all five possible one-coordinate deletions from FOUND before applying one uniform four-coordinate transform.

For each step, charge:

- every one of the 24 coordinate permutations;
- pre-transform: identity, pairwise H, pairwise H⁻¹, coordinatewise cube, coordinatewise inverse-cube;
- one uniform coordinate operation: add or multiply by one of 16 fixed p28-state-derived scalars

```text
{0,1,K,e,g,a,A,K*g,K*a,b,B,p-1,p,p+K,-K,-1}.
```

Total:

```text
5 * 5 * 24 * 32 = 19,200 rules.
```

Require the **same rule** to map

```text
FOUND -> GOOD
GOOD  -> LUCK.
```

Result:

```text
0 / 19,200.
```

## Frozen grammar B: source-visible p50 token-driven transforms

The navigation tokens are fixed independently:

```text
FOUND -> GOOD : p50[36] = 0s
GOOD  -> LUCK : p50[35] = 0d
held-out next : p50[31] = 2D
```

Keep the same five dimension choices, five pre-transforms and 24 permutations. Interpret the transition token by each of six source-visible numeric components:

- base60 value mod29;
- base59 value mod29;
- second-symbol base60 index;
- second-symbol base59 index;
- digit + second-symbol base60 index;
- digit + second-symbol base59 index.

Apply one uniform binary operation to every coordinate:

```text
add, subtract, reverse-subtract, multiply, divide mod29.
```

Total:

```text
5 * 5 * 24 * 6 * 5 = 18,000 rules.
```

Again require one rule to map both transitions.

Result:

```text
0 / 18,000.
```

Combined charged grammar:

```text
0 / 37,200 compact uniform rules.
```

## Decision

Within the Director-prescribed compact grammar, **no common source-state transition exists**.

This does not negate the exact plaintext candidates or their independent structural support:

- FOUND/GOOD/LUCK are the authenticated message's sole consecutive H-shell junction family;
- GOOD and LUCK keys have independent cross-object source bridges;
- their source-selected p0 receivers and exact forward replays remain valid experimental facts.

It does change the cryptographic claim. The three keys should currently be classified as **independently source-constrained but target-conditioned inverses**, not as successive states of one established cipher.

The partial coordinate recurrence may remain an observation, but it must not be used to predict a fourth key without a new source-selected transition rule.

## Reproduction

- SFT: `sims/lp2_found_good_luck_uniform_transition_gate_sft.cjs`
- commit: `5217c7e1033547bc5f2b9b009dbaa09b9ee69489`
- Windows Node22 PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44441440979
- charged rules: 19,200 fixed-state + 18,000 p50-token-driven = 37,200; zero survivors.
