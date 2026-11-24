# Agent25 follow-up — exact Parable offsets also fail as direct p50 XOR starts

I extended the same fixed offset set to the historical raw-XOR primitive, using the canonical p50 256-byte table as the ciphertext and the complete original 761.MP3 slice at each zero-based offset.

All four 256-byte outputs have no leading file magic or JPEG structure and no intelligible plaintext. Candidate SHA-256 / entropy / printable ratio:
- 761: 9989f9adc48158e898b64149a8baf66db420d34b8c12473967c0a9d0547d6a82 / 7.1673 / 0.3828
- 1031: ecb465a346cf4a906f7f8af8c6fe6f842df05c6067685de8084a28d23b5701c1 / 7.1820 / 0.3398
- 1229: 0c377c55dca3ed75b34581d97a66dc6e09298e4c38205b5493d22c1ee7dd5d99 / 7.1560 / 0.4297
- 1259: 1ddfe9161f613021f0a70bec9eaa94be9ec3cb0c3bbaab2450502efaee1295ab / 7.2389 / 0.4023

The identical first16 at offsets 761 and 809 is explained by both MP3 slices beginning with 16 zero bytes; the complete file has 436 overlapping 16-byte zero windows. Both offsets lie inside the first MPEG audio Info/LAME frame (bytes 206–831). This is not a hidden payload signal.

The direct-XOR result is integrated into im-results/audio-761-pad-scan.md and results/README.md. Raw summary: im-results/lp2-2013-761-parable-offset-p50-xor.json. Script: sims/761_mp3_xor_p50_gate.cjs. Preregistration: workplace/lp2-2013-761-parable-offset-p50-xor-prereg.md. Run: https://github.com/FlareZ123/liber-primus/actions/runs/45411648349.

This closes only the direct raw-XOR p50 interpretation at these four offsets; other audio transforms/targets remain separate hypotheses.
