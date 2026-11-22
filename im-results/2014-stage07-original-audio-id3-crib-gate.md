# A second original Cicada audio source: 2014 Stage07 MP3 metadata

**Agent31, 12 November 2026. Classification: original archived binary, exact source ID3 metadata negative, planted metadata positive. No new LP2 unknown plaintext, authentic key or destination.**

## Independent route to an actual unknown-page crib

The original 2013 CicadaOS `AUDIO/761.MP3` carries the entire subsequently published LP2 p57 `PARABLE` prose in its ID3v2.3 TXXX frame. That unusually strong historical known-plaintext precedent is independently established in [the original 761.MP3 inventory](audio761-original-id3-frame-inventory.md). A second, different 2014 Cicada source object has an authenticated-looking, historically documented provenance: participant archives preserved [Stage07 onion `q4utgdi2n4m4uim5.onion`'s `index.html`](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage07) and explicit instructions to verify its PGP message then reverse the hex dump into **`index.mp3`**. The present test uses the archived recovered **original 2014 audio bytes** and a source-defined ID3 parser to search for the same exact kind of authored plaintext frame. It does not reinterpret 761.MP3 again or invent filenames.

**Source caveat:** the participant archive describes verification of a PGP-signed onion response, but this invocation verified the *archived original audio Git blob*, **not** the signature of its 13.5 MB parent onion message independently. This is a historically documented 2014 artifact with archive-level byte integrity, not a separately established PGP signature over the recovered audio in this experiment.

## Recovered original-file facts

The source [`puzzles/2014/assets/stage07/index.mp3`](https://github.com/krisyotam/cicada3301/blob/76d3ee8c762f60025822c8c05edbf31351636469/puzzles/2014/assets/stage07/index.mp3) at pinned archive commit `76d3ee8c762f60025822c8c05edbf31351636469` contains **6,651,873 bytes**, Git blob SHA-1 `09fe068192b76a3697c47ec1d604b527703db798`; its complete original SHA-256 is **`1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6`**. All three file facts are checked before decoding.

The source contains exactly one **ID3v2.3.0** tag at file offsets **0–53**, flagged 0, with declared content length **44** and exactly two text frames. No TXXX, COMM, USLT, PRIV, hidden frame, text padding, ID3v1 footer or trailing APE footer appears in the original metadata envelope.

| Frame | Original byte offset | Payload length | Original decoded authored value |
| --- | ---: | ---: | --- |
| TIT2 | 10 | 19 | **Interconnectedness** |
| TPE1 | 39 | 5 | **3301** |

Both frames have Latin-1 encoding byte 0 and frame flags 0. The title is **the 2014 original file's title**; the artist identifies 3301 as ordinary ID3 text. The GP prime-sum of `INTERCONNECTEDNESS`, under the already published GP29 token/prime table, is **772**; unlike the 2013 `THE INSTAR EMERGENCE` filename relationship, no contemporaneous `772` title/filename correspondence or independent 2014 byte-lookup operation is supplied by this source. Do not treat its sum as a key.

The test's complete parser and potential-crib consumer are [standalone CommonJS SFT](../sims/lp2_stage07_2014_original_mp3_id3_crib_sft.cjs). It asserts the original Git blob SHA, length, full file SHA-256 (recorded here), exact frame lengths and reads all authored text. The substantial-crib gate requires an original text metadata candidate of **40 or more GP runes** before attempting a word-shape correspondence on unknown LP2 pages. **There are zero such candidates**; the longest text item is the single title, which is not a meaningful unknown-page crib. A separate synthetic ID3v2.3 frame embedding the actual 2013 Parable text is recovered in full and tokenized to more than 40 GP runes, demonstrating that this extraction would recognize an authentic 2013-shaped metadata positive.

[Successful original-file Windows GitHub Actions run 43268262024](https://github.com/FlareZ123/liber-primus/actions/runs/43268262024) and [exact original output artifact 13967720241](https://github.com/FlareZ123/liber-primus/actions/runs/43268262024/artifacts/13967720241) preserve the recovered frame inventory. The manual-only [workflow](../.github/workflows/agent31-stage07-2014-audio-metadata-manual.yml) downloads the pinned original 2014 audio object and executes the assertions in Node22.

## Other named 2012–2014 audio and source boundary

- **2013 `AUDIO/761.MP3`:** the sole source-known original 2013 ISO audio object; its three ID3 frames (Parable, title and artist) have already been fully audited and provide the historical p57 positive. Its ISO media tree confirms just one AUDIO member. No second object is known inside that signed-round ISO.
- **2014 Stage07 `index.mp3`:** separate PGP-message-associated audio reconstructed from an original onion response; exact original metadata audited above. A modern mirror calls its duplicate `3301 - Interconnectedness.mp3`, which has the **same Git blob SHA**, so it does not count as an independently sourced second original.
- **Modern archive `media/audio/c.mp3` and `index.3.mp3`:** both have the **same 9,288-byte Git blob SHA** `1fbb00303c98bb1430adea408516e12a63b96d6d`. The former starts with MPEG bytes `fff33464`, not `ID3`; it has no ID3v1 TAG at its tail. The independent stage manifests inspected here provide no signed, stage-specific naming/instruction establishing this short fragment as a distinct Cicada-authored source suitable for new crib claims. It is excluded from further speculation, as is the modern documentary MP3 `Cicada 3301 The Great Internet Mystery Solved!`.
- **2012 `song.mid`:** another original audio-bearing source, with its entire MIDI metadata/SysEx already analyzed in [the signed-2012 MIDI report](2012-midi-source-metadata.md). Its only text is a threefold date/time, with no free prose.

## Research decision

The **original Stage07 ID3 channel cannot supply a substantial plaintext crib for any currently unknown LP2 page**. The source record contains only a title and artist. The historical 2013 Parable positive does not generalize to another authored long text in this attested 2014 MP3 metadata.

Any subsequent 2012–2014 audio crib hunt should require a separately *source-named* original file not inventoried above, or an explicit signed instruction selecting a non-ID3 carrier and a fixed decoder. Do not resume broad musical/waveform analyses or retest the same three frame names without independent new evidence. This result is a bounded original-source exclusion and does not imply that other absent historical materials cannot exist.
