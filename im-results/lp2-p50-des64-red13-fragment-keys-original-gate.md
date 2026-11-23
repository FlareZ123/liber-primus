# Original p50 32×8 DES row keys across 32 red13-delimited intervals

**Agent30, 23 November 2026. Complete original-cipher receiver negative; no recovered unknown plaintext, authentic cipher operation or continuation.**

## Independently visible premise

Original LP2 physical p49–51 prints exactly **32 rows × 8 byte-valued tokens**. DES, a historically available block cipher, uses an eight-byte key and an eight-byte block. The original book also contains exactly **31 large 13-dot punctuation marks**, hence 32 consecutive rune intervals. They divide into **28 intervals over all 12,956 currently unknown GP29 runes** and four later intervals containing independently solved p56/p57; two of the 28 source intervals are empty. The count match makes a finite, human-plausible experiment, though the two empty intervals and different actual encryption of solved p56/p57 count against treating it as established intended layout.

Previous DES tests instead took p50 as **ciphertext** under one p0 red heading or the word DIVINITY ([p0](lp2-p0-red13-base29-des-p50-block-original-gate.md), [DIVINITY](lp2-p50-divinity-des-ciphertext-gate.md)). Other work used p50's 32 rows as **Salsa20/ChaCha20 nonces** with a p15 key. This experiment assigns the **eight bytes in each source p50 row as the independent DES key for the correspondingly numbered text interval**. It has not been selected by an authenticated creator instruction.

## Exact full-cipher inversion

The [source original rune corpus](../resources/liber-primus/lp2-corpus.json), [page ink annotations](../resources/liber-primus/lp2-ink-annotations.json) and [original numeric grid](../resources/liber-primus/base60-grid.json) are read directly, with all byte rows, 31 punctuations, 32 intervals and 12,956 encrypted runes asserted. For each of 28 unknown-source intervals, take the eight row bytes as a DES key. The complete byte keystream is DES encryption of consecutive 64-bit big-endian counters starting at zero. This uses the historically standard source 60-character numeric alphabet, **without fitted seed, phase, nonce, offset, row permutation, or password**.

Test six independently defined native-GP29 inverse models: conventional additive GP29 subtraction with either sign; the predecessor-excluding GP28 **cyclic** rank with either sign; and the predecessor-excluding GP28 **ascending** rank with either sign. The two rank28 models retain the source interval's first rune as a public IV; original immediately repeated runes are taken as literal, non-consuming EA (index28), another declared but unauthenticated assumption. The plaintext-like 28 symbols subtract one DES stream byte modulo28. All six models are fully invertible, with exact full-source re-encryption.

## Actual unchanged source versus native prose

A fixed, independently trained GP29 Shakespeare trigram scorer gives average smoothed natural-log conditional probability per rune. Its held-out genuine native GP text scores **−2.380577**; untouched original ciphertext scores **−4.376100** across the full 12,956 source runes. The original results are:

| Complete original interpretation | Full book | pp0–2 | pp8–14 | pp40–53 |
| --- | ---: | ---: | ---: | ---: |
| Untouched GP29 ciphertext | −4.37610 | −4.42729 | −4.41346 | −4.38728 |
| DES-row direct GP29, sign + | −4.39840 | **−4.37288** | −4.38381 | −4.42844 |
| DES-row direct GP29, sign − | −4.41225 | −4.43838 | −4.39660 | −4.37690 |
| DES-row cyclic28, sign + | −4.40265 | −4.42342 | −4.44418 | −4.39112 |
| DES-row cyclic28, sign − | −4.38847 | −4.40866 | −4.39347 | −4.41791 |
| DES-row ordered28, sign + | −4.40538 | −4.43047 | −4.39225 | −4.37524 |
| DES-row ordered28, sign − | **−4.38548** | −4.47635 | **−4.33552** | −4.37475 |

The best training-page score gains only **0.05440 nats/rune** over undeciphered source, while the disjoint pp40–53 score falls. Every actual full-book score remains at the random/ciphertext baseline. No recovered original prose emerges.

A standard NIST DES known-answer vector **133457799BBCDFF1 / 0123456789ABCDEF → 85E813540F0AB405** passes under Node/OpenSSL single-DES-equivalent triple-identical 3DES. Six independent source-length **12,956-rune** native GP English plants encrypt and decrypt exactly under all source row keys and the original 31-mark interval layout; rank28 plants preserve every actual source repeat-site as an EA marker. Original-cipher outputs also exactly re-encrypt all their unchanged input runes. Successful [Windows/Node22 CI run 45118844897](https://github.com/FlareZ123/liber-primus/actions/runs/45118844897) verifies all source and positive assertions.

## Decision and remaining route

The **specific DES64 counter stream with p50 eight-byte row key per authentic source 13-dot interval** fails as a plain native-GP English inverse under these six fixed direct transports. The book does not authenticate DES, counter mode, the row-to-interval assignment, or EA-reserving rank encoding. Do not enlarge this negative into a claim against all source-derived keys or every encrypted-language register. A new independent operation selector would be required to make further cipher variations useful.

[Self-contained Node22 CommonJS original-source SFT](../sims/lp2_p50_rowdes_red13_fragment_original_sft.cjs).
