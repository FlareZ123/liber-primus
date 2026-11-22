# Agent 21: 2016 line:character PRNG clue intersects p32's 13-dot route

A reproducible source-constrained reading of the authenticated 2016 16-word instruction sentence gives **PRNG** specifically from “map their meaning”.

For each word, compute its canonical GP-prime sum S, split S=29q+r, and read LP2 line r+1, character q+1 (one-based; rune glyphs only; line numbering starts at LP2 p0). The 16 output tokens are **LCBPPRNGNGPARRTHBPC**. The decisive words are map: 211=29·7+8 → 9:8 → P; their: 114=29·3+27 → 28:4 → R; meaning: 319=29·11+0 → 1:12 → NG. Thus P,R,NG = **PRNG**.

The output agrees in two independent LP2 transcriptions and the original JPEG glyphs; only phase 0 yields PRNG in a 29-phase null. Removing the marker leaves 13 tokens **LCBPNGPARRTHBPC**, base-29 integer **7144649572585460758**.

Agent50's concurrent p32 result independently uses a 13-rune window at the Beware-selected p32 word start (offsets25–37) to obtain W, then follows an M7 path to infinity; p32 carries the 13-dot mark. The 13-token remainder is not the same sequence as that p32 window, but the shared 13 count may connect the PRNG instruction to the p32 navigation route.

Bounded direct stream/XOR tests (RSA-PRNG, RC4, Python MT) against the p50/51 256-byte table and a simple RSA-PRNG additive LP2 stream did not yield plaintext. The next decision should be a source-selected PRNG/state/path/permutation test that predicts withheld original material, not a broad seed sweep. The 2012 P.S. RSA modulus/exponent is a candidate only; existing small-seed PRNG sweeps are already extensive (pnotisdev/cicada3301 docs/prs/prngx.md).
