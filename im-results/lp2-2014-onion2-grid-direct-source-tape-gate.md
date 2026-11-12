# January 2014 growing-string 256-byte tape against the May 2014 LP2 256-cell table

**Agent40, 12 November 2026. Classification: a finite, source-motivated original-input exclusion.** The literal historical 256-byte tape does not directly decode the original LP2 grid or GP29 rune stream under the specified reversible families. No unknown plaintext, key, cipher mechanism, or destination was recovered.

## Independent source selection and obstacle

The early 2014 Cicada second-onion stage published a growing **256-byte hexadecimal string**, with surviving timestamped byte snapshots. The pinned, later-reconciled source is [`resources/cicada2014-onion2-timing.json`](../resources/cicada2014-onion2-timing.json), containing the complete published-order 256-byte string and SHA-256 `05acf0d8e2ba7d851e2b4bbc32b85e461a1bd41576a50504487f33d4c1522c56`. These bytes predate the May 2014 Liber Primus release.

Independently, the original LP2 physical pp49–51 print a **32 × 8 = 256-cell** two-character table, with 256 conditional conventional-base60 bytes in natural page-major row order, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The exact source-token mapping and its limitation are recorded in [`resources/liber-primus/lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json). The matched 256 positions motivate a literal one-byte-to-one-cell test without choosing a secret offset or permutation; the source offers **no authenticated instruction pairing these two objects**, and equal length alone is weak evidence.

## Exact stationary byte mapping obstruction

Let `S[i]` be onion-2 byte `i` and `T[i]` be source-order table byte `i`, for `i=0..255`. The literal tapes have **158** and **161** distinct byte identities respectively. Among all unordered pairs of distinct positions:

| Condition | Number of pairs |
| --- | ---: |
| `S[i] = S[j]`, `T[i] ≠ T[j]` | **139** |
| `S[i] ≠ S[j]`, `T[i] = T[j]` | **127** |
| `S[i] = S[j]`, `T[i] = T[j]` | **0** |

A fixed function `T=f(S)` requires every first-row equality to be preserved, which fails in 139 pairs; a fixed *bijection* also preserves the converse, which fails in 127 pairs. The test excludes every direct static byte substitution, including every 256-element alphabet permutation, at this exact printed alignment. This is invariant under changing the secret letter assignment.

More precisely, each of the 256 observed ordered `(S,T)` pairs is unique, so preserving one aligned position corresponds to selecting an edge of a bipartite 256-symbol graph. An exact augmenting-path maximum bipartite matching finds **137** compatible edges. Thus any single global byte bijection must alter **at least 119/256 aligned table outputs** to achieve any match. This is a necessary source-order symbol-change bound; it is not a bound on a changing-state cipher or page-specific table.

## One literal arithmetic family and all-original GP29 key transport

The visible source-ordered bytewise XOR `S[i] XOR T[i]` produces **97/256 printable ASCII bytes** and no visible plaintext or recognizable file header. Its first 32 bytes are:

```text
a8a5350028134dd98623eb44c301fde725e4ce0ded33d61cff1a6d4768da7aef
```

Likewise, literal byte subtraction and addition modulo 256 produce 88 and 95 printable ASCII bytes. These limited observations cannot reject arbitrary high-entropy encrypted payloads, but none exposes directly readable text. Source source-byte identity alone supplies no consumer for a recovered secret table.

For a separately source-motivated GP29 direct-key transport, interpret each published byte as its remainder modulo 29 and repeat its **256-byte period**, using the actual solved-Cicada mod-29 Vigenère addition/subtraction, either one book-continuous clock or physical-page clock. Test also the historic literal-F pass-through/hold convention. Do not optimize offsets, key phase, skip positions, corpus windows, clock parameters or an arbitrary glyph alphabet. Exact full-original (12,956-rune) IoCs:

| Clock | Sign | All runes consume key | Literal F passes without consumption |
| --- | --- | ---: | ---: |
| Book-continuous | `C−K` | **0.034461096** | 0.035584407 |
| Book-continuous | `C+K` | **0.034462872** | 0.035710034 |
| Physical-page reset | `C−K` | **0.034494031** | 0.035710928 |
| Physical-page reset | `C+K` | **0.034482473** | 0.035533693 |

The untouched original IoC is **0.034478398**; the no-skip variants are indistinguishable from a flat ciphertext distribution. The higher pass-through values are partly created by retaining the known original F positions and cannot authenticate plaintext. All eight outputs are nonlinguistic on direct inspection. This retires only the tested literal byte-mod29 period under these two clocks, not all key derivations from the original onion material.

## Reproducibility and next decision

The [single-file Node.js 22 CommonJS SFT](../sims/lp2_onion2_2014_grid_direct_gate_sft.cjs) reads all three pinned original inputs and verifies exact source SHA-256, 256-entry lengths, equality-pair contradictions, maximum bipartite matching, XOR bytes, and all eight GP29 inverse IoCs. It includes a positive planted bijection and a deliberately conflicting negative control. [Manual GitHub Actions run 43261482430](https://github.com/FlareZ123/liber-primus/actions/runs/43261482430) executed successfully on the committed original sources and printed the exact findings. The selectable job was added to existing `.github/workflows/grid-256-tests.yml` with **only** `workflow_dispatch`, avoiding automatic CI.

The source-level reason for a player to align the two 256-byte artifacts is still the coincident count, and there is no author-specified readout, initialization, or key schedule. An independent 2014/2016 clue naming the growing string as a key, defining a consumer, and predicting withheld original ciphertext would justify a new attack. Absent that, do not launch offsets, secret byte permutations, alternate PRNG streams, or speculative digest/KDF sweeps from this tape. This result does not change the authoritative current finding that LP2 unknown plaintext remains unrecovered.
