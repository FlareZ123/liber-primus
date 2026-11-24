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
struct Stats{uint64_t words=0,paths=0,consistent=0,assignments=0,tested=0,survive=0,dupes=0,skipped=0;array<uint64_t,14> comps{};};
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
struct Search{
 const vector<int>& c;int off;const vector<int>&p;Stats&st;set<string>&all;bool countOnly;uint64_t cap;unordered_set<string> seen;
 void finish(const UF&uf,const array<uint32_t,8>& forbidden,int a,int b){
  st.consistent++;array<int,14>root,delta;array<uint32_t,14> allowed;allowed.fill((1u<<29)-1);
  for(int j=0;j<14;j++){auto [r,d]=uf.find(j);root[j]=r;delta[j]=d;}
  allowed[root[13]]=1u<<mod(-delta[13]);
  for(int j=0;j<I;j++)for(int v=0;v<29;v++)if(forbidden[j]&(1u<<v))allowed[root[j]]&=~(1u<<mod(v-delta[j]));
  array<int,14>roots,values;int n=0,free=0;uint64_t count=1;
  for(int j=0;j<14;j++)if(root[j]==j){int k=__builtin_popcount(allowed[j]);if(!k)return;roots[n++]=j;if(k>1)free++;if(count>UINT64_MAX/k){count=UINT64_MAX;}else count*=k;}
  st.comps[free]++;st.assignments+=count;if(countOnly)return;if(count>cap){st.skipped+=count;return;}
  function<void(int)>walk=[&](int j){
   if(j==n){
    K k;for(int i=0;i<13;i++)k[i]=mod(values[root[i]]+delta[i]);string id;for(int x:k)id+=enc(x);id+=enc(a);id+=enc(b);
    if(!seen.insert(id).second){st.dupes++;return;}st.tested++;
    if(!backward(c,k,off,0,0)||!forward(c,k,off+p.size(),a,b))return;
    assert(check(c,k,off,p));st.survive++;
    string ik,ok,pw;for(int i=0;i<I;i++)ik+=enc(k[i]);for(int i=0;i<O;i++)ok+=enc(mod(-k[I+i]));for(int x:p)pw+=enc(x);
    all.insert(canonical(ik)+canonical(ok));cout<<"SURVIVOR "<<off<<" 0 "<<ik<<' '<<ok<<' '<<pw<<'\n';return;
   }
   int r=roots[j];uint32_t m=allowed[r];while(m){int v=__builtin_ctz(m);m&=m-1;values[r]=v;walk(j+1);}
  };walk(0);
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
 cerr<<"TOTAL I="<<I<<" O="<<O<<" L="<<L<<" words="<<ds.size()<<" matches="<<st.words<<" paths="<<st.paths<<" consistent="<<st.consistent<<" assignments="<<st.assignments<<" tested="<<st.tested<<" skipped="<<st.skipped<<" survivors="<<st.survive<<" pairs="<<all.size()<<" comps=";for(auto x:st.comps)cerr<<x<<',';cerr<<'\n';
}
