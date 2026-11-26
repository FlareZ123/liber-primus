#include "lp2_gp29_joint_affine_completion.hpp"
#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <set>
#include <string>
#include <unordered_set>
#include <vector>
using namespace joint46;
using std::array; using std::vector; using std::string;
constexpr int OOV=3;
int dec(char c){return c<='9'?c-'0':c-'a'+10;}
char enc(int x){return x<10?'0'+x:'a'+x-10;}
string encode(const Perm& p,const Key& k){string a;for(auto v:p)a+=enc(v);a+='|';for(auto v:k)a+=enc(v);return a;}
struct Lex {
 array<vector<vector<uint8_t>>,32> by;
 std::unordered_set<string> words,prefix;
 Lex(const string& path){std::ifstream f(path);if(!f)throw std::runtime_error("dict");string w;while(f>>w){words.insert(w);vector<uint8_t> v;for(char c:w)v.push_back(dec(c));by[v.size()].push_back(v);if(v.size()==11)prefix.insert(w.substr(0,10));}if(words.size()!=38938)throw std::runtime_error("dict size");}
};
vector<vector<uint8_t>> readWords(const string& path){std::ifstream f(path);if(!f)throw std::runtime_error("words");string w;vector<vector<uint8_t>> v;while(f>>w){v.emplace_back();for(char c:w)v.back().push_back(dec(c));}return v;}
// Equations are constant + sum(coeff * x)=0. Highest variable is pivot.
struct System {
 array<Form,MAXV> rows{};uint16_t piv=0;bool valid=true;
 bool add(Form f,int m){for(int j=m-1;j>=0;j--)if(f[j+1]){
  if(piv&(1u<<j)){int a=f[j+1];for(int i=0;i<=j+1;i++)f[i]=mod(int(f[i])-a*rows[j][i]);}
  else{int a=inv[f[j+1]];for(int i=0;i<=j+1;i++)f[i]=mod(a*f[i]);for(int k=j+1;k<m;k++)if((piv&(1u<<k))&&rows[k][j+1]){int b=rows[k][j+1];for(int i=0;i<=j+1;i++)rows[k][i]=mod(int(rows[k][i])-b*f[i]);}rows[j]=f;piv|=1u<<j;return true;}
 }if(f[0]){valid=false;return false;}return true;}
 Form reduce(Form f,int m)const{for(int j=m-1;j>=0;j--)if((piv&(1u<<j))&&f[j+1]){int a=f[j+1];for(int i=0;i<=j+1;i++)f[i]=mod(int(f[i])-a*rows[j][i]);}return f;}
 string sig(int m)const{string a;a+=char(piv&255);a+=char(piv>>8);for(int j=0;j<m;j++)if(piv&(1u<<j))for(int i=0;i<=j+1;i++)a+=char(rows[j][i]);return a;}
};
using Domain=vector<System>;
struct LexStats {uint64_t options=0,consistent=0,collisionFree=0,unique=0;int possibleGroups=0;vector<int> counts;};
struct SearchStats {bool exhausted=true;uint64_t nodes=0,rotations=0,lexChecks=0,leaves=0,actions=0,lexPrunes=0,maskPrunes=0;int initialOov=0,best=0;vector<int> order;};
struct AffineProblem {
 Shape p;int m=0;array<array<array<Form,N>,N>,Q> edges{};
 vector<Domain> domains;LexStats stats;
 AffineProblem(const Input& in,const Lex& lex,const vector<vector<uint8_t>>& cipher):p(prepare(in,false)),m(p.m){
  if(!p.eligible||p.impossible)return;
  for(int j=0;j<Q;j++)for(int c=0;c<N;c++)for(int w=1;w<N;w++){
   auto& f=edges[j][c][w];for(int i=0;i<=m;i++)f[i]=mod(int(p.forms[c][i])-p.forms[w][i]-p.key[j][i]);
  }
  for(const auto& c:cipher){Domain d;std::unordered_set<string> seen;for(const auto& w:lex.by[c.size()]){
   bool holdok=true;for(size_t i=0;i<w.size();i++)if(!w[i]&&c[i]){holdok=false;break;}if(!holdok)continue;
   for(int start=0;start<Q;start++){
    stats.options++;System s;int j=start;for(size_t i=0;i<w.size();i++)if(w[i]){if(!s.add(edges[j][c[i]][w[i]],m))break;j=(j+1)%Q;}if(!s.valid)continue;stats.consistent++;
    // A word option that forces an alphabet collision cannot occur in any action.
    array<Form,N> coords{};bool ok=true;for(int i=0;i<N&&ok;i++){coords[i]=s.reduce(p.forms[i],m);for(int k=0;k<i;k++)if(coords[i]==coords[k]){ok=false;break;}}if(!ok)continue;
    bool prim=false;for(int j=0;j<4;j++){Form f{};for(int i=0;i<=m;i++)f[i]=mod(int(p.key[j][i])-p.key[j+4][i]);auto r=s.reduce(f,m);for(auto v:r)prim|=v!=0;}if(!prim)continue;
    stats.collisionFree++;if(seen.insert(s.sig(m)).second){stats.unique++;d.push_back(s);}
   }
  }stats.possibleGroups+=!d.empty();stats.counts.push_back(int(d.size()));domains.push_back(std::move(d));}
 }
};
// Select static all-different order (same bound as completion header).
vector<int> allDiffOrder(const Shape& p){int m=p.m,S=1<<m;array<vector<uint32_t>,MAXV> counts;for(int j=0;j<m;j++){
 std::unordered_set<uint64_t> seen;counts[j].assign(S,0);for(const auto& f:p.constraints)if(f[j+1]){int q=inv[f[j+1]],s=1<<j;uint64_t code=0;for(int i=0;i<m;i++){int a=i==j?0:mod(-int(f[i+1])*q);if(a)s|=1<<i;code=code*N+a;}if(seen.insert(code).second)counts[j][s]++;}for(int i=0;i<m;i++)for(int b=0;b<S;b++)if(b&(1<<i))counts[j][b]+=counts[j][b^(1<<i)];}
 array<uint64_t,MAXV+1> pow{};pow[0]=1;for(int i=1;i<=MAXV;i++)pow[i]=pow[i-1]*N;
 vector<uint64_t> dp(S,~uint64_t(0));vector<int> last(S,-1);dp[0]=0;for(int b=1;b<S;b++)for(int j=0;j<m;j++)if(b&(1<<j)){auto cost=dp[b^(1<<j)]+pow[std::popcount(unsigned(b))-1]*counts[j][b];if(cost<dp[b]){dp[b]=cost;last[b]=j;}}vector<int> a;for(int b=S-1;b;){int j=last[b];a.push_back(j);b^=1<<j;}std::reverse(a.begin(),a.end());return a;
}
Form reorder(const Form& f,const vector<int>& order){Form g{};g[0]=f[0];for(size_t i=0;i<order.size();i++)g[i+1]=f[order[i]+1];return g;}
System reorder(const System& s,const vector<int>& order){System t;int m=int(order.size());for(int j=0;j<m;j++)if(s.piv&(1u<<j))if(!t.add(reorder(s.rows[j],order),m))throw std::logic_error("reorder consistency");return t;}
// Rank of projection on a selected suffix, ignoring constants. Small and exact.
int restrictedRank(const System& s,int mask,int m){array<Form,MAXV> rows{};int piv=0;for(int j=0;j<m;j++)if(s.piv&(1u<<j)){Form f=s.rows[j];for(int k=m-1;k>=0;k--)if((mask&(1<<k))&&f[k+1]){if(piv&(1<<k)){int a=f[k+1];for(int i=0;i<=k;i++)if(mask&(1<<i))f[i+1]=mod(int(f[i+1])-a*rows[k][i+1]);}else{int a=inv[f[k+1]];for(int i=0;i<=k;i++)if(mask&(1<<i))f[i+1]=mod(a*f[i+1]);rows[k]=f;piv|=1<<k;break;}}}return std::popcount(unsigned(piv));}
// Greedy lexical ordering: maximize newly determined equations of a fixed,
// evenly spaced sample of each group's complete projected options.
vector<int> lexOrder(const AffineProblem& a,const vector<int>& fallback){int m=a.m,remaining=(1<<m)-1;vector<int> order;vector<std::pair<const System*,double>> sample;
 for(const auto& d:a.domains)if(!d.empty()){int n=std::min<int>(64,d.size());for(int i=0;i<n;i++)sample.push_back({&d[size_t(i)*d.size()/n],1.0/n});}
 for(int j=0;j<m;j++){double best=-1;int v=-1;for(int k:fallback)if(remaining&(1<<k)){double s=0;for(auto [p,w]:sample)s+=w*(std::popcount(unsigned(p->piv))-restrictedRank(*p,remaining^(1<<k),m));if(s>best+1e-9){best=s;v=k;}}order.push_back(v);remaining^=1<<v;}return order;}
