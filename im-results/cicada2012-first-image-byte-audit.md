# 2012 first-image byte and extraction audit

**Disposition:** the first image carries two known, intentionally selected channels: a 61-byte ASCII suffix and a 535-byte OutGuess message. Both belong to the documented 2012 solve path. The byte inventory finds no third JPEG metadata/comment container or further post-EOI payload in the preserved carrier. This is historical solve-path evidence, not an LP2 key or decoder.

## 1. Byte-pinned carrier

The preserved carrier is [the original Imgur image mirror](../resources/historical/cicada2012-first-image.jpg), identified by the archived 16 March 2012 Max Bernstein page as http://i.imgur.com/1CcV1.jpg. It is pinned from cicada-solvers/The-Complete-Cicada3301-Archive commit c3127e0e9eb5afbb582d37988d6369fe38429238, path 2012/additional media/images/1CcV1.jpg.

| Property | Value |
|---|---|
| File length | 29,279 bytes |
| SHA-256 | 870353b8fbe4d1dd83fdbfc61b07d80213bab035526d3e5fd6a43f7d77db1ead |
| Raw SHA-1 | 906d8b316b70625c96cb659b745eacdc17dbca1b |
| Git blob SHA-1 | 467a24a6f70bb589a994fd73ee37b6f9c7a827f8 |
| JPEG frame | Baseline SOF0, 8-bit, 509×503, 3 components |
| JFIF | 1.01; density units 0; X/Y density 1; no thumbnail |
| Header markers | APP0/JFIF, DQT×2, SOF0, DHT×4, SOS |
| Metadata/comment markers | No APP1/EXIF, APP2/ICC, or COM segment |
| EOI | One FF D9, marker offset 29,216 |
| Bytes after EOI | Exactly 61 |

The JPEG header segment lengths are APP0 16; DQT 67, 67; SOF0 17; DHT 31, 181, 31, 181; SOS 12. The JPEG stream ends at byte 29,218; the remaining 61 bytes are plain ASCII plus a final LF, not an image segment:

~~~text
TIBERIVS CLAVDIVS CAESAR says "lxxt>33m2mqkyv2gsq3q=w]O2ntk"
~~~

The Caesar cue selects an ASCII shift of −4 (the Claudian/fourth-Caesar hint). Applying it to the quoted token yields:

~~~text
http://i.imgur.com/m9sYK.jpg
~~~

The linked [m9sYK duck image](../resources/historical/cicada2012-outguess-decoy-m9sYK.jpg) says “WOOPS. Just decoys this way” and “can't guess how to get the message out.” This is a source-visible selector for **OutGuess**, not an invitation to search arbitrary steganography tools or passwords.

## 2. The second channel: OutGuess 0.2 on the original image

Two independently dated first-person 2012 accounts establish the intended chain:

- [ClevCode's 13 January 2012 write-up](https://clevcode.org/cicada-3301/) reports stegdetect as appended(61), shows the tail -61c extraction, and records outguess -r 3301.jpg 3301.txt. It identifies OutGuess 0.2 and reports Steg retrieve: seed: 228, len: 535.
- [Max Bernstein's 16 March 2012 post, preserved in the archive](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/c3127e0e9eb5afbb582d37988d6369fe38429238/Archive/Old%20Sites/bernsteinbear.com%20blog%20cicada/3301%20-%20Max%20Bernstein.html), identifies the first image as http://i.imgur.com/1CcV1.jpg, documents the −4 route, and records outguess -r final.jpg final.txt. The alias changes (3301.jpg, final.jpg, 1CcV1.jpg) refer to this first-image carrier in the contemporary accounts.

The paired archive extraction is preserved at [1CcV1.jpg.out](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/c3127e0e9eb5afbb582d37988d6369fe38429238/2012/additional%20docs/outguss/1CcV1.jpg.out). It is exactly 535 bytes, SHA-256 7dbf268b1b356527cf4a2dc105c0dd1f6d2d703291dda24dd9e98e22851d6f40, and contains the Reddit destination http://www.reddit.com/r/a2e7j6ic78h0j/, a 76-entry line:word book code, and the closing “Good luck. 3301”. This matches the contemporary report's stated length and destination. The archive output is source-attested and byte-pinned; **a fresh OutGuess 0.2 binary execution has not yet been run in this invocation**.

The exact historical tool source is pinned at [OutGuess 0.2 commit e9967c7c5788b7e5b8d3aeec238766ea60bf8a12](https://github.com/resurrecting-open-source-projects/outguess/tree/e9967c7c5788b7e5b8d3aeec238766ea60bf8a12). The manual-only workflow [cicada2012-first-image-original-manual.yml](../.github/workflows/cicada2012-first-image-original-manual.yml) builds that source, runs the historically reported outguess -r command on the pinned carrier, checks seed 228/length 535, and compares the output byte-for-byte with the pinned archive extraction. It also checks the 61-byte suffix and −4 URL. The workflow is deliberately manual; it has not been dispatched here.

## 3. Independent copy and source limits

The Bernstein page's embedded image copy is preserved separately as [cicada2012-first-image-bernstein-copy.jpg](../resources/historical/cicada2012-first-image-bernstein-copy.jpg). It is 27,517 bytes, SHA-256 72a1fd406da308cd61935fb116f2d73ea5cc008122518a23c9725f6ae1537029, still 509×503, and has no post-EOI suffix. Its DQT payloads are byte-identical to the carrier's, but its DHT payloads differ. It is therefore an independently dated visual witness, not a byte-identical extraction carrier; equal quantization tables alone do not prove coefficient identity.

The January ClevCode page links its own 3301.jpg, but that direct image URL was not retrievable in this run. The exact 4chan upload has likewise not been recovered as a separately hashable object. Accordingly, the 29,279-byte file is a high-confidence byte-pinned archive mirror consistent with the original Imgur URL, both 2012 first-person accounts, the 509×503 dimensions, and the reported 61-byte/535-byte extraction signatures. It is not claimed to be cryptographically authenticated against the original 4chan attachment.

## 4. Conclusion for the LP2 research program

The original first-image chain is now bounded:

1. The appended 61 bytes give the Caesar/Imgur decoy.
2. The decoy's wording selects OutGuess on the original first image.
3. OutGuess 0.2 yields the 535-byte Reddit book-code message.
4. The later book/telephone/dimension sequence produces the already-solved 845145127.com historical route.

No third metadata/comment object or additional trailing payload is present in the preserved carrier. The recovered 535-byte message is an already documented 2012 stage, not a direct reference to an LP2 rune operation, key, or plaintext. **No LP2 transfer task is justified.** The only remaining reproducibility hardening is to dispatch the pinned manual OutGuess 0.2 workflow and confirm its output against the archived 535-byte file.

## Reproduction

Run the byte audit locally:

    python3 sims/cicada2012_first_image_byte_audit.py \
      resources/historical/cicada2012-first-image.jpg \
      --bernstein-copy resources/historical/cicada2012-first-image-bernstein-copy.jpg \
      --decoy resources/historical/cicada2012-outguess-decoy-m9sYK.jpg

Then dispatch the manual workflow “Cicada 2012 first-image OutGuess 0.2 reproduction”. It is source-pinned and compares the output against the archive at commit c3127e0e9eb5afbb582d37988d6369fe38429238.
