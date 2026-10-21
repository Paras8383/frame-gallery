import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Image as ImageIcon,
  ImagePlus,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
  RefreshCw,
  Pencil,
  LogOut,
} from "lucide-react";
import { galleryService } from "./services/galleryService";
import { useAuth } from "react-oidc-context";
import AuthScreen from "./components/AuthScreen";
import { buildCognitoLogoutUrl } from "./authConfig";

const categories = [
  "All photographs",
  "Nature",
  "Architecture",
  "Travel",
  "Portraits",
];
const maxFileSize = 5 * 1024 * 1024;

function ImageWithFallback({ photo, className = "", alt }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`image-fallback ${className}`}
        role="img"
        aria-label={`${photo.title} image unavailable`}
      >
        <ImageIcon aria-hidden="true" />
        <span>Image unavailable</span>
      </div>
    );
  }
  return (
    <img
      className={className}
      src={photo.src}
      alt={alt || photo.title}
      onError={() => setFailed(true)}
    />
  );
}

function Toasts({ messages }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="false">
      {messages.map((message) => (
        <div
          className={`toast ${message.type}`}
          key={message.id}
          role={message.type === "error" ? "alert" : "status"}
        >
          {message.type === "error" ? (
            <AlertCircle size={15} />
          ) : (
            <Check size={15} />
          )}
          <span>{message.text}</span>
        </div>
      ))}
    </div>
  );
}

function PhotoCard({ photo, onOpen, onDelete }) {
  return (
    <article className="photo-card" data-testid={`photo-card-${photo.id}`}>
      <div
        className="photo-image-wrap"
        onClick={() => onOpen(photo)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(photo);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`View ${photo.title}`}
        data-testid={`open-photo-${photo.id}`}
      >
        <ImageWithFallback photo={photo} className="photo-image" />
        <button
          className="card-delete"
          type="button"
          aria-label={`Delete ${photo.title}`}
          title="Delete photograph"
          data-testid={`delete-photo-${photo.id}`}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(photo);
          }}
        >
          <Trash2 aria-hidden="true" />
        </button>
      </div>
      <div className="photo-caption">
        <div>
          <h2 className="photo-title">{photo.title}</h2>
          <p className="photo-subtitle">{photo.date}</p>
        </div>
        <span className="photo-category">{photo.category}</span>
      </div>
    </article>
  );
}

