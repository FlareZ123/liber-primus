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

## A shorter signed-MAP entry to the same p32 receiver (21 November 2026)

There is a distinct, more direct *candidate* human route to the identical destination, using the authenticated 2016 sentence “Its words are the map, their meaning is the road, and their numbers are the direction” and its earlier “Epiphany seeks the devoted.” It uses two source-defined numerical readings and literal forward pointers; it derives **no unknown key**.

- In standard GP prime weights, `MAP = M(71)+A(97)+P(43) = 211`. Address **211** is a valid cell in the original 256-entry p50 pointer table.
- `DEVOTED` contains **7** canonical GP runes. Following seven original bytes from **211** gives `211→61→196→176→235→121→237→32`, ending at **physical p32**.
- The fifth pointer state is **121**, independently `GP0(EPIPHANY)=121` and the unchanged p32 glyph count. `EPIPHANY` itself is signed-message word **5** (zero-based); this 5-step coincidence is retrospective, not a demanded input. The next pointer leads `32→115` into the very same 121-node reverse tree below.
- The complete noncycle in-tree at state115 has **131 nodes including its root**, equal to `GP0(CIRCUMFERENCES)=131` from independently clear p57. The depth-`GP0(THE)=20` nonroot cut has **121 nodes**. The 131 equality is further suggestive post-discovery context.

A full, source-frozen competition holds the **7-step** count fixed and starts from every 2016 signed word whose GP prime sum is a valid p50 byte address: **35 of the 43** word occurrences are eligible. **MAP is the only one** whose 7-step endpoint is 32. The 2016 text expressly highlights MAP, reducing the reason to choose its seed after seeing the result. On the other hand, choosing `DEVOTED`'s *rune count* as a pointer depth, using GP-prime instead of GP0 for MAP, and expecting physical p32 all remain inferred interpretations; do not treat this as a calibrated design probability.

As a first, strictly source-originated *ciphertext* consumer, follow `T^i(211)` for **121** consecutive page-rune positions and reduce each authentic pointer byte modulo29 into a shift. Applying `P_i=C_i±(T^i(211) mod29) mod29` directly to all original p32 runes is reversible but **does not decipher** the page: the two original output GP29 IoCs are **0.03526170798898071** (subtract) and **0.03305785123966942** (add), both around the uniform ciphertext level; the rune strings are nonlinguistic. Both inverse signs re-encode all **121/121** original runes and independently recover **121/121** planted GP-native runes drawn from solved p57. This controls the implementation, not the hypothesis. Byte-to-GP29 reduction and additive use are **inferred consumers**, so this test rejects only that minimal direct stream and leaves the navigation path unproved as authorial intent.

The alternative entrance is independently reproducible at [`sims/lp2_signed_map211_devoted7_p32_route_sft.cjs`](../sims/lp2_signed_map211_devoted7_p32_route_sft.cjs), which pins the source phrase positions and all nine table states. It narrows the navigation story and makes an original-reader route more economical than the earlier DH23 address. **It does not specify how to read the 121 ciphertext values as plaintext**, and the direct tree inverse failures recorded below remain decisive for their own tested operators.

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

The complete attached in-tree at 115 contains 130 nonroot nodes, or 131 including the cycle root. The equality 131 = the established GP0 index sum of `CIRCUMFERENCES` is suggestive context, but it was recognized after the tree construction and is not needed for the 121-node result.

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

The source-defined traversal/transposition, edge-calculus, and subtree-zeta families have now been tested on this exact tree and remain nonlinguistic. A discriminating successor would require a new independently selected node-value operation or graph-to-source assignment, with an untouched holdout. Enlarging affine/pad menus is not warranted.


## Direct inverse gates on the selected 121-node tree

The fixed root115, noncycle reverse-depth20, 121-rune receiver is a meaningful source-selected *geometry*, but a node value transform must still be specified. Three distinct, reversible classes of direct operators have now been applied without fitting individual rune keys, editing ciphertext, or selecting a tree root by language scores. All tests preserve six canonical assignment/read traversals: breadth-first, DFS preorder and DFS postorder, each in increasing or decreasing original cell-address order.

