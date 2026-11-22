# Genesis running-key candidate selected by LIBER PRIMUS: original-input negative

**Research decision (22 November 2026): no simple running-key plaintext from the KJV's Genesis under any whole-book starting position.** The manuscript's Latin title *Liber Primus* means “First Book.” One plausible, historically available human key source is the first book of the Christian Bible, *Genesis*. Cicada's previous LP1 decoding uses a literal GP29 Vigenère cipher, so this is a sharply specified reuse of an authentic primitive with a title-motivated external key text, rather than an unconstrained key search.

**Frozen setup:** KJV Genesis, all 50 chapters, 1,533 verses in canonical order as [aruljohn/Bible-kjv Genesis.json](https://github.com/aruljohn/Bible-kjv/blob/master/Genesis.json), immutable source Git blob SHA1 \`99266086fc538315168650256b5edf765970d2ad\`. Convert alphabetic words using the independently solved LP1 GP29 spelling rules (V→U, K→C, QU→CW, Z→S, ING and IO as single source-attested rune forms). This yields **142,678 GP runes**, with IoC **0.06336044**. Preserve the complete original LP2 ciphertext including all ordinary word boundaries but analyze the unambiguous **249 black runes after p0's separately printed red13 heading**, along with contiguous p1 (266) and p2 (201). Neither the conditional “EPIPHANY SEEKS” title crib nor any guessed plaintext is used.

For every possible overlapping Genesis key offset and the two Vigenère signs \`C−K\`, \`C+K\`, record all 29-bin GP29 character IoCs. The output with sign \`K−C\` has exactly the same unigram IoC as \`C−K\` and therefore need not be duplicated. For a genuine key alignment covering an intact original 716-rune narrative span, author-like plaintext would have an IoC of roughly0.05–0.07; wrong-key outputs remain close to the uniform baseline1/29=0.03448. A native solved p57 plaintext plant of 716 GP runes encrypted at the arbitrary fixed Genesis offset3301 round-trips **716/716** and has plaintext IoC above0.06.

| Original input | Length | Key offsets / sign | Best C−K IoC | Best C+K IoC |
|---|---:|---:|---:|---:|
| P0 black body followed by p1,p2 | 716 | 141,963 | **0.03739501** | **0.03661367** |
| P0 black body only | 249 | 142,430 | 0.04113227 | 0.04139137 |
| P1 alone | 266 | 142,413 | 0.04116896 | 0.04119733 |
| P2 alone | 201 | 142,478 | 0.04273632 | 0.04407960 |

No 716-rune output in **283,926** signed trials reaches IoC0.04. None of the original separately tested 249/266/201-rune pages reaches IoC0.045 in either sign. There is no candidate native-GP prose or externally recoverable key. Because the full Genesis running key was scanned in its original order with no tuned permutations, a hidden starting verse cannot rescue this exact continuous-key model.

**Scope:** This rejects the normal direct Genesis GP29 Vigenère running key on p0 body/p1/p2, including independent per-page restarts anywhere inside Genesis. It does not reject the Genesis book as a source for a different puzzle operation, editions with different text, keyed reordering, or non-Vigenère book ciphers. The title alone does not authenticate Genesis as the intended key source.

**Reproduce:** \`node sims/lp2_genesis_firstbook_running_key_sft.cjs\` on Node22. Uses the original \`resources/liber-primus/lp2-corpus.json\`, fetches the pinned external Genesis and refuses content changes, and tests every offset with complete original ciphertext. The check requires public network access to download Genesis, but makes no other outside query. No newly solved LP2 plaintext is claimed.
