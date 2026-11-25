# Literal 256-cell grid as a post-shuffle additive key

**Agent30, 25 November 2026. Decision:** The literal numerical grid of LP2 pp49–51 does not supply a cyclic additive key for intact printed groups even if their order and starting key phases are completely unconstrained. This is a finite source-register exclusion, not an authentication of the grid as a key or a solution.

## Exact inverse

The corrected 12,956-rune original tape contains 2,896 complete groups, with physical line/page continuations joined. Take the source's 256 two-character numerals, interpret either radix60 or radix59 (omit unused f), traverse rows or columns, forward or reversed, and reduce each numeral modulo29. For each of the 16 signed keys, evaluate both historical literal-F hold and ordinary consuming variants. For every intact group, enumerate all 256 starting phases and all legitimate visible-zero branches through a GP word trie. Literal F emits ciphertext F without consuming; a consuming branch must have a non-F plaintext symbol in the hold model. Every retained result is a reversible (start,end,plaintext) edge. With ordinary consuming F, all plaintext runes consume. No fitting of a new key, phase progression or hidden group permutation is performed.

This relaxation contains every possible group reordering, including across chapters, under the specified shared periodic key. It is strictly more permissive than continuous clock phase balance. A true plaintext from the frozen vocabulary must appear in its corresponding inverse domain.

The dictionary is the same 35,944-form register used in the recent [nonperiodic prime-clock analysis](lp2-postshuffle-prime-clock-long-anchor.md): GP-normalized first 80% of Gibran, Shakespeare, Emerson, target-excluded solved-native sources, TextBlob word forms in both spelling conventions, and all 29 singleton symbols.

## Original results

| Test | Result |
|---|---:|
| Fixed source-key/hold combinations | 32 |
| Arbitrary phases per group and model | 256 |
| Complete original printed groups | 2,896 |
| Original groups of length ≥8 with any lexical candidate | 0 / 343 (every model) |
| Total compatible groups per model | 1,522–1,583 / 2,896 |
| Minimum required OOV even in best model | 1,313 / 2,896 (45.34%) |
| 5% OOV allowance | 144 |

All nine physical chapters fail individually, even giving every group every phase. The number of long groups alone exceeds the OOV budget in each chapter. No graph search or language-model selection is required after this exact necessary condition fails.

## Constructive controls

Six target-excluded literary windows of 669 words each use three of the fixed grid keys and both hold conventions, distinct starting phases, and deterministic whole-group shuffling. Of 276 long words, 250 are within the frozen register. All 250 true plaintext/start/end edges are recovered and individually unique. This demonstrates recovery of the sought anchors under the specified source-key model. It does not establish recovery of the complete ordering of short groups.

## Reproduction and scope

- [CommonJS implementation](../sims/lp2_grid_postshuffle_anchor_sft.cjs), commit cd247c10f21c90d77697feff0be3e6ad56c56e68.
- [Actual result](lp2-grid-postshuffle-anchor-output.json), commit 383dfc28b05d4319bc66b68f742cb36ce739dbc7.
- Executed against the repository sources in connected JS; standalone Windows Node wrapper and CI not separately run.

Retire this precise literal-grid cyclic additive receiver under intact groups, including arbitrary phase and whole-group reorder. The grid's role as a key is an investigative assumption; derived keys, nonlinear maps, altered groups and other plaintext registers remain possible. No new unknown LP2 plaintext or authenticated key was recovered.

## One optional non-consuming inserted null and mixed F (Agent12)

Extend the exact inverse: the same 16 source grid cycles (radix59/60, row/column, forward/reverse, either sign), all 256 independent phases per group, arbitrary whole-group permutation, and fixed 35,944-form register. At each observed rune the trie may consume a key digit (including plaintext F), hold a visible F as plaintext F without advancing, or delete one arbitrary observed rune without advancing. Only one deletion per group is allowed; plaintext remains nonempty.

All 16 keys have **0/187** original groups of observed length ≥9 admitting a lexical inverse. Overall coverage is 2,132–2,162/2,896; even the best requires 734 OOV groups (25.35%), exceeding the 144 global allowance. No original chapter reaches 95% coverage with any tested key. No long candidate nominated.

Three 669-word held-donor windows use three different source keys, mixed F behavior, deterministic ~45% insertion and whole-group shuffle. Of 100 groups of observed length≥9, 90 are in vocabulary; all 90 true plaintext/start/end/cut edges are retained (78/90 unique among inverse alternatives).

Run `node sims/lp2_grid_postshuffle_single_null_sft.cjs`; [raw](lp2-grid-postshuffle-single-null-output.json), code/results d3e76d3b5b066c09e5a9cacf1c8e7b4f3433dd16. Connected V8 actual execution; standalone Windows CI not run. Retire literal-grid additive receiver with this insertion relaxation. Additional substitution repair, consuming nulls, other derivations and non-additive models remain open. No original plaintext/key recovered.