function ModalFrame({ children, onClose, className = "", label, testId }) {
  const frameRef = useRef(null);
  const previousFocus = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    previousFocus.current = document.activeElement;
    const focusTimer = window.setTimeout(() => frameRef.current?.focus(), 0);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key === "Tab" && frameRef.current) {
        const focusables = [
          ...frameRef.current.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]',
          ),
        ];
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus?.();
    };
  }, []);

  return (
    <div
      className={`overlay ${className}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      data-testid={testId}
    >
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        ref={frameRef}
      >
        {children}
      </section>
    </div>
  );
}

function UploadDialog({ onClose, onUpload }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Nature");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const setSelectedFile = (nextFile) => {
    setError("");
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Choose an image file to continue.");
      return;
    }
    if (nextFile.size > maxFileSize) {
      setError("Images must be smaller than 5 MB.");
      return;
    }
    setFile(nextFile);
    setTitle(
      (current) =>
        current || nextFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    );
    setPreview(URL.createObjectURL(nextFile));
  };
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const submit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Choose an image before adding it to your collection.");
      return;
    }
    if (!title.trim()) {
      setError("Give this photograph a title.");
      return;
    }
    setSaving(true);
    try {
      await onUpload({ file, title, category });
      onClose();
    } catch (uploadError) {
      setError(
        uploadError.message || "The photograph could not be added. Try again.",
      );
      setSaving(false);
    }
  };
  const close = useCallback(() => {
    if (!saving) onClose();
  }, [onClose, saving]);
  return (
    <ModalFrame onClose={close} label="Add a photograph" testId="upload-dialog">
      <div className="dialog-head">
        <div>
          <p className="eyebrow">A new frame</p>
          <h2>Add to your collection</h2>
          <p>Choose a photograph and give it a little context.</p>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={close}
          aria-label="Close upload dialog"
          data-testid="close-upload"
        >
          <X />
        </button>
      </div>
      <form onSubmit={submit}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          data-testid="image-file-input"
          onChange={(event) => setSelectedFile(event.target.files?.[0])}
        />
        <div
          className={`drop-zone ${dragging ? "dragging" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            setSelectedFile(event.dataTransfer.files?.[0]);
          }}
          data-testid="image-drop-zone"
        >
          {preview ? (
            <img
              className="upload-preview"
              src={preview}
              alt="Selected image preview"
            />
          ) : (
            <Upload aria-hidden="true" />
          )}
          <strong>{file ? file.name : "Drop an image here, or browse"}</strong>
          <span>
            {file
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB · Click to choose another`
              : "JPG, PNG or WEBP · Up to 5 MB"}
          </span>
        </div>
        <label className="form-label" htmlFor="photo-title">
          Title
        </label>
        <input
          id="photo-title"
          className="form-input"
          value={title}
          maxLength={70}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Give this photograph a name"
          data-testid="image-title-input"
        />
        <label className="form-label" htmlFor="photo-category">
          Collection
        </label>
        <select
          id="photo-category"
          className="form-select"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          data-testid="image-category-select"
        >
          {categories.slice(1).map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        {error && (
          <p className="form-error" role="alert" data-testid="upload-error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={close}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="primary-button"
            type="submit"
            disabled={saving}
            data-testid="submit-upload"
          >
            {saving ? (
              <>
                <LoaderCircle className="spin" size={15} /> Adding…
              </>
            ) : (
              <>
                <Plus size={15} /> Add photograph
              </>
            )}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

function EditDialog({ photo, onClose, onSave }) {
  const [title, setTitle] = useState(photo.title || "");
  const [category, setCategory] = useState(photo.category || "Nature");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories = ["Nature", "Architecture", "Travel", "Portraits"];

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle || trimmedTitle.length > 120) {
      setError("Title must be between 1 and 120 characters.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({ title: trimmedTitle, category });
    } catch (err) {
      setError(err.message || "Could not update photograph.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalFrame onClose={onClose}>
      <div className="dialog-head">
        <div>
          <p className="eyebrow">YOUR COLLECTION</p>
          <h2>Edit photograph</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="form-label" htmlFor="edit-photo-title">
          Photograph title
        </label>
        <input
          id="edit-photo-title"
          className="form-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
        />

        <label className="form-label" htmlFor="edit-photo-category">
          Category
        </label>
        <select
          id="edit-photo-category"
          className="form-select"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        {error && <p className="form-error">{error}</p>}

        <div className="dialog-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <Check size={16} />
            )}
            Save changes
          </button>
        </div>
      </form>
    </ModalFrame>
  );
}

function DeleteDialog({ photo, onClose, onConfirm, deleting }) {
  return (
    <ModalFrame
      onClose={deleting ? () => {} : onClose}
      label="Confirm photograph deletion"
      testId="delete-dialog"
    >
      <div className="dialog-head">
        <div>
          <p className="eyebrow">Remove from collection</p>
          <h2>Delete photograph?</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Close confirmation"
          disabled={deleting}
        >
          <X />
        </button>
      </div>
      <p className="confirm-copy">
        <strong>{photo.title}</strong> will be removed from your collection.
        This cannot be undone.
      </p>
      <div className="dialog-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={onClose}
          disabled={deleting}
        >
          Keep photograph
        </button>
        <button
          className="danger-button"
          type="button"
          onClick={onConfirm}
          disabled={deleting}
          data-testid="confirm-delete"
        >
          {deleting ? "Removing…" : "Delete photograph"}
        </button>
      </div>
    </ModalFrame>
  );
}

function Lightbox({ photo, onClose, onDelete, onEdit }) {
  const close = useCallback(() => onClose(), [onClose]);
  return (
    <ModalFrame
      onClose={close}
      className="lightbox"
      label={`Photograph: ${photo.title}`}
      testId="photo-lightbox"
    >
      <button
        className="icon-button lightbox-close"
        type="button"
        onClick={close}
        aria-label="Close photograph"
        data-testid="close-lightbox"
      >
        <X />
      </button>
      <div className="lightbox-image-wrap">
        <ImageWithFallback photo={photo} className="lightbox-image" />
      </div>
      <div className="lightbox-info">
        <p className="eyebrow">{photo.category} / selected frame</p>
        <h2>{photo.title}</h2>
        <p className="lightbox-date">{photo.date}</p>
        <p className="lightbox-description">{photo.description}</p>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onEdit(photo)}
        >
          <Pencil size={14} /> Edit details
        </button>
        <button
          className="lightbox-delete"
          type="button"
          onClick={() => onDelete(photo)}
          data-testid="lightbox-delete"
        >
          <Trash2 size={14} /> Remove photograph
        </button>
      </div>
    </ModalFrame>
  );
}

function GalleryApp({ auth }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [category, setCategory] = useState("All photographs");
  const [query, setQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [messages, setMessages] = useState([]);
  const toastTimers = useRef(new Map());
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  const toast = useCallback((text, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setMessages((current) => [...current, { id, text, type }]);
    const timer = window.setTimeout(() => {
      setMessages((current) => current.filter((message) => message.id !== id));
      toastTimers.current.delete(id);
    }, 3600);
    toastTimers.current.set(id, timer);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await auth.removeUser();
      window.location.assign(buildCognitoLogoutUrl());
    } catch {
      setSigningOut(false);
      toast("We couldn’t sign you out. Please try again.", "error");
    }
  };

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setPhotos(await galleryService.list());
    } catch {
      setLoadError("Your collection could not be loaded right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPhotos();
    return () =>
      toastTimers.current.forEach((timer) => window.clearTimeout(timer));
  }, [loadPhotos]);

  const savePhotoDetails = async ({ title, category }) => {
    if (!editingPhoto) return;

    await galleryService.update(editingPhoto.id, { title, category });

    setPhotos((current) =>
      current.map((photo) =>
        photo.id === editingPhoto.id ? { ...photo, title, category } : photo,
      ),
    );

    setEditingPhoto(null);
    setSelected(null);
    toast(`"${title}" details updated.`);
  };

  const visiblePhotos = useMemo(
    () =>
      photos.filter((photo) => {
        const matchesCategory =
          category === "All photographs" || photo.category === category;
        const matchesQuery = photo.title
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase());
        return matchesCategory && matchesQuery;
      }),
    [photos, category, query],
  );

  const addPhoto = async (details) => {
    const created = await galleryService.add(details);
    setPhotos((current) => [created, ...current]);
    toast(`“${created.title}” is now in your collection.`);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await galleryService.remove(pendingDelete.id);
      setPhotos((current) =>
        current.filter((photo) => photo.id !== pendingDelete.id),
      );
      if (selected?.id === pendingDelete.id) setSelected(null);
      toast(`“${pendingDelete.title}” was removed from your collection.`);
      setPendingDelete(null);
    } catch (error) {
      toast(error.message || "The photograph could not be removed.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const openDelete = (photo) => {
    setSelected(null);
    setPendingDelete(photo);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="/"
          aria-label="Frame home"
          data-testid="frame-brand"
        >
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand-name">Frame</span>
        </a>
        <nav className="nav-right" aria-label="Main navigation">
          <a
            className="nav-link"
            href="#collection"
            data-testid="collection-nav"
          >
            Collection
          </a>
          <div className="auth-controls">
            <span className="auth-email" title={auth.user?.profile?.email || "Signed in"}>
              {auth.user?.profile?.email || "Signed in"}
            </span>
            <button
              className="signout-button"
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              aria-label="Sign out of Frame"
              data-testid="sign-out"
            >
              <LogOut size={14} aria-hidden="true" />
              <span>{signingOut ? "Signing out…" : "Sign out"}</span>
            </button>
          </div>
          <button
            className="upload-button"
            type="button"
            onClick={() => setUploadOpen(true)}
            data-testid="open-upload"
          >
            <Plus aria-hidden="true" />
            <span>Upload image</span>
          </button>
        </nav>
      </header>
      <main className="main-content" id="collection">
        <aside className="gallery-auth-notice" role="note" data-testid="auth-security-boundary">
          <strong>Sign-in only gates this interface.</strong>
          <span>The AWS gallery API is not yet authenticated or isolated by account.</span>
        </aside>
        <section className="intro">
          <div>
            <p className="eyebrow">A personal collection</p>
            <h1>
              Photographs
              <br />
              worth keeping.
            </h1>
            <p className="intro-copy">
              A quiet place for the moments, places, and passing light you want
              to remember.
            </p>
          </div>
          <div className="collection-count" data-testid="collection-count">
            <strong>{String(photos.length).padStart(2, "0")}</strong> frames
            collected
          </div>
        </section>
        <section className="toolbar" aria-label="Gallery filters">
          <div
            className="filters"
            role="group"
            aria-label="Filter photographs by collection"
          >
            {categories.map((item) => (
              <button
                className={`filter-button ${category === item ? "active" : ""}`}
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                data-testid={`filter-${item.toLowerCase().replaceAll(" ", "-")}`}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="search-wrap">
            <Search aria-hidden="true" />
            <input
              className="search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a photograph"
              aria-label="Search photograph titles"
              data-testid="gallery-search"
            />
          </label>
        </section>
        <div className="gallery-meta">
          <button
            className="refresh-button"
            type="button"
            onClick={loadPhotos}
            disabled={loading}
            aria-label="Refresh gallery"
          >
            <RefreshCw size={14} />
            {loading ? "Refreshing..." : "Refresh gallery"}
          </button>
          <span>
            <strong>
              {loading
                ? "Gathering frames…"
                : `${visiblePhotos.length} ${visiblePhotos.length === 1 ? "photograph" : "photographs"}`}
            </strong>
            {category !== "All photographs" ? ` in ${category}` : ""}
          </span>
          <span>Curated slowly, kept close</span>
        </div>
        {loading ? (
          <div
            className="photo-grid"
            aria-label="Loading gallery"
            data-testid="gallery-loading"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div className="skeleton" key={index} />
            ))}
          </div>
        ) : loadError ? (
          <div className="error-state" role="alert" data-testid="gallery-error">
            <div className="empty-icon">
              <AlertCircle />
            </div>
            <h2>Something went quiet.</h2>
            <p>{loadError}</p>
            <button
              className="primary-button"
              type="button"
              onClick={loadPhotos}
            >
              Try again
            </button>
          </div>
        ) : visiblePhotos.length ? (
          <div className="photo-grid" data-testid="photo-grid">
            {visiblePhotos.map((photo) => (
              <PhotoCard
                photo={photo}
                key={photo.id}
                onOpen={setSelected}
                onDelete={openDelete}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state" data-testid="gallery-empty">
            <div className="empty-icon">
              <ImagePlus />
            </div>
            <h2>
              {photos.length ? "No frames found." : "A collection begins here."}
            </h2>
            <p>
              {photos.length
                ? "Try another title or collection."
                : "Add a photograph to give this space a first memory."}
            </p>
            {photos.length ? (
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All photographs");
                }}
              >
                Clear filters
              </button>
            ) : (
              <button
                className="primary-button"
                type="button"
                onClick={() => setUploadOpen(true)}
              >
                <Plus size={15} /> Add a photograph
              </button>
            )}
          </div>
        )}
        <footer className="footer">
          <span>FRAME — PERSONAL IMAGE ARCHIVE</span>
          <span>Made for looking back</span>
        </footer>
      </main>
      {uploadOpen && (
        <UploadDialog
          onClose={() => setUploadOpen(false)}
          onUpload={addPhoto}
        />
      )}
      {selected && !pendingDelete && (
        <Lightbox
          photo={selected}
          onClose={() => setSelected(null)}
          onDelete={openDelete}
          onEdit={(photo) => {
            setEditingPhoto(photo);
            setSelected(null);
          }}
        />
      )}
      {pendingDelete && (
        <DeleteDialog
          photo={pendingDelete}
          onClose={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
          deleting={deleting}
        />
      )}
      {editingPhoto && (
        <EditDialog
          photo={editingPhoto}
          onClose={() => setEditingPhoto(null)}
          onSave={savePhotoDetails}
        />
      )}
      <Toasts messages={messages} />
    </div>
  );
}

function App() {
  const auth = useAuth();
  const [actionError, setActionError] = useState("");

  const handleSignIn = async () => {
    setActionError("");
    try {
      await auth.signinRedirect();
    } catch (error) {
      setActionError(error);
    }
  };

  if (auth.isLoading) {
    return <AuthScreen isLoading />;
  }

  if (!auth.isAuthenticated) {
    return (
      <AuthScreen
        isRedirecting={auth.activeNavigator === "signinRedirect"}
        authError={auth.error}
        actionError={actionError}
        onSignIn={handleSignIn}
      />
    );
  }

  return <GalleryApp auth={auth} />;
}

export default App;
