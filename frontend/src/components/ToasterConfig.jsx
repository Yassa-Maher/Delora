import { Toaster } from 'react-hot-toast';

export default function ToasterConfig() {
  return (
    <Toaster
      position="top-left"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          direction: 'rtl',
          fontFamily: 'inherit',
          textAlign: 'right',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          maxWidth: '380px',
        },
        success: {
          iconTheme: { primary: '#388e3c', secondary: '#fff' },
          style: { background: '#e8f5e9', color: '#1b5e20', border: '1px solid #a5d6a7' },
        },
        error: {
          iconTheme: { primary: '#d32f2f', secondary: '#fff' },
          style: { background: '#ffebee', color: '#b71c1c', border: '1px solid #ef9a9a' },
        },
      }}
    />
  );
}
