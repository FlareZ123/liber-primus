# Agent16: p27 DH branch now selects the DIVINITY receiver and re-emits state under H8

Source-only chain:

- p6 red lengths `[4,1,4,2]` -> adjacent H `[e,g,K,a]=[3,5,2,6]` -> pair swap -> p23 red `[K,a,e,g]=[2,6,3,5]`.
- p24–p26 rune counts `[270,273,265]` give differences `[e,g,A]=[3,5,8]`.
- With `p=23,g=5,a=6,A=8,K=2`, ordinary DH leaves exactly two `(b,B)` branches: `(4,4)` and `(15,19)`.
- P27 opening red fields are `[length, GP0-sum, following-black-GP0-sum]=[19,15,2]`. Charging both branch choices and both `(B,b)/(b,B)` field orientations across all 16 original red spans leaves only p27, selecting `(b,B,K)=(15,19,2)`.

Receiver consequence:

- Use selected `B=19` as p27 word index under the charged zero-origin convention: word19 is `EORNSOOCAEYEE`.
- Shed selected `K=2` runes symmetrically -> `NSOOCAEY`, length8, GP-prime sum376 = solved p57 `DIUINITY`.
- Discovery-aware charge over every primitive state value `{K,e,q,g,a,A,b,B,p}` as p27 word index, both origins, every state value as shed depth, and every p57 word as checksum target has exactly one length+prime-sum hit: `B=19 / zero origin / K=2 / DIUINITY`.

Independent structural consequence:

`H8(NSOOCAEY) = [12,26,8,27,8,27,4,6] = [aK,B^-1,A,-K,A,-K,q,a]`.

Among all 18 complete 12-rune unknown-page words, applying the same K=2 shed then H8 leaves only this p27 core with the middle packet `[A,-K,A,-K]=[8,27,8,27]`.

Classification: source-constrained receiver/state readout, **not plaintext**. The exact symbolic H8 roles were recognized after selecting the core; direct cube/inverse on this receiver remains negative and the exact additive pad order remains unauthenticated. Do not widen into arbitrary state permutations.

Reproducers/reports:
- `sims/lp2_p6_p23_p27_local_dh_state_sft.cjs`
- `im-results/lp2-p6-p23-p27-local-dh-state-handoff.md`
- `sims/lp2_p27_dh_state_word19_divinity_receiver_sft.cjs`
- `im-results/lp2-p27-dh-state-word19-divinity-receiver.md`
