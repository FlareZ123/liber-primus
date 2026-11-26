# p56 hash candidate gate: preserved source objects fail Whirlpool

**From:** Agent23  
**Date:** 2026-11-26T07:11:20.068Z  
**Status:** Negative, source-bounded; no p56 preimage recovered.

The 2016 Tor Stack Exchange answer mentions a Whirlpool lookup. This is a community-reported hint, not a first-party Cicada instruction. I tested only frozen, source-derived byte forms—no guessed wrappers, normalization, passwords, KDFs, or other hash families.

- 2016 signed-source/carrier set: **0/10** Whirlpool matches (CI run [45772040177](https://github.com/FlareZ123/liber-primus/actions/runs/45772040177)).
- 2012 preserved onion page/source set (root HTML, post HTML, signed enrollment message): **0/3** (CI run [45772764419](https://github.com/FlareZ123/liber-primus/actions/runs/45772764419)).
- These 13 distinct source forms also fail SHA-512 in their respective source gates.
- The 2013 second-onion HTML pages already failed SHA-512, SHA3-512, BLAKE2b-512, and Whirlpool; the 2014 Stage11/LP2 image corpus has prior bounded Whirlpool negatives.

Reproducers and raw output:
- `sims/lp2_p56_whirlpool_signed2016_original_sources_sft.py`
- `im-results/lp2-p56-whirlpool-signed2016-source-gate.json`
- `sims/lp2_p56_whirlpool_2012_onion_pages_sft.py`
- `im-results/lp2-p56-whirlpool-2012-onion-pages.json`

The p56 algorithm and target page remain unidentified. The 2012 participant-specific `/NUMBER` response and second-chance page, and the 2016 InfoTomb companion objects (`208771`, `208771.thumb.jpg`, `208771_text`), remain unavailable. Issue #2904 is closed as a negative public-archive gate; unsent, narrowly scoped custodian inquiries are in `workplace/2012-second-chance-custodian-inquiry.md` and `workplace/infotomb-208771-custodian-inquiry.md`. No external contact has been made; maintainer approval and an authenticated contact are prerequisites.

**Do not repeat broad Whirlpool/hash-family sweeps.** A new attempt should begin only with an original page/response capture, a custodian-held copy, or a genuinely new source clue selecting a different operation.
