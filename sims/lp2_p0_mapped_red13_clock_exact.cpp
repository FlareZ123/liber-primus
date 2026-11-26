#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <unordered_set>
#include <cmath>
#include <deque>
#include <chrono>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;using U=uint64_t;const string A="0123456789abcdefghijklmnopqrs";const int N=56,Q=29,M=Q*Q;int gp(char c){return c<='9'?c-'0':c-'a'+10;}
struct State{int w,i,s,e,h;vector<int> t;vector<string> cand;vector<pair<int,uint32_t>> sup;int nb=0;vector<U> bits;};
vector<State> st;array<vector<int>,N> ids;vector<vector<uint8_t>> conflict;
int inv[29];
uint64_t acCalls=0,linearCalls=0,hardCalls=0,mapCalls=0,mapsTested=0,timeoutPaths=0;
const U DEC=1ull<<63, WORDS=(1ull<<N)-1;
chrono::steady_clock::time_point deadline;bool expired=false;double secondsPerPath=3;
unordered_set<string> dict;
unordered_set<U> visited;
vector<string> split(string s,char c){vector<string>r;size_t a=0;for(;;){size_t b=s.find(c,a);r.push_back(s.substr(a,b-a));if(b==string::npos)return r;a=b+1;}}
bool collide(int a,int b){return a/Q==b/Q||a/Q==b%Q||a%Q==b/Q||a%Q==b%Q;}
bool incompatible(const State&a,const State&b){for(auto [x,u]:a.sup)for(auto[y,v]:b.sup){if(x==y){if(!(u&v))return true;}else if(collide(x,y)&&u==v&&!(u&(u-1)))return true;}return false;}
array<int,N> path;array<U,N> adj;U empt;uint64_t all=0,relaxed=0,graphpass=0,globalpass=0,solutions=0;ofstream output;
// For a fixed path, exact bounded deletion to obtain pairwise-consistent
// words, then exact intersection of all token unary supports.
bool cover(U deleted,int left){
 if(left<0)return false;
 for(int i=0;i<N;i++)if(!(deleted>>i&1)){
  U v=adj[i]&~deleted;if(v){if(!left)return false;int j=__builtin_ctzll(v);return cover(deleted|(1ull<<i),left-1)||cover(deleted|(1ull<<j),left-1);}
 }
 return true;
}

struct Forms{
 array<array<uint8_t,29>,29> f{};array<U,29> why{};uint32_t free=(1u<<29)-2;
 Forms(){for(int i=1;i<29;i++)f[i][i]=1;}
 void add(int p,int a,int b,U reason){int q[29]{};int pivot=0;uint32_t bits=free;
  while(bits){int j=__builtin_ctz(bits);bits&=bits-1;q[j]=(f[p][j]+58-f[a][j]-f[b][j])%29;if(q[j]&&!pivot)pivot=j;}
  if(!pivot)return;reason|=why[p]|why[a]|why[b];free&=~(1u<<pivot);int iv=inv[q[pivot]];
  for(int x=1;x<29;x++)if(f[x][pivot]){int mul=f[x][pivot]*iv%29;f[x][pivot]=0;bits=free;why[x]|=reason;while(bits){int j=__builtin_ctz(bits);bits&=bits-1;f[x][j]=(f[x][j]+29*29-mul*q[j])%29;}}
 }
 U collision(){for(int a=1;a<29;a++)for(int b=0;b<a;b++)if(f[a]==f[b])return why[a]|why[b];return 0;}
};

