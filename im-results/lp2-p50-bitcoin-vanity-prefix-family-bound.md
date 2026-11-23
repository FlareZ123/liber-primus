# LP2 p50 fifth-column Bitcoin cue: conservative Base58 prefix-family bounds

**Agent 2, 23 November 2026. Classification: a new mathematical prioritization result for an existing source-derived clue, not a decrypted LP2 passage or an authenticated Cicada instruction.** The 56 original unknown pages remain unread. The exact original-source Bitcoin address and its missing-\`4C\` fifth-column selector were previously established in [the source report](lp2-p50-missing-l-secp256k1-address.md); they are **not** newly discovered here. This result quantifies how far the recognizable address remains unusual under two much broader literal address-prefix families, without treating a post-selected string as a discovery p-value.

## Why the question has a direct plaintext consequence

Original LP2 pages p49–51 (2014 scans 66–68.jpg) print 32 rows × eight two-character numerals. The visually observed contiguous high-value runs \`48→49→4A→4B\` and \`4D→4E→4F\` have the absent token \`4C\`; as *hexadecimal ASCII text* these are \`HIJK[L]MNO\`, conditionally selecting the **fifth printed column**. Ordinary base60 interpretation of its 32 source tokens gives one 256-bit scalar:

\`61f7669636e6566ac772adec530e360da9f5f63469949026b0c2463a90ee16b4\`.

As a standard 2014-available secp256k1 private key, its compressed point's mainnet Bitcoin P2PKH address is **\`1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK\`**. The visible \`Meanpng\` is suggestive of a typed \`MEAN PNG\` instruction, but no signed Cicada clue authorizes using Bitcoin, the compressed convention, a PNG source set, or a consumer on the encrypted text.

Earlier **direct** p50 key→AES/ChaCha, GP29, p55 ECDH, entire floral-image mean, whole-LP2 image mean, original 2014 image/triple mean, OutGuess, OpenPuff and PNG Average hypotheses did **not** decode any unknown-page prose. This study does not rerun those programs or assert that a meaningful-looking seven-letter substring itself constitutes decryption. It asks whether the source key is sufficiently structured to justify prioritizing a missing typed receiver rather than abandoning the Bitcoin branch as a commonplace short-word coincidence.

## Exact combinatorial bound, accounting for 32 natural candidate addresses

For a uniformly modeled 160-bit Bitcoin HASH160 \`h\`, the P2PKH Base58 numeral after stripping the leading zero version byte is

\`N=2^32 h + checksum32(h)\`, with \`0 ≤ checksum32 < 2^32\` and \`0 ≤ N < 2^192\`.

The checksum is deterministic, **not** independent. Instead of assuming uniformly distributed Base58 prefix letters, grant **any** 32-bit checksum and count every 160-bit \`h\` whose possible numeral can occupy the target Base58 interval. This conservative relaxation overcounts legitimate addresses. For any fixed seven-character Base58 prefix \`P\` after the mandatory initial \`1\`, a numeral with exactly \`L\` remaining Base58 digits is in

\`[P × 58^(L−7), (P+1) × 58^(L−7) − 1]\`,

intersected with the exact \`L\`-digit range and \`[0,2^192−1]\`. Each such interval intersects at most \`ceil(58^(L−7)/2^32)+1\` possible hash buckets. The executable uses exact BigInt arithmetic for all \`L=7,…,33\`; no Monte Carlo, assumed independent checksums or invented plaintext.

| Recognition family, first characters after the initial \`1\` | Conservative probability under one random HASH160 | Across **32** natural column/radix/compression variants (union bound) |
|---|---:|---:|
| Exact \`Meanpng\` prefix, **fixed before looking** | ≤ **1.145307 × 10⁻¹²** | ≤ **3.664982 × 10⁻¹¹** |
| **Any four Base58 characters** followed by \`png\` at positions 5–7 | ≤ **5.125262 × 10⁻⁶** | ≤ **0.000164009** |
| Any four characters followed by **any of ten** file extensions \`png,jpg,gif,pdf,txt,zip,asc,mp3,wav,ogg\` | ≤ **5.125262 × 10⁻⁵** | ≤ **0.001640084** |

The 32 addresses are eight printed vertical columns × two earlier considered radix readings × compressed/uncompressed public-key forms. **No independence of those alternatives is required** for the union bound, only a pseudorandom uniform-HASH160 marginal for each model under the null of random source keys. The exact \`Meanpng\` line is *not* an admissible discovery-wide p-value because the readable string was recognized afterward. The broader file-extension family is also chosen after observing \`png\`, and excludes other possible recognizers or arbitrary substring positions. Thus these are **conditional rarity/sensitivity calculations**, not estimates of the probability that Cicada intended Bitcoin or even of the full project-wide false-discovery rate. The source's eight-column shape and missing-L geometry constrain the opportunity count but do not establish the author-selected hashing algorithm.

## Cryptanalytic consequence and stopping decision

The result makes the literal \`1Meanpng\` observation harder to dismiss as an ordinary short four-letter word in a random output: even granting **all** four-character prefixes plus any of ten common extensions, a **leading** filename-like seven-character construction is uncommon under the stated random-key null. It remains **not authenticated**, since the algorithm and recognition class were found by exploratory research. Its evidential weight is stronger than a single uncalibrated arithmetic coincidence, but weaker than independently recovered original plaintext.

The actionable missing step is not another free-key or arbitrarily selected image-mean sweep. It is an **author-era source-selected PNG file, image operation, byte serialization, or authentic message specifying how this 32-byte column is to be consumed**. A worthwhile follow-up must freeze a real receiver before running the original ciphertext and demonstrate a complete plaintext segment with held-out transfer or a verifiable original external file. Without that operand, keep the Bitcoin key as a source-derived **candidate**, not a promoted LP2 decryption.

**Reproduction:** [single-file Node22 source and exact-null test](../sims/lp2_p50_bitcoin_vanity_base58_null_sft.cjs), reading only the original 256-byte table resource, deriving the actual compressed P2PKH address and asserting the conservative BigInt bounds. It was independently run under local Node22 against an exactly matching fifth-column replica; the committed script reads the full unchanged repo resource. 
