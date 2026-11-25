# Parent–child affine feedback on the exact-size p32/p55 base59 subtrees

The source-conditional base59 directed tree has the unique 121-node subtree at 58 and 76-node subtree at 244, matching p32 and p55, whose original artwork repeats. Earlier direct node-number/depth/edge/byte pads and traversal transpositions do not use a ciphertext-dependent tree receiver. Test the distinct reversible all-consuming GP29 law P(v)=a C(v)+b C(parent(v))+d mod29 (a,b nonzero) on each subtree. The root is an independently unknown IV; its plaintext is unidentifiable and omitted from scoring. Seven natural address/pre/post/BFS orders, both child directions where applicable, are assigned consistently to both pages. No first-party statement selects this cipher; this is a conditional mechanism test.

Enumerate 159152 order/coefficient combinations on the first 80 p32 positions, using a four-gram backoff model trained on Shakespeare and disjoint Gibran/Emerson tails. Freeze the single best and evaluate p32 remaining 41 and all p55. Three hidden-key positive pairs are independently constructed from held-out literature using the actual subtree geometries. Gate requires correct order, all three coefficients and all nonroot heldout plaintext runes on all three plants. Re-encrypt every observed ciphertext including the root seed.

- Plant 1: rank 1, 120/120 nonroot p32 and 75/75 nonroot p55, fit -2.0307, heldouts -1.9130, -2.0303, replay true.
- Plant 2: rank 1, 120/120 nonroot p32 and 75/75 nonroot p55, fit -1.8221, heldouts -2.2657, -1.7817, replay true.
- Plant 3: rank 1, 120/120 nonroot p32 and 75/75 nonroot p55, fit -1.9050, heldouts -1.8825, -2.0525, replay true.

Gate passed.
Original frozen candidate: bfs_desc, (a,b,d)=(11,11,7); fit -5.0916, p32 withheld -7.2267, p55 withheld -7.3311. P32: `[IV]BNXGOMREAPSTMOJUHWCHWIESNEOIULLEWSYSANYOLUPCUSORTUELECDTLTEMTGEANGFFEGNGDONFSOFNTHNEOAEPADNGUAERCFEJJUHUETHEAUPIOIRRIAEGIAGPNXNSEEATH`. P55: `[IV]LEOSLNGIGREXNGSTFEAWOLRERFDWEGTTHWOEEAMROEAEOYSLAEEAEOSUTHNGTHNEIATHOIOEYTEHNJEAEOEAEOBDOEPAENGITHSX`. Full conditional replay true. No authentic plaintext or key is established; these outputs are exploratory and must be judged against the control ranges.

Reproduce: `node sims/lp2_p32_p55_subtree_feedback_sft.cjs`. [Raw output](lp2-p32-p55-subtree-feedback.json). Executed in connected JS on canonical repo inputs, not an Actions run.
