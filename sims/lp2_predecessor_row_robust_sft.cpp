// Exact finite alphabet-bank q13 receiver; six unsupported long words allowed.
// Seven disjoint F-free pairs cover every qualifying action. No short group
// participates in key generation or fit. Native-word and red-rubric alphabets.
#include <bits/stdc++.h>
#include <codecvt>
#include <locale>
using namespace std;
using u64=uint64_t;using A=array<int,29>;using K=array<int,13>;
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

using B=vector<uint64_t>;
struct Edge{int q,p,d;};
struct Cand{string w;vector<Edge> e;double score;};
struct Word{string c,t;int index;};
struct Row{array<int8_t,841> f,g;Row(){f.fill(-1);g.fill(-1);}bool add(const Edge&e){int a=e.q*29+e.p,b=e.q*29+e.d;if((f[a]>=0&&f[a]!=e.d)||(g[b]>=0&&g[b]!=e.p))return false;f[a]=e.d;g[b]=e.p;return true;}};
vector<Word> orig(){auto s=file("resources/transcriptions/lp2-image-corrected.txt");wstring_convert<codecvt_utf8<char32_t>,char32_t> cv;auto u=cv.from_bytes(s);int pg=0;vector<Word> v;string w;auto finish=[&](){if(w.size()){v.push_back({w,"",(int)v.size()});w.clear();}};for(auto c:u){if(c==U'%'){pg++;if(pg>=55){finish();break;}continue;}if(c==U'/'||c==U'\n'||c==U'\r'||c==U' '||c==U'\t')continue;size_t i=runes.find(c);if(i!=u32string::npos)w+=sym[i];else finish();}finish();int n=0;for(auto&x:v)n+=x.c.size();if(v.size()!=2896||n!=12956)throw runtime_error("original shape "+to_string(v.size())+" "+to_string(n));return v;}
vector<Cand> candidates(const string&c){vector<int> delta;for(int j=1;j<(int)c.size();j++)delta.push_back(md((int)sym.find(c[j])-(int)sym.find(c[j-1])));vector<Cand> out;if(c.size()>=64)return out;for(auto&w:by[c.size()]){Row s;vector<Edge> es;bool ok=true;for(int j=1;j<(int)w.size();j++){Edge e{(int)sym.find(w[j-1]),(int)sym.find(w[j]),delta[j-1]};int a=e.q*29+e.p;if(s.f[a]==e.d)continue;if(!s.add(e)){ok=false;break;}es.push_back(e);}if(ok)out.push_back({w,move(es),log1p(freq[w])});}sort(out.begin(),out.end(),[](auto&a,auto&b){if(a.score!=b.score)return a.score>b.score;return a.w<b.w;});return out;}
string encode(const string&w,const Row&q,mt19937&g){string c(1,sym[g()%29]);for(int j=1;j<(int)w.size();j++)c+=sym[(sym.find(c.back())+q.f[sym.find(w[j-1])*29+sym.find(w[j])])%29];return c;}
struct Group{Word w;vector<Cand> cs;unordered_map<int,B> p,d,e;int sz;};
void bit(unordered_map<int,B>&m,int k,int i,int sz){auto&v=m[k];if(v.empty())v.resize(sz);v[i/64]|=1ULL<<(i%64);}
Group prep(Word w){Group t{w,candidates(w.c),{},{},{},0};t.sz=(t.cs.size()+63)/64;for(int i=0;i<(int)t.cs.size();i++)for(auto&e:t.cs[i].e){bit(t.p,e.q*29+e.p,i,t.sz);bit(t.d,e.q*29+e.d,i,t.sz);bit(t.e,(e.q*29+e.p)*29+e.d,i,t.sz);}return t;}
struct Sol{vector<int> choices;int support;double score;};
struct Search{vector<Group> t;vector<int> chosen;vector<Sol> best;uint64_t nodes=0,leaves=0;int maxsupport=0;bool capped=false;chrono::steady_clock::time_point start;int budget=5;uint64_t limit=3000000;double seconds=100;
void save(int n,double score){leaves++;Sol s{chosen,n,score};best.push_back(move(s));sort(best.begin(),best.end(),[](auto&a,auto&b){if(a.support!=b.support)return a.support>b.support;return a.score>b.score;});if(best.size()>20)best.pop_back();}
void dfs(vector<B>& dom,vector<int>& count,int omitted,int support,double score){
 if(capped)return;if(++nodes>limit||((nodes&1023)==0&&chrono::duration<double>(chrono::steady_clock::now()-start).count()>seconds)){capped=true;return;}maxsupport=max(maxsupport,support);if(omitted>budget)return;
 int n=t.size(),i=-1,empty=0,remaining=0;for(int j=0;j<n;j++)if(chosen[j]==-2){remaining++;if(!count[j])empty++;else if(i<0||count[j]<count[i])i=j;}
 if(omitted+empty>budget||support+remaining-empty<(int)t.size()-budget)return;
 if(best.size()>=20&&support+remaining-empty<best.back().support)return;
 if(i<0){if(support>=n-budget)save(support,score);return;}
 auto& b=dom[i];for(int k=0;k<(int)b.size()&&!capped;k++){uint64_t v=b[k];while(v&&!capped){int c=k*64+__builtin_ctzll(v);v&=v-1;auto&ca=t[i].cs[c];chosen[i]=c;vector<B> nd=dom;vector<int> nc=count;int dead=empty;bool ok=true;
 for(int j=0;j<n;j++)if(chosen[j]==-2&&nc[j]){auto&g=t[j];auto&z=nd[j];for(auto&e:ca.e){auto p=g.p.find(e.q*29+e.p),d=g.d.find(e.q*29+e.d),a=g.e.find((e.q*29+e.p)*29+e.d);if(p==g.p.end()&&d==g.d.end())continue;for(int l=0;l<g.sz;l++){uint64_t pv=p==g.p.end()?0:p->second[l],dv=d==g.d.end()?0:d->second[l],av=a==g.e.end()?0:a->second[l];z[l]&=~((pv|dv)&~av);}}
 nc[j]=0;for(auto x:z)nc[j]+=__builtin_popcountll(x);if(!nc[j]&&++dead+omitted>budget){ok=false;break;}}
 if(ok)dfs(nd,nc,omitted,support+1,score+ca.score);chosen[i]=-2;}}
 if(omitted<budget&&!capped){chosen[i]=-1;dfs(dom,count,omitted+1,support,score);chosen[i]=-2;}
}
void run(vector<Word>&w){for(auto&x:w)t.push_back(prep(x));chosen.assign(t.size(),-2);vector<B> d;vector<int> c;for(auto&g:t){B b(g.sz,~0ULL);if(g.cs.size()%64)b.back()=(1ULL<<(g.cs.size()%64))-1;d.push_back(move(b));c.push_back(g.cs.size());}start=chrono::steady_clock::now();dfs(d,c,0,0,0);}
};
template<class T>string ar(const T&v){string s="[";for(auto x:v){if(s.size()>1)s+=",";s+=to_string(+x);}return s+"]";}
string sa(const vector<string>&v){string s="[";for(auto&w:v){if(s.size()>1)s+=",";s+='"'+w+'"';}return s+"]";}
struct Eval{int total=0,compatible=0,unique=0,truth=0,uniqueTruth=0,constrained=0;vector<string> examples;};
Eval evaluate(const vector<Word>&w,const Row&r){Eval z;for(auto&x:w){z.total++;auto cs=candidates(x.c);int cnt=0;string last;bool truth=false;for(auto&a:cs){bool ok=true;for(auto&e:a.e){int p=r.f[e.q*29+e.p],q=r.g[e.q*29+e.d];if((p>=0&&p!=e.d)||(q>=0&&q!=e.p)){ok=false;break;}}if(ok){cnt++;last=a.w;truth|=a.w==x.t;}}z.compatible+=cnt>0;z.unique+=cnt==1;z.truth+=truth;z.uniqueTruth+=cnt==1&&truth;if(cnt==1&&z.examples.size()<80)z.examples.push_back(to_string(x.index)+":"+last);if(!x.t.empty())for(int j=1;j<(int)x.t.size();j++)z.constrained+=r.f[sym.find(x.t[j-1])*29+sym.find(x.t[j])]>=0;}return z;}
string ej(Eval e){ostringstream o;o<<"{\"total\":"<<e.total<<",\"compatible\":"<<e.compatible<<",\"unique\":"<<e.unique<<",\"truth\":"<<e.truth<<",\"unique_truth\":"<<e.uniqueTruth<<",\"constrained_true_transitions\":"<<e.constrained<<",\"examples\":"<<sa(e.examples)<<"}";return o.str();}
int main(int argc,char**argv){dictionary();auto all=orig();vector<Word>T,H;for(auto&w:all){if(w.c.size()>=12)T.push_back(w);else if(w.c.size()>=10)H.push_back(w);}if(T.size()!=25||H.size()!=84)throw runtime_error("anchor profile "+to_string(T.size())+" "+to_string(H.size()));string mode=argc>1?argv[1]:"0";bool control=mode!="original";Row q;vector<int> omit;
if(control){int seed=stoi(mode);mt19937 rng(0x57ca3301u+seed);for(int a=0;a<29;a++){vector<int> v(29);iota(v.begin(),v.end(),0);shuffle(v.begin(),v.end(),rng);for(int p=0;p<29;p++)if(!q.add({a,p,v[p]}))throw runtime_error("row");}vector<int> pos(25);iota(pos.begin(),pos.end(),0);shuffle(pos.begin(),pos.end(),rng);omit.assign(pos.begin(),pos.begin()+5);auto plant=[&](Word&w,bool bad){auto&v=by[w.c.size()];if(bad){do{w.t.clear();for(int j=0;j<(int)w.c.size();j++)w.t+=sym[rng()%29];}while(D.count(w.t));}else{vector<double> weights;for(auto&a:v)weights.push_back(sqrt(1+freq[a]));discrete_distribution<int> pick(weights.begin(),weights.end());w.t=v[pick(rng)];}w.c=encode(w.t,q,rng);};for(int i=0;i<25;i++)plant(T[i],find(omit.begin(),omit.end(),i)!=omit.end());for(auto&w:H)plant(w,false);}
Search s;if(argc>2)s.seconds=stod(argv[2]);s.run(T);ostringstream o;o<<"{\"mode\":\""<<mode<<"\",\"dict\":"<<D.size()<<",\"budget\":5,\"nodes\":"<<s.nodes<<",\"leaves\":"<<s.leaves<<",\"maxsupport\":"<<s.maxsupport<<",\"capped\":"<<(s.capped?"true":"false")<<",\"omitted\":"<<ar(omit)<<",\"fits\":[";
for(int k=0;k<(int)s.best.size();k++){auto&sol=s.best[k];Row m;int matches=0,known=0,correct=0;vector<string> words;for(int j=0;j<25;j++){int c=sol.choices[j];if(c<0){words.push_back("-");continue;}auto&a=s.t[j].cs[c];matches+=control&&a.w==T[j].t;words.push_back(a.w);for(auto&e:a.e)if(!m.add(e))throw runtime_error("inconsistent fit");}for(int j=0;j<841;j++)if(m.f[j]>=0){known++;correct+=control&&m.f[j]==q.f[j];}auto h=evaluate(H,m);if(k)o<<",";o<<"{\"support\":"<<sol.support<<",\"score\":"<<sol.score<<",\"matches\":"<<matches<<",\"known\":"<<known<<",\"correct\":"<<correct<<",\"train_words\":"<<sa(words)<<",\"rows\":"<<ar(m.f)<<",\"held\":"<<ej(h)<<"}";}o<<"]}";cout<<"FINAL "<<o.str()<<endl;if(const char*p=getenv("SFT_OUTPUT")){ofstream f(p);f<<o.str()<<endl;}return 0;}
