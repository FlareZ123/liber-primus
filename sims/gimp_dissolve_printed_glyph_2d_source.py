#!/usr/bin/env python3
"""Original-image 2D GIMP Dissolve source-coordinate GP29 inversion.

Use all 55 unsolved LP2 pages with rune-bearing text, measure actual first
printed glyph x/y from the source 2400x3600 JPEGs, and sample the authentic
2D GIMP 2.8 Dissolve random field at each source position. Test bounded
global shifts -32..32 in both directions, two image-byte to GP29 maps and
both additive signs. Fit on physical pages <=27; freeze offsets before
independent physical pages >=28.

Source GLib bounded draws are *random_uint32 % 255* (with rare rejection),
never the tempting uint32 * 255 / 2^32. This distinction is verified with
four pinned actual libglib-2.0 coordinates from historical GRand.
Independent-author Gibran GP-English plants must return exact source shifts.

This is a finite SOURCE KEY TEST, not plaintext recovery or a claim that
cipher glyph x/y was the original encoder's key clock.
Python 3.12+, numpy, scipy, pillow; no files written.
"""
from __future__ import annotations
import json
import re
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d
from scipy.signal import find_peaks

ROOT = Path(__file__).resolve().parents[1]
PAGE = json.loads((ROOT / "resources/liber-primus/lp2-corpus.json").read_text())
GP = PAGE["runes"]
INDEX = {x:i for i,x in enumerate(GP)}
TOW = sorted([(x,i) for i,x in enumerate(PAGE["translit"])],key=lambda p:-len(p[0]))
REFERENCE = ROOT / "resources/lp2-transcription.txt"
XSHIFTS = np.arange(-32,33)
YSHIFTS = np.arange(-32,33)
N = 29

def encoded(text:str)->list[int]:
    """Exact GP digraph mapping shared with existing CommonJS engine."""
    t=text.upper().replace("QU","CW").replace("V","U").replace("K","C").replace("Z","S").replace("ING","NG")
    out=[]
    for word in re.findall("[A-Z]+",t):
        i=0
        while i<len(word):
            for glyph,value in TOW:
                if word.startswith(glyph,i):
                    out.append(value)
                    i+=len(glyph)
                    break
            else:
                i+=1
    return out

def first_runes()->list[tuple[int,list[int]]]:
    records=REFERENCE.read_text().split("%")[:55]
    assert len(records)==55
    pages=[]
    for ordinal,p in enumerate(records):
        physical=ordinal if ordinal<50 else ordinal+1
        first=[]
        for printed_line in p.split("/"):
            symbol=next((x for x in printed_line if x in INDEX),None)
            if symbol is not None:
                first.append(INDEX[symbol])
        pages.append((physical,first))
    assert sum(len(a) for _,a in pages)==594
    return pages

def source_observations():
    """Conservative full-page image-line matching, no glyph recognition."""
    points=[]
    skipped=[]
    for page,first in first_runes():
        name=ROOT / "resources/liber-primus" / f"{page+17:02d}.jpg"
        with Image.open(name) as img:
            gray=np.asarray(img.convert("L"))
        assert gray.shape==(3600,2400)
        projection=(gray[:,790:1770]<160).sum(axis=1)
        smooth=gaussian_filter1d(projection.astype(float),sigma=7)
        peaks,_=find_peaks(smooth,prominence=125,distance=137)
        ys=[int(y) for y in peaks if 450<y<3150]
        if len(ys)!=len(first):
            skipped.append({"page":page,"expected":len(first),"observed":len(ys)})
            continue
        for i,(r,y) in enumerate(zip(first,ys)):
            ink=(gray[y-60:y+65,555:1860]<160).sum(axis=0)
            columns=np.flatnonzero(ink>7)
            if len(columns)==0:
                continue
            x=555+int(columns[0])
            if 595<=x<=610:
                points.append((page,i,int(r),x,y))
    assert len(points)>=420
    return points,skipped

def gimp_field():
    """Authentic 2.8 uint32 / bounded-255 random field; all 4,096 rows."""
    root=np.random.RandomState(314159265)
    row_seeds=root.randint(0,2**32,size=4096,dtype=np.uint32)
    assert row_seeds[:3].tolist()==[3721122731,618219707,807213306]
    image_field=np.empty((4096,700),dtype=np.uint8)
    for y,seed in enumerate(row_seeds):
        state=np.random.RandomState(int(seed))
        data=state.randint(0,2**32,size=700,dtype=np.uint32)
        # Historical GLib g_rand_int_range(0,255) rejects UINT32_MAX.
        assert not np.any(data==0xffffffff), "Rare GLib draw rejection needs replay"
        image_field[y]=data%255
    # Frozen reference samples from installed native libglib GRand, no fitting.
    for y,x,expected in [(706,601,196),(913,601,232),(1810,600,138),(2772,605,235)]:
        assert int(image_field[y,x])==expected,(y,x,int(image_field[y,x]),expected)
    return image_field

