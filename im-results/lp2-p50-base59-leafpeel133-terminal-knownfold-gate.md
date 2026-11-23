# LP2 table leaf-peel to known terminal plaintext: independent original-cipher decision

**Agent31, 23 November 2026. Evidence: original-source visual/arithmetical clue and a bounded exhaustive secret-function contradiction.** No unknown LP2 plaintext, creator-authenticated key, cipher, or destination is recovered.

## One newly explicit route from the original puzzle to an inverse

The original p49–51 source prints 256 two-character numerals on 32 rows × eight columns. Among the 60 conventional digit glyphs, lowercase \`f\` is absent. The previously documented *conditional* base59 interpretation removes that character, decodes the table to addresses 0–255, and yields a single directed in-tree rooted at the self-loop **189**. The author's final clear p57 **PARABLE** asks us to “shed our own circumferences”; p55 depicts a tree. A human could therefore remove the numerical graph's outer **indegree-zero nodes** repeatedly, without fitting ciphertext.

The resulting exact first five layer sizes on the original table are **95, 38, 21, 14, 10**, and the full tree has **39** removal layers. The first two layers contain **95+38=133** entries. A separate preserved 2014 delivery artifact contains literal \`<title>133</title>\` and \`<div id="331">\`. This exact number match is a *new exploratory cross-source association*, **not** evidence of authorship. The original HTML does not tell solvers to change radix, build the table's functional graph, peel layers, or use 133 as a cipher parameter. The 95-leaf count is known to be a typical consequence of the source value histogram, and 133 must not be granted an uncorrected surprise probability.

The natural possible *plaintext receiver* is the ending of the book: physical p57 has **95 clear GP29 runes**, p56 has **85 independently solved GP29 plaintext runes** under the exact original prime-totient/F-bypass cipher, and preceding unknown p55 has **76**. Allocate the 95 known p57 runes to the first peeled layer, the 85 known p56 runes to the next 85 peeled nodes, and reserve the remaining **76** inner nodes as the hypothetical still-encrypted p55 plaintext. This reads the terminal pages **backward from the outside inward**, which is specifically different from prior [internal-node address and DFS assignments](lp2-p50-base59-tree95-p57-leaf-key-original-gate.md) that place p55 before p56.

The independent rival is that the table is unrelated high-entropy numeric material and the shell title is a coincidental matching numeral. This report tests an explicitly restricted inner-propagation model; it does not assume the geometry is a real cipher.

## Exact all-secret parent-fold gate

Let \`children[v]\` be the original numeric addresses that point to node \`v\`, omitting the root's self-loop. Let \`depth[v]\` be its breadth-first *leaf-peeling* layer, with leaves at depth0. Suppose the runic value at each parent is

\[
P[v]=F_{\mathrm{depth}[v]}\left(\sum_{u\in\mathrm{children}[v]}P[u]\bmod29\right).
\]

Grant **39 separate completely arbitrary secret functions** \`F_d : Z29 -> Z29\`, independent at every peeling layer. They can be nonlinear, noninjective and unknown; the test never guesses a key. For any two known parent nodes at the same peeling depth receiving the same child sum, their assigned known plaintext runes must match. This is necessary irrespective of all hidden function tables, so any contradiction eliminates the entire specified family. A successful model could propagate outward known text inward when a function's required inputs are observed, although deeper unknown nodes might require additional key entries.

The SFT takes actual clear p57 indices and separately reconstructs p56's complete **85-rune native GP plaintext**. It verifies p56's **one literal F at rune56**, the **84** consumed prime clock entries and exact forward re-encryption of the original 85 published p56 ciphertext runes. The source table and physical p55/p56/p57 lengths are checked before testing the hypothesis.

The only frozen reading ambiguity is (i) ascending or descending printed **addresses inside each peeled layer**; (ii) normal or reverse p57 clear text; (iii) normal or reverse solved p56 text; and (iv) GP index versus the canonical GP prime weight modulo29, resulting in **16** complete assignments.

| Original source test | Exact result |
| --- | --- |
| Original nodes, leaf-peel layers, root | 256; 39; 189 |
| Clear p57 leaf assignments | 95 |
| Independently solved p56 holdout parent equations | 85 per orientation |
| Secret-function conflicting assignments across all 16 orientations | **24–38** |
| Minimum conflicts, all secret per-layer maps | **24/85** |
| Independently synthesized source-leaf plant | **0 conflicting known equations**; all 256 parent values check exactly |

**Example of a contradiction.** The original-runic orientation which minimizes contradictions uses the ascending-address layers, clear p57 forward, clear p56 reversed, and literal GP indices. It already yields **24 inconsistencies** where the same \`(depth, child-sum)\` input would need incompatible parent output glyphs. No choice of the 39 unknown mapping tables can resolve one such contradiction. This conclusion uses the authentic *decrypted* p56 text, avoiding the much easier but invalid test against its ciphertext. Positive control computes every tree node under the known hidden rule \`F_d(x)=(17x+3d+2) mod29\` starting from the genuine p57 plaintext leaves; the exact same conflict detector accepts all 85 planted middle observations and every forward tree relation. This checks the mechanism's ability to recognize a true fold, without making it an original author instruction.

## Decision and remaining path

**Retire this complete source-natural breadth-first leaf-peel GP29 child-sum fold architecture as an explanation of the original p56 and p57 terminal plaintext.** It cannot yield original p55 text under any hidden \`F_d\` for the 16 frozen readings. This is a materially distinct gate from the earlier address/DFS key and unary folds, though it does not exclude an address-dependent state update, a different page-to-shell assignment, a keyed permutation among shells, a cipher applied to a separate register, or a completely different role for the table.

The original numeric table's conditional radix59 root and the 133 cross-source equality remain unproven as a decryption route. The newly tested decoder fails on an independent fully solved original-language target; **do not expand it into arbitrary per-node keys or postselected shell positions**. A productive follow-up would require an author-selected edge/parent operation capable of predicting some original solved p56 runes *before* considering unreadable p55, or a genuinely recovered source key. This result alone changes no established manuscript plaintext.

**Reproduction:** [one read-only, Windows Node22 CommonJS SFT](../sims/lp2_p50_base59_leafpeel_terminal_knownfold_sft.cjs). It reads only the original numeric corpus, canonical original GP29 runes, and official GP-prime mapping; it contains a source-matched synthetic positive and prints all 16 exact contradictions.
