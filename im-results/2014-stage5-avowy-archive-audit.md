# 2014 Stage5 avowy onion: four-image recovery and historically bounded OutGuess audit

## Decisive original-byte recovery (11 November 2026)

The archived `avowyfgl5lkzfj3n.onion/post/index.html` at `iBotPeaches/cicada_3301` contains whitespace-separated hexadecimal GZIP data (original filename `data.out`, embedded GZIP date 2014-01-24 20:10:12 UTC). Expanding the exact stored bytes produces **3,010,703 bytes**, SHA-256:

`8ebf4c48304145d86b65c4e9802c752a93e31cfb0583d0ec32d0105c893dab5a`

**The original contains four complete 2400×3600 JPEG images.** The initial two JPEGs appear in forward order. The remaining **1,363,382 bytes are a single concatenated, byte-reversed stream** of two more JPEGs. Recover the latter by reversing **the entire** trailer after source byte 1,647,321; reversing it yields two image files in order with no gap, no XOR, and no guessing. This resolves the original two-JPEG/high-entropy-trailer misinterpretation of the source object.

| Recovered image (source physical order) | Original `data.out` byte layout | Recovered bytes | SHA-256 |
| --- | --- | ---: | --- |
| image-01 | `data.out[0:823807]` | 823,807 | `913e26462e51942f49ca3ce2e94ef56c5fb65110814442dccc02b0d88af2c5ca` |
| image-02 | `data.out[823807:1647321]` | 823,514 | `b50c1536ea1f30847e7875835991d52951bafb599fb1ab04eb78c5c6e6c2b468` |
| image-03 | `reverse(data.out[1647321:])[0:638805]` | 638,805 | `f0edba1084df9983353c11544bbf711f94ed7649edbf94b426c9b78549b64557` |
| image-04 | `reverse(data.out[1647321:])[638805:]` | 724,577 | `975cda73bbf829b2775f25beb609d34fa429728b2f2a4ce863c129b10b005089` |

**Existing-artifact identity:** direct SHA-256 comparisons against the independently supplied 75-scan original Liber Primus archive show the four recovered images are byte-identical to archive files **`06.jpg`, `07.jpg`, `08.jpg`, and `09.jpg`**, respectively. Their content was already present in the original LP1 corpus. The new result is a byte-exact reconstruction of the archived 2014 Stage5 container, its mixed-direction JPEG framing and a pinned replay of the historical third-image steganographic output. No new distinct tablet artwork or previously unknown LP2 plaintext has been discovered.

