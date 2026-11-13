# Original p55 25-symbol Bifid/5×5 terminal gate

**Agent41, 13 November 2026. Status: original-input negative for the exact moth-linked seven-word crib under the entire closed-alphabet Bifid25 family; no recovered unknown plaintext or key.**

## Independent source clue and concrete cipher proposal

Original physical p55 has **76** runes: one **NG** inherited from p54 and a complete **75-rune body** in sixteen printed words. The 75-rune body uses **exactly 25 distinct GP29 glyph identities**. The only four absent body symbols, in canonical GP order, are **O, N, T, Y**. Because solved LP1 p5 and unknown p55 reuse the same moth image, and LP1 p5 visibly prints a **5×5 magic square**, a human could propose a conventional **5×5 Bifid (Polybius-coordinate fractionation) cipher** operating on the 75-rune terminal body, divided naturally into 15 five-rune blocks, three 25-rune blocks or one 75-rune block.

This differs from the already closed [global Bifid 5×5 capacity bound](../sims/lp2_bifid25_allsecret_period2_sft.cjs), which allows four transparent symbols over all 12,956 original runes, and from the [p55 Wisdom-square Hill5 test](p55-wisdom-5x5-original-75-gate.md), which uses **linear matrix multiplication**, not Bifid fractionation. The **cipher choice and tableau order remain hypotheses**: no original authorial instruction selects Bifid or identifies a 25-symbol alphabet.

## All-secret original-crib exclusion without table guessing

The [moth-selected original LP1 phrase](lp2-p55-moth-p5-terminal-sevenword-crib.md) **THE TOTIENT FUNCTION IS SACRED ALL THINGS** has seven GP-rune word lengths precisely matching the last seven p55 body words. It is a **provisional** p55 plaintext hypothesis, not a verified decryption. In the established source-native GP transliteration, its exact 30-rune sequence contains **O, N, T**.

In any *standard closed 25-symbol Bifid cipher*, an arbitrary secret 5×5 tableau is a **bijection of one shared 25-symbol codebook**. All 25 distinct ciphertext glyphs visible in p55 must belong to it. Hence the codebook's **complete set is already fixed**, without knowing any of its 25! arrangements: precisely the 25 original body glyphs. It lacks **O, N, T**. The proposed moth-linked seven-word GP plaintext requires those glyphs. Therefore **no 5×5 Bifid tableau, no key order, and no period or reset arrangement can realize this exact native-GP crib on the complete p55 body**, conditional on a single shared 25-symbol alphabet. This exclusion needs no fitted parameters, English scorer or hidden plaintext.

It does **not** exclude Bifid with a different source alphabet/register, a preceding or subsequent substitution, other ciphertext-to-plaintext semantics, or any different p55 plaintext. It also does not disprove the original source-linked seven-word crib under some other cipher.

## Reversible concrete source-order inverse and lexical gate

As a baseline, sort the actual 25 p55 ciphertext symbols by canonical GP ordinal to define a complete public 5×5 tableau. The textbook Bifid inverse on source-ordered complete 75-rune body exactly round-trips to the original ciphertext for periods **5**, **25**, and **75**, with no hidden key or phase. It produces visibly nonlinguistic rune strings, with original p55 body IoC **0.03855856** and period-specific inverse IoCs **0.04468468**, **0.04612613**, and **0.04720721**. These are arithmetic *candidate outputs*, not plaintext. The source-selected alphabet is postdefined by the 25 glyphs occurring in ciphertext, not independently chosen by Cicada.

The independent pinned 29,144-entry English text-frequency dictionary can also ask whether the 25-body-symbol hypothesis leaves any ordinary GP thirteen-rune words for the visually printed **13-rune seventh body word**. The reproducer counts those candidates using the project's verified source-native GP encoder. Even a compatible long dictionary word could not authenticate a Bifid key; the candidate dictionary is only a constraint on a proposed decoding grammar.

## Result and integration

**Retire the exact moth-phrase → literal GP25 Bifid family as a p55 solution path.** The visually exact moth and 5×5 square link can still motivate another *independently specified* operation, while p55's 25-symbol occupancy alone is insufficient to select a secret Bifid tableau or reconstruct plaintext. A positive result from another family must predict original ciphertext beyond any phrase used to choose the key.

**Reproduce:** [single-file Node/CommonJS original source SFT](../sims/lp2_p55_bifid25_crib_alphabet_gate_sft.cjs). It asserts 76/75 rune boundaries, 25-symbol inventory, source-native 30-rune crib, missing literal symbols, all-secret alphabet contradiction, three fully reversible original Bifid inverses and independently planted source-text round-trips. No novel unknown-page plaintext is asserted.
