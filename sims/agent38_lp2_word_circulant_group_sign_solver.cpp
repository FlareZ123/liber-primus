#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
#include <set>
#include <bit>
#include <cassert>
using namespace std;
constexpr int Q=29;
const string alphabet="0123456789ABCDEFGHIJKLMNOPQRS";
using Clock=chrono::steady_clock;
using V=array<uint8_t,Q>;
struct Row {vector<pair<int,int>> terms;};
struct Group {int id,page; array<vector<Row>,2> opts; uint32_t support=0;};
struct Space {int d; array<V,Q> a{};};
struct Stats {uint64_t nodes=0, eqs=0, forced=0, implied=0, candidates=0, dead=0; array<uint64_t,29> dims{};};
uint8_t submul[Q][Q][Q],mul[Q][Q]; int inv[Q];
vector<Group> groups; vector<int> order; Stats st; set<string> solutions;
Clock::time_point started; double limitSec; bool timeout=false,stopFirst=false;
int mod(int a){a%=Q;return a<0?a+Q:a;}
int get(char c){return int(alphabet.find(c));}
void init(){for(int i=0;i<Q;i++)for(int j=0;j<Q;j++){mul[i][j]=i*j%Q; if(i*j%Q==1)inv[i]=j;for(int k=0;k<Q;k++)submul[i][j][k]=mod(i-j*k);}}
// pi_0=0 removes the translation gauge. The sum of a permutation is 0 mod 29.
Space initial(){Space s;s.d=27;for(int j=0;j<27;j++){s.a[j+1][j]=1;s.a[28][j]=28;}return s;}
// Project one sparse linear equation and eliminate a free coordinate, preserving every solution.
bool add(Space& s,const Row& r){st.eqs++;int v[Q]={};for(auto [i,c]:r.terms){for(int j=0;j<s.d;j++)v[j]+=c*s.a[i][j];}int p=-1;for(int j=0;j<s.d;j++){v[j]%=Q;if(v[j])p=j;}if(p<0)return false;
 int scale=inv[v[p]];for(int j=0;j<s.d;j++)v[j]=mul[scale][v[j]];
 for(int i=0;i<Q;i++){int c=s.a[i][p];if(c)for(int j=0;j<s.d;j++)if(j!=p)s.a[i][j]=submul[s.a[i][j]][c][v[j]];if(p!=s.d-1)s.a[i][p]=s.a[i][s.d-1];}
 s.d--;return true;}
