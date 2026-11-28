#!/usr/bin/env python3
"""Original LP2 local punctuation/spacing exception gate, issue 3329.
Usage: python script.py [repo_root] OR --fixture TSV --zip original.zip.
The fixture option is for isolated pixel replays of the same source-derived lines.
"""
import argparse, json, math, re
from pathlib import Path
from zipfile import ZipFile
from collections import Counter
from PIL import Image
import numpy as np

CLEAN = [4,5,9,10,11,12,13,16,17,18,19,20,21,24,25,26,28,29,30,31,41,42,43,44,45,46,47,48,52]
ALPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabc'

def runs(indices, gap=1):
    out=[]
    for i in indices:
        i=int(i)
        if not out or i-out[-1][1]>gap:
            out.append([i,i])
        else:
            out[-1][1]=i
    return out

def read_source(root):
    resource=root/'resources/liber-primus'
    c=json.loads((resource/'lp2-corpus.json').read_text(encoding='utf8'))
    mapping=dict(zip(c['runes'],ALPH))
    raw=(resource/'lp2-transcription.txt').read_text(encoding='utf8').split('%')[:55]
    selected=[]; events=[]; prev=None; between=''; n=0
    for rec,s in enumerate(raw):
        p=rec if rec<50 else rec+1
        local=0
        for l,line in enumerate(s.split('/')):
            tokens=''.join(mapping.get(ch,ch) for ch in line if ch in mapping or ch in '-.')
            if p in CLEAN and re.search(r'([A-Za-c])\1',tokens): selected.append((p,l,tokens))
            for ch in line:
                if ch in mapping:
                    if prev==ch: events.append({'offset':n,'page':p,'local_offset':local,'line':l,'glyph':ch,'between':between})
                    prev=ch; between=''; n+=1; local+=1
                else: between+=ch
            if l<len(s.split('/'))-1: between+='/'
        between+='%'
    assert n==12956 and len(events)==86
    return selected,events

def pixel_gate(selected,open_image):
    stats=Counter(); details=[]; a=None; current=None
    for p,l,s in selected:
        if current!=p:
            current=p
            a=np.asarray(open_image(p).convert('L'))
            bands=runs(np.where((a[450:3250,720:1640]<135).sum(1)>35)[0]+450,25)
            assert len(bands)==12,(p,bands)
        pairs=[i for i in range(len(s)-1) if s[i]==s[i+1] and s[i] in ALPH]
        stats['candidate_lines']+=1;stats['candidate_events']+=len(pairs)
        y0,y1=bands[l]; mask=a[y0:y1+1,590:1830]<135
        xs=runs(np.where(mask.sum(0)>=1)[0]+590)
        row={'page':p,'line':l,'tokens':s,'projection_runs':len(xs),'expected_tokens':len(s),'events':[]}
        if len(xs)==len(s):
            heights=[]
            for lo,hi in xs:
                ys=np.where(mask[:,lo-590:hi-589].any(1))[0]
                heights.append(int(ys[-1]-ys[0]+1))
            if all((h>50)==(t in ALPH) for h,t in zip(heights,s)):
                stats['aligned_lines']+=1;stats['aligned_events']+=len(pairs)
                gaps=[b[0]-a[1]-1 for a,b in zip(xs,xs[1:])]
                other=[gaps[i] for i in range(len(s)-1) if s[i]!=s[i+1] and s[i] in ALPH and s[i+1] in ALPH]
                for i in pairs:
                    g=gaps[i]; same=other.count(g)
                    stats['same_line_gap_collision']+=bool(same)
                    row['events'].append({'token_index':i,'glyph':s[i],'gap_px':g,'other_same_gap_count':same,'other_minmax':[min(other),max(other)],'boxes':[xs[i],xs[i+1]],'y_band':[y0,y1]})
        details.append(row)
    return {'counts':dict(stats),'lines':details}

def native_control(open_image):
    # p57 known plaintext, physical line 2 begins U N N E L NG.
    # The full line contains joined glyph projections, so only its clear first 3
    # native glyphs are used as a local control.
    a=np.asarray(open_image(57).convert('L'))
    mask=a[1080:1240,880:1800]<135
    xs=runs(np.where(mask.any(0))[0]+880)
    assert xs[:3]==[[890,941],[947,980],[986,1019]],xs[:3]
    gaps=[b[0]-a[1]-1 for a,b in zip(xs[:3],xs[1:3])]
    assert gaps==[5,5]
    return {'page':57,'known_plaintext_start':'UNNELNG','first_three_boxes':xs[:3],'U_N_gap_px':gaps[0],'N_N_gap_px':gaps[1]}

def main():
    p=argparse.ArgumentParser();p.add_argument('root',nargs='?',type=Path,default=Path(__file__).resolve().parents[1]);p.add_argument('--fixture',type=Path);p.add_argument('--zip',type=Path);a=p.parse_args()
    events=None
    if a.fixture:
        selected=[(int(p),int(l),s) for p,l,s in (line.split() for line in a.fixture.read_text().splitlines())]
    else: selected,events=read_source(a.root)
    if a.zip:
        with ZipFile(a.zip) as z:
            load=lambda p:Image.open(z.open(f'liber-primus-jpegs/{p+17:02d}.jpg'))
            result=pixel_gate(selected,load)
            result['native_control']=native_control(load)
    else:
        load=lambda p:Image.open(a.root/'resources/liber-primus'/f'{p+17:02d}.jpg')
        result=pixel_gate(selected,load)
        result['native_control']=native_control(load)
    if events:
        result['source_events']=events
        result['separator_counts']=dict(Counter(e['between'] for e in events))
        punct=json.loads((a.root/'resources/liber-primus/lp2-punctuation-identity.json').read_text(encoding='utf8'))['events']
        offsets={e['rune_offset'] for e in punct}
        large={e['rune_offset'] for e in punct if 'large_mark' in e}
        result['punctuation_hits']=[e['offset'] for e in events if e['offset'] in offsets]
        result['large_mark_hits']=[e['offset'] for e in events if e['offset'] in large]
    result['capacity']={'arbitrary_86_positions_bits':math.log2(math.comb(12955,86)),'arbitrary_63_intragroup_positions_bits':math.log2(math.comb(10060,63)),'binary_payload_at_86_known_positions_bits':86,'one_gp29_symbol_per_event_bits':86*math.log2(29),'31_binary_marks_bits':31,'31_marks_fixed_3_special_bits':math.log2(math.comb(31,3)),'31_mark_binary_count_and_color_bits_upper':62,'86_single_hidden_7way_states_bits':86*math.log2(7),'86_single_deleted_28way_states_bits':86*math.log2(28)}
    print(json.dumps(result,indent=2))
if __name__=='__main__': main()
