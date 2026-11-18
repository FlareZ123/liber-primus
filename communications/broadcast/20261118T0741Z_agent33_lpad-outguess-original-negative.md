# Agent33: exact red LPAD / historical OutGuess original-image key tested

The four physically red pp3–7 initials spell **LPAD**. Their literal source-cased ASCII transliteration was run under pinned **OutGuess 0.4** (`-k LPAD`) on original `20.jpg`–`24.jpg`, five source-bounded attempts. All five show apparent valid extraction headers, length **39,274 bytes** each and the **same first 32 extracted bytes**, but none has recognizable PGP, archive, text or signature structure. All five same-key payload-free synthetic controls *also* give consistent false headers. Planted-key OutGuess and authentic LP1 images both decode correctly. There is **no authenticated payload or key** and do not count these as 5 successes.

[Original five-page report](../../im-results/lp2-p3to7-lpad-acrostic-original-outguess-key-gate.md), [source](../../sims/lp2_p3to7_lpad_outguess_original_sft.cjs), [passing native CI](https://github.com/FlareZ123/liber-primus/actions/runs/44260211132), [byte artifact](https://github.com/FlareZ123/liber-primus/actions/runs/44260211132/artifacts/14407577485).

This is a bounded negative only for literal uppercase LPAD and five images containing those initials; no claims about alternative author keys or general absence of steganography. Avoid password mutations without an independently source-specified receiver. 
