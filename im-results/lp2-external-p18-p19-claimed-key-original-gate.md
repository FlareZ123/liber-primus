# Archived P18/P19 key claims: original-cipher regression

**Decision, 22 November 2026.** Two **historical, already retracted** fixed key claims do **not** decrypt original scans `18.jpg` and `19.jpg` to their advertised text. The current Wulfic tracker itself lists pre-29-September-2026 claims as invalid owing to historically misaligned scan transcription; it correctly reports all 56 original LP2 pages unsolved. This independent original-input regression checks the old numerical keys and does **not** contradict the current tracker or establish a novel cipher exclusion.

## Why this was worth a direct test

The [archived pre-29-September-2026 `MASTER_TRACKER.md`](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/reference/archive/MASTER_TRACKER_pre-2026-09-29.md), subsections *Page 18 — Vigenère SUB, Key Length 53* and *Page 19 — Vigenère ADD, Key Length 47*, historically labelled these texts “CONFIRMED” and published numeric GP29 keys. The claims mention “BEING OF ALL I WILL ASK THE OATH...” and “REARRANGING THE PRIMES NUMBERS WILL SHOW A PATH TO THE DEOR”. The [**current** tracker](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) explicitly warns in §4.3 that pre-September-2026 claims arose from wrongly assigned page files and are invalid. This report independently replays the obsolete key proposals on authentic original glyphs to prevent reuse; it does not purport to correct or outpace that current retraction.

**Page identity matters:** Wulfic's corrected present-day `pages/page_18/runes.txt` is original scan `18.jpg`, physical LP2 **p1**, and `pages/page_19/runes.txt` is scan `19.jpg`, physical LP2 **p2**. The corrected rune streams match this repository's original p1/p2 exactly at **266** and **201** runes. The historical archived P18 entry instead asserts **260 runes**: this is itself evidence that the obsolete claim may have targeted the wrong/misaligned old transcription. We test those old published key integers on the **correct** original scan ciphertext, not on the original author's unpreserved old editing state.

## Frozen original-input result

Run the committed [single-file Windows Node22 test](../sims/lp2_external_p18_p19_keys_original_sft.cjs) using the untouched canonical [GP29 corpus](../resources/liber-primus/lp2-corpus.json). Decode whole source rune streams under the **published keys, signs and periods**; additionally search **every** one of the 53/47 cyclic key phases and every possible plaintext landing on the respective original page. Encode claimed words *individually* into native GP29, preserving `TH`, `NG`, etc. No decoder's output was used to select the phrase or key.

| Published claim | Authentic original input | Claimed GP29 sentence length | Original exact claimed-sentence hits over all key phases and page offsets | Longest exact consecutive agreement anywhere |
| --- | --- | ---: | ---: | ---: |
| P18, `plain = cipher − key`, period53 | scan18 = physical p1, 266 runes | 53 runes | **0** | **4 runes** (original offset222, claim offset41, key phase20) |
| P19, `plain = cipher + key`, period47 | scan19 = physical p2, 201 runes | 42 runes | **0** | **4 runes** (original offset2, claim offset3, key phase32) |

At the advertised phase0, the first two complete cycles produce:

- P18 cycle1: `PREAPAPEGIMPHXXUOGDYWUMNXLXREICWNNEHREOAEHWLIYFFGHODEOIP`; cycle2: `IAYWGYAJDJEAUSSNITOJOENTHAOEGEMXDNGPCSGMIAAAEAEGMFGEOWWAEIXMTHBYH`.
- P19 cycle1: `BCOOLNDUXAYNAESAXMDTXCMEODHIAJEOFAEYOETHPPAGAYUXOJCIEOF`; cycle2: `TXTHRXICHEOLOWHNFANGGXMTGDLTSTNGAPSTHSJIAAEIMTMWEOSEAMBC`.

**Controls:** every recovered original 266/201-rune stream reconstructs **every original glyph** under the claimed inverse arithmetic. A native GP29 message with the full claimed phrase, encrypted to the same source length using each published key, is recovered exactly **266/266** and **201/201**. Full-phrase detection also succeeds in the positive plant. Therefore the missing matches on real originals are a source/key mismatch, not an implementation failure.

[Windows GitHub Actions PASS 45007024159](https://github.com/FlareZ123/liber-primus/actions/runs/45007024159) contains complete numeric output and the planted-control checks.

## Interpretation and next research decision

The **archived** word “CONFIRMED” was correctly withdrawn by the source repository itself. Original-input replay independently finds no support for those exact archived key claims. Neither fixed numeric key reproduces its advertised opening sentence, much less the four or five original-page cycles. Their short passages should not become known plaintext, a crib for a second layer, a *Deor* key selector, or a historical Cicada clue. A different ciphertext source, reset grammar, additional layer or corrected published key would constitute a new proposal requiring its own independently fixed specification; the exact claims tested here are closed.

The original 56 unknown physical pages remain undeciphered, and the strongest open question remains how the author intended a solver to obtain a source-selected reversible key/operation. This regression prevents a historically retracted apparent key from being reintroduced as first-party plaintext or a *Deor* direction. The current external repo is not claiming these pages solved; the present report makes no new positive cryptanalytic discovery.
