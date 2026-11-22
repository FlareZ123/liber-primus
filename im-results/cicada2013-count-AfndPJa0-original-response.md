# 7 January 2013 first-onion COUNT: participant paste and independent IRC observations

**Classification:** Two distinct contemporary participant records now support the first-onion COUNT prime-marker convention. Neither is a Cicada-signed instruction, original daemon source, or raw TCP capture. The second record is a time-stamped IRC transcript of participants' live observations; one exchange is ambiguous and is excluded from the marker control.

## Original recovered Pastebin AfndPJa0

**12 November 2026, Agent1; resolves [Director #670](https://github.com/FlareZ123/liber-primus/issues/670).**

The exact [raw Pastebin AfndPJa0](https://pastebin.com/raw/AfndPJa0) was obtained directly on the Windows GitHub Actions runner: HTTP 200, **602 bytes**, source CRLF, SHA-256 **f3f7e546e7e66710f75649b9638c2d7c9a75b26a83bed0aa46daf159c97dafcd**. The live [Pastebin article](https://pastebin.com/AfndPJa0) displays creation on **7 January 2013, 01:00:24 PM CDT**. The independent [11 April 2016 Wayback snapshot](https://web.archive.org/web/20160411003839id_/http://pastebin.com/AfndPJa0) retains the title and prime-marker footnote (HTTP 200, HTML 17,490 bytes, SHA-256 **480a73deb3288868cb4395da48b223ddc3c39aef02419c976349054fffa649a1**). No claim of a Cicada PGP signature is made.

The original [Uncovering Cicada title article](https://uncovering-cicada.fandom.com/wiki/Instar_emergence_%28mp3_and_hidden_poem%29) and [Mentioned PRIMES page](https://uncovering-cicada.fandom.com/wiki/Mentioned_PRIMES) independently cite this exact ID for a first-onion COUNT of the MP3 name. It differs from the separately exhausted PRIMES Pastebin ID xGY4pbHV.

### Nine source-exact responses

| Input | Recorded result | Reversed integer | Independent GP29 match |
|---|---:|---:|---|
| 2013 parable clause 1 | 1259* | 9521 | yes |
| 2013 parable clause 2 | 1031* | 1301 | yes |
| 2013 parable clause 3 | 1229* | 9221 | yes |
| Patience is a virtue | 761* | 167 | yes |
| Aleister Crowley | 751* | 157 | yes |
| The Instar Emergence | 761* | 167 | yes |
| Gematria Primus | 641+ | 146 | yes |
| Liber AL vel Legis | 797* | 797 | yes |
| Kether | 163+ | 361 | yes |

The paste itself assigns **+ to ordinary primes** and **asterisk to reversible primes**. All nine integer sums are prime. All asterisked integers have prime digit reversals, whereas the two plus-marked integers reverse to composite numbers. The original source includes prime palindrome 797 in its reversible-prime category. The two 761 entries reverse to 167, which also corresponds to the named MP3's approximate duration.

The [Windows Node22 original-input reproducer](../sims/afnd_paste_archive_gate.cjs) fetches and hash-locks the source, reads the nine responses and independently computes every GP29 prime sum using the canonical rune alphabet. It accounts for historical normalizations K/Q→C, V→U, Z→S, ING→NG and greedily groups multisymbol GP rune values. Without the ING→NG contraction, parable clause 1 is **1290**, exactly 31 (the prime value of I) too high. With it, all nine values and all suffixes match source. [Passing CI source reproduction run 43314632347](https://github.com/FlareZ123/liber-primus/actions/runs/43314632347).

## Independent 7 January 2013 IRC transcript

The 2013 [Uncovering Cicada Instar-emergence article](https://uncovering-cicada.fandom.com/wiki/Instar_emergence_%28mp3_and_hidden_poem%29) links Pastebin **XQ9rJSad** as the full log (and CneUy8J4 as the 7 January Cosmo-post collection). The [public archive mirror](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/main/2013/additional%20docs/logs/all%20cosmos%20posts%20from%207th%20on%20the%20761%20song%20-%20full%20log.txt) is a 399,787-byte UTF-8 file, 5,179 lines, Git blob SHA-1 **2d865faeec179d6b5984643d8b2af7efa3269f73**. Its mirror commit is [f0f03edcb029e94b519efcacf1bf2511353e17c2](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/commit/f0f03edcb029e94b519efcacf1bf2511353e17c2), dated 8 May 2021 and GitHub-verified. The 2013 Fandom article supplies an earlier public reference to the Pastebin ID; the 2021 mirror commit is not itself a 2013 timestamp. Direct retrieval of the original Pastebin is unavailable, so byte identity between the original Pastebin and this mirror is not claimed.

The transcript records participants connecting to `emiwp4muu2ktwknf.onion:80` and discussing live COUNT tests. The following are exact lines from the mirror (line numbers are one-based):

| Line(s) | Participant report | GP29 sum | Reverse | Arithmetic classification |
|---:|---|---:|---:|---|
| 3940 | `count a = 97*` | 97 | 79 | prime; reverse prime |
| 3940 | `count b = 61+` | 61 | 16 | prime; reverse composite |
| 3940 | `count ab = 158` | 158 | 851 | composite |
| 3990–3991 | `count norwell` → `279` | 279 | 972 | composite |
| 4034–4036 | `count ae` → `101*` | 101 | 101 | prime palindrome |
| 5079 | `count bob = 129` | 129 | 921 | composite |
| 5083 | `count o = 7*` | 7 | 7 | prime palindrome |
| 5105–5107 | `count eo = 41+` | 41 | 14 | prime; reverse composite |
| 5081 | repeat `count b = 61+` | 61 | 16 | prime; reverse composite |

All unambiguous IRC observations are an independent holdout relative to the separate AfndPJa0 Pastebin. The `ae`, `o`, and `eo` reports provide additional prime/reversal examples; `ab`, `norwell`, and `bob` are composite controls. The values match the canonical GP29 alphabet with greedy multisymbol tokens.

**What ab=158 actually records (source clarification, 21 November 2026).** The same log's help exchange at lines 3605–3613 lists the offered grammar, including count [phrase]. At 12:02:53 on 7 January 2013, participant soulseekah reports “count a = 97* count b = 61+ count ab = 158” (line 3940); at 12:03:08 the same nick adds “so it did add them up” (line 3942), then repeats “97+61” at 12:06:48 (line 3985). Later, line 4038 says the count command matches the Twitter rune table, and line 5115 says counting a single letter returns its table value. Thus ab is the literal two-letter phrase submitted to COUNT, and 158 is the additive GP value 97+61; it is not a count of LP2 p0–p2 printed words and does not select a 158-cell LP2 address space. This observation is in the IRC transcript, not in the separate nine-entry AfndPJa0 paste. The line is authored in-channel by participant nickname soulseekah; the log uploader's identity is not established. The transcript timestamps the event, while the currently pinned GitHub mirror is a 2021 preservation copy. The Uncovering Cicada article's 2013 section links XQ9rJSad as the full log, but the accessible page does not establish the paste's first-publication timestamp. The observation is participant testimony, not raw TCP response bytes or a Cicada-signed instruction.

**Ambiguous observation, excluded from calibration:** lines 5117–5120 show `count j`, then Atlas_ posting `37` and `+`, while crash_demons separately reports `count j=37*`. The log does not preserve enough command/response association to decide whether these are conflicting COUNT outputs or a COUNT plus a separate number-command result. Do not silently resolve this in favor of either marker. Lines 5108, 5125 and 5128 contain participant interpretations ("+ is always prime" and searching for numbers prime in both directions); these are interpretations, not daemon documentation.

The exact parser and held-out arithmetic control are in [`sims/cicada2013_count_irc_control.py`](../sims/cicada2013_count_irc_control.py). It verifies the mirror's Git blob SHA-1 and byte length, checks the cited source lines, recomputes the GP29 values from the canonical corpus, and reports the ambiguous `j` exchange without using it as evidence.

## Original first-onion command grammar and executable continuation (18 November 2026, #1479)

The same recovered 7 January IRC transcript supplies a **historically player-executable path** that the COUNT-only table above does not capture. This is a first-onion service grammar, **not** an LP2 unknown-page cipher instruction.

1. **Help, 11:39–11:45 UTC (lines 3604–3613, 3656–3663).** Players recorded the service's literal offered commands: `[number]`, `count [phrase]`, `hello`, `help`, `quit`. A later participant reports **unlisted `primes`** at line 5133, with an apparent list ending at 3301 (5135–5139). The claim about a primes list is participant testimony, not a captured complete raw listing in this log.
2. **HELLO → hex → PGP signed continuation, 11:44–11:52 UTC (lines 3667–3688, 3775–3785).** A participant posts consecutive 65-byte hex chunks at offset 0 through offset 0x38e. Decoding all complete byte pairs recovers **936 bytes**: a `BEGIN PGP SIGNED MESSAGE` headed by `Hash: SHA1`, the text **“Very good. You have done well to come this far.”**, and `xsxnaksict6egxkq.onion` followed by “Good luck.” and “3301”. The IRC excerpt cuts off *inside* the `BEGIN PGP SIGNATURE` armor, with one dangling half-byte, so this particular witness cannot independently verify the complete signature. **Updated exact cross-witness join (18 November):** its 936 recovered bytes are identical to the first 936 of the already preserved complete 996-byte `resources/historical/cicada2013-first-onion-hello.asc` (Git blob `867f15cf3da05d75ff5b1450b571429c1419f656`). The remaining 60 bytes are only PGP signature armor and a closing delimiter, with no extra signed instruction. All six `5,3,2,2,3,5` blank-space lines occur inside the contemporaneous IRC prefix. See `im-results/2013-first-onion-clue-hello-original-source.md`; no LP2 decoder emerges. The player-reported command fixes the decoding operation and output type without a key search. The second onion's contemporaneous HTML displayed **“Patience is a virtue.”** with a **“come back soon”** comment (lines 3805–3812). These events establish a real 2013 navigation handoff, but identify no LP2 ciphertext receiver.
3. **Conditional numerical reversal (lines 3768–3778, 3970–3972, 4000–4001, 4042–4043, 5062, 5116).** The participant observations admit one precise rule: when the submitted decimal integer is **composite**, output its ordinary prime factors; when **prime**, reverse its decimal digits, then output the reversed integer's factors, or `+` if the reversal is prime. This explains composite `10 → 2 5`, prime `23 → 2 2 2 2 2` (32), prime `4007 → 2 2 17 103` (7004), prime `691 → 2 2 7 7` (196), reversible prime `3301 → +` (1033), and composite parable product `1595277641 → 1031 1229 1259`. **Unconditional reversal is contradicted** by the last case. This rule is an inference from participant observations, not original daemon code. The separate `count [phrase]` marker behavior is calibrated above.

**Decision for the LP2 attack frontier:** This historical grammar is operational and executable, and it shows 3301 players an explicit way to obtain a signed next destination. It has **no missing LP2 opcode to extract from the archive**: `hello` emits a fixed route, `count` discards nearly all phrase identity in a sum, and `[number]` returns prime-factor classifications. No recorded input or response specifies how to transform any original LP2 rune span into plaintext, apply a key, or address the later p50 table. The 2013 `primes` command by itself also has no such typed receiver. The proper outcome is a historically bounded first-onion handoff and a negative **2013-command→LP2 decoder** decision. Do not manufacture a new COUNT-direction, reversal-offset, or modulo-key screen from these commands. A newly authenticated first-party LP2 instruction would reopen the question.

The existing [source-locked Python reproducer](../sims/cicada2013_count_irc_control.py) now checks this exact `hello` hex-prefix reconstruction, the help and unlisted-command references, and nine independently observed integer-command outputs in addition to all original COUNT controls. **[Windows CI 44318891110 passed](https://github.com/FlareZ123/liber-primus/actions/runs/44318891110)** with the full original archive fetched at its pinned mirror commit.

## Reconciliation and decision

The separate IRC transcript makes the hypothesis that the AfndPJa0 legend was entirely added by one participant less likely: multiple participants reported first-onion COUNT results on 7 January, and the unambiguous outputs for `a`, `b`, `ab`, `ae`, `o`, and `eo` agree with **`*` = prime with prime reversal; `+` = prime with composite reversal; no marker = composite**. But this remains participant-recorded evidence, not original response bytes. The `j` exchange is an explicit unresolved inconsistency.

The later [neuroretransmit first-onion README](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md) and [server.py](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/server.py) are a 2022 reconstruction, not an original daemon; their suffix mapping is reversed. The similarly named Python/Go TCP server examples in the Complete Archive implement a separate later 2013 participant-server challenge (RAND/QUINE/BASE29/CODE/KOAN/DH/NEXT/GOODBYE), not the first-onion COUNT service.

**Source boundary:** no independently preserved first-onion raw TCP request/response or original daemon implementation was found in the bounded participant-linked sources checked. The two participant records corroborate the marker convention but do not authenticate wire-level behavior or provide an LP2 decoder. The primary-paste-consistent carried-direction candidate was already tested in [#1467](https://github.com/FlareZ123/liber-primus/issues/1467); its original-input screen did not produce qualifying plaintext. Do not rerun the pointer campaign or widen this source hunt without a new first-hand artifact. No unknown LP2 plaintext, key, or complete cipher mechanism follows from this finding.
