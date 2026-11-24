#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <cstdlib>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>
#include <omp.h>
#ifdef __AVX512F__
#include <immintrin.h>
#endif
using namespace std;
struct Tape {
 vector<int> c;int burn,shift;uint32_t limit;
 Tape(vector<int> a,bool hold):c(move(a)),shift(hold?2:1){if(hold)c.erase(remove(c.begin(),c.end(),0),c.end());uint32_t seen=0;burn=0;while(__builtin_popcount(seen)<(hold?28:29)&&burn<int(c.size()))seen|=1u<<c[burn++];assert(__builtin_popcount(seen)==(hold?28:29));limit=1u<<(29-shift);}
 inline array<int,2> pivots(uint32_t m)const{array<int,2> p{-1,-1};for(int i=burn-1;i>=0;--i){int cl=(m>>c[i])&1;if(p[cl]<0)p[cl]=c[i];if(p[0]>=0&&p[1]>=0)break;}if(p[0]<0)p[0]=0;if(p[1]<0)p[1]=0;return p;}
 inline int scalar(uint32_t m)const{auto p=pivots(m);array<int,29> cnt{};array<int,2> pc{};for(int i=burn;i<int(c.size());++i){int v=c[i],s=(m>>v)&1,old=p[s];if(v==old)pc[s]++;else{cnt[old]=cnt[v]+1;p[s]=v;}}return max(*max_element(cnt.begin(),cnt.end()),max(pc[0],pc[1]));}
#ifdef __AVX512F__
 inline void vector16(uint32_t first,int*out)const{alignas(64) int p0[16],p1[16],counts[29][16]{};for(int i=0;i<16;i++){auto p=pivots((first+i)<<shift);p0[i]=p[0];p1[i]=p[1];}const __m512i lane=_mm512_setr_epi32(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15),one=_mm512_set1_epi32(1),mask=_mm512_sllv_epi32(_mm512_add_epi32(_mm512_set1_epi32(first),lane),_mm512_set1_epi32(shift));__m512i a=_mm512_load_si512(p0),b=_mm512_load_si512(p1),ac=_mm512_setzero_si512(),bc=ac;
 for(int i=burn;i<int(c.size());++i){int v=c[i];const __m512i vv=_mm512_set1_epi32(v);const __mmask16 s=_mm512_test_epi32_mask(mask,_mm512_set1_epi32(1u<<v));const __m512i old=_mm512_mask_blend_epi32(s,a,b);const __mmask16 eq=_mm512_cmpeq_epi32_mask(old,vv);const __m512i val=_mm512_add_epi32(_mm512_load_si512(counts[v]),one),idx=_mm512_add_epi32(_mm512_slli_epi32(old,4),lane);_mm512_mask_i32scatter_epi32(counts,~eq,idx,val,4);ac=_mm512_mask_add_epi32(ac,eq&~s,ac,one);bc=_mm512_mask_add_epi32(bc,eq&s,bc,one);a=_mm512_mask_mov_epi32(a,~s,vv);b=_mm512_mask_mov_epi32(b,s,vv);}
 __m512i mx=_mm512_max_epi32(ac,bc);for(auto &r:counts)mx=_mm512_max_epi32(mx,_mm512_load_si512(r));_mm512_storeu_si512(out,mx);}
#endif
};
int main(int argc,char**argv){ios::sync_with_stdio(false);cin.tie(nullptr);int n,k,b;cin>>n>>k>>b;vector<int> c(n);for(int&v:c)cin>>v;bool hold=argc>1&&atoi(argv[1]);Tape t(c,hold);uint32_t limit=argc>2?min(t.limit,uint32_t(strtoul(argv[2],nullptr,10))):t.limit;assert(limit%16==0);int threshold=argc>3?atoi(argv[3]):494;uint64_t above=0;int best=0;uint32_t bestMask=0;auto start=chrono::steady_clock::now();
#ifdef __AVX512F__
 mt19937 rng(3301);for(int j=0;j<128;++j){uint32_t x=(rng()%(t.limit/16))*16;int o[16];t.vector16(x,o);for(int i=0;i<16;++i)assert(o[i]==t.scalar((x+i)<<t.shift));}cerr<<"2048 scalar/vector comparisons passed\n";
#endif
 #pragma omp parallel
 {int mx=0;uint32_t mk=0;uint64_t over=0;
 #pragma omp for schedule(static)
 for(uint32_t x=0;x<limit;x+=16){int o[16];
#ifdef __AVX512F__
 t.vector16(x,o);
#else
 for(int i=0;i<16;++i)o[i]=t.scalar((x+i)<<t.shift);
#endif
 for(int i=0;i<16;++i){if(o[i]+t.burn>=threshold)over++;if(o[i]>mx){mx=o[i];mk=(x+i)<<t.shift;}}}
 #pragma omp critical
 {above+=over;if(mx>best){best=mx;bestMask=mk;}}}
 cout<<"{\"hold\":"<<hold<<",\"tested\":"<<limit<<",\"total\":"<<t.limit<<",\"burn\":"<<t.burn<<",\"tailMax\":"<<best<<",\"upper\":"<<best+t.burn<<",\"bestMask\":"<<bestMask<<",\"above\":"<<above<<",\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<"}\n";
}