1. **Plain traversal transposition (36 cases):** pair any assignment with any read traversal, without changing rune values. The best original p32 GP-native trigram score is **−11.4672006**, below the independently held native-English 121-rune minimum **−9.4370118**. [Transposition SFT](../sims/lp2_p32_reverse_tree_transposition_sft.cjs); [Windows 22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44447890471).
2. **Parent-child edge differences and integrations (216 cases):** the same six assignments and six reads, three fixed tree-root GF29 seeds (0, 115 mod29=28, 247 mod29=15), and two inverse directions. Best original score **−11.2315618**, also nonlinguistic. [Edge-transform SFT](../sims/lp2_p32_reverse_tree_edge_transform_sft.cjs); [Windows 22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44448056080).
3. **Subtree-zeta inverse (36 cases, Agent11, 21 November):** a different canonical operation motivated directly by branching trees, computing an exact subtree sum instead of local edge differences. The fully specified encoder is `C(v) = P(v) + sum(C(child)) mod29` with all selected descendants contributing recursively and the unselected root115 and depth>20 nodes excluded. Its inverse on each selected node is `P(v) = C(v) − sum(C(child)) mod29`; it is bijective over all 121 GP29 symbols for any given traversal. Assign source p32 ciphertext to nodes in one of six canonical orders and read recovered P in one of six orders. The best of all **36** source outputs is DFS-preorder descending assignment/read at **−11.26549172556508**, IoC **0.03484848484848485**, compared with untouched p32 **−11.6742072**/IoC **0.0341597796**, authentic clear p57 **−8.1230342**, and the worst **−9.4370118** among >50 held native Gibran windows. The independent authentic clear-p57-derived 121-rune plant encodes and exactly decodes **121/121** runes using the identical encoder/inverse; all original outputs stay below the weakest held native control. [New standalone Node22 SFT](../sims/lp2_p32_reverse_tree_subtree_zeta_sft.cjs).

These failures do not invalidate the graph's 121-node coincidence or rule out a keyed tree transducer; they reject direct order-only, edge-calculus and subtree-zeta interpretations. **None recovers unknown plaintext or authentic key material.** A successor needs a source-visible instruction fixing a different value operation, tree-to-glyph assignment, or external operand, rather than tuning more GP29 affine offsets against the same 121 symbols.

## P32's six physical lines select 71/50 and 92/29: a provisional signed route

**Original-source structural relationship, Agent49, 21 November 2026; exact native-GP decryption negative.** The source image physical p32 (49.jpg) ends with a **red 13-dot punctuation mark** and prints **six physical lines** of 121 runes. Their exact line lengths are **[25,23,23,21,22,7]**, giving cumulative original line-end positions **[25,48,71,92,114,121]**. These source-visible cuts support two independently described splits:

```text
lines 1–3: 25+23+23 = 71 runes  = GP0(SEEKS) in the signed 2016 text
lines 4–6: 21+22+ 7 = 50 runes  = physical p50 numeric table page
lines 1–4: 25+23+23+21 = 92 runes  = GP0(EMPTY) in the same signed text
lines 5–6: 22+ 7 = 29 runes  = number of Gematria Primus symbols
entire p32: 121 runes  = GP0(EPIPHANY)
```

**Important original boundary correction:** p32 has **22 page-local word fragments, of which the first is an incoming carry from p31, and 21 complete new word starts**,  with lengths `[1,3,5,11,5,5,3,11,6,9,5,8,4,9,4,8,2,3,2,8,5,4]`, as independently established in the earlier [complete-word coordinate receiver](lp2-p32-22word-length-coordinate-directkey-gate.md). Its physical-line fragments count **[5,4,4,5,6,2]** and sum to 26 only because **four complete rune-words continue across an original line break without an intervening word divider**. The visually split three-line halves each have **13 line fragments**; these are **not 13 complete words**, and the printed lines ending at rune **71** and **92** cut through complete words. The red13-dot punctuation is common to ten original page endings, and attributing its number to the half-page fragment count is speculative. The source-informed **71/50 and 92/29 line geometry remains exact**, while any 13-word interpretation is withdrawn.

Only p22 and p32 among all 57 rune-bearing original physical pages contain exactly six lines. The other six-line page p22 has 16/16 line fragments and 69/62 rune sums across its three-line halves. This is a finite corpus comparison and does not give a selection-adjusted probability of intentional encoding.

### Frozen original base60 word-number route

The independently PGP-authenticated January 2016 text contains **“The path lies empty; epiphany seeks the devoted”** and identifies the manuscript's numbers with direction. Interpreting p32's original three-line **50** as a literal **table address** and the three-line **71** as **forward table-pointer steps** gives

`T^71(50)=115`,

where `T[i]=originalBase60Byte[i]` from the unmodified 256-cell row-major p50 table. The original walk starts `50→47→76→114→197→115`, reaching the root in five steps and using the remaining **66=6×11** steps to traverse six full circuits of the existing 11-cycle. **Root115** is the *independently previously selected* p32 reverse tree of cardinality121. With the conditional alternate base59 numeral reading, **T^71(50)=189**, its unrelated fixedpoint. This is a short-description, source-visible **candidate graph route**, yet the original author did not supply an authenticated rule equating line lengths with an address/step instruction. Since 71 lands back on an eleven-cycle, this is weaker evidence than an endpoint selected from an unrestricted 256-node output.

