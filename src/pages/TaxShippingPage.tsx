import { useMemo, useRef, useState } from 'react';
import { Check, Download, Edit3, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { ToggleSwitch } from '../components/ui/ToggleSwitch';
import { useDashboard } from '../store/dashboardStore';
import type { TaxRule } from '../types/dashboard';
import { downloadCsv, parseCsvText } from '../utils/csv';
import { formatCurrencyCompact } from '../utils/format';

export function TaxShippingPage() {
  const { state, dispatch, navigate } = useDashboard();
  const activeTab = state.route === 'shipping' ? 'shipping' : 'tax';

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TaxRule>({
    id: '',
    countryCode: '',
    stateCode: '',
    ratePercent: 0,
    taxName: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTaxes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.taxRules.filter(
      (t) =>
        !q ||
        t.countryCode.toLowerCase().includes(q) ||
        t.stateCode.toLowerCase().includes(q) ||
        t.taxName.toLowerCase().includes(q),
    );
  }, [state.taxRules, search]);

  const startInsertRow = () => {
    const newId = `tax-${Date.now()}`;
    const blank: TaxRule = {
      id: newId,
      countryCode: 'US',
      stateCode: 'WA',
      ratePercent: 6.5,
      taxName: 'Washington Sales Tax',
    };
    dispatch({ type: 'UPSERT_TAX', rule: blank });
    setEditingId(newId);
    setDraft(blank);
  };

  const startEdit = (rule: TaxRule) => {
    setEditingId(rule.id);
    setDraft({ ...rule });
  };

  const saveEdit = () => {
    if (!draft.countryCode.trim() || !draft.taxName.trim()) {
      toast.error('Country code and tax name are required.');
      return;
    }
    dispatch({
      type: 'UPSERT_TAX',
      rule: {
        ...draft,
        countryCode: draft.countryCode.toUpperCase(),
        stateCode: draft.stateCode.toUpperCase(),
        ratePercent: Math.max(0, Number(draft.ratePercent) || 0),
      },
    });
    setEditingId(null);
    toast.success(`Saved tax rule for ${draft.countryCode.toUpperCase()}`);
  };

  const handleExportCsv = () => {
    downloadCsv(
      'sohnne-tax-rates.csv',
      ['Country Code', 'State Code', 'Rate (%)', 'Tax Name'],
      filteredTaxes.map((t) => [t.countryCode, t.stateCode, t.ratePercent.toFixed(2), t.taxName]),
    );
    toast.success(`Exported ${filteredTaxes.length} tax rules`);
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsvText(text);
    const dataRows = parsed.slice(1).filter((cols) => cols.length >= 4);
    if (dataRows.length === 0) {
      toast.error('CSV must include header + Country Code, State Code, Rate, Tax Name columns.');
      return;
    }
    const rules: TaxRule[] = dataRows.map((cols, idx) => ({
      id: `tax-imp-${Date.now()}-${idx}`,
      countryCode: cols[0].slice(0, 4).toUpperCase(),
      stateCode: cols[1].slice(0, 6).toUpperCase(),
      ratePercent: Math.max(0, Number(cols[2]) || 0),
      taxName: cols[3],
    }));
    dispatch({ type: 'IMPORT_TAX_RULES', rules });
    toast.success(`Imported ${rules.length} tax rules from ${file.name}`);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            id="page-heading"
            tabIndex={-1}
            className="font-serif-display text-3xl font-bold text-[#131313] focus:outline-none"
          >
            {activeTab === 'tax' ? 'Tax' : 'Shipping Zones'}
          </h1>
          <p className="mt-1 text-sm text-[#555555]">
            {activeTab === 'tax'
              ? 'Configure regional tax jurisdictions with inline editing or bulk CSV import/export.'
              : 'Configure carrier methods, delivery ETAs, and free-shipping thresholds.'}
          </p>
        </div>

        {/* Tax / Shipping Tabs */}
        <div role="tablist" aria-label="Tax and Shipping sections" className="inline-flex rounded-xl border border-[#E5E7EB] bg-[#F5F6F8] p-1">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tax'}
            onClick={() => navigate('tax')}
            className={`btn-tactile rounded-lg px-4 py-1.5 text-xs font-semibold ${
              activeTab === 'tax' ? 'bg-white text-[#131313] shadow-xs' : 'text-[#555555]'
            }`}
          >
            Tax Rates
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'shipping'}
            onClick={() => navigate('shipping')}
            className={`btn-tactile rounded-lg px-4 py-1.5 text-xs font-semibold ${
              activeTab === 'shipping' ? 'bg-white text-[#131313] shadow-xs' : 'text-[#555555]'
            }`}
          >
            Shipping Zones
          </button>
        </div>
      </div>

      {activeTab === 'tax' ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={startInsertRow}
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl bg-[#0057FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0046D5]"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Insert row</span>
              </button>

              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555555]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country, state, tax name..."
                  aria-label="Search tax rules"
                  className="h-9 w-60 rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-xs text-[#131313] placeholder:text-[#6B7280] focus:border-[#0057FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleImportCsv}
                className="sr-only"
                aria-label="Upload tax rules CSV"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-semibold text-[#131313] hover:bg-[#F5F6F8]"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Import CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-xs font-semibold text-[#131313] hover:bg-[#F5F6F8]"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div
            role="region"
            tabIndex={0}
            aria-label="Regional tax rules table"
            className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white"
          >
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead className="border-b border-[#E5E7EB] bg-[#F3F4F6] text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
                <tr>
                  <th scope="col" className="px-4 py-3">Country Code</th>
                  <th scope="col" className="px-4 py-3">State Code</th>
                  <th scope="col" className="px-4 py-3 text-right">Rate %</th>
                  <th scope="col" className="px-4 py-3">Tax Name</th>
                  <th scope="col" className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredTaxes.map((rule) => {
                  const isEditing = editingId === rule.id;
                  return (
                    <tr key={rule.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            aria-label="Country code"
                            value={draft.countryCode}
                            onChange={(e) => setDraft({ ...draft, countryCode: e.target.value })}
                            className="w-20 rounded-lg border border-[#0057FF] px-2.5 py-1 text-xs font-semibold uppercase"
                          />
                        ) : (
                          <span className="inline-flex rounded-md bg-[#F3F4F6] px-2.5 py-1 text-xs font-bold text-[#131313]">
                            {rule.countryCode}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            aria-label="State code"
                            value={draft.stateCode}
                            onChange={(e) => setDraft({ ...draft, stateCode: e.target.value })}
                            className="w-24 rounded-lg border border-[#0057FF] px-2.5 py-1 text-xs uppercase"
                          />
                        ) : (
                          <span className="tabular-nums text-xs font-medium text-[#4B5563]">
                            {rule.stateCode}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {isEditing ? (
                          <input
                            aria-label="Tax rate percentage"
                            type="number"
                            step="0.05"
                            value={draft.ratePercent}
                            onChange={(e) => setDraft({ ...draft, ratePercent: Number(e.target.value) })}
                            className="w-24 rounded-lg border border-[#0057FF] px-2.5 py-1 text-right text-xs"
                          />
                        ) : (
                          <span className="font-semibold text-[#131313]">{rule.ratePercent.toFixed(2)}%</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            aria-label="Tax name"
                            value={draft.taxName}
                            onChange={(e) => setDraft({ ...draft, taxName: e.target.value })}
                            className="w-full max-w-xs rounded-lg border border-[#0057FF] px-2.5 py-1 text-xs"
                          />
                        ) : (
                          <span className="font-medium text-[#131313]">{rule.taxName}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="inline-flex gap-1.5">
                            <button
                              type="button"
                              onClick={saveEdit}
                              aria-label="Save tax row"
                              className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0057FF] text-white"
                            >
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              aria-label="Cancel editing"
                              className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563]"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => startEdit(rule)}
                              aria-label={`Edit ${rule.taxName}`}
                              className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:text-[#131313]"
                            >
                              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                dispatch({ type: 'DELETE_TAX', taxId: rule.id });
                                toast.success(`Deleted ${rule.taxName}`);
                              }}
                              aria-label={`Delete ${rule.taxName}`}
                              className="btn-tactile inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#FEE2E2] hover:text-[#B91C1C]"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {state.shippingZones.map((zone) => (
            <article
              key={zone.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-md bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#0057FF]">
                    {zone.carrier}
                  </span>
                  <h2 className="mt-2 text-base font-bold text-[#131313]">{zone.zoneName}</h2>
                  <p className="text-xs text-[#555555]">{zone.region}</p>
                </div>
                <ToggleSwitch
                  checked={zone.active}
                  label={`Toggle ${zone.zoneName}`}
                  onChange={() => {
                    dispatch({ type: 'TOGGLE_SHIPPING_ZONE', zoneId: zone.id });
                    toast.info(`${zone.zoneName} ${zone.active ? 'paused' : 'enabled'}`);
                  }}
                />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-[#F5F6F8] p-3 text-xs tabular-nums">
                <div>
                  <p className="text-[#555555]">Service</p>
                  <p className="mt-0.5 truncate font-semibold text-[#131313]">{zone.methodName}</p>
                </div>
                <div>
                  <p className="text-[#555555]">ETA</p>
                  <p className="mt-0.5 font-semibold text-[#131313]">{zone.etaLabel}</p>
                </div>
                <div>
                  <p className="text-[#555555]">Rate / Free Over</p>
                  <p className="mt-0.5 font-semibold text-[#131313]">
                    {zone.flatRate === 0 ? 'Free' : formatCurrencyCompact(zone.flatRate)} ·{' '}
                    {formatCurrencyCompact(zone.freeThreshold)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
