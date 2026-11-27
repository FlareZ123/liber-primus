# Cuneiform numerical lexical substitution — #3252

**Decision: bounded negative transfer, 27 November 2026 (Agent15).** Historical numerical lexical substitution is real and a different interpretation of visible Babylonian numeral signs from base-60 arithmetic, but its period controls require contextual equations or a parallel formula. LP2 supplies neither in authenticated form. No LP2 key or plaintext.

## Independent starting feature

Physical p33 archive 50.jpg, bottom crop (980,3000,1450,3460), and p34–39 top stamps: the seven original ink clusters read as (17,13) and (55,1), i.e. 1033 and 3301 under ordinary integer sexagesimal convention. The original p33 JPEG was inspected from the supplied archive; the exact sign-level source adjudication and identical later header crops are already established in [the digit-sum report](lp2-cuneiform-digit-sum-repeat86-bridge.md). This is a connection to the historical *notation* convention, not an exact artwork attribution. No additional geometric or base60 scan was performed. The previous source census and #3245 are distinct; GitHub issue search found no Pearce, Ifrah, or number-syllabary assignment. Search-index incompleteness means this is not an exhaustive novelty proof.

## Worked historical selector

Erle Leichty, “The Colophon,” in *Studies Presented to A. Leo Oppenheim* (1964), pp. 152–153 ([University of Chicago edition](https://oi.uchicago.edu/sites/default/files/uploads/shared/docs/oppenheim_studies.pdf)): the visible carrier is a conventional tablet colophon with numbers where words/names normally occur. TCL 6 28 + ACT 3 219 r.24 independently establishes 21 as Anu from an attested name; TCL 6 26 r.12 has numeric tokens 21,50,10,40 in a stereotyped worship formula whose ordinary parallel supplies Anu,u,an,tum. This is a contextual codebook, not a numerical alphabet order. Leichty explicitly regards the further proposed genealogy in TCL 6 51 as tentative; do not use its additional values as established key entries. A second visible carrier, a numerical omen and its explicit ancient commentary, is documented in Laurie Pearce's 1982 dissertation, pp. 69–80, and 1998 “Babylonian Commentaries and Intellectual Innovation,” pp. 335–338. The [Yale CCP edition of BM30336](https://ccp.yale.edu/P461117) is a revised 2016 transcription of that pre-release research, not a verified 2014 web page. On o ii 10′–r iii 1 the source itself defines (3,20) = king, (27) = Amurru, (10) = death and supplies the corresponding sentence. These entries give a local reversible three-token code; elsewhere in the same tablet 10 is also glossed as enemy (r iii 9), so a context-free global inverse is not justified.

Pearce's [1983 article](https://www.cambridge.org/core/journals/iraq/article/abs/cuneiform-numbersyllabaries/525C866920A2AB09CA04191A77020606) and 2005 “A Late Babylonian Number-Syllabary,” *CTMMA* II pp. 222–229 ([p222](https://libmma.contentdm.oclc.org/digital/api/collection/p15324coll10/id/49949/download), [p223](https://libmma.contentdm.oclc.org/digital/api/collection/p15324coll10/id/49950/download), [museum publication date](https://www.metmuseum.org/it/met-publications/cuneiform-texts-in-the-metropolitan-museum-of-art-volume-ii-literary-and-scholastic-texts-of-the-fi)) identify number-syllabaries as lists pairing signs with sexagesimal numbers. The author explicitly cautions that the obverse list's use in actual secret texts is unestablished, while known reverse semantic lists are contextual. In the attested pantheon context 50 means Enlil and 40 Ea/Enki, conflicting with the colophon readings u and tum. This directly defeats the unsupported universal numeric-lexical lookup premise. The 1983 article appeared in print before LP2; its Cambridge online date is August 2014. Current digital editions are source witnesses, not proof of online availability at release. The 1964 and 2005 print publications were period-available.

## Frozen direct recipient and local test

Fix the original p33 stamp (and identical p34–39 header motif) as the recipient before any language fitting. Test only the exact local attested colophon and omen token dictionaries, using the physically grouped pairs or their individual sexagesimal components. Do not translate to GP indices, search permutations or assign absent keys. Python 3 locally executed:

```python
from collections import defaultdict
colophon = {21:'Anu',50:'u',10:'an',40:'tum'}
omen = {(3,20):'king',(27,):'Amurru',(10,):'death'}
assert [colophon[x] for x in [21,50,10,40]] == ['Anu','u','an','tum']
assert [dict((v,k) for k,v in colophon.items())[x] for x in ['Anu','u','an','tum']] == [21,50,10,40]
assert [omen[x] for x in [(3,20),(27,),(10,)]] == ['king','Amurru','death']
assert [dict((v,k) for k,v in omen.items())[x] for x in ['king','Amurru','death']] == [(3,20),(27,),(10,)]
rows=[(17,13),(55,1)]
assert [a*60+b for a,b in rows] == [1033,3301]
for name, key in [('Uruk formula', {(k,):v for k,v in colophon.items()}),('BM30336 omen',omen)]:
    for partition in [rows, [(x,) for row in rows for x in row]]:
        decoded = [key.get(x) for x in partition]
        print(name, partition, decoded, 'coverage',sum(x is not None for x in decoded),'/',len(decoded))
        assert all(x is None for x in decoded)
contexts={'Uruk':colophon,'BM30336 local':{10:'death',27:'Amurru'},'Met pantheon':{60:'Anu',50:'Enlil',40:'Ea/Enki',30:'Sin',20:'Shamash',15:'Ishtar'}}
values=defaultdict(set)
for key in contexts.values():
    for n,v in key.items(): values[n].add(v)
print('cross-context conflicts', {n:sorted(v) for n,v in values.items() if len(v)>1})
assert set(n for n,v in values.items() if len(v)>1)=={10,40,50}
```

Historical replays 4/4 and 3/3 tokens with exact reverse replay; these are reproductions of source-explained examples, not blind recovery or independent validation. Original coverage is 0/2 grouped and 0/4 individual in both local dictionaries. Cross-context conflicts exactly 10,40,50. There is no LP2 parallel formula, commentary or independently chosen linguistic key/receiver. The visibly numeric carrier alone does not fix one operation: ordinary integer notation (already independently tied to Cicada's 1033/3301 Stage10 values) remains the stronger account.

**Scope limits:** no complete 1996 number-syllabary table acquired; the full Met PDF and adjacent pages 224–226 failed retrieval, as did the 1998 paper link. Leichty PDF text layer was accessible, raster screenshot failed; Met p223 screenshot was inspected, p222 screenshot failed. No claim that 1033/3301 are absent from every ancient numerical list, nor that all numerical lexical ciphers are impossible. The direct demonstrated historical keys do not type the original receiver, and no artifact-specific citation identifies a historical table. Retire this exact transfer; reopen only on an independently identifiable LP2 commentary/parallel formula or an actual linked codebook, not arbitrary historical symbol-value shopping. No original unknown body language scoring, no frontier promotion.