def sample_field(points,source):
    x=np.array([p[3] for p in points],dtype=np.int16)
    y=np.array([p[4] for p in points],dtype=np.int16)
    keys=np.empty((len(YSHIFTS)*len(XSHIFTS),len(points)),dtype=np.uint8)
    for i,dy in enumerate(YSHIFTS):
        keys[i*len(XSHIFTS):(i+1)*len(XSHIFTS),:]=source[
            (y[None,:]+dy)%4096,(x[None,:]+XSHIFTS[:,None])
        ]
    shifts=[(int(dx),int(dy)) for dy in YSHIFTS for dx in XSHIFTS]
    return keys,shifts

def ranked(cipher,prior,train,key,shifts,sign):
    """Score selected positions only; preserve disjoint untouched suffix."""
    plain=(cipher[None,:]+sign*key)%29
    train_score=prior[plain[:,train]].mean(axis=1)
    winners=np.argsort(train_score)[-8:][::-1]
    return [{
        "shift_xy":list(shifts[int(i)]),
        "trainMeanLogGp":round(float(train_score[i]),10),
        "heldoutMeanLogGp":round(float(prior[plain[i,~train]].mean()),10),
        "preview": "".join(PAGE["translit"][p] for p in plain[i,:35])
    } for i in winners]

def main():
    points,skipped=source_observations()
    raw=gimp_field()
    k,shifts=sample_field(points,raw)
    source_gp=encoded((ROOT / "resources/control/shakespeare_first300k.txt").read_text())
    gibran_gp=encoded((ROOT / "resources/control/gibran_prophet_58585.txt").read_text())
    assert len(source_gp)==217644 and len(gibran_gp)==62696
    prior_counts=np.bincount(source_gp,minlength=29).astype(float)+1
    prior=np.log(prior_counts/prior_counts.sum())
    actual=np.array([p[2] for p in points],dtype=np.int16)
    plant=np.array(gibran_gp[4000:4000+len(points)],dtype=np.int16)
    train=np.array([p[0]<28 for p in points],dtype=bool)
    assert len(plant)==len(actual)
    hidden_idx=shifts.index((4,-9))
    result=[]
    for map_name,byte_map in [
        ("range255_mod29",k.astype(np.int16)%29),
        ("range255_scaled29",29*k.astype(np.int16)//255),
    ]:
        for sign in (-1,+1):
            # The original search receives only ciphertext rune and image data.
            observed=ranked(actual,prior,train,byte_map,shifts,sign)
            # This test plant is Gibran plaintext, not Shakespeare training.
            planted=(plant-sign*byte_map[hidden_idx])%29
            recover=ranked(planted,prior,train,byte_map,shifts,sign)
            assert recover[0]["shift_xy"]==[4,-9],(map_name,sign,recover[:2])
            assert np.array_equal((planted+sign*byte_map[hidden_idx])%29,plant)
            result.append({
                "map":map_name,"sign":sign,
                "originalWinner":observed[0],"nextOriginal":observed[1:3],
                "sourceNativePlantWinner":recover[0],
                "sourceNativePlantExactRecovery":len(plant),
                "sourceNativePlantExactReencryption":True
            })
    result.sort(key=lambda r:-r["originalWinner"]["trainMeanLogGp"])
    return {
        "status":"source-bound pixel-key inversion; no actual plaintext or key",
        "input":"source-image first glyph of each printed line, original LP2 0..55",
        "sourcePagesMatched":len(set(p[0] for p in points)),
        "originalImageGlyphSamples":len(points),
        "trainSamples":int(train.sum()),"blindHeldoutSamples":int((~train).sum()),
        "skippedOriginalPages":skipped,
        "exactHistoricalGLibRoot":314159265,
        "rangeRule":"g_rand_int_range(gr,0,255)=uint32%255 with rare rejection, four pinned samples",
        "globalXYShifts":"-32..32 independently; geometric coordinate source is first dark glyph column and printed-row black-density peak",
        "testedModels":len(shifts)*4,
        "realGPShakespeareExpectedScore":float(
            np.sum(prior_counts/prior_counts.sum()*prior)),
        "realGPUniformExpectedScore":float(prior.mean()),
        "plantAuthor":"Gibran The Prophet, GP section at offset 4000",
        "plantExpectedGPScore":float(prior[plant].mean()),
        "models":result,
        "limits":"Printed initial glyphs are width-selected by the typesetter; conventional GP frequencies may not describe their decrypted distribution. Only one measured source pixel per glyph, global XY shift and additive modulo29 were tested."
    }

if __name__=="__main__":
    print(json.dumps(main(),indent=2))
