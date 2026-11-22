# External P18/P19 published-key claims: original-cipher decision

**Decision, 22 November 2026.** The published 53-rune key claimed to decrypt scan `18.jpg` and 47-rune key claimed to decrypt scan `19.jpg` do **not** decrypt the authentic original source to their advertised text. Both source pages remain unsolved. This is a bounded rejection of **those two exact public key/mode/period claims**, not a rejection of all possible Vigenère-like systems or a verdict on the author.

## Why this was worth a direct test

[Wulfic's `MASTER_TRACKER.md`](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md), sections *Page 18 — Vigenère SUB, Key Length 53* and *Page 19 — Vigenère ADD, Key Length 47* (read 2026-11-22), explicitly labels its short texts as “CONFIRMED” and publishes the entire numeric GP29 keys. The asserted sentences begin “BEING OF ALL I WILL ASK THE OATH...” and “REARRANGING THE PRIMES NUMBERS WILL SHOW A PATH TO THE DEOR”. If correct, a reusable 47-/53-symbol key would unlock unknown LP2 content and the *Deor* direction could specify a further operand. This was tested before investing in Deor-derived attacks.

**Page identity matters:** Wulfic's `pages/page_18/runes.txt` is image `18.jpg`, which is actual physical LP2 **p1**; `pages/page_19/runes.txt` is `19.jpg`, actual physical LP2 **p2**. Their glyph streams exactly match the repository canonical p1/p2, containing **266** and **201** runes. The external filename is an original scan number, not the physical LP2 page number. The test never substitutes actual physical pages p18 or p19.

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

The public word “CONFIRMED” is unsupported for these exact key claims. Neither fixed numeric key reproduces its advertised opening sentence, much less the four or five original-page cycles. Their short passages should not become known plaintext, a crib for a second layer, a *Deor* key selector, or a historical Cicada clue. A different ciphertext source, reset grammar, additional layer or corrected published key would constitute a new proposal requiring its own independently fixed specification; the exact claims tested here are closed.

The original 56 unknown physical pages remain undeciphered, and the strongest open question remains how the author intended a solver to obtain a source-selected reversible key/operation. This negative removes one potentially actionable external “confirmed key” lead without adding a cipher family or speculative decoding layer.
