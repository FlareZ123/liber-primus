# Two consecutive prospective p0 27x27 key-node predictions from the independent DH23 state

**Agent25, 19 November 2026. Classification: prospective source-geometry evidence for the existing 27x27 route. This does not authenticate the candidate plaintext or its ciphertext paths.**

## Context

Agent24 independently derived the p28 DH23 state:

```text
(p,g,a,b,A,B,K,e,q)
= (23,5,6,15,8,19,2,3,4)
```

and showed that it compresses the already published p0-p2 27x27 geometry. Because the public route predates that state interpretation, the earlier readable blocks remain retrospective compatibility evidence.

This experiment asked a narrower prospective question: can the frozen state plus already opened original geometry predict an untouched **next key-source node** before that block is inspected?

## Block9 prediction

After block8 was opened, its published ciphertext endpoint was known:

```text
(17,18) = (p-a,A-B)
```

That exact original cell is the center of the state packet:

```text
J - D - J
(15,20) (17,18) (19,16)
[11,23,11] = [B-A,p,B-A]
radius = K=2
```

Before opening block9, commit `783177e73c02a01e43ad9e2d4e97e58b33ec9897` sealed the exact prediction that block9 would use this node.

After the commit, the published block9 walkthrough was opened. Its key-generating node is exactly the predicted `J-D-J` at those three coordinates. Because the public route's node-to-key transform was already fixed, the sealed node also determines the key before plaintext inspection: replace center `D=23` by `phi(23)=22=OE`; the Möbius rotation is zero, giving exact key **`J-OE-J`**.

A complete original-grid charge strengthens the specificity: across every canonical horizontal, vertical and 45-degree diagonal triple at every radius 1..13, `[11,23,11]` occurs **once**, at the predicted node.

## Block10 prediction

The lower outer rune of the prospectively correct block9 node is:

```text
(19,16) = (B,K-b)
```

and is the center of another exact state packet:

```text
OE - J - OE
(18,16) (19,16) (20,16)
[22,11,22] = [p-1,B-A,p-1]
radius = e-K=1
```

Before opening block10, commit `90bac1d2d94090c15f48972d359596c8ca0358a8` sealed that exact node as the block10 key source.

Afterward, the published block10 walkthrough was opened. It uses exactly that `OE-J-OE` node. The frozen transform replaces `J=11` by `phi(11)=10=I`; the Möbius sum rotates left twice, giving exact key **`OE-OE-I`**. A complete all-axis/all-radius charge again finds `[22,11,22]` **once** in the original 27x27 matrix, at the predicted coordinates.

## Adversarial controls

Several neighboring hypotheses were also sealed before inspection and failed:

- block6 ciphertext start = block5 key center: failed;
- block7 ciphertext start = opposite endpoint of the exposed mirror: failed;
- block8 key source = the nearest vertical `[K,A,K]` mirror at the prior start: failed;
- block11 key source = the fully state-native `[-q,-g,-q]` mirror at the prior start: failed;
- block12 key source = the unique `[-B,q,-B]` endpoint mirror: failed because the route uses the larger same-center `[A,q,A]` mirror;
- block13 key source = the connected `[A,p-e,A]` mirror: failed because the route reuses the block11 `J-B-J` node.

The failures matter. State expressibility by itself is insufficient to select a route. For example the actual block11 state packet `[B-A,p-a,B-A]=[11,17,11]` has two exact canonical placements in the full matrix. This prevents treating arbitrary DH-state rewritings as authentication. **A later chain-specific selector does resolve this particular ambiguity without weakening the control:** the reconstructed block9–10 route exposes shared coordinate `(19,16)`, and exactly one of the two block11 placements contains it. That continuation is documented in `im-results/lp2-p0-state-block11-end.md`; the packet remains globally nonunique absent continuity.

## What the two hits establish

The pair of sealed successes shows that the independently recovered DH23 state can make **prospective exact source-node predictions** on the original 729-rune object. The block9 and block10 predictions were committed before their target walkthroughs were inspected, require exact original coordinates, and each selects a globally unique packet.

They still leave the general route-selection gap open. The frozen node-to-key transform means both exact key orders follow without further fitting. **A later Agent48 source-window reconstruction closes block9 locally:** among all authenticated contiguous source spans whose native GP length is13, only `THE WAY ITS WORDS` maps through H and the original 4|5|4 marker to `[11,23,11]`; that packet occurs globally once at the prospectively sealed block9 node and is the only such source-window packet coinciding with any frozen public key-source geometry. The span ends at source15 `WORDS`, opening `WORDS ARE THE MAP`; using `MAP=18` as the row and `WORDS=15 -> ARE=16` as increasing numbered direction selects original cells `(18,15)->(18,16)`. The already fixed `J-OE-J` key decrypts them exactly to `OF`. A 96-case coordinate charge over the four source numbers leaves that assignment as the sole source-native word. This is strong retrospective source-derived closure because the public OF THE route was already visible when the source grammar was recognized. The block10 node center `(19,16)` is the lower outer block9 node coordinate; the next source window fixes adjacent columns16/17 and continuity fixes the endpoint at the shared node, selecting the public `(19,17)->(19,16)` direction and exact THE inverse. The block11 packet is globally nonunique, but the newly exposed shared coordinate `(19,16)` selects exactly one of its two placements. Inverting its state formula fixes start `(B,p)=(19,23)`, and a bounded direction/length charge gives exact `END`; see `im-results/lp2-p0-state-block11-end.md`. The broader route grammar remains unresolved. See `im-results/lp2-p0-source-window-block9-of.md`.

Do not extend the result by fitting a new transition formula through the later failed gates. The next useful advance must predict another untouched route component from an independently stated rule.

## Reproduction

```text
node sims/lp2_p28_dh23_p0_block9_block10_prospective_nodes_sft.cjs
```

Windows Node22 CI: **PASS, runs 44477207308 and 44478275213** (the latter includes the frozen node-to-key transform).

The SFT re-derives DH23 from original p28 layout, reconstructs the original p0-p2 27x27 matrix, exhausts all canonical triples at every radius for the predicted packets, verifies one exact placement for each successful packet, and retains the later nonunique block11 packet as a negative control.

## Fresh post-square-state holdout

After Agent13 independently recovered the same DH23 tuple from authenticated 2014 magic-square metadata, a new untouched-object gate tested whether that stronger state provenance selected the next 27x27 key node. Before block14 inspection, commit `898f616f90bb01ab9fd7706c5f73785454f52a29` froze the unused vertical radius-one `C-N-C` node at `(24,3),(25,3),(26,3)`, with state coordinates `(-g,e),(-q,e),(-e,e)` and values `[g,A+(q-e),g]=[5,9,5]`.

The published block14 walkthrough instead uses `EA-J-EA` at `(25,2),(25,6),(25,10)`. The prospective gate therefore **fails**. The actual node can be written retrospectively as `[-1,B-A,-1]` with radius `q`, but that identity is not promoted because it was recognized after inspection.

This fresh negative is important: independent recovery of the DH tuple from authenticated squares improves state provenance, yet it still does not specify the next 27x27 node under the connected-mirror heuristic. The two block9/block10 hits remain real prospective evidence, while a general transition grammar is still missing.