### Frozen original 92/29 receiver and its bounded negatives

Starting from the same p50 base60 **root115**, its noncycle reverse tree has **92 nodes** through depth **13** and **29 more** through depths14–20, totalling121. P32's actual line4 break after **92** GP29 runes leaves **29** original runes on lines5–6. The printed word layout does **not** end a complete word at rune92; it is only a physical line boundary. The proposed paired geometry is therefore

`p32 original line register 92 + 29 runes ↔ p50 reverse-tree register 92 + 29 nodes`.

No first-party source selects the node-to-rune order, the GF29 operation or an external key. The last29 p32 runes contain just20 distinct symbol identities, precluding the literal use of that suffix as a full 29-symbol permutation. An exact direct source test repeats these last29 original ciphertext runes as an additive key for the preceding92. Another direct test uses the source-selected **71** table steps from **cell50**, taking each visited address or emitted byte as a GP29 additive shift on the first71 ciphertext runes.

| Source-fixed direct candidate | Original GP29 IoC | Original native prose |
| --- | ---: | --- |
| Original first92 unchanged | 0.037505972 | none recovered |
| First92 minus repeated final29 | **0.030339226** | none |
| First92 plus repeated final29 | **0.037744864** | none |
| First71 minus / plus visited cell address | **0.035412475 / 0.035412475** | none |
| First71 minus / plus emitted next byte | **0.037826962 / 0.035010060** | none |

All six exact original-cipher results fully reencrypt their unchanged original register; each also recovers every genuine solved-p57 plaintext rune in separate 92- or 71-rune native-GP29 plants. **No unknown p32 plaintext, authentic key, cipher, or destination was recovered.** This is evidence against these *direct consumers only*, and the inferred original source route remains a provisional clue architecture.

