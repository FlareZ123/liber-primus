# Prime-valued 2016 tree image dimensions as a textbook RSA key: direct p32/p55 gate

**Agent 19, 15 November 2026. Result:** an independently selected *candidate source key* yields an exact, bounded negative on the two physically tree-associated LP2 pages. **No unknown plaintext, historical RSA instruction or cipher key was recovered.** This is one directly testable historical-mechanism transfer; further RSA key hunts would require new first-party clues.

## Human-visible route, and its weakest assumption

The preserved 2016 Cicada image `resources/historical/cicada2016-4gq25.jpg` has exact dimensions **563×569 pixels**. Both are prime. The manuscript's physical **p32** has a tree illustration and **121 runes**; a prior original-page numerical study noted that its GP-prime-valued first row and first column in an 11×11 reflow sum to these exact dimensions. Physical **p55** shares the 2014 p32 tree artwork and has **76 runes**, a multiple of four. The signed 2016 message instructs solvers to use the book's words/numbers as map/direction. Earlier verified Cicada rounds used **RSA**, including exponent **65537** in a 2014 challenge.

Those facts suggest a finite, human-computable alternative to the extensively tested additive and Hill-square ciphers: treat 563 and 569 as the two factors of a small RSA modulus; decipher the visually matched tree pages as grouped GP29 numerals. **This is a proposed operation, not a creator-authenticated one.** The p32/p55 tree raster is *not* the same stock image as the 2016 signed oak; that earlier same-image claim was explicitly corrected in [the visual study](lp2-tree121-signed2016-source-gate.md). Small textbook RSA also differs from the actual historical 2014 **432-bit RSAES-OAEP** puzzle. No original source instructs a reader to multiply the two image dimensions or use unpadded RSA.

## Frozen arithmetic and exact original-input obstruction

Use the two first-party dimensions exactly, giving
- `N=563×569=320347`,
- `φ(N)=562×568=319216`,
- `e=65537`, the earlier historically used exponent,
- `d=e^(-1) mod φ(N)=160833`.

Treat consecutive unchanged original GP29 rune indices as big-endian radix-29 codewords. Since `29³=24389 < N < 29⁴=707281`, a simple reversible GP29 packing encodes **three plaintext runes as a four-rune ciphertext block**. Test the natural page start at index0 and the one-symbol phase control at index1. Also test three-rune ciphertext blocks, which fit under N but would have to decrypt back into three GP29 runes under a same-width code. Interpret ciphertext integers directly without modulo reduction (which would be lossy), arbitrary padding, key search or transcript editing.

| Original tree page | GP29 ciphertext block size | Phase (rune offset) | Complete blocks | Valid ciphertext values below N | RSA outputs representable in 3 GP29 runes |
|---|---:|---:|---:|---:|---:|
| p32 (121 runes) | 4 | 0 | 30 | **14** | 0 |
| p32 | 4 | 1 | 30 | **7** | 0 |
| p55 (76 runes) | 4 | 0 | 19 | **8** | 0 |
| p55 | 4 | 1 | 18 | **8** | 1 |
| p32 | 3 | 0 | 40 | 40 | **3** |
| p32 | 3 | 1 | 40 | 40 | **2** |
| p55 | 3 | 0 | 25 | 25 | **3** |
| p55 | 3 | 1 | 25 | 25 | **2** |

The **first complete original four-rune block** on both p32 and p55 already exceeds N. Under textbook RSA an integer `C >= N` is not a canonical RSA ciphertext representative; reducing it modulo N would discard the original symbol information and violate the hypothesized direct reversible framing. Even for the 4-rune values that are admissible, none of the natural-phase p32 or p55 RSA decryptions fits the required three-rune output register. If a designer instead writes three-rune ciphertext blocks, all values are admissible but only **3/40** (p32) or **3/25** (p55) decrypted values in natural phase can be represented in three GP runes. These are *exact* invalid-codeword results, independent of any language model or cryptanalysis score.

## Native plaintext plant and reproduction

The standalone read-only [Node.js 22 CommonJS SFT](../sims/lp2_2016_tree_dimensions_rsa_original_sft.cjs) reads the preserved original JPEG and verifies its actual SOF0 dimensions, the canonical 29-rune original p32/p55 streams, and independently clear 95-rune p57. It applies textbook RSA encryption to the first **90 genuine p57 plaintext runes** in thirty three-rune groups, packs each resulting RSA integer into four GP29 runes, then decrypts and unpacks them, recovering **90/90 exact plaintext runes**. The synthetic ciphertext is 120 runes. This positive demonstrates that the bounded RSA decoder accepts a properly formed source-native plaintext and that the original rejections are due to incompatible source codewords.

**Decision:** retire **literal 563×569 textbook RSA applied directly to three- or four-rune blocks** at page-aligned clocks on p32 and p55. The dimensions can still be deliberate checksums or cryptographic parameter hints, and p32's 11×11 exact sums remain an original numerical observation. This test does not exclude a different, independently selected use of dimensions, a compressed or encrypted intermediate register, or missing original key material. It contributes no new decrypted page, authenticated key or destination. Further operations would need a separate first-party instruction fixing serialization and receiver before another scan.
