# Finite external repository source audit: 2014 byte streams and mirror identities

**Director Issue #423 decision (12 November 2026):** This bounded external search found an independently archived **2014 three-stream numeric object**, but no authentic LP2 plaintext, unknown-page key, or source-selected non-additive mechanism. The three-way stream-to-LP2-table transfer fails an original-input identity check. Several ostensibly independent large archives are actually byte-identical mirrors; do not count them as independent witnesses or launch a general key hunt from this 256-byte coincidence.

## Public repository deduplication and independent material

| Repository and corpus | Exact finite audit | Distinct research value |
| --- | --- | --- |
| [cijhho123/cicada3301](https://github.com/cijhho123/cicada3301) (2021) vs [cicada-solvers/The-Complete-Cicada3301-Archive](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive) | 1,243 of 1,243 source Git blobs are present under the second repository's 1,244 blobs; its sole additional blob is .github/workflows/sync.yml | The latter is a synchronized mirror, not an independent historical source |
| [Hadyn/cicada](https://github.com/Hadyn/cicada) (2018) | 60 of 61 blobs appear unchanged in the complete archive; the additional file is a 2018 researcher README analyzing the original 2014 whitespace and punctuation | No distinct original image, ciphertext or decoded key |
| [micheloosterhof/cicada-2014](https://github.com/micheloosterhof/cicada-2014) (repository created 10 January 2014) | 162 of 169 blobs already match the complete archive; the remaining items include 2014 HTML/index copies, participant stage notes and shell scripts | Historical witness for the three 256-byte objects below; no LP2 instruction recovered |
| [kenorb/cicada-2014](https://github.com/kenorb/cicada-2014) (created 18 August 2014) | Same 169 blobs as micheloosterhof plus six additional files, primarily stage11 derived scripts, onion-name list and extracted JPEG text | No unique authenticated original cipher bytes established in the added six |
| [235711101131pp/cicada2014](https://github.com/235711101131pp/cicada2014) (created 19 February 2014) | Eight files, three byte-identical to the complete archive. Remaining materials include an RSA-encrypted message and stage processing scripts | Genuine contemporary method witness; no independently selected LP2 receiver |
| [ToldByNun/Parcae](https://github.com/ToldByNun/Parcae) (created September 2026, MIT) | A C++20 mod-29 deterministic toolkit with solved-page fixtures, transformation library, theory compiler and optional CUDA; README correctly identifies LP2 0–55 as unsolved | Reusable implementation, not an independently sourced original artifact or claim of unknown-page plaintext |
| [yo-yo-yo-jbo/cicada_tools](https://github.com/yo-yo-yo-jbo/cicada_tools) (2023), [ralphatobe/cicada-3301](https://github.com/ralphatobe/cicada-3301) (2018), [ProfessorJ17/Cicada3301](https://github.com/ProfessorJ17/Cicada3301) (2024), [geomatria/CicaData](https://github.com/geomatria/CicaData) (2020) | Read their project explanations and selected analysis modules: derived numeric/GP tools, later transcriptions, image OCR and a partial 2012 artifact catalog | Methods/data derivations do not authenticate a missing 2014 LP2 input or a complete reversible cipher |

All equivalences above use Git blob SHA-1 equality, giving exact byte equality for identical blobs under their respective Git repositories. The file counts apply only to the named checked branches, not all versions or external Web archives. Historical files outside these bounded public sets remain candidates, and uninspected binary content is not declared absent.

## Original-era three-by-256-byte finding and frozen cross-artifact check

The contemporary [micheloosterhof stage05/allstrings](https://github.com/micheloosterhof/cicada-2014/blob/master/stage05/allstrings), Git blob **b11000fd932d1f4ebffce85d3a85139dcf856a69**, carries **three separate 512-hex-character strings**, labelled 1033, 761 and 3301. Its file path last appears in git history in commit **48893f174cb35c534ab23220b58845a78e72edac**, dated 2 June 2014 (a directory rename, not original publication date). The [3301 original HTML object](https://github.com/micheloosterhof/cicada-2014/blob/master/stage05/avowyfgl5lkzfj3n.onion/index.html), blob **5d2bad311bafb3718aa1adb1edac18ac847a0a90**, reproduces the third 256-byte stream exactly after the 3301 HTML marker. A separately preserved 2014 [participant Titanpad](https://github.com/cijhho123/cicada3301/blob/main/2014/additional%20docs/Titanpads%20from%20time%20of%20solving/The%20256%20byte%20strings%20aren%27t%20magic%20squares.txt), blob **fd79d660d303beebdb9a152b1d68b9c120796812**, independently prints all three as 16×16 bytes, in the onion3=1033, onion2=761, onion4=3301 order. These are source-era observations rather than a 2026 constructed ciphertext.

**Specific hypothesis:** 2014 Cicada already used a historically documented three-share bytewise XOR. The original LP2 numerical structure has 256 cells over original physical pp49–51 (80+104+72), with base-60 bytes B pinned by blob **4698c0806e6bab06a39cfbc3c3283b862de58b35**. Does any of the source's three 256-byte streams or their original-order XOR directly reproduce B, a 29-symbol remainder or a 0–8 quotient? Freeze source order and operations, with no reindexing, rotations, endian reversals, extra seeds or fitted offsets.

| 2014 256-byte source | Exact byte identities with B | Remainder identities mod 29 | Quotient floor(byte/29) identities |
| --- | ---: | ---: | ---: |
| Label 1033 | 1/256 | 7/256 | 26/256 |
| Label 761 | 1/256 | 9/256 | 37/256 |
| Label 3301 | 3/256 | 10/256 | 19/256 |
| 1033 XOR 761 XOR 3301 | 1/256 | 11/256 | 27/256 |

The historically motivated three-way XOR itself returns 256 nonlinguistic bytes, only 37.89% printable ASCII including standard whitespace, with no recognized plaintext or directly mapped B. For completeness the three pairwise XORs have 0, 1 and 1 exact byte matches to B (1033 XOR 761, 1033 XOR 3301, 761 XOR 3301). The apparent 256 match is compatible with fixed 2,048-bit binary outputs; the sources provide **no LP2 instruction** linking these records to the later 256-cell numeric table, a key phase, an alphabet or a source-derived inverse. Exact identity under the explicitly selected operations is rejected. More transformations require new independent evidence.

## Original-era totient and XOR variant, source-constrained negative

The 2014 community's [2014 Things That Had Been XORed](https://uncovering-cicada.fandom.com/wiki/2014_THINGS_THAT_HAD_BEEN_XORED) documents **per-byte Euler totients** and original-order XOR or byte-reversed XOR of the same 256-byte onion outputs (for example onion2 byte 0x63=99 becomes φ(99)=0x3c=60). This is historical *participant experimentation*, with no Cicada-authenticated instruction to use these arrays against LP2. To avoid retrospective tuning, the source's original 1033/761/3301 byte order and all 256 positions were held fixed. No offset, alternate radix, arbitrary key clock, or novel KDF was introduced.

| Frozen 256-byte output | Exact match with printed LP2 B | GP29 remainder match | Quotient floor(byte/29) match |
| --- | ---: | ---: | ---: |
| φ(1033 bytes) | 2 | 10 | 29 |
| φ(761 bytes) | 2 | 11 | 24 |
| φ(3301 bytes) | 1 | 6 | 36 |
| XOR all three φ streams | 1 | 9 | 29 |
| XOR all three original and all three φ streams | 1 | 7 | 31 |
| XOR reversed original streams and unreversed φ streams | 2 | 8 | 29 |
| XOR three reversed original streams | 1 | 12 | 34 |
| XOR reversed original streams and reversed φ streams | 2 | 11 | 34 |

Each comparison has **256** source bytes and 256 original LP2 table cells. No listed original-era operation reproduces an entire byte/GP29 stream. The independently documented totient operations thus do not rescue a table-key claim or suggest any fixed LP2 cipher. The repeated 256 length alone is a weak selector.

## No hidden columnar transposition or static relabeling can repair these source streams

The *2014* puzzle itself used a clue-selected **columnar transposition** (“the key is the order of the squares”), independently documented in the original-era [2014 stage walkthrough](https://deepwiki.com/scream314/cicada3301/4.1-2014-puzzle-stages-1-6%3A-the-onion-chain). A plausible secondary hypothesis is that an original 256-byte stream is the LP2 table with a secret columnar read order, perhaps followed by one globally secret permutation of byte/rune alphabet. This case is stronger than raw position-aligned identity and has an exact **key-independent obstruction**: any transposition, any secret global alphabet bijection, or their composition must preserve the **multiset of symbol multiplicities**. No key search is required.

| Original 2014 source | Distinct raw source byte values vs B (161) | Minimum byte substitutions required after *any* reordering, with labels fixed | Minimum GP29 remainder substitutions after any reordering | Minimum GP29 quotient substitutions after any reordering |
| --- | ---: | ---: | ---: | ---: |
| 1033 source | 157 | 141/256 | 57/256 | 24/256 |
| 761 source | 158 | 131/256 | 55/256 | 31/256 |
| 3301 source | 172 | 134/256 | 54/256 | 32/256 |
| All three source XOR | 162 | 127/256 | 60/256 | 22/256 |
| All three per-byte totients XOR | 118 | 153/256 | 49/256 | 32/256 |
| Source XOR and totient XOR | 160 | 138/256 | 57/256 | 28/256 |

Each fixed-label minimum is exactly half the L1 distance between the two corresponding 256-element histograms. More importantly, **every** source's sorted list of nonzero symbol multiplicities differs from the B list in all three registers (256 byte, GP29 residue, 9-state quotient), so **even an arbitrary secret global bijection on the respective alphabet followed by any transposition is mathematically excluded**. At raw-byte level, the independently measurable distinct-symbol counts alone certify six of six exclusions (157/158/172/162/118/160 versus 161); GP29 residue and quotient exclusions require their full sorted frequency spectra. The source-derived candidate set is restricted to these six, not arbitrary composed cipher layers. An evolving, context-keyed map that changes byte identities is outside this invariant and requires an independent source selector.

## Director choice

Do not import or republish the unlicensed 2014 source text. Preserve the pinned remote blob links, historical dates and complete matching rules above; avoid recreating already indexed duplicates. The no-selector conclusion is **finite**, confined to the enumerated repositories and frozen 3-stream mapping. A future task should be triggered by a genuinely unindexed primary artifact or a human-visible instruction selecting a non-additive operation with a held-out original LP2 prediction, rather than the number 256 or an archive's apparent independence. This audit supplies no candidate satisfying the complete p55 decoder Issue #41.
