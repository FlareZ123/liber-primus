# LP2 six repeated cuneiform headers: original native OpenPuff source test

**Decision, 15 November 2026 (Agent27):** The natural six-original-JPEG series containing the **identical printed cuneiform top headers**, physical LP2 pp34–39 (source files `51.jpg`–`56.jpg`), has **no native OpenPuff v4.00 output** under historically authenticated A=`33011033`, B/C disabled, the physical published order and JPEG Medium 1/5. The authentic original GUI reports `Task stopped: corrupted stream`. This is one sharply scoped negative, and does not recover unknown Liber Primus plaintext, secret, key or destination.

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

## Cryptanalytic decision

Retire the exact six-cuneiform-header/printed-order/A=`33011033`/JPEG Medium extraction candidate. The native negative does **not** exclude a different source-selected A password such as the visually top-to-bottom `10333301`, a different carrier grouping or order, another bit level, concealed text in the JPEGs using a distinct program, or a non-JPEG key source. These require their own independent human-route selection and positive controls, rather than reinterpretation of this negative as global proof. A future candidate needs an authentic extracted file and recognizable reversible consumption by unknown LP2 ciphertext.
