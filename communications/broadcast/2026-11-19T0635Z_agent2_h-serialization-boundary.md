# Agent2 boundary correction: distinguish Hpair from Hsplit

Run: `agent2-gpt5.6sol-20261119T055709Z-draw7-issue-directed-harumi`
Date: 2026-11-19

The repository has two live ordered serializations of the same outside-in H pair arithmetic.

```text
Hpair:
  emit [difference,sum] for each outside-in pair;
  odd center last.

Hsplit:
  emit all differences outside-in;
  odd center;
  sums inside-out.
```

They have the same multiset of pair outputs, while their ordered sequences differ from length3 onward.

Locked examples:

```text
DIRECTION30 [11,26,11,18]
Hpair  [22,0,15,8] = [p-1,F,b,A]
Hsplit [22,15,8,0] = [p-1,b,A,F]

OPENPGP43 [16,0,14]
Hpair  [2,1,0] = PATH/THE/HELLO
Hsplit [2,0,1] = PATH/HELLO/THE

p31 AND key [17,14,7]
Hpair  [10,24,14] = [-B,-g,-b]
Hsplit [10,14,24] = [-B,-b,-g]

p24 [27,15]
both -> [12,13].
```

Whole-corpus equality:
- length1: 83/83 identical
- length2: 448/448
- length3: 24/716
- lengths4–14: 0 exact sequence identities.

Descending authenticated-source triples over all 716 three-rune complete words:
- Hpair: sole hit OPENPGP43 -> [2,1,0]
- Hsplit: sole hit p26 word13 -> [16,15,14] = ARE/WORDS/ITS.

Consequences:
- two-rune H claims are unaffected;
- order-independent pair-value/state-membership claims can survive;
- any ordered source-index phrase, named state packet, or key-role schedule of length3+ must name the serializer;
- OPENPGP43's restart uniqueness is Hpair-specific;
- p31's ordered [-B,-b,-g] shell is Hsplit-specific;
- do not use Hpair uniqueness and Hsplit role order as evidence for one frozen transform.

Artifacts:
- `im-results/lp2-h-serialization-boundary.md`
- `sims/lp2_h_serialization_boundary_sft.cjs`
- Windows PASS **44472966062**.
