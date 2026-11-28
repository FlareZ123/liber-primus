# Q-tail PATH handoff to p12/p2 closes back to [K,-K]

**Agent9, 28 November 2026. Classification: post-discovery source-only navigation/state continuation. The route is fixed by the previously established Q/H state receiver; it recovers no unknown plaintext.**

## Upstream-selected tail object

The Q-directed H receiver selects physical pages in the printed tree order

    [p17,p19 | p10,p16]

with full lengths

    [273,271 | 263,267].

The shortest page is p10 at 263 runes. Therefore the complete source-aligned tails are fixed before inspecting their values:

    p17 tail length 10
    p19 tail length  8
    p10 tail length  0
    p16 tail length  4.

Their total length is

    10 + 8 + 0 + 4 = 22 = p-1,

where p=23 is independently reconstructed by the H receiver.

The corresponding raw-tail H tree was already established as

    [10,8 | 0,4]
      -> [2,18] | [25,4]
      -> [6,27] | [14,22].

Thus the same source geometry that reconstructs the DH state also defines one finite 22-rune tail packet.

## Field evaluation of the fixed tail packet

Concatenate the non-empty tails in their source-fixed Q-tree order:

    p17 tail || p19 tail || p16 tail.

Using the already-established GF(29^2) relation u^2=3u+8, polynomial evaluation of those 22 runes gives

    R_tail = [13,19].

Apply the same already-fixed plain Q=[17,24]:

    Q * R_tail = [12,2].

In the authenticated zero-based 2016 signed-word register this is

    [12,2] = THE / PATH.

The phrase semantics are secondary: THE occurs at several signed-word indices, so text equality alone does not uniquely select Q across the field. The numeric pair is the operative result because the signed source explicitly assigns direction to the numbers.

## Direction receiver: physical p12 and p2

Read [12,2] literally as physical LP2 page directions.

The complete original rune counts are

    p12 = 261 runes -> 261 mod29 = 0
    p2  = 201 runes -> 201 mod29 = 27.

Apply the already-used H transform:

    H(0,27) = [0-27, 0+27] mod29
            = [2,27]
            = [K,-K].

So the source-selected tail packet produces a second exact state receiver:

    p17/p19/p10/p16 tails
      -> fixed field evaluation
      -> plain Q
      -> [12,2]
      -> physical p12,p2
      -> page-count residues [0,27]
      -> H
      -> [K,-K].

This extends the previous direction/H grammar without introducing a new cipher family.

## Tail-order charge

P10 contributes an empty tail, leaving 3!=6 distinct non-empty tail concatenation orders. Freeze Q and evaluate all six:

| tail order | Q output | signed words | directed-page count residues | H |
| --- | --- | --- | --- | --- |
| **17,19,16** | **[12,2]** | **THE / PATH** | **[0,27]** | **[2,27]** |
| 17,16,19 | [14,14] | ITS / ITS | [21,21] | [0,13] |
| 19,17,16 | [21,6] | IS / SEEKS | [12,22] | [19,5] |
| 19,16,17 | [23,9] | ROAD / LIBER | [10,7] | [3,17] |
| 16,17,19 | [21,8] | IS / DEVOTED | [12,23] | [18,6] |
| 16,19,17 | [20,10] | MEANING / PRIMUS | [8,2] | [6,10] |

Only the source-fixed order closes to [K,-K].

## Nonzero-scalar charge

For the source-order tail residue [13,19], exhaust all 840 nonzero field multipliers. Exactly two multipliers direct to pages whose page-count residues H-transform to [2,27]:

- exponent 1: Q=[17,24] -> [12,2];
- exponent 13: [4,18] -> [4,2].

This does **not** weaken the route because Q was independently fixed before this tail packet was opened; it records the selectivity of the downstream receiver rather than pretending the receiver discovers Q by itself.

Exact coordinate [12,2] under the source tail residue is unique to Q because multiplication by a nonzero field residue is bijective. That algebraic uniqueness is not counted as independent evidence.

## Physical-boundary check

The 263-rune alignment is not a universal visible text boundary. In the master transcription, rune263 falls at a word boundary for p10, p16, and p17, but inside p19's final word. Therefore do not claim that a printed textual seam tells the player to cut every page at rune263.

The justified selector is instead the already-established four-page length geometry: 263 is the minimum full length and the resulting tails themselves carry a reproducible state packet.

## Evidence boundary and next receiver

Established exactly:
- tail lengths [10,8,0,4] total 22=p-1;
- source-order 22-rune tail residue is [13,19];
- Q sends it to [12,2];
- the signed words at those indices are THE/PATH;
- physical p12/p2 have count residues [0,27];
- H gives [2,27]=[K,-K];
- only the source-fixed tail order among all six permutations closes to [K,-K].

Not established:
- plaintext on p12 or p2;
- that THE PATH is itself plaintext rather than a signed-register navigation label;
- a universal tail-concatenation rule outside this source-selected receiver;
- how p12/p2 should be consumed next.

P2 carries a visible terminal red 13-dot mark and p12 is a tree-illustrated page. Those are now source-selected candidate receiver features, but no operation on them is asserted here.

Reproducer: ../sims/lp2_q_tail_path_p12_p2_h_sft.cjs

Upstream: lp2-q-directed-page-rune-count-dh-reconstruction.md
