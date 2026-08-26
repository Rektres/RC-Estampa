import { useState } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';

interface Props {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

export default function ShareButton({
  title = 'RC Estampa RC Estampa',
  text = 'Mira esta prenda de alta calidad en RC Estampa',
  url,
  className = '',
}: Props) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const shareUrl = url || window.location.href;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback a menú desplegable
      }
    }
    setShowDropdown((prev) => !prev);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      setShowDropdown(false);
    } catch {
      // Ignore
    }
  };

  const shareWhatsApp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
    window.open(waUrl, '_blank');
    setShowDropdown(false);
  };

  return (
    <div className="position-relative d-inline-block">
      <button
        onClick={handleShare}
        className={`btn btn-secondary btn-sm d-inline-flex align-items-center gap-1 font-montserrat ${className}`}
        style={{ fontSize: '0.75rem' }}
        title="Compartir"
        aria-label="Compartir enlace"
      >
        <Share2 size={13} />
        <span>Compartir</span>
      </button>

      {/* Fallback Dropdown */}
      {showDropdown && (
        <div
          className="position-absolute end-0 bottom-100 mb-2 p-2 bg-card border border-border rounded-3 shadow-lg d-flex flex-column gap-1"
          style={{ zIndex: 1050, minWidth: '11rem' }}
        >
          <button
            onClick={shareWhatsApp}
            className="btn btn-link text-start text-text font-montserrat small p-2 d-flex align-items-center gap-2 text-decoration-none hover-lift"
            style={{ fontSize: '0.78rem' }}
          >
            <MessageCircle size={14} className="text-primary" />
            <span>Compartir en WhatsApp</span>
          </button>
          <button
            onClick={copyToClipboard}
            className="btn btn-link text-start text-text font-montserrat small p-2 d-flex align-items-center gap-2 text-decoration-none hover-lift"
            style={{ fontSize: '0.78rem' }}
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-muted" />}
            <span>{copied ? '¡Enlace copiado!' : 'Copiar enlace directo'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
