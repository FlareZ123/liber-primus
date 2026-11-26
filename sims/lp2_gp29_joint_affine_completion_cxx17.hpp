#pragma once
#include <algorithm>
#include <array>
#include <cstdint>
#include <limits>
#include <stdexcept>
#include <unordered_map>
#include <vector>

namespace joint46 {
constexpr int N=29,Q=8,MAXV=9;
constexpr uint32_t ALL=(1u<<N)-1;
constexpr int mod(int x){return (x%N+N)%N;}
constexpr auto inverses(){std::array<int,N> a{};for(int x=1;x<N;x++)for(int y=1;y<N;y++)if(x*y%N==1)a[x]=y;return a;}
constexpr auto inv=inverses();
constexpr uint32_t rot(uint32_t x,int t){return t?((x<<t)|(x>>(N-t)))&ALL:x;}
using Form=std::array<uint8_t,MAXV+1>; // constant, then coefficients
using Key=std::array<uint8_t,Q>;
using Perm=std::array<uint8_t,N>;
struct Input {
 int d=0;
 std::array<uint8_t,N> root{};
 std::array<Form,N> off{};
 std::array<Form,Q> key{};
};
struct Limits {
 uint64_t rotations=std::numeric_limits<uint64_t>::max();
 uint64_t nodes=std::numeric_limits<uint64_t>::max();
 uint64_t candidates=std::numeric_limits<uint64_t>::max();
};
struct Stats {
 bool exhausted=true,eligible=true;
 int variables=0,components=0,active=0,singletons=0;
 uint64_t nodes=0,rotations=0,zeroMasks=0,leaves=0,candidates=0,staticCost=0;
 std::vector<int> order,bucketCounts;
};
struct Shape {
 int d=0,m=0,c=0;
 bool eligible=true,impossible=false;
 std::array<Form,N> forms{};
 std::array<Form,Q> key{};
 std::vector<int> active,singletons;
 std::vector<Form> constraints;
};
inline Shape prepare(const Input& in,bool factorSingletons=true){
 Shape p;p.d=in.d;p.key=in.key;
 if(in.d<0||in.d>7)throw std::invalid_argument("key dimension");
 std::array<std::vector<int>,N> groups;
 for(int i=0;i<N;i++){if(in.root[i]>=N)throw std::invalid_argument("component root");groups[in.root[i]].push_back(i);}
 std::vector<std::vector<int>> a;
 for(auto& g:groups)if(!g.empty()){p.c++;if(factorSingletons&&g.size()==1)p.singletons.push_back(g[0]);else a.push_back(g);}
 if(a.empty()||p.c<2){p.eligible=false;return p;}
 std::sort(a.begin(),a.end(),[](const auto& x,const auto& y){return x.size()!=y.size()?x.size()>y.size():x[0]<y[0];});
 const int c=int(a.size());
 // With one connected component no relative translation exists. With
 // singletons, all remaining nontrivial component means are free; the
 // singleton labels will be assigned to the exact unused residues.
 const int t=p.singletons.empty()?std::max(0,c-2):c-1;
 p.m=p.d+t;if(p.m>MAXV){p.eligible=false;return p;}
 for(int j=0;j<c;j++){
  auto& g=a[j];Form mean{};
  for(int v=0;v<=p.d;v++){int s=0;for(int x:g)s+=in.off[x][v];mean[v]=mod(s*inv[g.size()]);}
  for(int x:g){p.active.push_back(x);auto& f=p.forms[x];for(int v=0;v<=p.d;v++)f[v]=mod(int(in.off[x][v])-mean[v]);
   if(j>0){if(!p.singletons.empty()||j<c-1)f[p.d+j]=1;else for(int z=1;z<c-1;z++)f[p.d+z]=mod(-int(a[z].size())*inv[g.size()]);}
  }
 }
 for(size_t i=0;i<p.active.size();i++)for(size_t j=0;j<i;j++){
  Form f{};const auto& x=p.forms[p.active[i]];const auto& y=p.forms[p.active[j]];bool var=false;
  for(int v=0;v<=p.m;v++){f[v]=mod(int(x[v])-y[v]);if(v&&f[v])var=true;}
  if(!var){if(!f[0])p.impossible=true;}else p.constraints.push_back(f);
 }
 std::sort(p.singletons.begin(),p.singletons.end());return p;
}
struct Direction{std::array<uint8_t,MAXV> a{};uint32_t mask=0;uint16_t support=0;};
struct Bucket{std::array<uint8_t,MAXV> coord{},coefficient{};std::array<uint32_t,N> rotated{};uint8_t n=0;};
inline int evaluate(const Form& f,const std::array<uint8_t,MAXV>& x,int n){int s=f[0];for(int i=0;i<n;i++)s+=f[i+1]*x[i];return s%N;}

// The callback receives every normalized action (pi(F)=0) exactly once
// for this graph state. Returning false from stop() means continue.
// A capped/externally stopped run is never an exclusion.
template<class Emit,class Stop>
Stats enumerate(const Input& in,Emit emit,Stop stop,Limits lim={},bool factorSingletons=true){
 const Shape p=prepare(in,factorSingletons);Stats s;s.eligible=p.eligible;s.variables=p.m;s.components=p.c;s.active=int(p.active.size());s.singletons=int(p.singletons.size());
 if(!p.eligible){s.exhausted=false;return s;}if(p.impossible)return s;
 const int m=p.m,subsets=1<<m;
 std::array<std::unordered_map<uint64_t,Direction>,MAXV> maps;
 for(const auto& f:p.constraints)for(int j=0;j<m;j++)if(f[j+1]){
  Direction a;const int q=inv[f[j+1]];a.support=1u<<j;uint64_t code=0;
  for(int i=0;i<m;i++){a.a[i]=i==j?0:mod(-int(f[i+1])*q);if(a.a[i])a.support|=1u<<i;code=code*N+a.a[i];}
  auto it=maps[j].try_emplace(code,a).first;it->second.mask|=1u<<mod(-int(f[0])*q);
  if(it->second.mask==ALL)return s;
 }
 // Exact subset DP: bucket count for the last variable of a prefix
 // depends only on the prefix set, not the order of its earlier variables.
 std::array<std::vector<Direction>,MAXV> dirs;
 std::array<std::vector<uint32_t>,MAXV> counts;
 for(int j=0;j<m;j++){
  counts[j].assign(subsets,0);
  for(const auto& [_,a]:maps[j]){dirs[j].push_back(a);counts[j][a.support]++;}
  for(int i=0;i<m;i++)for(int b=0;b<subsets;b++)if(b&(1<<i))counts[j][b]+=counts[j][b^(1<<i)];
 }
 std::array<uint64_t,MAXV+1> pow{};pow[0]=1;for(int i=1;i<=MAXV;i++)pow[i]=pow[i-1]*N;
 std::vector<uint64_t> dp(subsets,std::numeric_limits<uint64_t>::max());std::vector<int> last(subsets,-1);dp[0]=0;
 for(int b=1;b<subsets;b++)for(int j=0;j<m;j++)if(b&(1<<j)){
  const uint64_t score=dp[b^(1<<j)]+pow[__builtin_popcount(unsigned(b))-1]*counts[j][b];
  if(score<dp[b]){dp[b]=score;last[b]=j;}
 }
 s.staticCost=dp.back();for(int b=subsets-1;b;){int j=last[b];s.order.push_back(j);b^=1<<j;}std::reverse(s.order.begin(),s.order.end());
 std::array<std::vector<Bucket>,MAXV> groups;int used=0;
 for(int j=0;j<m;j++){
  const int v=s.order[j];used|=1<<v;
  // Put broad masks first to saturate the forbidden union early.
  std::vector<Direction> selected;
  for(auto& a:dirs[v])if(!(a.support&~used))selected.push_back(a);
  std::sort(selected.begin(),selected.end(),[](const Direction& a,const Direction& b){int na=__builtin_popcount(a.mask),nb=__builtin_popcount(b.mask);if(na!=nb)return na>nb;return a.a<b.a;});
  for(auto& a:selected){Bucket q;for(int i=0;i<j;i++)if(a.a[s.order[i]]){q.coord[q.n]=uint8_t(i);q.coefficient[q.n++]=a.a[s.order[i]];}
   for(int t=0;t<N;t++)q.rotated[t]=rot(a.mask,t);
   groups[j].push_back(q);}
  s.bucketCounts.push_back(int(groups[j].size()));
 }
 std::array<uint8_t,MAXV> x{},y{};
 auto dfs=[&](auto&& self,int j)->void{
  if(!s.exhausted)return;
  if(j==m){
   s.leaves++;Key k{};for(int i=0;i<Q;i++)k[i]=evaluate(p.key[i],x,p.d);
   bool primitive=false;for(int i=0;i<4;i++)primitive|=k[i]!=k[i+4];if(!primitive)return;
   Perm pi{};uint32_t occupied=0;
   for(int i:p.active){pi[i]=evaluate(p.forms[i],x,m);uint32_t bit=1u<<pi[i];if(occupied&bit)throw std::logic_error("noninjective full action");occupied|=bit;}
   std::vector<uint8_t> free;for(int v=0;v<N;v++)if(!(occupied&(1u<<v)))free.push_back(v);
   if(free.size()!=p.singletons.size())throw std::logic_error("singleton complement size");
   do{
    for(size_t z=0;z<free.size();z++)pi[p.singletons[z]]=free[z];
    Perm normalized=pi;for(auto& v:normalized)v=mod(int(v)-pi[0]);
    emit(normalized,k);s.candidates++;
    if(s.candidates>=lim.candidates||stop()){s.exhausted=false;return;}
   }while(std::next_permutation(free.begin(),free.end()));
   return;
  }
  if(s.nodes>=lim.nodes||s.rotations>=lim.rotations||((s.nodes&1023u)==0&&stop())){s.exhausted=false;return;}
  s.nodes++;uint32_t forbidden=0;
  for(const auto& q:groups[j]){int v=0;for(int i=0;i<q.n;i++)v+=q.coefficient[i]*y[q.coord[i]];forbidden|=q.rotated[v%N];s.rotations++;if(forbidden==ALL)break;}
  uint32_t allowed=ALL&~forbidden;if(!allowed){s.zeroMasks++;return;}
  while(allowed&&s.exhausted){int v=__builtin_ctz(allowed);allowed&=allowed-1;y[j]=v;x[s.order[j]]=v;self(self,j+1);}
 };
 dfs(dfs,0);return s;
}
}
