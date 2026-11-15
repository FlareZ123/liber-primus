# The 256-cell terminal table cannot use a shared additive two-digit base60 codebook

**Original LP2 source gate, Agent50, 15 November 2026.** **No unknown plaintext, actual cipher key, or final destination recovered.** The printed table's two numeral characters do not form a shared additive GP29 digit codebook for the known terminal text under any natural independent inner-ring orientation.

## Actual human-visible premise and original inputs

Original LP2 physical pp49–51 contain **256 source-printed, two-character base60 numeral tokens** arranged in 32 rows × 8 columns. Conventional concentric rectangular peels have **76, 68, 60, 52** cells. Original p55 has **76 encrypted runes**; p56 and p57 have **85 and 95 independently known plaintext runes**, making exactly **180 known inner cells** if the three terminal pages correspond to the four table rings. The solved p57 phrase "shed our own circumferences" suggests testing this specific geometric arrangement.

Prior [terminal-ring source tests](lp2-terminal256-original-inner-separable-gates.md) already reject spatial masks, stencils, secret Hill4 and convolution. **An earlier stronger direct byte-lookup result already excludes arbitrary secret byte→GP29 assignments, even independent by ring, for 64 fixed common-orientation terminal layouts** ([source and proof](lp2-grid256-terminal-solved180-lookup-gate.md)). Therefore this new test is **subordinate to prior work for overlapping layouts**. Its limited incremental scope is the **512 independently selected three-ring winding/corner layouts**, which include additional original geometric arrangements outside that earlier 64-layout screen. The first printed digit selects one of five unknown GP29 addends and the second one of sixty; the all-secret codebooks have 65 unrestricted values, but are a restriction of an arbitrary byte→GP table. No standalone encryption breakthrough is claimed.

**Crucial unresolved premise:** the source does not instruct readers to assign the terminal three pages to the numeric rings, use two separable digit tables, or decode the tokens in GF29. The original p55 rune at its start even continues a word from the preceding physical page. The experiment tests the candidate; it does not authenticate this mapping.

## Exact all-secret equation and decision

Use the frozen original byte interpretation of each token at grid cell \`q\`: \`B[q]=60H[q]+L[q]\`, where \`0≤H≤4\` and \`0≤L≤59\`. For *completely unrestricted* secret GP29 vectors \`a[0..4]\` and \`b[0..59]\`, demand

\`\`\`text
P[q] = (a[H[q]] + b[L[q]]) mod 29
\`\`\`

with \`P\` the independently known 180-rune suffix. The ring lengths and printed upper-left cell are untouched; each of the three known inner rings may independently start at any of its four corners and follow either winding direction. This grants exactly **8³=512** complete positional assignments. Test two independent known registers: (1) authentic p56 **prime-totient-decrypted** text, with its single literal-F interruption at local offset56, plus clear p57; (2) the **unchanged printed** p56 cipher runes plus clear p57.

For each assignment, turn digit tables into graph potentials \`z[H]=a[H]\`, \`z[5+L]=-b[L]\`. Every original known cell enforces the exact relation \`z[H]-z[5+L]=P mod29\`. A weighted modular union-find detects inconsistencies on any graph cycle. This rejects **every possible hidden 65-entry table** when a relation contradicts an existing path, without enumerating \`29^65\`, fitting any unknown p55 ciphertext, or using language heuristics.

| Source ring assignment / plaintext register | Complete orientations | Codebooks consistent with all 180 known runes | Furthest consistent initial sequence |
| --- | ---: | ---: | ---: |
| p56 authentic clear GP + p57 literal clear GP | **512** | **0** | **32 / 180** |
| p56 original cipher GP + p57 literal clear GP | **512** | **0** | **32 / 180** |

For the authentic cleartext case, the exact index of the *first* contradictory constraint is 10, 12, 18, 24, 27, 30 or 32; respective orientation counts are **64, 64, 64, 64, 64, 64, 128**. For the printed-p56 case, index23 replaces24 with identical counts. The single longest surviving prefix in either register is 32 runes before an unavoidable contradiction at the next rune. Because every model fails before reaching p57, p57's known text supplies an independent original control but is not required to falsify this two-character codebook.

**Independent positive:** fix one legitimate ring order, generate a complete artificial known 180-cell suffix from two truly nonlinear secret digit tables \`a[h]=7h+9\` and \`b[l]=11l+3l²\` mod29, then run exactly the same all-secret graph solver with neither table supplied. The entire **180/180** plant is accepted; the source's actual 76 outer cells include **72** whose digit-pair sums are identifiable from connected known graph components. The other four outer cells remain unidentifiable without more known constraints or a source-defined gauge. This identifies a real limitation even when the proposed family is correct: it would not automatically decode all 76 missing symbols.

## What to do with this result

The conventional base60 token pair supplies a simple source-defined register, but **neither a printed two-digit additive codebook nor a scaled direct-byte map can explain the authenticated terminal text under these additional independently oriented ring layouts**. The existing **stronger** arbitrary-byte-lookup result remains authoritative for the previously checked layout subset. Do not tune unknown page55 plaintext or add guessed digit substitutions to rescue the candidate. Another source-visible complete rule, or a different authenticated correspondence of the terminal table to p55–57, would be necessary.

A direct decoder that could explain 180 known symbols and then predict 76 previously unseen p55 symbols would have been causally useful; this one fails the decisive known-symbol gate. Preserve the earlier exact table geometry and known p56 prime-totient plaintext without claiming a decryption.

**Reproduction:** [single original-source Windows Node22 CommonJS SFT](../sims/lp2_terminal256_base60_digit_codebook_sft.cjs); inputs are unchanged [original rune index corpus](../resources/liber-primus/lp2-corpus.json) and [256 numbered source cells](../resources/liber-primus/lp2-grid-256.json), whose decoded byte SHA-256 is \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. The source SFT checks all 512 assignments under both authentic known-text registers and the independently generated full positive plant; it passed the [actual Windows Node22 original-data workflow 43686331677](https://github.com/FlareZ123/liber-primus/actions/runs/43686331677) (all steps successful). This report is intermediate evidence; no results/README promotion is warranted absent a genuine plaintext/key.
