# 2013 COUNT word classes as one frozen LP2 ternary file

**Agent3, 18 November 2026, Director #1476. Decision:** The one specified, full-corpus, no-key ternary serialization is **opaque**. Its **574-byte** output has no supported typed file header, valid OpenPGP initial packet octet or intelligible native-GP plaintext. The original runes were not decrypted, and no authentic cipher/key/destination was found. This conclusion retires the **direct whole-register** consumer tested here; it does not rule out a different, independently selected 2013/2016 word-sum cipher.

## Why a contemporary solver might try it, and why the premise is weaker than it looks

The [surviving January 7, 2013 participant COUNT paste](cicada2013-count-AfndPJa0-original-response.md) gives GP-prime sums with **`+` for an ordinary prime** and **`*` for a reversible-decimal prime** (including palindrome 797). Its marker legend conflicts with a later participant reconstruction, and it is not a signed daemon transcript. The signed 2016 LP2 text refers to its **words** and **numbers** as a map and direction. Together, these nominate whole-word GP-prime sums as a public source object, but neither source specifies a trit-based byte format, reading clock or LP2 cipher inverse.

One minimal mathematical completion of the 2013 prime-category notation is **composite = 0, ordinary prime = 1, reversible prime = 2**. An [independently indexed first-onion participant transcript dated 7 January 2013](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/main/2013/additional%20docs/logs/all%20cosmos%20posts%20from%207th%20on%20the%20761%20song%20-%20full%20log.txt) (Pastebin XQ9rJSad, pinned in the [authoritative source ledger](../results/README.md)) now reports **`a=97*`, `b=61+`, `ab=158` with no suffix**, independently demonstrating the distinction between starred, plussed and unsuffixed participant-observed classes. The third class was therefore recognized in source-era notation, but the assignment of numeric digit **0 to unsuffixed composite**, along with **base-3 serialization**, remains a conjectural mathematical consumer. Neither surviving participant record is authenticated raw TCP daemon output. The competing explanation is that original ciphertext word sums yield such three labels without carrying any additional message.

## Exact source register and one readout

Read [all source LP2 physical pp0–55](../resources/liber-primus/lp2-corpus.json), containing **12,956 runes** and **2,896 complete words**. The reusable [word parser](../sims/lp2_word_pages.cjs) joins the **32 complete words that cross physical pages**; the original transcription has 2,928 page-local fragments. The test verifies each of the 55 rune-bearing source pages, rune by rune, against the canonical 29-symbol corpus; physical p50 has no runes.

For each complete original printed word `W_i`, let `S_i = Σ GPprime(r)` over all original runes in that word. Define exactly

- `d_i = 0` when `S_i` is composite;
- `d_i = 1` when `S_i` is prime but its reversed decimal digits are composite;
- `d_i = 2` when both `S_i` and its reversed decimal digits are prime.

Form the **single** integer `N = Σ d_i × 3^(2895−i)` in physical word order, with p0 first. Serialize N as its **minimal unsigned, big-endian byte string**. There is no scanned change of scope, orientation, trit labels, section resets, byte offsets, salts, passwords, compression settings, or language-ranked selection.

The source register and output are:

| Exact original field | Measured value |
| --- | ---: |
| Complete words / trits | **2,896** |
| Composite-sum word digits `0` | **2,292** |
| Ordinary-prime digits `1` | **393** |
| Reversible-prime digits `2` | **211** |
| Integer bit length | **4,590** |
| Minimal big-endian byte length | **574** |
| Byte Shannon sample entropy | **7.651275081389475 bits/byte** |
| Distinct byte values | **230** |
| First 16 bytes | `2c9453d3d63b10c3e80eca06d997f141` |
| SHA-256, all 574 output bytes | `d6da8d865bfe3d35244646e949962031446dbf50cc0f95364a3a47ffd3c347b9` |

The full 2,896-trit register, **unabridged decimal integer**, exact 1,148-hex-digit output and chapter-by-chapter category counts are emitted by the reproducer, rather than embedded in this human-readable report. No postprocessing is required to reproduce the digest.

The 574-byte output does **not** start with any of the full-width PNG, gzip, bzip2, ZIP, PDF, ELF, 7z, XZ, zstd, SQLite 3 or OpenSSL `Salted__` signatures fixed in advance. The first byte is **0x2c** (top bit clear), which is not a valid initial octet of a binary OpenPGP packet. Its resulting bytes do not themselves provide an authenticated instruction or recognizable native-language register. High byte entropy alone is not evidence of purposeful encryption: radix conversion of a long unstructured ternary tape can readily give opaque bytes. An unknown-format raw binary, standalone key without identifying information, or encoded payload is not *logically* excluded by a negative signature check; the artifact supplies no source-selected consumer to establish one.

## Independent native-GP controls and falsifiable outcome

The original solved LP2 p57 has **20 genuine printed words**. Under the same GP chart, `PARABLE` gives **449** (ordinary prime, digit 1), `FIND` gives **151** (reversible/palindromic prime, digit 2) and `LIKE` gives **184** (composite, digit 0); the solved p57 distribution is **18 / 1 / 1**. These prove all three digit classes can be realized by authentic, independently known source-native words.

For a constructive positive control, use those three solved-page words to encode the exact big-endian bytes of `PARABLE\n` as **40 base-3 digits**. Reading their GP-prime sum classes and serializing the resulting integer returns **8/8 source bytes**; the original p57 controls and every original ciphertext trit also round-trip exactly through their declared arithmetic encodings. This checks mechanical validity of the source-word map and serialization, while making no claim that mere round-tripping authenticates the cipher.

The [single-file Node.js 22 SFT](../sims/lp2_count2013_wordclass_ternary_sft.cjs) was run successfully against the unmodified shared original corpus using the existing Windows reusable runner: [CI run 44301651082](https://github.com/FlareZ123/liber-primus/actions/runs/44301651082), source-test job **success**. Exact numeric output and digest above came from that run.

## Cryptanalytic consequence and next decision

This direct ternary readout has a precise reproducible object, but **no independently identifiable receiver** and no recovered LP2 plaintext. The speculative third class and lack of an author-specified binary serialization are its primary weaknesses. For #1476, terminate this one finite model without reinterpreting composites, searching trit permutations, scanning alternative word boundaries, or claiming a high-entropy blob is a key. The 2013 prime-sum notation may warrant another operation only if a genuinely first-party source specifies a receiver or provides a typed intermediate; [Director #1474](https://github.com/FlareZ123/liber-primus/issues/1474) separately pursues the missing historical daemon output.

The broader [authoritative synthesis](../results/README.md) remains unchanged: **no original unknown LP2 page has authenticated plaintext or a complete decryption mechanism**.
