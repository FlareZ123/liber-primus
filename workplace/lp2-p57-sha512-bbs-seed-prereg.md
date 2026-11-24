# SHA-512 of solved p57 as a source-derived Parable-BBS seed

**Status: completed — bounded negative.** This is a bounded key-derivation test, not a general hash search.

## Motivation

The 2013 audio ID3 field names the Parable product 1,595,277,641 = 1259×1031×1229. Those three primes are the GP-prime sums of the three body clauses on solved LP2 p57. SHA-512 is independently present in Cicada's later cryptographic material. A solver who connects the solved parable to the prime product could reasonably test whether the parable's canonical symbol stream is hashed to obtain a BBS initial seed.

No source explicitly instructs this hash operation; it is a hypothesis. The exact inputs and derivation are therefore frozen below.

## Frozen derivations

Use the canonical 95-rune page-57 sequence from resources/liber-primus/lp2-corpus.json, with no text normalization or inserted spaces. Test only two encodings:

1. The 95 GP29 rune indices as raw bytes.
2. The corresponding 95 GP-prime values as unsigned 16-bit big-endian integers.

For each byte stream, compute SHA-512, interpret the digest as a big-endian integer, and reduce modulo each of:
- N3 = 1259×1031×1229 = 1,595,277,641.
- N2 = 1259×1031, the source two-factor Blum subset.

This produces exactly four seeds. No SHA-256, little-endian digest, salts, alternate text forms, title-only hash or other representations are tested.

## Receiver

For each of the four derived seeds, test the five existing BBS output encodings (state-low8, state-low5, bits5-lsb, bits5-msb, bits8-msb), both signs, and the existing collision-only GP29-additive Viterbi. Use page-reset key generation and the six fixed pages [0, 3, 8, 23, 27, 40], with 130 training and 80 held-out runes per page. Total: 40 models.

The script runs the established planted-positive control exported by parable_bbs_keyskip_inverse.cjs before evaluating the hash-derived seeds. It must pass before the original-cipher experiment is reported.

## Result

The positive control passed: the established full-three-prime seed-3301 / bits5-msb model ranked first and recovered 1260/1260 planted runes with 24 skips. The 40 hash-derived original-cipher models did not yield intelligible held-out plaintext.

| Input | Modulus | Seed | Best relevant heldout result |
| --- | --- | ---: | --- |
| GP29 index bytes | N3 | 1277018081 | no coherent heldout text |
| GP29 index bytes | N2 | 1055574 | best heldout score −5.6246, gibberish |
| GP-prime u16BE | N3 | 277338680 | no coherent heldout text |
| GP-prime u16BE | N2 | 858503 | no coherent heldout text |

The best heldout candidate was GP29-index bytes modulo N2, bits5-msb, positive sign: train −5.7898, heldout −5.6246, with heldout heads CEAFTMPAECARUEOCYJXCEYO and XOMSBOETHABAMYNPWNETHAENG. The best training score was −5.7436 and also had gibberish heldout text.

**Decision:** retire the two frozen SHA-512 inputs and N3/N2 reductions under the declared five-format, page-reset GP29-additive keyskip receiver. [Raw 40-model result](../im-results/parable-bbs-hashseed-inverse.json) · [SFT](../sims/parable_bbs_hashseed_inverse.cjs) · [workflow run 45414129975](https://github.com/FlareZ123/liber-primus/actions/runs/45414129975).

## Decision rule

A high training score is not success. A candidate must show independently intelligible held-out plaintext across multiple pages, not isolated words or a postselected fragment. If none does, retire only these two canonical SHA-512 derivations under the declared receiver. Do not expand hash algorithms, encodings, salts, clocks or skip models to rescue a weak result.
