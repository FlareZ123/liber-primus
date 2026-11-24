#include <array>
#include <vector>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <functional>
#include <unordered_set>
#include <set>
using namespace std;
using K=array<int,13>;
int dec(char c){return c<='9'?c-'0':c-'a'+10;}char enc(int x){return x<10?'0'+x:'a'+x-10;}int mod(int x){return (x%29+29)%29;}
vector<vector<int>> words(string s){istringstream in(s);string w;vector<vector<int>> a;while(in>>w){vector<int>v;for(char c:w)v.push_back(dec(c));a.push_back(v);}return a;}
vector<int> flatten(const vector<vector<int>>& w){vector<int> a;for(auto&v:w)a.insert(a.end(),v.begin(),v.end());return a;}
// X_i=inner[i], Y_j=-outer[j]. pot[v] = value[v]-value[parent[v]].
struct UF{
 array<int,14> parent,pot;
 UF(){for(int i=0;i<14;i++){parent[i]=i;pot[i]=0;}}
 pair<int,int> find(int x)const{int d=0;while(parent[x]!=x){d+=pot[x];x=parent[x];}return{x,mod(d)};}
 bool eq(int x,int y,int d){auto [rx,px]=find(x);auto [ry,py]=find(y);if(rx==ry)return mod(px-py)==d;parent[rx]=ry;pot[rx]=mod(d-px+py);return true;}
};
struct Stats{uint64_t words=0,paths=0,consistent=0,assignments=0,tested=0,survive=0,dupes=0,skipped=0,adjpaths=0,adjbound=0,symbolic=0,symbolicPaths=0;array<uint64_t,14> comps{};};
int I=5,O=8;
uint64_t backward(const vector<int>& c,const K& k,int off,int a0,int b0){
 uint64_t s=1ULL<<(a0*O+b0);
 for(int i=off-1;i>=0;i--){int x=c[i];uint64_t t=0;
  while(s){int j=__builtin_ctzll(s);s&=s-1;int a=j/O,b=j%O,aa=(a+I-1)%I,bb=(b+O-1)%O;if(x==0){t|=1ULL<<j;if(k[aa])t|=1ULL<<(O*aa+b);}int q=mod(x+k[I+bb]);if(q&&q!=k[aa])t|=1ULL<<(O*aa+bb);}
  s=t;if(!s)return 0;
 }return s;
}
uint64_t forward(const vector<int>& c,const K& k,int off,int a0,int b0){
 uint64_t s=1ULL<<(a0*O+b0);
 for(int i=off;i<(int)c.size();i++){int x=c[i];uint64_t t=0;
  while(s){int j=__builtin_ctzll(s);s&=s-1;int a=j/O,b=j%O,aa=(a+1)%I,bb=(b+1)%O;if(x==0){t|=1ULL<<j;if(k[a])t|=1ULL<<(O*aa+b);}int q=mod(x+k[I+b]);if(q&&q!=k[a])t|=1ULL<<(O*aa+bb);}
  s=t;if(!s)return 0;
 }return s;
}
// Full forced-anchor independent DP, verifies every survivor.
bool check(const vector<int>& c,const K&k,int off,const vector<int>&p){
 uint64_t s=(1ULL<<40)-1;
 for(int i=0;i<(int)c.size();i++){
  if(i==off)s&=1;uint64_t t=0;int force=i>=off&&i<off+(int)p.size()?p[i-off]:-1;
  while(s){int j=__builtin_ctzll(s);s&=s-1;int a=j/O,b=j%O,aa=(a+1)%I,bb=(b+1)%O;auto put=[&](int pp,int na,int nb){if(force<0||force==pp)t|=1ULL<<(O*na+nb);};if(c[i]==0){put(0,a,b);int pp=mod(-k[a]);if(pp)put(pp,aa,b);}int q=mod(c[i]+k[I+b]);int pp=mod(q-k[a]);if(q&&pp)put(pp,aa,bb);}
  s=t;if(!s)return false;
 }return true;
}
string canonical(string s){string best=s;for(int i=1;i<(int)s.size();i++)best=min(best,s.substr(i)+s.substr(0,i));return best;}
struct Expr{int v,d;};
constexpr int pow29(int d){int n=1;while(d--)n*=29;return n;}
template<int D>struct Gauge{
 static constexpr int N=pow29(D),W=(N+63)/64;
 using Bits=array<uint64_t,W>;
 Bits all{},zero{};
 array<array<Bits,29>,D> unary{};
 array<array<array<Bits,29>,D>,D> diff{};
 Gauge(){for(int j=0;j<N;j++){int x=j;array<int,D>v{};for(int i=0;i<D;i++){v[i]=x%29;x/=29;unary[i][v[i]][j/64]|=1ULL<<(j%64);}for(int a=0;a<D;a++)for(int b=0;b<D;b++)if(a!=b)diff[a][b][mod(v[a]-v[b])][j/64]|=1ULL<<(j%64);all[j/64]|=1ULL<<(j%64);}}
 const Bits& eq1(Expr a,int v)const{return a.v<0?(a.d==v?all:zero):unary[a.v][mod(v-a.d)];}
 const Bits& eq2(Expr a,Expr b,int v)const{
  if(a.v==b.v)return mod(a.d-b.d)==v?all:zero;
  if(a.v<0)return eq1(b,mod(a.d-v));if(b.v<0)return eq1(a,mod(v+b.d));return diff[a.v][b.v][mod(v-a.d+b.d)];
 }
 uint64_t count(const Bits&s)const{uint64_t n=0;for(auto x:s)n+=__builtin_popcountll(x);return n;}
 Bits initial(const array<uint32_t,14>&allowed,const array<array<uint32_t,14>,14>&bans,const array<int,14>&roots,int n,const array<Expr,14>&r)const{
  auto rot=[](uint32_t x,int k){return ((x<<k)|(x>>(29-k)))&((1u<<29)-1);};
  array<uint32_t,D> dom{};array<array<uint32_t,D>,D> fb{};
  for(int i=0;i<n;i++){int u=roots[i];if(r[u].v>=0)dom[r[u].v]=allowed[u];}
  for(int i=0;i<n;i++)for(int j=0;j<i;j++){int u=roots[i],v=roots[j];int a=r[u].v,b=r[v].v;uint32_t m=bans[u][v];if(!m)continue;
   if(a<0&&b<0){if(m&(1u<<mod(r[u].d-r[v].d)))return zero;}
   else if(a<0)dom[b]&=~rot(bans[v][u],r[u].d);
   else if(b<0)dom[a]&=~rot(m,r[v].d);
   else{fb[a][b]|=m;fb[b][a]|=bans[v][u];}
  }
  for(auto m:dom)if(!m)return zero;
  Bits s{};
  if constexpr(D==1){s[0]=dom[0];return s;}
  auto place=[&](int index,uint32_t m){int j=index/64,b=index%64;s[j]|=uint64_t(m)<<b;if(b>35&&j+1<W)s[j+1]|=uint64_t(m)>>(64-b);};
  if constexpr(D==2){uint32_t b=dom[1];while(b){int v=__builtin_ctz(b);b&=b-1;place(29*v,dom[0]&~rot(fb[0][1],v));}return s;}
  if constexpr(D==3){uint32_t c=dom[2];while(c){int z=__builtin_ctz(c);c&=c-1;uint32_t b=dom[1]&~rot(fb[1][2],z),a0=dom[0]&~rot(fb[0][2],z);while(b){int y=__builtin_ctz(b);b&=b-1;place(29*y+841*z,a0&~rot(fb[0][1],y));}}return s;}
 }
 Bits propagate(const vector<int>&c,const array<Expr,13>&k,int off,int a0,int b0,bool back,const Bits&initial)const{
  array<Bits,40> buf1,buf2;auto *states=&buf1,*next=&buf2;
  int start=a0*O+b0;(*states)[start]=initial;uint64_t active=1ULL<<start;
  int i=back?off-1:off;
  for(;i>=0&&i<(int)c.size();i+=back?-1:1){int x=c[i];uint64_t act=active,na=0;
   while(act){int j=__builtin_ctzll(act);act&=act-1;int a=j/O,b=j%O,aa=(a+(back?I-1:1))%I,bb=(b+(back?O-1:1))%O;
    const Bits &src=(*states)[j];
    auto put=[&](int dest,const Bits&ban1,const Bits&ban2){if(&ban1==&all||&ban2==&all)return;Bits&dst=(*next)[dest];uint64_t any=0;bool exists=na&(1ULL<<dest);if(exists){for(int w=0;w<W;w++)dst[w]|=src[w]&~(ban1[w]|ban2[w]);}else{for(int w=0;w<W;w++){dst[w]=src[w]&~(ban1[w]|ban2[w]);any|=dst[w];}if(any)na|=1ULL<<dest;}};
    int u=back?aa:a,v=back?bb:b;
    if(x==0){put(j,zero,zero);put(aa*O+b,eq1(k[u],0),zero);}
    put(aa*O+bb,eq1(k[I+v],mod(-x)),eq2(k[u],k[I+v],x));
   }
   if(!na)return zero;active=na;swap(states,next);
  }
  Bits out{};while(active){int j=__builtin_ctzll(active);active&=active-1;for(int w=0;w<W;w++)out[w]|=(*states)[j][w];}return out;
 }
};
struct Search{
 const vector<int>& c;int off;const vector<int>&p;Stats&st;set<string>&all;bool countOnly;uint64_t cap;unordered_set<string> seen;
 void finish(const UF&uf,const array<uint32_t,8>& forbidden,int a,int b){
  st.consistent++;array<int,14>root,delta;array<uint32_t,14> allowed;allowed.fill((1u<<29)-1);
  for(int j=0;j<14;j++){auto [r,d]=uf.find(j);root[j]=r;delta[j]=d;}allowed[root[13]]=1u<<mod(-delta[13]);
  for(int j=0;j<I;j++)for(int v=0;v<29;v++)if(forbidden[j]&(1u<<v))allowed[root[j]]&=~(1u<<mod(v-delta[j]));
  array<int,14>roots,values;int n=0,free=0;uint64_t count=1;
  for(int j=0;j<14;j++)if(root[j]==j){int k=__builtin_popcount(allowed[j]);if(!k)return;roots[n++]=j;if(k>1)free++;if(count>UINT64_MAX/k){count=UINT64_MAX;}else count*=k;}
  st.comps[free]++;st.assignments+=count;
  // Zero-free neighbors force both clocks to consume. These inequalities prune root assignments exactly.
  array<array<uint32_t,14>,14> bans{};
  auto add=[&](int x,int aa,int bb){int u=root[aa],v=root[I+bb];allowed[v]&=~(1u<<mod(-x-delta[I+bb]));if(!allowed[v])return false;int d=mod(x-delta[aa]+delta[I+bb]);if(u==v)return d!=0;bans[u][v]|=1u<<d;bans[v][u]|=1u<<mod(-d);return true;};
  int before=off,ba=0,bb=0,after=off+p.size(),fa=a,fb=b;
  while(before>0&&c[before-1]){before--;ba=(ba+I-1)%I;bb=(bb+O-1)%O;if(!add(c[before],ba,bb))return;}
  while(after<(int)c.size()&&c[after]){if(!add(c[after],fa,fb))return;after++;fa=(fa+1)%I;fb=(fb+1)%O;}
  st.adjpaths++;uint64_t bound=1;for(int j=0;j<n;j++)bound*=__builtin_popcount(allowed[roots[j]]);st.adjbound+=bound;
  if(countOnly)return;if(bound>cap){st.skipped+=bound;return;}
  auto accept=[&](const K&k){assert(check(c,k,off,p));st.survive++;string ik,ok,pw;for(int i=0;i<I;i++)ik+=enc(k[i]);for(int i=0;i<O;i++)ok+=enc(mod(-k[I+i]));for(int x:p)pw+=enc(x);all.insert(canonical(ik)+canonical(ok));cout<<"SURVIVOR "<<off<<" 0 "<<ik<<' '<<ok<<' '<<pw<<'\n';};
  int dims=0;array<Expr,14> expr;
  for(int j=0;j<n;j++){int r=roots[j];if(__builtin_popcount(allowed[r])==1)expr[r]={-1,__builtin_ctz(allowed[r])};else expr[r]={dims++,0};}
  array<Expr,13> ke;for(int j=0;j<13;j++){ke[j]=expr[root[j]];ke[j].d=mod(ke[j].d+delta[j]);}
  auto sym=[&](auto &g){
   auto m=g.initial(allowed,bans,roots,n,expr);uint64_t cnt=g.count(m);st.symbolicPaths++;st.symbolic+=cnt;if(!cnt)return;
   auto x=g.propagate(c,ke,before,ba,bb,true,m);if(!g.count(x))return;auto y=g.propagate(c,ke,after,fa,fb,false,x);
   for(int w=0;w<(int)y.size();w++){uint64_t bits=y[w];while(bits){int j=64*w+__builtin_ctzll(bits);bits&=bits-1;array<int,3>v{};for(int t=0;t<dims;t++){v[t]=j%29;j/=29;}K k;for(int i=0;i<13;i++)k[i]=ke[i].v<0?ke[i].d:mod(v[ke[i].v]+ke[i].d);accept(k);}}
  };
  if(dims==1){static const Gauge<1>g;sym(g);return;}if(dims==2){static const Gauge<2>g;sym(g);return;}if(dims==3){static const Gauge<3>g;sym(g);return;}
  sort(roots.begin(),roots.begin()+n,[&](int x,int y){return __builtin_popcount(allowed[x])<__builtin_popcount(allowed[y]);});
  auto rot=[&](uint32_t x,int k){return ((x<<k)|(x>>(29-k)))&((1u<<29)-1);};
  function<void(int,const array<uint32_t,14>&)>walk=[&](int j,const array<uint32_t,14>&domains){
   if(j==n){K k;for(int i=0;i<13;i++)k[i]=mod(values[root[i]]+delta[i]);st.tested++;if(!backward(c,k,before,ba,bb)||!forward(c,k,after,fa,fb))return;accept(k);return;}
   int r=roots[j];uint32_t m=domains[r];while(m){int v=__builtin_ctz(m);m&=m-1;values[r]=v;auto nd=domains;bool ok=true;for(int t=j+1;t<n;t++){int q=roots[t];nd[q]&=~rot(bans[q][r],v);if(!nd[q]){ok=false;break;}}if(ok)walk(j+1,nd);}
  };walk(0,allowed);
 }
 void dfs(int t,int a,int b,UF uf,array<uint32_t,8> forbidden){
  if(t==(int)p.size()){st.paths++;finish(uf,forbidden,a,b);return;}
  int x=c[off+t],v=p[t];if(v==0){if(x==0)dfs(t+1,a,b,uf,forbidden);return;}
  int aa=(a+1)%I,bb=(b+1)%O;
  if(x==0){UF h=uf;if(h.eq(a,13,mod(-v)))dfs(t+1,aa,b,h,forbidden);}
  if(uf.eq(a,I+b,mod(x-v))){forbidden[a]|=1u<<mod(-v);dfs(t+1,aa,bb,uf,forbidden);}
 }
};
int main(int argc,char**argv){
 assert(argc>=5);ifstream file(argv[1]);string s((istreambuf_iterator<char>(file)),{});auto c=flatten(words(s));
 ifstream df(argv[2]);string d((istreambuf_iterator<char>(df)),{});auto dict=words(d);int L=atoi(argv[3]);I=atoi(argv[4]);O=13-I;
 bool countOnly=argc>5&&string(argv[5])=="count";uint64_t cap=argc>6?stoull(argv[6]):100000000;
 int from=argc>7?atoi(argv[7]):0,to=argc>8?atoi(argv[8]):c.size()-L+1;assert(I==5||I==8);
 Stats st;set<string>all;vector<vector<int>> ds;for(auto&w:dict)if(w.size()==L)ds.push_back(w);
 for(int off=from;off<to;off++){
  uint32_t z=0;for(int i=0;i<L;i++)if(!c[off+i])z|=1u<<i;
  for(auto&p:ds){uint32_t f=0;for(int i=0;i<L;i++)if(!p[i])f|=1u<<i;if(f&~z)continue;st.words++;Search x{c,off,p,st,all,countOnly,cap,{}};array<uint32_t,8> empty{};x.dfs(0,0,0,UF{},empty);}
  if(off%100==99)cerr<<"at "<<off<<" assignments="<<st.assignments<<" tested="<<st.tested<<" survivor="<<st.survive<<'\n';
 }
 cerr<<"TOTAL I="<<I<<" O="<<O<<" L="<<L<<" words="<<ds.size()<<" matches="<<st.words<<" paths="<<st.paths<<" consistent="<<st.consistent<<" assignments="<<st.assignments<<" adjpaths="<<st.adjpaths<<" adjbound="<<st.adjbound<<" symbolic="<<st.symbolic<<" symbolicPaths="<<st.symbolicPaths<<" tested="<<st.tested<<" skipped="<<st.skipped<<" survivors="<<st.survive<<" pairs="<<all.size()<<" comps=";for(auto x:st.comps)cerr<<x<<',';cerr<<'\n';
}
