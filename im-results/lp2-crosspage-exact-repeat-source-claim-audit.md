# Exact cross-page ciphertext-reuse census and a false external duplicate claim

**Decision, 11 November 2026:** the advertised complete ciphertext duplication of original LP2 p27 inside p44 does **not** occur in the canonical 58-page corpus. There is also no exact seven-rune substring repeated between any two of the 55 still-encrypted, rune-bearing physical pages. This removes the specific claimed 234-rune known-repeat opportunity. It does **not** establish a cipher or rule out plaintext repetition under different keys.

## Why this was examined

The publicly readable [Wulfic/Cicada3301-Liber_Primus `MASTER_TRACKER.md`](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) (header: April 2026) asserts in §4 and the structural notes that “P27 ciphertext = P44 first 234 runes”, calling it a **100% confirmed** duplicate. If true on authentic ciphertext, 234 repeated runes on different manuscript pages would materially motivate investigating repeated key state, plaintext, and page-to-page copying before any new single-page cipher search. The source's stated 234-rune p27 count agrees exactly with canonical physical LP2 p27, making this a directly testable claim. The external tracker has several separately acknowledged stale-page and hill-climb issues; its assertion is treated as a lead, not an original-manuscript observation.

## Full original-input test

Take `resources/liber-primus/lp2-corpus.json` and its physical `page` fields, which correctly keep the numeric-only p50 empty; restrict to unknown pages **0–55**. Compare their original GP29-index arrays exactly, without joining words across distinct pages or applying transliteration, decipherment, normalization, or page shifts.

| Check | Original result |
| --- | --- |
| Original p27 and p44 rune lengths | **234** and **273** |
| First GP rune on p27 / p44 | **M** (index19) / **EA** (index28) |
| Matching opening prefix | **0 runes** |
| Longest exact contiguous substring shared by p27 and p44 | **3 runes**, at p27 offsets90/p44 offset96 and p27 offset215/p44 offset248 |
| Longest exact contiguous substring shared by **any** two distinct unsolved pages | **6 runes** |
| Unique longest cross-page match | p27 offset28 and p55 offset70, GP `D J U B E I` (indices `[23,11,1,17,18,10]`) |
| Seven-rune substrings repeated across page boundaries | **0** |
| Original pages/runes checked | **55 / 12,956** |

The six-rune match is short and unexceptional under a high-entropy alphabet; it is **not** an authenticated plaintext crib. The absence of length-seven collisions ensures that no longer exact cross-page ciphertext substring exists. Word-level or plaintext reuse under page-specific keystreams remains possible.

The standalone [Node 22 CommonJS SFT](../sims/lp2_crosspage_exact_repeat_external_claim_sft.cjs) asserts the source lengths, the negative claim, the two specific p27/p44 three-rune locations, the global six/seven-rune census, and a planted **234-rune prefix copy** into p44. The same detector recovers that planted exact copy, guarding against a trivial empty-output implementation.

## Cryptanalytic implication

A route based on the external p27=p44 ciphertext identity is ruled out on the canonical original manuscript. Repeated text encrypted with a different key on each page would produce different ciphertext and is unaffected by this result. No cipher key, unknown plaintext, page-to-page keystream, or destination is recovered.

**Next decision:** retire proposals contingent on that exact 234-rune overlap. For genuine page-reuse hypotheses, require an independently selected change of key, alignment, or reversible relation and a held-out original-text prediction. Avoid exhaustive plaintext matching with arbitrary shifts justified by this false external claim.
