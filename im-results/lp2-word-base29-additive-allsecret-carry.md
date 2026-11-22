# Original LP2 whole-word BASE29 numeral cipher: exact all-secret exclusions

**Classification:** source-motivated, bounded negative. No recovered unknown LP2 plaintext, authentic cipher key, or continuation destination.

**Main new exclusion.** Grant an adversary an arbitrary SECRET coordinate order for every original rune-word length, and a separate independent coordinate order and full word-integer cipher state for **each of nine manuscript-illustrated chapters**. The original data still support at most **1,145** total word endings among the four most frequent GP plaintext-final rune classes. Exact original-length-matched GP-native Gibran and Shakespeare controls have **1,547** and **1,553**. The new bound includes all fixed chapter×length digit permutations followed by any invertible 29-adically compatible integer transformation, regardless of secret polynomial degree or coefficients. It also includes arbitrary wordwise reversals, circular digit readings, source-page orientations *if fixed inside each actual illustrated chapter×word-length stratum*, and independent key resets at the nine printed chapter boundaries. Two full 2,896-word native controls encrypted by chapter-varying, length-varying affine keys **and** secret cyclic rune-position shifts decrypt exactly; all 110 original chapter×length strata were exhaustively bounded without key enumeration.

**Relation to prior work.** Agent31's earlier [source-original whole-word BASE29 unit/endpoint study](lp2-word-base29-unit-invariant.md), reported under issue #253, already proved the general *fixed word-edge* invariant for compatible 29-adic bijections and tested **per-page×length** keys using stronger collision statistics than this report's illustrative 609 bound. Thus the fixed-endpoint polynomial observation below is a reproduced special case, not an independent discovery. The **new scope here is allowing the cipher's protected digit to come from any unknown word-internal coordinate**, separately in each printed word length and each illustrated chapter, with all-secret statistical exclusion and matched full-inverse plants. The independent direct Latin26 and additive carry-first constraints are useful explicit numerical subfamilies; neither should be promoted as original plaintext recovery.

## Source motivation and original object

Cicada's signed 2013 TCP challenge demonstrates integer-to-BASE29 positional representation (3301 → 3QO). The signed January 2016 message references the manuscript's words and numbers. These clues motivate treating every *complete printed rune-word* as one base29 integer. They do **not** demonstrate that Cicada chose any of the subsequent proposed integer ciphers.

The canonical LP2 p0–55 complete-word parser yields **2,896 words, 12,956 rune indices, 32 original across-page carried words**, and fourteen rune-word widths L=1..14 with counts [83,448,720,513,317,256,216,156,78,52,32,18,4,3]. Each word is a positional GP29 integer N with 0≤N<29^L. Preserve the original width including leading F=0 rune digits, and leave source word delimiters unchanged. All results are asserted against the complete retained canonical source.

## Fixed-edge arithmetic invariant, with earlier established prior art

For every L, let a completely unknown A_L and B_L be applied to the whole L-digit integer word:

\[
C \equiv A_L P+B_L\pmod{29^L},\qquad 29\nmid A_L.
\]

A_L must be coprime to 29 to permit exact decryption on all GP29 words. Reduce this equation modulo29. Its least-significant, **final word rune** satisfies

\[
c_{\mathrm{last}}\equiv
 (A_L\bmod29)p_{\mathrm{last}}+(B_L\bmod29)
\pmod{29}.
\]

The last-digit operation is therefore a bijective permutation of all 29 rune values for **every** choice of the higher-digit key residues. All final-rune category counts for width L are preserved exactly up to relabeling, even with arbitrary word-integer carry propagation. Summing the largest four category counts over *each separate L* is an upper bound for the four most common GP plaintext-final rune labels after combining all word lengths. This bound even allows different winning four labels for each L, which is more freedom than the actual shared plaintext alphabet has.

The complete original source yields the exact third-column totals below, summing to **609** of 2,896 words. Every invertible full-word BASE29 affine key family with independent secret A_L and B_L for each L obeys this theorem, including a single fixed shared A/B and all pure additive variants.

## Independent all-secret BASE29 additive carry family

The narrower full-word arithmetic family is

\[
C\equiv P+K_L\pmod{29^L},
\]

where every L has a wholly independent unknown **integer** key K_L. This family adds a second constraint, this time on the **first rune**. Write an original ciphertext word C=c0·29^(L−1)+s and its key K_L=a·29^(L−1)+t, with 0≤a≤28, 0≤t<29^(L−1). Subtraction gives

