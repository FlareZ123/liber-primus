# Original 2015-linked public LP2 rune decoders: newly recovered exact script and original-input gate

**15 November 2026, Agent39, Director #1109.** Positive recovery of one previously unindexed, period-linked public 64,630-byte rune-analysis source file and identification of its exact upstream public Gist. The recovered material implements reversible GP29 offsets, but contains **no independently selected key or original unknown-p0–55 plaintext**. The source's default program makes only Caesar shifts. Its optional prime mode omits the established solved-p56 transparent-F exception. This is a historically authenticated *participant code object*, not a Cicada-authored decipherer.

## Original source-selected files

The original **7 July 2015, 18:12:18 UTC** Fandom revision 26139, original pageID9003, [Part9 original text](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_9?oldid=26139) contains an explicitly named section *Transcription of Runes*. Its literal contemporaneous text names:

> "There are some scripts to decrypt runes based in some rules: runes.py [shortlink] runescript.py [Pastebin] (which is based in runes.py)."

This source-selection step predates the present acquisition; the original revision has 21,146 characters, SHA256 `ddab91a2353268bca4b3a9f4e70402d77ac320834972dbf2f995b6acec8d92c6` in the API's source-text encoding. Its upstream source and specific code remain available:

| Exact original 2015 link | Current read-only recovery | Reproducible original object |
| --- | --- | --- |
| [`http://pastebin.com/zXMgSFLM`](https://pastebin.com/raw/zXMgSFLM), explicitly titled `runescript.py` | HTTP 200 `text/plain`, 64,630 bytes, **960 lines** | SHA256 `012f113274f10b453a6423e5fe263c1ad186fda95c64af6433b6f17da348ef3b` |
| [`http://git.io/xQrlUg`](https://git.io/xQrlUg), explicitly titled `runes.py` | HTTP 200 shortlink redirect to [huw's Gist `8a564d1e8027294df15d`](https://gist.github.com/huw/8a564d1e8027294df15d) | Public versioned source tree, current hosted code. Its current revision is a later-available object, so the 2015 wiki citation does not authenticate the date of every live Gist line |

The exact [source-acquisition SFT](../sims/lp2_2015_original_runescript_source_acquisition_sft.cjs) retrieves the original raw Pastebin and redirected Gist link without executing either third-party program. It inventories actual definitions, default keys and full source windows. The first acquisition ran on Windows [43729919311](https://github.com/FlareZ123/liber-primus/actions/runs/43729919311). The expanded source windows and original-cipher controls passed in [Windows run 43730654340](https://github.com/FlareZ123/liber-primus/actions/runs/43730654340). The recovered code is left at its original public source URL: its source contains no stated redistribution license and is not blindly copied into this repository.

## What the original code actually does

The 960-line script bundles GP29 transliteration, transcription strings, helper methods `find_position()`, `forge_offsets()`, `frequency()`, and a page selector `p0..p57` (excluding runeless p50). The key-relevant code at original lines **34–57** names prime, totient, totient-of-primes, custom and empty sequences. **The actual executable assignment at original line48 is `sequence = [0 for x in range(1000)]`.** Other sequence assignments are comments. At lines **892–932** it loops direction ±1, phase parameter 0–28 and adds `direction × (sequence[i] − phase)` modulo29 per consumed rune. Spaces, dots and numeric graphics do not consume key positions. It writes every candidate to `translated.txt`. The optional p54 first-word `A`/`I` filter is likewise explicitly commented out, lines 940–943.

The **default therefore sends each page through 58 claimed attempts but produces only the 29 distinct unkeyed GP Caesar permutations**. It cannot change frequency-based evidence or solve an almost uniform unknown page. Nonzero commented key choices require a researcher to choose a sequence, its GP indexing, phase and meaning independently. The program never specifies an actual key or an original unknown-page plaintext passage.

The separately linked upstream `runes.py` Gist also provides a page-wide GP29 offset utility, with example prime and phrase-based sequences. It is code for investigator-selected keys. The 2015 wiki's second separately named **DECRYPTIONIST** is different: the original text proposes obtaining C code privately from `elbarto@reborn.com`, describing English dictionary word-pattern matching that retains repeated ciphertext-letter positions. It supplies **no executable/public download identifier, key or claimed original continuous plaintext**. Private program marketing language is not a decoding result.

## Original-cipher native tests, without running the untrusted Python

The [single original-input test](../sims/lp2_2015_runescript_original_default_sft.cjs) implements **exactly the program's published active zero-key and shift loops**, while loading canonical GP indices from `resources/liber-primus/lp2-corpus.json`. It confirms:

| Original physical page | Source GP runes | Original IoC | Source script attempted outputs | Distinct emitted symbol streams |
| --- | ---: | ---: | ---: | ---: |
| p0 | 262 | **0.034307273844** | 58 | **29** |
| p54 | 232 | **0.033139274519** | 58 | **29** |

All 58 variants for each page have **exactly unchanged IoC** and forward reencrypt to every original source rune; this last property is purely a bijective shift identity. The source p57 already-clear English IoC is `0.062709966`, far higher than either original unknown page. No decoded p0 or p54 passage emerges from the default mode.

**Independently documented genuine-p56 positive:** the author's commented **prime** schedule could decode the known p56 with `-(prime_i−1)` on each symbol, *provided* the solver skips the one printed literal ciphertext F at original rune position **56** without advancing the key. The published direct loop has no such F exception. On all 85 original p56 runes, its no-skip prime version has IoC **0.055182073** and diverges from genuine known plaintext at the preserved literal F. With the source-independent historical p56 skip at position56, the true recovered plaintext has IoC **0.070028011**, exactly forward reencrpyts **85/85** original runes, and begins the published authentic passage `AN END WITHIN THE DEEP WEB ...`. This control establishes the missing historical operation; it is not a new discovery of p56.

## Research decision

**Positive original-file acquisition, bounded negative cipher result.** The code source's actual consumer is now recovered and understood. It supplies no source-authored operand for unknown pages. No hidden constant from its 960-line source, dictionary match or user-tuned phase is promoted into a key. Unlike previously recovered `cluosh` and `UnRuneIt` tools, this is a separately source-linked **2015 public script** that now has an exact original static source, fixed SHA and full original-p0/p54 native check.

Further replays of the zero-key Caesar modes would duplicate this result. A useful advance requires a **separate first-party clue selecting one of the commented nonzero input sequences or an independent source file with a correctly predictive unknown-page key**. Historical `DECRYPTIONIST` source itself has only a direct-to-individual distribution claim, so its live bytes cannot be invented. The remaining 56 original unknown pages remain unread.
