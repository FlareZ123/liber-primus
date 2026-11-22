# Repeated LP2 bookend words as a literal 2014 OutGuess password on both source pages

**Agent11, 22 November 2026. Original-image negative, four fixed passphrase/carrier tests; no authenticated plaintext or key.**

## Authentic source-selected operands and alternative interpretation

The *same exact six GP29 runes* `DJU BEI` terminate original LP2 physical **p27** and **p55**. Their two printed-word structure fixes one **literal passphrase with its space** (`DJU BEI`) and a second reasonable single-token spelling (`DJUBEI`). Both source-original JPEG carriers are correspondingly physical **p27 = archive scan44.jpg**, and **p55 = scan72.jpg**. Previous original-byte work [established the phrase](lp2-repeated-wordpair-structure.md) and [disfavored synchronized alphabet reuse](lp2-bookend-arbitrary-secret-alphabet-equality-invariant.md), but neither tests a passphrase across the two visually selected original carriers.

**Human mechanism premise:** Cicada demonstrably used OutGuess to conceal messages in original 2014 JPEGs; a repeated end-of-section phrase could be a password. The crucial weakness is that *no manuscript instruction identifies the phrase as an OutGuess password*, and the two original images are normal book pages, rather than overt 2014 steganographic carriers. The test is worthwhile as one literal four-input key/carrier combination, without letter shifts, page sweeps, language-score optimization or additional passphrases.

The maintained [original-JPEG keyed OutGuess runner](../sims/outguess_lp2_keyed_probe.cjs) pins OutGuess source commit `24810e14327c2bbeedeaadd3e24491f2a4425c02`, tests an authentic planted keyed payload and known 2014 default-key original controls, and calibrates each tested password on one generated JPEG explicitly containing no hidden payload. The [unchanged manual GitHub Action](../.github/workflows/lp2-outguess.yml) executes the exact CLI and preserves byte-identifying output diagnostics.

## Complete original results

| Full original source carrier | Literal password | Execution | Apparent valid header | Recognizable payload | CI |
| --- | --- | --- | --- | --- | --- |
| p27, scan44.jpg | `DJU BEI` | SIGFPE | No | No | [45032461546](https://github.com/FlareZ123/liber-primus/actions/runs/45032461546) |
| p55, scan72.jpg | `DJU BEI` | SIGFPE | No | No | [45032388413](https://github.com/FlareZ123/liber-primus/actions/runs/45032388413) |
| p27, scan44.jpg | `DJUBEI` | Exit0, 4207 bytes | Yes, seed4444 | No | [45032392469](https://github.com/FlareZ123/liber-primus/actions/runs/45032392469) |
| p55, scan72.jpg | `DJUBEI` | Exit0, 4207 bytes | Yes, seed4444 | No | [45032396373](https://github.com/FlareZ123/liber-primus/actions/runs/45032396373) |

The two opaque 4207-byte results have *identical* first32 bytes `5c116f10d1a2f7c475d0120453c1cbbe1411eebd1af318048c813d2fe32a4d5d`, identical last32 bytes, the same decoder-selected seed and length, and independently differing whole SHA-256 fingerprints:

- p27: `249a21588446174d87aa4ac0378bee92f95faf02aaa06b55c6d5d450c66c17cc`; 38.01% printable, 7.9605 bits/byte Shannon entropy.
- p55: `2a09b2fe206e34bcf1eef9c2c276c804aff4febd9dbd6891764ea893df5d412d`; 37.70% printable, 7.9469 bits/byte Shannon entropy.

The same real OutGuess program **also returns successful, internally consistent, high-entropy fake payloads from a known-empty synthetic JPEG under each of these literal keys**. The synthetic `DJUBEI` false-header result is 30,408 bytes, seed13852, and the synthetic `DJU BEI` false-header result is 62,443 bytes, seed35000. Each run independently verifies exact recovery of a planted 47-byte keyed OutGuess payload and authentic default-key messages from the original historical 2014 LP1 scans00 and08. A plausible header by itself is therefore not evidence of embedding. The four source outputs have no recognized OpenPGP, archive, image or readable text signature.

**Decision:** the source-bookend phrase in either of its two literal written forms does not yield an independently recognizable OutGuess payload on either of its two authentic, bookend-selected original LP2 page JPEGs. This is an exact narrow failed password transfer with authentic tool positives and a demonstrated empty-carrier false positive. It does **not** exclude a newly supplied source passphrase, external carrier, other steganographic algorithm or another intentional meaning for the repeated ciphertext words. Retire this direct OutGuess use unless an author-selected key or corroborating payload emerges.
