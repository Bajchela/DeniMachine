'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase';

type Language = 'sr' | 'de';
type Screen = 'main' | 'reports';
type WorkerSort = 'counterDesc' | 'firstLast' | 'lastFirst';
type ProductFilter = 'all' | 'active' | 'zero';
type ProductSort = 'nameAsc' | 'nameDesc' | 'countDesc' | 'countAsc';
type ConfirmAction = 'increase' | 'decrease' | 'deleteProduct' | 'deleteWorker';
type CountMap = Record<string, number>;

type Product = {
  id: number;
  naziv: string;
};

type Worker = {
  id: number;
  ime: string;
  prezime: string;
};

type CountRow = {
  product_id: number;
  worker_id: number;
  counter: number;
};

type PendingConfirm = {
  action: ConfirmAction;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
};

const PAGE_SIZE = 10;

const ui = {
  sr: {
    title: 'Mašine i radnici',
    subtitle: 'Ultra jednostavno za telefon, tablet i računar.',
    products: 'Mašine',
    workers: 'Radnici',
    reports: 'Izveštaji',
    back: 'Nazad',
    selectedMachine: 'Izabrana mašina',
    searchProducts: 'Pretraga mašina',
    searchWorkers: 'Pretraga radnika',
    addMachine: 'Dodaj mašinu',
    editMachine: 'Izmeni mašinu',
    deleteMachine: 'Obriši mašinu',
    addWorker: 'Dodaj radnika',
    editWorker: 'Izmeni radnika',
    deleteWorker: 'Obriši radnika',
    machineName: 'Naziv mašine',
    firstName: 'Ime',
    lastName: 'Prezime',
    save: 'Sačuvaj',
    cancel: 'Otkaži',
    noProducts: 'Nema mašina. Dodaj prvu mašinu.',
    noWorkers: 'Nema radnika. Dodaj prvog radnika.',
    chooseMachine: 'Izaberi mašinu da vidiš radnike.',
    counter: 'Brojač',
    plus: '+',
    minus: '-',
    sortWorkers: 'Sortiranje radnika',
    sortProducts: 'Sortiranje mašina',
    filterMachines: 'Filter mašina',
    filterAll: 'Sve mašine',
    filterActive: 'Samo sa brojačem',
    filterZero: 'Bez brojača',
    sortCounterDesc: 'Najveći brojač',
    sortFirstLast: 'Ime Prezime',
    sortLastFirst: 'Prezime Ime',
    sortNameAsc: 'Naziv A-Z',
    sortNameDesc: 'Naziv Z-A',
    sortCountDesc: 'Najviše rada',
    sortCountAsc: 'Najmanje rada',
    visible10: 'Prikazano prvih 10, ostalo skrolom',
    loading: 'Učitavanje...',
    setupTitle: 'Podesi Supabase',
    confirmIncreaseTitle: 'Potvrda povećanja',
    confirmIncrease: 'Da li ste sigurni da želite da povećate brojač?',
    confirmDecreaseTitle: 'Potvrda smanjenja',
    confirmDecrease: 'Da li ste sigurni da želite da smanjite brojač?',
    confirmDeleteMachineTitle: 'Brisanje mašine',
    confirmDeleteMachine: 'Da li ste sigurni da želite da obrišete ovu mašinu?',
    confirmDeleteWorkerTitle: 'Brisanje radnika',
    confirmDeleteWorker: 'Da li ste sigurni da želite da obrišete ovog radnika?',
    confirmYes: 'Da',
    summaryWorkersMax: 'Radnik sa najviše rada',
    summaryWorkersMin: 'Radnik sa najmanje rada',
    summaryWorkersAvg: 'Sredina radnika',
    summaryProductsMax: 'Mašina sa najviše rada',
    summaryProductsMin: 'Mašina sa najmanje rada',
    summaryProductsAvg: 'Sredina mašina',
    total: 'Ukupno',
    average: 'Prosek',
    workerMachineMost: 'Najviše na mašini',
    workerMachineLeast: 'Najmanje na mašini',
    productWorkerMost: 'Najviše radio',
    productWorkerLeast: 'Najmanje radio',
    emptyReports: 'Nema dovoljno podataka za izveštaj.',
    dbSaved: 'Podaci se čuvaju u Supabase bazi.',
    errorPrefix: 'Greška',
  },
  de: {
    title: 'Maschinen und Mitarbeiter',
    subtitle: 'Sehr einfach für Handy, Tablet und Computer.',
    products: 'Maschinen',
    workers: 'Mitarbeiter',
    reports: 'Berichte',
    back: 'Zurück',
    selectedMachine: 'Ausgewählte Maschine',
    searchProducts: 'Maschinen suchen',
    searchWorkers: 'Mitarbeiter suchen',
    addMachine: 'Maschine hinzufügen',
    editMachine: 'Maschine bearbeiten',
    deleteMachine: 'Maschine löschen',
    addWorker: 'Mitarbeiter hinzufügen',
    editWorker: 'Mitarbeiter bearbeiten',
    deleteWorker: 'Mitarbeiter löschen',
    machineName: 'Maschinenname',
    firstName: 'Vorname',
    lastName: 'Nachname',
    save: 'Speichern',
    cancel: 'Abbrechen',
    noProducts: 'Keine Maschinen. Füge zuerst eine Maschine hinzu.',
    noWorkers: 'Keine Mitarbeiter. Füge zuerst einen Mitarbeiter hinzu.',
    chooseMachine: 'Wähle eine Maschine aus, um Mitarbeiter zu sehen.',
    counter: 'Zähler',
    plus: '+',
    minus: '-',
    sortWorkers: 'Mitarbeiter sortieren',
    sortProducts: 'Maschinen sortieren',
    filterMachines: 'Maschinenfilter',
    filterAll: 'Alle Maschinen',
    filterActive: 'Nur mit Zähler',
    filterZero: 'Ohne Zähler',
    sortCounterDesc: 'Größter Zähler',
    sortFirstLast: 'Vorname Nachname',
    sortLastFirst: 'Nachname Vorname',
    sortNameAsc: 'Name A-Z',
    sortNameDesc: 'Name Z-A',
    sortCountDesc: 'Meiste Arbeit',
    sortCountAsc: 'Wenigste Arbeit',
    visible10: 'Erste 10 sichtbar, der Rest per Scroll',
    loading: 'Lädt...',
    setupTitle: 'Supabase einrichten',
    confirmIncreaseTitle: 'Erhöhung bestätigen',
    confirmIncrease: 'Möchten Sie den Zähler wirklich erhöhen?',
    confirmDecreaseTitle: 'Verringerung bestätigen',
    confirmDecrease: 'Möchten Sie den Zähler wirklich verringern?',
    confirmDeleteMachineTitle: 'Maschine löschen',
    confirmDeleteMachine: 'Möchten Sie diese Maschine wirklich löschen?',
    confirmDeleteWorkerTitle: 'Mitarbeiter löschen',
    confirmDeleteWorker: 'Möchten Sie diesen Mitarbeiter wirklich löschen?',
    confirmYes: 'Ja',
    summaryWorkersMax: 'Mitarbeiter mit meiste Arbeit',
    summaryWorkersMin: 'Mitarbeiter mit wenigste Arbeit',
    summaryWorkersAvg: 'Mitarbeiter Mitte',
    summaryProductsMax: 'Maschine mit meiste Arbeit',
    summaryProductsMin: 'Maschine mit wenigste Arbeit',
    summaryProductsAvg: 'Maschine Mitte',
    total: 'Gesamt',
    average: 'Durchschnitt',
    workerMachineMost: 'Am meisten auf Maschine',
    workerMachineLeast: 'Am wenigsten auf Maschine',
    productWorkerMost: 'Am meisten gearbeitet',
    productWorkerLeast: 'Am wenigsten gearbeitet',
    emptyReports: 'Nicht genug Daten für den Bericht.',
    dbSaved: 'Daten werden in der Supabase-Datenbank gespeichert.',
    errorPrefix: 'Fehler',
  },
} as const;

