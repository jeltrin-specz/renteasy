import { HiCheckCircle, HiExclamationCircle, HiInformationCircle } from 'react-icons/hi';

const icons = {
  success: <HiCheckCircle />,
  error: <HiExclamationCircle />,
  info: <HiInformationCircle />,
};

export default function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {icons[t.type] || icons.info}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
