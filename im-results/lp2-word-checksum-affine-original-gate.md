# Word-local GP29 arithmetic checksum: exact original-cipher capacity bound

**Agent 30 · 11 November 2026 · finite, source-motivated cryptanalytic exclusion.** No previously unknown Liber Primus plaintext, authentic cipher key, author-specified operation, or destination has been recovered. The original input and a strong synthetic positive were independently calculated, then executed successfully under [manual GitHub Actions run 43076097573](https://github.com/FlareZ123/liber-primus/actions/runs/43076097573). Reproducer: [CommonJS SFT](../sims/lp2_word_checksum_affine_sft.cjs).

## What puzzle clue selects this hypothesis?

The authenticated 2013 *0_wisdom* operation replaces rune-words by their Gematria Primus prime-weight sums and exactly reconstructs a 2014 magic square. The signed 2016 continuation says that the manuscript's *words* form its map and their *numbers* indicate direction. Meanwhile the 2,896 visible unsolved LP2 words have unusually few one-rune and two-rune words compared with the preserved GP-English controls. A plausible explanation worth decisively testing is that a numeric check rune was appended or prepended to many original plaintext words before encryption. This would shift printed word lengths and expose a linguistic or keyed relationship among the runes **if the check is computed in the GP29 index register and the encryption resets its affine/additive key at word starts**.

The original source does **not** explicitly specify a one-rune checksum, its sign or its position. The present test deliberately grants an adversary every one of those choices, and a distinct secret checksum residue **for each word length**, rather than interpreting one retrospectively chosen residue as a discovery. GP prime-weight checksums encrypted under arbitrary nonlinear substitutions are outside this model.

## All-secret-key obstruction

For any printed word with GP29 ciphertext indices \(C_0,\ldots,C_{L-1}\), suppose there is an affine substitution

\[
C_j\equiv a_L P_j+k_{L,j}\pmod {29},\qquad a_L\ne 0,
\]

where the multiplier \(a_L\) and key offsets \(k_{L,j}\) are completely secret, but repeat for words having the same printed length \(L\). The offsets may be arbitrary and need not have a short keyword. If one plaintext rune is the positive or negative modular sum of the remaining word's plaintext runes, the following three quantities provide necessary, **key-independent** constraints:

\[
R_{\mathrm{prefix}}=2C_0-\sum_j C_j,\quad
R_{\mathrm{suffix}}=2C_{L-1}-\sum_j C_j,\quad
R_{\mathrm{zero}}=\sum_j C_j\quad(\mathrm{mod}\ 29).
\]

An added *positive-sum* checksum at the beginning forces \(R_{\mathrm{prefix}}\) to one constant for a fixed length; the same operation at the end forces \(R_{\mathrm{suffix}}\). A *negative-sum* checksum at either endpoint forces \(R_{\mathrm{zero}}\) to one constant. The secret keys only change the constants. Thus allowing **all 29 constants, all three distinct registers, and a different winning register/constant for every length** is an exact upper bound on how many original words could obey the model with any keys. No plaintext fitting is involved.

## Original input and exact result

The canonical original LP2 transcription is parsed through the existing shared [word-source parser](../sims/word_partition_invariant.cjs). There are **12,956 runes and 2,896 printed words** on the 55 rune-bearing unsolved pages. Lengths 2–11 with at least 25 words per length account for **2,788 words**.

| Word length | Original words | Most compatible words after choosing any register and residue |
| ---: | ---: | ---: |
| 2 | 448 | 27 |
| 3 | 720 | 41 |
| 4 | 513 | 33 |
| 5 | 317 | 19 |
| 6 | 256 | 20 |
| 7 | 216 | 15 |
| 8 | 156 | 10 |
| 9 | 78 | 7 |
| 10 | 52 | 5 |
| 11 | 32 | 4 |
| **Total** | **2,788** | **181** |

The best possible assignment across all ten independent length classes covers **181/2,788 = 6.4921%**. It rejects a checksum present in the majority of visible words under this stationary word-reset affine family; even arbitrary mixed checksum and ordinary words cannot place more than 181 of these 2,788 in its exact key-consistent checksum subset. The other 108 words (83 singletons plus 25 words longer than 11) are outside this bounded claim.

A matched ciphertext null kept every original word length and applied an **81%-chance correction of attempted adjacent equal runes**, which mimics the manuscript's large adjacent-doublet deficit. Across **128** fixed-seed null records, the selected maximum ranged **159–186** (median **172**), with **10/128 at least 181**. The original maximized checksum count is consistent with this no-checksum null, and selecting three models times 29 residues per length has been accounted for in the null.

## Positive challenge with the same visible word lengths

The independent planted control uses the exact **2,896 observed word lengths in original order**, with uniformly drawn GP29 plaintext body runes, a genuine final \(P_{\mathrm{last}}=\sum P_{\mathrm{body}}\) checksum, and a hidden affine \(C_j=11P_j+k_j\pmod {29}\) with an independent position-specific 29-way key stream that resets at every word start. Whenever a would-be ciphertext rune duplicates the preceding output, the planter overwrites it with a distinct rune with probability **0.81**, deliberately damaging some genuine checksum relations.

The plant attempted **387** immediate duplicates, repaired **320**, and retained **67**; the audit still correctly identifies **2,500/2,788 = 89.6700%** as checksum-compatible. The original identifies only **6.4921%** under strictly more permissive per-length model selection. The planted test validates substantial detection power despite the anti-doublet complication; the plant is a model, not an assertion about how Cicada actually encrypted LP2.

## Next research choice and precise limits

A common **appended GP29 arithmetic check rune plus any fixed word-length/position affine cipher** cannot explain the unusual word lengths or reveal plaintext. The outcome complements the earlier [word-length padding dependence study](wordlength-order.md), [wordwise equality invariant](wordwise-equality-invariant.md), and [numerical word-sum gate](lp2-word-sum-residue-source-gate.md), while specifically closing the previously untested **arithmetic-check** variant. Do not rerun it with a different fixed residue, endpoint sign, or word-reset position keyword; these are already quantified in the upper bound.

The result leaves open a GP-prime-weight checksum under nonlinear encoding, a checksum independently encrypted by an evolving per-word key, changing word boundaries, a non-GP plaintext register or a non-checksum insertion. Pursuing one of those exceptions requires an original clue selecting its extra operation and an exact held-out plaintext prediction. This test cannot distinguish those proposals or supply a key on its own.

**Reproduce:** run the manual-only [workflow](../.github/workflows/lp2-word-checksum-affine-manual.yml), which executes [the complete CommonJS script](../sims/lp2_word_checksum_affine_sft.cjs) with fixed positive seed \`0x20163301\` and matched-null seeds \`0x19315301+i*0x9e3779b1\` for \(i=0,\ldots,127\). Node.js 22; no third-party packages, network source fetch, or code generation at run time.
