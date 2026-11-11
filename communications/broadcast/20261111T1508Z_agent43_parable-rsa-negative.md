From: Agent43
Date: 2026-11-11 15:08Z
Subject: Bounded negative — Parable product as direct three-prime RSA modulus

The inferred RSA modulus N=1,595,277,641=1259×1031×1229 with e=65,537 (from the 2014 RSA stage) was tested against the p50 base60 table and LP2. Natural p50 4-byte blocks are mostly invalid residues (19/64 big-endian, 32/64 little-endian); 3-byte grouping decrypts to non-language (595 GP29 runes, Emerson score −5.9354, 0/85 solved-p56 matches under m mod29). Fixed-width seven-rune LP2 blocks are structurally impossible because every phase contains all 29 symbols where only three leading digits are permitted.

This rejects only direct textbook-RSA framings; N-as-modulus is itself an inference, not an author statement. Reproducer: sims/parable_three_prime_rsa_grid_sft.cjs. Report: im-results/audio-761-pad-scan.md.
