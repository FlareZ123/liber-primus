# Source p39 quadratic as a nonlinear two-history word-key cipher: all-secret original gate

**Agent45, 18 November 2026. Intermediate original-cipher exclusion; zero recovered LP2 plaintext or key.** The source-visible p39 red rune triple motivates a quadratic update. The original manuscript cannot be rendered as ordinary intact GP-English words by the family below, even if every one of its 2,896 printed words has an independently arbitrary, unknown additive key. This result concerns one fully specified cipher architecture; it neither establishes the creator's operation nor excludes nonlinear ciphers generally.

## Original clue and reversible hypothesis

Physical LP2 p39, source scan `56.jpg`, contains three red GP29 runes at offsets119–121, indices **[27,5,15]**. Interpreting them as ascending coefficients over GF29 yields

`Q(x)=27+5x+15x²=15(x−24)² (mod29)`.

The last form relates to `3301 mod29=24` and the separate signed-p15 matrix eigenvalue, but **the polynomial interpretation itself is conjectural**. The independent manuscript-wide excess of fifth-back rune equalities is concentrated inside printed words. This prompts one compact, nonlinear, source-constrained decoder:

`P_i = C_i − a Q(C_(i−1)) − b Q(C_(i−5)) − K_(word(i))  (mod29)`.

The inverse encoder is online and unique:
`C_i = P_i + a Q(C_(i−1)) + b Q(C_(i−5)) + K_(word(i)) (mod29)`.

We grant **every** `a,b ∈ GF29`, plus two fifth-history conventions: book-continuous, or zero-filled for the first five positions of every genuine printed word. Missing predecessors use GP index0. Ciphertext predecessors and page carries are genuine original-source values. The key `K_word` is completely unconstrained and may differ independently at every printed word, far more freedom than any short historical key. The total model count is **2×29² = 1,682** coefficient/scope choices, each admitting **29^2,896** secret word-key assignments.

## Decisive all-secret test on unchanged ciphertext

For every original word of length≥5, compute `T_i=C_i−aQ(Cprev)−bQ(C5)`. The secret `K_word` is constant within that word, so all relative differences `T_i−T_first` are **key-independent**, including when every word has a different key. A candidate original plaintext word must have this exact difference pattern, regardless of its key value. Compare with the original project's independently sourced 29-symbol native GP-English frequency dictionary (29,060 encodable source forms), respecting the 2014 GP `ING`, `IO`, `QU`, `V`, `K/Q` spelling conversions.

The source-aligned input contains **12,956** original unknown runes, **2,896** printed words, **32** page-carried words and **1,132 words of at least five runes**. No original runes, word cuts, pages or special symbols are edited.

| Original word-key search | Compatible ≥5-rune words / 1,132 |
| --- | ---: |
| Most favorable of all **1,682** programs | **7** |
| Other equally best program | **7** |
| Literal simple `a=b=1`, word-local five-back | **2** |

The best programs have `(a,b)=(13,12)` and `(26,17)`, both with continuous five-back history. Each matches **zero** of the opening p0–2 chapter's 69 long printed words. The seven apparent matches occur at scattered word indices rather than an intelligible contiguous original passage. There is **no intact original longword decipherment**, much less a paragraph.

A full-size independently native-GP word-shaped positive uses **all 2,896 authentic word lengths** and true dictionary words, with `a=5,b=13`, word-local five-back and a distinct secret key `K_w=(7w+13) mod29` per word. After online nonlinear encryption, the same all-secret test recognizes **1,132/1,132** longword signatures; strict full inversion and forward replay recover **12,956/12,956 runes**. A separate original-cipher decoding with arbitrary declared word keys also re-encrypts all source runes. These controls check the implementation and the discrimination that the original input fails.

## Stronger follow-up: independent affine key for **every** printed word

To address the possibility that the manuscript supplies a *multiplicative* word key as well as an additive word key, extend the exact same source-red nonlinear ciphertext-history family to

`P_i=A_word×(C_i−aQ(Cprev)−bQ(C5))+B_word (mod29)`,

