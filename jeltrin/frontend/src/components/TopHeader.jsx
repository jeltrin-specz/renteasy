export default function TopHeader({ title, children }) {
  return (
    <header className="top-header" id="top-header">
      <h2>{title}</h2>
      <div className="top-header-actions">
        {children}
      </div>
    </header>
  );
}