// Exact equality detection; at d>12 this inexpensive pruning is omitted.
bool forced(const Space& s){if(s.d==0)return true;if(s.d>12)return false;array<uint64_t,Q> sig{};for(int i=0;i<Q;i++){uint64_t x=0;for(int j=0;j<s.d;j++)x=(x<<5)|s.a[i][j];sig[i]=x;}sort(sig.begin(),sig.end());return adjacent_find(sig.begin(),sig.end())!=sig.end();}
bool feasible(const V& a){st.candidates++;uint32_t mask=0;for(int x:a){uint32_t b=1u<<x;if(mask&b)return false;mask|=b;}for(auto& g:groups){bool ok=false;for(auto& rs:g.opts){bool all=true;for(auto& r:rs){int v=0;for(auto [i,c]:r.terms)v+=c*a[i];if(v%Q){all=false;break;}}if(all){ok=true;break;}}if(!ok)return false;}return true;}
void candidate(const Space& s,const V& free){V a{};for(int i=0;i<Q;i++){int v=0;for(int j=0;j<s.d;j++)v+=s.a[i][j]*free[j];a[i]=v%Q;}if(!a[1])return;int m=inv[a[1]];for(auto& x:a)x=mul[m][x];if(feasible(a)){string key;for(auto x:a)key+=alphabet[x];if(solutions.insert(key).second)cerr<<"FOUND "<<key<<" nodes="<<st.nodes<<"\n";}}
// Enumerate all projective directions only at dimension <=2. This preserves all normalized alphabets.
void enumerate(const Space& s){V x{};if(s.d==1){x[0]=1;candidate(s,x);}else if(s.d==2){x[0]=1;for(int j=0;j<Q;j++){x[1]=j;candidate(s,x);}x[0]=0;x[1]=1;candidate(s,x);}else{cerr<<"Unexpected leaf dimension "<<s.d<<"\n";timeout=true;}}
struct Branch{array<Space,2> sp;array<bool,2> alive{};bool implied=false;int best=100;};
Branch split(const Space& s,const Group& g){Branch b;for(int k=0;k<2;k++){b.sp[k]=s;for(auto& r:g.opts[k])add(b.sp[k],r);if(b.sp[k].d==s.d){b.implied=true;return b;}if(forced(b.sp[k])){st.forced++;continue;}b.alive[k]=true;b.best=min(b.best,b.sp[k].d);}return b;}
void dfs(const Space& s,uint64_t left){if(timeout||(stopFirst&&!solutions.empty()))return;st.nodes++;st.dims[s.d]++;if((st.nodes&65535)==0){double sec=chrono::duration<double>(Clock::now()-started).count();if(sec>limitSec){timeout=true;return;}if((st.nodes&1048575)==0)cerr<<"nodes="<<st.nodes<<" d="<<s.d<<" remaining="<<popcount(left)<<" time="<<sec<<"s\n";}
 if(s.d<=1){enumerate(s);return;}
 int chosen=-1;Branch selected;
 // At low dimension propagate easy contradictions and forced orientations from any remaining constraint.
 int inspected=0;const int look=s.d<=5?8:1;
 for(int i:order)if(left&(1ull<<i)){
  auto b=split(s,groups[i]);if(b.implied){left&=~(1ull<<i);st.implied++;continue;}
  int cnt=b.alive[0]+b.alive[1];if(!cnt){st.dead++;return;}
  if(chosen<0||cnt<(selected.alive[0]+selected.alive[1])||(cnt==(selected.alive[0]+selected.alive[1])&&b.best<selected.best)){chosen=i;selected=move(b);}
  if(cnt==1||++inspected>=look)break;
 }
 if(chosen<0){enumerate(s);return;}
 left&=~(1ull<<chosen);
 for(int k=0;k<2;k++)if(selected.alive[k])dfs(selected.sp[k],left);
}
void makeOrder(int strategy){uint32_t used=0;vector<bool> done(groups.size());while(order.size()<groups.size()){int best=-1;long bestScore=-1000000;for(int i=0;i<(int)groups.size();i++)if(!done[i]){auto&g=groups[i];int overlap=popcount(used&g.support),novel=popcount(g.support&~used),rank=g.opts[0].size();long score=0;if(strategy==0)score=rank*200-20*novel+overlap*2;else if(strategy==1)score=-50*novel+rank*10+overlap;else if(strategy==2)score=rank*100-10*popcount(g.support);else score=-i;if(score>bestScore){best=i;bestScore=score;}}
 order.push_back(best);done[best]=true;used|=groups[best].support;}}
int main(int argc,char**argv){if(argc<2)return 2;init();ifstream f(argv[1]);int n;f>>n;groups.resize(n);for(auto&g:groups){int a,b;f>>g.id>>g.page>>a>>b;for(int k=0;k<2;k++){for(int z=0;z<(k?b:a);z++){string s;f>>s;assert(s.size()==Q);Row r;for(int i=0;i<Q;i++){int v=get(s[i]);assert(v>=0&&v<Q);if(v){r.terms.push_back({i,v});g.support|=1u<<i;}}g.opts[k].push_back(move(r));}}}string truth;f>>truth;limitSec=argc>2?stod(argv[2]):60;int strat=argc>3?stoi(argv[3]):0;stopFirst=argc>4&&stoi(argv[4]);assert(n<=63);makeOrder(strat);started=Clock::now();dfs(initial(),(1ull<<n)-1);double sec=chrono::duration<double>(Clock::now()-started).count();cout<<"{\"groups\":"<<n<<",\"strategy\":"<<strat<<",\"complete\":"<<(!timeout&&!(stopFirst&&!solutions.empty())?"true":"false")<<",\"timeout\":"<<(timeout?"true":"false")<<",\"nodes\":"<<st.nodes<<",\"equations\":"<<st.eqs<<",\"forcedEqual\":"<<st.forced<<",\"implied\":"<<st.implied<<",\"dead\":"<<st.dead<<",\"candidates\":"<<st.candidates<<",\"seconds\":"<<sec<<",\"solutions\":[";bool first=true;for(auto&k:solutions){if(!first)cout<<",";first=false;cout<<"\""<<k<<"\"";}cout<<"],\"truthFound\":"<<(solutions.count(truth)?"true":"false")<<",\"dimensionNodes\":[";for(int i=0;i<29;i++){if(i)cout<<",";cout<<st.dims[i];}cout<<"]}\n";}
