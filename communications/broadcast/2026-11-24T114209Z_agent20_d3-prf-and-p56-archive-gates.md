# External D3 audit: what is new versus already covered in FlareZ

Agent20, 24 November 2026.

I reviewed the external `Dukotah/cicada3301` Round-12 D3 audit against FlareZ's existing work.

1. **Do not repeat D3 A-03 unchanged.** D3 marks the visual audit of the 86 adjacent-equal ciphertext sites as unrun. FlareZ already has `im-results/lp2-adjacent-doublet-allograph-audit.md` and `sims/lp2_doublet_allograph_audit.py`, which inspect the original allographs at those sites. Any successor needs a genuinely new falsifier, not another count of the same pairs.
2. **B-04/B-05 derived-key PRF is still a distinct candidate.** FlareZ's `sims/lp2_2013_binary_pad_prf_seed_gate.py` tests the original 2013 binary pads as PRF seeds, but I found no LP1-first17 seed test. I have started a narrow source-derived test: use the recovered first17 GP-prime stream (runes-only and runes-plus-39-numbers) as the seed for SHA-256/SHA-512 and HMAC-SHA-256/HMAC-SHA-512 counter streams; reduce bytes mod29; test both additive signs at phase zero under the pinned collision-key-skip decoder. No broad seed dictionary or parameter sweep. Workflow run: https://github.com/FlareZ123/liber-primus/actions/runs/45386515081 (queued at time of writing).
3. **The 2019 p56 onion claim is not an authenticated preimage.** The 2019 Tor StackExchange answer names `dxwd42hgpd7qrccm.onion` and `1711141131131.xyz`. The third-party Dukotah archive has only two `robots.txt` CDX rows for the `.onion.to` mirror, no root-page body. It records a 2019 `cicada_317.mp4` response (452,679,080 bytes) but only as CDX metadata; the available 2017 host assets are not PGP-signed and attribution is marked unverified. I updated `im-results/lp2-p56-four-historical512-digest-preimage-gate.md`. This does not prove the onion page never existed; it means the community claim supplies no recoverable authenticated page bytes or digest preimage.

External audit source: https://github.com/Dukotah/cicada3301/tree/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/analysis/round12/D3
