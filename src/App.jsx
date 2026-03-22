import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function App() {
  const [books, setBooks] = useState([])
  const [title, setTitle] = useState("")
  const [borrower, setBorrower] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) console.error(error)
    else setBooks(data)
  }

  const addBook = async () => {
    if (!title) return
    const { error } = await supabase.from("books").insert([{ title, borrower: "", is_rented: false }])
    if (!error) {
      setTitle("")
      fetchBooks()
    }
  }

  const rentBook = async (id) => {
    if (!borrower) return alert("System Error: Please input borrower identity.")
    await supabase.from("books").update({ borrower, is_rented: true }).eq("id", id)
    setBorrower("")
    fetchBooks()
  }

  const returnBook = async (id) => {
    await supabase.from("books").update({ borrower: "", is_rented: false }).eq("id", id)
    fetchBooks()
  }

  const deleteBook = async (id) => {
    if (confirm("Permanent Action: Are you sure you want to delete this record?")) {
      await supabase.from("books").delete().eq("id", id)
      fetchBooks()
    }
  }

  // Dashboard Stats Logic
  const stats = {
    total: books.length,
    rented: books.filter(b => b.is_rented).length,
    available: books.filter(b => !b.is_rented).length
  }

  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={appContainer}>
      <style>{professionalCSS}</style>
      
      {/* SIDEBAR / MANAGEMENT PANEL */}
      <aside style={sidebar}>
        <div style={brandBox}>
          <h2 style={brandTitle}>V-LUMINA</h2>
          <span style={brandSub}>Library OS v3.0</span>
        </div>

        <div style={sidebarSection}>
          <label style={label}>New Entry</label>
          <input 
            className="glass-input"
            placeholder="Book Title..." 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            style={sideInput} 
          />
          <button onClick={addBook} className="action-btn-primary" style={addBtn}>Register Book</button>
        </div>

        <div style={sidebarSection}>
          <label style={label}>Inventory Search</label>
          <input 
            className="glass-input"
            placeholder="Search catalog..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={sideInput} 
          />
        </div>

        <div style={sidebarSection}>
          <label style={label}>Transaction Context</label>
          <input 
            className="glass-input active-borrower"
            placeholder="Current Borrower Name" 
            value={borrower} 
            onChange={(e) => setBorrower(e.target.value)} 
            style={sideInput} 
          />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={mainArea}>
        {/* INDICATORS / STATS */}
        <div style={statsGrid}>
          <div style={statCard}>
            <span style={statLabel}>Total Assets</span>
            <span style={statValue}>{stats.total}</span>
          </div>
          <div style={statCard}>
            <span style={statLabel}>Out on Rent</span>
            <span style={{...statValue, color: '#fb7185'}}>{stats.rented}</span>
          </div>
          <div style={statCard}>
            <span style={statLabel}>Available</span>
            <span style={{...statValue, color: '#34d399'}}>{stats.available}</span>
          </div>
        </div>

        {/* BOOK TABLE / GRID */}
        <div style={tableHeader}>
          <span>Asset Name</span>
          <span style={{textAlign: 'right'}}>Status & Controls</span>
        </div>

        <div style={scrollArea}>
          {filteredBooks.map(book => (
            <div key={book.id} className="asset-row" style={rowStyle}>
              <div style={assetInfo}>
                <span style={assetTitle}>{book.title}</span>
                <span style={assetID}>ID: {book.id.toString().slice(0,8)}</span>
              </div>

              <div style={controls}>
                <div style={statusBadge(book.is_rented)}>
                  <div style={statusDot(book.is_rented)} />
                  {book.is_rented ? `Rented by ${book.borrower}` : "Ready"}
                </div>

                <div style={btnGroup}>
                  {!book.is_rented ? (
                    <button onClick={() => rentBook(book.id)} className="btn-rent">Rent</button>
                  ) : (
                    <button onClick={() => returnBook(book.id)} className="btn-return">Return</button>
                  )}
                  <button onClick={() => deleteBook(book.id)} className="btn-delete">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

/* 💎 PROFESSIONAL UI ENGINE (CSS) */

const professionalCSS = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .asset-row {
    animation: slideUp 0.3s ease-out forwards;
    transition: all 0.2s ease;
  }

  .asset-row:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(59, 130, 246, 0.3) !important;
    padding-left: 28px !important;
  }

  .glass-input {
    background: rgba(15, 23, 42, 0.5) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: white;
    outline: none;
    transition: 0.3s;
  }

  .glass-input:focus {
    border-color: #3b82f6 !important;
    background: rgba(15, 23, 42, 0.8) !important;
  }

  .active-borrower {
    border-left: 3px solid #3b82f6 !important;
  }

  .action-btn-primary {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: 600;
    transition: 0.3s;
  }

  .action-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
  }

  .btn-rent { background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; }
  .btn-return { background: #d97706; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; }
  .btn-delete { background: none; border: none; color: #475569; font-size: 1.1rem; cursor: pointer; transition: 0.2s; }
  .btn-delete:hover { color: #ef4444; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
`;

/* 🧩 LAYOUT STYLES */

const appContainer = {
  display: 'flex',
  minHeight: '100vh',
  background: '#020617',
  color: '#f8fafc',
  fontFamily: "'Inter', sans-serif"
};

const sidebar = {
  width: '300px',
  background: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(255, 255, 255, 0.05)',
  padding: '40px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '30px',
  position: 'fixed',
  height: '100vh'
};

const mainArea = {
  marginLeft: '300px',
  flex: 1,
  padding: '50px',
  maxWidth: '1000px'
};

const brandBox = { marginBottom: '20px' };
const brandTitle = { fontSize: '1.5rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' };
const brandSub = { fontSize: '0.7rem', color: '#3b82f6', fontWeight: '700', textTransform: 'uppercase' };

const sidebarSection = { display: 'flex', flexDirection: 'column', gap: '8px' };
const label = { fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' };
const sideInput = { padding: '12px', borderRadius: '8px', fontSize: '0.9rem' };
const addBtn = { padding: '12px', borderRadius: '8px', marginTop: '10px' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' };
const statCard = {
  background: 'rgba(255, 255, 255, 0.03)',
  padding: '24px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};
const statLabel = { color: '#94a3b8', fontSize: '0.8rem' };
const statValue = { fontSize: '1.8rem', fontWeight: '700' };

const tableHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 24px 15px',
  color: '#475569',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  textTransform: 'uppercase'
};

const scrollArea = { display: 'flex', flexDirection: 'column', gap: '10px' };

const rowStyle = {
  background: 'rgba(255, 255, 255, 0.02)',
  padding: '20px 24px',
  borderRadius: '14px',
  border: '1px solid rgba(255, 255, 255, 0.03)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const assetInfo = { display: 'flex', flexDirection: 'column' };
const assetTitle = { fontWeight: '600', fontSize: '1.1rem' };
const assetID = { fontSize: '0.7rem', color: '#475569' };

const controls = { display: 'flex', alignItems: 'center', gap: '20px' };
const btnGroup = { display: 'flex', gap: '12px', alignItems: 'center' };

const statusBadge = (isRented) => ({
  background: isRented ? 'rgba(244, 63, 94, 0.1)' : 'rgba(52, 211, 153, 0.1)',
  color: isRented ? '#fb7185' : '#34d399',
  padding: '6px 12px',
  borderRadius: '20px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: '100px'
});

const statusDot = (isRented) => ({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: isRented ? '#fb7185' : '#34d399',
  boxShadow: `0 0 8px ${isRented ? '#fb7185' : '#34d399'}`
});