struct Prop{uint32_t dom[M]{};U reason[M]{};vector<int> active;Forms f;};
vector<pair<int,int>> decisions;
// Fixed-clock hard constraints. DEC marks unconditional algebra and branch
// assumptions, which are removed from the word core only at the root.
U propagate(U deleted,Prop& out){
 acCalls++;auto&dom=out.dom;auto&reason=out.reason;auto&active=out.active;U occ[M]{};U queue=0;vector<int> singleton;bool present[M]{};
 auto narrow=[&](int z,uint32_t v,U r)->U{if((dom[z]&v)==dom[z])return 0;dom[z]&=v;reason[z]|=r;if(!dom[z])return reason[z]?reason[z]:DEC;queue|=occ[z];if(!(dom[z]&(dom[z]-1)))singleton.push_back(z);return 0;};
 // All consumed tokens, including tokens in OOV words, obey a common
 // nonzero output and the exact zero-coordinate identity.
 for(int i=0;i<N;i++)for(int z:st[path[i]].t)if(z>=0&&!present[z]){present[z]=true;active.push_back(z);dom[z]=(1u<<29)-2;reason[z]=DEC;if(z/Q==0){dom[z]=1u<<(z%Q);singleton.push_back(z);}}
 for(int i=0;i<N;i++)if(!(deleted>>i&1))for(auto[z,v]:st[path[i]].sup)occ[z]|=1ull<<i;
 for(int i=0;i<N;i++)if(!(deleted>>i&1))for(auto[z,v]:st[path[i]].sup)if(U fail=narrow(z,v,1ull<<i))return fail;
 for(auto[z,p]:decisions)if(U fail=narrow(z,1u<<p,DEC))return fail;
 size_t spos=0;while(true){
  while(queue||spos<singleton.size()){
   while(spos<singleton.size()){int z=singleton[spos++];for(int t:active)if(t!=z&&collide(t,z))if(U fail=narrow(t,~dom[z],reason[z]))return fail;}
   if(!queue)break;int i=__builtin_ctzll(queue);queue&=queue-1;const State& s=st[path[i]];
   bool changed=false;U witness=1ull<<i;for(auto[z,v]:s.sup){if(dom[z]!=v)changed=true;witness|=reason[z];}if(!changed)continue;
   vector<U> live(s.nb,~0ull),tmp(s.nb);if(s.cand.size()%64)live.back()=(1ull<<(s.cand.size()%64))-1;
   for(int t=0;t<(int)s.t.size();t++)if(s.t[t]>=0){uint32_t v=dom[s.t[t]];fill(tmp.begin(),tmp.end(),0);while(v){int p=__builtin_ctz(v);v&=v-1;const U*b=&s.bits[(t*29+p)*s.nb];for(int j=0;j<s.nb;j++)tmp[j]|=b[j];}bool any=false;for(int j=0;j<s.nb;j++){live[j]&=tmp[j];any|=live[j]!=0;}if(!any)return witness;}
   for(int t=0;t<(int)s.t.size();t++)if(s.t[t]>=0){uint32_t v=dom[s.t[t]],sup=0;while(v){int p=__builtin_ctz(v);v&=v-1;const U*b=&s.bits[(t*29+p)*s.nb];for(int j=0;j<s.nb;j++)if(live[j]&b[j]){sup|=1u<<p;break;}}if(U fail=narrow(s.t[t],sup,witness))return fail;}
  }
  linearCalls++;Forms f;U allReason=DEC;for(int z:active)if(!(dom[z]&(dom[z]-1))){f.add(__builtin_ctz(dom[z]),z/Q,z%Q,reason[z]);allReason|=reason[z];}
  if(U fail=f.collision())return fail;
  vector<int> free;for(int j=1;j<29;j++)if(f.free&(1u<<j))free.push_back(j);int d=free.size();
  // A candidate additional equation forces a coordinate collision iff its
  // nonzero homogeneous row is proportional to a coordinate difference.
  unordered_set<U> forbidden;array<U,29> hashes{};bool use=d<=13;
  auto norm=[&](const array<uint8_t,29>& row)->U{int pivot=0;for(int j:free)if(row[j]){pivot=row[j];break;}if(!pivot)return 0;int iv=inv[pivot];U h=0;for(int j:free)h=h*29+(row[j]*iv)%29;return h;};
  if(use){for(int a=0;a<29;a++)for(int j:free)hashes[a]=hashes[a]*29+f.f[a][j];for(int a=1;a<29;a++)for(int b=0;b<a;b++){array<uint8_t,29> row{};for(int j:free)row[j]=(f.f[a][j]+29-f.f[b][j])%29;forbidden.insert(norm(row));}}
  for(int z:active)if(dom[z]&(dom[z]-1)){
    int a=z/Q,b=z%Q;array<uint8_t,29> sum{};for(int j:free)sum[j]=(f.f[a][j]+f.f[b][j])%29;
    bool forced=false;for(int p=0;p<29;p++)if(sum==f.f[p]){if(U fail=narrow(z,1u<<p,f.why[a]|f.why[b]|f.why[p]|DEC))return fail;forced=true;break;}
    if(use&&!forced){uint32_t v=dom[z],allowed=0;while(v){int p=__builtin_ctz(v);v&=v-1;array<uint8_t,29> row{};for(int j:free)row[j]=(sum[j]+29-f.f[p][j])%29;U h=norm(row);if(!h||!forbidden.count(h))allowed|=1u<<p;}if(U fail=narrow(z,allowed,allReason))return fail;}
  }
  if(!queue&&spos==singleton.size()){out.f=move(f);return 0;}
 }
}
U foundMap(const array<int,29>&pi,U deleted){
 mapsTested++;array<int,29> ip{};for(int i=0;i<29;i++)ip[pi[i]]=i;int oov=0;U fail=0;vector<string> plain;
 for(int i=0;i<N;i++){
  string p;for(int z:st[path[i]].t){if(z<0){p+='0';continue;}int x=ip[(pi[z/Q]+pi[z%Q])%29];if(!x)return DEC;p+=A[x];}
  plain.push_back(p);if(!dict.count(p)){oov++;if(!(deleted>>i&1))fail|=1ull<<i;}
 }
 if(oov<=3){output<<"FIT map=";for(int x:pi)output<<A[x];output<<" phase="<<st[path[0]].s<<" OOV="<<oov<<" words=";for(auto&p:plain)output<<p<<' ';output<<'\n';output.flush();return 0;}
 assert(fail);return fail&-fail;
}
U enumerateMaps(const Forms&f,U deleted){
 mapCalls++;vector<int> free;for(int j=1;j<29;j++)if(f.free&(1u<<j))free.push_back(j);int pivot=-1;for(int j:free)if(f.f[15][j]){pivot=j;break;}assert(pivot>0);free.erase(find(free.begin(),free.end(),pivot));int d=free.size();int co[29][29]{},con[29]{};int iv=inv[f.f[15][pivot]];U core=DEC;for(U w:f.why)core|=w;
 for(int a=1;a<29;a++){con[a]=f.f[a][pivot]*iv%29;for(int j=0;j<d;j++)co[a][j]=(f.f[a][free[j]]+29*29-con[a]*f.f[15][free[j]])%29;}
 struct Rel{uint32_t mask;int c;array<uint8_t,29>a;};vector<Rel> rel;vector<vector<int>> incident(d);
 for(int a=1;a<29;a++)for(int b=0;b<a;b++){Rel r{};r.c=(con[a]+29-con[b])%29;for(int j=0;j<d;j++)if((r.a[j]=(co[a][j]+29-co[b][j])%29))r.mask|=1u<<j;if(!r.mask){if(!r.c)return core;continue;}int i=rel.size();for(int j=0;j<d;j++)if(r.mask&(1u<<j))incident[j].push_back(i);rel.push_back(r);}
 vector<int> rem(rel.size()),value(rel.size());for(int i=0;i<(int)rel.size();i++){rem[i]=__builtin_popcount(rel[i].mask);value[i]=rel[i].c;}array<int,29> v{},pi{};
 auto rec=[&](auto&&self,uint32_t unassigned)->bool{
  if(!unassigned){uint32_t got=1;for(int a=1;a<29;a++){int x=con[a];for(int j=0;j<d;j++)x+=co[a][j]*v[j];pi[a]=x%29;assert(!(got&(1u<<pi[a])));got|=1u<<pi[a];}U r=foundMap(pi,deleted);core|=r;return !r;}
  uint32_t choices[29]{};for(int j=0;j<d;j++)if(unassigned&(1u<<j))choices[j]=(1u<<29)-2;
  for(int i=0;i<(int)rel.size();i++)if(rem[i]==1){int j=__builtin_ctz(rel[i].mask&unassigned);int forbidden=(29-value[i])*inv[rel[i].a[j]]%29;choices[j]&=~(1u<<forbidden);}
  int var=-1,best=30;for(int j=0;j<d;j++)if(unassigned&(1u<<j)){int n=__builtin_popcount(choices[j]);if(n<best){best=n;var=j;}}if(!best)return false;
  uint32_t bits=choices[var];while(bits){int x=__builtin_ctz(bits);bits&=bits-1;v[var]=x;bool ok=true;for(int i:incident[var]){rem[i]--;value[i]=(value[i]+rel[i].a[var]*x)%29;if(!rem[i]&&!value[i])ok=false;}if(ok&&self(self,unassigned&~(1u<<var)))return true;for(int i:incident[var]){rem[i]++;value[i]=(value[i]+29*29-rel[i].a[var]*x)%29;}}
  return false;
 };return rec(rec,(1u<<d)-1)?0:core;
}
U hard(U deleted){
 hardCalls++;if(chrono::steady_clock::now()>deadline){expired=true;return DEC;}
 Prop p;if(U fail=propagate(deleted,p))return fail;
 int d=__builtin_popcount(p.f.free);if(d<=5)return enumerateMaps(p.f,deleted);
 // Branch on the smallest supported consuming-token domain. Prefer repeated
 // pairs, since a single equation then constrains several lexical words.
 int z=-1,best=30,bestOcc=-1;for(int t:p.active){int n=__builtin_popcount(p.dom[t]);if(n<=1)continue;int occ=0;for(int i=0;i<N;i++)if(!(deleted>>i&1))occ+=count(st[path[i]].t.begin(),st[path[i]].t.end(),t);if(n<best||(n==best&&occ>bestOcc)){z=t;best=n;bestOcc=occ;}}
 if(z<0)return enumerateMaps(p.f,deleted);
 U core=p.reason[z];uint32_t v=p.dom[z];while(v){int q=__builtin_ctz(v);v&=v-1;decisions.push_back({z,q});U r=hard(deleted);decisions.pop_back();if(!r)return 0;if(expired)return DEC;core|=r;}return core?core:DEC;
}
bool support(U deleted,int left){
 if(left<0||!visited.insert(deleted).second)return false;
 for(int i=0;i<N;i++)if(!(deleted>>i&1)){
  U v=adj[i]&~deleted;if(v){if(!left)return false;int j=__builtin_ctzll(v);return support(deleted|(1ull<<i),left-1)||(!expired&&support(deleted|(1ull<<j),left-1));}
 }
 U fail=hard(deleted);if(expired)return false;
 if(fail){if(!left)return false;fail&=WORDS;assert(!(fail&deleted));while(fail){int j=__builtin_ctzll(fail);fail&=fail-1;if(support(deleted|(1ull<<j),left-1))return true;if(expired)return false;}return false;}
 solutions++;output<<"PATH";for(int i:path)output<<' '<<st[i].i;output<<" delete="<<deleted<<"\n";output.flush();return true;
}
void scan(int w,int phase,int cost){
 if(w==N){relaxed++;for(int i=0;i<N;i++)adj[i]=0;empt=0;
  for(int i=0;i<N;i++){if(st[path[i]].cand.empty())empt|=1ull<<i;else for(int j=0;j<i;j++)if(conflict[path[i]][path[j]]){adj[i]|=1ull<<j;adj[j]|=1ull<<i;}}
  if(!cover(empt,3-cost))return;graphpass++;
  visited.clear();expired=false;deadline=chrono::steady_clock::now()+chrono::milliseconds((int)(secondsPerPath*1000));if(!support(empt,3-cost)){if(expired){timeoutPaths++;output<<"TIMEOUT";for(int i:path)output<<' '<<st[i].i;output<<"\n";output.flush();}return;}globalpass++;return;
 }
 for(int i:ids[w])if(st[i].s==phase){int c=cost+st[i].cand.empty();if(c>3)continue;path[w]=i;scan(w+1,st[i].e,c);}
}
int main(int argc,char**argv){assert(argc>=4&&argc<=6);for(int i=1;i<29;i++)for(int j=1;j<29;j++)if(i*j%29==1)inv[i]=j;ifstream d(argv[3]);string word;long freq;while(d>>word>>freq)if(word.size()!=1||word=="3"||word=="a"||word=="o")dict.insert(word);if(argc==6)secondsPerPath=stod(argv[5]);ifstream f(argv[1]);output.open(argv[2]);string line;while(getline(f,line)){auto v=split(line,'\t');assert(v.size()==7);State s{stoi(v[0]),stoi(v[1]),stoi(v[2]),stoi(v[3]),stoi(v[4]),{},{},{}};for(auto x:split(v[5],','))s.t.push_back(stoi(x));uint32_t sup[M]{};if(!v[6].empty())for(auto p:split(v[6],',')){s.cand.push_back(p);for(int t=0;t<(int)p.size();t++)if(s.t[t]>=0)sup[s.t[t]]|=1u<<gp(p[t]);}s.nb=(s.cand.size()+63)/64;s.bits.resize(s.t.size()*29*s.nb);for(int i=0;i<(int)s.cand.size();i++)for(int t=0;t<(int)s.t.size();t++)s.bits[(t*29+gp(s.cand[i][t]))*s.nb+i/64]|=1ull<<(i%64);for(int z=0;z<M;z++)if(sup[z])s.sup.push_back({z,sup[z]});ids[s.w].push_back(st.size());st.push_back(move(s));}
 conflict.assign(st.size(),vector<uint8_t>(st.size()));for(int i=0;i<(int)st.size();i++)for(int j=0;j<i;j++)if(st[i].w!=st[j].w&&!st[i].cand.empty()&&!st[j].cand.empty())conflict[i][j]=conflict[j][i]=incompatible(st[i],st[j]);
 for(int j=0;j<13;j++)if(argc==4||stoi(argv[4])==j)scan(0,j,0);cout<<"relaxed="<<relaxed<<" graphpass="<<graphpass<<" globalpass="<<globalpass<<" solutions="<<solutions<<" acCalls="<<acCalls<<" linearCalls="<<linearCalls<<" hardCalls="<<hardCalls<<" mapCalls="<<mapCalls<<" mapsTested="<<mapsTested<<" timeoutPaths="<<timeoutPaths<<endl;
}
