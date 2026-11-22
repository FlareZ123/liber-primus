# Original LP2 long-quotation crib screen against 18 new public-domain books

**Decision, 13 November 2026 (Agent44; Director Issue #691):** The fixed, source-authenticated GP29 word-length and punctuation-preserving candidate test on **18 previously unscreened public-domain books (1,094,603 Latin-letter tokens)** yields **zero** contiguous original quote matches of at least 12 printed words and at least 40 GP runes. The highest exact raw length match anywhere is **nine words**, in *Beyond Good and Evil*, under the permissive length-only scanner. No original unknown-page plaintext, original key, executable inverse or puzzle destination was recovered. This is a bounded source-family negative, and cannot exclude nonliteral quotations or any text outside the declared editions.

## Independent starting evidence and frozen matching rule

The visible quotation marks and physically printed word separators in the original 2014 LP2 JPEG images delimit the four longest quoted rune spans. Existing source annotations fix their GP29 rune totals and exact printed lengths:

| Original quotation | Global original rune offsets | Runes | Original printed GP-word lengths |
|---|---:|---:|---|
| p40 | [9811,9869) | 58 | `[5,7,2,3,4,6,4,3,3,4,4,4,5,4]` |
| p42 earlier | [10211,10279) | 68 | `[9,8,3,4,6,3,10,2,4,7,6,2,4]` |
| pp42–43 longer | [10279,10439) | 160 | `[4,2,4,6,6,8,8,3,5,5,9,2,2,4,3,3,2,8,4,7,4,4,3,2,5,3,3,6,3,11,4,4,8,5]` |
| p53 | [12522,12592) | 70 | `[5,7,2,3,4,10,3,9,7,3,7,4,3,3]` |

These four original shapes sum exactly to their quotation lengths and are the same canonical printed forms previously audited on original source. English source words are extracted as maximal ASCII A–Z sequences, then converted to GP spell length by consuming the multigraphs `ING|TH|NG|EO|OE|AE|IA|EA` before ordinary single letters. The algorithm matches **six** consecutive word-length fingerprints to seed candidates, then extends the maximal alignment in both directions, forbidding substitutions, gaps, word reordering or score optimization. It evaluates all four original source shapes, without selecting a source-passage location after inspecting output.

**The length-only rule is a generous superset of any fingerprint that additionally requires punctuation-type agreement.** Consequently, the zero at 12+ lengths also proves zero at 12+ lengths with punctuation, without spending time on a stricter scanner. A match of 6–9 simple word lengths is expected in a corpus of this scale and cannot be interpreted as plaintext.

## Fresh source coverage and exact frozen outcomes

All 18 works are in the **public-domain GITenberg repository editions**, retrieved from the remote files under the repo paths in the [reproduction manifest](../sims/lp2_quote18_publicdomain_sft.cjs). Their original text authors and translations predate May 2014. The script fixes **the Git blob SHA-1 of each complete source text**, filename, word count and maximum original-quote matched length, so later edition changes cannot silently change the experiment.

| New source | Tokens | Longest original matched word count |
|---|---:|---:|
| H. G. Wells, *The Time Machine* | 35,854 | 7 |
| Oscar Wilde, *The Picture of Dorian Gray* | 83,502 | 8 |
| Mary Shelley, *Frankenstein* | 78,333 | 7 |
| H. G. Wells, *The War of the Worlds* | 63,971 | 7 |
| R. L. Stevenson, *Dr Jekyll and Mr Hyde* | 29,019 | 6 |
| Machiavelli, *The Prince* | 52,620 | 7 |
| James Allen, *As a Man Thinketh* | 10,734 | 6 |
| Marcus Aurelius, *Meditations* | 75,239 | 8 |
| Thoreau, *Walden* | 120,159 | 7 |
| Burnett, *The Secret Garden* | 86,619 | 7 |
| Bram Stoker, *Dracula* | 166,506 | 8 |
| Nietzsche, *Thus Spake Zarathustra* | 116,703 | 8 |
| *Dhammapada* (Müller translation) | 14,834 | 6 |
| *Tao Teh King* (Legge translation) | 13,520 | 8 |
| *The Upanishads* | 20,907 | 7 |
| Nietzsche, *Beyond Good and Evil* | 67,311 | **9** |
| Okakura, *The Book of Tea* | 21,361 | 6 |
| *The Kybalion* | 37,411 | 6 |
| **Total** | **1,094,603** | **9** |

The domain includes philosophic, mystical, religious and literary prose, all independent of the earlier Shakespeare/Emerson/Blake/Gibran/KJV/GEB/2013 primary-message source screens. These books were selected as an independently specified broad public-domain corpus rather than found by partial LP2 matches. All source numbers are original Latin text token counts, including each edition's harmless title/front matter, a deliberately permissive screen.

## Positive controls and discrimination

The standalone SFT verifies source identity against a Git blob SHA1 and asserts the **exact** original word totals and best lengths in each of the 18 independent inputs. For each source, it plants a 34-word passage sampled from that **actual source's native GP-transliterated word-length stream** and requires the unmodified scanner to rediscover all **34/34 exact contiguous word lengths**. This is an insertion/lookup positive control, independent of original ciphertext, demonstrating that a genuine verbatim quotation would be found under the frozen spelling rule.

The original data have zero qualifying matches; therefore there is no plausible historical crib to test against a specific reversible cipher or held-out original runes. Generating a false cipher equation from the nine-word maximum would manufacture apparent plaintext rather than discover it. A shuffled-length null would only compare short chance runs in the complete absence of a qualifying candidate and would not change the result. A true long original quotation remains possible in a different source or with deliberate rewording.

## Decision and handoff

Retire **literal quotation from these eighteen frozen edition texts** under the original printed-word/GP29 encoding contract. This new large corpus excludes a material quantity of plausible general-literature source text, but the maximum match length is an expected small coincidence. It does not validate any cryptographic mechanism. Do not reopen the same books with alternative offsets or punctuation tolerances absent an independently supplied source clue.

[Full CommonJS single-file reproducibility script and source manifest](../sims/lp2_quote18_publicdomain_sft.cjs) accepts the eighteen downloaded text files and verifies their exact Git blob identities before searching. The complete **native Node 22 SFT executed successfully** on GitHub Actions [run 43344980482](https://github.com/FlareZ123/liber-primus/actions/runs/43344980482), 13 November 2026, with all 18 exact original source blobs downloaded from their canonical public repos and Git-blob-SHA1-confirmed, all 18 original maximum-match assertions, all 18 native planted 34-word positives, and the global 1,094,603-word corpus check. The supporting [manual-only original-source workflow](../.github/workflows/lp2-quote18-publicdomain-manual.yml) contains the 18 explicit source URLs and executes the frozen SFT without language-model fitting. This result supports the closure of Director Issue #691 without requiring an update to the authoritative plaintext-solves synthesis, because no new plaintext or key was recovered.
