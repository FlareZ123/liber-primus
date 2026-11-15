# LP2 p24/p57 mayfly native-layer source acquisition boundary

**Agent25, 15 November 2026. Director #1032: no original GIMP XCF, PSD, binary alpha mask, or layered mayfly master acquired from the checked surviving public distribution and repository copies.** The established original-image result is unchanged: p57's 576×864 pointillist mayfly is highly predictable from a 2014 GIMP Dissolve field and p24/p26 insect artwork on held-out original pixels. That forward fit does **not** imply that the artist's native layer project survives, or that the remaining dots encode bits.

## What source was checked and what it contains

The directly preserved 2014 LP2 distributor's HTML is [the `2014onion7/index.html` source](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/blob/main/2014/Liber%20Primus/A%20drop%20box%20of%20all%20unmodified%20files/2014onion7/index.html). Its body advertises precisely 58 flattened numbered image paths `0.jpg` through `57.jpg` and no editor project, layer download, alpha mask, source image, or media-distributed XCF link. The same archived delivery directory contains those 58 JPEGs and one `message.txt.asc`, with no native layer project. This is a precise **delivery contract**, not a claim that the author never possessed a native layered project.

Four distinct GitHub tree snapshots were inspected by exhaustive Git tree enumeration, with zero files bearing native layer/editable-art extensions `.xcf/.psd/.ora/.kra/.afdesign/.svg/.ai/.indd/.eps/.blend/.aseprite`:

| Repo snapshot | Git paths enumerated | Native layered-file hits |
|---|---:|---:|
| [cicada-solvers/The-Complete-Cicada3301-Archive](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/tree/main) | 1,455 | 0 |
| [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301/tree/master) | 6,606 | 0 |
| [rtkd/iddqd](https://github.com/rtkd/iddqd/tree/master) | 331 | 0 |
| [cicada-solvers/iddqd](https://github.com/cicada-solvers/iddqd/tree/master) | 331 | 0 |

An additional fifth repository [noxaaa/The-Complete-Cicada3301-Archive](https://github.com/noxaaa/The-Complete-Cicada3301-Archive) duplicates the 1,455-path archive tree and has zero hits. The first archive's `2014/Liber Primus/` subtree comprises 173 Git blob files, of which 165 are JPEG images, three DOCX derived transcripts, two GIFs, one HTML index, one ASCII-armored signed text and one rune transcription; the source asset is **absent from these uncompressed mirrored files**.

The [independent archived LP2 dataset listing](https://mysteriesdept.com/sources/SRC0D7R6VDJ3APG/liber-primus) describes a 9.1MB ZIP containing 58 numbered page images, title/cover/chapter and key images, and `The Instar Emergence` MP3. It does not name a layered master. The original-era source has an additional ambiguity: its illustrations may have been layered *before conversion into a machine-rendered document*, leaving no standalone GIMP XCF. [Dukotah's artifact-production investigation](https://github.com/Dukotah/cicada3301) reports Ghostscript 9.05–9.14-compatible sRGB ICC markers in original JPEGs, consistent with a rasterized authored document. This is a **third-party interpretation of the production pipeline**, not recovery of the native source or a source-to-payload instruction.

### Scope and next decision

The source-native [GIMP-heldout fit](lp2-p57-native576-gimp-heldout-original-image.md) remains positive, but two historical zero-threshold dots have zero predicted alpha and 763 raster cells mismatch its seven-parameter model. Without the true layered master or a creator-authenticated residual framing rule, treating those differences as secret bits would convert a rendering-model error into an arbitrary cipher.

**No native master, alpha channel, byte payload, key, or unknown LP2 plaintext recovered.** No further GIMP parameter search or bit-scanning is licensed by the known artifact. Reopen only upon obtaining a byte-preserved 2014 distribution/editor source or a signed instruction fixing residual extraction. Original archive may have compressed payloads not indexed by Git trees; these were not unpacked, so no claim of exhaustive search over compressed internals is made.
