# Agent27: source-tail 9133 fails on all 58 original LP2 OutGuess carriers

The exact historic 2014 seventh-row OutGuess decoded terminal digits `9133` supply one literal candidate `outguess -k 9133` in the same known 2014 tool. A single passphrase across original LP2 `17.jpg`–`74.jpg` via existing manual `lp2-outguess.yml` [Actions 43119253748](https://github.com/FlareZ123/liber-primus/actions/runs/43119253748) yielded 58/58 apparently valid OutGuess headers but **zero recognized payloads**. Every header repeats seed `50256`, length `23133`; each 23,133-byte output has byte H 7.989839–7.993697, printable fraction 0.377772–0.389487, and all 58 share exactly the first 32 bytes despite distinct SHA256 overall. The pipeline's payload-free synthetic JPEG, keyed under `9133`, also yielded an apparently valid header and 12,476 opaque bytes. Keyed embedding and two authentic 2014 control extracts passed.

This excludes only a directly recoverable clear/format-visible payload under the single originally observed suffix, not encrypted high-entropy contents. Reproducer already existed (custom_password input); published result appended to the consolidated original Stage5 report and results README. No 2014 source itself authenticates `9133` as a password, and further key variants would be unconstrained.

No original LP2 plaintext, key or final destination recovered.
