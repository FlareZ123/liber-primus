# Wordwise BASE29 powers cannot decode original LP2 as native GP29 English

**Agent 14, 18 November 2026. Decision:** a previously untested reversible word-number cipher has been executed against the entire original 12,956-rune LP2 unknown corpus. Its source-selected DH operand variants recover no previously unknown prose. More significantly, an exact key-independent word-final invariant excludes **every fixed, word-length-preserving 29-adic permutation** in which the least-significant input rune undergoes one fixed bijection, under genuine ordinary GP29-English words and the original printed word boundaries. This closes the entire fixed modular-power family without exponent hunting. No authentic LP2 cipher, unknown plaintext, key, or destination was recovered.

## Source-led candidate and weakest assumption

The PGP-authenticated 26 January 2013 Cicada TCP exercise explicitly demonstrates **BASE29 3301 = 3QO** and **DH 23**, base 5, server public 8, client public 19, common key 2. The client's illustrative private exponent is 15, recoverable mathematically from the tiny DH example. The later, separately signed 2016 sentence calls Liber Primus words a **map** and their numbers a **direction**. A returning human solver could therefore consider treating each *complete printed rune word* as a positional BASE29 numeral and applying modular exponentiation.

These clues do **not** prescribe a word-as-integer transform, modular exponent, word width, or recipient. This is a bounded conditional experiment motivated by independently recognizable Cicada operations, rather than a claimed authorial procedure. It differs from [six-rune RSA cycle walking](lp2-2013-parable-rsa-cyclewalk-original-gate.md), [minimal unpadded BASE29 numeral constraints](lp2-wordradix29-unpadded-allsecret-endpoint-obstruction.md), and the already excluded affine/linear word-key families. In particular, the following cipher is *length-preserving and exactly invertible on padded words*, including every original leading-zero rune.

For a printed GP29 word of length L, interpret its rune digits in original left-to-right, most-significant-first order as an integer x in [0,29^L). If x is nonzero, let v be its 29-adic valuation and let u=x/29^v. For an exponent e coprime to 28 and 29, define:

    T_e(x) = 29^v * (u^e mod 29^(L-v))

Fix T_e(0)=0. The inverse applies the exponent d satisfying

    e*d ≡ 1 (mod 28*29^(L-v-1))

to u, then restores the exact valuation and L digits. This is a bijection of every word register, with no guessed pad, change of original word length, hidden F-rule, external key, or uncoded side channel. Original page/line wraps do not reset words. The four eligible DH-example numbers tested as prospective powers are **e=5,15,19,23**; 2013 example values 2,6,8 are not bijective powers in this declared register.

## The universal word-end obstruction

The last physical rune in an L-digit word is the least-significant digit x mod29. A 29-adic unit-power map makes it (x mod29)^e mod29, a **fixed permutation of all 29 terminal rune labels**. The complete frequency multiset at word endings therefore remains *exactly unchanged* under any exponent, either inverse direction, and any word length. The statement extends directly to every globally fixed, compatible, reversible 29-adic transformation whose reduction modulo29 is a permutation. It also applies to any fixed relabeling of the 29 GP rune/digit values: sorting the endpoint counts eliminates the unknown alphabet.

The original corpus has **2,896 complete printed words, of which 2,813 have length at least two**. There are **32 page-carried words**, checked against both the canonical original transcript and indexed source. At the final rune of those 2,813 words, **all 29 GP symbols occur between 75 and 117 times each**, with endpoint index of coincidence **0.03451234084384682**. A fixed terminal permutation necessarily preserves that value and maximum count 117.

Compare genuinely GP-transliterated native English from three independently preserved source texts. In each **2,000** fixed-seed controls, independently select one real source word with *the same GP29 rune length* as each of the 2,896 original words, preserving all printed word-break geometry. The same greedy seven-digraph spelling as established in the repository's earlier control implementation is used; the original and controls are treated identically for ending frequency.

| Matched native English source | Expected GP E endings (2,813 multi-rune words) | Smallest observed *maximum* single-ending count / 2,000 controls | Smallest observed ending IoC / 2,000 controls | Controls matching or below **both original thresholds** |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare first 300k | 515.21 | **456** | **0.09165255** | **0/2,000** |
| Gibran *The Prophet* | 472.31 | **410** | **0.08934287** | **0/2,000** |
| Emerson essays | 539.69 | **475** | **0.09709341** | **0/2,000** |
| **Original LP2** | unknown actual plaintext | **117** | **0.03451234** | n/a |

The terminal-count contradiction is invariant under **every unknown fixed 29-symbol permutation**. The native-English comparison is a finite reference-class rejection, conditioned on preserving printed word boundaries; it does not claim a proof against specially constructed flat-ending prose or an encrypted intermediate register.

## Original-input full inversions

All original printed words were transformed without omitted runes. Every original encoded or decoded word reencodes/decrypts to its exact original value, including words crossing physical page boundaries. The source-native control encrypts all **12,956** runes of a genuine GP29-normalized Gibran word-length-matched plant and independently inverts it **12,956/12,956** for each exponent.

| Source example exponent | Encode-side whole-book GP29 IoC | Inverse-side whole-book GP29 IoC |
| --- | ---: | ---: |
| 5 | 0.03453850 | 0.03447056 |
| 15 | 0.03449839 | 0.03449855 |
| 19 | 0.03448868 | 0.03451642 |
| 23 | 0.03445614 | 0.03446603 |

Original ciphertext IoC is **0.03447840**. None of the eight complete word-preserving readings produces legible prose. The all-exponent **word-final impossibility** is more informative than any individual sample's marginal IoC and closes even an arbitrarily secret exponent in the declared original GP word-transport architecture.

**Reproduction:** [complete single-file Windows Node22 source test](../sims/lp2_signed2013_base29_wordpower_gate_sft.cjs) reads only the canonical untouched corpus, word parser, and three source controls; asserts exact original source inventories, every wordwise inverse, fixed word-final count spectrum, 6,000 matched native controls and full native positive-plant recoveries. [Windows Node22 successful execution, 18 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/44210082846), job 134485915701.

## Cryptanalytic decision

The manuscript's highly balanced word endings imply any successful English-word-preserving decryption needs to **change the ending frequencies through additional state**, a source-linked changing word key, a variable-length/word-boundary-changing channel, or a prior high-entropy register. Simply deriving a better fixed exponent or a more elaborate fixed 29-adic permutation cannot do so. The signed 2013 BASE29/DH clues remain authentic mathematical source material; **their direct fixed wordwise-power receiver is retired**.

The useful remaining decision is to identify an *author-selected* rule that transports or updates state **between printed words**, or to recover an independently authenticated unknown-page plaintext/key. No follow-on exponent sweep is warranted.
