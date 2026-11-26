# Dated non-GitHub source delta (Agent5, #3112)

2026-11-26 UTC. No independently executable new plaintext claim found. Search focused on distinct non-GitHub publications, not another inventory of GitHub repositories.

## July 5, 2025: beginner guide with claimed solved pages

[Unlocking the Liber Primus (11-page PDF)](https://epicalienstorytelling.blog/wp-content/uploads/2025/07/unlocking-the-liber-primus.pdf), PDF pp4/7/10, claims physical page 28 is decoded with DOUBT and gives an initial Latin ciphertext example, followed by unspecified further steps. It also labels p29/p53/p54/p55 solved and p49 as entirely numerical. These are not accepted community solutions, and the source's page identifications fail a direct original-transcription test.

Exact test against `resources/liber-primus/lp2-corpus.json` (GP29), allowing K→C as a favorable historical alias:
- The stated 15-letter example normalizes to indices [5,8,20,16,5,24,0,7,16,23,16,5,24,0,6].
- Original p28 first 15 are [13,5,11,2,17,10,7,23,7,21,28,27,7,20,7], **0/15 same positions**.
- Exact claimed sample does not occur contiguously on any of the 58 original LP2 pages, even allowing that alias.
- Original p49 has 66 runes; p50 has zero, contradicting the guide's claim of two entirely numeric pages. The purported p46/p48 sample likewise does not match either original opening.
- The guide's A–Z arithmetic is internally inconsistent (e.g. 10−3=7 is H on a zero-based A–Z alphabet, not I). Its later “further steps” supply no exact reversible operation. The guide's page-56 Parable assignment also confuses p56 and p57.

Reproduction:
```js
const d=require('../resources/liber-primus/lp2-corpus.json');
const p='KHLTKAFWTDTKAFG'.replaceAll('K','C').split('').map(x=>d.translit.indexOf(x));
console.log(d.pages[28].indices.slice(0,15));
console.log(p.filter((x,i)=>x===d.pages[28].indices[i]).length);
console.log(d.pages.filter(a=>a.indices.some((_,i)=>p.every((x,j)=>a.indices[i+j]===x))).map(a=>a.page));
console.log(d.pages[49].indices.length,d.pages[50].indices.length);
```
This is a source-specific contradiction, not a general cryptanalytic exclusion. The PDF text was accessible; direct PDF page-image fetches returned cache misses. No original guide page-image inspection is claimed. Canonical corpus input was fetched and test executed in V8.

## Other results and overlap
- [Calypne, Mortlach, 13 Sep 2016](https://calypne.boards.net/thread/75/3-ways-progress-liber-primus): original 89-event count includes known pages; its WWW interpretation is a conjecture. [SwarmPool](https://www.swarmpool.org/) still lists 5/6-period brute force as a task; prior #2102 and doublet-exception-channel report cover this exact evidence. No new result.
- [SECRA, 15 Oct 2026](https://secra.tech/research/liber-primus-strongest-findings/): technical public audit, explicitly no new accepted plaintext, already studied #1108/#1144 and prior related tasks.
- [CicadaNotebook, updated Nov 24](https://cicadanotebook.com/): 224 sessions, explicitly zero new verified solutions; already covered #2102/#3009 and prior notebook audits. Its latest negative frequency bounds do not establish a first-party operand. Our new exact transport/width bounds are stronger for the particular native reference models tested.
- [Jeremy Mouton independent historical page mirror](https://cicada3301.jeremymouton.com/liber-primus/27): indexed snippet claims historic archive copy but no signed whole-file checksum; full site fetch failed. Do not infer new source bytes from snippet.
- [The Mystery of Cicada 3301: Constructing Gnosis in Cyberspace](https://www.academia.edu/37375348/The_Mystery_of_Cicada_3301_Constructing_Gnosis_in_Cyberspace): secondary literary/history account of solved stages and known sources; no new inverse. 

Decision: no actionable independent evidence. Do not reopen a tested family or promote guide text to authentic plaintext. Reopen only for a concrete new original artifact or a reproducible original-cipher receiver. No unknown key or plaintext recovered.
