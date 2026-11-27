#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cmath>
#include <fstream>
#include <functional>
#include <iostream>
#include <map>
#include <numeric>
#include <random>
#include <set>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;
using Word=vector<int>;using Chart=array<int,29>;using Key=array<int,8>;
const string alphabet="0123456789abcdefghijklmnopqrs";
const vector<string> names={"F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"};
int mod(int a){return (a%29+29)%29;}
int inverse(int a){for(int i=1;i<29;i++)if(a*i%29==1)return i;throw runtime_error("inverse");}
Word unpack(string s){Word w;for(char c:s){size_t i=alphabet.find(c);if(i==string::npos)throw runtime_error("glyph");w.push_back(i);}return w;}
string packed(const Word&w){string s;for(int p:w)s+=alphabet[p];return s;}
struct Lex{Word p;double weight;};
vector<Lex> D[30];double norm[30];
void dictionary(const string&path){ifstream f(path);if(!f)throw runtime_error(path);map<Word,double> d;string line;while(getline(f,line)){istringstream ss(line);string s;double n;if(!(ss>>s>>n)||!all_of(s.begin(),s.end(),[](char c){return c>='a'&&c<='z';}))continue;string a;for(size_t i=0;i<s.size();i++){char c=toupper(s[i]);if(c=='Q'&&i+1<s.size()&&s[i+1]=='u'){a+="CW";i++;}else a+=c=='V'?'U':c=='K'||c=='Q'?'C':c=='Z'?'S':c;}Word w;function<void(size_t)> rec=[&](size_t i){if(i==a.size()){d[w]+=n;return;}for(int j=0;j<29;j++)if(a.compare(i,names[j].size(),names[j])==0){w.push_back(j);rec(i+names[j].size());w.pop_back();}if(a.compare(i,3,"ING")==0){w.push_back(21);rec(i+3);w.pop_back();}};rec(0);}cerr<<"dictionary "<<d.size()<<"\n";assert(d.size()==38910);for(auto&[w,n]:d)if(w.size()<30&&w.size()>0){double wt=pow(n,0.65);D[w.size()].push_back({w,wt});norm[w.size()]+=wt;}for(int l=1;l<30;l++)for(auto&v:D[l])v.weight/=norm[l];}
struct Group{int chapter;Word c,p;};
vector<Group> profile(const string&path){ifstream f(path);if(!f)throw runtime_error(path);vector<Group> v;string w;while(f>>w){assert(w[1]==':');v.push_back({w[0]-'0',unpack(w.substr(2)),{}});}assert(v.size()==187);int n=0;for(auto&g:v)n+=g.c.size();assert(n==1884);return v;}
Chart randomchart(mt19937&r){Chart a;iota(a.begin(),a.end(),0);shuffle(a.begin()+2,a.end(),r);return a;}
Word encrypt(const Word&p,const Chart&a,const Key&k,int phase){Chart b;for(int i=0;i<29;i++)b[a[i]]=i;Word c;for(int x:p){if(x==0)c.push_back(0);else{c.push_back(b[mod(a[x]+k[phase])]);phase=(phase+1)%8;}}return c;}
Word donor(int l,mt19937&r){vector<double> wt;for(auto&w:D[l])wt.push_back(w.weight);discrete_distribution<int> pick(wt.begin(),wt.end());return D[l][pick(r)].p;}
Key canon(Key k){Key best=k;for(int j=1;j<8;j++){Key v;for(int i=0;i<8;i++)v[i]=k[(i+j)%8];best=min(best,v);}return best;}
// Return the exact per-word shift vector (up to phase rotation) when m>=8.
// All non-F positions consume; the literal F bypass is checked explicitly.
bool wordkey(const Word&c,const Word&p,const Chart&a,Key&k){k.fill(-1);int j=0;for(size_t i=0;i<p.size();i++){if(!p[i]){if(c[i])return false;continue;}int v=mod(a[c[i]]-a[p[i]]);if(k[j%8]>=0&&k[j%8]!=v)return false;k[j%8]=v;j++;}if(j<8)return false;k=canon(k);return true;}
bool admits(const Word&c,const Word&p,const Chart&a,const Key&k){for(int j=0;j<8;j++)if(encrypt(p,a,k,j)==c)return true;return false;}
struct Eq{array<int8_t,29> coef{};vector<pair<int,int>> posts;int residue;};
struct Candidate{int group;const Lex*lex;vector<int> eq;int constant,held,repeat,match;double base,contribution;};
struct Model{vector<Group> groups;vector<Eq> eq;vector<Candidate> cand;vector<vector<int>> byGroup;array<vector<int>,29> bySymbol;vector<double> sums;Chart a;double eta,score;vector<int> stamp;int serial=0;double factor[16][16];
  // An equality of two phase shifts; normalize by its first nonzero coefficient.
  int equation(array<int,29> x,unordered_map<string,int>&dict){x[0]=0;int first=0;for(int i=1;i<29;i++)if(x[i]){first=x[i];break;}if(first==0)return -1;int s=inverse(mod(first));string id;array<int8_t,29> co{};int nz=0;for(int i=1;i<29;i++){co[i]=mod(x[i]*s);id+=char(co[i]);nz+=co[i]!=0;}if(nz==1)return -2; // distinct nonzero chart positions
    if(nz==2){int sum=0;for(int i=1;i<29;i++)sum+=co[i];if(sum%29==0)return -2;}
    auto it=dict.find(id);if(it!=dict.end())return it->second;int n=eq.size();dict[id]=n;Eq e;e.coef=co;eq.push_back(move(e));for(int i=1;i<29;i++)if(co[i])bySymbol[i].push_back(n);return n;
  }
  Model(vector<Group> g):groups(move(g)){byGroup.resize(groups.size());unordered_map<string,int> dict;int eligible=0;for(size_t gi=0;gi<groups.size();gi++){auto&c=groups[gi].c;for(auto&lex:D[c.size()]){auto&p=lex.p;int held=0;vector<int> active;bool ok=true;for(size_t i=0;i<p.size();i++){if(p[i]==0){held++;if(c[i]){ok=false;break;}}else active.push_back(i);}if(!ok)continue;int n=active.size();vector<int> es;int constant=0;for(int i=8;i<n;i++){int l=active[i-8],r=active[i];if((c[l]==c[r])!=(p[l]==p[r]) || (c[l]==p[l])!=(c[r]==p[r])){ok=false;break;}array<int,29>x{};x[c[l]]++;x[p[l]]--;x[c[r]]--;x[p[r]]++;int e=equation(x,dict);if(e==-2){ok=false;break;}if(e==-1)constant++;else es.push_back(e);}if(!ok)continue;int k=cand.size();cand.push_back({(int)gi,&lex,move(es),constant,held,max(0,n-8),0,lex.weight*pow(29.0,held),0});byGroup[gi].push_back(k);for(int e:cand.back().eq)eq[e].posts.push_back({k,1});}if(!byGroup[gi].empty())eligible++;}stamp.resize(eq.size());cerr<<"groups="<<groups.size()<<" eligible="<<eligible<<" eq="<<eq.size()<<" cand="<<cand.size()<<"\n";}
  double term(double s){return log(0.05+0.95*max(0.0,s));}
  void reset(const Chart&b,double noise){a=b;eta=noise;for(int n=0;n<16;n++)for(int m=0;m<=n;m++)factor[n][m]=pow(29*(1-eta),m)*pow(29*eta/28,n-m);for(auto&e:eq){int z=0;for(int i=1;i<29;i++)z+=e.coef[i]*a[i];e.residue=mod(z);}sums.assign(groups.size(),0);for(auto&c:cand){c.match=c.constant;for(int i:c.eq)c.match+=eq[i].residue==0;c.contribution=c.base*factor[c.repeat][c.match];sums[c.group]+=c.contribution;}score=0;for(double s:sums)score+=term(s);}
  // In-place swap. All candidate relations affected by a changed equality are updated.
  double swapcoords(int x,int y){int delta=a[y]-a[x];if(!delta)return score;swap(a[x],a[y]);serial++;double dd=0;auto visit=[&](int i){if(stamp[i]==serial)return;stamp[i]=serial;auto&e=eq[i];int old=e.residue;e.residue=mod(old+(e.coef[x]-e.coef[y])*delta);int change=(e.residue==0)-(old==0);if(!change)return;for(auto [j,m]:e.posts){auto&c=cand[j];auto&sum=sums[c.group];double before=term(sum);sum-=c.contribution;c.match+=change*m;c.contribution=c.base*factor[c.repeat][c.match];sum+=c.contribution;dd+=term(sum)-before;}};for(int i:bySymbol[x])visit(i);for(int i:bySymbol[y])visit(i);score+=dd;return score;}
  int exact_support()const{int n=0;for(auto&v:byGroup){bool yes=false;for(int i:v)if(cand[i].match==cand[i].repeat){yes=true;break;}n+=yes;}return n;}
  pair<int,int> guided(mt19937&r){int g=r()%groups.size();auto&v=byGroup[g];if(v.empty())return {2+(int)(r()%27),2+(int)(r()%27)};double total=sums[g];int ci=v[r()%v.size()];if(total>1e-20){double t=generate_canonical<double,32>(r)*total;for(int j:v){t-=cand[j].contribution;if(t<=0){ci=j;break;}}}auto&c=cand[ci];if(c.eq.empty())return {2+(int)(r()%27),2+(int)(r()%27)};for(int attempt=0;attempt<5;attempt++){auto&e=eq[c.eq[r()%c.eq.size()]];if(!e.residue)continue;for(int start=0;start<29;start++){int x=2+(int)(r()%27);if(!e.coef[x])continue;for(int y=2;y<29;y++){int coef=mod(e.coef[x]-e.coef[y]);if(!coef)continue;if(mod(e.residue+coef*(a[y]-a[x]))==0)return {x,y};}}}return {2+(int)(r()%27),2+(int)(r()%27)};}
};
int match(const Chart&a,const Chart&b){int n=0;for(int i=0;i<29;i++)n+=a[i]==b[i];return n;}
void keytest(Model&m,const Chart&a,const vector<Key>&keys,const vector<Group>&hold,bool plant){vector<map<Key,int>> votes(9);for(size_t gi=0;gi<m.groups.size();gi++){set<Key> kset;auto&g=m.groups[gi];for(int i:m.byGroup[gi]){auto&c=m.cand[i];Key k;if(wordkey(g.c,c.lex->p,a,k))kset.insert(k);}for(auto&k:kset)votes[g.chapter][k]++;}int train=0,truthkey=0,hits=0,truthheld=0;for(int ch=0;ch<9;ch++){int maxvote=0;Key best{};int tied=0;for(auto&[k,v]:votes[ch]){if(v>maxvote){maxvote=v;best=k;tied=1;}else if(v==maxvote)tied++;}train+=maxvote;truthkey+=plant&&maxvote&&best==canon(keys[ch]);for(auto&g:hold)if(g.chapter==ch&&maxvote&&tied==1){bool any=false;for(auto&w:D[g.c.size()])if(admits(g.c,w.p,a,best)){any=true;break;}hits+=any;truthheld+=admits(g.c,g.p,a,best);}cout<<"chapter="<<ch<<" maxvote="<<maxvote<<" ties="<<tied<<" key=";for(int k:best)cout<<k<<",";cout<<"\n";}cout<<"KEYTEST train="<<train<<" exact_chapters="<<truthkey<<" hold_supported="<<hits<<" hold_truth="<<truthheld<<"/"<<hold.size()<<"\n";}
int main(int argc,char**argv){if(argc<5){cerr<<"usage: chart dictionary long.txt seed steps [restarts]\n";return 2;}dictionary(argv[1]);auto g=profile(argv[2]);int seed=stoi(argv[3]),steps=stoi(argv[4]),restarts=argc>5?stoi(argv[5]):4;mt19937 r(seed);bool plant=seed>=0;Chart truth=randomchart(r);vector<Key> keys(9);vector<Group> hold;int oov=0;if(plant){for(auto&k:keys)for(int&x:k)x=r()%29;for(auto&v:g){v.p=donor(v.c.size(),r);if(r()%20==0){for(int&x:v.p)x=1+r()%28;oov++;}v.c=encrypt(v.p,truth,keys[v.chapter],r()%8);}for(int ch=0;ch<9;ch++)for(int i=0;i<20;i++){Word p=donor(3+r()%6,r);hold.push_back({ch,encrypt(p,truth,keys[ch],r()%8),p});}}Model m(g);if(plant){cout<<"PLANT seed="<<seed<<" oov="<<oov<<"\n";for(double eta:{0.95,0.80,0.50,0.10,0.01}){m.reset(truth,eta);double sc=m.score;int sup=m.exact_support();m.reset(randomchart(r),eta);cout<<"eta="<<eta<<" oracle="<<sc<<" oracle_support="<<sup<<" random="<<m.score<<" random_support="<<m.exact_support()<<"\n";}m.reset(truth,0.01);keytest(m,truth,keys,hold,true);}Chart best{};double bestHard=-1e100;for(int rep=0;rep<restarts;rep++){Chart cur=randomchart(r);for(int stage=0;stage<5;stage++){double eta[]={0.95,0.8,0.5,0.1,0.01};m.reset(cur,eta[stage]);double hi=m.score;Chart local=cur;for(int i=0;i<steps;i++){double t=0.4*pow(0.025,(double)i/steps);int x,y;if((r()%4)==0){auto xy=m.guided(r);x=xy.first;y=xy.second;}else{x=2+r()%27;y=2+r()%27;}if(x==y)continue;double prev=m.score;double now=m.swapcoords(x,y);if(now<prev&&generate_canonical<double,32>(r)>exp((now-prev)/t))m.swapcoords(x,y);if(m.score>hi+1e-7){hi=m.score;local=m.a;}}cur=local;m.reset(cur,eta[stage]);cout<<"fit rep="<<rep<<" stage="<<stage<<" score="<<m.score<<" support="<<m.exact_support()<<" match="<<(plant?match(cur,truth):0)<<endl;}m.reset(cur,0.01);if(m.score>bestHard){bestHard=m.score;best=cur;}if(plant&&best==truth)break;}m.reset(best,0.01);cout<<"FINAL score="<<m.score<<" support="<<m.exact_support()<<" chart_match="<<(plant?match(best,truth):0)<<" chart=";for(int x:best)cout<<x<<",";cout<<"\n";keytest(m,best,keys,hold,plant);return 0;}
