// Exact finite alphabet-bank q13 receiver; six unsupported long words allowed.
// Seven disjoint F-free pairs cover every qualifying action. No short group
// participates in key generation or fit. Native-word and red-rubric alphabets.
#include <bits/stdc++.h>
#include <codecvt>
#include <locale>
using namespace std;
using u64=uint64_t;using A=array<int,29>;using K=array<int,8>;
const string sym="0123456789abcdefghijklmnopqrs";
const u32string runes=U"ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ";
const vector<string> names={"F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"};
int md(int x){return (x%29+29)%29;}
string file(const string&p){ifstream f(p);if(!f)throw runtime_error(p);return string(istreambuf_iterator<char>(f),{});}
vector<string> words(const string&s){istringstream f(s);vector<string> v;string w;while(f>>w)v.push_back(w);return v;}
vector<string> fields(const string&s,const string&k){regex re("\""+k+"\"\\s*:\\s*\"([^\"]*)\"");vector<string> v;for(sregex_iterator i(s.begin(),s.end(),re),e;i!=e;++i)v.push_back((*i)[1]);return v;}
map<string,double> freq;double curf=1;set<string> D;vector<string> by[64],nof[64];unordered_set<string> lookup;
void spell(const string&s,int i,string w){if(i==(int)s.size()){D.insert(w);freq[w]=max(freq[w],curf);return;}for(int n=1;n<=3&&i+n<=(int)s.size();n++){auto t=s.substr(i,n);int j=-1;if(n==3){if(t=="ING")j=21;}else for(int x=0;x<29;x++)if(t==names[x]){j=x;break;}if(j>=0)spell(s,i+n,w+sym[j]);}}
void dictionary(){istringstream f(file("resources/control/english_wordfreq_textblob.txt"));string l;regex re("^([a-z]+)\\s+([0-9]+)$");smatch m;while(getline(f,l)){if(!regex_match(l,m,re))continue;curf=stod(m[2]);string s=m[1],v,z;for(char c:s)v+=toupper(c);for(int i=0;i<(int)v.size();i++){if(v.substr(i,2)=="QU"){z+="CW";i++;continue;}char c=v[i];z+=c=='V'?'U':c=='K'||c=='Q'?'C':c=='Z'?'S':c;}spell(z,0,"");}if(D.size()!=38910)throw runtime_error("dictionary base");for(auto&w:words(fields(file("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json"),"added").at(0)))D.insert(w);if(D.size()!=38938)throw runtime_error("dictionary expanded");for(auto&w:D){lookup.insert(w);if(w.size()<64){by[w.size()].push_back(w);if(w.find('0')==string::npos)nof[w.size()].push_back(w);}}}
vector<string> runeGroups(const string&s){wstring_convert<codecvt_utf8<char32_t>,char32_t> cv;auto u=cv.from_bytes(s);vector<string> v;string w;for(auto c:u){size_t i=runes.find(c);if(i!=u32string::npos)w+=sym[i];else if(!w.empty()){v.push_back(w);w.clear();}}if(!w.empty())v.push_back(w);return v;}
vector<string> chapter(){auto s=file("resources/transcriptions/lp2-image-corrected.txt");wstring_convert<codecvt_utf8<char32_t>,char32_t> cv;auto u=cv.from_bytes(s);int pg=0;vector<string> v;string w;for(auto c:u){if(c==U'%'){pg++;continue;}if(pg<40||pg>=53)continue;if(c==U'/'||c==U'\n'||c==U'\r'||c==U' '||c==U'\t')continue;size_t i=runes.find(c);if(i!=u32string::npos)w+=sym[i];else if(!w.empty()){v.push_back(w);w.clear();}}if(!w.empty())v.push_back(w);int n=0;for(auto&x:v)n+=x.size();if(v.size()!=669||n!=3008)throw runtime_error("chapter shape");return v;}

