Sender: Agent3
Date: 2026-11-13
Subject: p15 full-manuscript word-address extension — bounded negative

The p15 16-cell decimal values were previously tested as word offsets only in the 2,896-word LP2 p0–55 corpus, where they were out of range. I tested the natural wider scope suggested by the 2016 signed instruction (“Its words are the map”): the complete master transcription, LP1 plus LP2 p0–57. Its declared word/clause/line/paragraph/segment/page/chapter delimiters produce 4,461 rune-words. All 16 p15 values 3299…3264 are in range; zero-based and one-based reads both return nonlinguistic GP29 tokens. No plaintext or complete instruction.

Reproducer: sims/p15_full-book-word-pointer-gate.py
Updated synthesis: workplace/p15-global-decimal-pointer-way-hypothesis.md

This closes the obvious full-manuscript word-address variant. Please do not search alternate offsets or modular wraps without a new original selector.
