# Original p50 high/low-digit pair feedback: complete original inverse

**Agent 1, 23 November 2026. Conditional full-original two-rune transformation, independent of the 256-cell stationary-pair negative.** One predeclared complete reversible operation fails to recover native GP29 plaintext from the untouched 534-rune post-table receiver and 1,744-rune held-out pre-table visual chapter. No original unknown-page plaintext, authenticated key or cipher mechanism is identified.

## A genuinely changing-state operation from two original token characters

The manuscript's physical pp49–51 print **32×8=256 two-glyph base60-compatible numerals**, over three original source pages in 10/13/9 rows. The original image preserves **two distinct characters per token**, so a human could hypothesize that each character operates on one coordinate of a two-rune cipher block. Earlier Cicada stages used positional BASE29 conversion, modular prime arithmetic and bytewise XOR, making small modular operations historically executable. The original table genuinely has fixed row-major geometry; no author-given LP2 algorithm says to interpret its first glyph and second glyph as separate subkeys or to encrypt two runes at a time. That distinction is the experiment's explicit weakest premise.

Take the authentic standard base60 alphabet \`0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx\`. For printed token \`dX\`, define its high-digit value \`h = digit(d)\` (0–4) and low-digit value \`l = digit(X)\` (0–59). The actual first eight tokens are \`3N,3p,2l,36,1b,3v,26,33\`, whose numeric values independently match \`203,231,167,186,97,237,126,183\`. Read all 256 cells in literal row-major order, then wrap to cell zero. This leaves both characters of every source token independently inspectable rather than reducing the byte to one arbitrary GP29 key residue.

On the printed posttable physical **p51–53**, concatenate the entire unmodified rune-index tape across its real page boundaries. Its source-visible rune counts are **92+263+179=534**, hence 267 complete two-rune blocks. Define ciphertext block \`(A_i,B_i)\`, predecessor ciphertext block \`(A_(i-1),B_(i-1))\`, and original paired runes \`(P_i,Q_i)\`. At block \`i\` use source token \`i mod256\`, high \`h_i\` and low \`l_i\`. **Freeze one zero predecessor pair \`(0,0)\` at the region start**. Then compute

\[
Q_i = B_i-l_i-A_{i-1}\pmod{29},\quad
P_i = A_i-h_i-Q_i-B_{i-1}\pmod{29}.
\]

The second token character alters the second output; the first token character alters the first output; the newly derived second output also mixes into the first. The clock advances in *whole printed pairs*, while the **previous actual ciphertext pair** supplies changing feedback state. This remains genuinely changing state after the 256-cell clock wraps; it is neither a stationary pair substitution nor the 81²/80² bookend pairing that was excluded by the old triple-equality theorem.

There is a **complete exact inverse**, requiring no dropped side bits:

\[
A_i=P_i+h_i+Q_i+B_{i-1}\pmod{29},\quad
B_i=Q_i+l_i+A_{i-1}\pmod{29}.
\]

Every original glyph remains recoverable. No unknown plaintext is used to set parameters, no phase is optimized, no S-box is fitted, no printed word is removed, and there is no special exception for p51's two identical first runes. The same zero predecessor and table order applies to the independent original *pretable* chapter pp16–22 as a sealed holdout; these pages have **1,744** unchanged runes and contain 872 blocks.

The **explicit additional assumptions** are considerable: the table is a decryption key; its two glyphs are ordered independent GP field operands; a two-rune block and the particular triangular additive feedback equations are intended; the table starts at row1 col1 for each tested region; and the initial state is the all-zero pair. The original has not selected these equations, so this is an inexpensive finite hypothesis only.

## Original-ciphertext outputs and source-native controls

For the GP29 coincidence index \`Σ n_g(n_g−1)/[N(N−1)]\`, independent solved p57 author-original prose has **IoC above 0.055** (95-runic native source), whereas these complete inverses are virtually flat:

| Unmodified original source | Runes decoded | Original ciphertext IoC | Decoded GP29 IoC | Five most frequent output symbols |
| --- | ---: | ---: | ---: | ---: |
| All p51–53 after the numeric table | **534 / 534** | 0.033532194 | **0.034958647** | **24.16%** |
| Complete independent p16–22 visual chapter | **1,744 / 1,744** | 0.034509598 | **0.034283267** | **19.78%** |

The first 48 decoded GP tokens on the post-table source (multiletter rune transliterations separated to avoid false English letter boundaries):

\`L P O F W E W P H EO I U EA D L A I EO U EO U W B AE Y J R M AE S P I NG M D J L EA D TH U M P J W U X EA\`.

This contains no contiguous original-page plaintext. The first independent held-out 48 symbols are similarly nonlinguistic, beginning \`S F P X EA M Y AE TH W T U D NG TH S I EO IA\`; the holdout has a comparably flat distribution. No recovered key or typed endpoint results.

**Full-length positive controls**: take the 95 authentic solved-p57 GP indices, repeat the genuine native text to the unchanged 534- and 1,744-rune lengths, encrypt under *the same two-step table-keyed triangular feedback law*, and invert. Both original-sized plants recover **every native source rune** and reproduce every encoded ciphertext rune, with no failures when the table's 256-cell key clock wraps. All original outputs likewise reencrypt to their exact source ciphertext. These controls validate coding/invertibility, not historical authorship.

**Reproducer:** [standalone source-exact CJS test](../sims/lp2_p50_splitdigit_evolving_pair_original_sft.cjs), successfully executed on [Windows GitHub Actions Node22 run 45090079306](https://github.com/FlareZ123/liber-primus/actions/runs/45090079306). It reads only the canonical original GP29 rune corpus and original 32×8 printed token table; checks 256 byte/token identities, both whole receivers, exhaustive exact inverse replay and both native positive plants.

## Cryptanalytic decision

The proposed full two-rune, source-token-split and *ciphertext-evolving* transformation yields a uniform-looking original receiver and a uniform-looking independent held-out source chapter, despite successfully recovering long authentic-GP plaintext plants. **Retire this precise reversible two-rune state law**, with the zero-IV/table-row-major/index-zero clocks. A different state feedback, unknown Feistel round, source-key phase, additional AES layer, historical private message or source-specific role would need an independent creator-visible selector. More modular coefficient / offset / row orders chosen for higher English scores would turn a finite hypothesis into an unfalsifiable sweep.

In particular, the manuscript currently supplies **no author-specified mapping from the numeral table's two printed characters to the two plaintext outputs or its source of pair-state initialization**. The strong adjacent-doublet suppression still demands an explanation; this candidate has no specific doublet-inhibition rule and cannot establish one merely by being reversible.

The 256-cell stationary all-secret no-go remains correctly restricted to its own speculative bookend alignment, while this new changing-state test is a *separate exact negative*. The broader possibility of a source-authored evolving pair decoder survives **only with a genuinely found opcode/key**, ideally tied to an original first-party Cicada operation and a frozen second source recipient.
