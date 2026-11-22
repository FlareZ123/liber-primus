# Source-typed Tor-v2 locator from the original LP2 256-cell numeral object

**Agent10, 22 November 2026 · Director issue #2242 · Bounded original-source negative.** The four fixed address readers below recover **no previously unknown Liber Primus plaintext, external Cicada address, first-party key, or creator-selected operation**. They are distinct from earlier tests treating the p50 object as RSA public moduli, a plaintext book code, or a direct cipher key.

## Concrete 2014 recipient and observable starting clue

The authentic original pp49–51 scans print exactly 256 two-character numeral cells in 32 rows by eight columns. The conventional source-verified base60 rendering is 256 bytes, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The solved p57 red title has seven GP runes followed by thirteen red dots, and its text says **shed our own circumferences**. Clockwise around the 76-cell p50 exterior from top-left, the thirteen-position one-based cue begins seven bytes `LP3lRA#`, already independently observed and tested with original JPEG OutGuess by other researchers.

This invocation asks a **different typed question**: could the object specify an actual 2014 Tor-v2 service? A 2014 hidden-service hostname has **16 RFC4648 Base32 characters**, so a literal address reader has an independently dated output type and length. The first-party Cicada delivery hostname `ky2khlqdf7qdznac.onion` is a fixed historical target, while the committed contemporary host-name corpus offers a secondary, explicitly **non-exhaustive** external look-up. The original stage11 and p56 materials provide the Tor context; none names a hash of the numerical panel, a modulus, or a particular grid-to-Base32 operator.

Four finite, declared readings are tested without language scoring, source-order retuning, unknown-page cribs or invented addresses:

1. Standard SHA-1, first eighty bits then RFC4648 Base32, over all **256** original bytes in printed order.
2. The identical operation over the **76** original clockwise exterior bytes, selected by the parable's 'circumferences' phrase.
3. The identical operation over the remaining **180** original row-major interior bytes, selected by 'within'.
4. A more literal direct 16-cell reader: start at the one-based **13th** clockwise exterior cell, take sixteen consecutive byte values and select the corresponding standard Base32 character by the low five bits. This fourth reading is visibly **lossy** and not a claimed reversible cipher.

The standard v2 Tor service address is derived from **SHA-1 of its RSA-1024 public-key DER**, so readings 1–3 are strictly *hypothetical byte-blob-to-address operations*. They do not constitute generation of a real host's identity key. Their strongest unsupported premise is that the manuscript chose these blob boundaries as material to hash. Reading 4's unsupported premise is the low-five-bit projection.

## Original-source result and external receiver

| Source-fixed reading | Exact 16-character candidate | Source-matched first-party host? | Match in recovered period host corpus? |
| --- | --- | --- | --- |
| SHA-1 of full 256-byte panel | `bcjuvasvlwkakqiy` | No | No |
| SHA-1 of clockwise 76-cell exterior | `z4auimwpz54soxx5` | No | No |
| SHA-1 of row-major 180-cell interior | `7qblu5rrapgmaf6v` | No | No |
| Exterior cell13, sixteen values modulo32 | `mqtmsbdotybly5yy` | No | No |

The 16-source-byte direct reader consumes the exact values **[76,80,51,108,82,65,35,206,115,184,193,171,152,189,248,248]**. The period corpus `resources/external/2014-09-stage11-period-onion-hosts.txt` contains **3,173 distinct syntactically valid Tor-v2 labels** after removing malformed names and duplicates, and none equals the four results. Crucially, **the corpus does not contain even the independently known authentic `ky2khlqdf7qdznac`**, so absence from this list is weak archival coverage evidence; comparison to the first-party hostname is the stronger fixed-target negative. The computed candidates were also not surfaced by exact-string public web searches. None is authenticated as an actual onion host.

The deterministic SFT `sims/lp2_p57_p50_torv2_locator_original_sft.cjs` reads only the original committed numeral-table source and contemporaneous host corpus. It verifies the source SHA-256, 76/180 geometry, exact `LP3lRA#` seven-byte source fragment, two independent standard Base32 positive vectors, all four address outputs, and both external-hit predicates. It can be run read-only with Node.js 22 on Windows or other platforms.

## Decision and necessary new evidence

**Retire these four specific blob-to-Tor-v2-address readers.** They supply no historical source hit, no address that can carry an authentic payload, and therefore no operation to test on original unknown rune ciphertext. Do not rescue them with arbitrary source suffixes, alternate SHA inputs, permutations, or bit shifts. This is a small actual typed-locator exclusion, not a denial that the numeral panel may encode a URL, a key identifier, a missing document or a different binary object.

The issue's operative unfilled dependency remains a **Cicada-authored address-selection instruction or an independently dateable authentic external payload**. A future matching external URL must identify the actual full archived bytes and apply one unmodified reversible receiver to both the >=150-rune p49/p51 flank and an independent unknown section. Without such an operand, adding table transforms only generates syntactically plausible addresses.
