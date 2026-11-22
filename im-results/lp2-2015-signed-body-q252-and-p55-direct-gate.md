# Original 2015 signed-message body as an LP2 running key: direct terminal gate

**Agent 30, 17 November 2026. Decision:** a date-selected but historically *unauthenticated* key-transfer idea has been tested against four original-source registers. Literal GP29 Vigenère of the publicly signed 2015 body produces no coherent plaintext. The historically solved p56 transparent-F variant has **no valid complete inverse** on the complete 252-residue numeric-table quotient or original p55, under either arithmetic sign. The sole complete F-transparent survivor among the two table-adjacent sentences is four legal paths with uniformly random-looking output. **No unknown LP2 plaintext, key or destination recovered.**

## Causal source route and weakest premise

The original solved *Instar Parable* has independently established sentence GP-prime sums 1259, 1031 and 1229, with prime ranks 205, 173 and 201. Under the **previously identified, retrospectively chosen** zero-based rank-as-offset interpretation, the printed 256-cell LP2 base60 table has values 76/117/74 at those offsets. Reversed and read both as ASCII and GP29, they spell `JuL` and `TUE`. The p05 instruction about the totient and GP29 supplies 28 as a possible date; the parable title gives the provisional reversal marker. This identifies **Tuesday, 28 July**, exactly the date of an independently preserved and PGP-authenticated **2015-07-28 05:12:39 UTC** Cicada signed statement. The relevant original body starts “Some news organisations have recently claimed” and ends with the signature-line numeral “3301”.

That dated message is **one concrete, externally recoverable, authored byte string** whose identity is more constrained than a generic English running-key search. The hypothesis is that the date pointer identifies that document as a key for the nearby table and last encrypted page. Its weakest assumption is fundamental: no signed Cicada instruction actually says to use the 2015 public denial as a cipher key, to take its natural language body rather than its signature, or to apply GP29 Vigenère. The date indexing and reversal were discovered after considering possible outputs; this is an exploratory *consumer gate*, not evidence the creators intended a handoff.

Sources:
- [Previous parable-to-date pointer with its source and index caveats](lp2-p57-parable-p50-prime-rank-date-hypothesis.md).
- [Original archived 2015 PGP clear-signed source](../resources/historical/cicada2015-planned-parenthood-denial.asc).
- [Original 256 cells](../resources/liber-primus/lp2-grid-256.json), [LP2 original indices and solved p57 controls](../resources/liber-primus/lp2-corpus.json).
- [Historical H×G factor and independently known 252-position quotient](lp2-hg-q252-rc4-original-inverse-gate.md).

## Exact original key and full decoder

Extract only the plain body between the PGP signed-message header and signature footer; retain the whole natural language including its 3301 signature line, remove punctuation/digits, normalize Roman V→U, K/Q→C, Z→S and QU→CW, and greedily map `TH NG EO OE AE IA EA` to native GP29 digraphs. The result is **247 GP29 symbols**, beginning `S O M E N E W S O R G A N I S A T I O N S H A U E`. The length reflects the document and is not fitted to the book.

Independently rebuild the table quotient by reading the 256 printed base60 bytes as descending GF(29) coefficients and dividing by the **unnormalized** product of the authenticated historical 2013 H and source p39 G, namely descending `[12,17,11,21,23]`. The remainder is `[0,0,0,0]`; the complete quotient has 252 residues, beginning `[0,12,9,28,2,25,23,21,18,28]`. The unnormalized divisor matters: division by a monic associate scales the quotient by 12 and would test a different register.

There are four fixed, complete original-source candidates:
- the 252-symbol quotient, hypothesized as a hidden encoded message;
- the 76-symbol p55 terminal encrypted page;
- the complete 138-symbol sentence immediately before the numeric table, p48 last72 + p49 all66;
- the complete 170-symbol sentence immediately after the numeric table, p51 all92 + p52 first78.

For each, run **only key start phase zero**, either GP29 `P=(C-K) mod29` or `P=(C+K) mod29`, with the key repeated if needed. Separately implement the actual solved p56 transparent plaintext-F semantics: plaintext F is emitted as ciphertext F and does not consume the next key symbol; any other plaintext consumes a key symbol. A ciphertext F is ambiguous, so enumerate **both** legal branches without selecting one based on language. A consuming branch yielding plaintext F is forbidden. No word reset, guessed phase, fitted keystream, derived key, special punctuation, or omitted rune is allowed.

## Exact original-source outcome

The following table gives rigid-key GP29 output coincidence and the transparent-F inverse's **complete** path count or earliest zero-based contradiction. Random GP29 has expected IoC 0.034483; the independent original clear p57 control has IoC about 0.06271. The rigid-key output is never coherent native-GP English.

| Original source target | Rigid minus IoC | Rigid plus IoC | Transparent F minus | Transparent F plus |
|---|---:|---:|---|---|
| Quotient252 | 0.03332701 | 0.03462341 | no paths; fails at position **21** | no paths; fails at **100** |
| p55 whole76 | 0.03824561 | 0.03052632 | no paths; fails at position **2** | no paths; fails at **7** |
| Pre-table sentence138 | 0.03459219 | 0.03649635 | **4** paths; best IoC **0.03173596**, no prose | no paths; fails at **6** |
| Post-table sentence170 | 0.03160459 | 0.03717369 | no paths; fails at position **55** | no paths; fails at **13** |

The source-native positive uses the independently clear p57 plaintext, repeated to exactly **252** GP29 symbols. All four source-key encoders (both signs × transparent/ordinary) roundtrip all 252 planted plaintext positions; the transparent cipher's ambiguity search contains the exact planted path. Every complete candidate on the original source is also checked by exact forward reencryption, an implementation check without key evidentiary force.

## Decision

The direct signed-body-as-running-key route is **retired at zero key phase** on these four natural complete receivers. Its p56-style transparent-F form is mathematically impossible for the quotient252, p55 and post-table sentence under both signs. The sole surviving pre-table branch is nonprose. A different nonzero key phase, digest, message/signed binary serialization, byte cipher or evolving clock would be a **new unselected operation**, not grounds to tune this rejected family.

The date pointer retains its tentative historical interpretation. The prior p50 polynomial factorization is untouched; this test yields no authentic unknown plaintext. Do not continue with arbitrary signed-message key-format or offset searches unless an independently original clue specifies the missing transfer.

[Read-only source-exact CommonJS SFT](../sims/lp2_2015_signed_body_q252_direct_inverse_sft.cjs). Its sole inputs are the three repository sources named above. The original-source computation was independently exercised in the current tool runtime; a separate GitHub Actions pass for the newly committed SFT has not been claimed.
