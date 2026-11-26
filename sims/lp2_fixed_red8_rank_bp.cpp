// Fixed source red8 key, arbitrary per-word phase, literal plaintext-F hold.
// Carry-independent weighted word-factor belief propagation, with a Sinkhorn
// all-different relaxation and exact forward-emission validation. Controls only.
#include <algorithm>
#include <array>
#include <cmath>
#include <complex>
#include <fstream>
#include <iomanip>
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
constexpr int N=29,Q=8;
const string sym="0123456789abcdefghijklmnopqrs";
const vector<string> alpha={"F","U","TH","O","R","C","G","W","H","N","I","J","EO","P","X","S","T","B","E","M","L","NG","OE","D","A","AE","Y","IA","EA"};
using Word=vector<int>;using Rank=array<int,N>;using Key=array<int,Q>;using Row=array<double,N>;using Matrix=array<Row,N>;
int mod(int x){return (x%N+N)%N;}
string str(const Word&w){string s;for(int x:w)s+=sym[x];return s;}
struct Entry{Word w;double weight;};
struct Lex{
 array<vector<Entry>,14> by;array<double,14> total{};set<string> known;
 void variants(const string&s,size_t i,Word&w,vector<Word>&out){if(i==s.size()){out.push_back(w);return;}if(w.size()==13)return;for(int n=1;n<=3&&i+n<=s.size();n++){string x=s.substr(i,n);int a=-1;if(x=="ING")a=21;else{auto it=find(alpha.begin(),alpha.end(),x);if(it!=alpha.end())a=int(it-alpha.begin());}if(a>=0){w.push_back(a);variants(s,i+n,w,out);w.pop_back();}}}
 void load(const string&path){ifstream f(path);if(!f)throw runtime_error("missing dictionary");string line;map<string,double> all;while(getline(f,line)){istringstream in(line);string w,c,extra;if(!(in>>w>>c)||in>>extra||!all_of(w.begin(),w.end(),[](char x){return x>='a'&&x<='z';})||!all_of(c.begin(),c.end(),[](char x){return x>='0'&&x<='9';}))continue;string s;for(size_t i=0;i<w.size();i++){char x=toupper(w[i]);if(x=='Q'&&i+1<w.size()&&w[i+1]=='u'){s+="CW";i++;continue;}if(x=='V')x='U';if(x=='K'||x=='Q')x='C';if(x=='Z')x='S';s+=x;}Word a;vector<Word> v;variants(s,0,a,v);for(auto&x:v)all[str(x)]+=stod(c)/v.size();}for(auto&[s,w]:all){Word a;for(char x:s)a.push_back(sym.find(x));by[a.size()].push_back({a,w});total[a.size()]+=w;known.insert(s);}cout<<"dictionary="<<known.size()<<endl;}
 Word sample(int n,mt19937_64&r)const{vector<double> w;for(auto&e:by[n])w.push_back(e.weight);return by[n][discrete_distribution<int>(w.begin(),w.end())(r)].w;}
};
Word encode(const Word&p,const Rank&rank,const Key&k,int j){Rank inv;for(int i=0;i<N;i++)inv[rank[i]]=i;Word c;for(int x:p){if(!x)c.push_back(0);else{c.push_back(inv[mod(rank[x]+k[j])]);j=(j+1)%Q;}}return c;}
struct Comp{vector<pair<int,int>> vo;};
struct Opt{vector<Comp> comp;double prior;};
struct Factor{Word cipher;vector<Opt> opts;double noise;};
// Every non-F edge fixes an exact modular rank difference. Reject impossible
// cycles, duplicate coordinates within one component, and impossible F holds.
bool graph(const Word&c,const Word&p,const Key&k,int j,Opt&o){array<vector<pair<int,int>>,N> adj;for(size_t i=0;i<p.size();i++){int x=c[i],y=p[i];if(!y){if(x)return false;continue;}int z=k[j];j=(j+1)%Q;if(x==y){if(z)return false;continue;}if(!z)return false;adj[y].push_back({x,z});adj[x].push_back({y,mod(-z)});}
 array<int,N> off;off.fill(-1);for(int root=0;root<N;root++)if(!adj[root].empty()&&off[root]<0){off[root]=0;Word q{root};unsigned mask=1;for(size_t n=0;n<q.size();n++){int v=q[n];for(auto [u,d]:adj[v]){int t=mod(off[v]+d);if(off[u]>=0){if(off[u]!=t)return false;}else{if(mask&(1u<<t))return false;mask|=1u<<t;off[u]=t;q.push_back(u);}}}sort(q.begin(),q.end());Comp a;for(int v:q)a.vo.push_back({v,off[v]});o.comp.push_back(move(a));}return true;}
