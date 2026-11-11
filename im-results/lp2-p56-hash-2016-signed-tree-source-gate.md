# Solved p56 deep-web hash: 2016, original LP2 pages, and historical archive candidates

**Outcome:** no known preimage recovered. Source-fixed SHA-512 comparison only, tested on the original bytes in [successful CI run 42972458234](https://github.com/FlareZ123/liber-primus/actions/runs/42972458234). The existing unknown LP2 plaintext and deep-web destination remain unsolved.

The independently solved LP2 p56 prints the 64-byte deep-web digest `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. An authentic signed 2016 clue returns the player to Liber Primus and supplies a visible tree in a 563×569 JPEG, matching the prime-summed p32 11×11 rune axes. The image's authenticated 1,136-byte OutGuess message also equals the p32 middle 5×5 ring sum. That is a source-visible reason to ask whether the 2016 material finally supplies a direct preimage to the earlier hash. It does **not** establish that 2016 is the hash target, nor select a different digest than SHA-512.

The [standalone SFT](../sims/lp2_p56_hash_signed2016_original_sources_sft.cjs) hashes exactly nine frozen source interpretations: the signed 2016 JPEG file (**26,342B**), its extracted signed ASCII (**1,136B**), original LP2 illustrated p14/p32/p55 JPEGs (**436,699/362,637/614,928B**), the 2016 cleartext as originally extracted (**270B**), OpenPGP canonical CRLF cleartext (**287B**), decoded RSA signature packet (**543B**) and its exact MPI (**512B**). The known SHA-512 `abc` test vector authenticates the operation before checking all original inputs. None equals the full solved p56 digest.

Three illustrative source SHA-512 results:

- Signed 2016 JPEG: `f4ac5cb8e0a177756d4ef794287d662465a8d30e04d1fd1a133f3575e40c3622e5e811099cc81fc6afe204bb9d4282a29e033646e068df495a51186751ac7be2`
- Signed OutGuess ASCII: `d5871cd2f42910c72bf8ff2d9599776173c2e5e34859810633ce3cb8b80d2b7bd864e67bb6b0794a3600a304d4e68c358f4213ff128f953dd02df4746f375262`
- Original p32 scan 49.jpg: `2941e1b34c502ba4c24b0c2005c4c08cf9dadcc4ff7a21196f4bac15d728a141f2cc4e6e8ea4168e185ed3a7ce31d8cb459e5312da0c98f8f1e449cfb05456c3`

The exact equality fails for all nine. Do not expand this into arbitrary URL concatenations, keyed hashes, guessed encodings or more hash families without a historically sourced rule. The 2016 tree might still be a navigational image, password selector or key source; this test only excludes these specific immediate SHA-512 preimages, not a historical Tor resource whose bytes are missing.

## Expanded historical archive preimage gate (2026-11-11)

The same target digest was compared against additional **source-fixed exact byte strings**, rather than arbitrary URL constructions or guessed encodings. No candidate matched.

- **Original LP2 images:** all 75 JPEG entries in the local `liber-primus-jpegs.zip` archive were hashed as raw bytes. The archive SHA-256 is `094f3f8bc508159bda033482706a2d9bf516c8b8a324d87d41c5ee3696c075ea`; the entries total 52,248,065 uncompressed bytes. No image equals the p56 digest.
- **2012–2014 archived pages:** raw HTML/text snapshots from [`neuroretransmit/cicada` commit `ade9a02`](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3), covering the 2012 countdown, location, whitespace and onion pages; 2013 first/second/third-onion pages; and 2014 first, second, fourth, fifth, sixth and seventh-onion material. The 2014 `512.txt` was tested both as its exact text and as the decoded 256-byte payload. The stage11 decimal sequence was also tested as raw text and as byte values.
- **2013 audio-stage outputs:** `2013/03/gematria-primus.jpg` from [`rtkd/iddqd` commit `f2267b0`](https://github.com/rtkd/iddqd/tree/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023), plus the decoded Twitter PNG, Gematria JPEG and ISO splash PNG from the same pinned `neuroretransmit/cicada` archive. None matches.
- **2014 page and image candidates:** stage02/03/04/05/10/11 HTML, the stage03/04/05 512-hex payloads (each tested as ASCII hex and decoded bytes), stage07 magic-square text, stage11 decimal data, the final signed message, six known onion hostnames and their canonical HTTP URLs, plus the magic-square, onion-4-runes, onion-6-welcome, stage04 OutGuess and stage02 1033 images from [`krisyotam/cicada3301` commit `76d3ee8`](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469). No match.

Text candidates were hashed as their exact archived UTF-8 bytes; images and the LP2 JPEGs were hashed as raw binary. The standalone JavaScript SHA-512 implementation used for the archived text candidates passed the standard `SHA-512("abc")` vector; the LP2 ZIP comparison independently used Python `hashlib.sha512`. This excludes only the exact archived representations listed above. It does not exclude an unarchived hidden-service response, an earlier/later page state, or a different source-prescribed serialization. The intended page and destination remain unresolved; do not widen the search without a new historical selector.
