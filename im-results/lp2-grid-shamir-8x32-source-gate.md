# 32×8 original table: direct 8-share GF256 Shamir reconstruction gate

**Agent 1, 14 November 2026. Classification: a finite, source-motivated
negative, not unknown Liber Primus plaintext or key.**

## Why this one original operation merits a bounded test

The original physical LP2 pp49–51 print 256 two-character base60 numerals
as **32 rows by 8 columns**, faithfully decoded to 256 bytes in
[the canonical source table](../resources/liber-primus/base60-grid.json).
The 2013 Cicada round used *Shamir's Secret Sharing* to combine historically
published partial secret shares, as recorded by the [2013 solution
walkthrough](https://connortumbleson.com/2021/01/25/the-cicada-3301-mystery-puzzle-2/)
and [CicadaSolvers 2013 timeline](https://www.cicadasolvers.com/timelines/).
An eight-column grid could, by hypothesis, represent **eight 32-byte shares**
of one 256-bit secret. The original artwork does not provide explicit share
IDs, a Shamir threshold, or an instruction to apply the 2013 procedure to
this later 2014 numerical table. This is a deliberately restricted consumer,
not an assertion that the source names it.

A real conventional Shamir t-of-8 arrangement over GF(256), with column
labels x=1,…,8, must satisfy a decisive **key-independent polynomial
constraint**: for *every one* of the 32 byte positions, the eight output
values lie on a degree-(t−1) polynomial over GF(256). The first t pairs
determine the polynomial; **each of the remaining 8−t byte values must
match**. This property can be checked without knowing a password or secret.

Two source-natural ways of dividing the 256 bytes into eight 32-byte
shares are frozen: (a) the eight printed **columns**, with one byte per
row per share; (b) eight consecutive **32-byte blocks** in original
row-major order. Try both standard primitive byte-field reductions,
**0x11b** (AES) and **0x11d**, and all thresholds t=2,…,7. The t=5 case
is a history-motivated conventional Shamir threshold; testing the others
is an explicit concession to unknown threshold, without selecting
arbitrary x coordinates or secret reorderings.

## Original-input result

The original first printed byte row is
**203, 231, 167, 186, 97, 237, 126, 183**. In column order with 0x11b and
t=5, its first five Shamir candidate shares predict **x6=96** and
**x7=49**, whereas the source actually prints **237** and **126**.
Already this row violates the necessary polynomial constraint, regardless
of the unknown 32-byte secret.

| Eight-share layout | GF256 polynomial | t=5 matching checks /96 | t=7 matching checks /32 | Fully consistent byte positions, any t=2–7 |
| --- | --- | ---: | ---: | ---: |
| Printed eight columns | 0x11b | **2** | **0** | **0/32** |
| Printed eight columns | 0x11d | **0** | **0** | **0/32** |
| Eight row-major 32-byte blocks | 0x11b | **0** | **0** | **0/32** |
| Eight row-major 32-byte blocks | 0x11d | **1** | **0** | **0/32** |

This is exact original-byte contradiction, rather than an English-language
score. Even allowing an entirely unknown original secret, in all 24
orientation×field×threshold variants **not one of the 32 required byte
positions satisfies the share reconstruction rule**. Both field arithmetic
and Lagrange interpolation are tested using a complete independent
32-byte planted secret: eight genuine t=5 shares reproduce **all 32/32**
secret bytes and **all 96/96** later source-length shares without error
under each GF256 convention.

## What is, and is not, decided

**Retire the direct eight×32 source-layout Shamir interpretation with
x coordinates 1 through 8.** The original 2013 shares had explicit
identifiers and are not themselves reproduced inside the later table.
The source's original 32×8 geometry alone does not select any other
x-coordinate set, transposition, altered byte packing or private key.
This negative does not exclude a genuinely source-specified alternative
share representation, an encrypted/compressed table or the p50 numeric
array serving a different cipher role. No decipherment or destination
emerges.

**Reproducer:** [standalone Node22 CommonJS SFT](../sims/lp2_grid_shamir_8x32_source_sft.cjs),
which checks the unchanged 256 source bytes, runs all twenty-four finite
original tests, constructs two genuine full-secret synthetic Shamir
controls and asserts every stated count.
