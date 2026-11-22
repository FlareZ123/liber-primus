# Source-printed 1033/3301 long-period cipher key: original necessary-condition decision

**Agent50, 18 November 2026. Bounded negative on exact original LP2. No unknown plaintext or creator key recovered.**

## Plausible original clue and competing mechanism

Original LP2 pp33–39 carry a cuneiform-like numeral heading whose independently adjudicated base-60 readings are **1033** and **3301**. Both numbers were available to an original human solver. Prior continuous-period screens had concentrated on much shorter candidate periods. One economical question is whether either original number specifies a **long reusable rune-key period**, for a source-familiar GP29 Vigenère cipher or a ciphertext-feedback encoding compatible with the manuscript's exceptional shortage of consecutive identical glyphs.

The alternative is that these cuneiform operands encode something other than key length. Even if they are key lengths, a page-unique secret or a nonperiodic transition is not addressed by this test. There is no first-party sentence saying “repeat the key at 1033/3301,” so this is an explicit hypothesis rather than a discovered authored operation.

## Two original-cipher models, each allowing every secret key

Let the authentic GP29 index sequence be C, and define d_i = (C_i − C_(i−1)) mod 29 with an arbitrary fixed initial predecessor. Read **raw C** for a standard periodic GP29 additive Vigenère inverse. If the key K repeats after L runes, C_i = P_i + K_(i mod L) mod 29, so **C_i = C_(i−L) if and only if P_i = P_(i−L)**. No secret-key fitting or period phase selection changes this equality invariant.

For a distinct **reversible no-repeat chain**, map d_i=0 to output class28 (GP EA), and d_i=1…28 to classes0…27. The forward source-shaped illustrative cipher chooses a secret K_j in 0…27 and emits a nonzero step 1 + (P_i+K_(i mod L)) mod28 for plaintext classes0…27; plaintext EA/class28 emits a zero step. The ciphertext is the cumulative GP29 sum of those steps. Again equality of the derived step classes at distance L occurs exactly when GP plaintext classes match at distance L, even for an arbitrary secret periodic 28-ary key. This deliberate EA reservation is a **model assumption**, not an authenticated Cicada rule. The CJS implementation contains a complete invertible encoder and decoder.

For both source L in {1033,3301}, count lag-L equality across all **12,956 intact original rune indices of pp0–55** (physical p50 contains no runes), preserving physical order, including 32 page-crossing words. Test the **nine original chapter-internal windows** separately for L=1033. At a physical page reset, any key period greater than the longest page (277 runes) becomes equivalent to a shared position-specific alphabet across the 55 pages: its *secret* per-position additive offset cannot change collisions between same-local-position ciphertext glyphs across pages. That is a third source-motivated clock, explicitly distinct from chapter and continuous clocks.

## Direct original measurements and powered native controls

The native positive is the first 12,956 GP29-transliterable runes beginning at “Almustafa” in the separately committed Project Gutenberg/Gibran *The Prophet* control. Normalization is frozen in the single-file program; it contains 148 GP EA symbols. To prove power, encrypt this full source twice under synthetic 1033- and 3301-period **unfitted** xorshift32 keys, once with ordinary additive GP29 and once with the fully reversible suppressing chain. Each positive recovers **12,956/12,956** source runes by actual inversion, and the equality tests show exactly the **same native rates** regardless of secret key.

| Source-selected length and clock | Original raw GP29 equality | Original no-repeat step-class equality | Planted native equalities | Total compared pairs |
|---|---:|---:|---:|---:|
| 1033, continuous whole-book | **422** (z=+0.545) | **436** (z=+1.248) | **740** (z=+16.506) | 11,923 |
| 3301, continuous whole-book | **326** (z=−0.387) | **354** (z=+1.175) | **616** (z=+15.788) | 9,655 |
| 1033, reset at each of nine chapters, compare only within chapters | **181** (z=+1.513) | **180** (z=+1.433) | **269** (z=+8.548) | 4,700 |
| Identical positional secret key restarted on every physical page | **10,751** (z=+0.219) | **11,058** (naive uniform z=+3.236) | **18,657** (z=+77.898) | 311,132 |

