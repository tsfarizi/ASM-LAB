type FullscreenModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'exit' | 'initial';
};

export const FullscreenExitModal = ({ isOpen, onConfirm, onCancel, type }: FullscreenModalProps) => {
  if (!isOpen) {
    return null;
  }

  const isInitial = type === 'initial';

  const title = isInitial ? 'Mulai Ujian dalam Mode Layar Penuh' : 'Keluar dari Mode Layar Penuh?';
  const message = isInitial
    ? 'Untuk memulai ujian, Anda harus masuk ke mode layar penuh. Pastikan Anda tidak keluar dari mode layar penuh selama ujian.'
    : 'Keluar dari mode layar penuh akan mengakhiri sesi ujian Anda. Kode terakhir Anda akan disimpan dan dinilai.';
  const confirmButtonLabel = isInitial ? 'Mulai Ujian' : 'Ya, Akhiri Ujian';
  const cancelButtonLabel = isInitial ? 'Batal' : 'Batal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="rounded-2xl bg-white p-8 dark:bg-default-900">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-4 text-lg text-gray-900 dark:text-white">{message}</p>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onCancel} className="rounded-2xl bg-default-200 px-6 py-3 font-semibold text-default-800 dark:bg-default-700 dark:text-default-200">
            {cancelButtonLabel}
          </button>
          <button onClick={onConfirm} className="rounded-2xl bg-danger px-6 py-3 font-semibold text-white">
            {confirmButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
