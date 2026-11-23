# Five red-numbered passages: independent 5-bit Bacon lane inverse

**Agent 1, 23 November 2026. Status: source-motivated exploratory negative; no recovered LP2 plaintext, authentic opcode, key, or destination.** The 2014 original five red numerals select five ordered rune texts, but do not specifically instruct a binary/Bacon representation. A direct canonical binary channel produces nonprose; even a much more generous exploratory search for a single unknown rune-to-bit table fails to recover English. An independent 91-character genuine-English plant *is recovered exactly by that same search*, while obeying the source's suppression of adjacent duplicate glyphs.

## One explicit human-readable hypothesis

The original LP2 archive images **53.jpg–55.jpg**, physical pages **36–38**, place red Arabic labels **1,2,3,4,5** before five runic paragraphs inside two ten-dot red bounds. The section labels supply a natural five-bit ordering for a possible Bacon-style encoding; a literate 2014 solver knew binary and five-bit classical alphabets. This is a *rival data representation* to previously failed five-stage and five-stream GP29 arithmetic, not a claimed first-party Cicada instruction.

Use the **first 91 GP runes** of each complete original numbered paragraph. There are exactly 91 columns with all five runes; original lengths are **139 / 91 / 98 / 96 / 129 = 553**. In column *i*, map each section's GP rune to one binary bit through a **single shared, stationary 29-entry bit table**. Read section1 as the most significant bit and section5 as the least significant; output values 0..25 as uncontracted Latin A..Z and reserve 26..31. A real 2014 solve would additionally have to explain the **98 unconsumed** original runes. In particular, this exploratory model is neither a lossless decoding of all five original paragraphs nor a claim that only 91 columns matter.

The immediately available non-secret table maps GP index *r* to *r mod 2*. Its **91 original outputs** are:

~~~text
OHGGPYCSLD5MLEBVISUVZMFWQLIE4GNTFAQCKRP55DQDVSSFFGAK25FOZAXK411CQXQW05NPHUO2K45SMBJLZUFHLDJ
~~~

Digits 0..5 in this display denote the six reserved 5-bit values; none has been repaired into a letter. The output is plainly neither a coherent 91-character English instruction nor an unmodified signed historical phrase.

## Exploration with every rune's bit unknown

A stronger test permits *all 29 GP rune identities* to have unknown shared binary labels, so a fixed secret Bacon alphabet is allowed. Its entire key space has 2^29 masks; the implemented search is a **seeded four-start 720,000-toggle language-guided heuristic, not an exhaustive all-key exclusion**. Each candidate is decoded under the same five-plane rule without added rotation, insertion, key phase, or customized word breaks.

The score uses only a four-gram and unigram model trained on the separately committed Gibran English control, all spaces/punctuation removed. The exact frozen pseudocounts, temperature schedule, seeds **3301 and 3310**, text normalization, and GP bit representation are in the single-file SFT.

| Untouched receiver | Source-aligned rune rows | Best score, natural log per output | Result |
| --- | ---: | ---: | --- |
| Actual LP2 numbered unit prefixes | five × 91 | **−6.0682962985** | Output lacks coherent English; best candidate begins **EAMUCHCVBAOIDBEEIEABREIS...** |
| Independent English positive, secretly encoded as GP rune-bit planes | five × 91 | **+0.4186662559** | **91/91 actual English characters recovered**, exact text and independent alphabet not supplied to optimizer |

The plant comes from **an Emerson text separately stored in the repository**, not from the training Gibran text. A fixed random source-bit partition encodes its 91 letters as five rune rows. Each candidate rune is sampled from the matching 14/15-rune class and rejects an adjacent repetition, so the planted five × 91 runes contain **zero within-lane adjacent identical symbols**. The *actual* five numbered source prefixes also contain **zero within-lane adjacent doublets**. The positive demonstrates that the search can recover a true, unrepeated 91-character Bacon message under a completely hidden shared binary alphabet without exploiting an artificially easy repeated-glyph pattern.

The positive recovers the complete Emerson passage:

~~~text
HATISONCEADMITTEDTOTHERIGHTOFREASONISMADEAFREEMANOFTHEWHOLEESTATEWHATPLATOHASTHOUGHTHEMAYTH
~~~

The printed plaintext is a 91-character uppercase excerpt cut from a longer text, so its truncation at both ends is natural. The method discovers the hidden rune-bit assignment as well as the complete original message; the held-out plant is not added to the GP training distribution.

## Cryptanalytic decision

The physically fivefold notation does *not* yield an immediate Bacon decipherment of the 91-column prefix, even when the bit alphabet is learned rather than guessed. The controlled score gap is substantial, but **do not claim an exhaustive exclusion of all secret 29-bit tables**: hill-climbing may miss a high-scoring source key, and other bit encodings, column starts, carry rules, spelling registers, or staged transformations are outside this test. The numeric labels alone supply no bit criterion, nor does the source specify what to do with the 98 trailing runes.

The positive verified 91-character plaintext recovery shows that this particular alternative representation has been given a meaningful chance rather than dismissed on superficial frequency tests. Further tuning of partition scores or undocumented column starts has no causal route to an authenticated full-paragraph inverse. If a first-party source ever reveals a **specific glyph-to-bit rule**, rerun the unchanged 91-column receiver with that rule and demand an untouched original continuation. Otherwise seek the first opcode/key as explicitly required by [Director #2243](https://github.com/FlareZ123/liber-primus/issues/2243).

**Exact reproducer:** [read-only Windows Node22 one-file SFT](../sims/lp2_five_numbered_bacon5_allsecret_sft.cjs). Source data: [original corpus](../resources/liber-primus/lp2-corpus.json), [Gibran GP-independent training reference](../resources/control/gibran_prophet_58585.txt), [independent Emerson English plant](../resources/control/emerson_essays_2944.txt). The CJS checks five source lengths, source GP symbol range, original parity output, source-first duplicate suppression, the frozen heuristic best score, plant ciphertext construction, complete plant decoding, and hidden-mask independent recovery.
