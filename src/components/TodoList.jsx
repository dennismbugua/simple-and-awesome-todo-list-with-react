import React from "react";

// Tiny contract:
// - inputs: user text input, clicks/keyboard
// - outputs: visually-updated list, localStorage persistence
// - error modes: empty input ignored
// - success: items added, toggled, filtered, deleted

const STORAGE_KEY = "awesome_todos_v1";

const TodoList = () => {
  const [todoList, setTodoList] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [input, setInput] = React.useState("");
  const [filter, setFilter] = React.useState("all"); // all | active | completed
  const inputRef = React.useRef(null);
  const [draggingId, setDraggingId] = React.useState(null);
  const [dragOverId, setDragOverId] = React.useState(null);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todoList));
    } catch (e) {
      // ignore storage errors
    }
  }, [todoList]);

  const addItem = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const item = { id: Date.now() + Math.random(), todo: trimmed, isCompleted: false };
    setTodoList((prev) => [item, ...prev]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addItem();
    if (e.key === "Escape") setInput("");
  };

  const toggleCompleted = (id) => {
    setTodoList((prev) => prev.map((it) => (it.id === id ? { ...it, isCompleted: !it.isCompleted } : it)));
  };

  const removeItem = (id) => {
    setTodoList((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCompleted = () => {
    setTodoList((prev) => prev.filter((it) => !it.isCompleted));
  };

  const filtered = todoList.filter((it) => {
    if (filter === "active") return !it.isCompleted;
    if (filter === "completed") return it.isCompleted;
    return true;
  });

  const remaining = todoList.filter((t) => !t.isCompleted).length;

  return (
    <section className="todo-app" aria-labelledby="todo-heading">
      <div className="card">
        <header className="card-header">
          <div className="header-glow"></div>
          <h2 id="todo-heading">
            <span className="gradient-text">Simple & Awesome Todo</span>
          </h2>
          <p className="muted">Fast, accessible, and delightful — built with care.</p>
        </header>

        <div className="card-body">
          <div
            className="input-row"
            onClick={() => {
              // focus input if user clicks the row surrounding it
              if (inputRef.current) inputRef.current.focus();
            }}
          >
            <label htmlFor="new-todo" className="sr-only">
              Add todo
            </label>
            <div className="input-wrapper">
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                id="new-todo"
                className="todo-input"
                placeholder="What needs to be done?"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="New todo"
              />
            </div>
            <button type="button" className="btn primary" onClick={addItem} aria-label="Add todo">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              Add
            </button>
          </div>

          <div className="controls">
            <div className="filters" role="tablist" aria-label="Filter todos">
              <button
                type="button"
                className={filter === "all" ? "chip active" : "chip"}
                onClick={() => setFilter("all")}
                role="tab"
                aria-selected={filter === "all"}
              >
                All
              </button>
              <button
                type="button"
                className={filter === "active" ? "chip active" : "chip"}
                onClick={() => setFilter("active")}
                role="tab"
                aria-selected={filter === "active"}
              >
                Active
              </button>
              <button
                type="button"
                className={filter === "completed" ? "chip active" : "chip"}
                onClick={() => setFilter("completed")}
                role="tab"
                aria-selected={filter === "completed"}
              >
                Completed
              </button>
            </div>

            <div className="meta">
              <span className="count-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{marginRight: '6px'}}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {remaining} {remaining === 1 ? 'task' : 'tasks'} remaining
              </span>
              <button className="btn small" onClick={clearCompleted} disabled={!todoList.some((t) => t.isCompleted)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{marginRight: '4px'}}>
                  <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Clear completed
              </button>
            </div>
          </div>

          <ul className="todo-list" aria-live="polite">
            {filtered.length === 0 && (
              <li className="empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{marginBottom: '12px', opacity: 0.3}}>
                  <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>No todos yet — add something productive ✨</div>
              </li>
            )}

            {filtered.map(({ id, todo, isCompleted }) => (
              <li
                key={id}
                className={
                  "todo-item" +
                  (draggingId === id ? " dragging" : "") +
                  (dragOverId === id ? " drag-over" : "")
                }
                draggable
                onDragStart={() => setDraggingId(id)}
                onDragEnter={() => setDragOverId(id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  // reorder items: move draggingId before the item with this id
                  if (draggingId == null) return;
                  setTodoList((prev) => {
                    const items = Array.from(prev);
                    const dragIndex = items.findIndex((it) => it.id === draggingId);
                    const overIndex = items.findIndex((it) => it.id === id);
                    if (dragIndex === -1 || overIndex === -1) return prev;
                    const [dragItem] = items.splice(dragIndex, 1);
                    items.splice(overIndex, 0, dragItem);
                    return items;
                  });
                  setDraggingId(null);
                  setDragOverId(null);
                }}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDragOverId(null);
                }}
              >
                <button
                  type="button"
                  className={isCompleted ? "checkbox checked" : "checkbox"}
                  onClick={() => toggleCompleted(id)}
                  aria-pressed={isCompleted}
                  aria-label={isCompleted ? `Mark ${todo} as active` : `Mark ${todo} as completed`}
                >
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>

                <span className={isCompleted ? "todo-text completed" : "todo-text"}>{todo}</span>

                <div className="actions">
                  <button type="button" className="btn icon delete-btn" onClick={() => removeItem(id)} aria-label={`Delete ${todo}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <footer className="card-footer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px', opacity: 0.6}}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="muted">Tip: Press Enter to add • Escape to clear • Drag to reorder</span>
        </footer>
      </div>
    </section>
  );
};

export default TodoList;
