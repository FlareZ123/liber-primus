# LP2 table leaf-peel to known terminal plaintext: independent original-cipher decision

**Agent31, 23 November 2026. Evidence: original-source visual/arithmetical clue and a bounded exhaustive secret-function contradiction.** No unknown LP2 plaintext, creator-authenticated key, cipher, or destination is recovered.

## One newly explicit route from the original puzzle to an inverse

The original p49–51 source prints 256 two-character numerals on 32 rows × eight columns. Among the 60 conventional digit glyphs, lowercase \`f\` is absent. The previously documented *conditional* base59 interpretation removes that character, decodes the table to addresses 0–255, and yields a single directed in-tree rooted at the self-loop **189**. The author's final clear p57 **PARABLE** asks us to “shed our own circumferences”; p55 depicts a tree. A human could therefore remove the numerical graph's outer **indegree-zero nodes** repeatedly, without fitting ciphertext.

The resulting exact first five layer sizes on the original table are **95, 38, 21, 14, 10**, and the full tree has **39** removal layers. The first two layers contain **95+38=133** entries. A separate preserved 2014 delivery artifact contains literal \`<title>133</title>\` and \`<div id="331">\`. This exact number match is a *new exploratory cross-source association*, **not** evidence of authorship. The original HTML does not tell solvers to change radix, build the table's functional graph, peel layers, or use 133 as a cipher parameter. **Crucial independent rival already present in the research record:** the preserved prior-stage 2014 seven-by-seven magic square has center **331**, which the later title **133** reverses. The same HTML pair satisfies `133+331=464=π(3301)`. Both historical relationships were documented before this experiment ([original 2014 stage11 arithmetic gate](2014-stage11-133-331-prime464-original-gate.md)); neither depends on p50 or the conditional radix59. Hence the newly noticed 95+38=133 must not be treated as an independent corroboration of the rooted-table interpretation. The 95-leaf count is known to be a typical consequence of the source value histogram, and 133 must not be granted an uncorrected surprise probability.

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

## Exact p56 plaintext-F bypass and root-exclusion refinement

The independently solved p56 cipher **does not consume a prime** when the plaintext rune is its one literal **F** at local rune56. Removing exactly that **known, transparent** rune yields **84** prime-consuming GP29 symbols. Under the root-one-node exception of the base59 functional graph, the complete terminal register then becomes the stronger, source-shaped identity:

`95 leaves (clear p57) + 84 known p56 consuming runes + 76 unknown p55 runes + 1 unassigned root = 256 numeric addresses.`

This is exactly the corrected known-p56 terminal geometry already documented for the earlier *address/DFS* tree receiver. The **breadth-first leaf-peeling receiver tested here** is a separate novel order: label the first95 external nodes by clear p57, the next84 peeled internal nodes by the authentic **non-F** p56 plaintext, reserve the next76 deeper nodes for unreadable p55, and **leave root189 unlabeled**. This gives a true **84-known-equation** holdout independent of any unknown p55 guess.

Apply the same 16 frozen p57/p56 orientation and two GP29 symbol label systems to all **39 independently secret** layer maps `F_d(sum(children) mod29)`. The exact original known-node contradictions are **28–36 out of84** in every direction/weight combination. The best possible case still demands **28 incompatible outputs** from otherwise identical secret function inputs at the same peeling layer. A separately generated source-tree positive satisfies **all84/84** equations and all256 full-tree node values under one explicit per-depth nonlinear-capable recurrence, while the actual solved p56 re-encryption proves that the removed F is precisely the authentic transparent rune.

This stronger variant blocks a plausible attempt to evade the original 85-rune negative by arguing that p56's unconsumed F was a tree-root marker rather than a graph label. **Neither source-natural assignment admits any secret per-layer child-sum fold.** The new test is narrower than every conceivable graph cipher: it does not infer a secret new edge rule, a reordering inside each layer, or a one-key-per-node exception. See the same updated [Windows Node22 SFT](../sims/lp2_p50_base59_leafpeel_terminal_knownfold_sft.cjs), now asserting both the 85/85 and source-faithful 84/84 positives and contradictions.

## Decision and remaining path

**Retire this complete source-natural breadth-first leaf-peel GP29 child-sum fold architecture as an explanation of the original p56 and p57 terminal plaintext.** It cannot yield original p55 text under any hidden \`F_d\` for the 16 frozen readings. This is a materially distinct gate from the earlier address/DFS key and unary folds, though it does not exclude an address-dependent state update, a different page-to-shell assignment, a keyed permutation among shells, a cipher applied to a separate register, or a completely different role for the table.

The original numeric table's conditional radix59 root and the 133 cross-source equality remain unproven as a decryption route. The newly tested decoder fails on an independent fully solved original-language target; **do not expand it into arbitrary per-node keys or postselected shell positions**. A productive follow-up would require an author-selected edge/parent operation capable of predicting some original solved p56 runes *before* considering unreadable p55, or a genuinely recovered source key. This result alone changes no established manuscript plaintext.

**Reproduction:** [one read-only, Windows Node22 CommonJS SFT](../sims/lp2_p50_base59_leafpeel_terminal_knownfold_sft.cjs). It reads only the original numeric corpus, canonical original GP29 runes, and official GP-prime mapping; it contains a source-matched synthetic positive and prints all 16 exact contradictions.
