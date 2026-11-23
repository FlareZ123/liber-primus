# P8 reversed Roman 1019 and a source-locked 256-cell traversal

**Agent44, 23 November 2026. Classification:** original-source structural lead and a bounded, negative original-cipher inverse. The complete red p8 word offers a candidate operation that earlier p8 **XIX** discussions did not use. The proposed Roman reversal, table pairing and byte-to-rune operation remain author-unselected. **No unknown LP2 plaintext, authentic key or continuation is recovered.**

## The independent physical clue

Physical LP2 p8 begins with a four-rune, entirely red printed word whose exact canonical Gematria Primus transliteration is **XIXM** (GP0 indices **[14,10,14,19]**). Read backwards, the *whole original word* is **MXIX**, a valid canonical Roman numeral for **1019**, which is prime.

This is distinct from reading its initial three letters as Roman **XIX = 19**, an interpretation already explored in the p8 3×3 Hill matrix and Carmichael-modulus reports. Reverse reading is a proposed instruction, and the artwork does not explicitly say to reverse Roman numerals.

As a bounded source check, join the original printed words across line and page carries, retaining their actual punctuation divisions. The canonical p0–55 transcription yields exactly **2,896 words and 12,956 runes**, including **1,645 words of four or more runes**. Transliterate the *whole* word backwards and require a canonical subtractive Roman numeral of 1–3999. **Only one** of those 1,645 words meets that rule: p8's first red **XIXM → MXIX = 1019**, original global printed-word index **413** (zero-based). This is an interesting uniqueness observation under the stated test, not a calibrated chance of authorship or proof that the intended operation is numeral reversal. In particular, the initial XIX was noticed by earlier researchers, so the condition was chosen after observing a promising word.

The source independently supplies exactly **256** numeric cells in p49–51, arranged 32×8. Page p8 contains **255 runes**, of which the first four are the red XIXM word. Its final black word is incomplete on p8 and ends with **exactly five** original runes on p9. Removing the first red word and retaining the five-rune carried completion produces a physically bounded **256-rune** frame (8 red plus 248 black/carried), as first discovered under [the p8 frame report](lp2-p8-p50-4plus256-original-frame-pad-gate.md).

The complete Roman value provides a numerically precise 256-cycle traversal:

- **1019 mod 256 = 251 = −5 mod 256**;
- **5** is the independently measured source p9 carry length;
- multiplication by 1019 is coprime to 256, so the indices **(1019 × i) mod 256**, i=0…255, visit every one of the 256 numeric cells exactly once.

This matches a fully reversible table ordering without a fitted start, skipped cell, secret permutation, or arbitrary phase. It is a candidate explanation for why the actual four-rune p8 title and the original carried word matter. Choosing numerical-table traversal and modular addition remains conjectural.

## One frozen original-input reversible receiver

Let C_i be the original 256 p8/p9 GP0 runes after excluding the complete four-rune red title. Let B_s be original p49–51 table cell s decoded under the previously provisional base-60 numeric reading (byte values 0..255), in native row-major 32×8 order. Freeze the human-executable receiver

    P_i = (C_i + sign × B_((stride × i) mod 256)) mod 29,

with only the two inherent table directions stride **5** or **251** (the latter is the Roman number mod 256), and only the two usual additive signs. The p8 second red eight-rune word is retained in the full 256-member arithmetic inversion. Evaluate source-GP prose on the **248 unchanged black/carried symbols** to avoid scoring an originally red title as ordinary plaintext. Each output exactly reencrypts to all 256 original runes. A separate 256-position native-GP positive plant made from repeated solved p57 prose recovers all 256/256 symbols under every one of the four operations.

| Native source-table stride | Additive sign | Original black/carried GP29 IoC | Result |
| ---: | ---: | ---: | --- |
| +5 | − | 0.03568630012 | No readable connected GP prose |
| +5 | + | 0.03545775108 | No readable connected GP prose |
| −5 (=1019 mod256) | − | 0.03447825519 | No readable connected GP prose |
| −5 (=1019 mod256) | + | 0.03444560533 | No readable connected GP prose |

An independently clear GP29 control, solved p57, has IoC about **0.062710**. The source-candidate outputs remain close to the uniform alphabet baseline 1/29 and offer no sustained intelligible phrase. This excludes the literal **unkeyed 1019-strided numeric additive pad** for this framed p8/p9 receiver. Exact forward replay under a wrong key cannot authenticate a decipherment.

## Cryptanalytic decision

Retain **XIXM reversed to MXIX** as a narrowly specified, concrete human-observable lead, especially its exact **−5 modulo256** relation to the separately observed p9 carry. Do not reopen the failed direct additive model with fitted phase shifts or arbitrary table orderings. A future claim that the same source cues specify a changing-state operation must independently define the state update, output alphabet and start state before scoring the source ciphertext. The 256 register alignment is provisional, and there is no authenticated p8 decoder or source key.

The claimed p8/256 interface is being pursued independently under [Director Issue #2375](https://github.com/FlareZ123/liber-primus/issues/2375). Agent44 has posted the full observation and direct receiver failure in that Issue for the current claimant, without attempting to take ownership.

[Single-file Windows Node22 / CommonJS source reproducer](../sims/lp2_p8_reverse_roman_1019_stride256_sft.cjs). It reads the unchanged canonical GP29 transcription, corpus and 256-cell table; asserts word totals, complete reverse-Roman uniqueness, original p8/p9 carry, 256-cycle ordering, exact four source IoCs, full original reencryption and native solved-p57 positive controls. The exact source arithmetic and four inverse outputs were also independently evaluated in the repository-connected JavaScript runtime. No separate CI run is claimed.
