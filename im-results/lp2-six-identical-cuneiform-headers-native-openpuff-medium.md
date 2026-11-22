# LP2 six repeated cuneiform headers: two exact source-password native OpenPuff tests

**Updated 22 November 2026 (Agent13 building on Agent27, 15 November).** The source-exact six-original-JPEG series with **six byte-identical top cuneiform headers**, LP2 pp34–39 (`51.jpg`–`56.jpg`), has **zero native OpenPuff v4.00 outputs** under either historical A=`33011033` or the visibly ordered alternative A=`10333301`, with B/C disabled, physical published carrier order and JPEG Medium `1/5`. Both original GUI runs end in `Task stopped: corrupted stream`; all selected cover capacities and separate planted native OpenPuff JPEG positive controls pass. The direct cuneiform-password six-cover interpretation is closed for these two independently sourced password choices. No unknown Liber Primus plaintext, secret, key or destination was recovered.

## Original-source selector and proposed human route

The introductory p33 image `50.jpg` has a differently placed cuneiform illustration. Each of the six *following* p34–39 images `51.jpg`–`56.jpg` reproduces the same 1033-over-3301 cuneiform header at precisely the same pixel position; [source-original quantized JPEG test](issue344-cuneiform-historical-template-gate.md#six-header-quantized-dct-extension-agent27-15-november-2026) proves **10,752,000/10,752,000 identical top-header quantized JPEG coefficients** across the six images. The source thus defines a six-image group separately from the broader **seven-page** p33–39 chapter already tested. A human who knows that Cicada previously used OpenPuff and the original 2014 password `33011033` could reasonably try this six-cover chain after seeing the repeated 3301/1033 header.

The **complete original-byte inputs** are GitHub blobs `e6249fa4cf3a1163d2ef3b38dbed59a886a4d94c`, `aec165a24c007299422e52e3480c70dbca63b9dc`, `f8ddd9776975cd5d34de96eb8cb35e2de48c6a56`, `ff7e60c2a574512200bea0f49d76808ecfb3e21f`, `10ab76d6c31ea348bbc0f906adf6caac61398dc2`, `819261c833837cbaa2bd200d210ca299d79031f3`, in numeric ascending order. The exact source-byte identities were asserted at runner time.

## Actual original-source inverse and controls

[Completed original Windows runner 43694389109](https://github.com/FlareZ123/liber-primus/actions/runs/43694389109) uses the *original* OpenPuff v4.00 PE/dll pair, rather than a rewritten approximation, with a same-run **35-byte authentic publicly authored OpenPuff JPEG positive** that reproduces `Dies ist eine versteckte Nachricht!` byte-for-byte. The historically verified A-only `33011033` password is additionally independently confirmed by the older **745-byte 2014 Interconnectedness MP3 recovery**; it was held fixed without guessing new passwords for this test. The [manual-only exact source workflow](../.github/workflows/openpuff-v400-lp2-six-cuneiform-header.yml) and [complete GUI/output artifact](https://github.com/FlareZ123/liber-primus/actions/runs/43694389109/artifacts/14154280364) preserve all selected paths, UI states and output bytes.

| Source-original observable | Native outcome |
| --- | --- |
| 2014-compatible OpenPuff JPEG same-run control | **35/35 known bytes recovered** |
| Original carrier list | **6/6** correct, in printed 51–56 order |
| Original JPEG encoding and bit level | `Jpeg (Image)`, `1/5 (20%) - Medium`, verified |
| Password | A=`33011033`, B/C disabled, historical 2014 positive established |
| Combined usable capacity reported by native tool | **8,080 bytes** |
| Native original Unhide | `Task interrupted - Error`: **corrupted stream** |
| Original LP2 extracted output files | **0** |

The source-selected six-image capacity is 8,080 bytes, enough in principle to hold the **7,868-byte ideal binary bit-packing** of all 12,956 GP29 unsolved ciphertext runes, though such a file would also have OpenPuff framing overhead and this numerical proximity **is not evidence of a hidden payload or a key**. No author instructions identify an embedded book-length pad or require OpenPuff on this group. The distinct seven-image source chapter `50.jpg`–`56.jpg` has been tested at the *same* A/Medium with **9,344-byte** capacity, also native corrupted stream; dropping the nonidentical introductory carrier is a genuinely different cryptographic input and was the precise decision this test resolved.

## Alternative directly printed password `10333301` (22 November)

The **same frozen six-cover original carrier chain** was run again, this time with the alternative password **`10333301`**, obtained by reading the repeated physical cuneiform numbers **1033 above 3301** in their top-to-bottom visual order. This is a genuinely different source-written 8-character password from the historically used **`33011033`**; it was explicitly exposed as a separate selectable input in the original manual-only workflow before this run. No carrier reorder, title-page inclusion, bit-level scan, per-JPEG password or language-score fitting was allowed.

The independent [successful Windows/32-bit native OpenPuff v4.00 run 45032106885](https://github.com/FlareZ123/liber-primus/actions/runs/45032106885), [original GUI screenshots and entire run evidence artifact 14758246385](https://github.com/FlareZ123/liber-primus/actions/runs/45032106885/artifacts/14758246385), reports:

| Direct visible-order source input | Original native outcome |
| --- | --- |
| Password A `10333301`, B/C disabled | Exactly as specified |
| Original six printed-order identical-header JPEGs | **6/6**, all byte-identity hashes passed |
| JPEG format/bit level | `Jpeg (Image)`, `1/5 (20%) - Medium`, GUI selection verified |
| Combined original carrier capacity | **8,080 bytes** |
| Known original-software JPEG positive control | **PASS**, exact 35-byte recovered payload |
| Native original Unhide | `Task interrupted - Error`: **corrupted stream** |
| Actual hidden output files | **0** |
| Inconclusive timeout | **No** |

The full native original input has therefore failed for **both** natural 2014-relevant A passwords at the same physically selected six-image carrier chain. The result is conclusive for this **specific source-guided native extraction contract**, without declaring that the original image bytes contain no other hidden content. A separate pinned-source [OutGuess passphrase 10333301 original corpus-wide test](outguess-lp2-keyed-source-headers.md) also recovered no authenticated source message, with its own payload-free synthetic JPEG falsifying the tool's frequent false-success headers. These tools and their outcomes must remain distinct.

## Cryptanalytic decision

Retire the exact six-cuneiform-header/printed-order/JPEG Medium **native OpenPuff** extraction with either **A=`33011033` or A=`10333301`**, B/C disabled. The alternative top-to-bottom key is now **tested**, rather than an untested suggestion. Other carrier groupings, byte-level settings, steganographic formats or independently supplied keys are logically possible but lack a matching first-party instruction; reselecting such parameters after observing two corrupted streams is not a solution method. A future candidate must recover an authentic extracted file and a reproducible plaintext or key consumer on the original unknown LP2 ciphertext.
