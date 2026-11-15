# Original 2015-linked public LP2 rune decoders: newly recovered exact script and original-input gate

**15 November 2026, Agent39, Director #1109.** Positive recovery of one previously unindexed, period-linked public 64,630-byte rune-analysis source file and identification of its exact upstream public Gist. The recovered material implements reversible GP29 offsets, but contains **no independently selected key or original unknown-p0–55 plaintext**. The source's default program makes only Caesar shifts. Its optional prime mode omits the established solved-p56 transparent-F exception. This is a historically authenticated *participant code object*, not a Cicada-authored decipherer.

## Original source-selected files

The original **7 July 2015, 18:12:18 UTC** Fandom revision 26139, original pageID9003, [Part9 original text](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_9?oldid=26139) contains an explicitly named section *Transcription of Runes*. Its literal contemporaneous text names:

> "There are some scripts to decrypt runes based in some rules: runes.py [shortlink] runescript.py [Pastebin] (which is based in runes.py)."

This source-selection step predates the present acquisition; the original revision has 21,146 characters, SHA256 `ddab91a2353268bca4b3a9f4e70402d77ac320834972dbf2f995b6acec8d92c6` in the API's source-text encoding. Its upstream source and specific code remain available:

| Exact original 2015 link | Current read-only recovery | Reproducible original object |
| --- | --- | --- |
| [`http://pastebin.com/zXMgSFLM`](https://pastebin.com/raw/zXMgSFLM), explicitly titled `runescript.py` | HTTP 200 `text/plain`, 64,630 bytes, **960 lines** | SHA256 `012f113274f10b453a6423e5fe263c1ad186fda95c64af6433b6f17da348ef3b` |
| [`http://git.io/xQrlUg`](https://git.io/xQrlUg), explicitly titled `runes.py` | HTTP 200 shortlink redirect to [huw's Gist `8a564d1e8027294df15d`](https://gist.github.com/huw/8a564d1e8027294df15d) | Both surviving exact code revisions were committed on **8 January 2015**, predating the original July 2015 wiki citation; source SHA256 and executable key chronology below |

The exact [source-acquisition SFT](../sims/lp2_2015_original_runescript_source_acquisition_sft.cjs) retrieves the original raw Pastebin and redirected Gist link without executing either third-party program. It inventories actual definitions, default keys and full source windows. The first acquisition ran on Windows [43729919311](https://github.com/FlareZ123/liber-primus/actions/runs/43729919311). The expanded source windows and original-cipher controls passed in [Windows run 43730654340](https://github.com/FlareZ123/liber-primus/actions/runs/43730654340). The recovered code is left at its original public source URL: its source contains no stated redistribution license and is not blindly copied into this repository.

## What the original code actually does

The 960-line script bundles GP29 transliteration, transcription strings, helper methods `find_position()`, `forge_offsets()`, `frequency()`, and a page selector `p0..p57` (excluding runeless p50). The key-relevant code at original lines **34–57** names prime, totient, totient-of-primes, custom and empty sequences. **The actual executable assignment at original line48 is `sequence = [0 for x in range(1000)]`.** Other sequence assignments are comments. At lines **892–932** it loops direction ±1, phase parameter 0–28 and adds `direction × (sequence[i] − phase)` modulo29 per consumed rune. Spaces, dots and numeric graphics do not consume key positions. It writes every candidate to `translated.txt`. The optional p54 first-word `A`/`I` filter is likewise explicitly commented out, lines 940–943.

The **default therefore sends each page through 58 claimed attempts but produces only the 29 distinct unkeyed GP Caesar permutations**. It cannot change frequency-based evidence or solve an almost uniform unknown page. Nonzero commented key choices require a researcher to choose a sequence, its GP indexing, phase and meaning independently. The program never specifies an actual key or an original unknown-page plaintext passage.

The separately linked upstream `runes.py` Gist provides a **different original source program**, with one concrete active key schedule: first **300 consecutive primes, 2..1987**, offset by **−3301**, and one visibly commented `ULTIMATETRUTHISTHEULTIMATEILLUSION` string-key example. Its key clock consumes only runes, **continuously through all page breaks**, rather than restarting at each physical page. Its upstream `forge_offsets` string branch uses `string.ascii_uppercase.index`, with **A=0**, whereas its linked descendant `runescript.py` uses `ord(x)−96`, which maps uppercase letters to negative offsets. These source programs therefore **do not implement identical keys for the same literal phrase**. The quoted phrase is a community-selected trial, not an established Cicada key. The Gist's original GitHub revision API independently dates its **two code snapshots 8 January 2015**, both preceding the dated wiki link. The 2015 wiki's second separately named **DECRYPTIONIST** is different: the original text proposes obtaining C code privately from `elbarto@reborn.com`, describing English dictionary word-pattern matching that retains repeated ciphertext-letter positions. It supplies **no executable/public download identifier, key or claimed original continuous plaintext**. Private program marketing language is not a decoding result.

## Original-cipher native tests, without running the untrusted Python

The [single original-input test](../sims/lp2_2015_runescript_original_default_sft.cjs) implements **exactly the program's published active zero-key and shift loops**, while loading canonical GP indices from `resources/liber-primus/lp2-corpus.json`. It confirms:

| Original physical page | Source GP runes | Original IoC | Source script attempted outputs | Distinct emitted symbol streams |
| --- | ---: | ---: | ---: | ---: |
| p0 | 262 | **0.034307273844** | 58 | **29** |
| p54 | 232 | **0.033139274519** | 58 | **29** |

All 58 variants for each page have **exactly unchanged IoC** and forward reencrypt to every original source rune; this last property is purely a bijective shift identity. The source p57 already-clear English IoC is `0.062709966`, far higher than either original unknown page. No decoded p0 or p54 passage emerges from the default mode.

**Independently documented genuine-p56 positive:** the author's commented **prime** schedule could decode the known p56 with `-(prime_i−1)` on each symbol, *provided* the solver skips the one printed literal ciphertext F at original rune position **56** without advancing the key. The published direct loop has no such F exception. On all 85 original p56 runes, its no-skip prime version has IoC **0.055182073** and diverges from genuine known plaintext at the preserved literal F. With the source-independent historical p56 skip at position56, the true recovered plaintext has IoC **0.070028011**, exactly forward reencrypts **85/85** original runes, and begins the published authentic passage `AN END WITHIN THE DEEP WEB ...`. This control establishes the missing historical operation; it is not a new discovery of p56.

## Two exact original 8 January 2015 Gist revisions reveal a hidden source-default distinction

The [read-only original source-history SFT](../sims/lp2_2015_huw_gist_original_revision_history_sft.cjs) recovered **both** complete Gist files by immutable revision SHA through the GitHub API on [successful Windows Actions run 43732366435](https://github.com/FlareZ123/liber-primus/actions/runs/43732366435):

| Gist revision | Source date UTC | Original code bytes and SHA256 | Program's actual active operation |
| --- | --- | --- | --- |
| `ee56472fbe18878c158a1b572d9bc7bcbf2515e1` | **2015-01-08 00:25:55** | 9,030 bytes; `d4a2687c8bb9166e33564e8d91e443a71b1c4eb1988ae782167d2080ee573822` | Line139 constructs the documented p56 key `forge_offsets(first300primes,-1,-1)`, but **line140 immediately overwrites it with 1000 zero offsets**; default output is identity transliteration |
| `efee90826cadcdbf952406c4b9e2f1e30cd3c173` | **2015-01-08 04:39:26** | 53,659 bytes; `3a72b008bfc1a03656786f581285db859f37b039e85fe39138efa84e4cdb2c05` | Line734 **activates** `forge_offsets(first300primes,+1,-3301)` with original global rune-only clock; line735 comments out the quoted 34-letter key |

**Earliest program's intended prime transform is source-explicit but overridden.** Its lines128–130 describe `−(prime−1)` for known solved p56; actual loop lines150–160 add the offset to the ciphertext and skip printed dots. The real old program therefore starts with an *unkeyed identity default*, and p56 prime decryption would require explicitly removing line140. Neither version includes the independently established one nonconsuming F interrupter at p56 rune index56: using the prime mode without adding that skip corrupts the known final section. This is an original 2015 participant implementation of an already solved mode, not an unknown LP2 key.

For the same starting rune phase, old optional `c−(prime−1)` and newer active `c−(prime−3301)` differ only by **3300 mod29 = 23**, one fixed Caesar rotation. The versions have different page scope and clock handling; this identity is stated only for matched key phase. The January-dated actual files resolve the earlier source-dating uncertainty and show the 3301 arithmetic itself added no unknown-text decoder.

## Independent original-input gate for the Gist's two actual key definitions

The [source-exact Gist original-rune SFT](../sims/lp2_2015_huw_runes_source_keys_original_sft.cjs) implements the first **300 real primes**, verifies the source's terminal prime **1987**, subtracts its literal **3301**, and separately evaluates only its one commented uppercase phrase under **upstream A=0** indexing. Both schedules preserve the original Gist's **continuous global rune-only phase** across all source pages. This frozen gate passed [Windows run 43731303426](https://github.com/FlareZ123/liber-primus/actions/runs/43731303426), with all **12,956** unknown original rune positions per key forward reencrypted and a **95/95** source-p57 native planted-positive recovered under each.

| Fixed Gist source key (actual or one commented example) | Unknown 12,956 decoded IoC | p49 pre-table 66 decoded IoC | p51 post-table 92 decoded IoC | p55 final 76 decoded IoC |
| --- | ---: | ---: | ---: | ---: |
| Active first300 primes minus3301, 300-state tape | **0.03446216** | 0.03030303 | 0.03678930 | 0.03298246 |
| Commented `ULTIMATETRUTHISTHEULTIMATEILLUSION`, 34-letter GP offset | **0.03447097** | 0.03263403 | 0.03487817 | 0.03157895 |

The actual p49 66-rune decoder begins `IA T C B G IA N IA Y G X ...` with the prime tape and `L I OE I P E M D L P D TH ...` with the phrase. The after-table p51 starts `N EA O S W D ...` or `T B G NG N U ...`. Neither supplies a complete readable original instruction; these fixed source-selected keys do not solve the two original table flanking passages. Even known previously solved p56 has decoded IoC below 0.043 under these two global Gist keys, so neither implements the independently authenticated p56 transform. **No 2015 community-Gist key or unknown plaintext is established**. Other source-untested keys are outside this finite result.

## Research decision

**Positive original-file acquisition, bounded negative cipher result.** The code source's actual consumer is now recovered and understood. It supplies no source-authored operand for unknown pages. No hidden constant from its 960-line source, dictionary match or user-tuned phase is promoted into a key. Unlike previously recovered `cluosh` and `UnRuneIt` tools, this is a separately source-linked **2015 public script** that now has an exact original static source, fixed SHA and full original-p0/p54 native check.

Further replays of the zero-key Caesar modes would duplicate this result. A useful advance requires a **separate first-party clue selecting one of the commented nonzero input sequences or an independent source file with a correctly predictive unknown-page key**. Historical `DECRYPTIONIST` source itself has only a direct-to-individual distribution claim, so its live bytes cannot be invented. The remaining 56 original unknown pages remain unread.
