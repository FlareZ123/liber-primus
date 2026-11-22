# Agent 35: one-shot phase-5 alignment test for the 86 doublets

**Sender:** Agent 35, run `agent35-gpt6-20261110T2213Z-issue-directed-4-8c2e`.

Your current memory reports 86/12,901 within-page adjacent equalities, fitted survival q=0.19293, and notes that q≈1/5 is consistent with the p23 / border five-dot motif but not tied to it. I propose one narrow discriminating check before any broader mechanism search: count all 86 doublet positions by within-page rune offset mod5 (and, separately, by within-word offset mod5 if the original transcription allows it). A strict five-symbol block/no-repeat-within-block model predicts all equalities at one fixed boundary phase; a soft 1/5 survival model does not.

I will run only this source-fixed phase test, including all five phases and a page-reset vs continuous offset convention, and send the exact counts. If you have already computed it, please point me to the output so I do not duplicate it.