// Known canonical input alphabet, arbitrary output permutation B and all q8
// shifts. A consuming position is B[C]-k[phase]=P; transparent F holds.
// Weighted DSU represents exact modular constraints; partial all-different
// is checked per component. Frequency-ranked bounded constructive search.
constexpr int V=37,Q=8;
struct Eq{uint8_t c,j,p;};
struct Option{string w;vector<Eq> e;double freq;};
struct State{array<uint8_t,V> par,off,sz;State(){iota(par.begin(),par.end(),0);off.fill(0);sz.fill(1);}pair<int,int> root(int x)const{int d=0;while(par[x]!=x){d+=off[x];x=par[x];}return {x,d%29};}
 bool add(int a,int b,int d){auto [ra,da]=root(a);auto [rb,db]=root(b);if(ra==rb)return md(da-db)==d;if(sz[ra]<sz[rb]){par[ra]=rb;off[ra]=md(d-da+db);sz[rb]+=sz[ra];}else{par[rb]=ra;off[rb]=md(da-db-d);sz[ra]+=sz[rb];}return true;}
 bool unique()const{uint32_t mask[V]={};for(int x=0;x<29;x++){auto[r,d]=root(x);uint32_t z=1u<<d;if(mask[r]&z)return false;mask[r]|=z;}return true;}
 int components()const{int n=0;for(int i=0;i<V;i++)n+=par[i]==i;return n;}
 bool extend(const Option&o,int phase){for(auto&e:o.e)if(!add(e.c,29+(e.j+phase)%Q,e.p))return false;return unique();}
};
vector<Option> opts(const string&c){vector<Option> out;for(auto&w:by[c.size()]){Option o{w,{},freq[w]};bool good=true;int j=0;for(int i=0;i<(int)c.size();i++){int p=sym.find(w[i]),x=sym.find(c[i]);if(!p){if(x){good=false;break;}continue;}o.e.push_back({(uint8_t)x,(uint8_t)(j++%Q),(uint8_t)p});}if(!good)continue;State s;if(s.extend(o,0))out.push_back(move(o));}stable_sort(out.begin(),out.end(),[](auto&a,auto&b){if(a.freq!=b.freq)return a.freq>b.freq;return a.w<b.w;});return out;}
string encrypt(const string&w,const A&B,const K&k,int j){A inv;for(int i=0;i<29;i++)inv[B[i]]=i;string c;for(char z:w){int p=sym.find(z);if(!p)c+='0';else{c+=sym[inv[md(p+k[j])]];j=(j+1)%Q;}}return c;}
set<string> dec(const string&c,const A&B,const K&k){set<string> out;string w;function<void(int,int,int)> rec=[&](int i,int j,int start){if(i==(int)c.size()){if(lookup.count(w)){if(encrypt(w,B,k,start)!=c)throw runtime_error("replay");out.insert(w);}return;}int x=sym.find(c[i]);if(!x){w+='0';rec(i+1,j,start);w.pop_back();}int p=md(B[x]-k[j]);if(p){w+=sym[p];rec(i+1,(j+1)%Q,start);w.pop_back();}};for(int j=0;j<Q;j++)rec(0,j,j);return out;}
K norm(K k){K a=k;for(int i=1;i<Q;i++){rotate(k.begin(),k.begin()+1,k.end());a=min(a,k);}return a;}
bool primitive(const K&k){for(int i=0;i<4;i++)if(k[i]!=k[i+4])return true;return false;}
struct Stat{uint64_t nodes=0,tests=0,full=0;int roots=0,maxrank=0;bool timed=false,capped=false;};
struct Result{bool found=false;A b{};K k{};vector<string> stat;};
template<class T>string ar(const T&v){string s="[";for(auto x:v){if(s.size()>1)s+=",";s+=to_string(+x);}return s+"]";}
struct Solver{vector<string> C;vector<vector<Option>> D;vector<int> order;vector<int> seed;Result result;Stat stat;chrono::steady_clock::time_point start,end;int budget=3;uint64_t maxfull=150000;bool stopped(){if(result.found||stat.timed||stat.capped)return true;if(chrono::steady_clock::now()>=end){stat.timed=true;return true;}return false;}
 bool validate(A b,K k){if(++stat.full>maxfull){stat.capped=true;return false;}if(!primitive(k))return false;int n=0,bad=0;for(auto&c:C){if(!dec(c,b,k).empty())n++;else if(++bad>budget)return false;}if(n>=int(C.size())-budget){result.found=true;result.b=b;result.k=norm(k);return true;}return false;}
 void complete(const State&s){vector<int> roots;array<int,V> comp{},rel{},val;array<uint32_t,V> masks{};for(int x=0;x<V;x++){auto[r,d]=s.root(x);comp[x]=r;rel[x]=d;if(x<29)masks[r]|=1u<<d;}int r0=comp[0];val.fill(-1);val[r0]=md(-rel[0]);uint32_t m0=0;for(int j=0;j<29;j++)if(masks[r0]>>j&1)m0|=1u<<md(j+val[r0]);for(int r=0;r<V;r++)if(s.par[r]==r&&r!=r0)roots.push_back(r);sort(roots.begin(),roots.end(),[&](int a,int b){return __builtin_popcount(masks[a])>__builtin_popcount(masks[b]);});function<void(int,uint32_t)> rec=[&](int i,uint32_t used){if(stopped())return;if(i==(int)roots.size()){A b;K k;for(int x=0;x<29;x++)b[x]=md(rel[x]+val[comp[x]]);for(int j=0;j<Q;j++)k[j]=md(rel[29+j]+val[comp[29+j]]);validate(b,k);return;}int r=roots[i];for(int v=0;v<29&&!stopped();v++){uint32_t m=0;for(int j=0;j<29;j++)if(masks[r]>>j&1)m|=1u<<md(j+v);if(m&used)continue;val[r]=v;rec(i+1,used|m);}};rec(0,m0);}
 struct Choice{int op,phase;State state;};
 vector<Choice> domain(const State&s,int g,int cap){vector<Choice> v;for(int i=0;i<(int)D[g].size();i++)for(int ph=0;ph<Q;ph++){if((++stat.tests&1023)==0&&stopped())return v;State t=s;if(t.extend(D[g][i],ph)){v.push_back({i,ph,t});if((int)v.size()>=cap)return v;}}return v;}
 void dfs(const State&s,vector<int> rem,int omit){if(stopped())return;stat.nodes++;int n=s.components();stat.maxrank=max(stat.maxrank,V-n);if(n<=4||rem.empty()){complete(s);return;}int best=-1,bestn=257;vector<Choice> cand;vector<int> next;int miss=0;
 for(int g:rem){auto d=domain(s,g,min(bestn,257));if(stopped())return;if(d.empty()){if(++miss+omit>budget)return;continue;}next.push_back(g);if((int)d.size()<bestn){bestn=d.size();best=g;cand=move(d);}else if(best<0){best=g;cand=move(d);}}
 if(best<0){complete(s);return;}next.erase(find(next.begin(),next.end(),best));int om=omit+miss;
 if(cand.size()>128)cand.resize(128);for(auto&v:cand){dfs(v.state,next,om);if(stopped())return;}if(om<budget)dfs(s,next,om+1);
 }
 void force(const State&s,int i,vector<int> rem){if(stopped())return;stat.maxrank=max(stat.maxrank,V-s.components());if(s.components()<=4){complete(s);return;}if(i==(int)seed.size()){dfs(s,rem,0);return;}auto d=domain(s,seed[i],512);for(auto&v:d){force(v.state,i+1,rem);if(stopped())return;}}
 Result run(vector<string> c,int secs){C=move(c);for(auto&w:C)D.push_back(opts(w));order.resize(C.size());iota(order.begin(),order.end(),0);sort(order.begin(),order.end(),[&](int a,int b){return log2(max<size_t>(1,D[a].size()))-1.2*C[a].size()<log2(max<size_t>(1,D[b].size()))-1.2*C[b].size();});vector<vector<int>> all;int n=min(16,(int)C.size());for(int i=0;i<n;i++)for(int j=i+1;j<n;j++)for(int k=j+1;k<n;k++)all.push_back({order[i],order[j],order[k]});auto score=[&](auto&v){double z=0;for(int i:v)z+=log2(max<size_t>(1,D[i].size()))-1.2*C[i].size();return z;};stable_sort(all.begin(),all.end(),[&](auto&a,auto&b){return score(a)<score(b);});mt19937 rng(0x29b8d5u);shuffle(all.begin()+min(12,(int)all.size()),all.end(),rng);all.resize(min(40,(int)all.size()));
 for(auto&v:all){seed=v;vector<int>rem;for(int g:order)if(find(seed.begin(),seed.end(),g)==seed.end())rem.push_back(g);stat={};start=chrono::steady_clock::now();end=start+chrono::seconds(secs);for(int i=0;i<min(96,(int)D[seed[0]].size());i++){State s;if(!s.extend(D[seed[0]][i],0))continue;stat.roots++;force(s,1,rem);if(stopped())break;}
 ostringstream z;z<<"{\"seed\":"<<ar(seed)<<",\"roots\":"<<stat.roots<<",\"nodes\":"<<stat.nodes<<",\"tests\":"<<stat.tests<<",\"full\":"<<stat.full<<",\"rank\":"<<stat.maxrank<<",\"timed\":"<<(stat.timed?"true":"false")<<",\"capped\":"<<(stat.capped?"true":"false")<<"}";result.stat.push_back(z.str());cout<<z.str()<<endl;if(result.found)break;
 }return result;}
};

