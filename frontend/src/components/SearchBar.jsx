/* Present in the interface but intentionally not wired up yet. */
export default function SearchBar({ placeholder }) {
  return (
    <div className="searchbar">
      <input className="search" type="search" placeholder={placeholder} autoComplete="off" aria-label="Search" />
    </div>
  );
}
