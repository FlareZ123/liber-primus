"""Same-line and short-distance rendering controls for the LP2 glyph-doublet anomaly.

The preceding source-aligned original-JPEG test found repeated-runic pairs
usually closer in raster space than all other same-letter, same-page pairs.
The strongest mundane rival is that two impressions *on the same printed line*
share renderer/font/JPEG phase. This script compares against same-symbol,
same-line nonadjacent pairs (all / at most five source slots apart), with
solved-page source control. It never treats a pixel match as plaintext.
"""
from __future__ import annotations
import json
from collections import defaultdict
import numpy as np
from lp2_original_jpeg_glyph_audit_sft import ALPHABET, DIR, extract, train
from lp2_doublet_glyph_morphology_sft import map_rasters, h, percentile

def physical_lines(s,source_runes):
    result=[]
    letters=set(source_runes)
    for line_id,frag in enumerate(s.split('/')):
        result.extend([line_id for glyph in frag if glyph in letters])
    return result

def main():
    raw=json.loads((DIR/'lp2-corpus.json').read_text(encoding='utf8'))
    corpus={p['page']:''.join(ALPHABET[i] for i in p['indices'])
            for p in raw['pages']}
    t=(DIR/'lp2-transcription.txt').read_text(encoding='utf8')
    chunks=[s.strip() for s in t.split('%') if s.strip()]
    assert len(chunks)==57,len(chunks)
    rmap={r:ALPHABET[i] for i,r in enumerate(raw['runes'])}
    model=train(corpus)
    control=defaultdict(list)
    same_line_events=[]
    overline=0;missing=0
    solved_events=[]
    for page in range(58):
        if page==50:continue
        ref=corpus[page]
        chunk=chunks[page if page<50 else page-1]
        source_letters=''.join(rmap[c] for c in chunk if c in rmap)
        assert len(source_letters)==len(ref),(page,len(source_letters),len(ref))
        mismatch=sum(a!=b for a,b in zip(source_letters,ref))
        if mismatch:print('NOTE source-letter corrections p',page,mismatch)
        line=physical_lines(chunk,raw['runes'])
        assert len(line)==len(ref)
        mapped,_=map_rasters(extract(page),ref,model)
        perline=defaultdict(list)
        for i,(dist,raster) in mapped.items():
            perline[(line[i],ref[i])].append((i,raster))
        for (ln,ch),group in perline.items():
            group.sort(key=lambda pair:pair[0]) # DP backtrace inserts positions in reverse order
            for k,(i,ra) in enumerate(group):
                for j,rb in group[k+1:]:
                    if j-i<=1:continue
                    control[(ch,'all')].append(h(ra,rb))
                    if j-i<=5:
                        control[(ch,'near')].append(h(ra,rb))
        for i in range(len(ref)-1):
            if ref[i]!=ref[i+1]:continue
            if i not in mapped or i+1 not in mapped:
                missing+=1;continue
            if line[i]!=line[i+1]:
                overline+=1;continue
            ch=ref[i]
            hd=h(mapped[i][1],mapped[i+1][1])
            q={'page':page,'at':i,'letter':ch,'hamming':hd,'zero':hd==0}
            if page>=56:solved_events.append(q)
            else:same_line_events.append(q)
    print('SAME-LINE LP2 EVENT COUNT',len(same_line_events),
          'cross-line excluded',overline,'unmapped',missing)
    print('SOLVED NATIVE/EQUIVALENT CONTROL doublets',json.dumps(solved_events))
    print('CONTROL CARDINALITY',len(control),'all',sum(len(v) for (letter,kind),v in control.items() if kind=='all'),'near',sum(len(v) for (letter,kind),v in control.items() if kind=='near'))
    print('EXAMPLE EVENT+CONTROL LETTER',[(e['letter'],len(control[(e['letter'],'all')]),len(control[(e['letter'],'near')])) for e in same_line_events[:12]])
    for mode in ['all','near']:
        matched=[]
        for e in same_line_events:
            null=control[(e['letter'],mode)]
            if len(null)>=5:
                matched.append((e,null))
        if not matched:continue
        qs=[percentile(e['hamming'],null) for e,null in matched]
        zero=[e['zero'] for e,null in matched]
        pool={ch:np.array(vals,dtype=int) for (ch,kind),vals in control.items() if kind==mode}
        r=np.random.default_rng(330126)
        mc=50000
        totals=np.zeros(mc,dtype=np.int16)
        for e,null in matched:
            totals+=(r.choice(pool[e['letter']],size=mc)==0)
        exact=int(sum(zero))
        upper=(np.count_nonzero(totals>=exact)+1)/(mc+1)
        lower=(np.count_nonzero(totals<=exact)+1)/(mc+1)
        print('SAME-LINE CONTROLS',mode,'events',len(matched),
              'mean_Hamming_quantile',round(float(np.mean(qs)),5),
              'median',round(float(np.median(qs)),5),
              'zero-event-pairs',exact,
              'mean_null_zero-pairs',round(float(np.mean(totals)),3),
              'MC_p_upper',round(upper,6),'MC_p_lower',round(lower,6),
              'controls_total',sum(len(v) for (ch,k),v in control.items() if k==mode))
        print('lowest observed rank',json.dumps(sorted([
            {**e,'rank':round(percentile(e['hamming'],null),4),'N':len(null)}
            for e,null in matched],key=lambda x:x['rank'])[:12]))
    print('This diagnostic conditions on source glyph and printed line but not exact JPEG DCT phase. No ciphertext decode.')

if __name__=='__main__':
    main()
