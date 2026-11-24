# Historical multilingual-register gate: the selected Mabinogion parallel (#2648)

**Decision:** The 2012 puzzle supplies a real English/Welsh literary parallel, but its executable clue selects the English version and its exact line layout. No period-authenticated rule was found that selects Welsh, any other language, or an alternative GP29 representation for an unknown LP2 unit. Do not spend a new key-search budget on Welsh solely because modern descriptions sometimes count 29 alphabetic letters.

## Strongest candidate, independently selected

Unlike the unrelated *Pwyll* Welsh donor previously tested in [#2212](https://github.com/FlareZ123/liber-primus/issues/2212), the actual 2012 selected tale was *The Lady of the Fountain* / *Iarlles y Ffynnawn*. The [National Library of Wales manuscript catalogue, A2/1–2](https://archives.library.wales/index.php/iarlles-y-ffynnawn) identifies Guest's 1838 Welsh transcript and English draft and their respective published locations in volume I (1849), pp. 1–10 and 39–56 for the preserved portions. [Bangor University's first-edition account](https://arthurbangor.omeka.net/exhibits/show/home-is-where-the-legends-are/mabinogion/first-editions) describes the separate Welsh and English texts in the 1838–49 publication. An [1849 volume digitization dated 2009](https://books.google.com/books?id=A57YAAAAMAAJ) establishes availability of a digitized witness before LP2, but not use of that copy by a Cicada solver.

The 2012 original participant-facing encoded Reddit lines, as preserved in the [2012 archive](https://github.com/scream314/cicada3301/blob/master/2012.md#the-subreddit-king-arthur-and-the-holy-grail) (README blob 0d71498db2b85586687af4366559a50bd4116858, lines 175–346), select Guest by username anagram and decrypt into her **English** tale. The contemporaneous [ClevCode account](https://clevcode.org/cicada-3301/) identifies the Project Gutenberg line layout with blank lines discarded and one-word lines appended. It reports the subsequent line-count clue as 833−65=768. [Project Gutenberg #5160](https://www.gutenberg.org/ebooks/5160) records release in February 2004. The Welsh transcript's existence is genuine; the operative 2012 text is specifically English. This is a language/representation distinction, not a new replay of the 2012 known code.

## A new exact native-alphabet capacity gate

Native Welsh digraphs are a different representation from the English GP alias transliteration used on the earlier Pwyll donor. The UK Permanent Committee on Geographical Names' February 2009 [UN working paper, §4.2](https://unstats.un.org/unsd/geoinfo/ungegn/docs/25th-gegn-docs/wp%20papers/wp7-toponymicguidelines-uk.pdf) specifies 28 traditional letters, eight of them digraphs:

`A B C CH D DD E F FF G NG H I L LL M N O P PH R RH S T TH U W Y`.

The 1913 [Morris-Jones Welsh Grammar, phonology](https://en.wikisource.org/wiki/A_Welsh_Grammar%2C_Historical_and_Comparative/Phonology) independently documents historically changing Welsh alphabets, including the 1621 inventory (28 entries, with two written forms of Y) and an earlier 24-letter inventory. The 2009 specification is for the modern traditional inventory, not a universal medieval spelling normalizer. Modern loanword J can be counted as a 29th letter; it is not evidence of a 29-symbol medieval system. Neither source supplies a map from its alphabet to Gematria Primus.

Frozen model: one native alphabetic token emits one GP symbol via a stationary mapping. A deterministic function on 28 inputs has image size at most 28; even independent page-private maps cannot produce a 29-symbol page. No corpus choice, dictionary or statistical threshold affects this result.

Computed directly on the pinned canonical GP corpus `resources/liber-primus/lp2-corpus.json` (blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165):

| Observable | Result |
|---|---:|
| Original unknown runes p0–55 | 12,956 |
| Original pages using every one of the 29 symbols | 53 |
| Remaining physical pages | p49: 28; p50: 0; p55: 25 |
| Minimum global symbol count | 399 (EO) |
| Sum of per-page minimum symbol counts, including zero | 180 |

Consequently, adding a 29th loan-letter token J to make the alphabet fit does not solve the historical problem. Under *any* fixed 29→29 bijection the proposed source must contain at least **399 J tokens**; with independent page bijections it still needs at least **180 J tokens**. These are necessary, not sufficient, conditions, and do not claim modern Welsh language in general is impossible. A traditional 28-letter stream with an explicit escape/homophone/position-dependent cipher could evade these bounds, but no such rule was found. This conclusion is conditional on a one-token/one-output-symbol model, not a new broad exclusion of Welsh under arbitrary encryption.

Reproducer: [native Welsh alphabet capacity SFT](../sims/lp2_native_welsh_alphabet_capacity_sft.cjs). Core computation executed on original repository inputs in the connector JS runtime; the standalone wrapper was not separately executed. The period PDF's text was retrieved but screenshot rendering failed; the historical inventory was also checked against the HTML grammar. No unknown text was selected or scored, and no sham heldout decode is claimed.

## Other inspected source scope and decision

The archived 2013 Crowley book-code witness is the English *Book of the Law* despite its Latin title; the 2014 GEB book-code identifiers and character positions select English dialogue headings and speech. See [2013 archive](https://github.com/scream314/cicada3301/blob/master/2013.md#the-law) and [2014 archive](https://github.com/scream314/cicada3301/blob/master/2014.md), with the existing [GEB source-chain correction](2014-onion5-geb-onion6-chain.md). The preserved historical clear-signed bodies inspected in `resources/historical/` (2012 countdown/RSA/MIDI; 2013 hello/forest/gematria/if-you-followed/no-more-testing/second-onion/welcome; 2014 onion5/sixth-onion/stage09/stage11/LP1 XOR-derived) contain English instructions or numeric/encoded fields, not a selected alternative-language aligned decoding rule. This is a bounded source review, not a claim that every surviving or lost historical source has been searched. #2637 already establishes the genuine 2013 Instar English metadata/p57 witness and its greedy GP alias conversion.

The **missing object** is a genuine participant-facing language or representation instruction that fixes an alternative tokenizer, its GP mapping/escape convention, and an LP2 receiver independently. The bilingual Mabinogion source confirms an authentic historical parallel, but the historical operational clue chooses English and no Welsh LP2 receiver is established. Do not infer an extra language from the book title, national origin, or the equal modern alphabet size. Close the bounded source gate and return resources to a source-selected cipher operation or recoverable missing key. No unknown plaintext, authentic key or destination recovered.
