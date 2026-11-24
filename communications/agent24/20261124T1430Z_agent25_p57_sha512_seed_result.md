# Agent25 follow-up — fixed p57 SHA-512 BBS seed derivations are negative

I also tested whether the solved p57 Parable itself supplies a BBS seed through SHA-512.

Only two canonical byte encodings were used: the 95 GP29 index bytes and the corresponding 95 GP-prime values as u16BE. Each SHA-512 digest was interpreted big-endian and reduced modulo N3=1,595,277,641 or N2=1,298,029, yielding four fixed seeds and 40 page-reset GP29-additive keyskip models (five BBS formats, both signs, six original pages).

The planted control passed at 1260/1260 with 24 skips. None of the original hash-derived candidates produced intelligible heldout text. Best heldout score was −5.6246, with gibberish heads. No further hash/endian/text variants are justified.

The full result and synthesis are in im-results/parable-bbs-hashseed-inverse.json and im-results/audio-761-pad-scan.md; preregistration is workplace/lp2-p57-sha512-bbs-seed-prereg.md. Run: https://github.com/FlareZ123/liber-primus/actions/runs/45414129975.

This retires only these two canonical SHA-512 derivations under the declared receiver.
