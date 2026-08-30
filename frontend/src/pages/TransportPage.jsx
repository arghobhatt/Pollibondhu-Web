import React, { useState, useEffect } from 'react';
import PageHeader from '../components/layout/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import DataTable, { DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { FormField, Select } from '../components/ui/FormComponents';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { Bus, Search, Navigation, RotateCcw, MapPin } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export default function TransportPage() {
  const [routes, setRoutes] = useState([]);
  const [locations, setLocations] = useState({ divisions: [], origins: [], destinations: [], vehicle_types: [] });
  
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [loading, setLoading] = useState(false);

  const divisionsList = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ"];

  const fetchLocations = async (div = '') => {
    try {
      const url = div ? `/api/transport/locations?division=${encodeURIComponent(div)}` : '/api/transport/locations';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLocations({
          divisions: data.divisions || divisionsList,
          origins: data.origins || [],
          destinations: data.destinations || [],
          vehicle_types: data.vehicle_types || []
        });
      }
    } catch (e) {}
  };

  const fetchRoutes = async (division = '', origin = '', destination = '', vehicle = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (division && division !== 'সকল বিভাগ') params.append('division', division);
      if (origin) params.append('origin', origin);
      if (destination) params.append('destination', destination);
      if (vehicle) params.append('vehicle_type', vehicle);

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

  const handleDivisionChange = (e) => {
    const div = e.target.value;
    setSelectedDivision(div);
    setSelectedOrigin('');
    setSelectedDestination('');
    fetchLocations(div);
    fetchRoutes(div, '', '', selectedVehicleType);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRoutes(selectedDivision, selectedOrigin, selectedDestination, selectedVehicleType);
  };

  const handleResetFilters = () => {
    setSelectedDivision('');
    setSelectedOrigin('');
    setSelectedDestination('');
    setSelectedVehicleType('');
    fetchLocations('');
    fetchRoutes('', '', '', '');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="গ্রামীণ পরিবহন সময়সূচী"
        description="বাংলাদেশের সকল ৮টি বিভাগের উপজেলা, জেলা ও ইউনিয়ন রুটের বাস, লঞ্চ, ট্রেন ও অটোর সময়সূচী ও ভাড়ার তালিকা"
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <FormField label="প্রশাসনিক বিভাগ (Division)">
                <Select value={selectedDivision} onChange={handleDivisionChange}>
                  <option value="">সকল বিভাগ (All 8 Divisions)</option>
                  {divisionsList.map((d) => (
                    <option key={d} value={d}>{d} বিভাগ</option>
                  ))}
                </Select>
              </FormField>

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

              <FormField label="যানবাহন ধরণ">
                <Select value={selectedVehicleType} onChange={(e) => setSelectedVehicleType(e.target.value)}>
                  <option value="">সকল যানবাহন</option>
                  <option value="bus">বাস (Bus)</option>
                  <option value="launch">লঞ্চ / ফেরি (Launch/Ferry)</option>
                  <option value="train">ট্রেন (Train)</option>
                  <option value="auto">অটো-রিকশা / ইজিবাইক (Auto)</option>
                </Select>
              </FormField>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ফিল্টার মুছুন</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{loading ? 'খোঁজা হচ্ছে...' : 'সময়সূচী খুঁজুন'}</span>
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingState message="পরিবহন রুট ও সময়সূচী লোড হচ্ছে..." />
      ) : routes.length === 0 ? (
        <EmptyState
          icon={Bus}
          title="কোন পরিবহন রুট পাওয়া যায়নি"
          description="আপনার নির্বাচিত বিভাগ বা ফিল্টার অনুযায়ী কোন পরিবহন সময়সূচী পাওয়া যায়নি।"
          actionLabel="সকল রুট দেখুন"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map((r) => (
            <Card key={r.id} className="flex flex-col justify-between hover:border-emerald-300 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {r.division ? `${r.division} বিভাগ` : 'বাংলাদেশ'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      {r.route_code}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-700 shrink-0">{formatCurrency(r.fare_bdt)} / টিকিট</span>
                </div>
                <CardTitle className="flex items-center gap-2 pt-1 text-slate-900">
                  <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{r.origin_bn} ➔ {r.destination_bn}</span>
                </CardTitle>
                <CardDescription>
                  দূরত্ব: {r.distance_km} কিমি | আনুমানিক সময়: {r.estimated_duration_minutes} মিনিট | অপারেটর: {r.operator_name_bn}
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
