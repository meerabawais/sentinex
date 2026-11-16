'use client';
import { useApp } from '@/context/AppContext';
import { USE_DEMO } from '@/lib/constants';
import PageHeader from '@/components/FilterBar';
import StatTile from '@/components/StatTile';
import WorkerTable from '@/components/WorkerTable';

export default function WorkersPage() {
  const { data } = useApp();
  const W = data.workers;
  const count = (k) => W.filter((w) => w.status === k).length;
  const onSite = count('compliant') + count('violation');
  return (
    <>
      <PageHeader title="Workers" subtitle="Factory roster, live status and PPE rules" demo={USE_DEMO} showRange={false} showCamera={false} />
      <section className="grid g4">
        <StatTile label="Total workers" value={W.length} foot="registered in the system" />
        <StatTile label="On site now" value={onSite} foot={`${count('break')} on break · ${count('off')} off shift`} />
        <StatTile label="Compliant now" value={count('compliant')} foot="wearing all required PPE" />
        <StatTile label="Violations now" value={count('violation')} foot={count('violation') ? 'missing required PPE' : 'all clear'} led={count('violation') ? 'bad' : null} />
      </section>
      <WorkerTable workers={W} />
    </>
  );
}
