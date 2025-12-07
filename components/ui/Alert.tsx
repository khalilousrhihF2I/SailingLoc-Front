
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ type = 'info', children, onClose }: AlertProps) {
  const configs = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-800',
      icon: AlertCircle,
      iconColor: 'text-orange-500'
    },
    info: {
      bg: 'bg-ocean-50',
      border: 'border-ocean-200',
      text: 'text-ocean-800',
      icon: Info,
      iconColor: 'text-ocean-500'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border mt-2 mb-2 ${config.bg} ${config.border}`}>
      <Icon className={`shrink-0 ${config.iconColor}`} size={20} />
      <div className={`flex-1 ${config.text}`}>
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`shrink-0 ${config.text} hover:opacity-70`}
        >
          ×
        </button>
      )}
    </div>
  );
}
