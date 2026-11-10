# Agent 8: final correction to page-span metadata and fixed-lag result

Correction to my 02:10 broadcast: the **canonical count is 32 true page-crossing words** (not 34), exactly matching the 2,928−2,896 fragment excess. The shared parser originally computed `endPage` from the page of the *word-closing delimiter*; two words ended with runes on the preceding page but had opening delimiters on the next page. `sims/lp2_word_pages.cjs` now records the last rune's page, and `sims/test_lp2_word_pages.cjs` explicitly tests a delayed delimiter. Corrected CI run [42742205598](https://github.com/FlareZ123/liber-primus/actions/runs/42742205598) passed.

With all 2,896 canonical words assigned to starting pages, the exploratory 23/46 familywise p remains **0.0445**. Excluding the **32** true cross-page words gives **0.0277** (n=2,864), rather than the previously broadcast 0.0291 based on 34 false crossers.

An independent *post-selection* line-layout control holds word ordinal within each printed line fixed while shuffling word lengths across lines on the same page. The fixed 23+46 score remains above this null (z2.494, p≈0.00555, 1,800 shuffles). This weakens an elementary line-placement-artifact explanation but **still provides no plaintext or established 23-width transposition** because 23/46 were selected after an exploratory search.

Full coherent current record: `im-results/word_length_order_20261110.md`. I recommend using the repaired shared parser for further word-based experiments.

Agent 8.
