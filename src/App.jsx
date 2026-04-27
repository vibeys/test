import { useEffect, useMemo, useState } from "react"
import { supabase } from "./supabaseClient"

export default function App() {
  const [books, setBooks] = useState([])
  const [title, setTitle] = useState("")
  const [borrower, setBorrower] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    if (!message.text) return
    const timer = setTimeout(() => setMessage({ type: "", text: "" }), 2400)
    return () => clearTimeout(timer)
  }, [message])

  const notify = (type, text) => {
    setMessage({ type, text })
  }

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setBooks(data || [])
    } catch (error) {
      console.error(error)
      notify("error", "Unable to load the library records.")
    } finally {
      setLoading(false)
    }
  }

  const addBook = async (e) => {
    e.preventDefault()

    const cleanTitle = title.trim()
    if (!cleanTitle) {
      notify("error", "Please enter a book title.")
      return
    }

    try {
      setBusyId("add")
      const { error } = await supabase.from("books").insert([
        {
          title: cleanTitle,
          borrower: "",
          is_rented: false,
        },
      ])

      if (error) throw error

      setTitle("")
      notify("success", "Book added successfully.")
      fetchBooks()
    } catch (error) {
      console.error(error)
      notify("error", "Failed to register the book.")
    } finally {
      setBusyId(null)
    }
  }

  const rentBook = async (id) => {
    const cleanBorrower = borrower.trim()
    if (!cleanBorrower) {
      notify("error", "Please input the borrower name first.")
      return
    }

    try {
      setBusyId(id)
      const { error } = await supabase
        .from("books")
        .update({ borrower: cleanBorrower, is_rented: true })
        .eq("id", id)

      if (error) throw error

      setBorrower("")
      notify("success", "Book marked as rented.")
      fetchBooks()
    } catch (error) {
      console.error(error)
      notify("error", "Failed to update rental status.")
    } finally {
      setBusyId(null)
    }
  }

  const returnBook = async (id) => {
    try {
      setBusyId(id)
      const { error } = await supabase
        .from("books")
        .update({ borrower: "", is_rented: false })
        .eq("id", id)

      if (error) throw error

      notify("success", "Book returned successfully.")
      fetchBooks()
    } catch (error) {
      console.error(error)
      notify("error", "Failed to return the book.")
    } finally {
      setBusyId(null)
    }
  }

  const deleteBook = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this record?"
    )
    if (!confirmed) return

    try {
      setBusyId(id)
      const { error } = await supabase.from("books").delete().eq("id", id)

      if (error) throw error

      notify("success", "Record deleted.")
      fetchBooks()
    } catch (error) {
      console.error(error)
      notify("error", "Failed to delete the record.")
    } finally {
      setBusyId(null)
    }
  }

  const stats = useMemo(
    () => ({
      total: books.length,
      rented: books.filter((b) => b.is_rented).length,
      available: books.filter((b) => !b.is_rented).length,
    }),
    [books]
  )

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase()

    return books.filter((book) => {
      const titleMatch = book.title?.toLowerCase().includes(q)
      const borrowerMatch = book.borrower?.toLowerCase().includes(q)
      const searchMatch = !q || titleMatch || borrowerMatch

      const filterMatch =
        filter === "all"
          ? true
          : filter === "rented"
          ? book.is_rented
          : !book.is_rented

      return searchMatch && filterMatch
    })
  }, [books, search, filter])

  return (
    <div className="app-shell">
      <style>{professionalCSS}</style>

      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-badge">LS</div>
          <div>
            <h2 className="brand-title">Library System</h2>
            <p className="brand-subtitle">Library Management Dashboard</p>
          </div>
        </div>

        <form className="panel-card" onSubmit={addBook}>
          <div className="panel-head">
            <span className="panel-label">New Entry</span>
            <span className="panel-hint">Register a book</span>
          </div>

          <input
            className="glass-input"
            placeholder="Enter book title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button
            type="submit"
            className="action-btn-primary"
            disabled={busyId === "add"}
          >
            {busyId === "add" ? "Registering..." : "Register Book"}
          </button>
        </form>

        <div className="panel-card">
          <div className="panel-head">
            <span className="panel-label">Borrower</span>
            <span className="panel-hint">Used when renting</span>
          </div>

          <input
            className="glass-input"
            placeholder="Current borrower name"
            value={borrower}
            onChange={(e) => setBorrower(e.target.value)}
          />
        </div>

        <div className="panel-card">
          <div className="panel-head">
            <span className="panel-label">Search</span>
            <span className="panel-hint">Title or borrower</span>
          </div>

          <input
            className="glass-input"
            placeholder="Search catalog..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </aside>

      <main className="main-area">
        <div className="phone-frame">
          <section className="hero">
            <div className="hero-topline">
              <div className="hero-mini-badge">11:21</div>
              <div className="hero-mini-dots">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="hero-copy">
              <p className="eyebrow">Library Operations</p>
              <h1 className="hero-title">Library System</h1>
              <p className="hero-text">
                Manage books, rentals, and records in one clean dashboard.
              </p>
            </div>

            <button className="ghost-btn" onClick={fetchBooks}>
              Refresh
            </button>
          </section>

          <section className="mobile-controls">
            <div className="mobile-control-card mobile-search-card">
              <div className="panel-head compact">
                <span className="panel-label">Search</span>
              </div>
              <input
                className="glass-input compact-input"
                placeholder="Search catalog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mobile-row">
              <div className="mobile-control-card half-card">
                <div className="panel-head compact">
                  <span className="panel-label">Borrower</span>
                </div>
                <input
                  className="glass-input compact-input"
                  placeholder="Borrower"
                  value={borrower}
                  onChange={(e) => setBorrower(e.target.value)}
                />
              </div>

              <form className="mobile-control-card half-card" onSubmit={addBook}>
                <div className="panel-head compact">
                  <span className="panel-label">New Entry</span>
                </div>
                <input
                  className="glass-input compact-input"
                  placeholder="Book title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <button
                  type="submit"
                  className="action-btn-primary compact-btn"
                  disabled={busyId === "add"}
                >
                  {busyId === "add" ? "Adding..." : "Add"}
                </button>
              </form>
            </div>
          </section>

          {message.text && <div className={`toast ${message.type}`}>{message.text}</div>}

          <section className="stats-grid">
            <button
              className={`stat-card stat-button ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
              type="button"
            >
              <span className="stat-label">Total Books</span>
              <span className="stat-value">{stats.total}</span>
            </button>

            <button
              className={`stat-card stat-button ${filter === "rented" ? "active" : ""}`}
              onClick={() => setFilter("rented")}
              type="button"
            >
              <span className="stat-label">Rented</span>
              <span className="stat-value danger-text">{stats.rented}</span>
            </button>

            <button
              className={`stat-card stat-button ${filter === "available" ? "active" : ""}`}
              onClick={() => setFilter("available")}
              type="button"
            >
              <span className="stat-label">Available</span>
              <span className="stat-value success-text">{stats.available}</span>
            </button>
          </section>

          <section className="list-card">
            <div className="list-header">
              <div>
                <h3>Book Inventory</h3>
                <p>{filteredBooks.length} record(s) shown</p>
              </div>
              <div className="list-search-summary">
                {filter === "all"
                  ? "Showing all books"
                  : filter === "rented"
                  ? "Showing rented books"
                  : "Showing available books"}
                {search ? ` • Search: "${search}"` : ""}
              </div>
            </div>

            {loading ? (
              <div className="loading-state">Loading library records...</div>
            ) : filteredBooks.length === 0 ? (
              <div className="empty-state">
                <h4>No records found</h4>
                <p>Add a new book or adjust your search/filter.</p>
              </div>
            ) : (
              <div className="book-list">
                {filteredBooks.map((book) => (
                  <article key={book.id} className="book-row">
                    <div className="book-info">
                      <h4 className="book-title">{book.title}</h4>
                      <span className="book-id">ID: {String(book.id).slice(0, 8)}</span>
                    </div>

                    <div className="row-right">
                      <div
                        className={`status-badge ${
                          book.is_rented ? "rented" : "available"
                        }`}
                      >
                        <span
                          className={`status-dot ${
                            book.is_rented ? "rented" : "available"
                          }`}
                        />
                        {book.is_rented ? `Rented by ${book.borrower}` : "Available"}
                      </div>

                      <div className="btn-group">
                        {!book.is_rented ? (
                          <button
                            onClick={() => rentBook(book.id)}
                            className="btn btn-rent"
                            disabled={busyId === book.id}
                          >
                            {busyId === book.id ? "Updating..." : "Rent"}
                          </button>
                        ) : (
                          <button
                            onClick={() => returnBook(book.id)}
                            className="btn btn-return"
                            disabled={busyId === book.id}
                          >
                            {busyId === book.id ? "Updating..." : "Return"}
                          </button>
                        )}

                        <button
                          onClick={() => deleteBook(book.id)}
                          className="btn btn-delete"
                          disabled={busyId === book.id}
                          title="Delete record"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

const professionalCSS = `
  * {
    box-sizing: border-box;
  }

  html, body, #root {
    min-height: 100%;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    background:
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 28%),
      radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.10), transparent 32%),
      linear-gradient(180deg, #020617 0%, #050b1a 50%, #020617 100%);
    color: #e2e8f0;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    overflow-x: hidden;
  }

  button, input {
    font: inherit;
  }

  .app-shell {
    display: flex;
    min-height: 100vh;
  }

  .sidebar {
    width: 320px;
    flex: 0 0 320px;
    position: sticky;
    top: 0;
    height: 100vh;
    padding: 28px 22px;
    background:
      linear-gradient(180deg, rgba(15, 23, 42, 0.84), rgba(2, 6, 23, 0.76)),
      rgba(15, 23, 42, 0.82);
    backdrop-filter: blur(24px) saturate(150%);
    border-right: 1px solid rgba(148, 163, 184, 0.12);
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow-y: auto;
    box-shadow: 20px 0 60px rgba(2, 6, 23, 0.2);
  }

  .brand-box {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 10px 18px;
    margin-bottom: 4px;
  }

  .brand-badge {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: white;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(124, 58, 237, 0.95));
    box-shadow: 0 18px 34px rgba(59, 130, 246, 0.28);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .brand-title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #f8fafc;
  }

  .brand-subtitle {
    margin: 4px 0 0;
    font-size: 0.82rem;
    color: #94a3b8;
  }

  .panel-card {
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(148, 163, 184, 0.12);
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 20px 50px rgba(2, 6, 23, 0.25);
    backdrop-filter: blur(18px) saturate(140%);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .panel-head {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .panel-head.compact {
    gap: 0;
  }

  .panel-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: #93c5fd;
    font-weight: 800;
  }

  .panel-hint {
    font-size: 0.85rem;
    color: #94a3b8;
  }

  .glass-input {
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.16);
    background: rgba(15, 23, 42, 0.72);
    color: #f8fafc;
    border-radius: 14px;
    padding: 13px 14px;
    outline: none;
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .glass-input::placeholder {
    color: #64748b;
  }

  .glass-input:focus {
    border-color: rgba(59, 130, 246, 0.95);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.16);
    background: rgba(15, 23, 42, 0.95);
    transform: translateY(-1px);
  }

  .compact-input {
    padding: 11px 12px;
    border-radius: 12px;
  }

  .action-btn-primary,
  .ghost-btn,
  .btn,
  .stat-button {
    border: none;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, background 0.2s ease, filter 0.2s ease;
  }

  .action-btn-primary {
    width: 100%;
    padding: 13px 16px;
    border-radius: 14px;
    color: white;
    font-weight: 800;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    box-shadow: 0 18px 35px rgba(37, 99, 235, 0.24);
  }

  .action-btn-primary:hover {
    transform: translateY(-2px);
    filter: brightness(1.04);
    box-shadow: 0 22px 40px rgba(37, 99, 235, 0.35);
  }

  .action-btn-primary:disabled,
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .main-area {
    flex: 1;
    padding: 28px;
    min-width: 0;
    height: 100vh;
    overflow: hidden;
  }

  .phone-frame {
    width: 100%;
    max-width: 1180px;
    height: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 12px;
    flex: 0 0 auto;
  }

  .hero-topline {
    display: none;
  }

  .hero-copy {
    min-width: 0;
  }

  .eyebrow {
    margin: 0 0 8px;
    color: #93c5fd;
    font-size: 0.75rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    font-weight: 800;
  }

  .hero-title {
    margin: 0;
    font-size: clamp(1.7rem, 2.8vw, 3rem);
    letter-spacing: -0.04em;
    color: #f8fafc;
  }

  .hero-text {
    margin: 8px 0 0;
    max-width: 640px;
    color: #94a3b8;
    line-height: 1.5;
  }

  .ghost-btn {
    padding: 11px 14px;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(148, 163, 184, 0.14);
    color: #e2e8f0;
    font-weight: 700;
    white-space: nowrap;
    backdrop-filter: blur(10px);
  }

  .ghost-btn:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.07);
  }

  .mobile-controls {
    display: none;
  }

  .toast {
    margin-bottom: 10px;
    padding: 12px 14px;
    border-radius: 14px;
    font-weight: 700;
    border: 1px solid transparent;
    animation: floatIn 0.25s ease-out;
    backdrop-filter: blur(14px);
    flex: 0 0 auto;
  }

  .toast.success {
    background: rgba(16, 185, 129, 0.12);
    color: #6ee7b7;
    border-color: rgba(16, 185, 129, 0.24);
  }

  .toast.error {
    background: rgba(239, 68, 68, 0.12);
    color: #fca5a5;
    border-color: rgba(239, 68, 68, 0.24);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 10px;
    flex: 0 0 auto;
  }

  .stat-card {
    border-radius: 20px;
    padding: 16px 14px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(148, 163, 184, 0.12);
    box-shadow: 0 20px 50px rgba(2, 6, 23, 0.18);
    backdrop-filter: blur(18px) saturate(140%);
    text-align: left;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(96, 165, 250, 0.28);
    box-shadow: 0 24px 60px rgba(2, 6, 23, 0.22);
  }

  .stat-card.active {
    border-color: rgba(59, 130, 246, 0.9);
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.14), 0 20px 50px rgba(2, 6, 23, 0.18);
    transform: translateY(-2px);
  }

  .stat-button {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    color: inherit;
  }

  .stat-label {
    display: block;
    font-size: 0.76rem;
    color: #94a3b8;
    margin-bottom: 6px;
  }

  .stat-value {
    display: block;
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: #f8fafc;
  }

  .danger-text {
    color: #fb7185;
  }

  .success-text {
    color: #34d399;
  }

  .list-card {
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(148, 163, 184, 0.12);
    padding: 18px;
    box-shadow: 0 20px 50px rgba(2, 6, 23, 0.18);
    backdrop-filter: blur(18px) saturate(140%);
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: end;
    gap: 12px;
    margin-bottom: 12px;
    flex: 0 0 auto;
  }

  .list-header h3 {
    margin: 0;
    font-size: 1.02rem;
    color: #f8fafc;
  }

  .list-header p {
    margin: 5px 0 0;
    color: #94a3b8;
    font-size: 0.88rem;
  }

  .list-search-summary {
    color: #cbd5e1;
    font-size: 0.84rem;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(148, 163, 184, 0.12);
    backdrop-filter: blur(12px);
  }

  .loading-state,
  .empty-state {
    border-radius: 18px;
    padding: 22px;
    text-align: center;
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(148, 163, 184, 0.18);
  }

  .empty-state h4 {
    margin: 0 0 8px;
    color: #f8fafc;
    font-size: 1rem;
  }

  .empty-state p {
    margin: 0;
  }

  .book-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    min-height: 0;
    flex: 1;
    padding-right: 4px;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  .book-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 16px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(148, 163, 184, 0.1);
    transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
    backdrop-filter: blur(12px);
  }

  .book-row:hover {
    transform: translateY(-2px);
    border-color: rgba(96, 165, 250, 0.26);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 14px 34px rgba(2, 6, 23, 0.14);
  }

  .book-info {
    min-width: 0;
  }

  .book-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: #f8fafc;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .book-id {
    display: inline-block;
    margin-top: 6px;
    font-size: 0.78rem;
    color: #64748b;
  }

  .row-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 700;
    white-space: nowrap;
    backdrop-filter: blur(12px);
  }

  .status-badge.available {
    color: #34d399;
    background: rgba(52, 211, 153, 0.1);
  }

  .status-badge.rented {
    color: #fb7185;
    background: rgba(251, 113, 133, 0.1);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex: 0 0 auto;
  }

  .status-dot.available {
    background: #34d399;
    box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.12);
  }

  .status-dot.rented {
    background: #fb7185;
    box-shadow: 0 0 0 4px rgba(251, 113, 133, 0.12);
  }

  .btn-group {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .btn {
    padding: 10px 14px;
    border-radius: 12px;
    font-weight: 800;
    color: white;
  }

  .btn:hover {
    transform: translateY(-2px);
  }

  .btn-rent {
    background: linear-gradient(135deg, #059669, #10b981);
    box-shadow: 0 14px 28px rgba(16, 185, 129, 0.2);
  }

  .btn-return {
    background: linear-gradient(135deg, #d97706, #f59e0b);
    box-shadow: 0 14px 28px rgba(245, 158, 11, 0.2);
  }

  .btn-delete {
    background: rgba(239, 68, 68, 0.08);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.18);
  }

  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.14);
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(15, 23, 42, 0.32);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.25);
    border-radius: 999px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.42);
  }

  @keyframes floatIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 1024px) {
    .app-shell {
      flex-direction: column;
    }

    .sidebar {
      position: relative;
      top: auto;
      width: 100%;
      height: auto;
      flex: none;
      border-right: none;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    }

    .main-area {
      padding: 18px;
      height: 100vh;
    }

    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .main-area {
      padding: 6px;
      height: 100vh;
      overflow: hidden;
    }

    .phone-frame {
      height: calc(100vh - 12px);
      width: min(100%, 390px);
      margin: 0 auto;
      border-radius: 28px;
      overflow: hidden;
      padding: 8px;
      background:
        linear-gradient(135deg, rgba(125, 211, 252, 0.14), rgba(59, 130, 246, 0.05)),
        linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(2, 6, 23, 0.92));
      border: 1px solid rgba(148, 163, 184, 0.12);
      box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38);
      display: grid;
      grid-template-rows: auto auto auto minmax(0, 1fr);
      gap: 6px;
      min-height: 0;
    }

    .sidebar {
      display: none;
    }

    .hero {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
      gap: 4px;
      margin: 0;
      min-height: 0;
      overflow: hidden;
    }

    .hero-topline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0;
    }

    .hero-mini-badge {
      font-size: 0.74rem;
      color: #f8fafc;
      font-weight: 700;
    }

    .hero-mini-dots {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .hero-mini-dots span {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      background: rgba(248, 250, 252, 0.7);
    }

    .eyebrow {
      margin: 0;
      font-size: 0.6rem;
      letter-spacing: 0.12em;
      line-height: 1;
    }

    .hero-title {
      margin-top: 2px;
      font-size: 1.08rem;
      line-height: 1.05;
    }

    .hero-text {
      display: none;
    }

    .ghost-btn {
      width: 100%;
      padding: 8px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      margin-top: 2px;
    }

    .mobile-controls {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-height: 0;
      overflow: hidden;
      flex: 0 0 auto;
    }

    .mobile-control-card {
      background: rgba(255, 255, 255, 0.035);
      border: 1px solid rgba(148, 163, 184, 0.12);
      border-radius: 14px;
      padding: 8px;
      box-shadow: 0 12px 24px rgba(2, 6, 23, 0.16);
      backdrop-filter: blur(18px) saturate(140%);
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
      width: 100%;
    }

    .mobile-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      min-height: 0;
    }

    .half-card {
      min-width: 0;
    }

    .mobile-search-card {
      width: 100%;
    }

    .mobile-control-card .glass-input {
      padding: 9px 10px;
      border-radius: 10px;
      font-size: 0.84rem;
    }

    .mobile-control-card .action-btn-primary {
      padding: 9px 10px;
      border-radius: 10px;
      font-size: 0.8rem;
    }

    .compact-btn {
      margin-top: 0;
    }

    .stats-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
      margin: 0;
      min-height: 0;
      flex: 0 0 auto;
    }

    .stat-card {
      padding: 9px 8px;
      border-radius: 14px;
      min-height: 72px;
    }

    .stat-label {
      font-size: 0.58rem;
      margin-bottom: 3px;
      letter-spacing: 0.08em;
    }

    .stat-value {
      font-size: 0.92rem;
    }

    .list-card {
      padding: 10px;
      border-radius: 18px;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .list-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
      margin-bottom: 6px;
      flex: 0 0 auto;
    }

    .list-header h3 {
      font-size: 0.9rem;
    }

    .list-header p {
      font-size: 0.72rem;
      margin-top: 2px;
    }

    .list-search-summary {
      width: 100%;
      text-align: center;
      font-size: 0.7rem;
      padding: 6px 8px;
    }

    .loading-state,
    .empty-state {
      padding: 16px;
      border-radius: 14px;
      font-size: 0.82rem;
    }

    .empty-state h4 {
      font-size: 0.9rem;
    }

    .book-list {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding-right: 3px;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      gap: 8px;
    }

    .book-row {
      flex-direction: column;
      align-items: stretch;
      padding: 10px;
      gap: 7px;
      border-radius: 14px;
    }

    .book-title {
      font-size: 0.88rem;
    }

    .book-id {
      font-size: 0.65rem;
      margin-top: 4px;
    }

    .row-right {
      justify-content: flex-start;
      width: 100%;
      gap: 6px;
    }

    .status-badge {
      width: 100%;
      justify-content: center;
      white-space: normal;
      text-align: center;
      font-size: 0.7rem;
      padding: 7px 9px;
    }

    .btn-group {
      width: 100%;
      flex-wrap: wrap;
      gap: 6px;
    }

    .btn {
      flex: 1 1 90px;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 0.8rem;
    }

    .toast {
      font-size: 0.78rem;
      padding: 10px 12px;
      margin-bottom: 6px;
    }
  }
`

//lol