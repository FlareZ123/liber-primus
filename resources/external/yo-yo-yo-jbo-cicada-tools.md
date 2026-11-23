# External prior-work reference: yo-yo-yo-jbo/cicada_tools

**Repository:** https://github.com/yo-yo-yo-jbo/cicada_tools  
**Inspected:** 23 November 2026  
**Default branch:** main  
**Latest commit inspected:** 717625c5c742a706149a4aedd4e5e7d4d92fdd71 (2024-10-16)  
**License metadata:** GitHub reports no declared license. Do not copy or redistribute its code without resolving licensing.

## What it contains

The README describes a Python research toolkit for Liber Primus, with a structured page/section model and transformers that preserve punctuation and word boundaries. It states three hypotheses: whole-word processing, digraph processing, and differential treatment of consecutive letters (with Playfair as an analogy). These are historical heuristics, not established properties.

The 34 methods in experiments.py cover a broad prior-work inventory:

- Prime/totient/sequence keystreams: sentence cribbing, totient and double-totient indices, missing 2013 primes, OEIS, page-15 prime/Fibonacci functions, spiral-square walks, prime-indexed totients, Fibonacci, and descending/ascending primes.
- Classical/keyed transforms: modified autokey, Vigenere with variable grouping, Vigenere/autokey dictionary attacks, Hill, Alberti, key-switch Vigenere, GP-value autokey, mixed-alphabet autokey, and frequency-based n-gram substitution.
- Source-specific experiments: GP word sums, solved-section reuse, prime-indexed positions, cuneiform keystreams in base 59/60, OutGuess dictionary attacks, and page-15 square operations.
- Other searches: ASCII cribbing, mathematical-constant streams, rune differences, all-word-start keystreams, and a Pastebin deep-hash brute force.

The companion secrets.py defines the p56 deep hash, the 5×5 “Some Wisdom” and “An Instruction” matrices, the p15 4×4 matrix, the 2014 7×7 matrix, a 2013 missing-primes list, and a 180-token base-60 cuneiform stream. Treat these as a community transcription/encoding, not primary evidence; compare against the original sources and this repository's canonical resources before reuse.

## Relevance to this project

This repository is a useful historical inventory and independent implementation to consult when assessing whether a proposed transform has already been tried. It did not expose a new plaintext or authenticated key during this inspection.

Its README's Playfair-like digraph hypothesis should not be treated as a new lead by itself. This repository's current research already contains dedicated negative gates for Playfair, Bifid, Trifid, fixed digraph bijections, and related GP29 pair operations; see:

- im-results/lp2-p55-5x5-polybius-bifid-playfair-gate.md
- im-results/lp2-playfair25-allsecret-pair-obstruction.md
- im-results/lp2-bifid25-allsecret-period2-exclusion.md
- im-results/lp2-fixed-digraph-bijection-gate.md
- im-results/trifid-27cube-allsecret-bound.md

The useful contribution here is the external experiment inventory and a record of its assumptions. Do not rerun its generic brute-force families without a new source-selected key, operation, or discriminating prediction.
