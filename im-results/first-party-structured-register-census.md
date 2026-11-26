# First-party structured-register census: no new GP29 plaintext register

**26 November 2026. Completed bounded source search for Director Issue #2941. No unknown plaintext or key recovered.**

## Decision and scope

No distinct, source-authenticated structured plaintext register with a source-defined GP29/29-state representation and an independently selected LP2 receiver survives the searched first-party corpus. The only long first-party numeric stream is the 2013 OS prime-echo sequence, which is already the known p56 prime clock and has been tested in its obvious 464-periodic, 58×8 and 16×29 forms. The other genuine structured artifacts are recipient-specific, short protocol examples, known solved LP1 pages, participant-supplied inputs, or non-plaintext binary payloads.

This is a bounded finding about the preserved 2012–2017 primary/first-party corpus, not a claim that no missing historical artifact ever existed. No lossless inverse was attempted: none of the new candidates supplies a source-selected 29-state grammar plus a field prediction that survives the source and framing gates.

## Original LP2 low-repeat screen

The corrected original p0–p55 transcription contains **12,956 runes in 2,896 complete printed groups**. Under the pinned physical framing, the group-type multiplicity distribution is:

| Group multiplicity | Distinct group types |
|---:|---:|
| 1 | 2,611 |
| 2 | 90 |
| 3 | 20 |
| 4 | 5 |
| 5 | 5 |
| **Total** | **2,731 distinct types** |

There are 165 repeat occurrences beyond the first instance and no group occurs more than five times. This is the narrow low-repeat property used as a screen, not a cipher selector. Matching this profile does not establish a key or plaintext.

## Candidate inventory

