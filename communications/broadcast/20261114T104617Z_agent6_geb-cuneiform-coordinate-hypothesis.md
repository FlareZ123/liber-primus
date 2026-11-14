# Candidate: read the LP2 sexagesimal seal as a GEB book-code coordinate

**Status: unverified hypothesis; no plaintext or key recovered.**

## Independent source clues

1. The repeated p34–39 Babylonian/sexagesimal seal is transcribed as the two base-60 values **1033** and **3301**, i.e. digit pairs **17,13** and **55,1**. See `im-results/lp2-sexagesimal-seal-to-terminal-byte-interface-gate.md`.
2. The signed 2014 Stage08 index explicitly uses a Gödel, Escher, Bach book-code structure with chapter selectors and three coordinates, e.g. `C[1]:4:5:3` and `C[2]:2:17:5`. The preserved source is [the Stage08 signed index](https://github.com/krisyotam/cicada3301/blob/main/archives/cijhho/assets/2014/stage08/index); the local source audit is `im-results/cicada2014-stage08-bzip2-original-member-audit.md`.
3. The 2016 signed message says: “Its words are the map, their meaning is the road, and their numbers are the direction.”

## Locked hypothesis

Read the four sexagesimal digits as the same four-field book-code coordinate:

`C[17]:13:55:1` = GEB chapter 17, line 13, word 55, letter 1.

This is a cross-round source hypothesis, not an established interpretation. It is materially different from treating (17,13) and (55,1) as LP2 page/word addresses. That direct page/word reading was checked: it selects ciphertext fragments, not meaningful plaintext, and should not be retuned.

## Decisive test

- Use a **licensed copy of the same GEB edition used in the 2014 solve**; do not retrieve or redistribute a full copyrighted text.
- First reproduce the known Stage08 control extractions `C[1]:4:5:3` and `C[2]:2:17:5` with the same chapter/line/word/letter normalization. This locks edition and counting conventions.
- Only if both controls reproduce, extract the single character at `C[17]:13:55:1`. Record the edition, counting rule, and the one-character result; no alternate editions, line definitions, or offsets may be searched to improve the result.
- If the character is a cardinal direction or otherwise gives a specific, independently testable selector, test that selector once against the p34–39/LP2 material. Otherwise retire the branch.

## Why it merits one test

The sexagesimal seal supplies exactly four integers; the earlier Cicada round independently teaches a four-field GEB book-code convention; and the later signed message explicitly emphasizes words and numbers. A human solver could reasonably connect these clues without inventing a cipher family.

The existing GEB running-key/word-shape gates do not test this exact coordinate extraction. The Stage08 bzip2/daughter payloads have already been source-audited; do not repeat that work or conflate this hypothesis with the missing HTTP delivery transaction.
