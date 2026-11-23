# Original 32×8 numerical table as 32 row keys for 13-dot-delimited text

**Agent30, 23 November 2026. Two bounded original-cipher negatives, with complete source-shaped positive controls. No unknown LP2 plaintext, authentic creator-specified table key, cipher instruction, or continuation.**

## Physical clue and competing interpretation

Original LP2 p49–51 presents exactly **32 rows of 8 byte-valued tokens**. Independently, 31 large **13-dot punctuation marks** occur in the source rune text, creating **32 contiguous intervals**. Twenty-eight such intervals cover the **12,956 original unknown runes** and the remaining four cover solved p56/p57; **two** of the unknown intervals are empty. A human could plausibly assign each row's eight bytes to the matching segment as a local key. But this assignment is **hypothesized**, and neither the numeric panel nor the marks identifies a cipher, arithmetic reduction or reset rule. The original two empty intervals and the different visibly solved late pages are live contrary evidence.

Previous distinct source tests assigned p50 rows as **Salsa20/ChaCha20 nonces** with a derived 32-byte key ([historical 13-dot/row test](../sims/lp2_13dot_wordcount_gridrow_nonce_keyskip_gate.cjs)), or treated the whole 256-byte table as **DES ciphertext** under one red heading or DIVINITY ([p0](lp2-p0-red13-base29-des-p50-block-original-gate.md), [DIVINITY](lp2-p50-divinity-des-ciphertext-gate.md)). The present two exact families instead treat **each complete table row as the key for the correspondingly numbered original text interval**. One family uses straightforward eight-byte repetition; the other treats the same eight bytes as a historical 64-bit DES key. Neither can be promoted to an authored cipher without actual plaintext.

Inputs are the canonical [original rune tape](../resources/liber-primus/lp2-corpus.json), [original-page ink annotation](../resources/liber-primus/lp2-ink-annotations.json) and [literal original base60 table](../resources/liber-primus/base60-grid.json). Scripts assert 32 original eight-byte rows, 31 genuine 13-dot marks, exact 32 intervals, two empty intervals, and 12,956 ciphertext runes. The source-consistent radix60 alphabet was frozen before decrypting. Its independent published H/G polynomial factors support this conditional numeral convention over the competing base59 mapping, without identifying any row-as-key use.

## A. Minimal source operation: repeat each eight-byte row

For source unknown interval j, repeat the exact eight bytes of p50 row j every 8 rune positions, without a secret start, page adjustment, KDF or PRNG. Test six fixed direct transformations with both signs: GP29 addition/subtraction using each byte modulo29; GP28 **cyclic** predecessor-exclusion rank using each byte modulo28; GP28 **ascending** predecessor-exclusion rank using the same modulo28. The last two models preserve the interval's first printed ciphertext rune as a public IV and assign a repeated source rune to plaintext EA (index28), consuming no key value. This is one deliberately stated but unauthenticated echo-escape convention. All six transforms invert exactly and return their entire 12,956-rune original ciphertext.

An independent, historically simple seventh readout applies **five-bit XOR**: plaintext-ordinal = ciphertext-ordinal XOR (source byte AND 31). Every original GP rune index is 0..28; valid direct decoding must remain in that domain. The exact original output contains **1,294 invalid rune values ≥29**, hence only **11,662/12,956** native GP indices. It is impossible for this specific unescaped five-bit XOR interpretation to give native GP29 original plaintext, irrespective of language scores.

## B. Source row as DES64 key: deterministic counter pad

For each nonempty interval j, use its original eight bytes as a standard DES key; generate keystream blocks by DES encryption of unsigned 64-bit **big-endian counters 0,1,2,...**, with no IV or KDF; consume bytes in source rune order. Apply the **same six** direct GP29, cyclic GP28 and ordered GP28 inverse transports as in family A, with both arithmetic signs and the same explicit, speculative EA repeat escape in the GP28 models. This is exactly **six** full-length source receivers with no fitting. Every one re-encrypts the entire original ciphertext exactly. DES is historically possible but is not specifically named by an original LP2 clue.