[Standalone read-only Node22 SFT using the actual 22-word/26-fragment distinction, six original lines, tree and complete original cipher registers](../sims/lp2_p32_thirteen_word_empty92_tail29_source_sft.cjs). [Corrected-source Windows Node22 PASS run44952975955](https://github.com/FlareZ123/liber-primus/actions/runs/44952975955), which separately checks the 26/22 line-fragment/local-word distinction and the lack of real word boundaries at 71 and92. The next justified decision is to identify an independently clue-specified map from tree node to p32 cipher-symbol and a value-changing operator, with a held-out plaintext receiver rather than adjusting arbitrary additive pad phases.

## Complete tree cardinality independently returns page 32

Before the authenticated depth cut, the complete rooted in-tree at p50 cycle state115 contains **131 cells including root115**. Since 131 is the **32nd prime**, ordinary prime indexing returns physical page32 from the complete tree itself. This occurs immediately after the already selected forward route: `DEVOTED=102 → 32 → 115`.

This is part of a wider exact partition of the 252-cell 11-cycle basin. In cycle order, the rooted component sizes are

`[3,1,2,13,2,59,23,3,131,2,13]`.

Every non-singleton component size is prime. The corresponding prime indices are `[2,–,1,6,1,17,9,2,32,1,6]`. The [prime-component SFT](../sims/lp2_p50_prime_cycle_components_sft.cjs) passed in Windows Node22 [run 44449154221](https://github.com/FlareZ123/liber-primus/actions/runs/44449154221). Among 1,900 exact-byte-multiset shuffles retaining an 11-cycle at cell0, 45 retain the all-prime-or-singleton partition property, 4 contain any 131-cell component, and none reproduce the observed ordered partition.

The page selection therefore has two nested graph facts: the **complete tree has prime cardinality 131 → page32**, while the authenticated **THE=20** reverse-depth cut selects **121 nonroot nodes = EPIPHANY**, exactly the page's rune count. The original p32 illustration is itself a tree, which makes this a compact clue-constrained receiver hypothesis. None of these facts yet specifies the rune-to-node bijection or plaintext operation.


## Solved-p57 tree grammar on the same rooted component

The solved p57 instruction supplies an independent entry into the same graph object. Canonical GP0 gives `SHED=64`; SHED has four GP runes. Four ordinary base60 pointer steps are

`64→122→86→111→115`.

Root115 is exactly the 131-cell rooted component above, and `GP0(CIRCUMFERENCES)=131`. Across the unique solved-p57 vocabulary, SHED is the sole word for which “start at the word's GP0, walk for that word's GP-rune count, then read the endpoint component cardinality as another solved-p57 GP0” produces a p57 word pair: **SHED → CIRCUMFERENCES**.

The fixed root115 depth histogram contains several authenticated cumulative counts. The manuscript-native p28 DH selector reconstructs the standard DH23 private exponents **a=6** and **b=15** from the public tuple. At exactly depth a=6 the tree has **42 nonroot nodes = FIND**; at exactly depth b=15 it has **105 nodes including root = DIVINITY**. Depth7 has 53 including root = LIKE; depth10 has 78 including root = INSTAR; depth20 has 121 nonroot = EPIPHANY; the complete depth24 tree has 131 including root = CIRCUMFERENCES.

The two root branches make the p57 wording more specific. The branch through physical p32 contains 93 cells in the complete tree; adding root115 gives **94 = TUNNELING**. The sibling branch through111 contains 37 cells; adding root115 gives **38 = WITHIN**. Their shared-root union is the full 131-cell CIRCUMFERENCES tree: `94 + 38 - 1 = 131`.

At reverse depth15, the sibling branch is already complete at 37 cells, while the p32 branch contributes exactly **67 = SURFACE**. With root115 assigned to WITHIN, the partition is therefore **SURFACE67 + WITHIN38 = DIVINITY105**.

At the authenticated `THE=20` cut, the p32 branch contributes 84 cells. Excluding physical p32 itself leaves exactly **83 = EMERGE** descendants. The other branch contributes 37 cells, so removing both root115 and p32 from the selected depth20 object leaves **37 + 83 = 120 = PARABLE**. Replacing the distinguished p32 node with root115 gives **WITHIN38 + EMERGE83 = EPIPHANY121** by cardinality. This one-node exchange is now explicit; it remains a structural grammar until a source instruction fixes the corresponding rune traversal or value operation.

Reproducer: [`sims/lp2_p57_p50_tree_word_grammar_sft.cjs`](../sims/lp2_p57_p50_tree_word_grammar_sft.cjs), Windows Node22 run **44452339078** passed.

## Authenticated 2016 values hit p32's mixed word and physical-line boundaries

**Source-boundary correction (Agent49, 21 November):** an earlier version of this report incorrectly treated **26 line-fragments** on p32 as 26 complete words. The original text has four unhyphenated physical line wraps *inside* words. P32 instead has **22 page-local word fragments**, including an initial one-rune carry from p31, and **21 new complete word starts**, as already established in the separately updated [signed-2016 p32 research synthesis](lp2-tree121-signed2016-source-gate.md). Removing the line wraps gives the accurate page-local word-runeboundary indices:

`[1,4,9,20,25,30,33,44,50,59,64,72,76,85,89,97,99,102,104,112,117,121]`.

The earlier **26 line-fragment** boundaries, which additionally include physical line wraps after rune positions **48,71,92,114**, are still exact source geometry:

`[1,4,9,20,25,30,33,44,48,50,59,64,71,72,76,85,89,92,97,99,102,104,112,114,117,121]`.

The five signed GP0 values `THE=20`, `SEEKS=71`, `EMPTY=92`, `DEVOTED=102`, and `EPIPHANY=121` are all among those **mixed boundaries**. However **71 and92 are physical line breaks within complete words**, while20,102 and121 are actual page-local word endings. Consequently, the earlier claim that these five are all complete word boundaries, or that p32 has 26 complete words, is **retracted**. The mixed structure remains observable on the source image, and the original base60 pointer graph still has an exact route between those four initial values:

`SEEKS 71 → EMPTY 92 → THE 20 → DEVOTED 102`.

The full unchanged table roads are `71→108→14→183→81→58→146→92`, then `92→236→238→129→179→175→18→15→212→70→169→228→144→125→20`, then `20→102`. None of the intermediate source states is among the full 26 **line-fragment boundaries**, so none is among the 22 local whole-word boundaries either. The path therefore remains an exact *mixed punctuation/line-layout numerical fact* under the original table-pointer interpretation; it is weaker as evidence for the signed sentence **“words are the map”** than the old, incorrect word-boundary description. No author instruction chooses this route or specifies a decoding operation.

The prior bounded negative tests of a line-fragment-seeded per-rune clock and fixed scalar per fragment remain numerically valid on the unchanged ciphertext, but are **not** tests over 26 actual words. [Legacy numerical SFT with line-fragment parsing](../sims/lp2_p32_signed_word_boundary_receiver_sft.cjs), [Windows Node22 prior PASS 44450837758](https://github.com/FlareZ123/liber-primus/actions/runs/44450837758). For corrected 22-local-fragment source tests see the [current six-line visual-gate SFT](../sims/lp2_p32_thirteen_word_empty92_tail29_source_sft.cjs), [Windows PASS44952975955](https://github.com/FlareZ123/liber-primus/actions/runs/44952975955). Neither recoverable unknown plaintext nor an independent key results.
