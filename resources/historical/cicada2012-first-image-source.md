# 2012 first-image source artifacts

These are preserved source witnesses, not interchangeable byte copies.

- **cicada2012-first-image.jpg** is the 29,279-byte archive mirror of the original Imgur image identified in Max Bernstein's 16 March 2012 post as http://i.imgur.com/1CcV1.jpg. SHA-256: 870353b8fbe4d1dd83fdbfc61b07d80213bab035526d3e5fd6a43f7d77db1ead. Raw SHA-1: 906d8b316b70625c96cb659b745eacdc17dbca1b. Git blob SHA-1: 467a24a6f70bb589a994fd73ee37b6f9c7a827f8. It retains the 61-byte post-EOI suffix and the JPEG coefficient stream used by the historical OutGuess extraction.
- **cicada2012-first-image-bernstein-copy.jpg** is the 27,517-byte image embedded in the archived Bernstein blog page. SHA-256: 72a1fd406da308cd61935fb116f2d73ea5cc008122518a23c9725f6ae1537029. Git blob SHA-1: 2cf04f28a98a833e249defdf31d27a8c4664621d. It is a distinct JPEG encoding: same 509×503 dimensions and identical DQT payloads, but different DHT payloads and no post-EOI suffix. Do not substitute it for the byte-pinned carrier or assume its OutGuess coefficients are identical.
- **cicada2012-outguess-decoy-m9sYK.jpg** is the image reached by applying ASCII Caesar −4 to the primary image's suffix. SHA-256: 47c2891c7b282f2e5fc5f5af65cf66935a1161ebc9518533e90189d0e64147d7. Git blob SHA-1: 0c746eff9331b236077ae77dc962c25ff199d7f4. Its visible text says the route is a decoy and explicitly hints that the message must be guessed out.

## Provenance and limits

All three files were copied byte-for-byte from cicada-solvers/The-Complete-Cicada3301-Archive at commit c3127e0e9eb5afbb582d37988d6369fe38429238. The archive paths are:

- 2012/additional media/images/1CcV1.jpg
- Archive/Old Sites/bernsteinbear.com blog cicada/3301 - Max Bernstein_files/1CcV1.jpg
- 2012/additional media/images/m9sYK.jpg

The archived Bernstein HTML page at the same commit records article:published_time as 2012-03-16T13:26:20+00:00 and identifies the original Imgur URL. The earlier ClevCode write-up was initially published 2012-01-13 and independently documents both the appended 61 bytes and OutGuess 0.2 extraction. The direct 4chan upload has not been recovered as a separately hashable byte source; call the primary file a byte-pinned archive mirror consistent with contemporary first-person reports, not a cryptographically authenticated 4chan download.

The matching DQT tables in the Bernstein copy do not prove identical quantized DCT coefficients. Its missing suffix and different Huffman tables make it a visual/chronological witness only until a coefficient-level comparison is performed.
