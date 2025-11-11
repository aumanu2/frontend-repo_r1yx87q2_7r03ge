import { useEffect, useMemo, useState } from 'react'

function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [stats, setStats] = useState({ total_links: 0, total_clicks: 0 })
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    title: '',
    url: '',
    code: '',
    platform: '',
    commission_rate: '',
    tags: '',
    image: ''
  })

  const notify = (msg, timeout = 2500) => {
    setMessage(msg)
    if (timeout) setTimeout(() => setMessage(''), timeout)
  }

  const loadData = async () => {
    try {
      const [s, l] = await Promise.all([
        fetch(`${baseUrl}/api/stats`).then(r => r.json()),
        fetch(`${baseUrl}/api/links`).then(r => r.json())
      ])
      setStats(s)
      setLinks(Array.isArray(l) ? l : [])
    } catch (e) {
      notify(`Gagal memuat data: ${e.message}`)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        title: form.title.trim(),
        url: form.url.trim(),
        code: form.code.trim(),
        platform: form.platform.trim() || undefined,
        commission_rate: form.commission_rate ? Number(form.commission_rate) : undefined,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        image: form.image?.trim() || undefined,
      }
      const res = await fetch(`${baseUrl}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || `Error ${res.status}`)
      }
      await loadData()
      setForm({ title: '', url: '', code: '', platform: '', commission_rate: '', tags: '', image: '' })
      notify('Link berhasil dibuat ✅')
    } catch (e) {
      notify(`Gagal membuat link: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const redirectUrl = (code) => `${baseUrl}/r/${code}`

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); notify('Tersalin ke clipboard 📋') } catch { notify('Gagal menyalin') }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-sky-50">
      <header className="sticky top-0 bg-white/70 backdrop-blur border-b border-slate-200 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Asisten Affiliate</h1>
          <div className="text-sm text-slate-600">Backend: {baseUrl}</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-2">
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Buat Link Affiliate</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Judul</label>
              <input name="title" value={form.title} onChange={handleChange} required className="mt-1 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">URL Tujuan (mis. Lynk.id/merchant)</label>
              <input name="url" type="url" value={form.url} onChange={handleChange} required className="mt-1 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Kode Singkat</label>
                <input name="code" value={form.code} onChange={handleChange} placeholder="contoh: promo-ramadhan" required className="mt-1 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Platform</label>
                <input name="platform" value={form.platform} onChange={handleChange} placeholder="IG / TikTok / YouTube" className="mt-1 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Komisi (%)</label>
                <input name="commission_rate" type="number" min="0" max="100" step="0.1" value={form.commission_rate} onChange={handleChange} className="mt-1 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Tags (pisahkan dengan koma)</label>
                <input name="tags" value={form.tags} onChange={handleChange} placeholder="fashion, skincare" className="mt-1 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Gambar (opsional)</label>
              <input name="image" value={form.image} onChange={handleChange} placeholder="https://...jpg" className="mt-1 w-full rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button disabled={loading} className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60">
              {loading ? 'Menyimpan...' : 'Simpan Link'}
            </button>
            {message && <p className="text-center text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-2">{message}</p>}
          </form>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Statistik</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
              <div className="text-sm text-slate-600">Total Link</div>
              <div className="text-3xl font-bold text-indigo-700">{stats.total_links}</div>
            </div>
            <div className="p-4 rounded-lg bg-sky-50 border border-sky-100">
              <div className="text-sm text-slate-600">Total Klik</div>
              <div className="text-3xl font-bold text-sky-700">{stats.total_clicks}</div>
            </div>
          </div>
          <button onClick={loadData} className="mt-4 w-full py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800">Refresh</button>
        </section>

        <section className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Daftar Link</h2>
          {links.length === 0 ? (
            <p className="text-slate-600">Belum ada link. Tambahkan dari form di atas.</p>
          ) : (
            <ul className="divide-y">
              {links.map((l) => (
                <li key={l._id} className="py-4 flex items-start gap-4">
                  {l.image ? (
                    <img src={l.image} alt={l.title} className="w-16 h-16 object-cover rounded-lg border" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border grid place-items-center text-slate-400">IMG</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold text-slate-800 truncate">{l.title}</h3>
                      {l.platform && <span className="text-xs px-2 py-1 rounded bg-slate-100 border text-slate-700">{l.platform}</span>}
                    </div>
                    <p className="text-sm text-slate-600 truncate">{l.url}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono bg-slate-100 border px-2 py-1 rounded">/{l.code}</span>
                      {Array.isArray(l.tags) && l.tags.map((t, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">#{t}</span>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={l.url} target="_blank" rel="noreferrer" className="text-sm px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 border">Buka Tujuan</a>
                      <a href={redirectUrl(l.code)} target="_blank" rel="noreferrer" className="text-sm px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700">Tes Redirect</a>
                      <button onClick={() => copy(redirectUrl(l.code))} className="text-sm px-3 py-1.5 rounded bg-slate-900 text-white hover:bg-slate-800">Salin Link Redirect</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-8 text-center text-sm text-slate-500">
        Bangun aset affiliate: buat link, sebarkan di konten, dan pantau klik. Terintegrasi untuk skema Lynk.id via redirect backend.
      </footer>
    </div>
  )
}

export default App
