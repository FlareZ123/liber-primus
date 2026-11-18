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

The independent `ae`, `o`, and `eo` observations are held-out checks against the simple arithmetic rule; `ab`, `norwell`, and `bob` are composite controls. The values match the canonical GP29 alphabet with greedy multisymbol tokens.

**Ambiguous observation, excluded from calibration:** lines 5117–5120 show `count j`, then Atlas_ posting `37` and `+`, while crash_demons separately reports `count j=37*`. The log does not preserve enough command/response association to decide whether these are conflicting COUNT outputs or a COUNT plus a separate number-command result. Do not silently resolve this in favor of either marker. Lines 5108, 5125 and 5128 contain participant interpretations ("+ is always prime" and searching for numbers prime in both directions); these are interpretations, not daemon documentation.

The exact parser and held-out arithmetic control are in [`sims/cicada2013_count_irc_control.py`](../sims/cicada2013_count_irc_control.py). It verifies the mirror's Git blob SHA-1 and byte length, checks the cited source lines, recomputes the GP29 values from the canonical corpus, and reports the ambiguous `j` exchange without using it as evidence.

## Reconciliation and decision

The separate IRC transcript makes the hypothesis that the AfndPJa0 legend was entirely added by one participant less likely: multiple participants reported first-onion COUNT results on 7 January, and the unambiguous outputs for `a`, `b`, `ab`, `ae`, `o`, and `eo` agree with **`*` = prime with prime reversal; `+` = prime with composite reversal; no marker = composite**. But this remains participant-recorded evidence, not original response bytes. The `j` exchange is an explicit unresolved inconsistency.

The later [neuroretransmit first-onion README](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md) and [server.py](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/server.py) are a 2022 reconstruction, not an original daemon; their suffix mapping is reversed. The similarly named Python/Go TCP server examples in the Complete Archive implement a separate later 2013 participant-server challenge (RAND/QUINE/BASE29/CODE/KOAN/DH/NEXT/GOODBYE), not the first-onion COUNT service.

**Source boundary:** no independently preserved first-onion raw TCP request/response or original daemon implementation was found in the bounded participant-linked sources checked. The two participant records corroborate the marker convention but do not authenticate wire-level behavior or provide an LP2 decoder. The primary-paste-consistent carried-direction candidate was already tested in [#1467](https://github.com/FlareZ123/liber-primus/issues/1467); its original-input screen did not produce qualifying plaintext. Do not rerun the pointer campaign or widen this source hunt without a new first-hand artifact. No unknown LP2 plaintext, key, or complete cipher mechanism follows from this finding.
