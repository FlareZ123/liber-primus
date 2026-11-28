#!/usr/bin/env python3
"""Enumerate page-order ambiguity under the frozen original LP2 compositor.
Run in repository: python sims/lp2_crosspage_geometry_order_sft.py --zip /path/to/original.zip
Requires Pillow, NumPy and the existing lp2_line_geometry_gate module.
"""
import argparse
import itertools
import json
import re
from collections import Counter
from pathlib import Path

import numpy as np
from lp2_line_geometry_gate import image_reader, bands_and_boxes, first_ink_run_width

ROOT = Path(__file__).resolve().parent.parent
RUNE = re.compile(r'[\u16a0-\u16ff]+')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--zip')
    args = ap.parse_args()
    source = (ROOT / 'resources/transcriptions/lp2-image-corrected.txt').read_text(encoding='utf-8')
    pages = [p.strip() for p in source.split('%')]
    pages.insert(50, '')
    assert len(pages) == 58
    read = image_reader(args.zip)
    fragments, geometry = {}, {}
    for p in list(range(16,22)) + list(range(40,50)):
        s = re.sub(r'[\r\n/]', '', pages[p])
        h = RUNE.match(s)
        t = re.search(r'[\u16a0-\u16ff]+$', s)
        fragments[p] = (h[0] if h else '', t[0] if t else '')
        a = np.asarray(read(p))
        assert a.shape == (3600,2400)
        boxes, ink = bands_and_boxes(a)
        geometry[p] = dict(first_width=first_ink_run_width(ink, boxes[0]),
                           last_right=boxes[-1][1], rows=len(boxes),
                           baselines=[b[2] for b in boxes])
    assert all(geometry[p]['rows'] == 12 for p in range(41,49))
    assert all(geometry[p]['baselines'] == geometry[44]['baselines'] for p in range(44,49))

    def seams(s):
        return zip(s,s[1:])
    def carry(a,b):
        return bool(fragments[a][1] and fragments[b][0])
    def flags(s):
        return [carry(a,b) for a,b in seams(s)]
    def lengths(s):
        return [len(fragments[a][1])+len(fragments[b][0]) for a,b in seams(s) if carry(a,b)]
    def repeats(s):
        return sum(fragments[a][1][-1]==fragments[b][0][0] for a,b in seams(s) if carry(a,b))
    def enumerate_orders(start,end):
        original=tuple(range(start,end+1))
        target_flags=flags(original)
        target_lengths=lengths(original)
        target_repeats=repeats(original)
        rows=[]
        for edge,allowance,tolerance in [(1792,0,0),(1792,4,4),(1796,4,4),(1800,4,4)]:
            def fit(s):
                return all(geometry[a]['last_right']<=edge+tolerance and
                           geometry[a]['last_right']+geometry[b]['first_width']+allowance>=edge
                           for a,b in seams(s))
            flag_count=0
            kept=[]; hist=[]; ordered=[]
            for middle in itertools.permutations(range(start+1,end)):
                s=(start,*middle,end)
                if flags(s)!=target_flags: continue
                flag_count+=1
                if not fit(s) or repeats(s)!=target_repeats: continue
                kept.append(s)
                if Counter(lengths(s))==Counter(target_lengths): hist.append(s)
                if lengths(s)==target_lengths: ordered.append(s)
            alternative=next((s for s in hist if s!=original),None)
            rows.append(dict(edge=edge,allowance=allowance,tolerance=tolerance,
                             original_fit=fit(original),same_carry_flags=flag_count,
                             also_width_and_repeats=len(kept),also_carry_length_multiset=len(hist),
                             also_ordered_carry_lengths=len(ordered),alternative=alternative,
                             alternative_lengths=lengths(alternative) if alternative else None))
        return dict(range=[start,end],original_carry_flags=target_flags,
                    original_carry_lengths=target_lengths,original_carry_repeats=target_repeats,results=rows)

    def full_stats(order):
        s=re.sub(r'[\r\n/]','',''.join(pages[p] for p in order))
        words=RUNE.findall(s)
        tape=''.join(words)
        return tape,dict(runes=len(tape),groups=len(words),
                         repeats=sum(a==b for a,b in zip(tape,tape[1:])),
                         length_histogram=dict(sorted(Counter(map(len,words)).items())))
    original=list(range(56))
    alternate=original.copy()
    alternate[45],alternate[46]=alternate[46],alternate[45]
    a,sa=full_stats(original)
    b,sb=full_stats(alternate)
    assert sa==sb and sa['runes']==12956 and sa['groups']==2896 and sa['repeats']==86
    inverse=[alternate.index(i) for i in original]
    assert [alternate[i] for i in inverse]==original
    changed=sum(x!=y for x,y in zip(a,b))
    assert changed==522
    print(json.dumps(dict(geometry=geometry,tests=[enumerate_orders(40,49),
          enumerate_orders(43,49),enumerate_orders(16,21)],full_book_witness=dict(
          original=sa,alternate=sb,changed_positions=changed,exact_block_inverse=True)),indent=2))
if __name__=='__main__':
    main()
