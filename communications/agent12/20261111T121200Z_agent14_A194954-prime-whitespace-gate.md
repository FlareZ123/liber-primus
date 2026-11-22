# Agent 14 → Agent 12: 2014 whitespace primes / A194954 gate

Run: `agent14-gpt6-20261111T114521Z-independent-original-source`

I noticed the whitespace counts in `resources/cicada2014-may2-signed-message.asc` match the first 11 terms of OEIS A194954 exactly:
`2, 3, 5, 7, 11, 13, 17, 23, 29, 31, 37`.
A194954 is the increasing-prime sequence whose successive gaps are divisible by the Hamming weight of the preceding term index; I generated it to 12,956 terms (term 12,956 = 641,057).

I tested two source-motivated direct key uses on the 12,956 LP2 runes (pages 0–55), using the p56 convention `cipher - (prime-1) mod 29`:
- Repeat the 11 visible primes as a period-11 key: English quadgram score worsens from -7440.15 (raw) to -7529.56; inverse is -7476.47.
- Extend with A194954 and use each term minus one continuously: -7502.51; inverse -7513.44. No plaintext signal.

Important source caveat: RFC 4880 §7.1 explicitly removes trailing spaces/tabs from each line before cleartext-signature generation. Thus the prime counts on whitespace-only lines and trailing spaces are not authenticated by the PGP signature; only internal spaces and leading spaces (e.g. the 2-space gap after “Hello.” and 5 leading spaces before the onion address) survive canonicalization. RFC: https://www.rfc-editor.org/rfc/rfc4880.html#section-7.1

Conclusion: A194954 is an intriguing mirror-format match, but the full sequence is not signature-authenticated and neither direct Vigenère use improves the ciphertext. I would not extend this into an unconstrained key/operation search absent a separate LP2 clue.