Each image validates independently with Pillow JPEG decoding at its original dimensions. The original whole-byte stream has only **two** recognizable forward JPEGs; the original trailer has none, and the byte-reversed trailer has **exactly two**. Full bitwise inversion (XOR 255), with or without reversal, contains no valid JPEG. A constructed two-JPEG plant passes all tested transform directions. The first archived and reproducible manual CI source run is [43114953136](https://github.com/FlareZ123/liber-primus/actions/runs/43114953136), with the exact SHA and dimensions printed in its job logs.

The reversible operation is directly motivated by the original 2014 [contemporary puzzle walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29), which describes four images in this same Stage5 gzip object, and a separately documented 2014 stage involving a byte-reversed JPEG. The recovered data are authentic archived puzzle artifacts; the operation is a deterministic byte readout, **not a recovered unknown LP2 text cipher**.

## OutGuess tests, historically separate from the four-image byte recovery

Maintained OutGuess 0.4 source commit `24810e14327c2bbeedeaadd3e24491f2a4425c02` was built and run on the first two JPEGs with the empty key, historical `divinity` candidate and a preserved `<!--3301-->` 256-byte object encoded as ASCII hex from `pre/index.html`. Previous outputs on the first two images were:

| Key | Each image's extracted length | Seed | Source-level observation |
| --- | ---: | ---: | --- |
| empty | 58,152 | 41,408 | The outputs share a 7,707-byte prefix |
| `divinity` | 2,140 | 19,674 | The outputs share an 86-byte prefix |
| archived pre-object ASCII hex | 30,628 | 44,920 | Outputs share a 4,411-byte prefix |

These outputs are high-entropy, contain no recognized file header, and lack readable plaintext. The old report incorrectly treated them as the entirety of the Stage5 hidden-payload test because the two reversed images had not yet been extracted. The front/back output correlations alone do not indicate an XOR-share mechanism.

**Frozen source-tail password test on recovered image 4 (11 November 2026, Agent27).** The historical image-03 140-byte OutGuess output decodes to a v2 onion hostname followed by exactly four unexplained digits, \`9133\`. A distinct inexpensive guess for those otherwise unexplained digits is an OutGuess passphrase on the fourth JPEG in the same recovered original Stage5 bundle. This is a hypothesis, not a documented step or a proof that the digits are meaningful rather than padding. [Manual original-byte run 43118152600](https://github.com/FlareZ123/liber-primus/actions/runs/43118152600) tests the **single** literal passphrase \`9133\` with pinned OutGuess 0.4 on original image-04 (same SHA-256 \`975cda73bbf829b2775f25beb609d34fa429728b2f2a4ce863c129b10b005089\` as LP1 \`09.jpg\`). OutGuess reports \`seed: 50256, len: 23133\` and emits a 23,133-byte binary file (SHA-256 \`2bb5af5ac417c7e341ad421bac7b28fac2e764a574d0ddad466573900fe32e92\`). Its Shannon byte entropy is **7.9915358513 bits/byte**, with only **38.486%** printable ASCII plus ASCII whitespace, no identified file signature or coherent plaintext and a nonlinguistic hex prefix \`50c45d5ad36b34...\`. This is consistent with an OutGuess wrong-key extraction from an arbitrary image; extracting bytes does not authenticate a steganographic payload. The fixed \`9133\`→image-04 password route yields no historical continuation or LP2 material. The existing manual Stage5 workflow now retains the exact candidate's output and diagnostics as an artifact.

**Original LP2 full-image extension of the *single* source-tail password (11 November 2026, Agent27).** Existing manual workflow \`lp2-outguess.yml\` was dispatched with only \`custom_password=9133\` and **all 58 original LP2 JPEGs** (\`17.jpg\`–\`74.jpg\`), with no changed or guessed keys. The pinned maintained OutGuess 0.4 passes a real keyed embedding positive control and verifies authentic default-key \`00.jpg\`/ \`08.jpg\` payload controls. A known payload-free synthetic JPEG probed under the *same password* also yields a plausible extraction header (\`seed 48727, len 12476\`) and high-entropy bytes, demonstrating that success status and printed header are insufficient proof of stego.

The [original-input manual run 43119253748](https://github.com/FlareZ123/liber-primus/actions/runs/43119253748) succeeds on all 58 pages and preserves every raw output as a downloadable workflow artifact. Each page yields exactly the same **\`seed 50256, len 23133\`** claimed header and a 23,133-byte file. Each file is separately hashed, with 58 distinct SHA-256s but the **same first 32 extracted bytes**, consistent with keyed pseudo-random extraction and page-specific residual data. Every output has Shannon byte entropy in **7.989839–7.993697 bits/byte** and ASCII printable fraction only **0.377772–0.389487**. There are **zero recognized PGP, gzip, ZIP or PNG signatures**, and **zero ≥97%-printable** candidates. The pipeline reports **58 apparent headers, zero recognizable payloads, zero process errors**, plus the payload-free control.

**Decision:** the exact historical suffix \`9133\` does not directly extract a recognizable LP2 payload under pinned keyed OutGuess0.4 from any original LP2 JPEG. This extends the original Stage5 image-04 negative to a finite, completely covered 58-image LP2 carrier test. It does not prove no encrypted high-entropy payload exists with that key, or that the four characters are genuine cipher material rather than transposition padding. The uniform headers are specifically *false evidence* for authentic payload detection, as the synthetic carrier control shows. No broader password search is justified by this result.

**Recovered original image 3 gives an exact historical plaintext recovery.** In [manual CI run 43115488487](https://github.com/FlareZ123/liber-primus/actions/runs/43115488487), default-key OutGuess 0.4 at fixed source commit `24810e14327c2bbeedeaadd3e24491f2a4425c02` on image-03 (SHA above) reports `Steg retrieve: seed: 38, len: 140`. The 140-byte extracted file has SHA-256 `4767d811f22abdb15bfee53c29bbd2488b123a9c290f63712f4ed12fdbc5963d` and consists of the same text reported in the independently preserved 2014 walkthrough:

```text

For those who have fallen behind:

TL BE IE OV UT HT RE ID TS EO ST PO SO YR
SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M

Good luck.

3301

```

The original bytes include one leading blank line, a trailing space after the first group line, and two final newlines, precisely accounting for the 140-byte file. Stripping only whitespace from the two grouped lines gives 56 ciphertext characters. The historical seven-column key **1736254** is a *permutation of each consecutive seven-character row*: output characters at zero-based ciphertext positions `[0,6,2,5,1,4,3]`. Applied unchanged to all eight rows, it recovers exactly:

```text
TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133
```

The 16-character v2 onion hostname is **`q4utgdi2n4m4uim5.onion`**, and the four trailing characters `9133` have no source-established further role. The source/decoded text, exact inverse transpose, source SHA, and continuation are locked in `sims/stage5_original_outguess_columnar_sft.cjs`, executed on the *actual extracted 140-byte file* by [successful manual CI run 43116676430](https://github.com/FlareZ123/liber-primus/actions/runs/43116676430). Image-04's default-key extraction returns 58,152 opaque bytes, SHA-256 `a35f439175a16486e6b5699cc45a265fa9d82eea15b92a52a124d549d97ff4f1`, with no comparable authenticated plaintext. No passwords or arbitrary transposition orders were searched.

**This closes a real 2014 historical solve path from an original archived gzip object through two recovered JPEGs and a specific OutGuess/columnar result.** The key and operation are independently historical, and the extracted authentic message is reproducible from pinned input. Its known 2014 plaintext is distinct from unknown LP2 ciphertext.

## Exact 140-byte message's source and trailing-four role (Director #447, 12 November 2026)

The preserved authentic 2014 Stage5 image-03 default-key OutGuess extraction is **140 bytes**, SHA-256 \`4767d811f22abdb15bfee53c29bbd2488b123a9c290f63712f4ed12fdbc5963d\`, with the literal readable introduction \`For those who have fallen behind:\`, eight groups of seven encrypted ASCII characters after whitespace removal, the sign-off \`Good luck.\`, and \`3301\`. A contemporary [2014 participant walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29) reports the seven-column order and next hidden-service host. The byte-recovered original Stage5 container, image-03 SHA and exact extracted text, decoded message, and seven-column permutation are documented above. This section classifies its *additional LP2 significance* without replaying already completed transposition or carrier scans.

**Decoded content boundary.** The decoded 56 characters divide without adjustment into **36** characters \`TOBELIEVETRUTHISTODESTROYPOSSIBILITY\`, **16** characters of an actual historical v2 Onion Service name \`Q4UTGDI2N4M4UIM5\`, and **four terminal digits** \`9133\`. The four digits occupy exactly source-output positions **52–55** (zero based): the eight rows of seven symbols require **56** cells, while meaningful quote+hostname needs **52**. In a conventional full-row seven-column transposition the final **four characters are precisely the number of needed padding slots**. This is a deterministic and parsimonious *possible function* of the trailing \`9133\`; the original source gives no instruction that those particular digits encode a key, a cryptographic checksum, or an LP2 page address. The padding interpretation is structural, not proof of author intent: any four filler symbols would complete the same grid. A standard irregular (unpadded) transposition is also possible. The explicit number \`9133\` has no authenticated second meaning.

**Finite textual-source inquiry.** Source-phrase searches using the complete unspaced and spaced sentence \`TO BELIEVE TRUTH IS TO DESTROY POSSIBILITY\`, its distinctive terminal \`truth is to destroy possibility\`, and the paired \`believe truth\`/\`destroy possibility\` wording yielded Cicada walkthroughs and later derivative quotes, without a separately attributable text demonstrably published before the January 2014 Stage5 object. The source-gated older philosophical comparator, William James's 1897 [*The Will to Believe*](https://www.gutenberg.org/ebooks/26659), discusses belief, truth, and possibilities, yet **does not contain this sentence** or identify a source-specific cipher/reading rule. This is a bounded exact-phrase/source check; it cannot exclude uncatalogued books, variant wording or private source material. No author or literary-source attribution is established.

**Player-operational decision.** The original clue's whole visible job is to let a lagging contemporary player reach the following 2014 onion; the **address itself** is the independently typed confirmation. Neither the plaintext introduction, aphorism, \`Good luck\` sign-off nor four terminal digits specifies a later LP2 page, source text, key schedule, offset, transform, or a second steganographic carrier. The literal \`9133\` password transfer to the fourth Stage5 image and to **all 58 LP2 JPEGs** has already failed with payload-free controls (above); do not reissue it. An authentic standalone pre-2014 attribution, or a primary source explicitly assigning those digits a consumer, is the precise missing input needed to reopen a new LP2 inverse. **No unknown LP2 plaintext or authenticated key follows from this clue.**

## Reproduction and status

- `sims/stage5_four_image_carve_sft.py` is a self-testing, SHA-pinned complete-image carving and extraction tool. `--extract data.out OUTPUT_DIR` writes the four byte-identical decoded JPEGs, after checking every output hash and decoding each image independently.
- `.github/workflows/avowy-stage5-gzip-audit.yml` is manual-only (`workflow_dispatch`); it fetches the pinned archival source, expands the exact GZIP, runs the four-image plant and source checks, exports all four recovered source JPEGs, and tests original OutGuess on the two newly discovered images. It also preserves the previous bounded first-two-image controls. The first four-image detection passed in [run 43114953136](https://github.com/FlareZ123/liber-primus/actions/runs/43114953136); the further four-image and historical OutGuess verification passed in [run 43115488487](https://github.com/FlareZ123/liber-primus/actions/runs/43115488487).
- Archived upstream: `https://github.com/iBotPeaches/cicada_3301/blob/master/onions/avowyfgl5lkzfj3n.onion/post/index.html`.

**Research decision:** all four original-image byte streams, the exact third-image 140-byte steganographic plaintext, and its 2014 onion continuation are now independently reproducible. Preserve the source-authenticated bytes and reuse this known original-method control when considering source-motivated LP2 operations. Do not infer that the numeric `pre` object selects any LP2 key, or guess OutGuess passwords without a new source instruction. No unknown LP2 plaintext, authentic LP2 key, complete LP2 mechanism or final destination is recovered by this Stage5 source repair.
