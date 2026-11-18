# Five-phase word-local GP29: Latin Vulgate and Old English original-cipher capacity

**Agent19, 18 November 2026. Classification: exact source-finite lexical capacity of a conjectural cipher family. No unknown LP2 plaintext, actual per-word alphabet or author-selected inverse recovered.** [Passing original-input CommonJS SFT](../sims/lp2_latin_wordlocal_fivephase_capacity_sft.cjs) · [Windows Node22 CI success, run 44342132779](https://github.com/FlareZ123/liber-primus/actions/runs/44342132779).

## Why an alternate register is worth one bounded check

The **original** LP2 p36 word at whole-book printed-word index **1967** has ten GP29 runes with exactly three equalities at lag five: signature `10011`. Under a *hypothetical*, independently secret set of five alphabet permutations for **each** printed word, equalities at offsets five and ten must be inherited unchanged from plaintext. The previous [complete English-source census](lp2-wordlocal-fivephase-allword-lexical-forcing.md) showed that this p36 word is compatible with the unusually rare `TAPESTRIES` in a finite English word list, whereas other sharp bottlenecks force `SEQUESTRECTOMY` (p13), `INFRAMAXILLARY` or `METEMPSYCHOSIS` (p25), and `MESDAMES` (p51). These are conditional lexical candidates, **not** deciphered words.

The book is titled *Liber Primus*, and historical Cicada material uses multiple languages. A genuinely different rival is **GP29-native Latin** or **Old English** behind a local five-phase cipher. Such a language hypothesis has no original explicit instruction and must not be rescued by inventing a new alphabet or switching languages at individual problematic words. Here we directly use the already pinned Vulgate and corrected Beowulf datasets with their **existing** native GP encodings and physical manuscript words. The object is to establish exact finite-vocabulary feasibility, not to optimize a synthetic key or rediscover the original anomalies.

## Invariant and exact source calculation

For each printed word `w` and zero-based rune location `j`, let a secret *word-specific*, phase-specific permutation `pi[w,j mod 5]` map plaintext to ciphertext:

`C[w,j] = pi[w,j mod 5](P[w,j])`.

Each of the five alphabets may be **any of the 29! bijections**, chosen independently for each word. For every pair of positions with the same phase, ciphertext symbols are equal **if and only if** plaintext symbols are equal. The exact signature consists of all lag-five and lag-ten equality bits, concatenated in increasing lag and then increasing position order. The longest original printed word is 14 runes, so those bits exhaust every within-phase pair. Conversely an exact match of the complete signature is **sufficient**: each partial injective map of plaintext equivalence classes extends to a full 29-symbol bijection. This is a key-independent complete feasibility criterion for this generous model.

The original transcription yields **12,956 GP runes**, **2,896 complete printed words**, including **32 carried across a physical page**, and **55 rune-bearing unsolved pages**. A line wrap or page boundary does not terminate an original printed word. The reference word types are taken from committed source-native fixtures rather than re-encoding arbitrary later dictionaries:

- **Latin Vulgate New Testament:** 39,835 original GP29-encoded word tokens, per-word normalization already fixed by the repository source. Exact original signature compatibility at **2,894 / 2,896** word positions.
- **Corrected Old English *Beowulf*:** 10,885 source-native GP29 word tokens, 48,012 GP runes. Exact signature compatibility at **2,873 / 2,896** positions; all three of the book's 14-rune positions fail because this finite Beowulf source supplies no 14-rune word.

The only two original printed words with **zero** matching GP-native Latin Vulgate tokens are:

| Original word index (zero-based) | Physical p | GP length | Entire five-phase equality signature | Original rune transcription |
| ---: | ---: | ---: | --- | --- |
| **1220** | **22** | 12 | `001010000` | `ᚹᛒᛗᚱᚾᛗᚻᛗᛁᚾᚪᛞ` |
| **1967** | **36** | 10 | `10011` | `ᛈᛟᛄᚪᛝᛈᚦᛈᚪᛝ` |

A language/cipher combination claiming **every** original word is taken *verbatim* from this exact Vulgate vocabulary cannot explain those two source words under **any** independent five-phase permutation key. This is a finite-vocabulary incompatibility, **not** a theorem about possible authored Latin or a differently encoded source.

## What changed about the four previous English bottlenecks

The same original four ciphertext words have considerably different candidate availability under the historical Latin register:

| Original word | Physical page | Latin matching tokens | Distinct Latin GP wordforms |
| ---: | ---: | ---: | ---: |
| #754, length14 | p13 | **4** | **2**, including `CONLOCUEBANTUR` and `INBECILLITATES` |
| #1353, length14 | p25 | **9** | **4**, including `CONDEMNATIONEM` |
| #1967, length10 | p36 | **0** | **0** |
| #2722, length8 | p51 | **2** | **1: TURBETUR** |

`TURBETUR` is a real wordform in the independent Vulgate corpus and is an exact GP29 equality-pattern match for p51's ciphertext `ᛋᛞᛝᚷᛚᛋᛞᛝ`. Thus the earlier English-only `MESDAMES` forced-word observation cannot be generalized into an all-language exclusion of a word-local five-phase permutation. Neither `TURBETUR` nor any of the other candidates is recovered plaintext: the secret alphabet has **not** been selected, and the group of five permutations is independent per word.

**Original contiguous-source veto, across all four candidate anchors:** The SFT scans **all** occurrences of every one of these four invariant signatures in the pinned Vulgate corpus, preserving the target's immediate previous and next *original physical word lengths*. Its exhaustive result is:

| Original anchor | Vulgate exact-pattern tokens | Matching immediate predecessor length | Matching immediate successor length | Matching **both** neighbors |
| ---: | ---: | ---: | ---: | ---: |
| p13 #754 | 4 | **0** | **0** | **0** |
| p25 #1353 | 9 | **0** | **0** | **0** |
| p36 #1967 | 0 | **0** | **0** | **0** |
| p51 #2722 | 2 | **2** | **0** | **0** |

The p51 source example is especially clear: genuine Vulgate occurrences of `TURBETUR` at original Latin indices **22014** and **22468** each occur as **`NON TURBETUR COR`** with lengths **3,8,3**. The physical manuscript has lengths **3,8,1** around its matching eight-rune word. It therefore **cannot** be either literal source phrase under any word-length-preserving substitution key. Likewise, the p13 and p25 source-matching 14-rune words are each immediately flanked by the wrong source lengths on both sides. This is a strict original-word **verbatim Vulgate-fragment exclusion** at four preselected anchored places; it does not reject an independently authored Latin passage or a non-Vulgate plaintext source.

The Old English finite reference gives **23 unmatched positions**, including p13, p25, p36 and p51. Its short corpus and morphological coverage prevent interpreting that count as a universal exclusion of Old English.

## Verification, limitation and research decision

The [read-only Windows-compatible SFT](../sims/lp2_latin_wordlocal_fivephase_capacity_sft.cjs) asserts the original exact corpus shape, the source word counts, the two Latin exceptions, the 23 Old English exceptions, the full four-word candidate counts and the literal Latin reading `TURBETUR`. A **genuinely source-native 12,956-rune Latin plant**, with an independently randomized five-alphabet bijection at each one of the original 2,896 word positions, is encoded and inverted exactly **12,956/12,956**, preserving every within-word phase equality. Its automated GitHub Actions run [44342132779](https://github.com/FlareZ123/liber-primus/actions/runs/44342132779) completed successfully on Node 22 / Windows.

The analysis **does not** choose a cipher, infer an original keystream, establish that any page is Latin/Old English or decode an unknown sentence. It rejects only *verbatim membership in these finite reference corpora* under the specified fully independent per-word phase model. Its most useful causal consequence is to keep the p36 `TAPESTRIES` and p51 `MESDAMES` readings strictly **source-register conditional**: p51 has a straightforward rival Latin shape, whereas p36 has no example in the specific Vulgate reference. Any investment in this cipher family now needs an **independently source-selected, reproducible per-word key-generation rule** and a held-out paragraph; additional unconstrained dictionary matches cannot recover real plaintext. The authoritative book status remains [results/README.md](../results/README.md): all 56 unsolved LP2 pages remain unsolved.
