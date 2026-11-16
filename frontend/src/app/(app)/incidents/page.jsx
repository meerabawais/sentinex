'use client';
import { useApp } from '@/context/AppContext';
import { RANGE_NAME } from '@/lib/constants';
import PageHeader from '@/components/FilterBar';
import SearchBar from '@/components/SearchBar';
import IncidentTable from '@/components/IncidentTable';

export default function IncidentsPage() {
  const { view, range } = useApp();
  return (
    <>
      <PageHeader title="Incidents" subtitle={`Violation log · ${RANGE_NAME[range]}`} />
      {/* Search is shown but not wired up yet */}
      <SearchBar placeholder="Search incidents by ID, camera or violation type" />
      <IncidentTable incidents={view.cur} />
    </>
  );
}