\[
p_0\equiv c_0-a-\mathbf1[s<t]\pmod{29}.
\]

The integer a merely rotates all 29 labels. Only t can change any leading-rune *count*, and it does so through one sortable threshold: words whose suffix s<t borrow exactly one from c0. Sort the **original** suffix integers s and sweep t=s+1 where legal, changing first-rune histogram bins from c0 to c0−1. Taking the highest four-bin count for each L covers **every single K_L** with no heuristic key search. The resulting fourth-column lengthwise upper bounds sum to **648**. Exhaustive enumeration of **all 29²=841 literal keys** for L=2 independently agrees with the exact threshold upper bound **90**. Full carries are included, even across all digits of length14 words.

## New all-secret hidden-coordinate result: nine illustrated chapters

The original LP2 illustrations independently partition the 56 unresolved physical pages into **nine visual chapters**: physical p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55. Each complete source word belongs to its actual *starting* page. The numeric-only p50 contains no GP rune words, and the 32 across-page carried words remain single unbroken source words. Chapter assignments are frozen by the images and page order, before considering terminal-rune statistics.

Imagine a much more permissive family than the literal word-integer affine cipher: for every independent **(illustrated chapter, word length L)** group, select ANY of the L runic source positions as the effective least-significant digit. One may use an arbitrary fixed permutation of all L positions and then an arbitrary length-preserving compatible integer **bijection** on the resulting BASE29 integer. Keys, coordinate orders, polynomial degrees and coefficients may differ completely among the **110 actually occupied chapter×length groups**. No key or coordinate is given to the test.

The induced least-significant digit of each group is only a secret **29-way permutation** of the source rune at the selected position j. For each group g and every j in 0..L−1, count the occurrences of the four most common original ciphertext rune symbols at that column. Maximizing over ALL j and then summing across all groups yields a strict upper bound on the combined four most common decrypted word-ending symbols, even when the four winning plaintext categories are generously allowed to differ across groups. The resulting exact source counts:

| All-secret numeral architecture | Max total count of four most frequent GP plaintext-final rune symbols |
| --- | ---: |
| Fixed rightmost source rune, independent keys for each width L | **609** |
| **Any** source rune position, independent secret position and key per width L | **642** |
| **Any** source rune position, independent secret position and key per each of nine visual chapters × each L | **1,145** |
| Matched-length native Gibran words, actual four highest GP terminal rune classes | **1,547** |
| Matched-length native Shakespeare words, actual four highest GP terminal rune classes | **1,553** |

The original upper bound **1,145** lies strictly below the *actual combined native count* for both positive-language sources. It cannot be increased by extra higher-digit carry arithmetic, word-endian reversal, coordinate rotation, a fixed secret digit permutation, unknown 29-adic polynomial coefficients, changing key at the nine illustrated chapter boundaries, or a fixed global relabeling of the 29 GP letters.

**Exact synthetic control.** Two complete 2,896-word source-native originals of the exact manuscript widths are encrypted with a secret chapter×length offset, a nontrivial whole-integer multiplier 2 and a separate chapter-dependent **cyclic permutation of digit positions**. On decryption each original GP29 word is exactly restored, 2,896/2,896 per source. Their corresponding cryptograms satisfy the all-secret 1,145-style source-aware bound above their real plaintext four-ending totals. A separate genuinely nonlinear polynomial plant uses C=2P+B_L+29P² (mod29^L), recovered exactly through L successive 29-adic fixed-point inversions; it verifies the more general compatible-numeral lemma rather than just affine arithmetic.

**What the new bound does not cover.** Keys or digit-reading positions that change *within a given chapter×length group* from word to word, a transformation whose final output digit mixes two or more input digit positions rather than depending bijectively on one selected source digit, a cipher that moves printed word separators or word lengths, or a non-GP plaintext register. Nor does it establish that any integer cipher is author-selected; a first-party key/receiver is still missing.

## Original invariant table

| Original complete word length L | Words | Affine: max four terminal runes | Additive: max four initial runes |
|---:|---:|---:|---:|
| 1 | 83 | 20 | 20 |
| 2 | 448 | 82 | 90 |
| 3 | 720 | 130 | 145 |
| 4 | 513 | 104 | 94 |
| 5 | 317 | 71 | 66 |
| 6 | 256 | 51 | 59 |
| 7 | 216 | 50 | 54 |
| 8 | 156 | 38 | 43 |
| 9 | 78 | 19 | 31 |
| 10 | 52 | 17 | 17 |
| 11 | 32 | 12 | 12 |
| 12 | 18 | 8 | 10 |
| 13 | 4 | 4 | 4 |
| 14 | 3 | 3 | 3 |
| **All** | **2,896** | **609** | **648** |

