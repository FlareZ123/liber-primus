# LP2 pp49–51: three original-source byte readings against external replacement

**Original-image finding, 11 November 2026.** The repository's printed 32×8 base60 table, not the alternative three-byte `payload_resolved.bin` promoted by [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/pp49_51/CAMPAIGN-VII-FINDINGS.md), agrees with the source JPEGs at **all three disputed indices 45, 50, and 246**. This establishes three source bytes that may be used as key material; no unknown plaintext, key schedule or encryption mechanism is recovered.

| Zero-based table index | Original location | Printed source token | Actual base60 byte | Rival token / byte | Native-JPEG discriminant |
| ---: | --- | --- | ---: | --- | --- |
| 45 | p49 row5 col5 | `1l` | **107** | `1L` / 81 | 8×74 px lowercase-l; binary-identical to index50 |
| 50 | p49 row6 col2 | `0l` | **47** | `0L` / 21 | 8×74 px lowercase-l; uppercase L has a horizontal foot and 26-pixel width |
| 246 | p51 row7 col6 | `3I` | **198** | `3i` / 224 | 8×67 px uppercase-I; binary-identical to independent p49 row3 `3I` reference; lowercase i has detached dot |

Original 2400×3600 scans: p49=archive 66.jpg, SHA-256 `aa3f89156756edf8b796a470a14a3db96516ad2fedf1ed98ccabc1a1cddc0335`; p51=archive 68.jpg, SHA-256 `2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b`. At grayscale threshold 140 the two lowercase-l binary masks coincide exactly (590 pixels each). The target uppercase I and separate p49 uppercase-I reference also coincide exactly (536 pixels each). The p51 uppercase-L control is **26×67 px** with 602 foreground pixels. A true lowercase i from p49 row9 has an **11×11** detached dot and **7×42** stem, absent at the p51 target.

The entire original table's SHA-256 is **`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`**, equal to the existing repository `resources/liber-primus/base60-grid.json` derived bytes. Replacing only these three positions with the independently published candidate produces SHA-256 **`4c8dc85531d256793a6d0d318b8845869b4983e672077b094ed955bde92226d5`**. Different byte hashes matter if the 256-byte stream feeds any downstream cipher; the source selects the former.

**Exact self-test:** [`sims/lp2_p50_three_caseglyph_sft.py`](../sims/lp2_p50_three_caseglyph_sft.py). It verifies the two original JPEG hashes, image component bounds, equal-class foreground masks, independently located uppercase L and lowercase i controls, plus the three canonical JSON cells. This is an image source reading, not OCR or a statistical ciphertext fit.

**Decision:** Retain the existing three original table entries and reject the alternate three substitutions. Do not repeat existing full-table key sweeps. Any genuinely new key/state mechanism must be selected independently of unknown ciphertext and applied to an untouched interval. This evidence resolves only these three cells and does not purport to authenticate other divergent table transcriptions.
