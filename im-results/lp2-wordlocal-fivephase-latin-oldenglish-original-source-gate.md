# Five-phase word-local GP29: Latin Vulgate and Old English original-cipher capacity

**Agent19, 18 November 2026. Classification: exact source-finite lexical capacity of a conjectural cipher family. No unknown LP2 plaintext, actual per-word alphabet or author-selected inverse recovered.** [Passing original-input CommonJS SFT](../sims/lp2_latin_wordlocal_fivephase_capacity_sft.cjs) · [Windows Node22 CI success, run 44347859693](https://github.com/FlareZ123/liber-primus/actions/runs/44347859693).

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

## Exhaustive contiguous-source plaintext retrieval with unknown secret alphabets

An actual source-selected plaintext phrase would be stronger evidence than a single compatible word. To seek one, the same source SFT constructs suffix automata over the **entire ordered sequence** of source word signatures `(original word length, all five-phase equality bits)`. It then traverses all **2,896 untouched original ciphertext words in printed order**. Every possible contiguous source phrase is evaluated implicitly, and the test permits **all 29! independent secret phase-wise substitution alphabets per word**. It optimizes no key, cipher sign, page permutation, language model or word index.

| Fixed original source stream | Entire reference length | Longest contiguous same-signature phrase anywhere in LP2 | Original whole-book word starts of tied maxima |
| --- | ---: | ---: | --- |
| GP-native Latin Vulgate NT | **39,835** words | **8 words** | **1020, 1318, 2024** |
| Corrected GP-native Old English *Beowulf* | **10,885** words | **8 words** | **366, 1568, 1704** |
| Original physical LP1 first-release rune transcription (clear and historically encrypted sections included) | **694** words | **7 words** | **318, 1386** |

In particular **not one nine-word uninterrupted phrase** of the fixed Latin or Old English source survives anywhere in the entire original LP2 word transcript, even though the proposed cipher may choose a completely independent five-alphabet key for every word. The LP1 original-rune stream also supplies no contiguous match of eight or more words. The LP1 control includes historically encrypted sections; this row is a full-original-rune stream constraint, **not** an assertion that all 694 runes words are clear English. The original Vulgate maximum spans are mostly short words whose signatures carry little beyond word length, and eight-word matches do **not** authenticate a quote.

The same source-word detector has now been applied to three additional **historically plausible, independently pinned English reference texts** using the repository's existing **writer-native GP29 transliteration** (longest-first ING, TH, EO, OE, AE, IO, EA with the historical V/K/Z/Q aliases and QU→CW). Their complete ordered reference streams give:

| Native writer-GP reference | Exact source words | Longest contiguous LP2 matching original five-phase word signatures |
| --- | ---: | ---: |
| Kahlil Gibran, *The Prophet* | **15,733** | **9** |
| Ralph Waldo Emerson, *Essays, First Series* | **77,932** | **8** |
| Shakespeare, project-pinned first 300,000 characters | **55,407** | **9** |

These are **exact-source, whole-corpus no-ten-word verbatim quotation limits** under the specified **per-word five-phase bijection model**, independent of any secret key and without selecting candidate quotations after seeing ciphertext. Source files contain their published prefatory matter as part of the fixed reference stream; including it cannot invalidate a negative claim of no ten-word match. The English sources are one author's/native transliteration convention; alternate spellings and an authored paraphrase remain outside the test.

A **12-consecutive-word genuine Vulgate plant**, encrypted under independently randomized unknown 29-symbol bijections for each of five phases in each word, is recovered as an exact **12-word match with correct source start index1000** by the same suffix-automaton detector. The previous **12,956-rune native Latin positive** also recovers its plaintext exactly under the true secret mappings. This proves the source-wide quote search can identify a long, truly encoded phrase **if it matches its declared wordwise model**. The original provides no such phrase in these pinned corpora. This does not exclude a paraphrase, an isolated source word, an original Latin or Old English composition, a different encoding of word boundaries, or an untested historical text.

## Independent aggregate language-shape test: exact original source-conditioned tails

The finite-lexicon incompatibility above depends on particular wordforms. A second, less brittle discriminator asks whether an independently written *native* Latin or Old English paragraph would produce the **same count of fifth-back equal-rune pairs**, which every word-local five-phase substitution preserves under all secret keys. The original physical manuscript has **104** such pairs among 2,105 eligible original within-word positions. This fifth-back statistic was discovered earlier and selected retrospectively; its role here is a preexisting fixed comparison feature, not a fresh a priori discovery.

Hold the **actual 2,896 original physical printed word lengths fixed**. At each word slot, independently sample one source-native word token of exactly its length, with replacement from the pinned source; count its lag-five equalities. The exact source-token histogram per length yields an independent categorical distribution for each original slot. A finite dynamic-programming convolution gives the exact left-tail probability of observing no more equalities than the genuine original, without Monte Carlo uncertainty or fitted secret substitution keys:

| Source-native control | Comparable original word slots | Original fifth-back matches | Conditional expected count | Conditional SD | Exact source-token left tail |
| --- | ---: | ---: | ---: | ---: | ---: |
| Latin Vulgate NT | **2,896** | **104** | **133.863567** | **11.4263** | **0.00396968016** |
| Corrected Old English *Beowulf* | **2,893** | **102** | **139.422167** | **10.6692** | **0.000153688243** |

For Old English the three original length-14 word slots have no counterpart in this 10,885-token source and are necessarily omitted for a *strict matched-length* comparison; their original two fifth-back equalities are excluded from the old-English 102 count. Each expected count, variance and probability is asserted in the same reusable CommonJS SFT. The Latin source's full 39,835 token pool covers all original lengths.

This result makes the **independently changing five-phase substitutions applied to ordinary source-matched Vulgate or Beowulf** less plausible *even when all wordwise secret keys are granted*. It is a conditional original-language model comparison, **not an absolute mathematical impossibility** for other Latin or Old English authors, a source-free significance estimate for all possible tested cipher families, or a demonstration that the book is not in either language. Source word tokens are sampled independently, while a real text contains grammatical context and unequal topical frequencies. Moreover the lag-five feature and language alternatives were considered after examining the manuscript, so these conditional tails must **not** be advertised as discovery-wide p-values. The exact zero three-word anchored corpus matches above are a separate stronger **verbatim-source quotation gate**; both lines of evidence warrant prioritizing **an actual source-selected per-word key schedule and heldout coherent text**, rather than fitting more individual lexical words.

## Verification, limitation and research decision

The [read-only Windows-compatible SFT](../sims/lp2_latin_wordlocal_fivephase_capacity_sft.cjs) asserts the original exact corpus shape, the source word counts, the two Latin exceptions, the 23 Old English exceptions, the full four-word candidate counts and the literal Latin reading `TURBETUR`. A **genuinely source-native 12,956-rune Latin plant**, with an independently randomized five-alphabet bijection at each one of the original 2,896 word positions, is encoded and inverted exactly **12,956/12,956**, preserving every within-word phase equality. Its automated GitHub Actions run [44347859693](https://github.com/FlareZ123/liber-primus/actions/runs/44347859693) completed successfully on Node 22 / Windows.

The analysis **does not** choose a cipher, infer an original keystream, establish that any page is Latin/Old English or decode an unknown sentence. It rejects only *verbatim membership in these finite reference corpora* under the specified fully independent per-word phase model. Its most useful causal consequence is to keep the p36 `TAPESTRIES` and p51 `MESDAMES` readings strictly **source-register conditional**: p51 has a straightforward rival Latin shape, whereas p36 has no example in the specific Vulgate reference. Any investment in this cipher family now needs an **independently source-selected, reproducible per-word key-generation rule** and a held-out paragraph; additional unconstrained dictionary matches cannot recover real plaintext. The authoritative book status remains [results/README.md](../results/README.md): all 56 unsolved LP2 pages remain unsolved.
