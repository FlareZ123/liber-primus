# Five-fragment row-sum to p50 DH-pair bridge

**Status: intermediate, bounded negative at the proposed DH-consumer selector. The original five-pair sequence has an attractive instruction-like readout, but the same operation fails pre-existing holdouts. No unknown LP2 plaintext or reusable cipher is recovered.**

## Result

The signed-2016 word-indexed fragments select:

```
[12, 29, 30, 12, 26]
THE / DIRECTION / SEEK / THE / NUMBERS
```

Applying the frozen p57 GP0-word-sum → p50 native-base60 byte → divmod29 register gives:

| 2016 word index | Word | GP0 sum | p50 byte | divmod29 pair | DH-state interpretation |
|---:|---|---:|---:|---:|---|
| 12 | THE | 20 | 102 | [3,15] | [e,b] |
| 29 | DIRECTION | 112 | 73 | [2,15] | [K,b] |
| 30 | SEEK | 56 | 254 | [8,22] | [A,p−1] |
| 12 | THE | 20 | 102 | [3,15] | [e,b] |
| 26 | NUMBERS | 83 | 193 | [6,19] | [a,B] |

The frozen 2013 DH state is (p=23,g=5,a=6,b=15,A=8,B=19,K=2), with the p57 vocabulary also carrying (e=3). Four pairs are exact members of that vocabulary; [2,15] is the cross-pair [K,b]. The ordered sequence is not sorted or rearranged.

## Discriminating controls

The expected ordered sequence is:

```
[3,15], [2,15], [8,22], [3,15], [6,19]
```

- Across all 256 cyclic rotations of the p50 byte tape, the exact sequence occurs only at authored shift 0. The maximum position-by-position match is 5/5, also unique at shift 0.
- Across all 32,768 invertible affine address permutations, the exact sequence occurs only for the identity address map. The maximum position-by-position match is 5/5, also unique.
- The [2,15] pair is not unique to DIRECTION in the entire 43-word source; it also occurs for HELLO and LIBER. The full five-pair ordered sequence is what passes the controls.

Reproducer: `sims/lp2_five_fragment_p50_dh_pair_bridge_sft.cjs`.

## DH exponentiation: attractive readout, failed holdouts

The signed 2013 protocol supplies a concrete modular operation for its one-shot exchange: (B^a\bmod p=K), equivalently (A^b\bmod p=K). If each p57 pair is interpreted as [exponent, base], applying (base^{exponent}\bmod23) to the five pairs gives:

| Pair | Modular operation mod 23 | Output index | Signed-2016 word |
|---|---:|---:|---|
| [e,b] = [3,15] | (15^3\bmod23) | 17 | THE |
| [K,b] = [2,15] | (15^2\bmod23) | 18 | MAP |
| [A,p−1] = [8,22] | (22^8\bmod23) | 1 | THE |
| [e,b] = [3,15] | (15^3\bmod23) | 17 | THE |
| [a,B] = [6,19] | (19^6\bmod23) | 2 | PATH |

The exact output is **THE MAP THE THE PATH**. The final pair validates the orientation against the DH example: (19^6\bmod23=2=K). Collapsing the repeated output associated with the repeated [e,b] pair gives **THE MAP THE PATH**, but that normalization is not independently selected.

The reverse pair orientation gives indices [12,16,1,12,18] → **THE ARE THE THE MAP**. The exponent-first/base-second orientation is therefore the more source-compatible candidate. However, the final [a,B] pair is the only exact standard DH input pair; the first four pairs are not the protocol's usual role-pairs. Applying modular exponentiation to all five is an extension, not an operation explicitly specified by the 2013 source.

Crucially, the same consumer was applied without tuning to other already-published readouts from the same 5×5 fragment family:

| Pre-existing readout | Input words | DH output words |
|---|---|---|
| (MC) row sums | THE EPIPHANY IS THE PRIMUS | **THE ARE THE THE PATH** |
| Raw column sums | YOU IS YOU SEEKS MAP | **ARE THE ARE WORDS THE** |
| (MC) column sums | BEWARE EMPTY BE MEANING THE | **THE LIBER PRIMUS EMPTY THE** |

None yields a comparable instruction. A separate singleton check maps OPENPGP through the same p57 register to pair [6,3], then (3^6\bmod23=16) → ARE, not an obvious continuation. The complete 43-word mapping is many-to-one.

These controls materially weaken the attractive original readout: it is not a general word successor, and the DH operation does not generalize across the most relevant alternative readouts. The final-pair identity is a local consistency check, not validation of the whole five-pair consumer.

## Why this matters

The raw row-sum phrase **THE DIRECTION SEEK THE NUMBERS** and its DH readout **THE MAP THE THE PATH** remain rare, reproducible instruction-level correspondences. But the row/column/diagonal selector is not fixed by the original sources, and the proposed DH consumer fails the pre-existing (MC)-row and raw-column holdouts. The evidence supports preserving the sequence as a local correspondence, not treating it as a cipher, key schedule, or route to unknown plaintext.

## Evidence limits and next decision

1. The signed-word-index-to-page/fragment convention and five-fragment row-sum readout remain intermediate hypotheses; the p36 GOOD fragment is an existing anchor, not independent validation of this consumer.
2. The p57 GP0 → p50 → divmod29 register was fixed before this five-word application, but the p50 table and 2016 message are shared across the routes.
3. The 2013 protocol defines a single DH exchange and NEXT storage, not repeated per-pair exponentiation or a per-rune state transition.
4. The alternative (MC)-row and raw-column readouts fail to produce comparable instructions under the same DH operation. OPENPGP also maps to ARE, so the rule is not a general successor.
5. No unknown LP2 ciphertext span has been decrypted or prospectively predicted.

**Decision:** bounded negative at the proposed DH-consumer selector. Preserve the original five-pair correspondence, but retire per-pair DH exponentiation as a general decoder unless an original instruction explicitly selects it or a new, independent receiver produces a locked prediction. Do not continue generic state-transition or cipher sweeps on this branch.

Related work:
- p57 register: `im-results/lp2-p57-divmod29-register-audit.md`
- 2013 DH source: `resources/external/2013-tcp-server-signed-source.md`
- signed-2016 word positions: `im-results/lp2-signed2016-word-position-dh.md`
- five-fragment row-sum family: `im-results/lp2-five-source-indexed-fragments-row-sum-readout.md`
