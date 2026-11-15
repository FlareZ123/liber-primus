# Five numbered Wisdom passages under the five historically solved cipher methods

**Classification, 15 November 2026: original-source, source-order conditional negative.** The five printed LP2 Wisdom passages cannot be directly decoded by the five distinct previously solved Cicada cipher mechanisms assigned in first-known historical order, with each key starting at its own numbered passage. Three branches are mathematically incompatible with the authentic plaintext-F bypass rule, even allowing every ambiguous ciphertext-F choice. Two fixed Atbash branches remain GP29-uniform and visibly nonprose. **No unknown LP2 plaintext, authentic key, mechanism or continuation was recovered.** The missing premise is any creator instruction that numbered LP2 passages correspond to these five operations.

## An executable human-first route

On the original LP2 images 53–55 (physical LP2 p36–38), red numerals **1, 2, 3, 4, 5** mark five consecutive Wisdom passages, separated from surrounding ciphertext by large red punctuation. Their original ciphertext boundaries have already been independently read from the source images [here](lp2-cuneiform-five-numbered-wisdom-inversion.md). Nothing in the images spells out the cipher applied to each number.

By May 2014, a human solver could reproduce **five distinct, fully determined cryptographic operations** from authentic solved Liber Primus material:

1. LP1 *A WARNING*: GP29 Atbash, `P=28−C`.
2. LP1 *WELCOME*: Vigenère subtraction with `DIVINITY`, normalized as `DIUINITY` in canonical GP.
3. LP1 first *A KOAN*: Atbash then `+3` mod29.
4. LP1 second *A KOAN*: Vigenère subtraction with the authentic `FIRFUMFERENFE` spelling of `CIRCUMFERENCE`.
5. LP2 *AN END*, first solved on 19 May 2014: subtract consecutive prime totients, starting with `φ(2)=1`.

This deliberately tests **five different historical decipherment methods against the five printed numbers in first-solved order**, using no new keyword, modulus, prime starting position or alphabet. It is a plausible human action, **not an authenticated instruction**: the four LP1 methods come from different solved passages, and the fifth is itself located near the end of LP2.

The genuine-source intervals are item 1 p36 [99,238), item 2 p37 [0,91), item 3 p37 [91,189), item 4 p37 [189,228) joined to p38 [0,57), and item 5 p38 [57,186). Rune lengths are **[139,91,98,96,129]**, total **553**. Physical page wraps remain intact.

## Exact inverse and plaintext-F exhaustive test

LP1 keyed operations and LP2 *AN END* have a **plaintext F=index0 bypass**, which emits ciphertext F, and does not advance the key. A ciphertext F can be an ordinary encrypted non-F. To avoid discarding an authentic decryption through an incorrect all-F skip, the SFT carries **every reachable consumed-key clock** at each source rune. At any position, a literal bypass branch is permitted only for original ciphertext F; the ordinary key-consuming branch is permitted only if its decoded plaintext is non-F. All branches share the source-anchored initial key phase zero.

| Original numbered passage | Frozen authentic solved operation | Untouched source outcome |
| --- | --- | --- |
| **1**, 139 runes | GP29 Atbash | IoC **0.034198727974**; starts `HYTGROFNXLDX...`, no continuous prose |
| **2**, 91 runes | `DIUINITY` Vigenère | **No legal plaintext-F/key-clock path after local rune index 4** |
| **3**, 98 runes | GP29 Atbash +3 | IoC **0.031559015359**; starts `HUEAOE... `, no continuous prose |
| **4**, 96 runes | `FIRFUMFERENFE` Vigenère | **No legal path after local rune index 31** |
| **5**, 129 runes | Consecutive prime-totient key | **No legal path after local rune index 6** |

The impossibility of branches 2, 4, and 5 is independent of any English language scoring or guessed plaintext-F mask under these exact keys and original clock starts. The two Atbash outputs are deterministically reversible, but do not exhibit source-native English frequency concentration. The genuine p56 85-rune cipher with its one authenticated F bypass at local56 decrypts with the identical prime generator to known plaintext beginning `ANENDWITHINTHEDEEPWEB`; the SFT asserts its actual 84 key-consuming positions. Full source-clear p57 plants roundtrip through all three keyed schemes under the exact F-bypass rule.

### Scope and next decision

The five visible numerals do independently select ordered operands. They do **not** select these five operators, nor their association with the item labels, nor a common language register. This experiment tests one entirely frozen transfer of **all existing solved cipher types**; its failure means no source-supported plain-text path survives under that mapping. Existing separate gates already exclude five-square row masks, a five-column prime interleave, Shamir interpolation, 1033/3301 DH orbit and an unselected seven-packet radix interpretation. Those are not repeated.

An actual successor requires a contemporaneous author-supplied cipher schedule, input source or receiver for the five numbered passages. Further tuning of item-specific phases, order or extra secret keys would abandon the present source selection. Retain the exact **553-rune numbered enclosure** as an original operand and examine other independently motivated mechanisms without assuming that numerical fivefold alignment itself is a key.

**Standalone, runnable CommonJS/JSDoc reproduction:** [`sims/lp2_five_numbered_known_ciphers_source_sft.cjs`](../sims/lp2_five_numbered_known_ciphers_source_sft.cjs). Run with Node 22 from repo root. Source inputs are solely [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json), plus the already published and [independently reproduced](authentic-decryption-regression.md) historical solved-key choices.