function countKey(productId: number, workerId: number) {
  return `${productId}_${workerId}`;
}

function normalize(value: string) {
  return value.toLocaleLowerCase('sr-Latn');
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

function getDisplayWorkerName(worker: Worker, sort: WorkerSort) {
  return sort === 'lastFirst' ? `${worker.prezime} ${worker.ime}` : `${worker.ime} ${worker.prezime}`;
}

export default function ProductWorkersApp() {
  const supabase = getSupabaseBrowserClient();
  const [language, setLanguage] = useState<Language>('sr');
  const [screen, setScreen] = useState<Screen>('main');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [counts, setCounts] = useState<CountMap>({});

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerSort, setWorkerSort] = useState<WorkerSort>('counterDesc');
  const [productSort, setProductSort] = useState<ProductSort>('countDesc');
  const [productFilter, setProductFilter] = useState<ProductFilter>('all');

  const [productName, setProductName] = useState('');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [workerFirstName, setWorkerFirstName] = useState('');
  const [workerLastName, setWorkerLastName] = useState('');
  const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);

  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

  const t = ui[language];

  const refreshAll = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [productsRes, workersRes, countsRes] = await Promise.all([
        supabase.from('products').select('id,naziv').order('naziv', { ascending: true }),
        supabase.from('workers').select('id,ime,prezime').order('ime', { ascending: true }),
        supabase.from('worker_product_counts').select('product_id,worker_id,counter'),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (workersRes.error) throw workersRes.error;
      if (countsRes.error) throw countsRes.error;

      setProducts(productsRes.data ?? []);
      setWorkers(workersRes.data ?? []);

      const nextCounts: CountMap = {};
      for (const row of (countsRes.data ?? []) as CountRow[]) {
        nextCounts[countKey(row.product_id, row.worker_id)] = row.counter;
      }
      setCounts(nextCounts);

      const firstId = (productsRes.data ?? [])[0]?.id ?? null;
      setSelectedProductId((current) => current ?? firstId);
    } catch (err) {
      setError(`${t.errorPrefix}: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProductTotal = (productId: number) => {
    return workers.reduce((sum, worker) => sum + (counts[countKey(productId, worker.id)] ?? 0), 0);
  };

  const getWorkerTotal = (workerId: number) => {
    return products.reduce((sum, product) => sum + (counts[countKey(product.id, workerId)] ?? 0), 0);
  };

  const filteredProducts = useMemo(() => {
    const term = normalize(productSearch.trim());

    const result = products.filter((product) => {
      const total = getProductTotal(product.id);
      const matchesSearch = !term || normalize(product.naziv).includes(term);
      const matchesFilter =
        productFilter === 'all' ||
        (productFilter === 'active' && total > 0) ||
        (productFilter === 'zero' && total === 0);

      return matchesSearch && matchesFilter;
    });

    result.sort((a, b) => {
      if (productSort === 'nameAsc') return a.naziv.localeCompare(b.naziv, 'sr');
      if (productSort === 'nameDesc') return b.naziv.localeCompare(a.naziv, 'sr');
      if (productSort === 'countAsc') return getProductTotal(a.id) - getProductTotal(b.id);
      return getProductTotal(b.id) - getProductTotal(a.id);
    });

    return result;
  }, [products, productSearch, productFilter, productSort, counts, workers]);

  useEffect(() => {
    if (!filteredProducts.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(filteredProducts[0]?.id ?? null);
    }
  }, [filteredProducts, selectedProductId]);

  const selectedProduct = useMemo(() => {
    if (selectedProductId == null) return null;
    return products.find((product) => product.id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

  const visibleWorkers = useMemo(() => {
    if (!selectedProduct) return [];

    const term = normalize(workerSearch.trim());
    const result = workers.filter((worker) => {
      const joined1 = normalize(`${worker.ime} ${worker.prezime}`);
      const joined2 = normalize(`${worker.prezime} ${worker.ime}`);
      return !term || joined1.includes(term) || joined2.includes(term);
    });

    result.sort((a, b) => {
      if (workerSort === 'counterDesc') {
        const aValue = counts[countKey(selectedProduct.id, a.id)] ?? 0;
        const bValue = counts[countKey(selectedProduct.id, b.id)] ?? 0;
        if (bValue !== aValue) return bValue - aValue;
        return `${a.ime} ${a.prezime}`.localeCompare(`${b.ime} ${b.prezime}`, 'sr');
      }

      if (workerSort === 'lastFirst') {
        return `${a.prezime} ${a.ime}`.localeCompare(`${b.prezime} ${b.ime}`, 'sr');
      }

      return `${a.ime} ${a.prezime}`.localeCompare(`${b.ime} ${b.prezime}`, 'sr');
    });

    return result;
  }, [selectedProduct, workers, workerSearch, workerSort, counts]);

  const saveProduct = async () => {
    if (!supabase) return;
    const naziv = productName.trim();
    if (!naziv) return;

    setSaving(true);
    setError('');

    try {
      if (editingProductId) {
        const { error: updateError } = await supabase.from('products').update({ naziv }).eq('id', editingProductId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('products').insert({ naziv });
        if (insertError) throw insertError;
      }

      setProductName('');
      setEditingProductId(null);
      await refreshAll();
    } catch (err) {
      setError(`${t.errorPrefix}: ${getErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const saveWorker = async () => {
    if (!supabase) return;
    const ime = workerFirstName.trim();
    const prezime = workerLastName.trim();
    if (!ime || !prezime) return;

    setSaving(true);
    setError('');

    try {
      if (editingWorkerId) {
        const { error: updateError } = await supabase.from('workers').update({ ime, prezime }).eq('id', editingWorkerId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('workers').insert({ ime, prezime });
        if (insertError) throw insertError;
      }

      setWorkerFirstName('');
      setWorkerLastName('');
      setEditingWorkerId(null);
      await refreshAll();
    } catch (err) {
      setError(`${t.errorPrefix}: ${getErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteProduct = (product: Product) => {
    setPendingConfirm({
      action: 'deleteProduct',
      title: t.confirmDeleteMachineTitle,
      message: t.confirmDeleteMachine,
      confirmLabel: t.confirmYes,
      onConfirm: async () => {
        if (!supabase) return;
        setSaving(true);
        setError('');
        try {
          const { error: deleteError } = await supabase.from('products').delete().eq('id', product.id);
          if (deleteError) throw deleteError;
          if (selectedProductId === product.id) setSelectedProductId(null);
          await refreshAll();
        } catch (err) {
          setError(`${t.errorPrefix}: ${getErrorMessage(err)}`);
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const confirmDeleteWorker = (worker: Worker) => {
    setPendingConfirm({
      action: 'deleteWorker',
      title: t.confirmDeleteWorkerTitle,
      message: t.confirmDeleteWorker,
      confirmLabel: t.confirmYes,
      onConfirm: async () => {
        if (!supabase) return;
        setSaving(true);
        setError('');
        try {
          const { error: deleteError } = await supabase.from('workers').delete().eq('id', worker.id);
          if (deleteError) throw deleteError;
          await refreshAll();
        } catch (err) {
          setError(`${t.errorPrefix}: ${getErrorMessage(err)}`);
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const updateCounter = async (workerId: number, delta: 1 | -1) => {
    if (!supabase || !selectedProduct) return;
    const currentValue = counts[countKey(selectedProduct.id, workerId)] ?? 0;
    const nextValue = Math.max(0, currentValue + delta);

    setPendingConfirm({
      action: delta > 0 ? 'increase' : 'decrease',
      title: delta > 0 ? t.confirmIncreaseTitle : t.confirmDecreaseTitle,
      message: delta > 0 ? t.confirmIncrease : t.confirmDecrease,
      confirmLabel: t.confirmYes,
      onConfirm: async () => {
        setSaving(true);
        setError('');
        try {
          if (nextValue === 0) {
            const { error: deleteError } = await supabase
              .from('worker_product_counts')
              .delete()
              .eq('product_id', selectedProduct.id)
              .eq('worker_id', workerId);
            if (deleteError) throw deleteError;
          } else {
            const { error: upsertError } = await supabase.from('worker_product_counts').upsert(
              {
                product_id: selectedProduct.id,
                worker_id: workerId,
                counter: nextValue,
              },
              { onConflict: 'product_id,worker_id' }
            );
            if (upsertError) throw upsertError;
          }

          setCounts((prev) => ({
            ...prev,
            [countKey(selectedProduct.id, workerId)]: nextValue,
          }));
          await refreshAll();
        } catch (err) {
          setError(`${t.errorPrefix}: ${getErrorMessage(err)}`);
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const workerReportRows = useMemo(() => {
    return workers
      .map((worker) => {
        const totals = products.map((product) => ({
          product,
          value: counts[countKey(product.id, worker.id)] ?? 0,
        }));
        const total = totals.reduce((sum, entry) => sum + entry.value, 0);
        const avg = products.length ? total / products.length : 0;
        const sorted = [...totals].sort((a, b) => b.value - a.value);
        return {
          worker,
          total,
          avg,
          maxProduct: sorted[0] ?? null,
          minProduct: sorted[sorted.length - 1] ?? null,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [workers, products, counts]);

  const productReportRows = useMemo(() => {
    return products
      .map((product) => {
        const totals = workers.map((worker) => ({
          worker,
          value: counts[countKey(product.id, worker.id)] ?? 0,
        }));
        const total = totals.reduce((sum, entry) => sum + entry.value, 0);
        const avg = workers.length ? total / workers.length : 0;
        const sorted = [...totals].sort((a, b) => b.value - a.value);
        return {
          product,
          total,
          avg,
          maxWorker: sorted[0] ?? null,
          minWorker: sorted[sorted.length - 1] ?? null,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [workers, products, counts]);

  const middleWorker = workerReportRows.length ? workerReportRows[Math.floor(workerReportRows.length / 2)] : null;
  const middleProduct = productReportRows.length ? productReportRows[Math.floor(productReportRows.length / 2)] : null;

  return (
    <main className="appShell">
      <div className="topBar">
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="topBarRight">
          <button className={`langBtn ${language === 'sr' ? 'active' : ''}`} onClick={() => setLanguage('sr')} type="button">SR</button>
          <button className={`langBtn ${language === 'de' ? 'active' : ''}`} onClick={() => setLanguage('de')} type="button">DE</button>
          <button className="actionBtn secondary" onClick={() => setScreen(screen === 'main' ? 'reports' : 'main')} type="button">
            {screen === 'main' ? t.reports : t.back}
          </button>
        </div>
      </div>

      {!supabase ? (
        <section className="warningCard">
          <h2>{t.setupTitle}</h2>
          <p>{t.setupText}</p>
        </section>
      ) : null}

      {error ? <div className="errorBox">{error}</div> : null}
      {loading ? <div className="loadingBox">{t.loading}</div> : null}

      {screen === 'main' ? (
        <div className="layoutGrid">
          <section className="card">
            <div className="sectionHeader">
              <div>
                <h2>{t.products}</h2>
                <p>{t.visible10}</p>
              </div>
            </div>

            <div className="compactControls">
              <input className="input" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder={t.searchProducts} />
              <select className="input" value={productFilter} onChange={(e) => setProductFilter(e.target.value as ProductFilter)}>
                <option value="all">{t.filterAll}</option>
                <option value="active">{t.filterActive}</option>
                <option value="zero">{t.filterZero}</option>
              </select>
              <select className="input" value={productSort} onChange={(e) => setProductSort(e.target.value as ProductSort)}>
                <option value="countDesc">{t.sortCountDesc}</option>
                <option value="countAsc">{t.sortCountAsc}</option>
                <option value="nameAsc">{t.sortNameAsc}</option>
                <option value="nameDesc">{t.sortNameDesc}</option>
              </select>
            </div>

            <div className="formCard compactForm">
              <input className="input" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder={t.machineName} />
              <div className="rowBtns">
                <button className="actionBtn" disabled={saving || !productName.trim() || !supabase} onClick={() => void saveProduct()} type="button">
                  {editingProductId ? t.editMachine : t.addMachine}
                </button>
                {editingProductId ? (
                  <button className="actionBtn secondary" onClick={() => { setEditingProductId(null); setProductName(''); }} type="button">
                    {t.cancel}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="scrollList">
              {filteredProducts.length === 0 ? <div className="emptyBox">{t.noProducts}</div> : null}
              {filteredProducts.map((product) => {
                const active = selectedProductId === product.id;
                return (
                  <div className={`listItem ${active ? 'active' : ''}`} key={product.id}>
                    <button className="listItemMain" onClick={() => setSelectedProductId(product.id)} type="button">
                      <span className="listTitle">{product.naziv}</span>
                      <span className="badge">{getProductTotal(product.id)}</span>
                    </button>
                    <div className="itemActions">
                      <button className="miniBtn" onClick={() => { setEditingProductId(product.id); setProductName(product.naziv); }} type="button">✎</button>
                      <button className="miniBtn danger" onClick={() => confirmDeleteProduct(product)} type="button">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card">
            <div className="sectionHeader">
              <div>
                <h2>{t.workers}</h2>
                <p>{selectedProduct ? `${t.selectedMachine}: ${selectedProduct.naziv}` : t.chooseMachine}</p>
              </div>
            </div>

            <div className="compactControls compactControlsShort">
              <input className="input" value={workerSearch} onChange={(e) => setWorkerSearch(e.target.value)} placeholder={t.searchWorkers} />
              <select className="input" value={workerSort} onChange={(e) => setWorkerSort(e.target.value as WorkerSort)}>
                <option value="counterDesc">{t.sortCounterDesc}</option>
                <option value="firstLast">{t.sortFirstLast}</option>
                <option value="lastFirst">{t.sortLastFirst}</option>
              </select>
            </div>

            <div className="formCard compactForm compactFormWorkers">
              <input className="input" value={workerFirstName} onChange={(e) => setWorkerFirstName(e.target.value)} placeholder={t.firstName} />
              <input className="input" value={workerLastName} onChange={(e) => setWorkerLastName(e.target.value)} placeholder={t.lastName} />
              <div className="rowBtns">
                <button className="actionBtn" disabled={saving || !workerFirstName.trim() || !workerLastName.trim() || !supabase} onClick={() => void saveWorker()} type="button">
                  {editingWorkerId ? t.editWorker : t.addWorker}
                </button>
                {editingWorkerId ? (
                  <button className="actionBtn secondary" onClick={() => { setEditingWorkerId(null); setWorkerFirstName(''); setWorkerLastName(''); }} type="button">
                    {t.cancel}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="scrollList">
              {!selectedProduct ? <div className="emptyBox">{t.chooseMachine}</div> : null}
              {selectedProduct && visibleWorkers.length === 0 ? <div className="emptyBox">{t.noWorkers}</div> : null}
              {selectedProduct && visibleWorkers.map((worker) => {
                const currentValue = counts[countKey(selectedProduct.id, worker.id)] ?? 0;
                return (
                  <div className="workerRow" key={worker.id}>
                    <div className="workerMeta">
                      <div className="listTitle">{getDisplayWorkerName(worker, workerSort)}</div>
                      <div className="workerSub">{t.counter}: {currentValue}</div>
                    </div>
                    <div className="counterActions">
                      <button className="counterBtn" onClick={() => void updateCounter(worker.id, -1)} type="button">{t.minus}</button>
                      <span className="counterValue">{currentValue}</span>
                      <button className="counterBtn" onClick={() => void updateCounter(worker.id, 1)} type="button">{t.plus}</button>
                      <button className="miniBtn" onClick={() => { setEditingWorkerId(worker.id); setWorkerFirstName(worker.ime); setWorkerLastName(worker.prezime); }} type="button">✎</button>
                      <button className="miniBtn danger" onClick={() => confirmDeleteWorker(worker)} type="button">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <section className="reportsGrid">
          {workerReportRows.length === 0 || productReportRows.length === 0 ? (
            <div className="emptyBox">{t.emptyReports}</div>
          ) : (
            <>
              <ReportCard
                title={t.summaryWorkersMax}
                lines={workerReportRows[0] ? [
                  `${workerReportRows[0].worker.ime} ${workerReportRows[0].worker.prezime}`,
                  `${t.total}: ${workerReportRows[0].total}`,
                  `${t.average}: ${workerReportRows[0].avg.toFixed(2)}`,
                  `${t.workerMachineMost}: ${workerReportRows[0].maxProduct?.product.naziv ?? '-'}`,
                  `${t.workerMachineLeast}: ${workerReportRows[0].minProduct?.product.naziv ?? '-'}`,
                ] : []}
              />
              <ReportCard
                title={t.summaryWorkersMin}
                lines={workerReportRows[workerReportRows.length - 1] ? [
                  `${workerReportRows[workerReportRows.length - 1].worker.ime} ${workerReportRows[workerReportRows.length - 1].worker.prezime}`,
                  `${t.total}: ${workerReportRows[workerReportRows.length - 1].total}`,
                  `${t.average}: ${workerReportRows[workerReportRows.length - 1].avg.toFixed(2)}`,
                  `${t.workerMachineMost}: ${workerReportRows[workerReportRows.length - 1].maxProduct?.product.naziv ?? '-'}`,
                  `${t.workerMachineLeast}: ${workerReportRows[workerReportRows.length - 1].minProduct?.product.naziv ?? '-'}`,
                ] : []}
              />
              <ReportCard
                title={t.summaryWorkersAvg}
                lines={middleWorker ? [
                  `${middleWorker.worker.ime} ${middleWorker.worker.prezime}`,
                  `${t.total}: ${middleWorker.total}`,
                  `${t.average}: ${middleWorker.avg.toFixed(2)}`,
                  `${t.workerMachineMost}: ${middleWorker.maxProduct?.product.naziv ?? '-'}`,
                  `${t.workerMachineLeast}: ${middleWorker.minProduct?.product.naziv ?? '-'}`,
                ] : []}
              />
              <ReportCard
                title={t.summaryProductsMax}
                lines={productReportRows[0] ? [
                  `${productReportRows[0].product.naziv}`,
                  `${t.total}: ${productReportRows[0].total}`,
                  `${t.average}: ${productReportRows[0].avg.toFixed(2)}`,
                  `${t.productWorkerMost}: ${productReportRows[0].maxWorker ? `${productReportRows[0].maxWorker.worker.ime} ${productReportRows[0].maxWorker.worker.prezime}` : '-'}`,
                  `${t.productWorkerLeast}: ${productReportRows[0].minWorker ? `${productReportRows[0].minWorker.worker.ime} ${productReportRows[0].minWorker.worker.prezime}` : '-'}`,
                ] : []}
              />
              <ReportCard
                title={t.summaryProductsMin}
                lines={productReportRows[productReportRows.length - 1] ? [
                  `${productReportRows[productReportRows.length - 1].product.naziv}`,
                  `${t.total}: ${productReportRows[productReportRows.length - 1].total}`,
                  `${t.average}: ${productReportRows[productReportRows.length - 1].avg.toFixed(2)}`,
                  `${t.productWorkerMost}: ${productReportRows[productReportRows.length - 1].maxWorker ? `${productReportRows[productReportRows.length - 1].maxWorker.worker.ime} ${productReportRows[productReportRows.length - 1].maxWorker.worker.prezime}` : '-'}`,
                  `${t.productWorkerLeast}: ${productReportRows[productReportRows.length - 1].minWorker ? `${productReportRows[productReportRows.length - 1].minWorker.worker.ime} ${productReportRows[productReportRows.length - 1].minWorker.worker.prezime}` : '-'}`,
                ] : []}
              />
              <ReportCard
                title={t.summaryProductsAvg}
                lines={middleProduct ? [
                  `${middleProduct.product.naziv}`,
                  `${t.total}: ${middleProduct.total}`,
                  `${t.average}: ${middleProduct.avg.toFixed(2)}`,
                  `${t.productWorkerMost}: ${middleProduct.maxWorker ? `${middleProduct.maxWorker.worker.ime} ${middleProduct.maxWorker.worker.prezime}` : '-'}`,
                  `${t.productWorkerLeast}: ${middleProduct.minWorker ? `${middleProduct.minWorker.worker.ime} ${middleProduct.minWorker.worker.prezime}` : '-'}`,
                ] : []}
              />
            </>
          )}
        </section>
      )}

      <div className="footerNote">{t.dbSaved}</div>

      {pendingConfirm ? (
        <div className="modalOverlay">
          <div className="modalCard">
            <h3>{pendingConfirm.title}</h3>
            <p>{pendingConfirm.message}</p>
            <div className="rowBtns">
              <button className="actionBtn" disabled={saving} onClick={() => { const run = pendingConfirm.onConfirm; setPendingConfirm(null); void run(); }} type="button">
                {pendingConfirm.confirmLabel}
              </button>
              <button className="actionBtn secondary" disabled={saving} onClick={() => setPendingConfirm(null)} type="button">
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function ReportCard({ title, lines }: { title: string; lines: string[] }) {
  return (
    <article className="reportCard">
      <h3>{title}</h3>
      <div className="reportLines">
        {lines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </article>
  );
}
