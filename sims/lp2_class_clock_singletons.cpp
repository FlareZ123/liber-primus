#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>
#include <omp.h>
using namespace std;
constexpr uint32_t FULL=(1u<<29)-1;
struct Tape {
 vector<int> c,prev,anchors;vector<uint32_t> bits;int minburn;uint32_t active=0;vector<int> first;
 Tape(vector<int> tape,vector<int> points,int b):c(move(tape)),prev(c.size()),anchors(move(points)),bits(c.size()),minburn(b){array<int,29> last;last.fill(-1);for(size_t i=0;i<c.size();++i){prev[i]=last[c[i]];last[c[i]]=i;bits[i]=1u<<c[i];if(!(active&bits[i])){active|=bits[i];first.push_back(i);}}for(int t:anchors)assert(t>=0&&t<int(c.size()));}
 inline int burn(uint32_t mask)const{bool cl=bool(bits[0]&mask);for(int p:first)if(bool(bits[p]&mask)!=cl)return max(minburn,p+1);return max(minburn,1);}
 inline int origin(int t,uint32_t mask,int burn)const{const bool cl=bool(bits[t]&mask);const uint32_t s=cl?mask:FULL^mask;while(true){int p=prev[t];if(p<0)return c[t];int q=p+1;while(!(bits[q]&s))++q;if(q<burn)return c[t];if(q==t)return 29+cl;t=q;}}
 void check(uint32_t mask,mt19937& rng)const{array<int,29>a; iota(a.begin(),a.end(),0);shuffle(a.begin(),a.end(),rng);array<int,29> id{};int b=burn(mask);for(int t=0;t<int(c.size());++t){if(t==b){id=a;int first=0;for(int i=0;i<b;++i)first|=1<<bool(bits[i]&mask);if(first&1)id[0]=29;if(first&2)id[1]=30;}int r=find(a.begin(),a.end(),c[t])-a.begin();if(t>=b&&binary_search(anchors.begin(),anchors.end(),t))assert(id[r]==origin(t,mask,b));swap(a[r],a[bool(bits[t]&mask)]);}}
};
int main(){ios::sync_with_stdio(false);cin.tie(nullptr);int n,k,b; if(!(cin>>n>>k>>b))return 1;vector<int> c(n),a(k);for(auto&v:c)cin>>v;for(auto&v:a)cin>>v;Tape tape(move(c),move(a),b);mt19937 rng(3301);for(int j=0;j<1000;++j)tape.check((rng()&FULL)&~1u,rng);tape.check(0,rng);cerr<<"1001 exact inverse comparisons passed\n";
 vector<int> vars;uint32_t firstBit=tape.active&-tape.active;for(int i=0;i<29;++i)if((tape.active^firstBit)&(1u<<i))vars.push_back(i);int lo=min(14,int(vars.size())),hi=vars.size()-lo;vector<uint32_t> low(1u<<lo),high(1u<<hi);for(uint32_t i=1;i<low.size();++i)low[i]=low[i&(i-1)]|(1u<<vars[__builtin_ctz(i)]);for(uint32_t i=1;i<high.size();++i)high[i]=high[i&(i-1)]|(1u<<vars[lo+__builtin_ctz(i)]);const uint32_t limit=1u<<vars.size(),lm=(1u<<lo)-1;vector<uint64_t> rejected(k+1);vector<uint32_t> survivors;auto begin=chrono::steady_clock::now();
 #pragma omp parallel
 {vector<uint64_t> local(k+1);vector<uint32_t> kept;
 #pragma omp for schedule(static)
 for(uint32_t x=0;x<limit;++x){uint32_t m=low[x&lm]|high[x>>lo],seen=0;int b=tape.burn(m),j=0;for(;j<k;++j){if(tape.anchors[j]<b)continue;seen|=1u<<tape.origin(tape.anchors[j],m,b);if(__builtin_popcount(seen)>3)break;}++local[j];if(j==k)kept.push_back(m);}
 #pragma omp critical
 {for(int j=0;j<=k;++j)rejected[j]+=local[j];survivors.insert(survivors.end(),kept.begin(),kept.end());}}
 uint64_t total=accumulate(rejected.begin(),rejected.end(),uint64_t(0));assert(total==limit);cout<<"{\"tested\":"<<total<<",\"rejectedByAnchor\":[";for(int j=0;j<k;++j)cout<<(j?",":"")<<rejected[j];cout<<"],\"survivors\":"<<survivors.size()<<",\"masks\":[";sort(survivors.begin(),survivors.end());for(size_t j=0;j<survivors.size();++j)cout<<(j?",":"")<<survivors[j];cout<<"],\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-begin).count()<<"}\n";
}
