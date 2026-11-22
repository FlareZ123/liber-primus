# The surviving 2015 ten-field register contains no recoverable second cipher field

**16 November 2026, Agent49. Classification:** exact original-source metadata reconstruction and a missing-information obstruction for Director [#1300](https://github.com/FlareZ123/liber-primus/issues/1300). No unknown LP2 rune plaintext, cipher key, original historical 12-field register or new instruction recovered.

## Question that affects the next solve decision

A 10 February 2015 original participant described an array with **13,173 rows and 12 numerical values per row** and reported shift diagnostics. The only surviving related participant table has **13,041 rows and 10 columns**. The previous source audit [2015 prime/difference route](lp2-2015-prime-delta-40-doublet-source-inversion.md) and closed [#1291](https://github.com/FlareZ123/liber-primus/issues/1291) established that the original 12-field object was absent. Here the genuinely different question is whether **the ten observed fields expose a constrained generating rule that forces the missing two values**.

The two independent 2015 source objects are pinned to immutable commit `e4bdbc24b1d1b5a6462f3332c9a8db785b5c48ec` of `resvolver/c1cada`: `full transcript data/all_data.csv` (Git blob `f864602155cbb645136ab981456adee23fdfbb35`) and `translation/liber_primus.rne` (Git blob `71f775af897a2c9516d0868b520557fda58db311`). They are historical solver artefacts, not creator-authenticated Cicada cipher instructions. No original hidden key is assumed.

## Exact ten-field schema, all 13,041 source rows

Every row satisfies **all** of the following identities with zero exceptions:

| Historical CSV field | Meaning and necessary relation |
| --- | --- |
| unnamed index | Sequential row number, 1 to 13,041 |
| `ttl_pos` | **Exactly duplicates** the unnamed row number |
| `chara` | GP29 index of the rune at this row, 0–28 |
| `l_pos` | 1-based character position within `word`; resets to 1 at the next word |
| `word` | Comma-separated complete sequence of GP29 values for that word, repeated verbatim on every constituent row |
| `w_length` | Number of comma-separated values in `word` |
| `w_pos` | Ordinal of the word within the page; resets to 1 at a new page |
| `page_n` | Participant's historical 1-based rune-page number, skipping the page without runes |
| `word_c` | Global ordinal of the word, increasing exactly once per next word; ends at **2,922** |
| `char_page` | 1-based character ordinal within the participant's page; resets to 1 when `page_n` changes |

In every row, `chara === word[l_pos−1]`. The whole `word` token is stable across its rows; the numerical counters advance deterministically. Thus the entire recorded table is an expanded **rune tape plus word/page boundaries**. Nothing in the ten fields is a separately observed derivative, rolling prime offset, recovered key, cipher state, inferred plaintext, or checkpoint of the 12-field diagnostic.

This is more specific than saying the two missing columns were never found: every one of the surviving 130,410 CSV field cells has an identified descriptive function, and these relationships leave no equation governing two additional unknown channels.

## Independent archival source control and genuine disagreement

The separate 2015 `translation/liber_primus.rne` gives original rune text, punctuation and page breaks. Using the source's GP29 alphabet, preserving the old alternate J rune `ᛂ`, joining a word over a page break where the source lacks a separator, and assigning that whole word to its terminating page **reconstructs the first 729 consecutive original historical CSV rows exactly, in all ten columns**. This reproduces the participant's independently documented original p0–2 chapter length.

The RNE and CSV contain **11 differing rune values** at 1-based rows `1539, 1928, 2088, 3099, 6533, 7794, 8061, 8078, 8705, 8707, 9299`. They also differ in some later word grouping and page membership conventions. Consequently full-book data reconstruction must not silently assume that these two historical artefacts have identical punctuation normalization; the asserted positive control is the first **729** fully matched rows. Both artifacts retain the historical 2015 variant rather than silently substituting the modern original-image transcription.

## Constructive nonidentifiability of a twelve-field extension

Let the observed historical row stream be `C[i]`. Add any two missing columns, for example:

- completion A: `A1[i]=(C[i]-C[i-1]) mod29`; `A2[i]=abs(C[i]-C[i-1])`;
- completion B: `B1[i]=(C[i]-C[i+1]) mod29`; `B2[i]=(C[i]+C[i+1]) mod29`.

Take missing neighbors outside the observed range as GP29 zero. Both constructions reproduce **every recorded ten-field row exactly**, require no free per-row parameters, and have unequal new column values on **13,009 of 13,041** observed rows. Infinitely many different choices are likewise consistent with the surviving CSV. Neither example is claimed to represent the absent original 2015 array.

The actual 13,173-row February object has **132 more rows** than the later CSV. The source-verified arithmetic `95 p57 runes + 36 large marks + 1 imagined F = 132` is a possible typed-event serialization, but the February speaker provided no instruction assigning values or register positions to those event types. That additional ambiguity remains even after mechanically reconstructing all ten surviving columns.

## Decision for #1300

**The missing two historical columns and original 13,173-row transform are mathematically underdetermined from the 13,041-by-10 survivor.** The survivor contains literal GP29 ciphertext and layout counters, so inferring a prime/difference decoder from its field structure would manufacture a novel algorithm. No observation in this source selects the hypothetical missing feature pair, converts large marks into numeric events, or supplies a cipher inverse. Even a constructed pair of fields that matches one reported collision total would be a post-hoc fit without a first-party field definition.

Retire **algebraic reconstruction of the February 12-field values from this ten-field metadata alone**. A genuinely productive successor would require the original February source code/column headings, a contemporaneous worked example specifying outputs, or a distinct creator-authenticated transformation and its exact input contract. This excludes only this archival recovery path, not other LP2 mechanisms.

**Reproduction:** [Single-file, read-only Windows Node22 CJS SFT](../sims/lp2_2015_tenfield_nonidentifiability_sft.cjs). It downloads both immutable historical source blobs, asserts original Git hashes, parses CSV quoted newlines, checks all 13,041 rows, reconstructs the independent 729-row original transcript control, reports exact mismatches, and constructs two incompatible 12-field completions. [Successful Windows GitHub Actions run 43961111731](https://github.com/FlareZ123/liber-primus/actions/runs/43961111731) uses the [manual-only workflow](../.github/workflows/agent49-2015-register-manual.yml). The initial CI run incorrectly asserted twelve instead of the observed eleven source rune disagreements; corrected and successful run is the authoritative result.
