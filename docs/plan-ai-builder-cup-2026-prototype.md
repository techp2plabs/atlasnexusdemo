# Atlas Nexus — AI Builder Cup 2026 Prototype Plan

> **Status 17 Oktober 2026:** Implementasi prototype lokal sudah dibuat di repository ini pada branch `main`. Deployment, publikasi, dan submission tetap ditunda sesuai arahan pengguna. Detail progres dan batas verifikasi dicatat pada bagian akhir dokumen.

**Goal:** Prototype Atlas Nexus berbasis Nuxt.js yang dapat dibagikan melalui GitHub publik dan Cloud Run, dengan campaign creator matching, Creator Suites, hierarchy management, serta Analytics publik YouTube yang sederhana.

**Architecture:** Satu aplikasi Nuxt 3 dengan Vue/TypeScript dan Pinia. Data bisnis memakai fixture lokal yang disimpan di browser; tidak terhubung ke BE produksi. Gemini diakses melalui endpoint Nitro kecil dalam aplikasi yang sama agar credential tidak masuk browser. Build Node/Nitro dijalankan di Cloud Run.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Pinia, Google Gen AI SDK server-side, Cloud Build, Artifact Registry, Cloud Run. Dependency dipin dalam lockfile saat implementasi.

**Spec:** Bagian 1–7 menetapkan kebutuhan dan desain; bagian 8–12 menjelaskan eksekusi, verifikasi, dan submission.

**Revisi:** 17 Oktober 2026, mengikuti arahan terbaru pengguna.

## 1. Keputusan dan konteks

Keputusan pengguna:

- Atlas Nexus sudah live, tetapi dipakai internal dan belum dipublikasikan sebagai produk untuk umum.
- FE existing di `../atlas-platform-fe`, BE di `../atlas-platform-core`.
- Fokus pada **Nuxt.js**; tidak ada evaluasi framework alternatif dalam scope ini.
- **Role, workspace, onboarding, dan login Brand di-skip**. Nama brand/perusahaan dalam brief campaign serta tool YouTube Brand Deal Reports tetap relevan; keduanya bukan role Brand.
- Campaign cukup menunjukkan brief, daftar creator, fit score, ringkasan dan rekomendasi Gemini, serta shortlist.
- Creator Suites menjadi fitur utama, khususnya tool existing yang menggunakan Gemini untuk menghasilkan insight.
- Analytics sederhana dan terpisah dari campaign, memakai jenis statistik publik YouTube.
- Data bisnis prototype memakai mock; tidak menghubungkan aplikasi demo ke backend atau data internal produksi.

Rekomendasi implementasi: buat Nuxt kecil di repository prototype ini, dengan hanya komponen dan halaman yang diperlukan. Gunakan FE/BE existing sebagai referensi desain dan konsep. Jangan menyalin seluruh FE beserta auth middleware, API client, GTM, dan plugin produksi.

### Batas scope

Tidak membangun workflow approval/eligibility, kode upload, verifikasi video, kontrak, payment, GMV/ROI, commerce import, paid attribution, atau revenue analytics. Fitur-fitur tersebut tidak diperlukan untuk cerita demo baru.

## 2. Peran folder existing

| Lokasi | Relevansi | Perlakuan |
| --- | --- | --- |
| `../atlas-platform-fe/` | Referensi visual, navigation, homepage/onboarding dan pola Nuxt | Read-only reference; pilih elemen yang dibutuhkan, bukan copy seluruh aplikasi |
| `../atlas-platform-core/docs/features/` | Sumber definisi Creator Suites, hierarchy dan kemampuan Gemini existing | Referensi agar demo tidak mengarang kemampuan produk |
| Legacy `docs/prototype/` | Dulu dipakai sebagai referensi homepage, login, hierarchy, Creator Suites dan alur demo | **Dihapus setelah Nuxt prototype menjadi implementasi aktif; data organisasi yang diperlukan sudah dipindahkan ke `demo/seed.mjs` dengan provenance** |