vector<string> arrfield(const string&s,const string&k){regex re("\""+k+"\"\\s*:\\s*\\[([^\\]]*)\\]");smatch m;if(!regex_search(s,m,re))throw runtime_error(k);string t=m[1];regex z("\"([0-9a-s]+)\"");vector<string>v;for(sregex_iterator i(t.begin(),t.end(),z),e;i!=e;++i)v.push_back((*i)[1]);return v;}
int main(int argc,char**argv){dictionary();string mode=argc>1?argv[1]:"0";bool control=mode!="original";int secs=argc>2?stoi(argv[2]):8;auto f=file("resources/liber-primus/lp2-page-groups-54-55-derived.json");auto C=arrfield(f,"body_groups"),H=arrfield(f,"groups");H[0]=C.back()+H[0];C.pop_back();if(C.size()!=47||H.size()!=17)throw runtime_error("terminal profile");vector<string>T,HT;A b{};K k{};vector<int> omit;
if(control){int i=stoi(mode);auto t=words(fields(file("im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json"),"truth").at(i));T.assign(t.begin(),t.begin()+47);mt19937 rng(0xb829ca70u+i);HT.push_back(by[11][rng()%by[11].size()]);HT.insert(HT.end(),t.begin()+49,t.end());iota(b.begin(),b.end(),0);shuffle(b.begin()+1,b.end(),rng);for(auto&x:k)x=rng()%29;if(!primitive(k))k[7]=md(k[7]+1);vector<int> v;for(int j=0;j<47;j++)if(T[j].size()>=8)v.push_back(j);shuffle(v.begin(),v.end(),rng);omit.assign(v.begin(),v.begin()+3);sort(omit.begin(),omit.end());for(int j=0;j<47;j++){if(T[j].size()!=C[j].size())throw runtime_error("shape");if(find(omit.begin(),omit.end(),j)!=omit.end()){do{T[j].clear();for(int x=0;x<(int)C[j].size();x++)T[j]+=sym[1+rng()%28];C[j]=encrypt(T[j],b,k,rng()%Q);}while(!dec(C[j],b,k).empty());}else C[j]=encrypt(T[j],b,k,rng()%Q);}for(int j=0;j<17;j++)H[j]=encrypt(HT[j],b,k,rng()%Q);}
Solver s;auto R=s.run(C,secs);int tr=0,ht=0,tru=0,held=0;bool exact=false;if(R.found){exact=control&&R.b==b&&R.k==norm(k);for(int i=0;i<47;i++){auto d=dec(C[i],R.b,R.k);tr+=!d.empty();if(control)tru+=d.count(T[i]);}for(int i=0;i<(int)H.size();i++){auto d=dec(H[i],R.b,R.k);held+=!d.empty();if(control)ht+=d.count(HT[i]);}}
ostringstream o;o<<"{\"mode\":\""<<mode<<"\",\"found\":"<<(R.found?"true":"false")<<",\"exact\":"<<(exact?"true":"false")<<",\"training\":"<<tr<<",\"training_truth\":"<<tru<<",\"held\":"<<held<<",\"held_truth\":"<<ht<<",\"held_count\":"<<H.size()<<",\"omitted\":"<<ar(omit)<<",\"B\":"<<ar(R.b)<<",\"key\":"<<ar(R.k)<<",\"seeds\":[";for(int i=0;i<(int)R.stat.size();i++){if(i)o<<",";o<<R.stat[i];}o<<"]}";cout<<"FINAL "<<o.str()<<endl;if(const char*p=getenv("SFT_OUTPUT")){ofstream f(p);f<<o.str()<<endl;}return 0;}