Factor makeFactor(const Word&c,const Lex&lex,const Key&k){Factor f;f.cipher=c;f.noise=.06*pow(1.0/N,c.size());map<string,size_t> seen;for(const auto&e:lex.by[c.size()])for(int j=0;j<Q;j++){Opt o;if(!graph(c,e.w,k,j,o))continue;string s;for(auto&comp:o.comp){for(auto [v,d]:comp.vo){s+=char(v+1);s+=char(d+1);}s+=char(0);}double w=.94*e.weight/(lex.total[c.size()]*Q);auto [it,ok]=seen.emplace(s,f.opts.size());if(ok){o.prior=w;f.opts.push_back(move(o));}else f.opts[it->second].prior+=w;}return f;}
// Exact sum-product message of the word factor under independent incoming
// beliefs, with inter-component all-different deliberately relaxed.
Matrix message(const Factor&f,const Matrix&b){Matrix conditional{};Row included{};double total=f.noise;for(const auto&o:f.opts){vector<Row> pr(o.comp.size());vector<double> z(o.comp.size());double w=o.prior;for(size_t h=0;h<o.comp.size();h++){const auto&vs=o.comp[h].vo;auto&row=pr[h];row.fill(1);for(auto [v,d]:vs)for(int t=0;t<N;t++)row[t]*=b[v][mod(t+d)];z[h]=accumulate(row.begin(),row.end(),0.0);w*=z[h];if(w==0)break;}if(w==0)continue;total+=w;for(size_t h=0;h<o.comp.size();h++){double scale=w/z[h];for(auto [v,d]:o.comp[h].vo)if(v){included[v]+=w;for(int t=0;t<N;t++){int r=mod(t+d);if(r)conditional[v][r]+=scale*pr[h][t]/b[v][r];}}}}
 Matrix out{};for(int v=1;v<N;v++){double base=max(f.noise,total-included[v]);double m=0;for(int r=1;r<N;r++){out[v][r]=base+conditional[v][r];m=max(m,out[v][r]);}for(int r=1;r<N;r++)out[v][r]=log(max(1e-18,out[v][r]/m));}return out;}
