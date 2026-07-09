import { useEffect, useState } from 'react';
import DashboardLayout from './components/DashboardLayout.jsx';
import { serviceById } from './config/product.js';
import { fetchIndicadores, fetchMapa, fetchRegioes } from './services/dadosApi.js';
import { makeMockResult } from './utils/data.js';

export default function App() {
  const [serviceId, setServiceId] = useState('formacoes');
  const [query, setQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [result, setResult] = useState(() => makeMockResult('formacoes'));
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [catalog, setCatalog] = useState({ regioes: [], indicadores: [] });
  const [mapRegions, setMapRegions] = useState([]);
  const [catalogStatus, setCatalogStatus] = useState('idle');
  const [idioma, setIdioma] = useState('pt');
  const service = serviceById(serviceId);

  useEffect(() => {
    let active = true;
    setCatalogStatus('loading');

    Promise.all([fetchRegioes(), fetchIndicadores()])
      .then(([regioes, indicadores]) => {
        if (!active) return;
        setCatalog({
          regioes: Array.isArray(regioes) ? regioes : [],
          indicadores: Array.isArray(indicadores) ? indicadores : [],
        });
        setCatalogStatus('success');
      })
      .catch(() => {
        if (!active) return;
        setCatalogStatus('error');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setResult(makeMockResult(serviceId));
    setSelectedRegion('');
    setStatus('idle');
    setError('');
  }, [serviceId]);

  useEffect(() => {
    let active = true;

    fetchMapa({ serviceId, indicador: service.backendIndicator })
      .then((regions) => {
        if (active) setMapRegions(regions);
      })
      .catch(() => {
        if (active) setMapRegions([]);
      });

    return () => {
      active = false;
    };
  }, [serviceId, service.backendIndicator]);

  return (
    <DashboardLayout
      service={service}
      serviceId={serviceId}
      setServiceId={setServiceId}
      query={query}
      setQuery={setQuery}
      selectedRegion={selectedRegion}
      setSelectedRegion={setSelectedRegion}
      result={result}
      setResult={setResult}
      status={status}
      setStatus={setStatus}
      error={error}
      setError={setError}
      catalog={catalog}
      catalogStatus={catalogStatus}
      mapRegions={mapRegions}
      idioma={idioma}
      setIdioma={setIdioma}
    />
  );
}
