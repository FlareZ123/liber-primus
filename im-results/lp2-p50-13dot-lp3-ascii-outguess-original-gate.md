# Literal LP3lRA# byte run from the 13-dot-selected p50 perimeter: original OutGuess gate

**Decision, Agent16, 22 November 2026.** The original pp49–51 32×8 base60 numeral table contains an exactly reproducible **seven-byte printable vertical run**: `LP3lRA#`. Reading its source-selected literal seven characters as **one OutGuess password** on all **58** original LP2 JPEGs and the **17 earlier LP1 JPEGs** retrieves no recognizable hidden message. All 58 apparent native OutGuess headers are the same false-header pattern, and a planted original-source keyed payload plus real historical default-key controls pass. This is a bounded original-carrier negative, **not** a recovered author key or plaintext.

## Why this specific candidate was selected

The solved p57 PARABLE prints a **13-dot red mark** after its first seven runes and a terminal **23-dot** mark. The 256 original numerical tokens span physical p49–p51 and form a 32×8 panel. In a clockwise perimeter walk beginning at the original panel's upper left, the 13th through 19th symbols occupy source-global **zero-based** cell indices `[47,55,63,71,79,87,95]`: all are the physical last column, consecutive rows 6–12. Under the source-printed base60 alphabet their bytes are **[76,80,51,108,82,65,35]**, or literal ASCII `LP3lRA#`. The next perimeter byte is **206**, outside printable ASCII. The run crosses the original p49→p50 paper boundary after `LP3lR`. Its first three characters `LP3` suggest a possible source locator, and the full seven characters are syntactically a password.

The hypothesis needs an inferred p57-marker→perimeter correspondence, a new base60→ASCII operation and a stop at the next nonprintable byte. Original Cicada does **not** prescribe that combination, identify `LP3` as another book, or say the panel encodes an OutGuess key. Other original table columns also have printable runs, up to length six; the seven-character run alone is weak selection evidence. The hypothesis was frozen before testing the carrier, with no alphabet variants or passphrase shortening.

[Source-only CJS reproducer](../sims/lp2_p50_13dot_perimeter_printable_passphrase_sft.cjs), [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45028162440) confirm physical source cells, independent ink marker and exact decoded seven bytes.

## One native original-carrier test

The 2014 stages genuinely used OutGuess, so test the **exact** frozen `outguess -k 'LP3lRA#' -r` on the **58 original** LP2 scans `17.jpg…74.jpg`. The existing pinned OutGuess 0.4 workflow compiles the historical extractor from commit `24810e14327c2bbeedeaadd3e24491f2a4425c02` and runs [original source-key scan](../sims/outguess_lp2_keyed_probe.cjs).

| Measured result | All 58 original LP2 JPEGs |
| --- | ---: |
| Extractor processes returning plausible header and complete output | 58 |
| Header *seed*, repeated **exactly** in every page | **184** |
| Claimed payload length, repeated **exactly** in every page | **29,574 bytes** |
| Leading 32 extracted bytes identical across all 58? | **Yes**: prefix `b800867388cbd43dfeb4dd0baf27f5fe9a878eab0c5bff61b73c09d4b09e289e` |
| Recognizable PGP, ZIP, gzip, PNG or mostly printable text | **0** |
| Individual extract entropy | Approximately **7.99 bits/byte**, random-like |
| Genuine keyed payload plant | **PASS**, exact original recovered |
| Historical default-key scans 00.jpg and 08.jpg | **PASS**, authenticated known messages |
| Identically keyed generated *no-payload* JPEG | **False header, seed8511, length18830, random-like output** |

The original-source test did not accept the common matching metadata as proof: identical seed, length and leading bytes on 58 genuinely different JPEGs plus the positive header on a synthetic empty carrier establish this OutGuess configuration can report false payloads. Its 58 extracted files differ internally but are each near full-byte entropy and lack a file/text authentication criterion.

[Exact successful pinned Windows/Linux workflow and full 58 payloads](https://github.com/FlareZ123/liber-primus/actions/runs/45027905038). The workflow's short `OUTGUESS_KEYED_COMPLETE` record states `attempts=58`, `matchedHeaders=58`, `recognisable=0`; every original raw payload, prefix, entropy, signature and synthetic control is preserved in the run's artifacts.

### Second, untouched historical carrier family: original LP1

The same exact frozen `LP3lRA#` password was run against all **17 original LP1 JPEGs**, with no passphrase or codec adjustment. The same configured extractor recovered **0 recognizable payloads** from 17 attempts. It reported **15 header-consistent but random-like byte streams** and rejected 2 carriers; the same planted-key embedding, actual historical default-key 00/08 controls and identically keyed empty JPEG all passed as above. The 15 matching headers vary among true historical LP1 carriers, illustrating why matching headers are weak authentication evidence. Full raw outputs and the summary are saved in [successful original-LP1 run 45029899274](https://github.com/FlareZ123/liber-primus/actions/runs/45029899274). A narrowly scoped `LP1` target was added to [the same historical extractor](../sims/outguess_lp2_keyed_probe.cjs), leaving its original single-image and LP2 modes untouched. No signature, readable payload, independent recipient or decryption resulted.

## Scope and next decision

The **one literal base60 perimeter ASCII key → historical keyed OutGuess extraction on 75 original manuscript JPEGs** is a failed path to source-authenticated plaintext. No plain GP words, original LP2 key or third-book destination are recovered. The `LP3` substring might be a marker, deliberate decoy or coincidence; an independently authored source instruction or an actual keyed extraction would be needed to promote it. Do not infer that the whole numeric table is ASCII or repeat password variants merely because the exact printed `LP3` substring looks meaningful.
