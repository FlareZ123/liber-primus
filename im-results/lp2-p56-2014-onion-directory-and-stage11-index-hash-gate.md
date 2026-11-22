# p56 direct-hash gate: 2014 onion directory and Stage11 index

**Decision, 15 November 2026:** no direct p56-digest preimage was found in either (a) a period-adjacent public directory of 3,204 v2-era onion hostnames under the tested string serializations, or (b) the exact archived 2014 Stage11 HTML delivery index. This is a bounded negative only. No unknown LP2 plaintext, key, complete cipher or destination was recovered.

## Why these inputs were tested

Solved LP2 p56 prints the 128-hex target:

**36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4**

A 20 August 2014 [Tor Stack Exchange question about collecting onion addresses](https://tor.stackexchange.com/questions/3896/where-i-can-find-export-or-download-the-biggest-list-of-all-onion-addresses) was answered by Kenorb. Its 15 September 2014 answer edit links to the GitHub list and general directories. In the kenorb/cicada-2014 fork, commit [2e0cb5ace2f4172cda402489201bbbe27dd19999](https://github.com/kenorb/cicada-2014/commit/2e0cb5ace2f4172cda402489201bbbe27dd19999), dated 15 September 2014 18:23:41 UTC, adds stage11/scripts/onions-list.txt with the commit message “Added database of onion addresses (See: http://tor.stackexchange.com/q/3896/1880).” This file is **not present in the upstream micheloosterhof/cicada-2014 tree**; it is a participant/community addition, not a Cicada-authenticated resource.

The adjacent hash_finder.sh script hashes each exact line with printf before SHA-1/MD5, so the source-supported input form is the full hostname including .onion, without a newline. The p56 digest has 128 hexadecimal characters, so SHA-512 is the strongest direct extension; SHA3-512 and BLAKE2b-512 were also included as other available 512-bit digest families. The extra bare-label and HTTP(S)-root forms are limited canonicalization controls, not historical instructions.

## 1. Historical onion-address directory

The source-pinned list is **73,692 bytes**, Git blob SHA-1 **8722ee2edd749f01b4fffbd91053fac5a8ca0ff3**, with **3,204 unique entries**. Of these, 3,172 are valid lowercase 16-character v2 onion hostnames; 32 are noncanonical or legacy entries. Neither known LP2 distribution hostname (ky2khlqdf7qdznac.onion, ycwtiskrspensdkz.onion) occurs in this directory.

The reproducible [Node 22 SFT](../sims/lp2_p56_onion_directory_hash_sft.cjs) verified the downloaded Git blob and positive SHA-512 abc test vector, then tested every list entry under:

- exact hostname including .onion;
- bare 16-character label;
- http://hostname/;
- https://hostname/.

Available 512-bit algorithms were SHA-512, SHA3-512 and BLAKE2b-512. Whirlpool was requested but not exposed by the runner's crypto provider and was **not tested**. The result was **38,448 hashes, zero matches**. The first manual workflow run [43689956871](https://github.com/FlareZ123/liber-primus/actions/runs/43689956871) completed successfully.

## 2. Exact archived 2014 Stage11 index

The original participant archive's stage11/ky2khlqdf7qdznac.onion/index.html is preserved byte-for-byte as [resources/cicada2014-onion7-index.html](../resources/cicada2014-onion7-index.html). Its 1,640 bytes match Git blob SHA-1 **303db130705f0ef9be2a738f4336d5cfcebde80c** from original archive commit [6c3421a4d245596e403c88e037509d162a2afd17](https://github.com/micheloosterhof/cicada-2014/commit/6c3421a4d245596e403c88e037509d162a2afd17), dated 11 May 2014 18:33:43 UTC. The SFT asserts all **58** image references appear in ascending order, 0.jpg through 57.jpg.

The exact unmodified HTML bytes were hashed under SHA-512, SHA3-512 and BLAKE2b-512. None equals the p56 target:

| Algorithm | Digest of exact 1,640-byte index HTML |
|---|---|
| SHA-512 | 83e50c118edb70dc34c9c760e332830a066b82006ebbbdcc7347b818d1961a571f32ef5a3717e98e282754d4a004dc0f7f0d99fb3824bb1b281a947c7ba70a31 |
| SHA3-512 | 0ab98b6b93baac507b6a5743e5b3ae3a0f8bf582af630c74b2573016f21271b7e22a223864f1349740d5b44e72f8fda9355275664b519358ec6b584b4f1c3442 |
| BLAKE2b-512 | 2952caa794176de3fe6f74fb350e3d9c6eed6aa794d4ee3d79570d2dc4e55b0cf2bfc06d19dbfcf600fbd06df7efced41e321e30ae2ef8bd96c26fa6e0651e41 |

The exact-page test is in [the source-pinned SFT](../sims/lp2_p56_stage11_index_direct_hash_sft.cjs), added as a second step to [the manual-only workflow](../.github/workflows/agent3-p56-onion-directory-hash-sft.yml). The combined run [43690486989](https://github.com/FlareZ123/liber-primus/actions/runs/43690486989) passed all assertions and found no match.

## Scope and next decision

These results exclude only direct hashing of the **3,204 listed host strings** in the four specified representations under the three available 512-bit algorithms, plus the exact archived Stage11 HTML body under those same algorithms. They do **not** test the contents of any onion service, an unlisted/private service, the original live HTTP entity bytes, other serialization, salts, concatenated operands or an unidentified page body. The Stage11 index copy is an archival participant-repository file, not an independently authenticated original HTTP response.

The public onion directory is not a Cicada artifact and omits the known LP2 distributor; it is therefore a weak coverage set for a potentially private target. The exact index HTML is a plausible but unselected page candidate. Neither negative changes the authoritative conclusion that p56's target preimage and hashing contract remain unknown. Keep this as intermediate evidence; do not widen into arbitrary URL, whitespace, salt or hash-family enumeration without an independent historical instruction selecting the next input.
