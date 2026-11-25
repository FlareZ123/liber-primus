# Terminal table: unrestricted byte lookup with local stencil and plaintext feedback

**Agent3, 25 November 2026 — exact bounded negative, no recovered plaintext or key.** The conditional 76-perimeter/180-interior correspondence remains unestablished. This experiment combines two previously separate receiver classes into a single joint all-secret model; it does not repeat their independent gates.

## Mechanism and decisive test

Solved p57's instruction to shed circumferences motivates the 32×8 original numeric table's 76-cell rim and 180-cell interior. The 180 known p56/p57 runes permit an original known-input inverse test before touching p55. Prior [memoryless byte lookup](lp2-grid-inner180-nonbijective-lookup-original-gate.md) and [linear stencil](lp2-terminal256-local-3x3-stencil-gate.md) are independently impossible. Allow both simultaneously plus an arbitrary length-eight plaintext feedback filter, motivated only by the visible eight-column width:

```
P_i = D(B_i) + sum(w_u N_i,u, u=1..8) + sum(a_j P_i-j, j=1..8) mod29
```

Here D is a completely unrestricted 256-entry GP29 lookup, N is the eight immediate 3×3 neighboring table bytes in fixed NW,N,NE,W,E,SW,S,SE order, and every one of the 16 coefficients is secret. This is a conditional decoder, not an authenticated cipher; the source does not select the feedback law. Repeated central bytes cancel D exactly, leaving a GF29 linear system in 16 unknowns. Equal-byte equations against the first observation are sufficient; elimination detects a nonzero augmented residual on a zero coefficient row. All 29^272 parameter settings are covered without enumeration. The first eight known positions are unconstrained, granting arbitrary preceding state. A second framing also omits the first eight p57 equations to grant an arbitrary page transition; the lookup and coefficients remain shared. Both genuine p56 plaintext plus p57 and literal printed p56 plus p57 are tested. The native p56 prime-minus-one F bypass replays 85/85 and uses 84 primes. There are 513 layouts: one literal row-major interior plus all 8³ independent corner/direction assignments to the three inner rings.

## Original results

| Register | Page transition | Exact layouts / 513 | Minimum contradictory reduced equations | Latest first contradiction (0-based known index) |
|---|---|---:|---:|---:|
| Solved | Continuous | 0 | 27 | 117 |
| Solved | Eight p57 equations omitted | 0 | 23 | 125 |
| Printed | Continuous | 0 | 26 | 116 |
| Printed | Eight p57 equations omitted | 0 | 23 | 125 |

All 2,052 systems have coefficient rank16 and inconsistent augmented systems. The contradictory reduced equation count depends on elimination order and is **not** a Hamming minimum, nor a statistical significance estimate. In literal row-major solved continuous, 50 repeated-byte equations give rank16 and 32 nonzero contradictory residuals; first at known index91 versus reference index33, byte86, residual12. The two registers test alternatives, not independent discoveries. No original p55 rune is used for parameter selection.

## Positive controls and identifiability

A deterministic xorshift32 256-entry hidden codebook and hidden 16-vector on the same physical interior are recovered exactly for all 122 observed codebook entries and coefficients. The first eight positions are seed context, not fitted. 41/76 exterior byte instances are not observed in the fitted interior, so the full arbitrary codebook cannot determine them. A separate plant using byte mod29 learns on positions 0–119 and recovers all 16 coefficients but only 27/29 map entries. Its frozen free-running decoder gives 15/60 correct suffix runes before encountering an unseen residue at index135. This is an explicit partial holdout failure. A supplemental smaller byte mod23 plant, added after that limitation was seen, obtains 23/23 map entries and 60/60 free-running suffix runes. Neither synthetic result establishes the historical cipher; no held-out truth is supplied after index119.

**Decision:** retire this joint arbitrary-byte-codebook/linear-local-stencil/AR(8) family and its lower-order subclasses for the tested alignments. It excludes neither nonlinear stateful decoders nor alternative geometries. The conditional terminal coupling itself has no independent authorial selector; do not escalate its complexity by adding unconstrained terms. A new first-party source operation or independently predicted receiver is needed before resuming this branch.

Reproduce with [CommonJS SFT](../sims/lp2_terminal256_lookup_stencil_ar8_sft.cjs) and [exact output](lp2-terminal256-lookup-stencil-ar8-output.json). Core run directly on canonical inputs in connected V8; the standalone Node wrapper was not separately executed. Source corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; grid blob `4698c0806e6bab06a39cfbc3c3283b862de58b35`.
