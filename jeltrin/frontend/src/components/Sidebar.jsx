import { NavLink } from 'react-router-dom';
import {
  HiOutlineViewGrid,
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineCurrencyRupee,
  HiOutlineClipboardList,
  HiOutlineCog
} from 'react-icons/hi';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: <HiOutlineViewGrid /> },
  { to: '/tenants', label: 'Tenants', icon: <HiOutlineUserGroup /> },
  { to: '/rooms', label: 'Rooms', icon: <HiOutlineOfficeBuilding /> },
  { to: '/rent', label: 'Rent & Dues', icon: <HiOutlineCurrencyRupee /> },
  { to: '/payments', label: 'Payments', icon: <HiOutlineClipboardList /> },
  { to: '/complaints', label: 'Complaints', icon: <HiOutlineCog /> },
];

export default function Sidebar() {
  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <h1>RENT-EASY</h1>
        <p>PG & Hostel Management</p>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        © 2026 RentEasy • v1.0
      </div>
    </aside>
  );
}
