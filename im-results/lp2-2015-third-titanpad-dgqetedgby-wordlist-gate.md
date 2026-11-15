# January 2015 third-Titanpad wordlist and key-phrase outputs: no selected unknown-page inverse

**Source-bounded decision (15 November 2026; Director #898 and #1027).** The historical `resvolver/c1cada` repository preserves a 2,745-entry rune-word list, the original `guess_key_phrases.py` program, and **seven distinct automatically generated output filenames** from 16–23 January 2015. Their commits preserve inputs and exhaustive local shift previews, but **no saved selected offset, original unknown-page plaintext, historical key or creator-specified next operation**. Source history improves the account of what contemporary participants tried; it does not license another PARABLE/key search.

## Original code and the third pad

The [16 January 2015 initial source commit `42d33941`](https://github.com/resvolver/c1cada/commit/42d33941f0f03223c01fe052c0ae91a7a4981eb5) introduces:

| Original path | Original Git blob | What it proves |
| --- | --- | --- |
| `liber_primus_words.rne` | `ca6feaad2996fb6f6514bc89821d1c5861b83af7` | 2,745 newline-separated observed rune strings of length 1–14; no paired English, numeric cipher key or plaintext |
| `guess_key_phrases.py` | `57521a8901efae0e6d655838a5846b6996ff2a27` | Initial experiment uses hardcoded `PARABLE`, first visual section, every contiguous starting offset and both additive GP29 signs |
| `key_phrases/PARABLE.txt` | `86e2516834e511a0c83fe9c0f8564d8c9298e8d5` | Two identical generated blocks, each 814 starting offsets with two roughly ten-GP-rune previews; duplicated by append mode rather than independent success |
| `transcriptions.rne` | `7bd19a63524439ad998984ab6bb432e1ef44eff3` | Participant transcription, not first-party decoded plaintext |

The author explicitly attributes the wordlist to `https://titanpad.com/dgqETedGby` and the transcription to `https://titanpad.com/hJ8pVQ5S43`. Their provenance is a participant-editable resource, with no independently recovered creator-authenticated instruction. `get_liber_primus_words()` is **defined and never called** by the experiment, so the wordlist cannot have selected the saved candidates.

The code's complete operation is `output[j] = C[offset+j] ± GP29(key[j]) (mod 29)` for one key-length window, with printed dot markers retained as spaces. It restarts at every possible offset, writes `Forward` and `Backward` previews, and appends to an output file. It never decrypts a whole unknown page with a recovered running key, never authenticates a match, and never distinguishes a winner.

## Subsequent 2015 commit history: the surviving outputs are trial tables

The [original path histories](https://github.com/resvolver/c1cada/commits/master/guess_key_phrases.py) establish that the script changed only on **16 January 2015**, when it gained a section argument and explanatory comments; its later [final form](https://github.com/resvolver/c1cada/blob/2993682c9e03aa60108e21bae86ff1c7c0119165/guess_key_phrases.py) still lacks any candidate selector. The saved `key_phrases/` directory includes:

| First commit (UTC) | Preserved output | Interpretation of supplied key / target |
| --- | --- | --- |
| 16 Jan 08:04 | `PARABLE.txt` | Hardcoded title `PARABLE`, section 0; 3,260 output lines including two repeated blocks |
| 16 Jan 08:51 | `PARABLE_0.txt` | The same phrase and section after adding section-number filenames, 1,632 lines |
| 16 Jan 16:30 | `ANENDWITHINTHEDEEPWEB_8.txt` and `WELCOMEPILGRIMTOTHE_8.txt` | Already known p56 / earlier LP1 plaintext fragments tried as *keys* on unknown visual section 8, 714 and 716 lines |
| 20 Jan 15:34 | `ENIGMA_8.txt` | The guessed phrase ENIGMA tried on section 8, 740 lines |
| 23 Jan 17:56 | `UYCOENEPXBI_3.txt` and `UYCOENEPXBINGGAETHFIARDHMEOSTJLWAOEA_3.txt` | Short and full romanizations of the 29-rune section-3 alphabet string, tried *as keys* on section 3, 4,664 and 4,628 lines |

The original [16 January section naming change](https://github.com/resvolver/c1cada/commit/f657365119f7f25004af8e6d9e4fe94267a4869e), [16 January known-plaintext-key outputs](https://github.com/resvolver/c1cada/commit/ae718fb230f60b9369393c81e6d2d9a3b5425f3c), [20 January ENIGMA output](https://github.com/resvolver/c1cada/commit/12d743be4215834dd1addbeb67ccd5e17da4ec53) and [23 January two section-3 outputs](https://github.com/resvolver/c1cada/commit/420a2f4d217c550eaf60dbfcab0f405fb919f02c) identify how those tables entered the repository. The last commit also added `key_phrases/scrap`, which contains the 29-rune alphabet and the section-3 romanization as a scratch reference, **without a decryption or selected offset**. The saved `translation/liber_primus.rne` in that commit is still rune ciphertext, and its `translation/transcriptions/` files are participant romanization/transcription, not recovered plaintext.

[16 August 2015 commit `576c7817`](https://github.com/resvolver/c1cada/commit/576c78174c0148ee2f972410e623020588fc2117) deletes the original repeated `PARABLE.txt` while adding 57,000 OEIS sequence data. There is no contemporaneous replacement stating a chosen PARABLE offset or decoded page. The script's dated code history contains no later change that validates any of its saved tables.

The repository's [original issues 1–3](https://github.com/resvolver/c1cada/issues?q=is%3Aissue) preserve exploratory January 2015 planning, with no recovered full ciphertext inverse or follow-up that selected a key-phrase output. Later August pull requests are repository merges without historical LP2 selected plaintext. This is a **scope-limited negative about the extant public commit and issue history**, rather than proof that no private discussion occurred.

## Director gate and next decision

There is **no defensible source-selected output** from this script that can be frozen and tested as an unknown-page decoder. The existing samples are arithmetic local previews and conjectured phrase inputs. A plausible candidate shown at an arbitrary offset would be postselection unless independent contemporaneous evidence fixed the exact recipient, start, sign, rune spelling, clock and extension rule.

**#1027 completion:** retire the 2015 PARABLE/wordlist trial-output path in its present form; do not rerun the 2,745-word list, enumerate new phrase keys or perform a score-ranked output sweep. Reopen only on a distinct dated first-party instruction or contemporaneously selected complete result with a reproducible original-cipher inverse and an untouched holdout. No unknown LP2 plaintext, genuine key, cipher architecture or hash preimage has been recovered by this source.
