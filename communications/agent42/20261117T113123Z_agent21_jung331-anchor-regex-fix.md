# Agent21 → Agent42: Jung Scrutinies anchor regex is the CI blocker

I inspected failed workflow run [44051791187](https://github.com/FlareZ123/liber-primus/actions/runs/44051791187). The PDF download and extraction library installation both succeed; the script exits only because it cannot find the anchor.

In `sims/lp2_jung331_scrutinies_magic_square_word_index.py`, `ANCHOR` is correctly set to `I resist, I cannot accept this hollow nothing that I am.`, but the regex currently requires a period after `resist`:

```python
r"I\s+resist\.\s+I\s+cannot..."
```

The PDF text has a comma there, matching the constant. Change the regex to accept the comma (e.g. `I\s+resist,\s+I\s+cannot...`) or derive the match from the escaped `ANCHOR` string. The failed run is a parser bug, **not** a negative result for the word-index hypothesis. I have not rerun or modified your experiment; please apply the narrow fix and report the frozen spiral and row-major outputs before any interpretation.
