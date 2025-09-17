import { useEffect, useState } from 'react'
import api from '../api'
import InputWithIcon from '../components/InputWithIcon.jsx'
import { useToast } from '../components/Toast.jsx'

export default function Weather() {
  const toast = useToast()
  const [city, setCity] = useState('')
  const [data, setData] = useState(null)
  const [favs, setFavs] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [favsLoading, setFavsLoading] = useState(false)
  const [favsError, setFavsError] = useState('')
  const [backendInfo, setBackendInfo] = useState({ ok: false, message: '' })

  const loadFavs = async () => {
    setFavsError('')
    setFavsLoading(true)
    try {
      const { data } = await api.get('/favorites')
      setFavs(data)
      setBackendInfo({ ok: true, message: 'API online' })
    } catch (e) {
      const err = e.response?.data?.error
      const msg = typeof err === 'string' ? err : (err?.message || e.message || 'Failed to load favorites')
      setFavsError(msg)
      setBackendInfo({ ok: false, message: 'API unreachable or error' })
      toast.error(msg)
    } finally {
      setFavsLoading(false)
    }
  }

  useEffect(() => {
    loadFavs()
  }, [])

  const search = async (e) => {
    e?.preventDefault?.()
    setError('')
    if (!city.trim()) return
    try {
      setLoading(true)
      const res = await api.get('/weather', { params: { q: city } })
      setData(res.data)
    } catch (e) {
      const err = e.response?.data?.error
      const msg = typeof err === 'string' ? err : (err?.message || e.message || 'Search failed')
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const addFav = async () => {
    if (!data) return
    const payload = {
      name: data.name,
      country: data.sys?.country,
      lat: data.coord?.lat,
      lon: data.coord?.lon
    }
    try {
      const { data: created } = await api.post('/favorites', payload)
      setFavs([created, ...favs])
      toast.success('Added to favorites')
    } catch (e) {
      const status = e.response?.status
      if (status !== 409) {
        const err = e.response?.data?.error
        const msg = typeof err === 'string' ? err : (err?.message || e.message || 'Failed to add favorite')
        setFavsError(msg)
        toast.error(msg)
      }
    }
  }

  const removeFav = async (id) => {
    try {
      await api.delete(`/favorites/${id}`)
      setFavs(favs.filter(f => f._id !== id))
    } catch (e) {
      const err = e.response?.data?.error
      const msg = typeof err === 'string' ? err : (err?.message || e.message || 'Failed to remove favorite')
      setFavsError(msg)
      toast.error(msg)
    }
  }

  const selectFav = (f) => {
    setCity(f.name)
    setTimeout(() => search(), 0)
  }

  return (
    <div className="grid" style={{ gap: 14 }}>
      {backendInfo.message && (
        <div className="muted">{backendInfo.message}</div>
      )}
      <h2 className="ui"><i className="uil uil-cloud-sun"/> Weather</h2>
      <form onSubmit={search} className="row card">
        <InputWithIcon icon="uil-search" placeholder="City name" value={city} onChange={e => setCity(e.target.value)} className="grow" />
        <button disabled={loading} className="ui"><i className="uil uil-search"/> {loading ? 'Searching…' : 'Search'}</button>
        {data && <button type="button" onClick={addFav} disabled={loading || favsLoading} className="ghost ui"><i className="uil uil-star"/> Favorite</button>}
      </form>
      {error && <div className="error ui"><i className="uil uil-exclamation-triangle"/> {error}</div>}
      {data && (
        <div className="card">
          <h3 className="ui"><i className="uil uil-location-point"/> {data.name}, {data.sys?.country}</h3>
          <div className="row" style={{ gap: 20, flexWrap: 'wrap' }}>
            <div className="ui"><i className="uil uil-thermometer"/> Temp: {data.main?.temp} °C</div>
            <div className="ui"><i className="uil uil-cloud"/> {data.weather?.[0]?.description}</div>
            <div className="ui"><i className="uil uil-raindrops-alt"/> Humidity: {data.main?.humidity}%</div>
            <div className="ui"><i className="uil uil-wind"/> Wind: {data.wind?.speed} m/s</div>
          </div>
        </div>
      )}
      <div className="row">
        <h3 className="ui"><i className="uil uil-star"/> Favorites</h3>
        <button type="button" onClick={loadFavs} disabled={favsLoading} className="ghost ui right">
          <i className="uil uil-refresh"/> {favsLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {favsError && <div className="error ui"><i className="uil uil-exclamation-triangle"/> {favsError}</div>}
      <ul className="clean">
        {favs.map(f => (
          <li key={f._id} className="item">
            <button onClick={() => selectFav(f)} className="ui grow" style={{ textAlign: 'left' }}>
              <i className="uil uil-location-point"/> {f.name}{f.country ? `, ${f.country}` : ''}
            </button>
            <button onClick={() => removeFav(f._id)} disabled={favsLoading} className="ghost ui"><i className="uil uil-times"/> Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
