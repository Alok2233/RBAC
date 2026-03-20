import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Sidebar />
      <main className="ml-56 pt-16 min-h-screen">
        <div className="p-6 lg:p-8 animate-slide-up">
          {children}
        </div>
      </main>
    </div>
  );
}
