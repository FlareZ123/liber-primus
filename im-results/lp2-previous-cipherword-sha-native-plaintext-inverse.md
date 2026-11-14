# Signed-2016 words as a literal preceding-ciphertext-word SHA key: direct original inverse

**Agent41, 14 November 2026. Status: bounded plaintext-targeting negative, 32 frozen exact models; no new source plaintext or recovered key.** This tested a distinct deterministic key source, with every draw computable from the original ciphertext itself. It cannot establish what the author intended.

## Motivated but unselected mechanism

The authenticated 2016 statement describes Liber Primus's *words* as the map and its *numbers* as the direction. The solved p56 instructs a search for a deep-web page via its digest. A low-complexity human interpretation is that a completed original ciphertext word is the key to the following word, with a standard cryptographic hash converting it into a source-derived number sequence. **No authentic source says to apply a hash at word boundaries**, select SHA-256 or SHA-512, or define a byte-to-GP modulus, so these interpretations are conditional tests.

Use all **2,896** actual printed source words and **12,956** unchanged ciphertext rune values, preserving original word boundaries across print line and physical page breaks. Word 0 is unchanged (no preceding completed word). For each next word, calculate either SHA-256 or SHA-512 over the preceding exact original ciphertext word represented in one of four straightforward ways: 0-based GP ordinal bytes; original UTF-8 rune glyphs; original ASCII GP transliteration; or decimal GP primes joined by commas. Use digest bytes in their original order, repeating only for a word longer than the digest. The candidate GP keystream is each byte reduced modulo 29 (or 28 for a rank-28 nonrepeat reading), with no phase, salt, block count or cipher-derived search. The digest is independently computable for every source word and does not require plaintext feedback.

Test **two reversible grammars and both arithmetic signs**, giving 2 digests × 4 representations × 2 grammars × 2 signs = **32** frozen original full-book inverses:

1. Direct additive GP29: `P_(w,j) = [C_(w,j) ± digest[j] mod29] mod29`.
2. Source's unusual ciphertext anti-repeat may indicate a GP28 nonzero-step encoder with `P=EA` for zero ciphertext step, else `P=[C_i−C_(i−1)−1 ± digest[j]] mod28`. At word starts the predecessor is the preceding word's last actual ciphertext rune; the first word is opaque.

Both grammars are fully specified, with explicit inverses back to original ciphertext. The rank28/EA grammar is only a proposed explanation of repeats, not a validated cipher.

## Exact original result

The 32 original inverses produce GP29 index of coincidence in the interval **0.03445306199–0.03531685308**. The original untouched ciphertext register after the first word is near the uniform baseline 1/29; the independently solved genuine p57 text has IoC **0.0627099664**. Even the best candidate's first 120 original runes transliterate as unreadable pseudotext; no candidate yields a coherent plaintext paragraph, source-selectable key, or new deep-web destination.

Every one of the 32 candidate inverses exactly forward-reencrypts the untouched original manuscript. More decisively, **all 32/32 forward/inverse implementations** also reconstruct an independently planted source-sized GP29 English passage formed from the *actual solved p57 rune sequence*, under the same word length inventory and candidate hash-derived source keys, with 12,956 runes recovered exactly. The plant repeats the 95-rune native text to populate a full-length test; its IoC **0.07248992285** is a shape control, and should not be interpreted as representative of an independent literary book.

The candidate source operands and extraction are replayed without external data with [the CommonJS SFT](../sims/lp2_word_previous_cipher_hash_inverse_sft.cjs). It passed under Windows Node22 in [GitHub Actions run 43566546288](https://github.com/FlareZ123/liber-primus/actions/runs/43566546288).

## Decision

Retire only these **32 source-bounded preceding-ciphertext-word, immediate SHA digest, direct GP29 and rank28 interpretations**. Their exact inverses don't reveal authentic plain GP text. A successor needs an independent instruction that selects a different hash input, state evolution, or earlier key, rather than searching arbitrary salts, byte offsets or adapted word-to-hash conversions against English scores. The original structure remains unsolved; the failed SHA hypotheses provide no evidence that SHA was intentionally used by the creator.
