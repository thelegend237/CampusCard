import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface StudentCardDisplayProps {
  studentid: string;
  firstname: string;
  lastname: string;
  dateofbirth?: string;
  placeofbirth?: string;
  program: string;
  department: string;
  avatar?: string;
  showQr?: boolean;
}

const StudentCardDisplay: React.FC<StudentCardDisplayProps> = ({
  studentid,
  firstname,
  lastname,
  dateofbirth,
  placeofbirth,
  program,
  department,
  avatar,
  showQr = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (studentid && showQr) {
      QRCode.toDataURL(studentid)
        .then(url => setQrDataUrl(url))
        .catch(() => setQrDataUrl(null));
    }
  }, [studentid, showQr]);

  return (
    <div className="relative w-[420px] h-[260px]">
      <div
        className="absolute w-full h-full bg-white rounded-xl shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #f8fafc 60%, #e3eafc 100%)',
          borderRadius: '18px',
          boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
          border: '1.5px solid #003366',
          padding: 0,
          color: '#1a202c',
          fontFamily: "'Segoe UI', 'Roboto', Arial, sans-serif",
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: '420px',
          height: '260px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 6px 16px', background: '#fff', borderBottom: '1px solid #e3eafc' }}>
          <img src="/logo-iut.png" alt="Logo" style={{ height: 38 }} crossOrigin="anonymous" />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 }}>UNIVERSITE DE DOUALA</div>
            <div style={{ fontSize: 12, marginTop: 1 }}>INSTITUT UNIVERSITAIRE DE TECHNOLOGIE</div>
            <div style={{ fontSize: 10, color: '#2563eb', marginTop: 1 }}>CARTE D'ETUDIANT - {new Date().getFullYear()}/{new Date().getFullYear() + 1}</div>
          </div>
          <img src="/logo-iut2.png" alt="Logo" style={{ height: 38 }} crossOrigin="anonymous" />
        </div>
        <div style={{ display: 'flex', flex: 1, padding: '10px 16px 0 16px', gap: 10, minHeight: 0 }}>
          <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', rowGap: 4, columnGap: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 'bold' }}>Matricule :</div>
              <div style={{ fontSize: 12 }}>{studentid}</div>
              <div style={{ fontSize: 12, fontWeight: 'bold' }}>Nom et Prénom :</div>
              <div style={{ fontSize: 12 }}>{lastname} {firstname}</div>
              <div style={{ fontSize: 12, fontWeight: 'bold' }}>Né(e) le :</div>
              <div style={{ fontSize: 12 }}>{dateofbirth || ''}</div>
              <div style={{ fontSize: 12, fontWeight: 'bold' }}>Lieu de Naissance :</div>
              <div style={{ fontSize: 12 }}>{placeofbirth || ''}</div>
              <div style={{ fontSize: 12, fontWeight: 'bold' }}>Filière :</div>
              <div style={{ fontSize: 12 }}>{program}</div>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 6, minWidth: 0 }}>
            <div style={{ width: 64, height: 72, background: '#e3eafc', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2 }}>
              {avatar ? (
                <img src={avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
              ) : ''}
            </div>
            {showQr && qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" style={{ width: 48, height: 48, borderRadius: 6, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 2 }} />
            )}
            <div style={{ fontSize: 10, color: '#2563eb', fontStyle: 'italic', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' }}>Visa Directeur</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCardDisplay;
