# 2012 twelve-signed versus fourteen-page coordinate discrepancy: original poster recovery gate

**Conclusion (12 November 2026): two additional locations were in the published 2012 coordinate webpage, absent from the independently verified PGP-signed embedded JPG text. One archived poster of *uncertain city attribution* leads to a known, PGP-verified 2012 Britannica book-code instruction; two preserved Seoul photo versions cannot presently recover a complete QR. No distinct key, ciphertext operation, authentic new 2012 message, or LP2 plaintext is recovered.** The mismatch reflects two source editions with different authentication status; it is not a novel 14-symbol indexing instruction or independently justified LP2 key.

## The two exact original page-only entries

| Webpage coordinate absent from signed embedded JPG | Locality | Independent source status |
| --- | --- | --- |
| `37.577070, 126.813122` | Banghwa-dong, Gangseo-gu, Seoul, South Korea | The first Seoul GPS point; community labels poster **found**. The *other* Seoul location, `37.5196666666667, 126.995`, is **already in the 12-line signed text** and is often confused with this one. |
| `36.0665472222222, -94.1726416666667` | W Dickson Street, Fayetteville, Arkansas, USA | Community reports a found 2012 poster, yet the original archived photo named `Arkansas-or-Sydney.jpg` has **uncertain location attribution**. |

The original coordinate JPG's extracted clear-signed payload is authenticated by key fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`, signature created **2012-01-08 22:34:35 UTC**, ahead of the 2012-01-09 17:00 UTC transition to the coordinate webpage. The original website itself was unsigned. First-person solver account [ClevCode (2012)](https://clevcode.org/cicada-3301/) independently explicitly names these exact two page-only additions. The modern reconstructed page is based on a **2015 third-party local-save**, not a byte-preserved 2012 live HTTP response; a 10 January 2012 discussion nevertheless confirms the 14-location list. Full prior authoritative reconstruction: [`im-results/cicada2012-pgp-uid-original-prime-domain-resolution.md`](cicada2012-pgp-uid-original-prime-domain-resolution.md).

The creator may have added two deployment locations after signing the original 12-coordinate JPG, but a source-verified timeline of the edits or an author statement selecting that explanation has not survived. Avoid promoting a plausible reason into a fact.

## Actual original poster photons, not retrospective city labels

The pinned historic [`neuroretransmit/cicada` archive](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/005-845145127.com/img/posters) contains:
- `Poster2012Seul.jpg`, **240×240 JPEG**, Git blob `1aa14c216e3aa0be0977d485b12ef451d599daf4`, SHA256 `fc51d1380c7176cc35ea051954c1b1c3fb116487bb93e0fe6dec40df184a543e`: cicada image and **upper QR only; the bottom is physically cropped away**. The image cannot be fully read by an ordinary QR decoder, a loss of source bytes.
- `Arkansas-or-Sydney.jpg`, **768×1024**, blob `b7734efd01ffbf5f6cc2fceff69afaa95056374f`, SHA256 `c24f7a129dc36051aacfd788b37756a30d9fbf766d30eac123db71610915e5f0`: readable original poster QR, decoded independently with zxing-cpp as `http://845145127.com/162667212858.jpg` in three image conditions. The URL is the **first of the ten filenames** from 11 January 2012's PGP-verified whitespace text, corresponding to already identified Britannica clue family. Its photo is byte-identical to the `Poster_2012 us.jpg` in the independent mirror, which does **not** prove a physical Arkansas origin. No new payload or key.

The independent [`cicada-solvers` mirror](https://github.com/cicada-solvers/The-Complete-Cicada3301-Archive/tree/c3127e0e9eb5afbb582d37988d6369fe38429238/2012/additional%20media/images/The%20posters) also preserves `Poster_2012_seul.jpg`, a distinct **480×360** street photo, blob `026e351774e80a7151fc1eeb3a0f60759c1cf844`, SHA256 `89d1237547bcd65f42630381ec840227d6d82e23f163498b83e16dab4600408b`. The photographed poster is visible behind a bicycle shelter and has a very small blurred QR. Its direct, grayscale and contrast-enhanced barcode decoding all yield no bytes. Its scene supports a poster in a Korean-text street environment, but **does not timestamp or GPS-authenticate which of the two Seoul points** without independent photo metadata.

As additional control, original `Miami-FL-US.jpg` is 2592×1456, blob `3cfe541f033bf99d48cb55c941761f4a919cf50d`; simple unsupervised QR decoding fails due original wrinkles/glare. A QR decoder failure is *not* proof of nonexistence.

All photos were retrieved as exact publicly archived Git blobs, each verified by original byte count and Git SHA1; run [manual original photo recovery 43258347976](https://github.com/FlareZ123/liber-primus/actions/runs/43258347976). The re-run with source JPEGs embedded in logs [43258710237](https://github.com/FlareZ123/liber-primus/actions/runs/43258710237) permits direct visual assessment of the cropped and distant Seoul source images.

## Finite source-frozen attempt at the cropped Seoul upper QR

An additional discriminating experiment freezes the **only ten source-provided 2012 numeric JPG filenames** (PGP-signed whitespace payload). A synthetic QR rendering is generated for those URLs using conventional QR version4 based on the original image's two visible finder-square spacing, standard L/M/Q error correction, all eight standard mask patterns and two legal byte/segmented encodings. Image geometry **(x0=74, y0=169, pitch=2.8)** is calibrated entirely on the two identical QR corner-finder matrices before examining any filename-specific payload bits. Only **204 intact upper QR data samples** are compared at that fixed geometry.

The best of ten filename candidates, `889296759263`, matches **120/204 (58.82%)**; the next `316744223127` matches **113/204 (55.39%)**, a mere **7/204** gap. The predeclared acceptance required 80% and at least 10% separation from runner-up, so this is **inconclusive**, not recovered Seoul QR plaintext or a new unique filename. No alternative shifts/crops/ciphers were fitted after output. The underlying image does not retain its QR bottom and likely has geometric distortion, so this negative applies to the fixed standardized rendering model only.

Reproducers: [`sims/cicada2012_missingcoordinate_poster_qr_sft.py`](../sims/cicada2012_missingcoordinate_poster_qr_sft.py) and [`sims/cicada2012_seoul_partial_qr_10source_gate.py`](../sims/cicada2012_seoul_partial_qr_10source_gate.py), [manual CI 43259508101](https://github.com/FlareZ123/liber-primus/actions/runs/43259508101). No network action touched a live Cicada host, only a public archived GitHub source.

## Research decision

This exact two-coordinate mismatch is **real and historically documented** but **does not provide a new operator, cryptographic key or unknown plaintext**. The only machine-recovered physical-poster route belongs to an existing PGP-authenticated 2012 image and Britannica book cipher, which has already been deciphered. The Seoul QR's preserved version is cropped; the other photo has too little resolution. Physical posters and original GPS readings are distinct sorts of evidence. The source page plus signed JPG remain separate editions.

Reopen the 2012 missing-poster hypothesis only with a **previously unpreserved full-frame original Seoul QR photo, independent dated Arkansas photo or new creator-signed instruction**, then compare their exact decoded output with the already signed ten-filename set. Do **not** attempt LP2 prime/page-coordinate walks based on this historical mismatch or 2012 URL digits.
