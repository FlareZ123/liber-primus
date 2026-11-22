# P26 WAY-to-MAP source receiver: original line-wrap falsifies FOUR/FOURTH/DH

**Authoritative correction, Agent41, 22 November 2026.** The adjacent original ciphertext word-value transition **57 to 56 survives**. The proposed four-word p26 **FOUR / FOURTH / DH packet does not exist in the original printed words**. The earlier successful reproducer treated typography as word punctuation and also counted a solved page as unsolved. No plaintext, original decryption key, or cipher operation follows from this local result.

## Exact page evidence

The actual original archive scan is **43.jpg** (LP2 physical p26). The line 9 to line 10 boundary reads:

~~~text
line 9   ... ᚪᛖᛏ-ᛖ/
line 10       ᛋᚪᛟ-ᚳᚻᛁᛋᚠᛁᚾ-ᛈᛟᛝ-...
~~~

The slash marks only a line wrap. There is **no printed hyphen or dot between rune E at the end of line 9 and rune S at the beginning of line 10**. Under the standard source parser they form one word, **ESAOE** = runes ᛖᛋᚪᛟ, with GP0 **79**. The historical parser invented two words: E =18 and SAOE =61.

| Original-source operation | Historical artificial split | Actual printed whole words |
|---|---|---|
| Four-word sequence | E, SAOE, CHISFIN, POENG | AET, ESAOE, CHISFIN, POENG |
| GP0 addresses | 18,61,57,56 | **58,79,57,56** |
| Printed p50 tokens | 0F,3G,1w,4E | **2Q,1M,1w,4E** |
| Token-leading digits | 0,3,1,4 (= FOUR) | **2,1,1,4** (no FOUR) |
| Full base60 decoded bytes | 15,196,118,254 | **146,82,118,254** |
| Byte residues modulo29 | 15,22,2,22 | **1,24,2,22** |

The old apparent four-word packet equaled the chosen DH23 tuple [b,p-1,K,p-1] only because its first two entries came from fabricated words. Without FOUR there is no original instruction to append TH via GCD, no FOURTH, and no p26-selected fourth-D/H or DH decoder. Retrospective arithmetic using the earlier p28 DH23 state can still be computed, but it does not rescue the invalidated source boundary.

**Surviving narrow event:** the original intact words CHISFIN and POENG remain adjacent, with GP0 57 and 56, respectively. Table token p50[57]=1w can be interpreted as one cell west from state57 to state56 under a proposed literal 32x8 grid parser. This is the single 57-to-56 original adjacent word-pair in the corrected census. The next original word has GP0 **95**, so there is no three-word 57→56→48 continuation. Neither the independent p28 H transform nor the short K=2 probe produces sustained unknown-page English.

## Corpus and historical parser correction

The transcription omits table-only p50, so the **55 rune-bearing unknown source segments** represent physical pages p0-49 and p51-55. They contain **12,956 source runes and 2,896 intact printed words**, including 32 words spanning physical page boundaries. Book-wide intact four-word windows: **2,893**. The old SFT iterated 56 transcript segments and inadvertently included the **85 already-solved runes of physical p56** as if it were unsolved p55; that added 25 four-fragment windows.

| Parser and scope | Four-slot windows | Literal high-digit FOUR hits |
|---|---:|---|
| Old false line-split; 56 segments including solved p56 | **3,176** | physical p5,p23,p26,p31 |
| Same false line-split; correct 55 unknown segments | **3,151** | p5,p23,p26,p31 (still artificial) |
| Correct line joining; page-local windows over 55 unknown segments | **2,763** | physical p5,p23,p48,p51 |
| Canonical book-continuous 2,896 true words | **2,893** | global word indices271,1238,2677,2725; no p26 |

The correct parser returns **zero p26 FOUR windows**. The original word-boundary error alone abolishes the claimed four-word receiver; the solved-page count is a separate denominator error.

## Independence of the solved WELCOME readout

The solved phrase FIND THEIR WAY HERE maps by the selected GP0-to-p50-first-digit rule to FOUR. That exact arithmetic survives, though it is weak as independent evidence. The printed first digits occupy only 0–4, and among the **64 distinct solved four-rune lexical types**, **FOUR is the sole type even representable by four such digits**. The prior WAY→MAP→HERE table route fixes p50 cells57,56,48, therefore the last digits 1 and4 are preselected. Holding those three already-used original cells fixed and permuting all remaining token instances, the probability of the 0,3 prefix at cells42 and34 is exactly **(60/253)×(56/252)=0.05270092226613965**, before charging word/reader selection. This cannot independently validate the p26 packet or prove a p28 DH intended route.

## Research decision

**Retire the original p26 FOUR→FOURTH→DH unknown-cipher receiver.** Preserve the single correctly parsed 57-to-56 adjacent ciphertext-word address relation as a structural observation. Require a new independently source-authenticated reversible operation and a held-out plaintext or key before reviving that path. The older [legacy SFT](../sims/lp2_p26_way_map_four_receiver_sft.cjs) remains a reproducible **counterexample showing what erroneous segmentation can manufacture**; its earlier PASS results do not imply genuine plaintext.

The corrected [read-only Node22 CJS SFT](../sims/lp2_p26_four_wordboundary_source_gate_sft.cjs) checks the original p26 line joining, the two word parsers, both counts, all original FOUR windows, genuine 57→56 pair, solved lexicon capacity and exact conditional table-token null. It **passed on Windows with original repo inputs**: [run 44976248467](https://github.com/FlareZ123/liber-primus/actions/runs/44976248467).
