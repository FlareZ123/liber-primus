# P32 is exactly the depth-20 reverse tree of the selected p50 pointer state

**Classification (19 November 2026): source-selected graph receiver scaffold with a bounded direct-consumer negative. No unknown LP2 plaintext, creator key, complete cipher inverse, or destination is recovered.**

Reproducer: [`sims/lp2_p32_p50_reverse_tree_depth20_sft.cjs`](../sims/lp2_p32_p50_reverse_tree_depth20_sft.cjs). Windows Node 22 source run [44447620241](https://github.com/FlareZ123/liber-primus/actions/runs/44447620241) passed on the unmodified repository sources.

## Upstream selector

The authenticated 2016 clause

`EPIPHANY SEEKS THE DEVOTED`

has canonical GP0 values

- `EPIPHANY = 121`
- `SEEKS = 71`
- `THE = 20`
- `DEVOTED = 102`

Agent8's independently documented finite family already selects the original base60 p50 byte-pointer walk of DH depth `p=23`:

`71→108→14→183→81→58→146→92→236→238→129→179→175→18→15→212→70→169→228→144→125→20→102→32`.

The last two preterminal states are exactly `THE=20` and `DEVOTED=102`; terminal 32 is physical p32; physical p32 contains exactly 121 original runes, matching `EPIPHANY`. The held-out word `EMPTY=92` lies on that fixed path.

This report begins after that route. It does not rescore or retune the 23-step selector.

## The next pointer enters a rooted reverse tree

The same original base60 table gives

`T[32] = 115`.

State 115 is one node of the established eleven-cycle

`0→203→68→199→47→76→114→197→115→247→192→0`.

A functional graph has a canonical reverse object at every attractor node: all noncycle predecessors that eventually flow into that node. Since p32 visibly carries a tree illustration, the reverse in-tree is a source-visible graph operation rather than a new cipher family.

For a cycle root, remove incoming edges from other nodes on the same attractor cycle. Define reverse depth as the minimum number of forward p50 pointer steps required to reach the root. Starting at 115 and retaining every noncycle predecessor at reverse depths 1 through **20 = GP0(THE)** gives the exact layer sizes

`[2,4,7,9,7,13,10,8,10,7,4,6,5,6,6,3,3,4,4,3]`.

They sum to exactly

`121 = GP0(EPIPHANY)`,

the complete original p32 rune count.

Thus the same authenticated clause that selects the forward route also supplies the two parameters of a reverse-tree receiver immediately after the route:

`THE = depth 20`

and

`EPIPHANY = 121 selected nodes`.

The complete attached in-tree at 115 contains 130 nonroot nodes, or 131 including the cycle root. The equality 131 = the established GP-prime value of `CIRCUMFERENCES` is suggestive context, but it was recognized after the tree construction and is not needed for the 121-node result.

## Familywise uniqueness

Two finite controls make the 121 equality materially stronger than an isolated count.

### Every graph root × every DH-bounded depth

Charge all 256 possible p50 roots and every depth 1 through 23, the already reconstructed DH modulus range. This gives **5,888** reverse-tree objects.

Exactly one has 121 nonroot nodes:

`root 115, depth 20`.

There is no second root/depth explanation inside this family.

### Every unknown page × every authenticated source word

For each of the 55 rune-bearing unknown physical pages, use its own next pointer `T[page]` as the reverse-tree root. For each of all 43 authenticated words in the 2016 signed message, use that word's GP0 as the depth. Compare the resulting nonroot-node count with that page's exact original rune count.

This charges **2,365** page/word combinations.

The only match is physical **p32**, root **115**, depth **20**, supplied by **THE**, with count **121**. The raw hit list has six rows only because `THE` occurs six times in the signed message; all six are the same numerical rule and same page.

This test uses no p32 ciphertext values.

## What the scaffold does and does not fix

The reverse tree selects exactly 121 graph nodes, so it supplies a finite state object with the same capacity as all p32 runes. It does not yet fix a unique bijection between rune positions and graph nodes.

The original six p32 printed line rune counts are

`[25,23,23,21,22,7]`.

They do not directly register to the twenty reverse-depth layers above. Thus the source typography does not immediately tell us to place one line on one tree level.

The fixed graph supports several low-description traversals. Before language inspection, the SFT charges:

- breadth-first and depth-first pre/post traversal;
- ascending or descending child address;
- direct node address, successor byte, depth, edge difference, row-edge difference, or column-edge difference as a GP29 additive stream;
- both additive signs.

That is **72** source-fixed direct consumers. The original p32 ciphertext IoC is **0.0341597796143**; clear p57 is **0.0627099664054**. The best tested direct consumer is descending postorder with depth subtraction at **0.0402203856749**, and its full output is nonlinguistic. The best edge-difference consumer is lower still. These are bounded negatives for direct additive use of the scaffold.

Existing work separately rejects the 11-cycle row/column additive schedules, circulant Hill-11 keys, H-shell p32 transforms, direct route-index use, simple image-tile pads, and several p32↔p55 transfer models. This report does not reopen those families.

## Research decision

The new result moves the p32 problem from an unselected `121=11²` receiver toward a **source-selected 121-node graph object**:

`EPIPHANY SEEKS THE DEVOTED`
→ forward p50 walk of depth `p=23`
→ physical p32
→ next pointer `32→115`
→ reverse in-tree to authenticated depth `THE=20`
→ exactly `EPIPHANY=121` nonroot nodes.

This is a coherent human-scale sequence using the authenticated wording, the already selected byte-pointer operation, and the page's visible tree motif. The remaining missing instruction is how the 121 ciphertext runes are assigned to or read from those 121 nodes, and what value operation accompanies that traversal.

The next discriminating experiment should therefore test a **small source-defined traversal/transposition family on this exact fixed tree**, preferably with an untouched consequence or solved control. It should not enlarge the additive key menu or tune arbitrary graph features to English.


## Canonical tree-order transpositions: negative

A separate source-fixed test assigns the 121 source-order p32 runes to the fixed reverse tree under one canonical traversal, then reads the same node labels under another. The six declared orders are BFS, DFS preorder, and DFS postorder, each with children ordered by ascending or descending original p50 cell address. This gives **36** complete permutations and no symbol-value fitting.

The [tree-transposition SFT](../sims/lp2_p32_reverse_tree_transposition_sft.cjs) passed on Windows Node 22 in [run 44447890471](https://github.com/FlareZ123/liber-primus/actions/runs/44447890471). It scores every full 121-rune result against a frozen GP-native trigram model trained on the repository's independent Gibran control corpus.

- Original p32 source order: **−11.6742072**
- Best tree transposition, BFS-ascending assignment → descending postorder read: **−11.4672006**
- Clear p57: **−8.1230342**
- Held native-English 121-rune median: **−8.3413634**
- Held native-English 121-rune minimum: **−9.4370118**

The best permutation remains substantially below even the worst held clear-English window and its preview is nonlinguistic. Therefore the fixed reverse-tree scaffold does **not** decode p32 by a plain BFS/DFS transposition alone. A useful next operation must consume the parent-child relation or another independently selected graph value rather than simply changing read order.
