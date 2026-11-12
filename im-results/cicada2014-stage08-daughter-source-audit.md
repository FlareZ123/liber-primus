# Original Stage08 three daughter objects: formats and historical reading

**Director #640, 12 November 2026. Decision:** The three previously unaudited daughter objects from the archived 2014 Stage08 signed message resolve into an already documented **Gödel / Escher / Bach** player-visible book selector. Their complete outer JPEG and MPEG Layer III framing contains no extra trailing data, JPEG application payloads or audio metadata directing an additional LP2 operation. No source selects a password, inner bit channel, LP2 target page, cipher schedule or cryptographic key from these objects. Therefore the specific *unconsumed daughter-format* lead does not justify blind steganographic searches. This is a narrow negative about these pinned original files, **not a negative proof about scan entropy or MP3 ancillary bit capacity**. Unknown LP2 plaintext remains unrecovered.

## Original source and human solve path

Use exactly the unchanged Stage08 source revision `krisyotam/cicada3301@76d3ee8c762f60025822c8c05edbf31351636469`, `puzzles/2014/assets/stage08/index.1`, `index.2`, `index.3` (hex text). Agent35's [complete bzip2 audit](cicada2014-stage08-bzip2-original-member-audit.md) confirms these are all and exactly the embedded original clear-signed hex objects. This archive is a pinned derivative of a historical stage, not a newly verified independent original HTTP capture.

1. The first image is the printed `Bew(y) = ∃x` Gödel provability notation. Its original pixels, 163×79, have been inspected; the short `Bew` notation evokes Gödel's provability predicate rather than providing a cryptographic word such as BEWARE. The metadata comment is `Created with GIMP`.
2. The second image is a low-resolution copy of M. C. Escher's 1946 *Eye*, 197×173 pixels; comment `LEAD Technologies Inc. V1.01`.
3. The audio is a short fragment of a Johann Sebastian Bach trio sonata. Contemporary participant commentary and the later reconstructed walk-through specifically identify **Trio Sonata in G major, BWV 1039**. We verified original media layout and encoder signature, but did **not** independently perform a full audio fingerprint/score alignment here.

Together these cues deliberately name **Douglas Hofstadter's *Gödel, Escher, Bach: An Eternal Golden Braid***. The same 2014 signed message contains the book-code tokens `3PI`, `LML`, `ETOATS`, `C[1]`, `C[2]`, `ONION`; the previously documented historical continuation uses this book to obtain the next onion address. This explains why all three media were presented to the player. It supplies no independently authored instruction to read any of them as a cipher for the later unknown LP2 pages.

Primary archive [Stage08 README](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage08/README.md) and the signed `index`; period discussion preserved at [Uncovering Cicada's 2014 Stage08 notes](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_7); independent detailed historical reconstruction at [The Cicada 3301 Mystery, puzzle 3 part 3](https://connortumbleson.com/2024/06/03/the-cicada-3301-mystery-puzzle-3-solve-part-3/). These latter sources support the named Bach passage and historical reader interpretation, not original-byte authenticity.

## Exact format audit

| Object | Raw bytes / SHA-256 | Full-image or audio framing | Intrinsic readable metadata |
|---|---|---|---|
| `index.1` JPEG | 1084 / `4d66a03af8c3d7880297bce4056d3275f3b02ec00bc7051e36e80509f1d0ea9b` | JFIF, SOF2 progressive 163×79, **10 scans**, final EOI at byte 1084, no remainder | JPEG COM: `Created with GIMP`; no EXIF/XMP APP |
| `index.2` JPEG | 1635 / `6bd3d8011bad9a2593aa64e4b885ac8470e54a6a246b447a3995c2229cd98b79` | JFIF, SOF2 progressive 197×173, **10 scans**, final EOI at byte 1635, no remainder | JPEG COM: `LEAD Technologies Inc. V1.01`; no EXIF/XMP APP |
| `index.3` MP3 | 9288 / `f5719fec286ab0fcc88b36d1fcdd24f23c928b3cce75d437e8aa4f195069e03d` | **129 contiguous MPEG-2 Layer III frames × 72 bytes**, 24 kbps, 24 kHz, ~3.096s | 115 frame headers `FFF33464`, 14 `FFF33444`; encoder signature `LAME3.98.2` twice near the end; no ID3/Xing/VBRI tag or trailer |

The MPEG headers differ only in encoded joint-stereo mode extension bits, a standard field. Later compressed audio frames contain long `AA` runs and LAME text; these fit ordinary encoder-side stuffing/metadata. We have **not** established that their entire ancillary payload is fully consumed or proves the absence of a stego channel. No signed instruction selects those runs as secret material. Both JPEGs are valid progressive streams with complete entropy segments and no post-EOI data. Their image pixels were interpreted as the historically recognized book clues.

## Reproduction, controls, and stop

[Single-file Python SFT](../sims/cicada2014_stage08_daughter_source_sft.py) fetches all three historical hex-source objects at the exact pinned commit, validates Git blob SHA-1 and decoded-binary SHA-256, parses all JPEG segment and scan boundaries, checks marker inventories and literal comments, validates each MPEG frame header and length through EOF, and checks end-of-object boundaries. Both file-type parsers have deliberate positive controls that append a byte and demonstrate an externally detectable trailer. It changes neither source files nor the stage's historical interpretation.

[Passing manual-only CI, run 43297786613](https://github.com/FlareZ123/liber-primus/actions/runs/43297786613), Python 3.12, 12 November 2026, exercised this SFT together with the earlier bzip2 parent audit. The format findings above were also independently reproduced by a byte-array parser of the same originals in this invocation.

**Stop decision:** Repeating JPEG/MP3 compression comparisons or unconstrained password/stego hunts supplies no author-selected decoder. This source establishes a known historical book selection. Reopen only on independently sourced creator directions selecting an embedded bitstream codec, reproducible hidden message, or key, followed by a fixed decoding test on at least 40 original unknown LP2 runes and exact forward re-encoding. No unknown-page plaintext, novel LP2 key, or full inverse was found.
