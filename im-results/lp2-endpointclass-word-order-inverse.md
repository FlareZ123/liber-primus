# Seam-preserving endpoint-class word-order inverse

**Decision:** Director [#2691](https://github.com/FlareZ123/liber-primus/issues/2691). A deterministic class-local permutation can preserve every original seam while changing word lengths, but the source does not select its class definition or order. The fixed page-local outside-in candidate is actually inert on every distinguishable original class. No original plaintext scoring, unknown plaintext, or key.

## Mechanism and independent cue

Authentic p57 says to shed circumferences; the signed 2016 message links words to a map and their numbers to direction. Prior #1323 used a literal alternating-end order within marked blocks. Its original receiver failed and the source did not uniquely select that order. Here use a *different* conditional operand: the first/last rune pair of each complete ciphertext group, interpreted as its two endpoints. Freeze chapter endpoint groups and all 32 cross-page carries. Group remaining words by physical page and ordered first/last ciphertext rune. Within the ascending slot indices of each class, emit the class-local input positions in outside-in order (0,n−1,1,n−2,...). The decoder identifies the exact same slot sets from the ciphertext itself and applies the inverse permutation. Two words with identical endpoints and length are still separate positional objects, so no ciphertext sorting or loss of identity occurs. Identical full words are interchangeable without changing the reconstructed rune tape.

Every per-slot endpoint is unchanged, so every one of the 2,895 directed seams remains unchanged. Page-local shuffling preserves total page rune count and the fixed carried groups; exact line typography need not survive. The page partition is available to the inverse. Chapter-only classes can move lengths across page boundaries and do not preserve page totals.

No independent first-party source states that 'circumference' means first/last rune endpoints of complete ciphertext words, that these classes are per-page, or that the class order is alternating-end. The selected algorithm is therefore a constructive exploratory demonstration, not a source-authenticated opcode. The earlier #720/#1323/#1360 global column and marked-block tests were not repeated.

## Exact information budget

Canonical 2,896 complete groups and 32 carries, nine original chapter counts 158/255/383/437/224/326/378/669/66. Within each class of size n, distinct word orderings number n!/product multiplicity factorials; count distinct length sequences similarly. Multiply the exact integers across classes, then report log2. These are exact counts for the specified class-permutation subfamilies, not counts of all seam-preserving permutations. The ceiling is the worst-case selection-bit budget for arbitrary orders among these distinguishable tapes; a genuinely source-selected deterministic rule would not require arbitrary-order bits.

| Class scope | Fixed length? | log2 distinct tapes | log2 distinct length tapes | Distinguishable movable slots | Mixed-length slots |
|---|---|---:|---:|---:|---:|
| Chapter | yes | 80.584963 | 0 | 159 | 0 |
| Chapter | no | 637.288853 | 556.703891 | 1085 | 971 |
| Page | yes | 10 | 0 | 20 | 0 |
| Page | no | 89 | 79 | 178 | 158 |

The chapter + fixed-length result is the #2679 calibration, not a new finding. A permutation that preserves each slot's length **cannot restore word-length grammar at all**. The new page-local variable-length construction has exactly 2^89 distinct ciphertext tapes and 2^79 length tapes, with 89 nontrivial classes containing exactly 178 positions, hence all nontrivial classes have size two. At most 158/2896 length slots can change, and the other 2738 are fixed. This sharply limits what this family can explain; it does not prove that no grammar improvement is possible. The chapter-wide option has 638/557-bit worst-case tape/length choice budgets but no page-total guarantee.

**Important decisive consequence:** our frozen alternating-end ordering is the identity on a two-element class (order [0,1]), and on every all-identical class it leaves the visible tape unchanged. Therefore this exact page-local rule cannot change the original tape even if the missing source selector were supplied. Do not rescue by changing direction or class scope after this result.

## Native inverse controls

Encrypt authentic solved native GP29 runes with the historically solved LP1 WARNING Atbash law 28−P. Divide into declared 50-word page blocks, freeze chapter ends, apply the class-local outside-in permutation, and give only scrambled ciphertext and public block boundaries to the inverse. No plaintext or true order is available to the receiver. It restores every word and then applies Atbash. The held-out blocks use the same fixed rule without reordering choices.

| Control | Changed word slots | Changed length slots | Exact prefix | Exact withheld |
|---|---:|---:|---:|---:|
| WARNING (short sanity) | 0 | 0 | 184/184 | 0 |
| WELCOME | 4 | 4 | 193/193 | 322/322 |
| First KOAN | 8 | 8 | 358/358 | 422/422 |
| LOSS OF DIVINITY | 12 | 8 | 411/411 | 344/344 |

All native seam pairs and page totals exactly preserved; 1,088 withheld native runes recovered. Explicit mixed-length four-member class also reverses exactly and changes lengths [3,4,3,5]→[3,5,4,3]. Native plants are implementation controls for the declared mechanism, not evidence of the creator's selection.

[Single-file CJS reproducer](../sims/lp2_endpointclass_word_order_inverse_sft.cjs), commit 163b27d4d5bcd4bb8fd2ec7409243dcb57ded3d9, executed in connected V8. Original capacity derived without scoring any candidate plaintext or arbitrary ordering.

**Director fork:** close this specific exploratory mechanism. A new source-selected class/slot traversal or actual carrier is required to recover arbitrary order. H-decoy and pre-encryption shuffling remain stronger rival explanations for joint seam suppression and near-null word-length grammar, without an established decoder.
