# Original LP2 all-secret 5-bit XOR cycle-walk feedback graph obstruction

Agent 5 / #2273, 24 November 2026. The earlier puzzle's byte XOR operations and GP29 alphabet inside a five-bit domain motivate an explicitly exploratory reversible format-preserving XOR receiver. Neither independently selects the model, the five-bit labels, or its feedback. This is a distinct non-additive group law rather than another prime-rank parameter or arbitrary secret lookup. No original plaintext recovered.

## Complete reversible model

Choose an arbitrary 29-element subset A of GF(2)^5 (three missing labels), arbitrary plaintext and ciphertext bijections S,C from GP29 to A, and arbitrary fixed five-bit mask K. For previous observed ciphertext rune u, set q=C(u) XOR K. Define T_q(x)=x XOR q if that result belongs to A, and x otherwise. Because XOR by q is an involution, this is its cycle-walk permutation on A, also an involution. Encode ciphertext rune v=C^-1(T_q(S(p))). Decode p=S^-1(T_q(C(v))). The previous ciphertext is public; first predecessor is fixed at rune0 and may otherwise be arbitrary without affecting the observed singleton edges. This preserves every GP29 symbol including F, every printed word boundary, and all page carries; no key skip or hidden escape flags.

Three full independent solved-source plants use different private 29-label subsets, separate plaintext/cipher alphabets and secret masks. All 2,979 source runes each (8,937 aggregate) invert exactly.

## All-secret graph theorem

Let the singleton plaintext vocabulary have at most k symbols; call their embedded labels B⊆A. Consider the directed observed predecessor/current pairs u→v at every complete one-rune word. If v's ciphertext label C(v) is not in B, then the cycle-walk fallback cannot be the actual decoded plaintext label: fallback would return C(v), not in B. Hence for each such edge the direct XOR candidate must satisfy

C(u) XOR C(v) = K XOR S(p) ∈ K XOR B.

Remove incoming edges to the k or fewer possible current glyphs with C(v)∈B. In the remaining undirected graph on ciphertext glyph identities, every vertex has at most k neighbors, because each offset gives at most one neighbor under an injective embedding. Moreover each connected component lies in one coset of the subgroup spanned by the ≤k offsets and has size at most 2^k. These statements hold for **every possible label subset, separate secret alphabet, mask, and assignment of singleton plaintext glyphs**, even granting arbitrary fallback on all deleted incoming edges. Enumerating possible target glyph sets is enough; no secret permutation search. Grant exactly k deletions since adding deletions cannot invalidate either necessary graph bound.

## Exact original result

The full canonical p0–55 tape has 12,956 runes, 2,896 complete words and 83 singleton edges, none at the initial rune or an adjacent-equal step.

| Max allowed singleton types k | Deletion sets tested | Min attainable maximum degree | Min attainable largest component | Degree-feasible sets |
|---:|---:|---:|---:|---:|
|4|23,751|7|25|0|
|5|118,755|6|23|0|
|6|475,020|6|22|1,307|

For k=4 every possible graph also violates the component bound16. The six-type survivors are necessary-constraint witnesses only, not actual XOR embeddings or plaintext. Therefore any complete original decoding in the specified XOR-feedback family requires **at least six distinct singleton plaintext symbols**, even though authentic solved native GP source uses only three (A/I/T); generous ordinary vocabulary A/I/O/T has four. The exact true singleton target sets on all three planted source controls satisfy the bounds, with actual maximum degrees2 and largest components4,5,4. The short donor control graphs are sparse and do not identify their keys; the positive check validates soundness, not discriminator power against wrong keys.

## Decision

Reject this common fixed-mask XOR cycle-walk feedback under the ordinary source-native singleton vocabulary, independently of every private 29-of-32 label embedding and separate GP alphabet. The graph gate does not cover changing masks per word/position, changed segmentation or six-plus singleton types; a different plaintext register or state law needs independent evidence. No source-visible selector or authenticated unknown plaintext is supplied. Do not optimize alphabet embeddings for this model.

[Exact source SFT](../sims/lp2_xor_cyclewalk_feedback_allsecret_graph_sft.cjs), executed in connected JavaScript on canonical original and native solved source. Code commit 7dc390f537c603bcd9cf9f826afc17047ce82f04. No CI claim.
