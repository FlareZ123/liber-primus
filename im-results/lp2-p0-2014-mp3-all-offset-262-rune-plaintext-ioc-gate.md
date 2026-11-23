# Entire original 2014 audio as a p0 key: exhaustive *crib-free* 262-rune plaintext test

**Agent43, 23 November 2026. Full exact original-input search; no authentic unknown LP2 plaintext or audio key recovered.** This is a stronger, independent check than the earlier proposed EPIPHANY SEEKS 13-rune crib alignment: it makes **no assumption about the opening words** and tests *every* full opening-page key alignment in the preserved 2014 audio.

## Why this receiver could reveal a real key

The first-party PGP-authenticated 2014 Stage07 hexadecimal payload reconstructs the exact original `Interconnectedness` MP3. Its 6,651,873 bytes (SHA-256 `1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6`) are a surviving historical potential pad source. The same audio's approximately 262-second repeat period has independently led researchers to notice that the **original LP2 opening page p0 has exactly 262 runes**, although the timing-to-page mapping remains conjectural. Original 2013 Cicada used an MP3's literal bytes in a true XOR stage; applying 2014 bytes as a GP29 additive keystream is an explicitly **unselected mode hypothesis**, tested because a genuine key would yield a clear decisive *language-distribution and whole-page* signal.

Take all **262 unchanged source p0 GP29 cipher indices**, preserve their order, and let `P[i]=(C[i]+sign*B[a+i]) mod29` for a contiguous audio offset `a`. The two fixed direct byte projections are `B[j]=audio[j]%29` and `B[j]=floor(29*audio[j]/256)`; both `sign=−1` and `sign=+1` are included. Search **all 6,651,612 eligible starting offsets** for each of the four modes, **26,606,448 complete candidate plaintexts**. Every candidate is scored by the exact normalized GP29 index of coincidence (IoC) over all **262** runes; this grammar-independent statistic would preserve a naturally biased GP-English alphabet even if original word separators were shifted. No dictionary, title crib, key rank, page-end constant or hand-tuned offset is used.

A separate genuine-native language positive is built from the already-solved **95-rune p57 PARABLE** plaintext, repeated in original GP29 indices to fill exactly262 positions. Its ground-truth IoC is **0.06794185604**. Using the *original audio bytes* at independent byte offset **1,234,567**, the test encrypts that native text under each of all four modes, then decrypts at the known planted offset; each exactly regains its predicted full native-GP IoC. This is a mathematical positive showing the receiver can recognize real English-shaped plaintext when the nominated key law is true, without having to guess an English crib.

## Observed exhaustive original results

The complete native Windows Node.js 22 execution [run 45161168117](https://github.com/FlareZ123/liber-primus/actions/runs/45161168117) **passed**. Original file SHA-256, byte length, all p0 runes and solved p57 plant are asserted by the read-only [single-file CommonJS reproducer](../sims/lp2_p0_2014_audio_alloffset_262rune_plaintext_ioc_sft.cjs).

| Projection | Sign | Highest observed source p0 IoC | Byte offset achieving maximum | Number of offsets with IoC ≥0.044 |
| --- | ---: | ---: | ---: | ---: |
| `byte %29` | −1 | **0.04202860** | 4,728,660 | **0** |
| `byte %29` | +1 | **0.04243807** | 6,140,557 | **0** |
| `floor(29*byte/256)` | −1 | **0.04360797** | 633,915 | **0** |
| `floor(29*byte/256)` | +1 | **0.04191161** | 4,403,511 | **0** |

The exact threshold printed by the count script is the smallest attainable lattice IoC **≥0.044**, namely **0.044002807756**. There are no hits at this or any more demanding printed threshold under any of the four modes. The extreme best candidate, **offset 633,915** in the scaled/negative mode, begins `F T EO U B EA EO IA B P A EA TH EA G E Y TH EO IA L U W T R IA IA` in canonical source GP rune-label order, not a coherent message. This highest result is an empirical extreme selected from millions of overlapping key phases, so its numerical value is **not** a successful plaintext indication.

The authentic solved-language plant has IoC **0.06794**, far higher than **every** original decoded candidate. For added calibration the original counts exceeding the lower score bands are:

| Source mode | Candidate offsets with IoC ≥0.04001 | Candidate offsets with IoC ≥0.04201 |
| --- | ---: | ---: |
| mod29, − | 187 | 1 |
| mod29, + | 199 | 3 |
| scaled, − | 218 | 2 |
| scaled, + | 197 | 0 |

These are whole **262-rune** candidate scores, not single-crib or isolated-word matches; the exhaustive source frames overlap and must not be counted as statistically independent trials.

## Decision and sharp scope

The complete authentic 2014 Stage07 audio has **no contiguous raw-byte phase** yielding a GP-English-like p0 paragraph under either of the two natural byte→GP projections and either additive direction, irrespective of whether the red title says *EPIPHANY SEEKS*. This **rejects the direct full-page raw-MP3 additive pad architecture** as a credible plaintext source for p0 under native-GP language statistics. It does **not** rule out an audio-frequency instruction, hidden OpenPuff payload, non-GP plaintext, a keyed generator or a nonadditive cipher. Such alternatives require new independent original-source cues; free phase and alphabet sweeps are not justified by these negatives.

The complete source-input SFT computes and ranks all candidates, while native CI confirms the highest score and positive plant, allowing future agents to stop repeating raw-audio page-start and offset searches.
