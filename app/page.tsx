'use client';
import { useEffect, useState } from 'react';
import * as api from '../src/lib/api'; 
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Users, Plus, Search, Printer, Plane, X, Receipt, Save, 
  History, Eye, EyeOff, Trash2, Edit3, MessageCircle, 
  TrendingUp, Download, UserPlus, Globe, Check
} from 'lucide-react';

export default function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('CUSTOMERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFinancials, setShowFinancials] = useState(false);
  const [panelOpen, setPanelOpen] = useState<'SALE' | 'CLIENT' | 'PROFILE' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [saleForm, setSaleForm] = useState({ 
    customer: '', service_type: 'PRINTING', description: 'General Service', revenue: 0, cost: 0, date: new Date().toISOString().split('T')[0] 
  });
  
  const [custForm, setCustForm] = useState({ name: '', phone: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, t] = await Promise.all([api.getCustomers(), api.getTransactions()]);
      setCustomers(c || []);
      setTransactions(t || []);
    } catch (err) { console.error("Sync Error:", err); }
    setLoading(false);
  };

  const totalRevenue = transactions.reduce((sum, t: any) => sum + (parseFloat(t.revenue) || 0), 0);
  const totalProfit = transactions.reduce((sum, t: any) => sum + (parseFloat(t.profit) || 0), 0);

  // --- PDF GENERATION LOGIC ---
  const generateReceipt = (transaction: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(40, 100, 250); 
    doc.text("URANIUM JET DIGITAL SOLUTIONS", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Official Service Receipt", 14, 30);
    doc.text(`Date: ${transaction.date}`, 160, 30);

    doc.setDrawColor(230);
    doc.line(14, 35, 196, 35); 
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Billed To:", 14, 45);
    doc.setFont("helvetica", "bold");
    doc.text(`${transaction.customer_name || 'Valued Customer'}`, 14, 52);
    
    autoTable(doc, {
      startY: 60,
      head: [['Description', 'Service Type', 'Amount']],
      body: [
        [
          transaction.description || "Digital Service Rendered",
          transaction.service_type,
          `NGN ${parseFloat(transaction.revenue).toLocaleString()}`
        ],
      ],
      headStyles: { fillColor: [40, 100, 250] },
      theme: 'striped'
    });

    const finalY = (doc as any).lastAutoTable.finalY || 70;
    doc.setFontSize(14);
    doc.text(`Total Paid: NGN ${parseFloat(transaction.revenue).toLocaleString()}`, 14, finalY + 15);
    
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Thank you for choosing Uranium Jet!", 14, finalY + 30);
    doc.save(`Receipt_${transaction.customer_name}_${transaction.date}.pdf`);
  };

  // --- API HANDLERS ---
  const handleSaleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = { ...saleForm, profit: saleForm.revenue - saleForm.cost, customer: parseInt(saleForm.customer) };
      await api.createTransaction(payload);
      setPanelOpen(null);
      loadData();
    } catch (err) { alert("Error saving sale."); }
  };

  const handleCustSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        await api.updateCustomer(selectedItem.id, custForm); 
      } else {
        await api.createCustomer(custForm);
      }
      setPanelOpen(null);
      setSelectedItem(null);
      setCustForm({ name: '', phone: '' });
      loadData();
    } catch (err) { alert("Error saving customer."); }
  };

  const handleDeleteCustomer = async (id: number) => {
    if (confirm("Are you sure?")) {
      try {
        await api.deleteCustomer(id); 
        setPanelOpen(null);
        loadData();
      } catch (err) { alert("Delete failed."); }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex text-slate-900 font-sans overflow-x-hidden">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-24 bg-white border-r border-slate-200 flex-col items-center py-8 space-y-12 sticky top-0 h-screen z-40">
        <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">UJ</div>
            <span className="text-[8px] font-black text-blue-600 text-center leading-tight">URANIUM<br/>JET</span>
        </div>
        <nav className="flex flex-col space-y-6">
          <button onClick={() => setActiveTab('CUSTOMERS')} className={`p-4 rounded-2xl transition ${activeTab === 'CUSTOMERS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-300 hover:text-slate-600'}`}><Users size={24}/></button>
          <button onClick={() => setActiveTab('SALES')} className={`p-4 rounded-2xl transition ${activeTab === 'SALES' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-300 hover:text-slate-600'}`}><History size={24}/></button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 lg:p-12">
        <div className="mb-10">
            <h1 className="text-sm font-black text-blue-600 tracking-[0.3em] uppercase">Uranium Jet Digital Solutions</h1>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Customer Management</h2>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm flex justify-between items-center">
            <div><p className="text-slate-400 text-xs font-bold uppercase mb-1">Active Clients</p><h3 className="text-3xl font-black">{customers.length}</h3></div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users size={28}/></div>
          </div>
          <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl flex justify-between items-center">
            <div><p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Revenue</p><h3 className="text-3xl font-black">{showFinancials ? `₦${totalRevenue.toLocaleString()}` : '₦ •••••••'}</h3></div>
            <button onClick={() => setShowFinancials(!showFinancials)} className="p-4 bg-slate-800 rounded-2xl"><Eye size={20}/></button>
          </div>
          <div className="bg-blue-600 p-8 rounded-[32px] text-white shadow-xl flex justify-between items-center">
            <div><p className="text-blue-200 text-xs font-bold uppercase mb-1">Net Profit</p><h3 className="text-3xl font-black">{showFinancials ? `₦${totalProfit.toLocaleString()}` : '₦ •••••••'}</h3></div>
            <TrendingUp size={28} className="opacity-50" />
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-4.5 text-slate-300" size={20} />
            <input type="text" placeholder="Search records..." className="w-full bg-white pl-14 pr-4 py-4 rounded-3xl shadow-sm outline-none font-medium" onChange={(e)=>setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => {setSelectedItem(null); setCustForm({name:'', phone:''}); setPanelOpen('CLIENT');}} className="px-8 py-4 bg-white text-slate-700 font-bold rounded-3xl border border-slate-100 flex items-center shadow-sm"><UserPlus size={20} className="mr-2 text-blue-600"/> New Client</button>
            <button onClick={() => setPanelOpen('SALE')} className="px-8 py-4 bg-blue-600 text-white font-black rounded-3xl shadow-xl flex items-center"><Plus size={20} className="mr-2"/> New Sale</button>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                {activeTab === 'CUSTOMERS' ? (
                  <tr><th className="p-8">Client Name</th><th className="p-8">Contact</th><th className="p-8 text-right">Management</th></tr>
                ) : (
                  <tr><th className="p-8">Date</th><th className="p-8">Customer</th><th className="p-8 text-right">Profit</th><th className="p-8 text-right">Actions</th></tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {activeTab === 'CUSTOMERS' ? customers.filter(c=>c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((c:any) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition group">
                    <td className="p-8 font-black text-slate-700 text-base uppercase">{c.name}</td>
                    <td className="p-8 font-mono text-slate-500">{c.phone}</td>
                    <td className="p-8 text-right">
                        <button onClick={()=>{setSelectedItem(c); setCustForm({name: c.name, phone: c.phone}); setPanelOpen('PROFILE')}} className="px-6 py-3 bg-slate-100 rounded-2xl text-[10px] font-black uppercase text-slate-500 hover:bg-blue-600 hover:text-white transition-all">View Profile</button>
                    </td>
                  </tr>
                )) : transactions.filter(t=>t.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())).map((s:any) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-8 text-slate-400 font-bold">{s.date}</td>
                    <td className="p-8 font-black text-slate-700 uppercase">{s.customer_name}</td>
                    <td className="p-8 text-right font-black text-emerald-600">
                        {showFinancials ? `₦${parseFloat(s.profit).toLocaleString()}` : '₦ •••'}
                    </td>
                    <td className="p-8 text-right flex gap-2 justify-end">
                        {/* --- THE PDF BUTTON IN THE CORRECT PLACE --- */}
                        <button 
                          onClick={() => generateReceipt(s)} 
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"
                        >
                          <Printer size={18}/>
                        </button>
                        <button onClick={() => api.deleteTransaction(s.id).then(loadData)} className="p-3 text-slate-300 hover:text-red-500 transition"><Trash2 size={20}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- PANEL SYSTEM --- */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setPanelOpen(null)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl p-12 overflow-y-auto animate-in slide-in-from-right">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-black uppercase tracking-tighter">{panelOpen}</h2>
              <button onClick={() => setPanelOpen(null)} className="p-4 bg-slate-100 rounded-full"><X/></button>
            </div>

            {panelOpen === 'PROFILE' && selectedItem && (
                <div className="space-y-10">
                    <div className="flex items-center space-x-6 pb-10 border-b">
                        <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center text-4xl text-white font-black">{selectedItem.name[0]}</div>
                        <div>
                            <h3 className="text-4xl font-black uppercase mb-2">{selectedItem.name}</h3>
                            <p className="text-slate-400 font-mono text-lg">{selectedItem.phone}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => window.open(`https://wa.me/${selectedItem.phone}`)} className="p-6 bg-emerald-500 text-white rounded-3xl font-black shadow-lg"><MessageCircle className="mr-2"/> WhatsApp</button>
                        <button onClick={() => {setPanelOpen('CLIENT');}} className="p-6 bg-slate-100 text-slate-600 rounded-3xl font-black"><Edit3 className="mr-2"/> Update Info</button>
                    </div>
                    <button onClick={() => handleDeleteCustomer(selectedItem.id)} className="w-full p-6 text-red-400 font-black hover:bg-red-50 rounded-3xl border border-red-50">Remove Client</button>
                </div>
            )}

            {panelOpen === 'SALE' && (
              <form onSubmit={handleSaleSubmit} className="space-y-8">
                <select required className="w-full p-6 bg-slate-50 rounded-3xl font-bold" onChange={(e)=>setSaleForm({...saleForm, customer: e.target.value})}>
                  <option value="">Choose a Client</option>
                  {customers.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-6">
                  <input type="number" required placeholder="Revenue (₦)" className="w-full p-6 bg-slate-50 rounded-3xl font-bold text-xl" onChange={(e)=>setSaleForm({...saleForm, revenue: parseFloat(e.target.value)})}/>
                  <input type="number" required placeholder="Cost (₦)" className="w-full p-6 bg-slate-50 rounded-3xl font-bold text-xl" onChange={(e)=>setSaleForm({...saleForm, cost: parseFloat(e.target.value)})}/>
                </div>
                <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-blue-100">Confirm Sale</button>
              </form>
            )}

            {panelOpen === 'CLIENT' && (
              <form onSubmit={handleCustSubmit} className="space-y-8">
                <input placeholder="Name" value={custForm.name} required className="w-full p-6 bg-slate-50 rounded-3xl outline-none text-xl font-bold uppercase" onChange={(e)=>setCustForm({...custForm, name:e.target.value})}/>
                <input placeholder="Phone" value={custForm.phone} required className="w-full p-6 bg-slate-50 rounded-3xl outline-none text-xl font-bold font-mono" onChange={(e)=>setCustForm({...custForm, phone:e.target.value})}/>
                <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl">
                    {selectedItem ? 'Update Client Record' : 'Register New Client'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}