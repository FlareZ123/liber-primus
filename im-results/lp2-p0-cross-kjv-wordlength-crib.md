# Original LP2 opening-cross KJV whole-word crib gate

**Decision (16 November 2026):** A frozen, byte-identified King James Bible source contains **no twelve-consecutive-word GP29 length fingerprint** anywhere in the original 55 rune-bearing LP2 pages. The first three physical LP2 pages, whose two prominent cross illustrations motivate this particular Christian-text source, have a longest match of **nine** words. This is a bounded negative for a direct, word-boundary-preserving Bible quotation. It yields no recovered ciphertext key, unknown plaintext or destination.

## Source, original contract and independent prediction

- Original image source: LP2 p0 (file `17.jpg` in the supplied 75-scan collection) includes prominent opposing cross illustrations. This makes early Christian scripture a candidate **source to test**, not a proved intended key. The printed runes are independently represented in `resources/liber-primus/lp2-transcription.txt`.
- Historical readable candidate: the pre-2014 King James Bible, frozen as GITenberg `10.txt`, commit `e876c82a7299f0615ba035607f1c75d7945acc04`, full Git blob SHA-1 `d3c6c679342d594cf3a9cf7629fadc1cb4a7ee55`, 4,452,097 source bytes. The modern GITenberg commit preserves a historical edition; it is not a 2014 Cicada-authenticated pointer to this edition.
- The original parser retains page carries, treats slashes and print wrapping as spaces inside words, and keeps printed explicit separators as word boundaries. Exact input: **12,956 runes, 2,896 words**, including **32 page-spanning words**. The p0–2 target is **729 runes across 158 complete words**.
- The exact rune-length mapping on each unmodified source token applies `ING|TH|NG|EO|OE|AE|IA|EA` before single Latin letters. Both source and original are reduced to whole-word rune-length sequences. The complete `10.txt` has **794,918 alphabetic words**.
- A seven-word hash is an index only: every candidate is extended left/right to its maximal exact contiguous run. The scan ignores verse numbers, headings, line breaks and punctuation, an **overinclusive** lookup. An exact verse quotation preserving printed word breaks would necessarily appear if it were at least seven words long.
- **Predeclared solve threshold:** twelve uninterrupted whole-word native-GP length matches supporting a possible forty-plus-rune crib, followed by original ciphertext validation and a separately withheld plaintext prediction. Shorter matches are screening coincidences, not plaintext recovery.

## Exact original results

| Source-matched target | Longest unchanged GP word-length run | Consequence |
| --- | ---: | --- |
| LP2 pp0–2 (cross illustrations, original 158 words) | **9** | No 12-word Biblical crib |
| Every unknown LP2 page (entire 2,896-word stream, allowing page joins) | **11** | No 12-word Biblical crib anywhere; 17 distinct 10-plus matches |
| Native source positive: 16 unmodified consecutive KJV word lengths | **16/16** | Detector recognizes genuine long quotation |

The best p0–2 source coincidence is `TO SLAY US AND OUR PEOPLE SO THEY SENT`; the bookwide maximum is `OF THE HAND OF THOSE THAT SPOILED THEM AND YET THEY` at target physical p19. Neither is a cryptographic decryption: they merely share word lengths.

The complete, standalone CommonJS [original-input SFT](../sims/lp2_p0_cross_kjv_wordcrib_sft.cjs) checks the Git blob, the original 12,956/2,896/32 contract, the 729/158 opening, all measured maxima, the 17 longer accidents, and the 16-word native-source positive. [Manual-only Windows Node22 CI run 43813431458](https://github.com/FlareZ123/liber-primus/actions/runs/43813431458) completed successfully. The [manual runner](../.github/workflows/lp2-p0-cross-kjv-crib-manual.yml) downloads the exact commit-pinned public source, without checking 4.45 MB of external prose into this repository.

## Interpretation and stopping condition

The cross art is a motivated source-family suggestion; no original LP2 instruction selects the KJV, its specific edition or the hypothesis that unknown-page ciphertext preserves Biblical word lengths. This screen excludes only an unchanged whole-word GP29 rendering of this exact KJV edition, while deliberately granting every book/punctuation boundary. A paraphrase, a distinct ancient or translated religious source, shifted word boundaries, a non-textual encoding, or a cipher that changes word lengths remains untested. Prior quotation screening focused on separate visibly quoted floral passages; this test singles out the opening cross image and uses the **whole book** as a liberal control. These source-specific negative results warrant no change to `results/README.md`.

**Next decision:** obtain a historically authored link from an original cross/heading to a specific text and an operable decipherment rule. Without that selector, repeating generic religious-text quotation screens has little expected information gain.
