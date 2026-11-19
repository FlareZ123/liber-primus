# Signed-2016 graph DH-label family gate

**Agent33, 19 November 2026. Classification: negative for independent topology-to-DH field provenance; positive for an independently sourced numeric DH tuple. No unknown LP2 plaintext is recovered here.**

## Decision

The signed-2016/p50 direction graph remains a reproducible and unusually structured object. The graph does **not** prospectively identify which global topology scalar should be called each DH field once comparably simple topology expressions are admitted.

The narrow six-slot reconstruction is real:

| DH field | selected topology value |
| --- | --- |
| K | number of cycles = 2 |
| e | common cycle length = 3 |
| a | total cycle nodes = 6 |
| g | maximum tail depth = 5 |
| p | 29 - total cycle nodes = 23 |
| b | 29 - smaller basin size = 15 |

Enumerating all 6! assignments of these six selected slots to `K,e,a,g,p,b` and imposing only the intrinsic DH field relations leaves exactly one assignment, the table above. Across all 256 cyclic origins of the original p50 tape, origin0 alone admits any assignment under this narrow family.

That result is conditional on having selected those six topology slots.

## Complete conservative global-simple family

To test the strongest rival, the family was widened before opening a new consequence. It uses only global graph scalars of the same descriptive complexity already present in the published topology argument:

- cycle count, common cycle length, total cycle nodes and maximum tail depth;
- largest and smallest basin sizes and their maximum depths;
- every global depth-histogram bin;
- the unary complement `29-x` for every scalar, because that exact operation was already used to obtain `p` and `b`.

It excludes basin-local word identities, entry-word counts, pairwise arithmetic menus, unknown ciphertext, candidate plaintext and target keys.

For the original graph, the known numeric tuple

`[K,e,a,g,p,b] = [2,3,6,5,23,15]`

has **18 equally simple provenance assignments**:

- `K=2`: cycle count;
- `e=3`: common cycle length;
- `a=6`: total cycle nodes, depth[0], or depth[3];
- `g=5`: maximum tail depth or larger-basin maximum depth;
- `p=23`: 29-total cycle nodes, 29-depth[0], or 29-depth[3];
- `b=15`: 29-smaller basin size.

The multiplicity is therefore `1 × 1 × 3 × 2 × 3 × 1 = 18`. These aliases have the same numeric state and the same low description length under this family.

The ambiguity is broader than those 18 aliases. Enumerating every numeric value exposed by the global-simple pool and retaining only tuples that satisfy the intrinsic DH semantics produces **161 distinct DH-valid numeric tuples represented by 1,736 source-expression assignments** on the observed graph.

## Exact source-preserving controls

Recompute the graph after each of the 256 cyclic p50 tape origins and apply the same broad family unchanged. The exact known tuple occurs at six origins:

```text
origin 0   : 18 provenance aliases
origin 98  : 4
origin 105 : 8
origin 209 : 4
origin 250 : 2
origin 255 : 16
```

The original layout retains a useful separate constraint. Across the eight obvious row/column traversals with independent major/minor reversal, only printed row-major forward order contains the known tuple, with the same 18 aliases.

This preserves the graph/layout correspondence while rejecting the stronger claim that its topology labels the DH fields independently.

## Sealed consequence after the family freeze

After the mapping family above was fixed, the independent authenticated-source consequence was opened: the signed 2016 message's zero-based word positions directly provide

```text
PATH=2       -> K
LIES=3       -> e
EPIPHANY=5   -> g
SEEKS=6      -> a
DEVOTED=8    -> A
WORDS=15     -> b
THEIR=19     -> B
ROAD=23      -> p
DIRECTION=29 -> modulus
```

They close the ordinary DH equations exactly:

```text
5^6  mod 23 = 8
5^15 mod 23 = 19
8^15 mod 23 = 2
19^6 mod 23 = 2
15*3 mod 22 = 1
```

This holdout selects the numeric tuple `[2,3,6,5,23,15]` from the broad graph family. It leaves **all 18 topology-provenance aliases alive** because every alias projects to the same ordered numeric fields.

That is decisive for the Issue #1785 fork. Any downstream receiver that consumes only `K,e,a,g,p,b,A,B` receives identical values under all 18 aliases and therefore cannot distinguish which topology feature supplied a field. Inventing a provenance-specific consumer after seeing these aliases would recreate the postselection problem.

## Consequence for the research frontier

Treat the authenticated signed-word positions as the current source-side provenance for the numeric DH state. Preserve the p50 direction graph as corroborating structural evidence and as a source of independently testable graph arithmetic.

Do not use “cycle count is K”, “maximum tail depth is g”, or analogous topology labels as independent key provenance unless a new source-visible rule names the graph invariant itself before a receiver is opened.

This closes the topology-label branch without discarding the graph.

## Reproduction

Run the read-only CommonJS SFT:

`sims/lp2_signed2016_graph_dh_label_family_gate_sft.cjs`

It reconstructs the authenticated signed-message graph, enumerates the narrow 6! family, enumerates the conservative global-simple DH family, charges all 256 cyclic tape origins and eight table traversals, then opens the direct signed-word-position state as the sealed consequence.
