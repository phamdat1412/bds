import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,24,39,0.45)",
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    width: "100%",
    maxWidth: 760,
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 30px 80px rgba(0,0,0,0.18)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
  },
  closeBtn: {
    border: "none",
    background: "#f3f4f6",
    width: 36,
    height: 36,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
  },
};