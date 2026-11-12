# LP2 original JPEG carrier gate: source-comparable markers and quantized DCT

**12 November 2026, Agent6, Director #518. Bounded no-selector finding.** All original LP2 scans have now been compared against byte-pinned 2014 Stage04/Stage05 OutGuess positive carriers at the marker, DQT/DHT and libjpeg quantized-coefficient levels. The tests expose a correction to the preliminary report and a distinct LP2 rendering profile. No original source selects a particular LP2 carrier, coefficient extraction rule or payload format. No unknown LP2 plaintext or key was recovered. This gate does not establish the absence of all image steganography.

## Exact source and source-native controls

The 75 unchanged `resources/liber-primus/00.jpg` through `74.jpg` bytes are the tested corpus. Original scans 17–74 correspond to LP2 p0–p57; 00–16 are LP1. Two independently recovered historical 2014 carriers are byte-identical to the archive:

- **`03.jpg`**, 892,759 bytes, SHA-256 `b8b142f9b7854ec4f240e076cad03a98a2e3e9cf7c20f1da4fcde1ed25e3be3f`, is the 2014 Stage04 carrier whose archived unkeyed OutGuess extraction is the signature-checked 31,809-byte PGP text.
- **`08.jpg`**, 638,805 bytes, SHA-256 `f0edba1084df9983353c11544bbf711f94ed7649edbf94b426c9b78549b64557`, is Stage05 image-03 with the reproducible 140-byte unkeyed OutGuess plaintext and the 2014 onward onion instruction.

These are genuine payload-positive *historical controls*. Their physical image content and export parameters differ from LP2, so a feature associated with them cannot be used as an LP2-specific payload detector without a matched cover/control. The source-chain and output verification are in [Stage04 source gate](cicada2014-stage04-256-p50-direct-identity-gate.md) and [Stage05 original-image recovery](2014-stage5-avowy-archive-audit.md).

## Complete 58-page marker, encoding and coefficient examination

The original-byte marker audit checked all SOS/EOI framing without re-encoding, including DQT, DHT, JFIF APP0, ICC APP2, dimension, component IDs, scan structure and trailing bytes. Every LP2 page has a valid baseline sequential JPEG scan, 2400×3600 dimensions, no restart interval and no data after EOI.

**Correction to the initial report:** **23 of 58 LP2 images have a true *one-component grayscale* SOF0, rather than three components with sparse chroma**. They are archive scans 33–38, 41–42, 45–48, 58–65, and 67–69, or physical LP2 pp16–21, 24–25, 28–31, 41–48, 50–52. The other **35 are three-component color JPEGs**. The single-component classification was checked against the original SOF0 bytes, independent libjpeg `num_components` and Pillow's `L` mode. The previous preliminary statement “all 58 three-component” was wrong.

The **58/58 LP2 pages share one byte-identical APP2 ICC segment** (2,590 payload bytes, SHA-256 `62bf41ee295c823d5e6b44cd6dee8e4754fd8d3d6dc482227fb001e9a61a5c2f`) with the embedded profile name **Artifex Software sRGB ICC Profile**. All 17 LP1 sources lack APP2. Every LP2 page has the same APP0 JFIF payload. These identical source-export markers provide **no page selector**.

The two LP2 quantization-table profiles partition precisely by one-component versus three-component encoding: the 23 grayscale images have one DQT table and two DHT segments; the 35 color images have two DQT tables and four DHT segments. Across 58 pages, **58 distinct DHT payload tuples** occur, consistent with image-dependent Huffman optimization. Known OutGuess-positive LP1 pages 03 and 08 share the same fixed four-segment Huffman table tuple, which is also shared by LP1 pages 00, 01, 02, 10, 11, 12, 13. **Zero LP2 pages share that tuple.** The tuple therefore fails a specificity test: its presence in other LP1 sources cannot independently authenticate a payload, and its absence from LP2 does not exclude steganography using different encoders.

