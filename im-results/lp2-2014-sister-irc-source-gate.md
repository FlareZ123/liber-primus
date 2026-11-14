# Original 2014 sister-channel IRC gate

**Agent30, 14 November 2026. Director #905.** Three channel names were selected directly from May–August 2014 messages in the original #cicadasolvers log: **#33012014, #cicada3301, #cicada2014**. No authentic unknown-LP2 key, operator or plaintext was found in the surviving records. This is a bounded source test, not proof that missing conversations never occurred.

## Three original, source-named loci

1. **#33012014:** The actual [original Freenode source](https://github.com/neuroretransmit/cicada/blob/main/irc-logs/%2333012014.freenode.log) has 8,629,610 bytes, Git blob SHA-1 **a2880b1db31ce523599ef30ca2e55291bf295900**. Its May–August portion has **2,091 timestamped lines**, including **102** conventional nick-prefixed messages. Exactly **zero** of these 102 messages mention LP2/runes/pages/book/chapter; zero mention those source terms plus key/cipher/prime/shift/decrypt. The remaining 1,989 dated administrative/state lines contain zero LP2, manuscript, page, rune, cipher, decrypt, plaintext or explicit key-assignment indicators. Thus no complete unknown-page claim is preserved in the examined historical window.
2. **#cicada3301:** Main-log original line **164411** (2 May), **180211** (17 May), **192686** (31 May), **197980** (11 June) mention the distinct channel. On 17 May a participant calls #cicadasolvers the main channel and says #cicada3301 is quieter; on 11 June it is called almost dead. The separately archived [original #cicada3301 file](https://github.com/neuroretransmit/cicada/blob/main/irc-logs/%23cicada3301.freenode.log) has 291,299 bytes and Git blob SHA-1 **7eb6a3dacc841aee3930696f3b0441d091a1a457**, but contains **3,674 January 2014 dated lines and zero May–August lines**. The surviving file has no LP2-period witnesses.
3. **#cicada2014:** Main-log **21 July 2014 22:20, line 224474**, quotes participant masterartist saying they joined this named channel. Neither the original nor its identical public fork's complete historical IRC directory listing includes a named log. Focused exact-name web and GitHub searches found no independent, byte-preserved May–August 2014 transcript or separately dated message excerpt. This is a limited acquisition failure.

## Original source history and controls

Main-log **17 May 2014 21:18, line 180207** says everyone was banned from #33012014 and it was closed. On 3 July the sister log at lines **110043** and **110058** directs visitors to #cicadasolvers; August main-log lines **236315–16** still discuss bans. These are contemporaneous participant statements, not 3301-authenticated instructions.

The original main log comprises **74,548** date-stamped May–August lines, of which **53,338** are conventional nick-prefixed chat messages; the sister log comprises **2,091** and **102**, respectively. Both raw dated lines and participant messages were independently scanned, preventing IRC topic/state metadata from being silently dropped. No period-source statement supplies a complete key/operator or 40 continuous runes of proposed original unknown-page plaintext. A 100/40-original-rune inversion trial is therefore not justified.

## Reproduce and decide

The [source-pinned CommonJS SFT](../sims/lp2_2014_sister_irc_source_sft.cjs) checks original byte length and Git blob SHA-1 and emits exact dated lines/names. The [manual-only workflow](../.github/workflows/agent30-2014-sister-irc-manual.yml) passed in [original-source CI run 43610667029](https://github.com/FlareZ123/liber-primus/actions/runs/43610667029), including parser positive controls. The complete smaller original #cicada3301 archive was directly counted with GitHub original-file text.

**Decision:** Close #905. Reopen this three-channel locus only with genuinely new May–August original bytes or an independently dated, reproducible unknown-page decryption statement. The absent 2014 #cicada3301 and #cicada2014 records remain missing material rather than established negative cryptographic evidence.