## Native-English original-width positive controls

Two distinct public-domain source texts retained in the repo, Gibran's *The Prophet* and a Shakespeare corpus, are converted using the historically demonstrated GP29 transliteration (TH, NG/ING, IO, QU→CW, V→U, K/Q→C, Z→S). For every one of the original 2,896 ciphertext word widths, the fixed control builder chooses a genuine source word with **exactly the same number of GP runes**. This is a source-shaped control **construction**, not a claim to reproduce contiguous prose or any actual LP2 plaintext. The original manuscript's exact whole-word length sequence is retained.

- Gibran native source-shaped plaintext has **1,547** words ending in its four most frequent GP runes, and **1,002** beginning in its four most frequent GP runes.
- Shakespeare independently has **1,553** final and **963** initial.
- Both sets of 2,896 matched words are encrypted by a genuine nontrivial length-dependent full-word affine cipher (invertible multiplier 2, key-dependent offset and cross-digit carries); decrypting with the modular inverse reproduces **2,896/2,896 original-width words** for each source. The terminal count invariant remains exactly unchanged on both encrypted plants.
- The additive variant also encrypts and decrypts **2,896/2,896** native words with a secret width-dependent integer addition key, and its all-secret initial upper bound exceeds each native control's actual top-four initial count.
- All **812** single-digit invertible affine maps (28 nonzero slopes × 29 offsets) are independently checked as bijective, and the length-two additive model checks all 841 possible full-word keys.

The original's impossible bounds **609 < 1,547/1,553** and **648 < 1,002/963** are arithmetic, source-original upper limits. No unknown key value or extra fixed global alphabet relabeling can overcome them. These controls demonstrate a decisive difference from the native GP-English word-initial/terminal distributions in two independent real-language sources; they do not prove an impossibility for exotic registers or all conceivable natural language distributions.

## Reproducible scripts and decision

- [Affine all-secret word-integer test](../sims/lp2_base29_wordinteger_affine_allsecret_sft.cjs): source-verified **1,145 original chapter×length hidden-position bound**, 642 whole-book-per-width position bound, 609 fixed-edge baseline, nonlinear 29-adic polynomial inverse, chapter-dependent digit-rotation affine inverse, genuine GP-native matched 1,547/1,553 positive controls, and 812 29-symbol affine map checks.
- [Additive all-secret carry test](../sims/lp2_base29_wordinteger_additive_allsecret_sft.cjs): source-verified exact 648 bound, complete legal key-suffix threshold argument, exact 841-key brute-force L2 check, genuine GP-native 1,002/963 controls, complete synthetic forward/inverse.
- [Direct unkeyed word-integer Latin26 decoding test](../sims/lp2_word_base29_to_latin26_sft.cjs) and its [separate report](lp2-word-base29-latin26-original-gate.md): the ordinary and bijective direct Latin26 readouts are nonlinguistic. The bijective mode maps an original one-rune zero-integer word at source word index143 to an empty string.
- Complete green Node.js 22 original-source CI, including the full 110-stratum hidden-coordinate original-input bound and 2×2,896-word synthetic chapter-coordinate-key inverses: [GitHub Actions run 45002736328](https://github.com/FlareZ123/liber-primus/actions/runs/45002736328).

**Exclusion scope:** the original complete GP29 word boundary and length are preserved; the output plaintext is expected to have ordinary GP-native English-like word-ending or word-initial distributions. The new broader theorem permits independently keyed, unknown digit-position reading in each of the nine illustrated chapters × each original word length; the arithmetic word transform must preserve low-digit congruence and be invertible. The final-rune theorem also applies to any *radix-triangular* reversible L-dependent function whose terminal output rune is a bijective function solely of the terminal input rune. It makes no claim about a word-private evolving state, non-invertible or length-changing transforms, keys applied to other source-defined partitions, a non-GP or non-English register, a nonlinear cipher mixing the final rune with previous digits, or an external high-entropy key.

**Decision:** retire the direct unkeyed per-word Latin26 reading and all original-word-length/illustrated-chapter-stationary BASE29 numeric bijections with a single protected (unknown) GP digit per word, regardless of fixed internal word reading order or polynomial complexity, as straightforward paths to ordinary GP-native English. A novel numeric permutation needs an independently authored operand and reversible rule before new parameter searches. This remains a strictly bounded negative, without recovered plaintext or a destination for the 56 unresolved pages.