struct MaskBucket {array<uint8_t,MAXV> coords{},coeffs{};array<uint32_t,N> rotated{};int n=0;};
vector<vector<MaskBucket>> allDiffBuckets(const Shape& p,const vector<int>& order){int m=p.m;vector<std::unordered_map<uint64_t,std::pair<Form,uint32_t>>> maps(m);for(const auto& f0:p.constraints){Form f=reorder(f0,order);int j=m-1;while(j>=0&&!f[j+1])j--;if(j<0)throw std::logic_error("constant constraint");Form a{};int q=inv[f[j+1]];uint64_t code=0;for(int i=0;i<j;i++){a[i]=mod(-int(f[i+1])*q);code=code*N+a[i];}auto& x=maps[j][code];x.first=a;x.second|=1u<<mod(-int(f[0])*q);}
 vector<vector<MaskBucket>> groups(m);for(int j=0;j<m;j++){vector<std::pair<Form,uint32_t>> a;for(auto& [_,v]:maps[j])a.push_back(v);std::sort(a.begin(),a.end(),[](auto& x,auto& y){int nx=std::popcount(x.second),ny=std::popcount(y.second);if(nx!=ny)return nx>ny;return x.first<y.first;});for(auto& [f,mask]:a){MaskBucket b;for(int i=0;i<j;i++)if(f[i]){b.coords[b.n]=i;b.coeffs[b.n++]=f[i];}for(int v=0;v<N;v++)b.rotated[v]=rot(mask,v);groups[j].push_back(b);}}
 return groups;
}
struct Option {System s;int last=-1;};
struct Group {int g;const vector<int>* ids;};
struct Evaluated {Group group;vector<int8_t> required;uint32_t mask=0;bool unchanged=true;};
struct Limit {uint64_t nodes=10000000,lexChecks=1000000000,actions=10000;};
// Every group is supported iff one of its full-word affine systems is satisfied.
template<class Emit> SearchStats solve(const AffineProblem& a,Emit emit,bool lexicalOrder=true,Limit lim={}){
 SearchStats st;if(!a.p.eligible){st.exhausted=false;return st;}if(a.p.impossible)return st;
 int m=a.m;st.initialOov=int(a.domains.size())-a.stats.possibleGroups;if(st.initialOov>OOV)return st;
 auto base=allDiffOrder(a.p);st.order=lexicalOrder?lexOrder(a,base):base;const auto order=st.order;
 vector<vector<Option>> opts;vector<vector<int>> ids(a.domains.size());vector<Group> active;
 for(size_t g=0;g<a.domains.size();g++){opts.emplace_back();bool taut=false;for(const auto& s:a.domains[g]){auto t=reorder(s,order);if(!t.piv){taut=true;break;}int last=31-std::countl_zero(unsigned(t.piv));opts.back().push_back({t,last});}if(!taut&&!opts.back().empty()){ids[g].resize(opts.back().size());std::iota(ids[g].begin(),ids[g].end(),0);active.push_back({int(g),&ids[g]});}}
 auto buckets=allDiffBuckets(a.p,order);array<uint8_t,MAXV> x{},y{};
 auto dfs=[&](auto&& self,int j,int budget,const vector<Group>& live)->void{
  if(!st.exhausted)return;
  if(st.nodes>=lim.nodes||st.lexChecks>=lim.lexChecks||st.actions>=lim.actions){st.exhausted=false;return;}
  if(j==m){st.leaves++;Key k{};for(int i=0;i<Q;i++)k[i]=evaluate(a.p.key[i],x,a.p.d);bool prim=false;for(int j=0;j<4;j++)prim|=k[j]!=k[j+4];if(!prim)return;Perm p{};int origin=evaluate(a.p.forms[0],x,m);for(int i=0;i<N;i++)p[i]=mod(evaluate(a.p.forms[i],x,m)-origin);
   if(std::set<uint8_t>(p.begin(),p.end()).size()!=N)throw std::logic_error("leaf noninjective");
   int support=int(a.domains.size())-OOV+budget;st.best=std::max(st.best,support);emit(p,k,support);st.actions++;return;}
  st.nodes++;uint32_t forbidden=0;for(const auto& q:buckets[j]){int v=0;for(int i=0;i<q.n;i++)v+=q.coeffs[i]*y[q.coords[i]];forbidden|=q.rotated[v%N];st.rotations++;if(forbidden==ALL)break;}uint32_t allow=ALL&~forbidden;if(!allow){st.maskPrunes++;return;}
  vector<Evaluated> ev;ev.reserve(live.size());array<uint32_t,OOV+1> dp;dp.fill(allow);
  for(const auto& g:live){Evaluated e;e.group=g;const auto& list=*g.ids;const auto& d=opts[g.g];e.required.reserve(list.size());for(int id:list){const auto& o=d[id];int v=-1;if(o.s.piv&(1u<<j)){const auto& f=o.s.rows[j];int sum=f[0];for(int i=0;i<j;i++)sum+=f[i+1]*y[i];v=mod(-sum);e.mask|=1u<<v;e.unchanged=false;}else e.mask=ALL;e.required.push_back(int8_t(v));st.lexChecks++;}for(int b=budget;b>0;b--)dp[b]=(dp[b]&e.mask)|dp[b-1];dp[0]&=e.mask;ev.push_back(std::move(e));if(!dp[budget]){st.lexPrunes++;return;}}
  allow=dp[budget];while(allow&&st.exhausted){int v=std::countr_zero(allow);allow&=allow-1;y[j]=v;x[order[j]]=v;int b=budget;vector<vector<int>> childLists(ev.size());vector<Group> child;child.reserve(ev.size());for(size_t z=0;z<ev.size();z++){const auto& e=ev[z];const auto& list=*e.group.ids;const auto& d=opts[e.group.g];if(!(e.mask&(1u<<v))){b--;continue;}if(e.unchanged){child.push_back(e.group);continue;}bool satisfied=false;auto& out=childLists[z];for(size_t i=0;i<list.size();i++)if(e.required[i]<0||e.required[i]==v){int id=list[i];if(d[id].last==j){satisfied=true;break;}out.push_back(id);}if(!satisfied){if(out.empty())throw std::logic_error("empty surviving domain");child.push_back({e.group.g,&out});}}
   if(b<0)throw std::logic_error("budget DP");
   self(self,j+1,b,child);
  }
 };
 dfs(dfs,0,OOV-st.initialOov,active);return st;
}
Input parse(int d,const string& roots,const string& off,const string& key){Input in;in.d=d;if(roots.size()!=29||off.size()!=size_t(29*(d+1))||key.size()!=size_t(8*(d+1)))throw std::runtime_error("fixture");for(int i=0;i<N;i++){in.root[i]=dec(roots[i]);for(int j=0;j<=d;j++)in.off[i][j]=dec(off[i*(d+1)+j]);}for(int i=0;i<Q;i++)for(int j=0;j<=d;j++)in.key[i][j]=dec(key[i*(d+1)+j]);return in;}
int support(const Perm& p,const Key& k,const vector<vector<uint8_t>>& c,const Lex& lex){Perm ip{};for(int i=0;i<N;i++)ip[p[i]]=i;int hit=0;for(const auto& w:c){bool ok=false;string plain(w.size(),'0');auto walk=[&](auto&& self,size_t i,int j)->void{if(ok)return;if(i==w.size()){ok=lex.words.contains(plain);return;}if(!w[i]){plain[i]='0';self(self,i+1,j);}int v=ip[mod(int(p[w[i]])-k[j])];if(v){plain[i]=enc(v);self(self,i+1,(j+1)%Q);}};for(int j=0;j<Q&&!ok;j++)walk(walk,0,j);hit+=ok;}return hit;}
int main(int argc,char** argv){if(argc<4){std::cerr<<"usage: lexical_slice dictionary p54 fixture [id] [order] [lexlimit]\n";return 1;}Lex lex(argv[1]);auto cipher=readWords(argv[2]);if(cipher.size()!=48)throw std::runtime_error("expected 47+carry");cipher.pop_back();std::ifstream f(argv[3]);int id,d,wanted=argc>4?std::stoi(argv[4]):-1;string roots,off,key;bool lo=argc<=5||string(argv[5])!="mask";Limit lim;if(argc>6)lim.lexChecks=std::stoull(argv[6]);
 while(f>>id>>d>>roots>>off>>key){if(wanted>=0&&wanted!=id)continue;auto start=std::chrono::steady_clock::now();Input in=parse(d,roots,off,key);AffineProblem a(in,lex,cipher);auto ms=[&]{return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now()-start).count();};std::cout<<"BUILD "<<id<<" d="<<d<<" c="<<a.p.c<<" m="<<a.m<<" options="<<a.stats.options<<" consistent="<<a.stats.consistent<<" collisionFree="<<a.stats.collisionFree<<" unique="<<a.stats.unique<<" groups="<<a.stats.possibleGroups<<" ms="<<ms()<<" domains=";for(int n:a.stats.counts)std::cout<<n<<',';std::cout<<std::endl;
  std::set<string> actions;auto s=solve(a,[&](const Perm& p,const Key& k,int n){int actual=support(p,k,cipher,lex);if(actual!=n||actual<44)throw std::logic_error("score mismatch");string z=encode(p,k);if(!actions.insert(z).second)throw std::logic_error("duplicate");std::cout<<"ACTION "<<id<<' '<<z<<" support="<<actual<<std::endl;},lo,lim);
  std::cout<<"SOLVE "<<id<<" exhausted="<<s.exhausted<<" nodes="<<s.nodes<<" rotations="<<s.rotations<<" checks="<<s.lexChecks<<" lexPrunes="<<s.lexPrunes<<" maskPrunes="<<s.maskPrunes<<" actions="<<s.actions<<" best="<<s.best<<" ms="<<ms()<<" order=";for(int v:s.order)std::cout<<v<<',';std::cout<<std::endl;
 }
}
