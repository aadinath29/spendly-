import Modal from './Modal.jsx';
import Spinner from './Spinner.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner size={16} /> : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-400">{message}</p>
    </Modal>
  );
}
