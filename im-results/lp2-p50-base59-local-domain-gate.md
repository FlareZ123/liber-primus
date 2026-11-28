# Base59 pointer semantics: no source-visible local start domain survives the all-address sink premise

**Agent 9, 28 November 2026. Classification: prospective-domain gate for Director #3441. No new ciphertext or plaintext is opened.**

## Decision

The proposed "local domain" rescue fails before choosing a new target.

The strongest pre-#3428 base59 pointer result is not a selected-start result. It defines the literal map

`next(i) = base59(table[i])`

on **every one of the 256 physical addresses** and proves that **all 256 starts converge to the unique fixed point cell189**. Therefore cell42, the later ROAD×K five-hop miss, is already inside the exact start domain of the claimed pointer semantics.

A new source-visible subset that excludes cell42 cannot be described as the domain where the pointer law applies without contradicting the earlier all-address result. It can only be a domain for a *particular finite-hop consumer*.

## Source-type comparison

The strongest finite-hop success and the fresh failure are both source-selected K-column/DH-state circuits:

| circuit | start | source type | fixed count | result |
|---|---:|---|---:|---|
| p27/DH bridge | 186 = row p=23, col K=2 | mirror-selected DH coordinate (p,K) | A=8 | base59 reaches 189=(p,g), a fixed point |
| #3428 holdout | 42 = row g=5, col K=2 | ROAD/support-selected DH coordinate (g,K) | g=5 | base59 reaches 83=3D; terminal is not a primitive state |

Both starts lie on physical column K and both rows are authenticated DH-state values. Both hop counts are source-visible DH values. Thus the broad natural rule "DH-state row × K-column with source-supplied DH hop count" already contains both a hit and a prospective miss.

The only obvious source-visible feature that separates the successful start is **horizontal mirror selection**: 186 is the mirror of sink189. But that rule is a post-success singleton orbit:

`{189, 186}`.

Cell189 is the already-known base59 fixed point and cell186 is the already-used successful start. There is no untouched third start inside this class on which to make #3441's required prediction.

## Why other domain cuts are post-hoc

Possible restrictions such as:

- row p only;
- the mirror orbit only;
- starts whose frozen count happens to return to the sink;
- starts already known to encode a DH endpoint;

all select the successful circuit by properties recognized after its success. They do not arise as a larger source class containing an unused target.

Conversely, source classes available before #3428 — p50 address, K-column state intersection, DH-state row, support intersection, or literal value-as-next-address semantics — include cell42 and therefore inherit its finite-hop failure.

## Operation/domain distinction

The #3428 miss does **not** falsify the base59 functional graph. Under the literal graph, cell42 still eventually reaches 189, exactly as every address does.

What fails is the attempted transfer from:

`source-selected start + source-selected finite hop count`

to

`typed DH-state terminal`.

That finite-hop consumer has no source-visible local start domain that both:

1. excludes the prospectively failed cell42 without using its outcome; and
2. contains an unused start for a new prospective prediction.

## Consequence

Retain these structural facts:

- drop-f base59 defines a total 256-address functional graph;
- all 256 addresses converge to fixed point189;
- p27 independently supplies the special 186 --8 hops--> 189 closure;
- source reflection maps 189 <-> 186 and closes the historical DH packet.

But **retire the local-domain rescue for finite base59 pointer consumers**. Further work must supply a new first-party stopping/count rule or a typed receiver, rather than carving a successful subset of starts after #3428.

Reproducer: `sims/lp2_p50_base59_local_domain_gate_sft.cjs`.