The z display is descriptive relative to independent uniform GP29 symbols, p=1/29, and should **not** be called a global p-value. In particular, the no-repeat step code has class28 far less often than uniform: its actual whole-book marginal collision rate is **0.035319221**, versus **0.034482759** uniform. This raises the correctly frequency-conditioned expected page-aligned repeat count to **10,988.94**, close to the observed **11,058**. The +3.236 naïve z in that one cell is a marginal-bias artifact and does not support a shared positional key. Direct unkeyed source is 10,751/311,132 versus source-native 18,657/311,132 under *any* identical page-local additive secret key.

All three reset clocks have positive forward encoders/reversible inverses in the [CommonJS SFT](../sims/lp2_cuneiform_1033_3301_longperiod_source_sft.cjs). The source asserts the original 55 nonempty pages, exactly 12,956 GP symbols, exact chapter lengths, all compared pair totals, exact counts, unbroken 2,896 original words and the planted inversions. It never learns a secret from original ciphertext.

## The separately source-motivated 1,033-word key replay

The independently signed 2016 Cicada clue refers to the book's **words**, their meanings, and their numbers as direction. That permits a distinct, small candidate: the source-printed 1033 might be the period of a reusable **per-word** key rather than a rune count. The unchanged source transcription has 2,896 complete words, including 32 physical-page carries. It combines the first 55 rune-bearing records and asserts all 12,956 rune values against the original numeric corpus. The original words remain in printed order.

For each of the 1,863 pairs of words whose source indices differ by 1033, inspect equalities at the first character and corresponding character positions. Any additive or 28-ary no-repeat chain with a separately secret *per-position* key repeated every 1033 words must preserve these equalities. If the key is instead a single scalar applied to every rune of that word, equality of the final character also must be preserved; **final-character equality is not a valid invariant for independently keyed character positions when word lengths differ**. Two separate forward encoders with exact GP29 inverse and another two corresponding chained-code encoders prove both propositions on native English.

| Key-invariant observation | Original raw words | Original 28-ary no-repeat step classes | English native control with replayed key |
| --- | ---:| ---:| ---:|
| Identical first rune among 1,863 word pairs | **76** | **76** | **122** |
| Identical aligned rune in all overlapping word positions | **228 / 5,940 (3.84%)** | **220 / 5,940 (3.70%)** | **463 / 5,221 (8.87%)** |
| Identical last rune, **scalar-word key only** | **63** | **60** | **181** |

Control word boundaries are those in the independent source Gibran passage and therefore have a different total number of aligned character pairs. Both exact inverses recover every native GP rune and reproduce all original control word positions. The 1033-word replay does not restore the expected reuse signal on the unknown manuscript. This is conditional on original printed word breaks and an unaltered English GP plaintext register, and does not rule out a nonrepeating key derived from each word's number or content.

## Decision and next original input that could change it

**Neither 1033 nor 3301 behaves as a globally shared periodic GP29 additive key, or as a globally shared 28-ary nonrepeat-chain key with the sole EA exception, on ordinary GP-English source.** The source 1033 also fails the same necessary-condition test if reset at the nine authentic chapter boundaries. An identical page-initialized position key (any long period) fails a much stronger across-page collision comparison. The 1033-word-index key replay similarly fails for both direct GP29 and its reversible anti-repeat counterpart. Large secret-key hunts in these narrowly stated families are therefore unwarranted.

The calculation **cannot** test a fresh unknown independent 3301-digit key at every original chapter, because each chapter is shorter than 3301 runes; it also cannot exclude a different plaintext register, postcipher reordering, a secret nonce per page, other exception codings, or a changing/nonperiodic key. The actual printed 1033/3301 may denote original prime ranks, addresses or arithmetic rather than periodic clocks. It is unjustified to promote these negatives to “LP2 solved.”

To progress beyond them, source evidence would have to identify **how** the large cuneiform numbers address a typed historical key or reversible operation, then generate a continuous unknown-page GP29 plaintext and an untouched independent prediction. No independently selected alternate operation, source secret, unknown plaintext, or destination was recovered by this experiment.


**Executable Windows evidence:** [Node 22 original-source PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44335985648) on the long-period portion. The extended code includes independently encrypted word-index controls, with a fully [successful Windows Node 22 execution](https://github.com/FlareZ123/liber-primus/actions/runs/44337961156) validating the corrected final-character invariant.