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
    setTodoList((prev) => [...prev, item]);
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
          <h2 id="todo-heading">Simple & Awesome Todo</h2>
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
            <button type="button" className="btn primary" onClick={addItem} aria-label="Add todo">
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
              <span className="muted">{remaining} left</span>
              <button className="btn small" onClick={clearCompleted} disabled={!todoList.some((t) => t.isCompleted)}>
                Clear completed
              </button>
            </div>
          </div>

          <ul className="todo-list" aria-live="polite">
            {filtered.length === 0 && <li className="empty">No todos — add something productive ✨</li>}

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
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>

                <span className={isCompleted ? "todo-text completed" : "todo-text"}>{todo}</span>

                <div className="actions">
                  <button type="button" className="btn icon" onClick={() => removeItem(id)} aria-label={`Delete ${todo}`}>
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
        <footer className="card-footer muted">Tip: Click an item or press Enter to toggle completion. Escape clears input.</footer>
      </div>
    </section>
  );
};

export default TodoList;