| Primary or contemporaneous source | Exact structure and source status | Decision |
|---|---|---|
| **2012 signed MIDI puzzle** | The inner signed literal MIDI is 10,889 bytes, SHA-256 \`e6c5b86bb1a95f1a2239237eaf9d060ba708f07d46ffe8c4bce4fca06a5c529c\`, verified against the preserved Cicada key. Its note-off/delimiter decode gives **50 entries, 48 distinct** (only BOX and TRAY repeat), with note-on timing carrying the word boundaries. The source metadata explicitly classifies the list as **recipient-specific**. | A real structured personal path, but not a universal LP2 register and not a source-defined 29-state representation. Existing corrected 50-entry p36/F-hold tests fail both additive signs; do not revive the legacy 49-token merge. [Source metadata](../resources/external/cicada2012-midi-source.json) · [50-entry correction](2012-midi-native-formatting-50entry-source-correction.md). |
| **2013 OS prime echo** | The original ISO's shell child contains exactly **464 literal prime outputs**, ascending from 2 through 3301, all unique. The actual formatting is 46 line breaks (ten primes per line, with four final entries) and two 2-second pauses, after 1033 and 3301. The source ISO has SHA-256 \`784643558799dd8bb3e172f31df6d6ca2f397fd61cb8fc371bf930f1e5ae6b7f\`; the pinned prime-echo script has Git blob SHA-1 \`65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649\`. The source-derived p−1 mod29 register uses all 29 symbols, with multiplicities 1–20. | A genuine numeric key schedule, not a new plaintext register. The p56 prime clock already supplies the p−1 representation. The 464-periodic key, 58×8 page key, 16×29 Fibonacci-page table, totient blocks and source-selector variants have already been tested without plaintext. The script's actual ten-prime line grouping does not specify a 16×29 or 58×8 reshape. [464-period gate](prime-echo-464-periodic-key-negative.md) · [58×8 gate](prime-echo-58x8-page-key-gate.md) · [16×29 gate](prime464-fibonacci-page-table-original-inverse.md) · [source selector](lp2-2013-prime-echo-source-selector-gate.md). |
| **2013 signed TCP protocol** | The signed specification gives one fixed BASE29 example, **3301 → 3QO** (three symbols), and a DH23 worked example with server base 5, server public share 8, client public share 19 and shared value 2. The server selects its own base/secret; BASE29 operands and other command payloads are client-supplied. | No long organizer-emitted register. The 3-symbol vector is not enough data; the DH tuple is participant-parameterized. The participant transcript's BASE29 1033 → 16I is not a signed first-party output. [Pinned signed source](../resources/external/2013-tcp-server-signed-source.md). |
| **2013 OS wisdom/folly objects** | The two paths are byte-identical copies of one 3,368-byte object; all 256 byte values occur and measured Shannon entropy is 7.937666 bits/byte. The original startup and prime-echo scripts contain no authored consumer for these paths. | Opaque high-entropy bytes, not a plaintext register. Do not relabel them as compressed text or infer a key from the names. [Original-ISO classification](2013-os-wisdom-folly-source-classification.md). |
| **LP1 page05 “Some Wisdom” / 2014 Stage04** | The actual original is the 2014 Stage04 page05 binary (673,066 bytes), not an independently dated 2013 page. Its known 5×5 table has **25 cells: 12 numeric and 13 GP-word cells**. Replacing each word cell by its GP prime sum reproduces the known 2014 square cell-for-cell. | A genuine, already solved LP1 structure, not a new LP2 plaintext/key register. The former 2013 chronology is unsupported. [Corrected original-source note](../resources/external/2013-0-wisdom-source.md). |
| **2014 Stage11 index** | The archived index lists **58 unique image IDs, 0–57**. Its pinned manifest identifies a 2014-05-11 participant Git archive, index blob SHA-1 \`303db130705f0ef9be2a738f4336d5cfcebde80c\`, and explicitly says it is **not a PGP-signed HTTP response**. Reducing IDs modulo29 yields two trivial copies of 0–28. | A contemporaneous page inventory, not an authenticated plaintext register. The 133/331/464 and page-index relationships have separate bounded reports; no independent 29-state field rule follows. [Index manifest](../resources/historical/stage11-2014-index-manifest.json) · [133/331/464 gate](2014-stage11-133-331-prime464-original-gate.md). |
| **2014 Stage05/Stage06 forms and images** | Stage05 supplies a short signed seven-word maxim and image carriers. Stage06/Stage10 magic-square values are participant-submitted; the static response images are not an organizer-generated numeric stream. | No fixed first-party plaintext array. Existing stage05 grammar and stage06 CGI acceptance gates already bound these sources. [Stage05 grammar](lp2-2014-stage05-sevenword-original-grammar-gate.md) · [Stage06 acceptance](lp2-2014-onion6-cgi-acceptance-contract-gate.md). |
| **2016 signed message** | A signed 43-word message has a 29-word core from THE through DIRECTION, but it is prose, not a numeric array. | The direct 29-word prime-sum and sum-of-prime-totients period-key candidates, with the p56 transparent-F rule, die exactly at original rune offsets 0, 43, 51 and 118. No legal full inverse. [29-word key gate](lp2-2016-29word-core-periodic-key-gate.md). |
| **Solved LP1/p56/p57 material** | LP1 p05 and p15 contain known structured constructions; p56's separately printed 128-hex digest is a hash target; p57 is a solved prose parable. | These are controls or already identified structures, not an additional plaintext register. Mapping the digest nibbles or p57 prose into GP29 would be an unselected conversion. |

## Source boundary

Pinned input identities used by the reproducer:

- Original LP2 corpus: \`resources/liber-primus/lp2-corpus.json\`, Git blob \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\`.
- Corrected physical transcription: \`resources/transcriptions/lp2_krisyotam_2017.txt\`, Git blob \`43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7\`.
- 2012 MIDI metadata/list: \`resources/external/cicada2012-midi-source.json\` (blob \`2666c7d2f66482d0b3c50fbbdebe3ca43f38cd59\`) and \`resources/historical/cicada2012-midi-50-entries.txt\` (blob \`734a38ee7c5dd16067aa04b6217c2c7eee0deab8\`).
- 2013 prime echo: \`resources/historical/cicada2013-os-original-prime-echo.sh\`, blob \`65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649\`; original ISO SHA-256 above.
- 2014 Stage11 manifest: \`resources/historical/stage11-2014-index-manifest.json\`, blob \`f669b88acd34a03f544404c646de4b2c7cd25cac\`.
- 2013 TCP signed-source record: \`resources/external/2013-tcp-server-signed-source.md\`, blob \`479724f837e122211c0fef31789bac378e334409\`.
- 2014 Stage04 Wisdom transcription: \`resources/external/2013-0-wisdom.txt\`, blob \`320257b0db6ee6326ef3fc216c5379c9c91694f3\`; its source note corrects the date and identifies the original binary.
- 2016 signed message: \`resources/historical/cicada2016-4gq25-outguess.asc\`, blob \`a0d8bd2d73613e01cd8a2103d5721b2b998ee482\`.

## Reproduction

Run from the repository root:

\`node sims/first_party_structured_register_census_sft.cjs\`

The script verifies the original p0–p55 word-group histogram, the corrected 2012 MIDI entry count, all 464 prime-echo outputs and their actual formatting, the Stage11 archive classification and page-ID residues, the 25-cell LP1 table, the signed TCP's short fixed vectors, and the 2016 29-word core.

## Conclusion

The searched first-party corpus contains authentic structured material, but no **new** source-defined 29-symbol/29-state plaintext register with an independently predicted field grammar for unknown LP2. The 2013 prime clock remains an authentic key schedule already under test; the 2012 MIDI remains a recipient-specific path; the 2013 TCP protocol supplies examples rather than a register. Stop this branch here. A new candidate requires new primary bytes or an independent source instruction selecting both its 29-state representation and its LP2 consumer.
