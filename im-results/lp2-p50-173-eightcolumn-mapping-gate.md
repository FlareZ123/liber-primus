# P50 eight-column root173 receiver: source nodes fail to specify an eight-column permutation

**Agent2, 21 November 2026. Director #2098. Classification: source-native map-selector negative; no recovered original plaintext or key.**

## Independent source starting point

The authentic solved p57 PARABLE second clause has GP-prime sum **1,031**, one-based prime ordinal **173**. The original p50 table has **32 rows × eight printed columns**. Under the conditional conventional base60 `byte[address]` successor interpretation, root173 has exactly **eight reverse descendants**. This count agrees with printed column count, motivating a one-to-one column-selection test before any cryptanalytic use.

The complete **original** eight-node component and oriented edges are:

```text
root173 → (reverse children) 26, 84, 147, 239
node84 → (reverse children) 41, 93, 215
```

The source-original breadth-first address sequence is **[173,26,84,147,239,41,93,215]**; numeric ascending address sequence is **[26,41,84,93,147,173,215,239]**. Both follow from original 256-byte source table pinned SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, with p57's independent clause sum checked directly.

## Bounded eight-column decision

The most direct spatial assignment to columns is the original cell's **printed column**, `address mod8`. At the eight source nodes in root-first BFS order, the values are:

`[5,2,4,3,7,1,5,7]`

Only **six distinct** physical column indices appear. Columns **0 and6** are entirely missing; columns5 and7 each repeat. The original table byte values modulo8 are also nonbijective: **[5,5,5,5,5,4,4,4]**, only two unique values. A synthetic eight-cell original-style row `[0,1,2,3,4,5,6,7]` passes the identical direct-column uniqueness rule, so this is a meaningful negative original result, rather than a test that could never succeed.

A second, less direct approach ranks the eight numeric addresses from small to large and then visits the graph under an ordinary traversal. This *always* produces eight distinct rank labels but leaves the eight-column **order entirely unfixed**. Three standard graph traversals with children in original printed address order give incompatible permutations:

| Source-native traversal | Ascending-address rank sequence, 0–7 |
|---|---|
| Breadth first | **[5,0,2,4,7,1,3,6]** |
| Depth first, node first | **[5,0,2,1,3,6,4,7]** |
| Depth first, node last | **[0,1,3,6,2,4,7,5]** |
| Literal numeric ascending address | **[0,1,2,3,4,5,6,7]** |

Neither the table layout nor the solved p57 passage specifies BFS, preorder, postorder or numeric sort as a key rule. There is no other independent source-authored selector in the supplied evidence; choosing an order because its ciphertext output looks like English would violate the issue's fixed decision gate. Accordingly, **no original receiver decryption or novel key claim is warranted**.

## Director outcome

The eight-vertex count is a genuine but **insufficient** source-linked structural correspondence. The immediate two physical-column projections fail as bijections, while candidate rank-based orderings compete. Close the root173-as-an-eight-column-key route until a first-party traversal opcode or independent original-image clue uniquely selects a permutation. Do not search 8! orders or fitted page keys. [Reproducible Node22 CommonJS SFT](../sims/lp2_p50_173_eightcolumn_mapping_sft.cjs).
