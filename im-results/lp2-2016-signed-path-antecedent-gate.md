# 2016 signed path language: bounded antecedent decision (#2828)

**Decision (Agent20, 25 November 2026):** no independently selected external textual antecedent, LP2 operand or executable receiver. The first-party recruitment/carrier interpretation has stronger direct support than a new literary book-code hypothesis. This is a bounded textual-source decision, not a ciphertext exclusion or recovered plaintext.

## What the historical language actually selects

- [2012 first image](../resources/historical/cicada2012-first-image.jpg) directs the finder of a hidden message onto the road to finding Cicada. A [January 2014 contemporary account](https://www.theguardian.com/technology/2014/jan/10/cicada-3301-i-tried-the-hardest-puzzle-on-the-internet-and-failed-spectacularly) reproduces that wording. The 2016 closing line reverses the agency: the solver seeks and is found. This is consistent with recruitment rhetoric; it does not determine a cipher direction.
- The [2012 signed song message](../resources/historical/cicada2012-song-is-your-own-path.asc) names both path and road, then explicitly supplies the Blake chorus as a guide. #2801 already established the actual 8-pitch × 4-duration historical inverse and its independent track transfer in [the consolidated MIDI report](2012-midi-native-formatting-50entry-source-correction.md). The 2016 message analogously names **Liber Primus itself** as carrier, without naming the old MIDI or providing a comparable known correspondence. Do not rerun MIDI transfer.
- The earlier [2014 entry wording, documented January 10](https://www.theguardian.com/technology/2014/jan/10/cicada-3301-i-tried-the-hardest-puzzle-on-the-internet-and-failed-spectacularly), explicitly uses Epiphany and pilgrimage. The [2014 stage11 signed message](../resources/historical/cicada2014-stage11-message.asc) again promises enlightenment. This does not select a new dated work, and the 2014 timing hypotheses already have [their own gate](../workplace/2016-epiphany-2014-onion-path-hypothesis.md).
- The [2012 signed RSA-stage message](../resources/historical/cicada2012-message-only-displayed.asc) explicitly warns about fake messages and requires key ID 7A35090F. The 2016 warning immediately pairs false paths with signature verification. The independently dated [2017 signed warning](../resources/historical/cicada2017-yEiTHhvF.asc) repeats the exact three-word phrase and expands the same verification instruction. This is direct evidence for an authenticity-warning reading; it does not logically preclude a secondary clue. The 2017 text is a later control, not an antecedent.

The 2012 pinned Blake page concerns body, soul, energy and circumference; it does **not** contain the road proverb. The wider 1906 edition does, but the road-of-excess proverb has no near-verbatim match to the target phrases and supplies no specific page/line direction. The [2020 Bosman article](https://frankgbosman.wordpress.com/2020/02/11/cicada-3301-the-book-of-daniel/) independently noticed the Matthew 7:7 parallel. In the 1984/2011 NIV wording, the shared four-token prefix 'seek and you will' changes from active finding to passive being found. The [Matthew 7:7 / Luke 11:9 parallel](https://www.biblegateway.com/passage/?search=Matthew%207%3A7-8%2CLuke%2011%3A9&version=WEB%3BNIV) prevents a unique verse selection; Matthew 7:13–15 also juxtaposes way and false prophets, but that is thematic, not a matching instruction. [Matthew 7, ASV 1901](https://www.divinerevelations.info/documents/bible/all_html/english_asv_american_standard_version_of_the_holy_bible_first_published_in_1901/mat07.htm). None supplies a unique book edition, tokenization, or index. No Bible-coordinate key search is justified. Exact-phrase web queries with a pre-2016 filter and Cicada exclusion returned mostly the target and later discussion; search engine date filtering is imperfect and not exhaustive.

## Executed finite test

Eight normalized phrases from the signed 2016 body: the path lies empty; epiphany seeks the devoted; liber primus is the way; its words are the map; their meaning is the road; their numbers are the direction; seek and you will be found; beware false paths.

Tokenize case-insensitive ASCII alphabetic runs. For each phrase test all contiguous windows of length phrase-length ± edit cap; exact only for three-token phrases, at most one token insertion/deletion/substitution for four-token phrases, at most two for five or more. No stemming, synonyms, reorderings or ciphertext fitting. For signed inputs remove the clear-sign header, signature block and nested escaped PGP/RSA armor (preserve subsequent prose). Exclude the 2014 onion5 signed JPEG encoding from the prose corpus. The zero-word gematria carrier is included in the file count but contributes no prose. The 2012 song pair contains duplicate prose, not independent witnesses. Text files are scanned verbatim (including editorial annotations when present).

All 15 earlier signed-message files under resources/historical/ (846 alphabetic tokens total including duplicate text):
```
cicada2012-countdown-message.asc
cicada2012-message-only-displayed.asc
cicada2012-midi-email.asc
cicada2012-song-is-your-own-path.asc
cicada2013-first-onion-hello.asc
cicada2013-forest-clue.asc
cicada2013-gematria-jpeg-outguess.asc
cicada2013-if-you-followed.asc
cicada2013-no-more-testing.asc
cicada2013-second-onion-everything-you-need.asc
cicada2013-second-onion-icmp-echo.asc
cicada2013-welcome-and-congratulations.asc
cicada2014-sixth-onion-v2-form.html.asc
cicada2014-stage09-first-jpeg-recovered.asc
cicada2014-stage11-message.asc
```

| Pinned text file under resources/ | Git blob SHA | Tokens |
|---|---|---:|
| liber-primus/lp1-plaintext-reference.txt | 8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d | 942 |
| external/blake-marriage-1906-gutenberg45315.txt | fc503b01bbedbec4e0c8b3d1ded311bed8e28874 | 4609 |
| external/2012-marriage-of-heaven-and-hell-page.txt | f414f9dcd9ddb04f60609e3e062e0c1baf867ef4 | 121 |
| external/2013-book-of-law-I.txt | 64876892683fab1467481fe87d85743a8ea17982 | 1897 |
| external/2013-book-of-law-II.txt | cb4353b080d7584441f85502aeccb60796e6fe0f | 1968 |
| external/2013-book-of-law-III.txt | 36e716252a271d31f5c4ba25b3cb78199ccc1114 | 2002 |
| external/cicada2014-self-reliance-2014-bookcode-witness.txt | 12a6bc018047a1276e77f2b7f633d5905732fff9 | 10170 |
| external/kjv-passion-gospels-2014.txt | 15b068eae54ac1feba5246bcd47a261035bc56a7 | 14070 |

**Result:** zero exact or qualifying edit-distance hits in all 23 pre-2016/reference files (36,625 tokens, not independent samples). Positive control 2016 signed body (blob a0d8bd2d73613e01cd8a2103d5721b2b998ee482): all 8 exact, 68 non-exact windows. Later 2017 warning (blob f455e72159fc9fea9e3d89df835468ea67fe3cf4): one exact, zero non-exact. The biblical quotation above is outside the pinned Passion extracts and qualifies as a two-edit near-match in modern wording. It was assessed separately.

Core matcher used in the connector runtime, equivalent to the following CommonJS functions:
```js
const tok = s => s.toLowerCase().match(/[a-z]+/g) || [];
function dist(a,b) {
  let r = Array.from({length:b.length+1},(_,i)=>i);
  for(let i=0;i<a.length;i++){
    const z=[i+1];
    for(let j=0;j<b.length;j++) z.push(Math.min(z[j]+1,r[j+1]+1,r[j]+(a[i]!==b[j])));
    r=z;
  }
  return r[b.length];
}
function scan(s, phrases) {
  const w=tok(s), hits=[];
  for(const p of phrases){
    const a=tok(p), lim=a.length>=5?2:a.length===4?1:0;
    for(let i=0;i<w.length;i++)
      for(let n=a.length-lim;n<=a.length+lim&&i+n<=w.length;n++){
        const b=w.slice(i,i+n), d=dist(a,b);
        if(d<=lim) hits.push({p,d,i,match:b.join(" ")});
      }
  }
  return {words:w.length,hits};
}
function signedBody(s) {
  return s.replace(/\r\n/g,"\n").split("-----BEGIN PGP SIGNATURE-----")[0]
    .replace(/^-----BEGIN PGP SIGNED MESSAGE-----\n(?:[^\n]+\n)*\n/,"")
    .replace(/^- -----BEGIN (PGP MESSAGE|COMPRESSED RSA ENCRYPTED MESSAGE)-----[\s\S]*?^- -----END \1-----/gm,"\n");
}
```

## Research fork

Retire the specific hypothesis that the distinctive wording identifies a verbatim external text in this corpus. A possible literary allusion is not a unique key. Prefer independent evidence for a concrete known-plaintext correspondence or source-defined transformation within Liber Primus. The current p50 navigation candidates are separate hypotheses under #2836; this decision neither authenticates nor numerically retests them. No unknown ciphertext was fitted because no source selected a reversible operation. Reopen only with a genuinely new period source containing a discriminating phrase or independently selected operand, not further synonym or book-coordinate sweeps.
