# p56 direct-hash gate: 2014 onion-chain candidates

**Decision, 26 November 2026:** no direct p56-digest preimage was found in (a) a period-adjacent public directory of 3,204 v2-era onion hostnames under the tested string serializations, (b) the exact archived 2014 Stage11 HTML delivery index, (c) the exact archived 2014 fourth-onion page bodies and associated payloads, or (d) the source-pinned 2014 Onion6 image container and its four exact JPEG streams under SHA-512 and Whirlpool. This remains a bounded negative only. No unknown LP2 plaintext, key, complete cipher, or destination was recovered.

## Target and test rationale

Solved LP2 p56 prints the 128-hex target:

**36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4**

The 512-bit length makes SHA-512 the strongest direct candidate. SHA3-512 and BLAKE2b-512 were also tested as available 512-bit digest families. The tests below hash exact source objects; they do not search arbitrary substrings, salts, concatenations, or canonicalizations.

## 1. Historical onion-address directory

A 20 August 2014 [Tor Stack Exchange question about collecting onion addresses](https://tor.stackexchange.com/questions/3896/where-i-can-find-export-or-download-the-biggest-list-of-all-onion-addresses) was answered by Kenorb. Its 15 September 2014 answer edit links to the GitHub list and general directories. In the kenorb/cicada-2014 fork, commit [2e0cb5ace2f4172cda402489201bbbe27dd19999](https://github.com/kenorb/cicada-2014/commit/2e0cb5ace2f4172cda402489201bbbe27dd19999), dated 15 September 2014 18:23:41 UTC, adds stage11/scripts/onions-list.txt with the commit message “Added database of onion addresses (See: http://tor.stackexchange.com/q/3896/1880).” This file is **not present in the upstream micheloosterhof/cicada-2014 tree**; it is a participant/community addition, not a Cicada-authenticated resource.

The adjacent hash_finder.sh script hashes each exact line with printf before SHA-1/MD5, so the source-supported input form is the full hostname including .onion, without a newline. The extra bare-label and HTTP(S)-root forms are limited canonicalization controls, not historical instructions.

The source-pinned list is **73,692 bytes**, Git blob SHA-1 **8722ee2edd749f01b4fffbd91053fac5a8ca0ff3**, with **3,204 unique entries**. Of these, 3,172 are valid lowercase 16-character v2 onion hostnames; 32 are noncanonical or legacy entries. Neither known LP2 distribution hostname (ky2khlqdf7qdznac.onion, ycwtiskrspensdkz.onion) occurs in this directory.

The reproducible [Node 22 SFT](../sims/lp2_p56_onion_directory_hash_sft.cjs) verified the downloaded Git blob and positive SHA-512 abc test vector, then tested every list entry under:
- exact hostname including .onion;
- bare 16-character label;
- http://hostname/;
- https://hostname/.

The result was **38,448 hashes, zero matches**. Whirlpool was requested but not exposed by the runner's crypto provider and was **not tested**. The first manual workflow run [43689956871](https://github.com/FlareZ123/liber-primus/actions/runs/43689956871) completed successfully.

## 2. Exact archived 2014 Stage11 index

The original participant archive's stage11/ky2khlqdf7qdznac.onion/index.html is preserved byte-for-byte as [resources/cicada2014-onion7-index.html](../resources/cicada2014-onion7-index.html). Its 1,640 bytes match Git blob SHA-1 **303db130705f0ef9be2a738f4336d5cfcebde80c** from original archive commit [6c3421a4d245596e403c88e037509d162a2afd17](https://github.com/micheloosterhof/cicada-2014/commit/6c3421a4d245596e403c88e037509d162a2afd17), dated 11 May 2014 18:33:43 UTC. The SFT asserts all **58** image references appear in ascending order, 0.jpg through 57.jpg.

The exact unmodified HTML bytes were hashed under SHA-512, SHA3-512 and BLAKE2b-512. None equals the p56 target:

| Algorithm | Digest of exact 1,640-byte index HTML |
|---|---|
| SHA-512 | 83e50c118edb70dc34c9c760e332830a066b82006ebbbdcc7347b818d1961a571f32ef5a3717e98e282754d4a004dc0f7f0d99fb3824bb1b281a947c7ba70a31 |
| SHA3-512 | 0ab98b6b93baac507b6a5743e5b3ae3a0f8bf582af630c74b2573016f21271b7e22a223864f1349740d5b44e72f8fda9355275664b519358ec6b584b4f1c3442 |
| BLAKE2b-512 | 2952caa794176de3fe6f74fb350e3d9c6eed6aa794d4ee3d79570d2dc4e55b0cf2bfc06d19dbfcf600fbd06df7efced41e321e30ae2ef8bd96c26fa6e0651e41 |

The exact-page test is in [the source-pinned SFT](../sims/lp2_p56_stage11_index_direct_hash_sft.cjs), added as a second step to [the manual-only workflow](../.github/workflows/agent3-p56-onion-directory-hash-sft.yml). The combined run [43690486989](https://github.com/FlareZ123/liber-primus/actions/runs/43690486989) passed all assertions and found no match.

## 3. Exact 2014 fourth-onion page and payload

The archived [2014 fourth-onion directory](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/006-fourth-onion) contains an original page, a 256-byte hex payload, a post-downtime page body, and its gzip/decompressed payload. These are plausible historical deep-web objects to compare with p56's instruction to find a page matching the target. The source is pinned to commit **ade9a02889ef8acbc8cde8edbfd0a785c369f4c3**.

The SFT verifies each downloaded object's Git blob SHA-1 before hashing. Exact object results:

| Object | Bytes | SHA-512 |
|---|---:|---|
| original page HTML | 614 | 170e861c61ceed7acdcf6a9e0c46c654a4b6b4b2fd3d5d5e7c604072e167454876f9bafb73461f897a3c8fc2506da9451d61b518cbe816eefd7b3fad0d6f5969 |
| original 256-byte hex text | 512 | f9ade05de913286358bc4bcbeb600413c4a10afdc24f088f2d113f9bcf6f411f73b1fd453487b9111e49fcea90b3b988801151b1fe206a5cb251335cef7466b3 |
| original hex decoded | 256 | ba7474bde659c5fa6008eae27f8ac9b0d5537eac6237771e3f5c9b6e2a1555f51ada4985ee6e1d15266be58e9e536f6d2b7b47732a4492c863f0ee21eba5b4b8 |
| post-downtime page body | 5,149,029 | ac7619fa25bf9a3bf3c04f2558e4f1485e0476b563f2add2ce5faf9d11d24484046dcca7ac8642503b368dfd469b88b5517fe7076d1757d59be856bb952d3092 |
| decoded gzip | 2,532,309 | d66482d597434df81cfc65072f30444945b9bb80ca1ac36245df52456e5fb3a036be25325f458deb0b96e987b9cc48b788da16e1fa326e2295dd242f4822bcbb |
| decompressed payload | 3,010,703 | 37b0f7ce2a3d6ce297c53cfeffae08f9dc10c80c5cb7808cf28c9f1b448183b94e4a461f5eb0763974193efeb0d96ed980ab1526d1c4174c908adaad51378218 |

The archived gzip decompresses byte-for-byte to the archived decompressed payload. No exact object, original hex-decoded bytes, or decompressed payload matches the target under SHA-512, SHA3-512 or BLAKE2b-512. The post-downtime page body contains no long contiguous hexadecimal payload. The complete reproducible check is [the Node 22 SFT](../sims/lp2_p56_avowy_fourth_onion_hash_gate.cjs); [workflow run 45557582874](https://github.com/FlareZ123/liber-primus/actions/runs/45557582874) completed successfully, verified all five source Git blobs, and found **zero matches**.

## 4. Source-pinned 2014 Onion6 image container and its four JPEG streams

Agent44 identified the archived 2014 Onion6 `onion6.jpg` as a candidate for the p56 digest. The exact source is pinned to `krisyotam/cicada3301@76d3ee8c762f60025822c8c05edbf31351636469`; its 4,240,957 bytes have Git blob SHA-1 `369ee0a0eb59b999a5f9c0574d306fb78fa0b9ec`. The source bytes are identical to canonical `resources/liber-primus/10.jpg` (SHA-256 `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`).

**Important structural correction:** this is not a two-JPEG file. The canonical archive README and `sims/jpeg10_concatenation.cjs` identify four concatenated JPEG streams with no padding: LP1 image 10 (the first 754,662 bytes), then exact copies of `11.jpg`, `12.jpg`, and `13.jpg`. The exact offsets and lengths are:

| Object | Offset | Bytes |
|---|---:|---:|
| LP1 image 10, first stream | 0 | 754,662 |
| LP1 image 11 | 754,662 | 712,733 |
| LP1 image 12 | 1,467,395 | 703,428 |
| LP1 image 13 | 2,170,823 | 2,070,134 |
| Complete `10.jpg` container | 0 | 4,240,957 |

The source-pinned workflow verifies the original Git blob, canonical archive identity, all four stream boundaries, and exact equality of the final three streams to their separately archived files. It hashes the complete container and each individual stream under SHA-512 and Whirlpool. **0/10** candidate-object/algorithm combinations match the p56 target:

| Exact object | Bytes | SHA-512 | Whirlpool |
|---|---:|---|---|
| Complete `10.jpg` container | 4,240,957 | `8afd4f1d8264a8f904c2a92425cbef6f87c107d4b256c3641000c6b76e6a151287d4fc332f545950cfe96e759690277f44d09d67907d59a8dfe4d7c8d5c85f51` | `1d361765590b17f1cbf4091933459c6a815b95e1d7ce4aea692b10311faad83607659f159c02afd4d5d71c9b6a15cc134267e950be3fe37366078094f819aafe` |
| LP1 image 10 | 754,662 | `073a6fc1b2d720f10edadbb04e543744a0bee0110458cd434109a49f69f6838470ac1f3842dea62934a3b4128968886cf75caf5821e594cb37480481423aaf77` | `b9071af66a57baa39695eb4511c567eb5d9d0ec17fc46f1982aba77ddc66a952f58f81ca70b99f7dfc7d5b3b484c8ba742365eba7f29dfa435487edd423fa94c` |
| LP1 image 11 | 712,733 | `ed95c1d41eaed019fd18d8decd2cc55f85930a863fea3bbf9b1440e068dd58fa0ea59aad4d7a7575633710526ab4391747d08c1f18e7020acc96fde56af42b47` | `129c70f92cc89328df9cd94cc97e1eba5f3ae54bc3b8475042ad7018fc36390cc0be4e01feaa1ba216e6616c7f461e9dd76dc6e0a958cadeef377aa4bb0f1681` |
| LP1 image 12 | 703,428 | `d83e1269dfc2552617af75adc400954723f4eed74f89f474e216888f2eaaa284aec102de926aceafd4df244f76bc51d619f2c733f953205923fd31f1aaa4d852` | `c8d68fd5a02026ad8dc88bbdb9ce074e8e554ecf391618c6a2e42b2bfbe6223c112aac28507e7f777131334bcf72c6f17fc0ea23eef62dced19f6087e961192d` |
| LP1 image 13 | 2,070,134 | `a633fec9d03cc62ceb87a402ca2366b8e8206cd8d7c9a9c277080173ffde78ad69e157caccb8e599c7c90a698bbb616989dcf776215a3cf1f7d3c0d5574f418b` | `b45e2dbf80778dfbb852343d3192b0379c605b93c7e94bbb5a12e1a3ecc172f4af9e1784515321740c2f8dfb0f87f8991de459cde3f4c4d153609a140afda368` |

The full source/component test is [the updated Node 22 SFT](../sims/lp2_p56_2014_onion6_hexdump_image_hash_gate.cjs), run in [workflow 45798842094](https://github.com/FlareZ123/liber-primus/actions/runs/45798842094). Raw reproducible output: [`lp2-p56-onion6-jpeg-component-hash-gate.json`](lp2-p56-onion6-jpeg-component-hash-gate.json).

## Scope and next decision

These results exclude direct hashing of the **3,204 listed host strings** in the four specified representations under the tested 512-bit algorithms, the exact archived Stage11 HTML body, the exact archived fourth-onion page/payload objects listed above, and the complete source-pinned Onion6/\`10.jpg\` container plus its four exact JPEG streams under SHA-512 and Whirlpool. They do **not** test the contents of every onion service, an unlisted/private service, original live HTTP entity bytes that were not archived, other serialization, salts, concatenated operands or an unidentified page body. The Stage11 index and fourth-onion files are archival participant-repository objects, not independently authenticated original live HTTP responses.

The public onion directory is not a Cicada artifact and omits the known LP2 distributor; it is therefore a weak coverage set for a potentially private target. The exact Stage11 index and fourth-onion objects are plausible but unselected page candidates. None of these negatives changes the authoritative conclusion that p56's target preimage and hashing contract remain unknown. Keep this as intermediate evidence; do not widen into arbitrary URL, whitespace, salt or hash-family enumeration without an independent historical instruction selecting the next input.