// Approximate all-different factor: compute column scaling potentials of
// doubly stochastic beliefs. These are used only as a heuristic, not proof.
Row columnScale(const Matrix&logp){Matrix a{};for(int v=1;v<N;v++){double m=*max_element(logp[v].begin()+1,logp[v].end());for(int r=1;r<N;r++)a[v][r]=exp(max(-45.,logp[v][r]-m));}Row logc{};for(int z=0;z<20;z++){for(int v=1;v<N;v++){double s=accumulate(a[v].begin()+1,a[v].end(),0.);for(int r=1;r<N;r++)a[v][r]/=s;}for(int r=1;r<N;r++){double s=0;for(int v=1;v<N;v++)s+=a[v][r];logc[r]-=log(s);for(int v=1;v<N;v++)a[v][r]/=s;}}double m=accumulate(logc.begin()+1,logc.end(),0.)/(N-1);for(int r=1;r<N;r++)logc[r]-=m;return logc;}
Rank assignment(const Matrix&logp){ // Hungarian min cost, 28 variables
 array<double,N> u{},v{};array<int,N> p{},way{};for(int i=1;i<N;i++){p[0]=i;int j0=0;Row minv;minv.fill(1e99);array<bool,N> used{};do{used[j0]=true;int i0=p[j0],j1=0;double delta=1e99;for(int j=1;j<N;j++)if(!used[j]){double cur=-logp[i0][j]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0;}if(minv[j]<delta){delta=minv[j];j1=j;}}for(int j=0;j<N;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else minv[j]-=delta;j0=j1;}while(p[j0]);do{int j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}
 Rank a{};for(int j=1;j<N;j++)a[p[j]]=j;return a;}
int support(const vector<Word>&c,const Rank&a,const Key&k,const Lex&l,const vector<Word>*truth=nullptr){Rank inv;for(int x=0;x<N;x++)inv[a[x]]=x;int n=0;for(size_t g=0;g<c.size();g++){string p;auto walk=[&](auto&&self,size_t i,int j)->bool{if(i==c[g].size())return truth?p==str((*truth)[g]):l.known.count(p);int x=c[g][i];if(!x){p+='0';if(self(self,i+1,j))return true;p.pop_back();}int y=inv[mod(a[x]-k[j])];if(!y)return false;p+=sym[y];bool ok=self(self,i+1,(j+1)%Q);p.pop_back();return ok;};bool ok=false;for(int j=0;j<Q&&!ok;j++){p.clear();ok=walk(walk,0,j);}n+=ok;}return n;}
struct Result{Rank rank{};int lex=-1;};
Result fit(const vector<Word>&c,const Lex&l,const Key&k,int iterations,int restart,mt19937_64&r){vector<Factor> fs;size_t opts=0;for(auto&w:c){fs.push_back(makeFactor(w,l,k));opts+=fs.back().opts.size();}cout<<"factors="<<fs.size()<<" options="<<opts<<endl;Result best;
 for(int rep=0;rep<restart;rep++){vector<Matrix> ms(c.size());Matrix global{};if(rep){normal_distribution<double> nd(0,.2);for(int v=1;v<N;v++)for(int d=1;d<N;d++)global[v][d]=nd(r);}vector<int> order(c.size());iota(order.begin(),order.end(),0);Row scale{};
 for(int t=0;t<iterations;t++){shuffle(order.begin(),order.end(),r);for(int g:order){Matrix b{};b[0][0]=1;for(int v=1;v<N;v++){double m=-1e99;for(int d=1;d<N;d++){b[v][d]=global[v][d]-ms[g][v][d]+scale[d];m=max(m,b[v][d]);}double s=0;for(int d=1;d<N;d++){b[v][d]=exp(max(-30.,b[v][d]-m));s+=b[v][d];}for(int d=1;d<N;d++)b[v][d]/=s;}auto fresh=message(fs[g],b);for(int v=1;v<N;v++)for(int d=1;d<N;d++){double a=.35*(fresh[v][d]-ms[g][v][d]);ms[g][v][d]+=a;global[v][d]+=a;}}
 auto freshScale=columnScale(global);for(int d=1;d<N;d++)scale[d]=.5*scale[d]+.5*freshScale[d];Rank a=assignment(global);int lex=support(c,a,k,l);if(lex>best.lex){best={a,lex};cout<<"restart="<<rep<<" iter="<<t<<" best_lex="<<lex<<endl;}if(lex>=44)return best;}
 }return best;}

// Relative-coordinate synchronization: preserve the graph's pair information
// lost by unary BP, and round a complex phase embedding to a permutation.
using C=complex<double>;using CV=array<C,N>;using CM=array<CV,N>;
CV spectral(const CM&h,mt19937_64&r){double bound=0;for(int i=0;i<N;i++){double x=0;for(int j=0;j<N;j++)x+=abs(h[i][j]);bound=max(bound,x);}CV v;for(auto&x:v)x=polar(1.,double(r()%10000)*.0006283185307179586);for(int it=0;it<250;it++){CV w{};double norm=0;for(int i=0;i<N;i++){w[i]=bound*v[i];for(int j=0;j<N;j++)w[i]+=h[i][j]*v[j];norm+=std::norm(w[i]);}norm=sqrt(norm);if(norm<1e-20)return v;for(int i=0;i<N;i++)v[i]=w[i]/norm;}C phase=abs(v[0])>1e-12?v[0]/abs(v[0]):C(1);for(auto&x:v)x/=phase;return v;}
Rank syncRound(const CV&v,int harmonic){Matrix score{};for(int i=1;i<N;i++)for(int j=1;j<N;j++)score[i][j]=real(conj(v[i])*polar(1.,6.283185307179586*harmonic*j/N));return assignment(score);}
struct SOpt{double mass;vector<array<int,3>> pairs;};
vector<vector<SOpt>> syncOptions(const vector<Factor>&fs){vector<vector<SOpt>> out;for(auto&f:fs){vector<SOpt> os;double total=f.noise;for(auto&o:f.opts){SOpt so;so.mass=o.prior;for(auto&comp:o.comp){int m=comp.vo.size();bool hasF=comp.vo[0].first==0;so.mass*=hasF?pow(1./28,m-1):(29-m)*pow(1./28,m);for(int i=0;i<m;i++)for(int j=0;j<i;j++)so.pairs.push_back({comp.vo[i].first,comp.vo[j].first,mod(comp.vo[i].second-comp.vo[j].second)});}total+=so.mass;os.push_back(move(so));}for(auto&o:os)o.mass/=total;out.push_back(move(os));}return out;}
Result syncFit(const vector<Word>&c,const Lex&l,const Key&k,int rounds,mt19937_64&r){vector<Factor> fs;for(auto&w:c)fs.push_back(makeFactor(w,l,k));auto ss=syncOptions(fs);Result best;array<CV,15> prev{};Rank current{};bool active=false;
 for(int t=0;t<rounds;t++){// Weighted per-word mixture, conditioned only on the current proposed action.
  array<CM,15> h{};for(auto&f:ss){vector<double> w;double total=.06;for(auto&o:f){double z=o.mass;if(active){int good=0;for(auto [a,b,d]:o.pairs)good+=mod(current[a]-current[b])==d;z*=exp(min(18.,.7*good));}w.push_back(z);total+=z;}for(size_t i=0;i<f.size();i++)for(auto [a,b,d]:f[i].pairs){double z=w[i]/total;for(int m=1;m<=14;m++){C q=polar(z,6.283185307179586*m*d/N);h[m][a][b]+=q;h[m][b][a]+=conj(q);}}}
  Rank roundBest{};int blex=-1;Matrix joint{};for(int m=1;m<=14;m++){auto v=spectral(h[m],r);auto a=syncRound(v,m);int lex=support(c,a,k,l);if(lex>blex){blex=lex;roundBest=a;}for(int i=1;i<N;i++)for(int j=1;j<N;j++)joint[i][j]+=real(conj(v[i])*polar(1.,6.283185307179586*m*j/N));}
  auto a=assignment(joint);int lex=support(c,a,k,l);if(lex>blex){blex=lex;roundBest=a;}if(blex>best.lex){best={roundBest,blex};cout<<"SYNC round="<<t<<" best_lex="<<blex<<endl;}current=roundBest;active=true;if(best.lex>=44)break;
 }return best;}
int main(int argc,char**argv){if(argc!=4){cerr<<"usage: red8_rank_bp DICTIONARY ITERATIONS RESTARTS\n";return 2;}Lex l;l.load(argv[1]);int iterations=stoi(argv[2]),restarts=stoi(argv[3]);vector<int> shape={8,3,6,2,5,3,2,3,5,7,3,4,10,8,3,5,8,4,3,4,5,4,3,5,1,3,5,5,3,4,2,6,5,3,8,5,4,8,2,3,4,6,6,3,2,10,2};vector<int> holdShape={11,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3};if(accumulate(shape.begin(),shape.end(),0)!=213)throw runtime_error("shape");bool gate=true;for(int typ=0;typ<2;typ++){Key k=typ?Key{13,21,2,20,5,18,2,13}:Key{19,21,23,27,2,14,10,19};mt19937_64 r(76031+typ*2039);Rank truth;iota(truth.begin(),truth.end(),0);shuffle(truth.begin()+1,truth.end(),r);vector<Word> p,c,hp,hc;for(int len:shape)p.push_back(l.sample(len,r));for(int i:{12,43,45}){do{for(int&x:p[i])x=r()%N;}while(l.known.count(str(p[i])));}for(auto&w:p)c.push_back(encode(w,truth,k,r()%Q));for(int len:holdShape)hp.push_back(l.sample(len,r));do{for(int&x:hp[0])x=r()%N;}while(l.known.count(str(hp[0])));for(auto&w:hp)hc.push_back(encode(w,truth,k,r()%Q));cout<<"CONTROL key="<<typ<<" oracleLex="<<support(c,truth,k,l)<<" oracleFitTruth="<<support(c,truth,k,l,&p)<<" oracleHeldTruth="<<support(hc,truth,k,l,&hp)<<endl;auto out=restarts==0?syncFit(c,l,k,iterations,r):fit(c,l,k,iterations,restarts,r);int body=support(c,out.rank,k,l,&p),held=support(hc,out.rank,k,l,&hp);bool exact=out.rank==truth;gate&=exact&&held==17;cout<<"RESULT key="<<typ<<" lex="<<out.lex<<" fitTruth="<<body<<" heldTruth="<<held<<" exact="<<exact<<endl;}
 cout<<"ORIGINAL_GATE="<<gate<<" (original values not loaded)\n";return 0;}
