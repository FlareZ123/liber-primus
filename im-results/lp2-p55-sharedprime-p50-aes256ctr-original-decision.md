# P55 conditional DH shared value as AES-256-CTR key for the complete original p49–51 byte table

**Agent30, 23 November 2026. Result: a complete, original-input, narrowly negative receiver. No recovered LP2 plaintext, authenticated cipher operation, or original destination.**

## Source motive and strongest independent rival

The source-visible *PARABLE* (solved p57) says to shed circumferences. The original p55 page-local 16 complete printed words yield an internally consistent, **conditionally selected**, word-interior/shell serialization: 43 interior GP0 digits form N=8P with a certified 206-bit prime P, while 32 first/last GP0 digits form E=43Q. The signed 2013 Cicada protocol actually demonstrates finite-field Diffie–Hellman and BASE29, making the already-published **conditional** p=P, g=Q, a=8, b=43 assignment testable. See [the p55 prime-shell source report](lp2-p55-shed-circumference-prime-shell-original.md), including its substantial p54→p55 whole-word seam objection. That report previously rejected direct GP29 repeating-key use of this shared value on p55.

A **different** concrete receiver is the 256 two-character entries printed across actual p49–51 (the numeric p50 grid). Exactly 256 source words are byte-shaped, and AES-256 in CTR mode is a historically available standard cipher. The proposed link to the later p55 prime is **speculative**: no author instruction selects the p55-to-table key handoff, AES, this KDF, a CTR initial counter, or the byte alphabet. A strong rival is unrelated encrypted or random table data.

**Algebraic radix caveat.** Both digit alphabets express every printed table token as an in-range byte, but their historical support is asymmetric. The independently published exact H/G GF29 polynomial factors of the numeric table **select conventional base60 under standard token orientation** and fail under the base59 codebook; see [the source-radix residue analysis](2013-base29-gf29-grid-factor.md). Testing base59 here is an explicit competing-encoding control, rather than an equally authenticated intended input. The original AES-CTR base60 run is also a confirmed **Agent11 prior result** and should not be counted as fresh discovery.

## Frozen executable operation

Re-read the original p55 rune tape and complete words, preserving the one-rune carry from p54. Excluding that carry only for the declared *page-local* SHED operation gives:

- N = 510043531279477768552291351270111060625364732293226050492113768 = 8P;
- P = 63755441409934721069036418908763882578170591536653256311514221, previously certified prime;
- E = 54546906948733185277568038540584540814742666891 = 43Q;
- Q = 1268532719737981052966698570711268391040527137;
- S = Q^344 mod P = 40058585108914257367732574161222353642573409865793191134873737.

Encode S as its **minimal 26 big-endian bytes** and let K = SHA256(S_bytes). The resulting exact 32-byte key is

    40c0a1166d98e3cd7bfed42ed8540b8d67edc6ffbbf1636a7b95c5d8cec0e284

Use AES-256-CTR with an **all-zero 16-byte initial counter** to decrypt all 256 original table cells in printed row-major order. The source table permits two pinned byte tapes: (a) literal radix60 and (b) base59 with lowercase f omitted. Apply the **same** key and initial counter to both without selecting the more promising output after inspection. No fitted phase, nonce, password, hash salt, or plaintext enters the operation.

**Prior-work disclosure.** Agent11 had independently completed and sent [the same base60 SHA256(min26) AES-256-CTR receiver](../communications/agent1/2026-11-23T0501Z_agent11_p55-dh344-p50-aes-gate.md) at 05:01Z on 23 November, covering three explicit key encodings and three AES modes. This Agent30 source-native Windows replay confirms that earlier base60 test and separately adds the unresolved **base59** byte interpretation and exact positive controls; the base60 failure should not be counted as a separate new cryptanalytic route. The missing author-selected AES instruction remains the controlling limitation.

## Complete original outputs

| 256-byte interpretation | Decrypted first 32 bytes (hex) | ASCII-printable including tab/CR/LF | Outcome |
| --- | --- | ---: | --- |
| Literal radix60 | 998c7e893cdba52bc0028363f1d9e18645d2bad7dbe8155a81c0cd13c648c483 | **105/256** | Binary-like, no readable original-language text or file header |
| Omit-lowercase-f radix59 | 9a887d843ddfa728c70e8567f5d9e2834bdfbad7d9e6145b87c5ca13c44bc285 | **105/256** | Binary-like, no readable original-language text or file header |

Both full 256-byte outputs **exactly reencrypt** to the original table bytes. For each interpretation, an independently constructed 256-byte ASCII text plant decrypts exactly after encrypting under the same key. The unchanged original sources and native plants passed Windows / Node 22 [manual CI run 45116624896](https://github.com/FlareZ123/liber-primus/actions/runs/45116624896).

**Decision:** This frozen DH→SHA256→AES-256-CTR→p49–51 pathway produces no candidate plaintext or recognizable payload. The cipher guess remains unsupported by an authored instruction. An independently sourced operation or recipient instruction is the decisive missing input; further flexible parameters chosen for their outputs would be unconstrained.

**Reproduce:** [single runnable original-source CommonJS SFT](../sims/lp2_p55_sharedprime_p50_aes256ctr_source_sft.cjs). It re-derives N, E and S from original p55 runes; verifies 256 source table codewords and both numeral alphabets; asserts the frozen SHA256 key, both 32-byte output prefixes and printable counts; and tests exact AES reconstruction. It makes no file writes and needs no external downloads.
