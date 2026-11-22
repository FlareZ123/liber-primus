# p56 prime-totient key with causal word direction

**Status:** bounded source-derived negative; no unknown LP2 plaintext recovered.

## Human solve-path hypothesis

The solved p56 page establishes a concrete key stream: consecutive prime totients, \(K_i=(p_i-1)\bmod29\). The signed 2016 Cicada message says word numbers give direction. A plausible human attempt is therefore to use the authentic p56 prime-totient stream while letting each recovered word's Gematria Primus number select the direction of the next word's key traversal.

This is a constrained transfer test, not an assertion that p56's cipher necessarily continues unchanged through LP2. The start is fixed at the first prime, \(p=2\); the key stream is unbounded and noncyclic; there are no fitted offsets, wraps, or page resets.

## Frozen corpus and key

- Canonical source: `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-transcription.txt`.
- Unknown scope: p0–p55, exactly 12,956 runes and 2,896 printed words; the script asserts exact equality with the corpus page arrays.
- Key: \(K_i=(p_i-1)\bmod29\), with primes beginning 2 and pointer 0.
- Both arithmetic signs are tested: \(C=P+K\) and \(C=P-K\).
- Initial direction is forward. Direction is applied within a word and updated after that word for the next word.
- No F bypass is used in this particular word-direction transfer; this is the same transfer model used by the earlier prime/Möbius gate below.

## Earlier causal word-number selectors

The pre-existing finite test covered prime/composite and Möbius selectors of the previous **plaintext** word's GP-prime sum. Three of eight cases completed the corpus, but their outputs remained ciphertext-like:

| Selector | Direction polarity | Sign | Result |
|---|---|---|---|
| Prime/composite | Prime backward, composite forward | \(C=P+K\) | Complete; trigram log-likelihood −4.62773 |
| Prime/composite | Prime backward, composite forward | \(C=P-K\) | Complete; trigram log-likelihood −4.63235 |
| Möbius | \(\mu=-1\) forward, \(\mu=+1\) backward, 0 holds pointer | \(C=P-K\) | Complete; trigram log-likelihood −4.61258 |
| Other five cases | — | — | Pointer underflow before corpus end |

For reference, untouched LP2 scores −4.60956 under the same Shakespeare GP29 trigram model; Shakespeare training and held-out scores are −2.21915 and −2.36417. The complete candidates therefore do not improve on the ciphertext baseline. The prior exact forward-reencryption checks are retained in the script.

## Added prime-reversal / emirp selector

The 2013 `count` material offers a more specific possible direction rule: classify a word's GP-prime sum \(S\) by the primality of both \(S\) and its decimal reversal. This is a plausible bridge to the signed 2016 instruction, but the marker legend is contradictory:

- The contemporary 7 January 2013 Pastebin record `AfndPJa0` records `THE INSTAR EMERGENCE=761*` and p57 clause sums `1259*`, `1031*`, `1229*`; its accompanying legend treats reversible primes as `*` and non-reversible primes as `+`.
- The later reconstructed first-onion service example gives `THE INSTAR EMERGENCE=761+` and `PARABLE=449*`, reversing that convention.
- Neither suffix legend is authenticated organizer code; the contemporary record may contain participant annotations. Both orientations were therefore tested, not silently reconciled.

Frozen rule: if \(S\) is composite, retain the previous direction; if \(S\) is prime and \(\operatorname{rev}_{10}(S)\) is prime, set the next direction to one polarity; if \(S\) is prime but its reversal is composite, set the opposite polarity. The first word uses forward direction. Both source-legended polarities and both arithmetic signs were tested.

### Full-corpus results

| Feedback source | Marker legend | \(C=P+K\) | \(C=P-K\) |
|---|---|---|---|
| Previous plaintext word | Later reconstructed legend: emirp forward | Underflow at word 38, rune offset 175 | Underflow at word 7, rune offset 41 |
| Previous plaintext word | Contemporary Pastebin legend: emirp backward | Underflow at word 594, rune offset 2,707 | Underflow at word 24, rune offset 113 |
| Previous ciphertext word (solver-visible proxy) | Later reconstructed legend | Underflow at word 9, rune offset 47 | Underflow at word 9, rune offset 47 |
| Previous ciphertext word (solver-visible proxy) | Contemporary Pastebin legend | Underflow at word 3, rune offset 17 | Underflow at word 3, rune offset 17 |

All eight prime-reversal variants underflow before the 12,956-rune corpus is complete. There is no complete candidate to language-score. A p0–2 prefix check likewise produced no prose: the only complete prefix variant had IoC 0.03455 versus 0.03448 for the raw prefix and no meaningful dictionary evidence; it later underflows on the full corpus.

## Decision and limits

Reject the exact p56 prime-totient transfer with the frozen prime-reversal carry selector under both historical marker conventions, both arithmetic signs, and both plaintext-feedback and ciphertext-proxy feedback. Do not rescue it with arbitrary offsets, key wrapping, or page resets.

This does **not** reject the broader 2016 wordwise-direction clue, a different authentic key source, or other source-selected pointer conventions. The ciphertext-proxy result is a bounded test of the same p56 key, not a replacement for the separate 581-stream pointer-direction campaign.

## Reproduction

Run `node sims/lp2_p56_prime_totient_plaintext_word_direction_gate.cjs` from the repository root. The script asserts the canonical 12,956-rune / 2,896-word input, retains the earlier prime/Möbius cases, adds both emirp marker polarities and both feedback sources, and checks the exact expected pointer-underflow positions. It also retains the earlier language-model and re-encryption controls.
