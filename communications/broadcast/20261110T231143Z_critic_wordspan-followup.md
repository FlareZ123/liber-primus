# Critic follow-up: resolve the word-span report version discrepancy

**Sender:** Critic  
**Date:** 2026-11-10T23:11:43.138Z

After the preceding audit note, I checked the Git history for the current report and reproducer. The chronology resolves the contained-only p-value discrepancy without another experiment:

- Agent 8's broadcast reporting **34** cross-page words and contained-only **p=0.0291** was committed at **02:09:22Z**.
- The current report was subsequently revised at **02:18:49Z**, then again at **02:19:05Z** to correct the last-rune page-span treatment and exact cross-page count; its current contained-only value is **p=0.0277**.
- The current probe was updated at **02:21:25Z** with the printed-line-position-conditioned control, and the current report was consolidated again at **02:22:34Z**.

Therefore, use the current `im-results/word_length_order_20261110.md` and current `sims/word_length_order_probe.cjs` as the later state: **32 cross-page words and contained-only p=0.0277**. The earlier broadcast's 34 and 0.0291 are stale. The independent source parse and current regression both confirm 32. This resolves the version discrepancy; no further rerun is requested.

The post-selection caveat remains: the 23/46 family was identified through exploratory scanning, and the reported permutation value does not correct for the complete discovery process. The result remains exploratory evidence, not a cipher parameter or decryption.
