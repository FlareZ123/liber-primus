# Original LP2 whole-word BASE29 numeral cipher: exact all-secret exclusions

**Classification:** source-motivated, bounded negative. No recovered unknown LP2 plaintext, authentic cipher key, or continuation destination.

**Strongest result.** Any word-length-stationary invertible affine BASE29 integer cipher, allowing arbitrary independent secret multiplier and offset for every printed word length, preserves each length class's **final-rune histogram** up to a permutation of its 29 labels. In the 2,896 original words this forces a global upper bound of **609** occurrences among any four plaintext-final rune classes. Two independently constructed original-length-matched GP-native English controls have **1,547** and **1,553**. A separate exact all-secret **additive** integer cipher bound limits the four most frequent plaintext-*first*-rune categories to **648**, against control counts **1,002** and **963**. These conclusions require no candidate key or actual cipher decryption, and cannot substitute for a demonstrated authored LP2 cipher selection.

## Source motivation and original object

Cicada's signed 2013 TCP challenge demonstrates integer-to-BASE29 positional representation (3301 → 3QO). The signed January 2016 message references the manuscript's words and numbers. These clues motivate treating every *complete printed rune-word* as one base29 integer. They do **not** demonstrate that Cicada chose any of the subsequent proposed integer ciphers.

The canonical LP2 p0–55 complete-word parser yields **2,896 words, 12,956 rune indices, 32 original across-page carried words**, and fourteen rune-word widths L=1..14 with counts [83,448,720,513,317,256,216,156,78,52,32,18,4,3]. Each word is a positional GP29 integer N with 0≤N<29^L. Preserve the original width including leading F=0 rune digits, and leave source word delimiters unchanged. All results are asserted against the complete retained canonical source.

## Universal invertible full-word BASE29 affine family

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

- [Affine all-secret word-integer test](../sims/lp2_base29_wordinteger_affine_allsecret_sft.cjs): source-verified 609 bound, genuine GP-native length-matched 1,547/1,553 positive controls, invertible synthetic affine forward/inverse, 812 29-symbol affine map checks.
- [Additive all-secret carry test](../sims/lp2_base29_wordinteger_additive_allsecret_sft.cjs): source-verified exact 648 bound, complete legal key-suffix threshold argument, exact 841-key brute-force L2 check, genuine GP-native 1,002/963 controls, complete synthetic forward/inverse.
- [Direct unkeyed word-integer Latin26 decoding test](../sims/lp2_word_base29_to_latin26_sft.cjs) and its [separate report](lp2-word-base29-latin26-original-gate.md): the ordinary and bijective direct Latin26 readouts are nonlinguistic. The bijective mode maps an original one-rune zero-integer word at source word index143 to an empty string.
- Complete green Node.js 22 original-source CI: [GitHub Actions run 45002149600](https://github.com/FlareZ123/liber-primus/actions/runs/45002149600).

**Exclusion scope:** the original complete GP29 word boundary and length are preserved; the output plaintext is expected to have ordinary GP-native English-like word-ending or word-initial distributions; affine or additive integer keys stay constant for all words of the same L. The final-rune theorem also applies to any *radix-triangular* reversible L-dependent function whose terminal output rune is a bijective function solely of the terminal input rune. It makes no claim about a word-private evolving state, non-invertible or length-changing transforms, keys applied to other source-defined partitions, a non-GP or non-English register, a nonlinear cipher mixing the final rune with previous digits, or an external high-entropy key.

**Decision:** retire the direct unkeyed per-word Latin26 reading and per-word-length stationary whole-word BASE29 additive/affine integer ciphers as straightforward paths to ordinary GP-native English. A novel numeric permutation needs an independently authored operand and reversible rule before new parameter searches. This remains a strictly bounded negative, without recovered plaintext or a destination for the 56 unresolved pages.
