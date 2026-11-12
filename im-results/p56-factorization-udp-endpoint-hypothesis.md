# p56 factorization / p55 UDP retrieval candidate

**Status:** coherent cross-page hypothesis; no endpoint, service, page-59 payload, or hash preimage authenticated.

## p56 instruction

The historical 2014 decoder (56.runes + decode56.py) reads p56 as saying that a page exists within the deep web which **hashes to the printed 128-hex-character target**, and that pilgrims should seek it out. It does **not** instruct factoring. Factoring is an analyst-generated structural hypothesis.

## Factorization

The 64-byte target factors exactly as:

`N = 84 × 281 × 2,155,279,523 × Q`

The first three factors are proven primes; Q is a 465-bit strong probable prime (109 strong Miller–Rabin bases; no formal certificate here).

- 2,155,279,523 as a big-endian IPv4 integer is **128.118.244.163** (80 76 f4 a3), within the Penn State 128.118.0.0/16 allocation. This does not identify a historical host.
- **281** is registered as **personal-link** for UDP/TCP; registration does not prove a listener.
- **84 = 76 + 8** is a UDP datagram length for a 76-byte body and the standard 8-byte UDP header.

## p55 body candidate

The signed 2013 BASE29 example (3301 decimal → 3QO) selects the positional digit alphabet 0–9A–S. Mapping the 76 page-local p55 GP29 indices gives the 76-byte ASCII candidate:

`LPJA7FHEJFC6N2P0ROH5174HS0EAJ15D8LKCJFNRD0H8C5CISIA6E6FIFC22IF2M5SAJ5ENB1HIA`

**Boundary caveat:** p55's first NG completes a word carried from p54; the semantic body has 75 runes. The 84-byte match therefore requires the full 76-symbol page-local sequence or a one-byte framing interpretation. Body-only plus UDP header would be 83 bytes.

## 59-byte cofactor

Q has a 59-byte big-endian representation when padded to 118 hex digits. The archived 2014 Stage11 participant README mentions a missing 59.txt containing page-59 text and the conversion `xxd -r -p 59.txt > 59.bin`. The length match is suggestive only: Q is not the direct preimage of N under SHA-512, SHA3-512, BLAKE2b-512, SHAKE256-512, or Whirlpool. Q could be a 59-byte key for a missing response/ciphertext, but no source selects XOR, OTP, HMAC, or another operation.

## Independent context and limits

The p3/p39 red Atbash reading SKY/UDP is provisional but independently compatible with this route; the signed 2013 “knock on the sky” clue establishes in-period network-puzzle vocabulary. The signed 2013 BASE29 source supplies the digit alphabet. The signed 2016 hint that the book's numbers give direction is compatible with using the target structurally.

This yields a plausible human path: recognize SKY/UDP, factor the p56 target for address/port/length/key material, encode the full page-local p55 sequence in BASE29, and seek the page-59 response. The arithmetic and byte counts are reproducible; the endpoint interpretation is not authenticated. No packet was sent, no host/port was probed, and no claim is made that the address is currently active or author-controlled. The hash algorithm and actual page-59 preimage remain unknown.

**Next decisive evidence:** an archived 2014 packet/server record, an independently recovered 59.txt/59.bin, or an authenticated historical attribution of the IP/port. Do not perform live probing.

Reproduce with `node sims/p56_factorization_udp_endpoint_sft.cjs`; it opens no sockets and sends no traffic.
