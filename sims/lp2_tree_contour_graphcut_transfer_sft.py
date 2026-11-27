"""Infer p55 interior from ink contour and weak stock prior; predict unseen p32 regions.
Run from repository with original JPGs and committed stock fixture.
"""
import numpy as np
import cv2
from scipy.ndimage import gaussian_filter
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import maximum_flow, breadth_first_order
from lp2_tree_stock_root_transfer_sft import load_stock, native_sample, warp, corr

V55 = [.8434580498835607,.8444254856468015,-6.269179940310348,45.459292324694964]
V32 = {
 "left":[.8520225300379939,.8831054342250901,-11.253716453664449,36.728395312930516,4.2653479940096],
 "right":[.8743500199155512,.8640196154334471,-13.183696881451286,40.015172459892035,4.349606891747979]
}
REG = {"left":(slice(15,125),slice(15,100)), "right":(slice(15,125),slice(100,185)), "root":(slice(142,190),slice(15,185))}

def reconstruct(stock, ink):
    h,w=ink.shape; n=h*w
    prior=warp(gaussian_filter(stock,1),V55,ink.shape)
    scale=np.quantile(ink[ink>12/252],.90)
    ids=np.arange(n).reshape(h,w)
    a=np.r_[ids[:,:-1].ravel(),ids[:-1,:].ravel()]
    b=np.r_[ids[:,1:].ravel(),ids[1:,:].ravel()]
    dark=ink.ravel()
    weight=.1+8*np.exp(-3*np.maximum(dark[a],dark[b])/scale)
    border=np.zeros((h,w),bool); border[[0,-1],:]=True; border[:,[0,-1]]=True
    r=np.arange(n); src=n; sink=n+1
    best=(-np.inf,None,None)
    for p in [.03,.1,.3,1.,2.,3.,5.,10.]:
        d0=p*prior.ravel();d1=p*(1-prior.ravel())
        d0[border.ravel()]=0;d1[border.ravel()]=1000
        row=np.r_[np.full(n,src),r,a,b]; col=np.r_[r,np.full(n,sink),b,a]
        cap=coo_matrix((np.rint(np.r_[d0,d1,weight,weight]*1000).astype(np.int64),(row,col)),shape=(n+2,n+2)).tocsr()
        cap.eliminate_zeros()
        res=cap-maximum_flow(cap,src,sink).flow
        res.data=np.maximum(0,res.data);res.eliminate_zeros()
        reach=breadth_first_order(res,src,directed=True,return_predecessors=False)
        mask=np.isin(r,reach).reshape(h,w).astype(np.float32)
        edge=np.zeros((h,w),bool)
        dx=mask[:,1:]!=mask[:,:-1];dy=mask[1:,:]!=mask[:-1,:]
        edge[:,1:]|=dx;edge[:,:-1]|=dx;edge[1:,:]|=dy;edge[:-1,:]|=dy
        score=corr(ink,gaussian_filter(edge.astype(np.float32),1.35))
        print("p55-only",p,mask.sum(),score)
        if score>best[0]:best=(score,p,mask)
    print("selected",best[:2])
    return best[2]

def main():
    stock=load_stock()
    ink=lambda p: np.maximum(0,252-native_sample(p)).astype(np.float32)/252
    p32,p55=ink(49),ink(72)
    mask=reconstruct(stock,p55)
    sx,sy,tx,ty=V55
    mapped=warp(mask,(1/sx,1/sy,-tx/sx,-ty/sy),stock.shape)
    for train,v in V32.items():
        for name,a in (("stock",stock),("p55-graphcut",mapped)):
            q=warp(gaussian_filter(a,v[4]),v,p32.shape)
            x=q[REG[train]].ravel();y=p32[REG[train]].ravel()
            gain,bias=np.linalg.lstsq(np.c_[x,np.ones_like(x)],y,rcond=None)[0]
            print(train,name,gain,bias,{k:(corr(q[r],p32[r]),float(np.mean((q[r]*gain+bias-p32[r])**2))) for k,r in REG.items()})
    h,w=p32.shape
    source=np.pad(mask,((0,h-mask.shape[0]),(0,w-mask.shape[1])))
    for train in V32:
        ys,xs=REG[train];best=(-2,None)
        for sig in np.arange(.5,12.01,.25):
            a=gaussian_filter(source,sig)
            pad=np.pad(a,((25,25),(25,25)))
            block=pad[ys.start:ys.stop+50,xs.start:xs.stop+50]
            _,mx,_,(xx,yy)=cv2.minMaxLoc(cv2.matchTemplate(block,p32[ys,xs],cv2.TM_CCOEFF_NORMED))
            if mx>best[0]:best=(mx,(xx-25,yy-25,sig))
        dx,dy,sig=best[1]
        q=warp(gaussian_filter(source,sig),(1,1,dx,dy),p32.shape)
        print("integer",train,best,{k:corr(q[r],p32[r]) for k,r in REG.items()})

if __name__=="__main__":
    main()
