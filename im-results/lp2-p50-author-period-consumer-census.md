# Author-period p50 table interpreter/consumer census

**Agent 13, 28 November 2026. Status:** bounded historical-code acquisition; the only contemporaneous p49–p51 table program recovered is a participant-side **serializer**, not a consumer. No author-period decoder, key schedule, container parser, or recipient for the 256 values was found.

## Question

Director issue #3337 asks for something stronger than another radix guess: an author-period program or artifact that actually **consumes** the 256 printed p49–p51 tokens. A program that merely rewrites the cells as decimal values or bytes is representation evidence; it does not specify what the resulting bytes mean or what object they should transform.

This census deliberately does not invent a new table operation and does not score unknown LP2 plaintext.

## Strongest contemporaneous witness: micheloosterhof/cicada-2014

The surviving public participant repository has an unusually useful dated Git history because the LP2 pages were transcribed and manipulated while the 2014 round was live.

### 11 May 2014: table transcription and byte producer

Commit [19d68fbb9cff1c06d52cc0add30285199c936282](https://github.com/micheloosterhof/cicada-2014/commit/19d68fbb9cff1c06d52cc0add30285199c936282), timestamped **2014-05-11T20:41:01Z**, adds the p49, p50 and p51 token blocks together with participant-computed decimal values. The conversion corresponds to the familiar case-sensitive base60 alphabet later preserved in the repository.

Commit [a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462](https://github.com/micheloosterhof/cicada-2014/commit/a9201dd469a1a514eb0d8ff8f3449dbe2e7f7462), timestamped **2014-05-11T21:39:09Z**, then adds:

- `decimal.txt` with 256 decimal values;
- `decimaltobyte.pm`, whose entire effective operation is `print(pack 'C', $_)`;
- the resulting 256-byte `sexagesimal.bin`.

This is the earliest concrete executable interpretation located. It establishes that at least one active 2014 participant read the printed cells as conventional sexagesimal byte values and serialized them in printed order. It is not Cicada-authenticated, and the historical transcription contains the already-documented ten disagreements with the image-adjudicated modern table. See `im-results/lp2-2014-stage11-sexagesimal-byte-comparison.md` and `im-results/cicada2014-sexagesimal-upstream-transcription.md`.

### Immediate history contains no consumer edge

I inspected every substantive commit following the serializer through the end of the participant's Stage11 work rather than inferring intent from the existence of `sexagesimal.bin`.

- [06f5764](https://github.com/micheloosterhof/cicada-2014/commit/06f57643821f1cadf597471c2b9c813bd08d2e37) at 21:56Z adds the p56 128-hex digest as `56.bin`/`56.txt`.
- [d72e8e0](https://github.com/micheloosterhof/cicada-2014/commit/d72e8e0dfb428b99fe8a0e5431f2c499648fac6e) at 22:06Z merely separates the p49–p51 decimal values into `49.dec`, `50.dec`, `51.dec`.
- [1e3e842](https://github.com/micheloosterhof/cicada-2014/commit/1e3e842b460848d8e9342ae47efe453e20443aee) at 22:09Z moves the files.
- [5431b03](https://github.com/micheloosterhof/cicada-2014/commit/5431b03eacf15d27c5f02eae860efcfdb7f1917b) preserves whitespace in the signed Stage11 message.
- [ac71e97](https://github.com/micheloosterhof/cicada-2014/commit/ac71e97b36eff3e5033ec4f51dc722757bef9210) records the solved p56 plaintext.
- [49c538c](https://github.com/micheloosterhof/cicada-2014/commit/49c538c588f86a59154958d1719bab8a08789e5a) and its May 25 follow-ups implement the known p56 prime-index decoder only.

Repository-wide current-tree searches for `sexagesimal`, `decimaltobyte`, `49.txt`, and `pack 'C'` find no program that reads the generated 256-byte table. Commit-history searches likewise contain no later commit naming `sexagesimal`; the only `bytestring` commit is the producer above. The later p56 decoder consumes `56.runes`, not `sexagesimal.bin`.

The causal edge therefore stops at:

`printed p49–p51 tokens -> participant decimal transcription -> 256 raw bytes`

No surviving contemporaneous code in this repository continues:

`256 raw bytes -> [cipher/key/container/address/table operation] -> output`.

That absence matters because dozens of modern transforms can consume 256 arbitrary bytes; the period code supplies no basis for choosing among them.

## Independent corpus checks

Three other public code/artifact corpora were checked specifically for the literal table prefix `3N 3p 2l 36` and for sexagesimal/base60 consumer code.

- `iIIustrious/3301code` contains no LP2 table transcription or Liber Primus table program. It is useful for earlier-round code, not this object.
- `neuroretransmit/cicada` preserves the table in `2014/011-seventh-onion/0-55.jpg.runes.txt` and preserves the original Stage11 HTML/images, but searches for `sexagesimal` and `base60` reveal no table consumer. Its role here is archival/transcriptional.
- `henkman/liberprimus` embeds the exact table text in `liberprimus.txt`/`liberprimus.go`, but its initial commit is dated **2016-08-14**, outside the author-period gate. Its code has no sexagesimal/base60 consumer for the table.

GitHub-wide exact-string search finds the table primarily in these transcription/archive lineages and modern research mirrors. No independently dated 2014 program was located that takes the 256 values as an input to another operation.

## Decision

The historical source improves one fact and leaves the crucial one missing:

**Established participant convention:** by 11 May 2014, a live solver had converted the printed p49–p51 cells to conventional base60 values and packed them as 256 one-byte values.

**Missing source selector:** neither that repository's complete immediate history nor the independent corpora inspected supply a downstream interpreter for those bytes. No source fixes a key/cipher role, lookup semantics, container type, address space, start/traversal beyond printed serialization, or recipient ciphertext.

This is stronger than “no first-party radix legend” but weaker than proving that no 2014 solver ever tried a consumer. It is a bounded surviving-code result. It also explains why `sexagesimal.bin` must not be promoted to an authored key merely because the participant generated it.

For future work, a table branch should reopen only with one of:

1. a dated 2014 program or notebook that actually reads the 256 values and performs a determinate next operation;
2. a contemporaneous discussion giving an executable consumer with enough detail to reproduce it;
3. a first-party artifact that explicitly types the table's output/recipient.

Absent one of those, further AES/RC4/XOR/hash/table-walk menus are modern model search, not reconstruction of the human solve path.

No LP2 plaintext, authentic key, or table consumer is recovered here.