with **each** `A_word ∈ GF29* = {1,…,28}` and **each** `B_word ∈ GF29` free and independent for all 2,896 printed words. This grants `(28×29)^2896` possible word-key selections, far more than a short finite-state cipher. A wordwise key-invariant is constructed by subtracting the first rune and scaling so that the first subsequent unequal rune equals 1. Every potential secret affine transform produces exactly the same normalized word shape. Each original word of length≥5 is compared with the complete same-length GP-native English dictionary modulo this *entire* affine key family. The source registers, nonlinear coefficients, fifth-back clock, original word positions, and a,b search remain unchanged.

The strongest original Q-history mode allows only **68/1,132** original long words to be explained by **any** independently chosen affine keys; its fixed global-history coefficients are `a=8,b=18`. Without any Q history (`a=b=0`), merely **44/1,132** fit. The additive-word-only model's previously reported maximum was **7/1,132**. Affine matching does not determine which dictionary word is intended even at the 68 isolated potential matches, and 1,064 original length≥5 words fail entirely under the most favorable Q coefficients.

**Even the four-parameter-per-word rescue fails on original long words.** Drop the requirement that `a,b` are shared across the book. Allow `a_word,b_word` to vary independently over all `29²` possibilities for *every printed word*, in addition to independent nonzero `A_word` and arbitrary `B_word`. Taking the union of all **1,682** original-state inverse programs' affine-invariant word hits shows only **644/1,132** original ≥5-rune words admit *any* GP-English dictionary preimage under this enormous family. **488/1,132** are incompatible with *all* word-specific parameters, including **every one of the 187 original words of length ≥9**. The exact native-length coverage is **317/317 at length5**, **256/256 at length6**, **70/216 at length7**, **1/156 at length8**, and **0/187 at lengths9–14**. For absent ciphertext predecessors, the source SFT uses original GP index0 and applies Q(0)=27. An exploratory scratch calculation mistakenly zero-filled the *Q output*; the corrected final original-input test passed. **128 of the 187 impossible words of length≥9 have no original ciphertext F**: under the separately authenticated solved-page rule (literal plaintext F emits ciphertext F), no F-transparent bypass can occur in these 128. Simply importing that known F bypass cannot rescue the source-Q cipher family on the intact original word boundaries. These are exact union counts, independent of language score thresholds or a requirement that words share parameters. The positive all-affine original-length English plant yields 1,132/1,132, and thus belongs to the passing union. This eliminates rescuing **this same additive source-Q ciphertext-history cipher** simply by letting secret tap coefficients and affine word keys change from word to word. Other non-affine, variable-length or changed-boundary cipher families remain open.

An independently generated source-shaped **12,956-rune** positive encrypts authentic dictionary words with changing secret word multipliers `1+(wordIndex mod28)`, offsets `(7×wordIndex+13) mod29`, `a=5,b=13` and source-consistent wordlocal five-back state. The new all-secret affine invariant correctly recognizes **1,132/1,132** genuine encrypted long words and recovers/re-encrypts **12,956/12,956** with the declared planted keys. The exact constant/affine key elimination is mathematical, rather than a model scorer learning those keys from the original. This strictly extends the first bounded negative: an arbitrarily high-entropy secret *affine word key* cannot rescue the source p39 Q two-history architecture into an intact ordinary GP-native-English manuscript. Other nonlinear bijections, altered segmentation, and unrelated plaintext registers remain open.

## Decision and relation to previous work

This is a distinct nonlinear companion to the previously completed **linear** word-key two-history obstruction in [the Agent4 all-secret test](lp2-wordclock-twohistory-original-inverse-gate.md). A search over nonlinear shifts or a different secret K for each word cannot rescue **this p39-quadratic, two-source-history, additive-key family** into ordinary GP-English with intact manuscript word boundaries. It could still represent an intermediate binary-like register, require changed segmentation, or be unrelated to the intended cipher. The source does not identify its `a,b`, a particular five-back tap, a word-key generator, or a receiver.

**Reproducer:** [standalone original-source Windows Node22 CJS](../sims/lp2_p39_quadratic_twohistory_allsecret_wordkey_sft.cjs). **Initial complete original execution:** [Actions run 44236992610](https://github.com/FlareZ123/liber-primus/actions/runs/44236992610), exact 1,132/1,132 positive controls. A minor later source-offset label correction changes only the names of one reported chapter-slice counter, not any original global match or gate. This evidence supports retiring the stated decoder; it does not promote a new established cryptographic mechanism into `results/`.
