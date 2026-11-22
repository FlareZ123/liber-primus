# Original LP1 OutGuess cross-image operations

**Source inventory (10 November 2026).** This is an independently reproduced **historical 2014 solve path**, not a new LP2 decipherment. The preserved [2014 reconstruction](lp1-outguess-00-02-xor-derived.asc) is a derived file from three original JPEGs, distinct from the originals in [resources/liber-primus](../liber-primus/).

## Exact original inputs and recovered material

A pinned historical OutGuess implementation (\`24810e14327c2bbeedeaadd3e24491f2a4425c02\`) read the **original** 75 JPEGs with its default key in [successful original-source workflow 42906897333](https://github.com/FlareZ123/liber-primus/actions/runs/42906897333). Original signed-message controls in image \`00.jpg\` and original rune-instruction control \`08.jpg\` succeeded.

- **JPEGs 00, 01, 02:** each yields a separately PGP-clear-signed 2,899-byte payload, whose signed body is exactly **1,982 lowercase hexadecimal characters** (991 bytes). Bytewise XOR of the three decoded 991-byte bodies reconstructs a **991-byte ASCII PGP-clear-signed message**, saved exactly in [the derived source](lp1-outguess-00-02-xor-derived.asc). It begins with the 70-character grouped cryptogram \`IDGTK UMLOO ARWOE RTHIS UTETL HUTIA TSLLO UIMNI TELNJ 7TFYV OIUAU SNOCO 5JI4M EODZZ\`. The historically published 14-column transposition yields the 2014 \`FV7LYUCMEOZZD5J4\` Tor-service lead. This procedure was publicly documented years earlier in the [2014 original-puzzle walkthrough](https://embeddedsw.net/doc/Openpuff_for_experts_Cicada_3301_recruitment_puzzle_2014.pdf). The three share-output SHA-256 hashes from this inventory are \`2efba5e2283fa16592bedb7c339223bf2db94f07cf2d42188684aa393c12d180\`, \`da4ad19d7e46a9df54fe800bb2477914fbb7b83d34e4ea748760ce2e0902e656\`, and \`b1d1d69e32e6c5725dffbcd871c2acb482371889d48ce6734c17741816ad23a3\`.
- **JPEG 03:** a signed 31,809-byte payload begins \`Let the text guide you. Good luck. 3301\`, followed by a hexadecimal JPEG. This is the original 2014 nested-artifact precedent.
- **JPEG 08:** authentic 140-byte OutGuess clue beginning \`For those who have fallen behind\`.
- **JPEGs 10, 11, 12, 13:** separately signed 1,234-byte instructions to create a Tor hidden service. Their signed ASCII-art magic-square frames differ by **one constant border digit per image**, in original JPEG order: **3, 3, 0, 1**. This is an unusually clear original-source example of cross-image comparison carrying a recognizable key.

The scan also yielded image \`04.jpg\` with 7,524 unauthenticated binary bytes, and 06, 07, 09 with 58,152 unauthenticated bytes sharing a common spurious header. **No authenticated meaning is established for those bytes.** In LP2, the same no-key extractor yielded 16 apparent 58,152-byte payloads with common seed 41,408 and no recognized PGP/text file signature; these are not identified messages.

## Implications for interpreting LP2

Two creator-era operations are verified historically: *combine three equally shaped source shares by exact XOR* and *inspect apparently repeated signed source material for position-dependent differences*. They are useful model-building precedents when a Liber Primus image or numeral sequence explicitly supplies comparable equal-sized segments. Neither licenses unrestricted XOR subset searches or inferring a key from a coincidence. No unknown LP2 rune plaintext, key, or mechanism follows from this inventory.

To repeat the original extraction, run the existing [manual OutGuess workflow](../../.github/workflows/lp2-outguess.yml) with \`lp1_history=true\`; the [source scanner](../../sims/outguess_lp2_scan.cjs) has an LP1-only option while preserving the normal LP2 behavior. For the share operation: remove the clear-signed armor from each 00/01/02 extraction, concatenate the whitespace-separated hex body, hex-decode to 991 bytes, and bytewise XOR the three equal-size buffers, retaining every byte in source order.