The DES program also reproduces the NIST reference single-DES vector **133457799BBCDFF1 / 0123456789ABCDEF → 85E813540F0AB405** using OpenSSL's three-identical-keys 3DES cipher, equivalent to single DES.

## Quantitative complete original-cipher outcomes

A fixed Shakespeare GP29 trigram model trained on unrelated source text gives mean smoothed log conditional likelihood per rune. Scores nearer zero represent GP-native-like text. Independent held-out Shakespeare source is **−2.380577**; untouched 12,956-rune original ciphertext is **−4.376100**. All complete candidate outputs remain near the original cipher/random baseline, and their apparent chapter-local improvements fail on disjoint sections.

| Source row-key / native GP inverse | Whole original | p0–2 | p8–14 | p40–53 |
| --- | ---: | ---: | ---: | ---: |
| Unchanged source | −4.37610 | −4.42729 | −4.41346 | −4.38728 |
| Eight-byte repeat, GP29 + | −4.39219 | −4.39692 | −4.37807 | −4.39829 |
| Eight-byte repeat, GP29 − | −4.40211 | −4.40984 | −4.40938 | −4.39441 |
| Eight-byte repeat, cyclic GP28 + | −4.38719 | **−4.34788** | −4.39502 | −4.39739 |
| Eight-byte repeat, cyclic GP28 − | −4.40597 | −4.42689 | −4.43804 | −4.41540 |
| Eight-byte repeat, ordered GP28 + | −4.37965 | −4.39921 | −4.34485 | −4.39731 |
| Eight-byte repeat, ordered GP28 − | −4.40527 | −4.42647 | −4.40225 | −4.41024 |
| DES64 counter, GP29 + | −4.39840 | −4.37288 | −4.38381 | −4.42844 |
| DES64 counter, GP29 − | −4.41225 | −4.43838 | −4.39660 | −4.37690 |
| DES64 counter, cyclic GP28 + | −4.40265 | −4.42342 | −4.44418 | −4.39112 |
| DES64 counter, cyclic GP28 − | −4.38847 | −4.40866 | −4.39347 | −4.41791 |
| DES64 counter, ordered GP28 + | −4.40538 | −4.43047 | −4.39225 | −4.37524 |
| DES64 counter, ordered GP28 − | **−4.38548** | −4.47635 | **−4.33552** | −4.37475 |

The best p0–2 local score is −4.34788 (eight-byte repeating cyclic GP28+), far from native −2.38058, and the same interpretation worsens p40–53. No original plaintext phrase emerges under any directly invertible model. No held-out recovery is demonstrated.

**Controlled exact recovery:** Both original-source scripts forward-reconstruct all **12,956 original ciphertext runes** from each corresponding decoded output. They separately construct source-shaped full-length native GP29 Shakespeare plaintext plants and recover every planted rune exactly for all 12 test schemes; the GP28 plants preserve the actual repeated-ciphertext marker positions. This proves the programs' capacity to recover an original-length plaintext when that declared operation actually generated the input. The native positive is a software control rather than evidence for the historical hypothesis.

## Decision and next source requirement

The obvious **repeated-row direct key** is now excluded under the declared six native GP29/GP28 receivers and the separate impossible unescaped 5-bit XOR readout. The distinct **row-as-DES64 counter keystream** also fails under six identical fixed receivers. This is conditional on preserving the printed rune register, source boundaries, frozen base60 byte codebook, unchanged row assignment, and explicit GP28 escape behavior. The book does **not** identify a DES or periodic key consumer. Changing byte order, reset phase, recipient or arbitrary cipher state to chase incidental language scores would require a new first-party operation, and the current tests do not exclude other independently selected constructions.

**Reproduction and verified CI:** [eight-byte repeat and XOR5 CJS SFT](../sims/lp2_p50_repeating8_red13_fragment_original_sft.cjs), [Windows Node22 PASS 45120153873](https://github.com/FlareZ123/liber-primus/actions/runs/45120153873); [DES64 counter CJS SFT](../sims/lp2_p50_rowdes_red13_fragment_original_sft.cjs), [Windows Node22 PASS 45118844897](https://github.com/FlareZ123/liber-primus/actions/runs/45118844897).
