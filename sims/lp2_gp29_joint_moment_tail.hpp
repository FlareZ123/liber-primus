#pragma once
#include "lp2_gp29_joint_affine_completion.hpp"

// Exact moment-tail derivative; the original receiver is left unchanged.
namespace joint22 {
using namespace joint46;
// A single omitted coordinate is determined by sum pi=0; every permutation
// then has sum pi^2=0. Restrict the final affine variable to quadratic roots.
struct MomentTail {
 std::array<std::array<int,MAXV+1>,MAXV+1> q{};
 std::array<Form,N> full{};
 bool eligible=false;
 explicit MomentTail(const Shape& p){
  if(p.singletons.size()>1||p.m==0)return;
  full=p.forms;auto& f=full;
  if(p.singletons.size()==1){auto& t=f[p.singletons[0]];for(int j=0;j<=p.m;j++){int z=0;for(int i:p.active)z+=f[i][j];t[j]=mod(-z);}}
  for(int a=0;a<=p.m;a++)for(int b=a;b<=p.m;b++){int z=0;for(auto& g:f)z+=g[a]*g[b];q[a][b]=mod((a==b?1:2)*z);q[b][a]=q[a][b];}
  eligible=true;
 }
 static const auto& roots(){
  static const auto t=[](){std::array<uint32_t,N*N*N> t{};for(int a=0;a<N;a++)for(int b=0;b<N;b++)for(int c=0;c<N;c++)for(int z=0;z<N;z++)if((a*z*z+b*z+c)%N==0)t[(a*N+b)*N+c]|=1u<<z;return t;}();return t;
 }
 struct Slice {int a,b0,b1,c0,c1,c2;uint32_t allowed(int v)const{return roots()[(a*N+mod(b0+b1*v))*N+mod(c0+c1*v+c2*v*v)];}};
 Slice slice(const std::array<uint8_t,MAXV>& x,int m,int pen,int last)const{
  const int p=pen+1,l=last+1;Slice s{q[l][l],q[0][l],q[p][l],q[0][0],q[0][p],q[p][p]};
  for(int i=1;i<=m;i++)if(i!=p&&i!=l){const int v=x[i-1];s.b0+=q[i][l]*v;s.c1+=q[i][p]*v;s.c0+=q[0][i]*v+q[i][i]*v*v;for(int j=1;j<i;j++)if(j!=p&&j!=l)s.c0+=q[i][j]*v*x[j-1];}
  s.b0=mod(s.b0);s.c0=mod(s.c0);s.c1=mod(s.c1);return s;
 }
 uint32_t allowed(const std::array<uint8_t,MAXV>& x,int m,int last)const{
  const int l=last+1;int a=q[l][l],b=q[0][l],c=q[0][0];
  for(int i=1;i<=m;i++)if(i!=l){const int v=x[i-1];b+=q[i][l]*v;c+=q[0][i]*v+q[i][i]*v*v;for(int j=1;j<i;j++)if(j!=l)c+=q[i][j]*v*x[j-1];}
  return roots()[(a*N+mod(b))*N+mod(c)];
 }
};

template<class Emit,class Stop>
Stats enumerateMomentTail(const Input& in,Emit emit,Stop stop,Limits lim={},bool factorSingletons=true){
 const Shape p=prepare(in,factorSingletons);
 if(p.singletons.size()>1||p.m==0)return joint46::enumerate(in,emit,stop,lim,factorSingletons);
 Stats s;s.eligible=p.eligible;s.variables=p.m;s.components=p.c;s.active=int(p.active.size());s.singletons=int(p.singletons.size());
 if(!p.eligible){s.exhausted=false;return s;}if(p.impossible)return s;
 const int m=p.m,subsets=1<<m;std::array<std::unordered_map<uint64_t,Direction>,MAXV> maps;
 for(const auto& f:p.constraints)for(int j=0;j<m;j++)if(f[j+1]){
  Direction a;const int q=inv[f[j+1]];a.support=1u<<j;uint64_t code=0;
  for(int i=0;i<m;i++){a.a[i]=i==j?0:mod(-int(f[i+1])*q);if(a.a[i])a.support|=1u<<i;code=code*N+a.a[i];}
  auto it=maps[j].try_emplace(code,a).first;it->second.mask|=1u<<mod(-int(f[0])*q);if(it->second.mask==ALL)return s;
 }
 std::array<std::vector<Direction>,MAXV> dirs;std::array<std::vector<uint32_t>,MAXV> counts;
 for(int j=0;j<m;j++){counts[j].assign(subsets,0);for(const auto& [_,a]:maps[j]){dirs[j].push_back(a);counts[j][a.support]++;}for(int i=0;i<m;i++)for(int b=0;b<subsets;b++)if(b&(1<<i))counts[j][b]+=counts[j][b^(1<<i)];}
 std::array<uint64_t,MAXV+1> pow{};pow[0]=1;for(int i=1;i<=MAXV;i++)pow[i]=pow[i-1]*N;
 std::vector<uint64_t> dp(subsets,std::numeric_limits<uint64_t>::max());std::vector<int> last(subsets,-1);dp[0]=0;
 for(int b=1;b<subsets;b++)for(int j=0;j<m;j++)if(b&(1<<j)){const uint64_t score=dp[b^(1<<j)]+pow[std::popcount(unsigned(b))-1]*counts[j][b];if(score<dp[b]){dp[b]=score;last[b]=j;}}
 s.staticCost=dp.back();for(int b=subsets-1;b;){int j=last[b];s.order.push_back(j);b^=1<<j;}std::reverse(s.order.begin(),s.order.end());
 std::array<std::vector<Bucket>,MAXV> groups;int used=0;
 for(int j=0;j<m;j++){const int v=s.order[j];used|=1<<v;std::vector<Direction> selected;for(auto& a:dirs[v])if(!(a.support&~used))selected.push_back(a);std::sort(selected.begin(),selected.end(),[](const Direction& a,const Direction& b){int na=std::popcount(a.mask),nb=std::popcount(b.mask);if(na!=nb)return na>nb;return a.a<b.a;});for(auto& a:selected){Bucket q;for(int i=0;i<j;i++)if(a.a[s.order[i]]){q.coord[q.n]=uint8_t(i);q.coefficient[q.n++]=a.a[s.order[i]];}for(int t=0;t<N;t++)q.rotated[t]=rot(a.mask,t);groups[j].push_back(q);}s.bucketCounts.push_back(int(groups[j].size()));}
 std::array<uint8_t,MAXV> x{},y{};
 const MomentTail tail(p);
 std::vector<int> checkOrder;
 std::array<std::vector<int>,N> checkGroups;for(int i:p.active)checkGroups[in.root[i]].push_back(i);
 for(int k=0;k<N;k++)for(auto& g:checkGroups)if(k<int(g.size()))checkOrder.push_back(g[k]);
 bool cubic=tail.eligible&&m==p.d+1&&m>=2&&s.order.back()==p.d;
 int A=0,D3=0,c2=0,d3=0,e2=0;
 if(cubic){
  const int uidx=s.order[m-2]+1,tidx=s.order[m-1]+1;
  for(const auto& f:tail.full){int u=f[uidx],v=f[tidx];A+=v*v;D3+=v*v*v;c2+=u*u;d3+=u*u*u;e2+=3*v*u*u;}
  A=mod(A);D3=mod(D3);c2=mod(c2);d3=mod(d3);e2=mod(e2);
  if(!A)cubic=false;
  else for(int j=0;j<=m;j++)if(j!=tidx){int a=0,b=0;for(const auto& f:tail.full){int v=f[tidx];a+=f[j]*v;b+=f[j]*v*v;}if(mod(a)||mod(b))cubic=false;}
 }

 auto dfs=[&](auto&& self,int j)->void{
  if(!s.exhausted)return;
  if(j==m){s.leaves++;Key k{};for(int i=0;i<Q;i++)k[i]=evaluate(p.key[i],x,p.d);bool primitive=false;for(int i=0;i<4;i++)primitive|=k[i]!=k[i+4];if(!primitive)return;Perm pi{};uint32_t occupied=0;for(int i:p.active){pi[i]=evaluate(p.forms[i],x,m);uint32_t bit=1u<<pi[i];if(occupied&bit)throw std::logic_error("noninjective full action");occupied|=bit;}std::vector<uint8_t> free;for(int v=0;v<N;v++)if(!(occupied&(1u<<v)))free.push_back(v);if(free.size()!=p.singletons.size())throw std::logic_error("singleton complement size");do{for(size_t z=0;z<free.size();z++)pi[p.singletons[z]]=free[z];Perm normalized=pi;for(auto& v:normalized)v=mod(int(v)-pi[0]);emit(normalized,k);s.candidates++;if(s.candidates>=lim.candidates||stop()){s.exhausted=false;return;}}while(std::next_permutation(free.begin(),free.end()));return;}
  if(s.nodes>=lim.nodes||s.rotations>=lim.rotations||((s.nodes&1023u)==0&&stop())){s.exhausted=false;return;}s.nodes++;
  if(tail.eligible&&j==m-1){
   uint32_t allowed=tail.allowed(x,m,s.order[j]);bool any=false;
   while(allowed&&s.exhausted){int v=std::countr_zero(allowed);allowed&=allowed-1;x[s.order[j]]=v;y[j]=v;uint32_t occupied=0;bool ok=true;for(int i:p.active){uint32_t bit=1u<<evaluate(p.forms[i],x,m);if(occupied&bit){ok=false;break;}occupied|=bit;}if(ok){any=true;self(self,j+1);}}
   if(!any&&s.exhausted)s.zeroMasks++;
   return;
  }
  uint32_t forbidden=0;for(const auto& q:groups[j]){int v=0;for(int i=0;i<q.n;i++)v+=q.coefficient[i]*y[q.coord[i]];forbidden|=q.rotated[v%N];s.rotations++;if(forbidden==ALL)break;}uint32_t allowed=ALL&~forbidden;if(!allowed){s.zeroMasks++;return;}
  if(tail.eligible&&j==m-2){
   const auto sl=tail.slice(x,m,s.order[j],s.order[j+1]);
   std::array<int,N> base{};bool ready=false;
   const int v0=s.order[j],v1=s.order[j+1];
   int c0=0,c1=0,d0=0,d1=0,d2=0,e0=0,e1=0;
   if(cubic){for(int i=0;i<N;i++){const auto& f=tail.full[i];int b=f[0];for(int k=0;k<m;k++)if(k!=v0&&k!=v1)b+=f[k+1]*x[k];b%=N;base[i]=b;const int u=f[v0+1],t=f[v1+1];c0+=b*b;c1+=2*b*u;d0+=b*b*b;d1+=3*b*b*u;d2+=3*b*u*u;e0+=3*t*b*b;e1+=6*t*b*u;}c0=mod(c0);c1=mod(c1);d0=mod(d0);d1=mod(d1);d2=mod(d2);e0=mod(e0);e1=mod(e1);ready=true;}
   while(allowed&&s.exhausted){int v=std::countr_zero(allowed);allowed&=allowed-1;y[j]=v;x[s.order[j]]=v;
    if(s.nodes>=lim.nodes||s.rotations>=lim.rotations||((s.nodes&1023u)==0&&stop())){s.exhausted=false;return;}s.nodes++;
    uint32_t end;
    if(cubic){int sq=mod(-mod(c0+v*(c1+v*c2))*inv[A]);int L=mod(e0+v*(e1+v*e2)+D3*sq);int C=mod(d0+v*(d1+v*(d2+v*d3)));if(L){int w=mod(-C*inv[L]);end=(w*w%N==sq)?(1u<<w):0;}else end=C?0:MomentTail::roots()[(1*N+0)*N+mod(-sq)];}
    else end=sl.allowed(v);
    if(end&&!ready){for(int i:checkOrder){const auto& f=p.forms[i];int b=f[0];for(int k=0;k<m;k++)if(k!=v0&&k!=v1)b+=f[k+1]*x[k];base[i]=b%N;}ready=true;}
    bool any=false;while(end&&s.exhausted){int w=std::countr_zero(end);end&=end-1;x[s.order[j+1]]=w;y[j+1]=w;uint32_t occupied=0;bool ok=true;
     for(int i:checkOrder){uint32_t bit=1u<<((base[i]+p.forms[i][v0+1]*v+p.forms[i][v1+1]*w)%N);if(occupied&bit){ok=false;break;}occupied|=bit;}
     if(ok){any=true;self(self,j+2);}}
    if(!any&&s.exhausted)s.zeroMasks++;
   }return;
  }
  while(allowed&&s.exhausted){int v=std::countr_zero(allowed);allowed&=allowed-1;y[j]=v;x[s.order[j]]=v;self(self,j+1);}
 };dfs(dfs,0);return s;
}
}
