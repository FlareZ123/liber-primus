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

Q has a 59-byte big-endian representation when padded to 118 hex digits. The unsigned 2014 Stage11 participant README mentions `59.txt` as **page number 59**, followed by `xxd -r -p 59.txt > 59.bin`; it never gives a 59-byte file length. Thus the apparent Q-size ↔ “59” match is numerology, **not a file-length match**. The same 2014 commit actually added `56.txt` and its xxd-derived `56.bin`, so a README filename mistake remains possible. Q is not the direct preimage of N under SHA-512, SHA3-512, BLAKE2b-512, SHAKE256-512, or Whirlpool. No source selects Q as XOR, OTP, HMAC or another key. Separately, 281 is the **60th prime**, whose zero-based rank is 59; this is a post hoc possible index into the missing-name reference, with neither a creator-selected prime-rank opcode nor an authenticated 59th page.

## A discriminating page-length ambiguity

The UDP-length match is **not unique to p55** when the entire 56-page unsolved source is examined with the same fixed rule. Among 55 rune-bearing physical pages, `N` is divisible by `8 + original page-local rune count` for **seven pages**: physical **p11, p17, p21, p25, p41 and p44** have 273 runes each (`8+273=281`), and **p55** has 76 (`8+76=84`). These are exactly the two source-page packet lengths matching a factor. The factor `281` could therefore encode a *length* for six full pages as easily as a destination port, absent an independent original-source selector. This is a look-elsewhere caveat on the original p55 retrieval construction; no alternative packet is proposed. The SFT asserts all seven matches.

## Source-fixed BASE29 prefix and illustrative packet bytes

Across the 55 rune-bearing original unknown physical pages (p50 is numeric-only), **p55 alone begins with the two historical BASE29 digit characters `LP`**. This equals the book initials under the independently signed 2013 alphabet. The pair `LP` appears 23 times among all 12,956 unknown original runes, with 22 appearances internal to pages. The page-boundary placement is unusual, but the acronym was noticed **after** examining the output; no creator-signed magic-marker rule exists. This observation does not recover plaintext.

A precise, valid-size UDP-segment *specimen* has optional source port zero, destination port 281, UDP length 84 and IPv4 checksum zero (header hex `0000011900540000`), followed by the 76 ASCII bytes beginning `LPJA7FHE...`. The complete segment is 84 bytes. [RFC 768](https://www.rfc-editor.org/rfc/rfc768.html) allows zero optional source port and zero checksum for IPv4. **Zero source port supplies no return port**, so the frozen specimen cannot establish a page-return exchange. A functional reply-receiving packet needs a separately selected source port and live application contract, neither of which appears in the original evidence. No traffic was sent. The reproducer emits all 84 bytes as hex and asserts exact source-text consistency.

## Independent context and limits

The p3/p39 red Atbash reading SKY/UDP is provisional but independently compatible with this route; the signed 2013 “knock on the sky” clue establishes in-period network-puzzle vocabulary. The signed 2013 BASE29 source supplies the digit alphabet. The signed 2016 hint that the book's numbers give direction is compatible with using the target structurally.

This yields a plausible human path: recognize SKY/UDP, factor the p56 target for a possible address/port/length, and encode the full page-local p55 sequence in BASE29. A return-response and page-59 step remain unsupported. The arithmetic and byte counts are reproducible; the endpoint interpretation is not authenticated. No packet was sent, no host/port was probed, and no claim is made that the address is currently active or author-controlled. The hash algorithm and actual page-59 preimage remain unknown.

**Next decisive evidence:** an archived 2014 packet/server record, an independently recovered 59.txt/59.bin, or an authenticated historical attribution of the IP/port. Do not perform live probing.

Reproduce with `node sims/p56_factorization_udp_endpoint_sft.cjs`; it opens no sockets and sends no traffic.