Catatan rencana ini diperbarui setelah implementasi: folder HTML lama tidak lagi digunakan oleh aplikasi, dokumentasi aktif, atau Docker build, sehingga dihapus atas permintaan pemilik project.

Temuan teknis pada analisis sebelumnya: FE sudah memakai Nuxt 3 SPA (`ssr: false`), Vue dan Pinia. Lockfile yang diperiksa memuat Nuxt 3.21.11. API client serta auth middleware existing tetap memanggil backend, sehingga lebih efisien membuat shell demo yang mandiri.

## 3. Catatan kompetisi dan status publikasi

Status **live internal dan belum dipublikasikan** dicatat sesuai penjelasan pengguna. Ini berbeda dari sudah tersedia untuk publik. Namun, ketentuan freshness kompetisi membahas kapan proyek/kode dibuat, bukan hanya kapan produk dipublikasikan.

Sumber resmi yang diperiksa pada 17 Oktober 2026:

- [FAQ](https://aibuildercup.com/Faqs.html) membatasi entry pada proyek baru selama hackathon dan meminta URL live, repo GitHub publik, video kurang dari tiga menit, serta deck.
- [Terms — Freshness Standards](https://docs.google.com/document/d/e/2PACX-1vRm7ChZ6Ij9fG7uFDkxzUMpwgVeBmnQ6cMDnAIEEX84AiLBOOQ9cYbl3S5OzFBbcVb8TF55s-eVpiXb/pub) membahas kode/aset existing. Catat kapan pekerjaan dimulai serta bagian baru yang dibangun; klarifikasi kelayakan internal product/reuse ke organizer bila diperlukan. Belum ada konfirmasi eligibility dalam dokumen ini.
- [Requirements](https://aibuildercup.com/themes.html) mengharuskan teknologi AI Google atau platform agentic Google dan deployment Google Cloud. Rencana ini menonjolkan runtime Gemini melalui creator matching dan Creator Suites.
- [Timeline](https://aibuildercup.com/) menampilkan deadline 18 Oktober 2026. Verifikasi jam/timezone dan field submission di dashboard. Pilihan tema harus mengikuti registrasi tim; Retail & Commerce atau Media, Content & Digital Experiences adalah kandidat kesesuaian, bukan dua submission.

Pemeriksaan eligibility tidak mengubah scope produk yang diminta. Jangan menyatakan bahwa repo baru, belum pernah publik, atau rewrite Nuxt otomatis menjadikan entry eligible. Tidak mengirim pesan ke organizer atau mengubah history Git dalam tahap rencana.

## 4. Menu dan cakupan halaman

Role demo: **Super Admin, Agency, Creator**. Get Started/Register hanya Creator dan Agency; Admin diakses melalui pemilih demo pada Login.

| Menu / route | Cakupan inti |
| --- | --- |
| `/` | Homepage: value proposition, tiga area utama Campaign Matching / Creator Suites / Network Management, CTA Get Started dan Try Demo |
| `/get-started` | Pilih Creator atau Agency, penjelasan demo |
| `/register/[role]` | Profil demo sederhana; simpan lokal lalu masuk aplikasi. Tidak perlu password/email asli atau provisioning |
| `/login` | Enter as Admin / Agency / Creator; tanpa password asli |
| `/app/home` | Dashboard ringkas: campaign tersimpan, shortlisted creators, report terbaru, jumlah network/channel sesuai scope |
| `/app/campaigns` | Daftar campaign dan Create Campaign |
| `/app/campaigns/[id]` | Brief, creator matching, fit score/reasons, rekomendasi Gemini dan shortlist |
| `/app/creator-suites` | Katalog tiga tool dan report/set tersimpan |
| `/app/creator-suites/brand-deal-reports/[id]` | Overview / Videos / Channels / Insight; buat report dari daftar video fixture |
| `/app/creator-suites/channel-reports/[id]` | Overview / Videos / Insight; pilih channel dan periode upload video |
| `/app/creator-suites/channel-profiling/[id]` | Profil beberapa channel, statistik publik dan perbandingan sederhana |
| `/app/hierarchy` | Tree Platform → Organization → MCN → Channel; Admin create/edit lokal dan assign channel; Agency/Creator melihat scope masing-masing |
| `/app/analytics` | KPI statistik publik, top channels/videos dan filter sederhana; tidak ada campaign reporting |
| `/app/account` | Profil demo, switch role, reset dan penjelasan data |

Tidak ada menu Brand atau route registrasi Brand. `register/brand` harus memberikan not found/unsupported-role yang jelas, bukan membuka workspace tersembunyi. Creator tidak membuat/mengubah campaign Agency; Creator memakai Suites dan Analytics untuk channel miliknya. Admin melihat seluruh scope dan mengelola hierarchy; Agency mengelola campaign dan report miliknya.

## 5. Campaign sederhana: brief → creator fit → shortlist

### Alur yang diprioritaskan

1. Agency membuat campaign dengan nama, brand/produk, tujuan, deskripsi target konten, bahasa dan format video.
2. Sistem menampilkan kandidat creator dengan public channel/video metadata dan statistik fixture.
3. Klik **Analyze Creator Fit** untuk meminta Gemini menilai kecocokan terhadap brief.
4. Tampilkan setiap creator dengan **fit score 0–100**, ringkasan alasan, evidence yang dirujuk dan rekomendasi.
5. Agency membuka detail creator lalu menambah/menghapus shortlist; campaign dan hasil analisis tersimpan lokal.

Tidak perlu wizard panjang, forecast investasi, aplikasi creator, launch gate atau lifecycle delivery. Sediakan satu campaign siap analisis dan hasil contoh agar demo cepat dicoba.

### Input dan output Gemini

Input hanya brief serta evidence publik yang tersedia: deskripsi channel, bahasa/format yang memang dicatat, judul/deskripsi video, subscribers, views, likes dan comments. Nilai yang tidak tersedia ditandai missing. Tidak menyimpulkan demografi audiens, pendapatan, atau brand safety terverifikasi dari counter publik.

Kontrak hasil: `{ creatorId, fitScore: number | null, summary, reasons: string[], evidenceIds: string[], recommendation, limitations: string[] }`. Score wajib 0–100 bila ada evidence cukup; nilai null berarti insufficient evidence. Creator/video ID hasil harus berasal dari input. UI menampilkan label **AI-estimated fit**, bukan klaim skor YouTube atau keputusan terverifikasi.

Rubrik prompt dibuat sederhana: relevansi topik terhadap brief, kesesuaian bahasa/format dan bukti konten/performa publik. Tidak perlu formula ROI atau model prediksi. Gemini menjelaskan alasan skornya; output divalidasi, bukan diterima sebagai HTML bebas. Ranking mengurutkan score valid, sedangkan missing-score tetap terlihat sebagai insufficient evidence.

Edit brief atau perubahan evidence menandai hasil lama sebagai stale; user harus Analyze lagi untuk rekomendasi terbaru. Request gagal tidak menghapus hasil terakhir; beri label hasil sebelumnya dan tombol retry. Jangan mengubah fixture/peringkat menjadi hasil live apabila inference belum berjalan.

## 6. Creator Suites sebagai fitur unggulan

Referensi existing: `feature_brand_deal_reports.md`, `feature_channel_reports.md`, `feature_channel_profiling.md`, dan `feature_ai_insight_generation.md` di docs BE. Brand Deal Reports dan Channel Report memang mendukung Executive serta Comments Insight dengan Gemini. Channel Profiling tidak diasumsikan punya fitur Gemini existing.

| Tool | Scope utama prototype | Peran Gemini |
| --- | --- | --- |
| **YouTube Brand Deal Reports** | Nama report/brand, pilih 3–5 video fixture, preview publik views/likes/comments, per-video/channel breakdown, CSV | Generate **Executive Insight**: ringkasan hasil report, pola konten dan rekomendasi berbasis evidence |
| **YouTube Channel Report** | Pilih channel dan bulan/tahun, tampilkan video fixture yang dipublikasikan pada periode itu; counter tetap cumulative | Generate **Executive Insight** channel: kekuatan konten, pola yang terlihat dan saran berikutnya |
| **YouTube Channel Profiling** | Buat set channel, tambah/hapus channel fixture, tampilkan profil dan public-stat comparison | Tidak diberi badge Gemini jika hanya menampilkan data; tidak mengarang audience insight |

P0: ketiga tool terlihat dan berfungsi dengan fixture; Executive Insight Gemini untuk dua report tools. **Comments Insight P1** memakai komentar sintetis/fixture yang jelas sumbernya; jangan mengklaim sentiment analysis dari angka commentCount saja.

Semua tool memiliki loading, completed, failed/retry dan saved result. Insight generation dilakukan atas tindakan pengguna, bukan otomatis pada setiap membuka halaman. Attempt baru menambah history sederhana dengan timestamp, mode sample/live, model bila live, dan evidence revision. Report berubah membuat insight sebelumnya stale.

CSV lokal cukup untuk P0. PDF/XLSX/Google Sheets, public report sharing, background job queue dan raw comment fetch tidak perlu dibangun untuk demo ini. Demo dapat membuka saved report di browser/origin yang sama tanpa menjanjikan cross-device sharing.

## 7. Analytics publik YouTube dan data demo

### Analytics berdiri sendiri

Analytics berisi public YouTube channel/video statistics; tidak membaca campaign, shortlist, fit score atau performa campaign. Shared IDs hanya menghubungkan channel ke hierarchy dan tool reports.

P0 cukup:

- Channel cards: subscribers (nullable/hidden), lifetime total views dan public video count.
- Table top channels, filter organisasi/MCN/channel, search dan sort.
- Video table: title, publishedAt, views, likes dan comments jika tersedia.
- Chart sederhana per-channel views atau top-video comparison; tidak memerlukan daily time series.
- Filter tanggal berarti **tanggal publikasi video**, bukan views/likes yang terjadi dalam periode tersebut. Label counter sebagai cumulative/lifetime sesuai definisinya.

Jangan menambahkan watch time, audience demographics, revenue, CTR atau retention yang membutuhkan data privat. [YouTube channels resource](https://developers.google.com/youtube/data/reference/rest/v3/channels) menjelaskan public statistics dan subscriber count yang dibulatkan; [YouTube Analytics authorization](https://developers.google.com/youtube/reporting/guides/registering_an_application) membutuhkan OAuth. Karena itu istilah “public analytics” pada demo ini merujuk statistik publik, bukan akses anonim ke YouTube Analytics API privat.

### Fixture dan state sederhana

Seed usulan: 2 organisasi, 3 MCN, 8 channel/creator, 12–20 video, 2 campaign brief, 2 saved reports dan satu profiling set. Tidak perlu seed aplikasi, submissions, transactions atau daily campaign metrics.

- Statistik dan metadata sintetis menyerupai bentuk public YouTube data, dengan badge **Demo data**; tidak diklaim fetched/live YouTube.
- Seed yang sama dipakai Discovery, Analytics dan Suites; ubah shortlist tidak mengubah statistik YouTube.
- `DemoRole = 'admin' | 'agency' | 'creator'`; session per tab di sessionStorage.
- Business state versi 1 di localStorage: organizations, networks, channels, videos, campaigns, shortlists, reports, profilingSets dan insightAttempts. Key baru `atlas-nexus-competition-demo-v1`.
- Core selectors memisahkan `selectPublicAnalytics(state, session, filters)` dari `selectCampaignMatches(state, session, campaignId)` dan report evidence.
- Setiap entity punya ID serta scope/owner yang jelas. Creator report/channel hanya miliknya, Agency scope organisasinya, Admin seluruh platform. Discovery Agency boleh melihat public profiles lintas network; hal itu tidak memindahkan kepemilikan channel.
- Persistensi hasil dan role di browser adalah simulasi UX, bukan autentikasi server. Tidak ada data privat yang mengandalkan guard ini.
- Reset mengembalikan fixtures tanpa menghapus storage aplikasi lain. Storage rusak menawarkan reset; storage unavailable memberi memory fallback. Event storage memperbarui tab lain; tidak menjanjikan database realtime.

### Gemini tanpa koneksi BE produksi

**Usulan arsitektur:** business data tetap mock, tetapi inference Gemini berjalan melalui Nitro server endpoint pada Nuxt yang sama. Ini membutuhkan server runtime tipis; tidak membutuhkan FastAPI/database/auth produksi. Jika “tanpa backend” berarti sama sekali tidak boleh ada server code, hanya sample insight yang mungkin diberikan dan belum boleh diklaim sebagai live Gemini.

Sediakan dua endpoint terfokus:

- `POST /api/ai/creator-fit` — brief dan evidence fixture tervalidasi → score, alasan serta rekomendasi.
- `POST /api/ai/report-insight` — report type dan evidence fixture tervalidasi → Executive Insight terstruktur.

Gunakan credential server-only, bukan `runtimeConfig.public`; pilih Gemini model yang tersedia dan verifikasi saat implementasi, tidak mengandalkan nama model dari dokumen lama. Input hanya evidence yang dibatasi ukurannya, maksimal 8 creator atau 20 video; timeout 30 detik, output token dibatasi dan JSON schema divalidasi. User tidak dapat menentukan endpoint provider, arbitrary URL, model, atau system prompt dari browser.

Public endpoint tidak aman hanya karena memiliki sessionStorage. Batasi concurrency dan request rate server-side, provider quota serta budget; untuk prototype kecil batasi Cloud Run max instances 1 agar limiter in-process konsisten, sementara provider quota menjadi batas tambahan. Akui limiter di-reset ketika instance restart. Jika butuh scale, gunakan limiter terpusat sebelum menaikkan instance count. Jangan membuat endpoint proxy Gemini terbuka tanpa validasi/batas.

Mode `sample` tetap tersedia untuk lokal/no credential dan saat error, dengan label sample yang eksplisit. Aplikasi hanya memakai badge **Generated with Gemini** untuk response inference yang benar-benar sukses. Metrik numerik report berasal dari fixture, bukan angka karangan model. Bukti live AI untuk submission berasal dari matching dan dua Creator Suite report tools.

## 8. Struktur target

```text
<prototype-repo>/
  package.json, package-lock.json, nuxt.config.ts, app.vue
  layouts/marketing.vue, workspace.vue
  pages/index.vue, get-started.vue, login.vue
  pages/register/[role].vue
  pages/app/home.vue, hierarchy.vue, analytics.vue, account.vue
  pages/app/campaigns/index.vue, [id].vue
  pages/app/creator-suites/index.vue
  pages/app/creator-suites/brand-deal-reports/[id].vue
  pages/app/creator-suites/channel-reports/[id].vue
  pages/app/creator-suites/channel-profiling/[id].vue
  components/shell/, campaigns/, creator-suites/, hierarchy/, analytics/
  demo/types.ts, seed.ts, storage.ts, selectors.ts
  stores/demo.ts, session.ts
  middleware/demo-auth.ts
  server/api/ai/creator-fit.post.ts, report-insight.post.ts
  server/utils/gemini.ts, ai-validation.ts, ai-limits.ts
  assets/css/main.css
  public/demo/
  tests/unit/demo.test.ts, ai-contracts.test.ts
  tests/e2e/demo-journey.spec.ts
  Dockerfile, .dockerignore, .gitignore, .env.example
  docs/architecture.md, demo-script.md, submission-checklist.md, provenance.md
  README.md
```

Tetap gunakan komponen kecil, visual tokens yang konsisten dan dependency minimum. Tidak memerlukan Nginx untuk arsitektur Nitro ini. Jangan membuat `generate`/static deployment sambil mengharapkan server endpoint Gemini tersedia.

## 9. Tahapan implementasi

### Task 0 — Persiapan submission dan akses

- [ ] Catat status produk internal, waktu awal pengerjaan, kontribusi baru, hak penggunaan kode/aset dan ketentuan eligibility yang berlaku. Klarifikasi organizer bila belum jelas sebelum menyatakan submission eligible.
- [ ] Konfirmasi deadline/timezone, tema, public repo, GCP project demo, budget dan credential Gemini server-side. Jangan menaruh credential di dokumen/repo.
- [ ] Pilih mode live Gemini untuk submission; jika akses belum tersedia, sample mode tetap memungkinkan pekerjaan UI tetapi bukan bukti runtime AI.

**Deliverable:** `docs/submission-checklist.md`, `docs/provenance.md`, dan daftar konfigurasi tanpa nilai secret.

### Task 1 — Nuxt shell, onboarding dan deploy awal

- [ ] Scaffold Nuxt 3 minimal di repo target, Node 22, Pinia, lockfile dan script `dev`, `build`, `test:unit`, `test:e2e`.
- [ ] Bangun homepage, get started Creator/Agency, register lokal, login Admin/Agency/Creator, shell dan reset. Role Brand tidak tersedia.
- [ ] Implementasikan seed, storage, scope selectors dan guards sederhana. Jangan impor auth/API/GTM produksi.
- [ ] Buat Docker multi-stage dengan `npm ci` dan `npm run build`, runtime `node .output/server/index.mjs`, listen `0.0.0.0:$PORT`.
- [ ] Deploy pertama ke Cloud Run lebih awal; cek homepage, login dan refresh direct route.

**Deliverable:** URL demo publik dan shell yang dapat dipakai tanpa akun asli.

### Task 2 — Campaign creator matching dan Gemini

- [ ] Buat campaign list/brief form, candidate cards, detail creator dan shortlist dari public-stat fixtures.
- [ ] Implementasikan Gemini adapter server-only, input/output validation, timeout dan limits; hubungkan endpoint creator-fit.
- [ ] Tampilkan score 0–100/null, summary, evidence dan recommendation; edit brief membuat hasil stale.
- [ ] Verifikasi missing evidence tidak menjadi score palsu, foreign creator ID ditolak, invalid score tidak ditampilkan, retry mempertahankan hasil terakhir dan sample tidak diberi badge live.

**Deliverable:** satu perjalanan brief → Analyze Fit → alasan/rekomendasi → shortlist yang tersimpan.

### Task 3 — Creator Suites dan report insight

- [ ] Bangun katalog, saved reports, Brand Deal Reports, Channel Report dan Channel Profiling.
- [ ] Buat report dari video/channel fixture; deduplikasi video ID dan hitung summary deterministik.
- [ ] Hubungkan Executive Insight Gemini pada dua report tools, saved history, stale flag, loading/error/retry dan CSV. Profiling menampilkan comparison tanpa badge AI palsu.
- [ ] Verifikasi evidence report sesuai owner/scope dan insight mengutip data report yang dipilih. Month/year hanya memilih upload cohort; tidak mengubah lifetime counter menjadi period-performance.

**Deliverable:** tiga tool dapat dicoba; dua tool menghasilkan Executive Insight live bila credential aktif.

### Task 4 — Hierarchy dan Analytics publik sederhana

- [ ] Bangun hierarchy tree; Admin create/edit org/MCN dan assign channel, Agency/Creator scoped read-only.
- [ ] Bangun public-stat KPI dan comparison/table; filter org/MCN/channel, publication date, search/sort dan CSV.
- [ ] Verifikasi hierarchy parent valid, hidden subscriber tampil unavailable, zero views tidak menyebabkan pembagian nol, dan counter CSV sama dengan tabel.
- [ ] Verifikasi campaign/shortlist/fit score tidak mengubah hasil Analytics; dashboard memperlihatkan ringkasan masing-masing modul secara terpisah.

**Deliverable:** network/channel bisa ditelusuri, Analytics sederhana tanpa campaign dependency.

### Task 5 — QA dan paket submission

- [ ] Unit checks: role/scope, reset, duplicate report video, public-counter aggregation dan Gemini response contract. Browser flow: Agency campaign matching → shortlist → Creator Suite report → insight; cek Creator/Admin secara ringkas.
- [ ] Cek refresh route dinamis, unknown ID, dua tab role berbeda, storage recovery, keyboard dan tampilan layar sempit. Tidak perlu suite operasional campaign lama.
- [ ] Review source/history untuk credential/data internal/aset yang tidak boleh dipublikasikan. Exclude legacy reference dan dokumen internal dari build context/runtime; publikasi repo tetap perlu review terpisah karena .dockerignore tidak menghapus file dari GitHub.
- [ ] Tulis README Inggris, architecture, demo instructions, data/AI limitations dan bukti peran Gemini. Rekam video kurang dari tiga menit dan buat deck PDF.
- [ ] Catat commit SHA, Cloud Run revision, serta URL live/repo/video/deck; verifikasi incognito sebelum submission.

**Deliverable:** prototype reviewable dan submission package dengan klaim data/AI yang akurat.

## 10. Deployment Cloud Run

Default: **Nuxt client UI + Nitro AI endpoints dalam satu container Node**, tanpa database atau koneksi backend produksi. Business state tetap di browser. Cloud Build membangun image Linux sehingga tidak terpengaruh arsitektur Mac M1.

1. Pilih project demo milik tim, billing/credits dan region usulan `asia-southeast1`; aktifkan Cloud Run, Cloud Build dan Artifact Registry.
2. Konfigurasi Gemini server-side menggunakan provider credential dari Secret Manager atau workload identity/ADC sesuai provider yang dipilih; jangan memasukkan `.env` atau secret ke image. Runtime service account berizin minimum.
3. Build dengan `npm run build`, bukan `generate`. Ikuti [Nuxt deployment](https://nuxt.com/docs/3.x/getting-started/deployment) dan [Cloud Run container contract](https://cloud.google.com/run/docs/container-contract).
4. Titik awal: CPU 1, memory 512 MiB, min instances 0/max 1, request-based billing; sesuaikan setelah pengukuran. Aktifkan public invocation agar juri tidak membutuhkan IAM login.
5. Gunakan URL `run.app`; custom domain dan CI/CD otomatis bukan blocker. Verifikasi credential sudah terpasang sebelum merekam badge live Gemini.
6. Uji deep links, report results, schema validation, error Gemini, AI request limits dan sample fallback. Jangan log credential atau raw free-form prompt sensitif.
7. Set budget/alerts serta provider quota. Alert biaya sendiri bukan pembatas belanja. Catat biaya build/image/inference dan kebijakan menjaga layanan selama evaluation; jangan menjanjikan gratis.

Contoh deploy dari source setelah Dockerfile dan konfigurasi server siap, belum dijalankan pada tahap plan:

```sh
gcloud run deploy atlas-nexus-demo \
  --source . \
  --project YOUR_DEMO_PROJECT_ID \
  --region asia-southeast1 \
  --port 8080 \
  --cpu 1 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 1 \
  --no-invoker-iam-check
```

Perintah di atas belum memasang secret/provider settings; tambahkan konfigurasi server-only yang dipilih pada implementasi, tanpa mencetak nilai credential. Source deploy dijelaskan pada [Cloud Run source deployment](https://cloud.google.com/run/docs/deploying-source-code) dan akses publik pada [Cloud Run public access](https://cloud.google.com/run/docs/authenticating/public).

## 11. Prioritas, estimasi dan cerita demo

| Paket | Perkiraan jam kerja efektif |
| --- | --- |
| Shell, fixture, onboarding dan deploy awal | 3–5 jam |
| Campaign matching dan adapter Gemini | 3–5 jam |
| Tiga Creator Suites, Executive Insight dan CSV | 4–6 jam |
| Hierarchy dan Analytics sederhana | 2–3 jam |
| QA, README, deck dan video | 3–4 jam |

Total perkiraan **15–23 jam**, tidak termasuk menunggu akses cloud/organizer. Scope suite/AI bertambah tetapi campaign dan analytics jauh lebih sederhana. Angka ini estimasi, bukan janji selesai sebelum deadline.

Jika waktu sempit, tetap pertahankan campaign matching, Executive Insight Brand Deal Reports, homepage/login dan deployment. Channel Report dapat memakai pola report UI yang sama dengan dataset/konfigurasi tersendiri; Channel Profiling cukup list dan public-stat comparison. Comments Insight, PDF/XLSX/Sheets, sharing, advanced hierarchy editing dan custom domain menjadi P1. Jangan mengaktifkan menu yang sama sekali belum punya hasil demo.

Target video 2:45:

- 0:00–0:20 — masalah creator partnership, homepage dan masuk Agency demo.
- 0:20–1:15 — campaign brief → public evidence → Gemini fit score, alasan dan shortlist.
- 1:15–2:15 — Creator Suites: Brand Deal Report → Generate Executive Insight; tunjukkan Channel Report dan Profiling secara singkat.
- 2:15–2:35 — hierarchy dan Analytics publik, tanpa mencampur hasil campaign.
- 2:35–2:45 — arsitektur Nuxt/Google Cloud/Gemini, data fixture dan next steps.

## 12. Acceptance dan langkah sesudah review

- [ ] Nuxt berjalan dari fresh clone dan lockfile, URL publik Cloud Run bekerja tanpa akun asli.
- [ ] Tidak ada role/registration/workspace Brand; nama brand dalam campaign/report tetap data domain.
- [ ] Campaign cukup brief, public-evidence creator matching, Gemini fit score/reasons/recommendations dan shortlist.
- [ ] Tiga Creator Suites dapat dicoba, dengan Executive Insight Gemini pada Brand Deal Reports dan Channel Report.
- [ ] Live inference, sample insight, stale result dan insufficient evidence dapat dibedakan jelas.
- [ ] Analytics hanya public-stat fixtures, terpisah dari campaign, dan tidak mengklaim data privat atau period-performance dari lifetime counters.
- [ ] Hierarchy, scope role, reset, deep link, saved results dan CSV bekerja konsisten.
- [ ] Secret hanya server-side; request validation/rate/concurrency/provider quota tersedia sebelum endpoint AI dipublikasikan.
- [ ] Tidak ada request produksi atau claim live YouTube; inference Gemini nyata hanya memproses fixture yang dibatasi.
- [ ] Status live-internal, asal kode/aset dan eligibility dicatat akurat; repo publik, video <3 menit, deck dan deadline dashboard diperiksa.
- [x] Legacy `docs/prototype/` dihapus setelah dipastikan tidak dipakai aplikasi Nuxt atau proses build.

## 13. Status implementasi yang sudah dikerjakan

- Nuxt prototype memakai mock data lokal dan tetap terpisah dari backend produksi.
- Marketing homepage, demo role entry, dashboard dengan shell/sidebar Atlas FE, campaign matching, shortlist, Creator Suites, hierarchy, public YouTube analytics, account/reset, dan laporan insight tersedia dalam demo.
- Gemini dipanggil dari endpoint Nitro server-side. Tanpa credential, hasil sample dipakai untuk preview lokal; hasil dan keterbatasannya diberi label.
- README, panduan arsitektur, demo script, provenance, submission checklist, container recipe, dan contoh environment lokal sudah ditambahkan.
- Legacy `docs/prototype/` telah dihapus; provenance seed aktual dicatat di `docs/provenance.md`.
- Unit suite: 14/14 lulus. Nuxt production build lulus dengan `GEMINI_API_KEY` dikosongkan agar build artifact lokal tidak menyimpan credential. Alur browser campaign fit/shortlist dan report insight juga diperiksa.
- Belum dilakukan deployment, push, commit, publikasi repo, video, deck, atau submission. Langkah tersebut perlu keputusan dan verifikasi terpisah.

Sebelum publikasi, lakukan review file repository dan source history, verifikasi dependency advisories, konfirmasi kelayakan kompetisi, siapkan credential Gemini melalui secret manager, lalu deploy setelah target Cloud Run disepakati.