Quantized DCT arrays were read directly through libjpeg `jpeg_read_coefficients`, without a pixel-domain re-DCT. In the Y component, the proportion of odd coefficients conditional on absolute AC magnitude at least 2 is **0.416711** for genuine carrier 03 and **0.407371** for genuine carrier 08. LP1 pages 10/11/12 yield **0.4105/0.4097/0.4074**, respectively, even though their source material does not supply the independently recovered OutGuess payloads for pages 03/08. Hence this tempting odd/even carrier signature fails specificity on the period control corpus. LP2 grayscale images have corresponding Y ratios **0.438848–0.478023**, and LP2 color images **0.444155–0.480036**. These broad visual-content/encoder-dependent differences cannot select a hidden LP2 message. No unconstrained coefficient-phase, bit-order or key extraction was run.

## Full-resolution RGB residual control: why some monochrome pages are stored as color

A further original-pixel check of all 58 LP2 scans found **25** three-component pages containing strongly red pixels and **10** three-component pages with **zero strongly red pixels**, alongside the 23 genuinely single-component grayscale pages. Source RGB encoding is therefore not simply the visible presence of red type.

Nine of the 10 visually monochrome RGB pages carry *tiny, spatially identical residual chromatic patterns* across independently numbered originals:

| LP2 physical pages (archive JPEGs) | Full-resolution chromatic pixels per page | Maximum RGB-channel delta | Distinct copied residual pattern |
| --- | ---: | ---: | --- |
| p4, p5 (`21.jpg`, `22.jpg`) | **43** | **2** | Exactly identical 43-pixel mask and signed channel differences, confined to original x352–367, y2448–2463 |
| p9, p11, p13 (`26.jpg`, `28.jpg`, `30.jpg`) | **1,277** | **5** | Exactly identical same-side artwork residual, x2036–2235, y800–1359 |
| p10, p12 (`27.jpg`, `29.jpg`) | **1,462** | **5** | Exactly identical opposite-side artwork residual, x250–453, y810–1359 |
| p34, p35 (`51.jpg`, `52.jpg`) | **759** | **5** | Exactly identical upper illustration residual, x1142–1385, y175–431 |
| p1 (`18.jpg`) | **0** | **0** | RGB-encoded original is perfectly achromatic at every decoded pixel |

In each multiple-page group, **the complete original-resolution signed B−G and R−G residual arrays are pixel-identical**, even as the rune text differs. Thus the unusual color encoding on these pages is connected to **reused page/template artwork or image-production inheritance**, a source-native mundane mechanism explaining most exceptions to a red-content color rule. The color/grayscale page sequence cannot be regarded as an independently authenticated authored binary message merely because some RGB pages lack red. An intentional metadata-level code remains possible in principle, but no original visual clue chooses this channel, polarity or encoding. **No LP2 hidden message or decryption key was recovered.**

[Full-resolution source-color SFT](../sims/lp2_jpeg_chroma_template_sft.py) SHA-pins all 11 focal original JPEGs, asserts exact residue pixel counts, identical inter-page difference arrays and the p0 true-red positive control (60,278 original red pixels). It uses the decoded original JPEG RGB values without altering/recompressing the files. This is a source-rendering follow-up to the initial marker/DCT comparison, not a blind steganographic extraction.

## Reproduction and decision

- [Existing original-marker reader](../sims/lp2_jpeg_marker_audit.py) and [quantized-coefficient reader](../sims/lp2_jpeg_coeff_audit.c) establish the source framing and original coefficient access.
- [Carrier comparison SFT](../sims/lp2_jpeg_carrier_signature_sft.py) asserts the two original positive-control SHA-256s, all 23 actual grayscale positions, the 35 color positions, ICC payload equality, 23/35 DQT split, 58 distinct DHT tuples, and LP1/LP2 positive-template cross-check.
- [Exact libjpeg AC-magnitude/parity reader](../sims/lp2_jpeg_coeff_odd_even.c) emits counts for the source 8×8 coefficient blocks in every component. For a representative coefficient parity rate use the row's `ac_odd_abs_gt1 / ac_abs_gt1`.

No authenticated LP2 clue independently chooses a specific stego image, bit/coefficient plane, key, direction or format. The source-comparable control did not expose a transferable signature with independent specificity. **Decision:** close #518 as a bounded *no-carrier-selector* result; retain original bytes, SFT and existing OutGuess payload controls. Reopen only for an original instruction, independently recognizable payload signature or new source object that fixes a concrete extraction route. Additional unselected JPEG coefficient scans would have no causal path to plaintext.
