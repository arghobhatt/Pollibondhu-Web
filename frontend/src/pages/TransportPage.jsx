import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import DataTable, { DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { FormField, Select } from '../components/ui/FormComponents';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { Bus, Search, Navigation } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function TransportPage() {
  const [routes, setRoutes] = useState([]);
  const [locations, setLocations] = useState({ origins: [], destinations: [], vehicle_types: [] });
  
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/transport/locations');
      if (res.ok) setLocations(await res.json());
    } catch (e) {}
  };

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedOrigin) params.append('origin', selectedOrigin);
      if (selectedDestination) params.append('destination', selectedDestination);
      if (selectedVehicleType) params.append('vehicle_type', selectedVehicleType);

      const res = await fetch(`/api/transport/routes?${params.toString()}`);
      if (res.ok) setRoutes(await res.json());
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchRoutes();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRoutes();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="গ্রামীণ পরিবহন সময়সূচী"
        description="উপজেলা ও ইউনিয়ন রুটের লোকাল বাস, লঞ্চ ও ট্রেনের সময়সূচী ও ভাড়ার তালিকা"
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <FormField label="যাত্রার স্থান (Origin)">
              <Select value={selectedOrigin} onChange={(e) => setSelectedOrigin(e.target.value)}>
                <option value="">সকল স্থান</option>
                {locations.origins.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="গন্তব্য (Destination)">
              <Select value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)}>
                <option value="">সকল গন্তব্য</option>
                {locations.destinations.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </FormField>

            <FormField label="যানবাহন টাইপ">
              <Select value={selectedVehicleType} onChange={(e) => setSelectedVehicleType(e.target.value)}>
                <option value="">সকল যানবাহন</option>
                <option value="bus">বাস (Bus)</option>
                <option value="launch">লঞ্চ (Launch)</option>
                <option value="train">ট্রেন (Train)</option>
                <option value="auto">অটো-রিকশা (Auto)</option>
              </Select>
            </FormField>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{loading ? 'খোঁজা হচ্ছে...' : 'সময়সূচী খুঁজুন'}</span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner message="পরিবহন রুট ও সময়সূচী লোড হচ্ছে..." />
      ) : routes.length === 0 ? (
        <EmptyState
          icon={Bus}
          title="কোন পরিবহন রুট পাওয়া যায়নি"
          description="আপনার নির্বাচিত ফিল্টার অনুযায়ী কোন সময়সূচী পাওয়া যায়নি।"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((r) => (
            <Card key={r.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    রুট কোড: {r.route_code}
                  </span>
                  <span className="text-sm font-bold text-emerald-700">{formatCurrency(r.fare_bdt)} / টিকিট</span>
                </div>
                <CardTitle className="flex items-center gap-2 pt-1">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <span>{r.origin_bn} ➔ {r.destination_bn}</span>
                </CardTitle>
                <CardDescription>
                  দূরত্ব: {r.distance_km} কিমি | সময়: {r.estimated_duration_minutes} মিনিট | অপারেটর: {r.operator_name_bn}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-900">ট্রিপ সময়সূচী:</h4>
                <DataTable headers={["ছাড়ার সময়", "পৌঁছানোর সময়", "চলমান দিন", "অবস্থা"]}>
                  {r.schedules.map((s) => (
                    <DataTableRow key={s.id}>
                      <DataTableCell className="font-semibold text-emerald-700">{s.departure_time}</DataTableCell>
                      <DataTableCell>{s.arrival_time}</DataTableCell>
                      <DataTableCell className="text-[11px] text-slate-500">{s.days_of_week}</DataTableCell>
                      <DataTableCell>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.is_active ? 'সক্রিয়' : 'বন্ধ'}
                        </span>
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTable>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
