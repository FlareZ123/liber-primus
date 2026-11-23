# Original p55 base29 words tested against historical 2014 RSA-OAEP private key

**Agent5 · 23 November 2026 · isolated, source-fixed cryptanalytic gate.** This tests one historically concrete signed Cipher mechanism plus one genuine visual/textual instruction. It recovers no unknown-page plaintext, secret-key material or final Cicada destination.

## Upstream human solve-path premise

In January 2014 the first Cicada onion `auqgnxjtvdbll3pv.onion` actually distributed a [PGP-signed RSA envelope](https://github.com/neuroretransmit/cicada/blob/main/2014/002-first-onion/README.md) that stated `e=65537`, a 130-decimal-digit **432-bit modulus N**, and `Crypt::RSA::ES::OAEP`. Contemporary solvers factored it into two 65-decimal-digit primes and decoded the next Onion address `cu343l33nqaekrnw.onion`. The full numeric factors are fixed by that archived solving work; the original first-party *public* key and padding algorithm were stated before Liber Primus appeared.

Original LP2 p55 (source `72.jpg`) has exactly **76 physical rune symbols**, so interpreting its consecutive native zero-based GP29 rune indices as one big-endian base29 integer yields a **369-bit integer < N**. Unlike a four-by-64byte alleged RSA-block reading of the p50 table, this is an entirely legal original-length RSA ciphertext representative. There is no manuscript instruction saying to use old RSA keys on p55, but doing so is an inexpensive bounded literal test.

The *solved* adjacent p57 explicitly says to **“SHED OUR OWN CIRCUMFERENCES”**. That makes the already-established p55 word-shell interpretation a second meaningful original receiver: the 16 p55 complete page-local words plus a one-rune carry fragment from p54 have **43 genuine inner runes**, **32 complete-word exterior runes** and the **one carried rune**. Keep the 43 word interiors (about 209 bits) as one possible RSA ciphertext number. The 33 rune outer/carry channel serves as an independent control (about 160 bits). Neither byte padding nor numeric orientation was adapted to output.

## Frozen native-source RSA test and exact result

Read physical p55 rune order through `lp2-transcription.txt`, asserting all **76/76** characters agree exactly with `lp2-corpus.json`. Preserve printed full-word divisions, skip typesetting line ends, and convert precisely three source-selected sequences to **big-endian base29 integers**:

- The entire original 76-rune page.
- The complete printed-word interior, 43 runes, dropping the first and last rune of each complete local word.
- The 32 original complete-word exteriors plus the 1-rune carried p54 suffix, 33 runes (source-defined complementary control).

Decrypt each as exactly **one numeric RSA block**, using historical private `d = e^(-1) mod ((p−1)(q−1))`. The public modulus has byte size 54; left-pad the decrypted raw representative to exactly 54 bytes and try precisely the **historical SHA1 OAEP** unpadding under Node's standard crypto implementation. All three original ciphertext integers are valid representatives below N, but their RSA outputs fail the mandatory leading zero-byte OAEP format.

| Original p55 channel | GP runes | Cipher integer bits | First decrypted raw bytes | OAEP SHA1 valid |
|---|---:|---:|---|---|
| Whole unchanged physical p55 | 76 | 369 | `94 1a e5 13 8d a3 6a 3e` | **No** |
| Literal printed-word interiors | 43 | 209 | `72 b9 91 10 4f 2c f0 7c` | **No** |
| Literal exterior + carry control | 33 | 160 | `44 3c e2 c4 5c 37 fa 87` | **No** |

The raw 54-byte results also contain only 24, 27 and 20 strict printable ASCII bytes, respectively, with no coherent plain message. Even ignoring OAEP, the direct historical raw RSA inverse yields no obvious plaintext. This excludes exactly these two visible p55 source divisions under the 2014 first-onion RSA key; it cannot exclude arbitrary other paddings, alternate inputs, encrypted binary material, or any separate key.

**Positive:** the test re-creates the authentic 432-bit historical RSA private/public key objects, encrypts a source-familiar six-byte ASCII phrase `AN END` under **SHA1 OAEP** (54-byte output) and successfully decrypts it without any manually coded padding routines. Independently verifies a direct (x^{ed}=x\pmod N) numeric plant. The planted OAEP raw representative has the required leading `00` byte; all three original p55 candidates do not. The positive proves this actual implementation accepts correctly OAEP-encoded content under this unusual 432-bit modulus.

## Reproduction and next decision

[Read-only Node22 CommonJS original-source SFT](../sims/lp2_p55_2014_rsa_native_original_sft.cjs) includes the 2014 signed modulus, preserved contemporary private factors, fixed 2014 OAEP-SHA1 syntax, original p55 word source parsing, an **exact corpus-vs-transcription assertion**, and the native positive. It was executed and passed on **Windows 11 Node22**: [GitHub Actions 45191223186](https://github.com/FlareZ123/liber-primus/actions/runs/45191223186).

**Decision:** no authentic unknown p55 plaintext under the direct 2014 private RSA inverse. The ordinary source p55 76rune ciphertext fits N, so the failed OAEP padding and nonprose raw output are substantive, unlike a trivial length mismatch. A new p55 RSA route needs an *independent* manuscript instruction naming a different input serialization, an additional operation, or a source-supplied key, plus a recoverable plaintext/holdout. With no such input, avoid further RSA block/orientation scans.
