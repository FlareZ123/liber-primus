# Shuffled previous-ciphertext-word feedback: exact all-map inverse

Agent44, 26 November 2026. **No unknown LP2 plaintext or authentic key.** A distinct source-key variant of the [shuffled previous-plaintext-word gate](lp2-shuffled-prevword-autokey-pair-gate.md), building on the [ordered direct ciphertext-word inverse](lp2-previous-cipherword-literal-vigenere-gate.md). The actual printed ciphertext groups now supply the complete candidate predecessor key inventory rather than hypothesized lexical plaintext key words.

## Model

Every true word's predecessor is a complete actual ciphertext word, repeated cyclically from its beginning (forward or reversed). A shared map of the predecessor rune x is f(x)=a*x+b+c*(prime[x]-1) mod29, allowing all 24,389 triples, including constants. Current plaintext uses additive GP29 encryption and either ordinary or native literal-F consumption independently per word. Arbitrary whole-word order, arbitrary predecessor reuse, even self-predecessors and unrestricted cross-chapter predecessors are granted. Only the current word is required to belong to the same frozen 40,540 native-GP forms as the previous solver. Thus a missing lexical edge forces that current plaintext word to be OOV, irrespective of predecessor plaintext.

The projective-signature inverse matches each needed key-prefix sequence to all projected prefixes of actual cipher words in 30 directions, deriving the exact scale/bias and storing per-map anchor support. Each positive control's independent ciphertext inventory is kept separate; source target signatures never use plant keys and vice versa. For all reported actual-map positive anchors and representative best original maps, enumerate full compatible predecessor indices and native plaintext forms and exactly replay the forward law. All original source inputs preserve the 2,896 complete groups, 12,956 runes and 343 length>=8 anchors. No inferred word order is used.

## Results

| Original shared-map support over 343 anchors | Number of maps |
|---|---:|
| Zero | 24,239 |
| One | 150 |
| Two or more | **0** |

Every map needs at least 343−1−9=**333** out-of-register groups even after granting nine arbitrary external chapter seed words, versus the allowed 144. Each chapter also fails if it independently chooses its own map; the lower bounds in physical chapter order are 19/25/44/46/24/34/43/82/8 versus budgets 7/12/19/21/11/16/18/33/3. This is exact under the finite lexical criterion, with no search cap, even relaxing the requirement to use a consistent predecessor ordering. The one-edge best maps give no reproducible connected native plaintext.

Four 400-word source-native controls (Gibran, Shakespeare, disjoint Gibran, solved Cicada sections) were recursively encrypted with the *previous ciphertext* group, then shuffled. Each independently recovers its unique hidden map, with all 102/102 long anchor plaintext words uniquely identified; 86/102 also uniquely identify the actual predecessor index. All true edges are retained and exactly replay. No complete Hamiltonian ordering reconstruction is claimed, and the same frozen register contains the donor forms. Initial control constructor syntax was corrected before the executed result.

| Control | Hidden map | Supported anchors | Unique plaintext | Unique predecessor and plaintext |
|---|---|---:|---:|---:|
| Gibran | (3,7,0) | 16/16 | 16 | 13 |
| Shakespeare | (17,21,1) | 29/29 | 29 | 24 |
| Gibran, disjoint | (28,12,11) | 26/26 | 26 | 23 |
| Solved Cicada native | (0,5,13) | 31/31 | 31 | 26 |

**Decision:** the ordered negative for the direct preceding ciphertext word is not rescued by unknown group order, a whole-book inventory of possible source-word keys, or any of the named affine/prime-coordinate maps. Retire this family under intact word membership and the stated native register. No authored instruction for previous-word feedback is established; this bounded extension tested a visible rather than hypothesized key operand. A different source-selected nonlinear or dynamic feedback operation remains outside scope.

[Executable SFT](../sims/lp2_shuffled_cipherword_feedback_allmap_sft.cjs) and [executed raw data](lp2-shuffled-cipherword-feedback-allmap-output.json). V8 execution on fetched inputs; no Windows CI claim.

## Beyond affine/prime maps: arbitrary shared GP29 bijection

Allow an otherwise unrestricted 29! permutation f. If a candidate current plaintext P yields a consumed shift stream T=C−P, the cyclic predecessor prefix K must have exactly the same equality partition as T. This enumerates partial injective maps f(K[j])=T[j] without enumerating the full permutation. Both cyclic orientations, arbitrary actual predecessor reuse and all legal literal-F choices are retained. Two partial maps are compatible iff their union is a partial bijection. Consequently a maximum clique in the compatibility graph (vertices are distinct anchor/map pairs, edges require different anchors and compatibility) is exactly the maximum number of supported anchors in this relaxed model. Every clique extends to a full GP29 permutation.

Original, 25 length>=12 complete groups: **9,248 distinct anchor/map vertices, 56 compatibility edges, maximum clique 2**. Two length-14 groups (754,1353, zero-based) have empty domains; the third (2341) has four. The maximum-clique search finished without a cap and produced a two-anchor partial map on 20 distinct input symbols. Thus at least 23 of these longest 25 groups are OOV absent a seed exception (at least 14 after nine arbitrary seeds). **This does not exceed the full-book 144 OOV budget, so it does not exclude the unrestricted permutation model at that budget.** It is not evidence that the two supported anchors are real plaintext.

The constructive control experiments used 1,401-word contiguous donor excerpts recursively encrypted with a hidden randomly shuffled GP29 bijection, with mixed key direction and F convention; the decoder sees only the ciphertext word inventory. Fit-only inference never uses the original predecessor index or hidden map. The longest-only clique fit produced full anchor support on each of three controls but recovered just 1/17, 20/23 and 15/17 assigned map entries, respectively. A second solver uses exact bitset filtering with minimum remaining domain selection, length>=10, a fixed index-mod-4 train/test split and a 64-solution cap:

| Control | Fit anchors | Held anchors | Fit map result | Correct unique held plaintext |
|---|---:|---:|---|---:|
| Gibran offset100 | 7 | 1 | 64 partial solutions, cap reached, true map not retained | 0/1 |
| Shakespeare offset46541 | 24 | 12 | Unique full 29/29 map, exhaustive | 12/12 |
| Gibran offset1800 | 17 | 3 | Unique partial map, 23/23 assigned entries correct, six unassigned | 2/3 |

In particular, sparse long anchors do not guarantee identification, and the capped first control is a genuine reconstruction failure. The partial-map heldout decoding intentionally refuses unknown shifts. The successful Shakespeare fit proves constructive recovery is possible in this family; it does not rescue the original longest-group incompatibility. Do not claim an all-register or arbitrary-bijection exclusion from the original 25-group result.

[Exact longest-group clique SFT](../sims/lp2_shuffled_cipherword_bijection_clique_sft.cjs), [raw output](lp2-shuffled-cipherword-bijection-clique-output.json); [constructive all-different solver](../sims/lp2_shuffled_cipherword_bijection_fit_sft.cjs), [raw output](lp2-shuffled-cipherword-bijection-fit-output.json). All runs executed in V8 on fetched inputs. 
