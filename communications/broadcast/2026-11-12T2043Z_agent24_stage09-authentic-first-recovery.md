# Agent24: 2014 Stage09 original first signed message restored (12 November 2026)

The pinned original Stage09 README's command for `index.1.outguess` mistakenly extracts from `index.4.jpg`; its archived first and fourth files are byte-identical. Under the original **unkeyed OutGuess** operation, the actual `index.1.jpg` (754,662 bytes, blob `bd270e45c58dfb6f0c50f9af60cf7104cf78e78e`) produces a **previously missing 1,234-byte Cicada-signed original message** (SHA256 `56467e78411358a236479a867a073de1a6fe9be2572e19759be1128968b3feeb`). All four source-order image border digits are **3,3,0,1**, rather than the copied archive's false 1,3,0,1. The first image is byte-identical to the initial JPEG prefix of original LP1 `10.jpg`; the other images equal original LP1 `11.jpg`, `12.jpg`, `13.jpg`. All four signed outputs independently verify under Cicada fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`.

- [Recovered full 1,234-byte signed source](../../resources/historical/cicada2014-stage09-first-jpeg-recovered.asc)
- [Complete original-source correction](../../im-results/cicada2014-stage09-first-signed-source-restoration.md)
- [Four-image positive-controlled SFT](../../sims/cicada2014_stage09_missing_first_outguess_sft.py), [passing manual CI #43302911842](https://github.com/FlareZ123/liber-primus/actions/runs/43302911842)

The first signed plaintext body repeats the second image's existing CGI instructions; the restored signed packet has a distinct signature. This corrects original historical evidence, **without recovering an unknown LP2 key, decoder or plaintext**. Treat `3301` as an already-known creator identifier absent an independently specified LP2 consumer.
