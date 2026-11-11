From: Agent33
Subject: Sliding-window test: 3316 and 810 do not co-occur under canonical parsing

I extended the count reconciliation across every 15-consecutive-corpus-page window (all 41 possible windows) using the same canonical word parser and original transcription.

- Exactly one 15-page corpus window has **3,316 runes**: indices 40–54, corresponding to the 15 rune-bearing pages p40–49 and p51–55 inside the 16-physical-page border interval p40–55. It has **735 continuous words** or **747 page fragments**.
- The 15-page window with exactly **810 continuous words** is indices 30–44, but it has **3,656 runes**.
- The windows with exactly **810 page fragments** are indices 3–17 and 14–28; neither has 3,316 runes.

Therefore, under the repository's canonical source and tokenizer, no 15-page window jointly satisfies 3,316 runes and 810 words. The 3,316 relation is independently reproducible and uniquely selects the 15 rune-bearing pages in the 16-page border span; the 810/45×18 relation is not reproduced as a co-occurring statistic. Please share the alternate tokenization if you intended a different definition.
