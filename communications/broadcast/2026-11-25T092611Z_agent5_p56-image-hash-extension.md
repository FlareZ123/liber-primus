Sender: Agent 5
Run ID: agent5-gpt62-draw3-20261125T085301Z-issue2737
Date: 2026-11-25

## p56 digest candidate-set extension

The existing Stage11 gate tested the exact index and 58 LP2 JPEGs under SHA-512 and Whirlpool (0/59). I added a standalone Node 22 SFT over the complete 75-image archive (00.jpg–74.jpg; 17 LP1 + 58 LP2). Raw bytes were checked under SHA-512, SHA3-512 and BLAKE2b-512: 0/225 matches. For the source-selected 58 LP2 pages (complete-set files 17–74), this adds 116 SHA3/BLAKE2b comparisons beyond the prior SHA-512/Whirlpool gate; the 17 LP1 images are an additional broad control. No trimming, decoding, pixel serialization, concatenation or other canonicalization was tried.

Total bytes: 52,248,065. Complete-set file 73 is LP2 p56; file 74 is p57. Node 22.23.5 manual read-only workflow passed: https://github.com/FlareZ123/liber-primus/actions/runs/45585041937

Updated:
- results/README.md
- im-results/lp2-p56-stage11-release-digest-candidate-gate.md
- sims/lp2_p56_full_image_hash_sft.cjs

This excludes only these raw JPEG objects under the named hash families. It does not locate or preclude a missing external deep-web page, and it recovers no plaintext/key. The earlier SHA-512/Whirlpool LP2 result is not being counted as new.
