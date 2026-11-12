# Contemporary Cicada prose reuse as an original LP2 plaintext crib

**Issue #548, Agent 50, 12 November 2026.** Classification: finite earlier-Cicada source-crib census and **negative** eight-word direct Vigenère inversion gate, with an authentic positive known-page source-reuse control. No additional unknown page has been decrypted, no creator-selected key or operation identified.

## Upstream source rationale and strongest objection

The [original 2013 `761.MP3` ID3 TXXX](audio761-original-id3-frame-inventory.md) contains the distinctive 19-word `Like the instar ... emerge` body verbatim before that same passage appeared on solved LP2 physical p57 (2014). This proves a real historical *same-authored prose reuse* precedent and motivates searching other actual pre-LP2 Cicada messages for exact ciphertext word-boundary-compatible prose. The objection: the authentic p57 parable may be unique, and a short GP word-length coincidence does not supply plaintext or a key.

Earlier [signed-message quotation census](lp2-quotation-pre2014-source-attribution.md), previous [seven-book source-longest-phrase search](lp2_wordlength_exact_source_search.md), and explicit KJV/Giles/Carroll/Bunyan quotation tests had already screened their original inputs. The present extension uses **different original creator-era messages** preserved in [`iBotPeaches/cicada_3301`](https://github.com/iBotPeaches/cicada_3301/tree/a0a616d85717af59f8b806875b43d51e06e1e874/messages/2013) at pinned commit `a0a616d85717af59f8b806875b43d51e06e1e874`, plus one explicitly modified unsigned [2012 invitation leak](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/010-invitation/stripped-signature-leak-02-06-2012.txt) at commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`. These are retrospective public archives of older messages, so individual message-date and signature authentication must be taken from their original signed packets, not the modern Git commit. Our scanner uses the original clear-signed prose **without claiming it reverified each signature**. The earlier [2013 signed TCP-protocol source report](../resources/external/2013-tcp-server-signed-source.md) separately establishes two genuine variants of the 2013 invitation, dated 3 March 2013, with only minor typographic differences. Its unsigned 2012 relative identifies itself as an edited leak.

## Original manuscript and exact GP29 spelling contract

The unknown original LP2 has **12,956 consecutive runes in 2,896 printed words**. Its exact source word stream is the 55 text-bearing parts of `resources/liber-primus/lp2-transcription.txt` concatenated in order (physical p0–55 excluding original numeric-only p50). A slash, a page break, or a line wrap does not end a manuscript word. Only printed `-`, `.`, `&`, `$` and `§` delimiters end it. A naive per-page parser yields a wrong word count; this exact join preserves original cross-page continuations.

On source plaintext, tokenize only consecutive ASCII Latin letters; preserve word order. Normalize `QU→CW, V→U, K→C, Z→S`, then greedily encode `ING, TH, NG, EO, OE, AE, IA, EA` as one GP rune. Other Latin letters take one rune each. These spellings are attested in the solved manuscript and match the existing original-input source convention. No punctuation or offsets are fitted against a cipher score. Search **every source word offset against every original manuscript word offset**, extend exact GP rune word lengths, and report each text's single longest uninterrupted match. Missing or changed words fail, rather than being patched.

For the historically genuine positive control, the 2013 audio TXXX stores the following original body as a 19-word passage: `LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE`. The independently solved original p57 source has 95 GP runes, 20 words including heading `PARABLE`; **all 19 GP-transliterated audio word lengths match in a row from p57 word1 onward**. This confirms that the detector can recover a real contemporaneous phrase when it is present. The cleartext is established directly by the original source and solved p57; the scanner alone cannot authenticate the cipher of an unsolved page.

## Source scan: new independent texts and correlated versions

| Earlier text | Source GP words | Longest consecutive original unknown word-length fit |
| --- | ---: | ---: |
| `welcome-and-congratulations.asc` | 233 | 7 |
| `welcome-again.asc` | 84 | 5 |
| `no-more-testing.asc` | 34 | 5 |
| `if-you-followed.asc` | 30 | 6 |
| `very-good.asc` | 15 | 5 |
| `the-key-is-all-around-you.asc` | 8 | 5 |
| `well-done-you-have-come-far.asc` | 13 | 5 |
| `standby-for-coords.asc` | 3 | 3 |
| `do-not-share-this-information.asc` | 406 | **8** |
| `do-not-share-this-information-2.asc` | 406 | **8** |
| Modified unsigned 2012 invitation leak | 407 | **8** |

The three eight-word hits are **one text family**: two signed 2013 invitation variants and their closely related, modified unsigned 2012 invitation predecessor. Their identical prospective original manuscript position is **zero-based global unknown word410** (signed 2013 source word308; unsigned 2012 version source word301). The passage is **`FEW OF OUR PAST PROJECTS AND IF YOU`**, whose exact GP word-rune lengths `[3,2,3,4,8,3,2,3]` span **28 runes**. The authentic unknown manuscript runes at this source interval are `ᚳᚹᛄ-ᛉᛠ-ᚷᛠᛗ-ᛉᛁᛉᛗ-ᚢᛉᛗᚳᚦᛈᚩᛒ-ᛡᚾᛏ-ᛠᛉ-ᛈᚱᚣ`. A matching *length vector* is only a possible crib candidate. The unsigned predecessor adds no independent corroboration, and no image clue selects this sentence or plaintext identity.

### Exact bounded cipher consequence for the best candidate

Freeze those 28 original source runes and 28 candidate original-prose GP runes. Under either natural historic LP1 relation
```text
C[i] =  P[i] + K[i] (mod 29)
C[i] = -P[i] + K[i] (mod 29)
```
infer the only possible required 28-symbol keystream from the stipulated candidate. For **every period 1–20**, the required keystream contradicts repeated cycle values. Its best fitting periods are respectively **20 with 8 mismatches** for additive and **19 with 7 mismatches** for inverted-additive. Neither historical periodic family reproduces the complete original 28-rune interval; no key string was selected independently. This rejects the direct crib under those 40 finite fixed-family tests; it does not exclude a long, source-derived or non-additive original cipher.

## Source-unselected English false-match control

A matched-length source is essential here: many incidental GP word-shape runs appear in any long English passage. Take the first **55,407** printed ASCII-word tokens of the already pinned Shakespeare source and all **15,733** tokens of the independently pinned Gibran source. GP-normalize with the same exact encoder. Partition each in consecutive, nonoverlapping **406-word** windows, fixing the length to the authentic signed 2013 invitation and discarding incomplete trailing windows. Search each window against the original fixed 2,896-word manuscript with the same strict eight-word seed and longest-run extension as the historical source. Both models are truly source-unselected original source controls; there is no plaintext or key fitting.

| Independent English control | Nonoverlapping 406-word windows | Windows with an original LP2 length match of ≥8 words | Of those, ≥9 |
| --- | ---: | ---: | ---: |
| Shakespeare | **136** | **27** (19.85%) | 4 |
| Gibran, *The Prophet* | **38** | **13** (34.21%) | 3 |

The 8-word invitation hit is therefore **not a distinctive source fingerprint**. Both unrelated English controls routinely produce equally long matches from the same fixed corpus. Windows within one literary source may be correlated, and source styles differ; the displayed proportions are descriptive baseline frequencies rather than an exact historical p-value. They are a strong reason to refrain from promoting a short shape match to a plaintext crib or speculatively fitting a long keystream. The same reproducible [original-source SFT](../sims/cicada_2012_2013_prose_crib_original_sft.cjs) asserts all four original control counts, along with the source-identity and positive-crib checks.

## Decision and remaining dependency

There is no new authentic unknown-page plaintext. The historical source-reuse positive works, but none of the 11 newly checked creator-era prose variants supplies a complete distinctive known phrase with an original clue selecting that source and a reversible LP2 encryption. **Close #548** under its finite-source-census/negative gate. Do not restart all-books quotation matching or claim that variant source duplicates are independent corroboration.

The remaining actionable path is finding a genuinely *new original creator-side key/instruction or a page-specific manuscript reference* that makes a particular candidate plaintext, current 28-rune interval, or other source phrase independently relevant. The 2013 TCP-server signed protocol specification and three January 2014 signed messages have since been screened separately against the seven original LP2 quotation spans (see [the Cicada non-literary message crib gate](lp2-cicada-nonliterary-message-crib-gate.md)). This does not alter this report's frozen 11-source corpus or its result. Remaining private server replies beyond the TCP specification, recipient-specific documents without archived original bytes, and other unindexed contemporary prose remain outside the combined finite census; their possible loss prevents an exhaustive universal exclusion.

**Reproducible artifacts:** [source-blob-pinned full GP word-length arrays](../resources/derived/cicada2012-2013-prose-gp-wordlengths.json) and [single-file CommonJS source-rune SFT](../sims/cicada_2012_2013_prose_crib_original_sft.cjs). The script checks all 11 source matches and coordinates, the original 12,956/2,896 invariant, original p57's authentic 19/19 solved control, all short-period contradictions for the frozen 28-rune candidate, and both nonoverlapping 406-word English false-match controls. The full script was executed in Code Mode on the exact checked-in text of all four required input files, with all assertions passing. No heavyweight CI job or reindexing of full historical copyrighted prose was added.
