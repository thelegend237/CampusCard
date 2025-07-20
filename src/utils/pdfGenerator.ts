import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { Card } from '../types';

export const generateCardPDF = async (card: Card): Promise<void> => {
  try {
    // Les images doivent être publiques et accessibles en CORS !
    // Mets le logo officiel dans /public/logo-iut.png
    const logoUrl1 = '/logo-iut.png';
    const logoUrl2 = '/logo-iut2.png';
    // Génère le QR code (par exemple, encode le matricule ou l'URL de vérification)
    const qrDataUrl = await QRCode.toDataURL(card.studentid || 'CampusCard');

    // Create a temporary card element for PDF generation
    const tempElement = document.createElement('div');
    tempElement.innerHTML = `
      <div style="
        width: 420px;
        height: 260px;
        background: linear-gradient(135deg, #f8fafc 60%, #e3eafc 100%);
        border-radius: 18px;
        box-shadow: 0 4px 18px rgba(0,0,0,0.10);
        border: 1.5px solid #003366;
        padding: 0;
        color: #1a202c;
        font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px 6px 16px; background: #fff; border-bottom: 1px solid #e3eafc;">
          <img src="${logoUrl1}" alt="Logo" style="height: 38px;" crossorigin="anonymous" />
          <div style="text-align: center; flex: 1;">
            <div style="font-weight: bold; font-size: 15px; letter-spacing: 0.5px;">UNIVERSITE DE DOUALA</div>
            <div style="font-size: 12px; margin-top: 1px;">INSTITUT UNIVERSITAIRE DE TECHNOLOGIE</div>
            <div style="font-size: 10px; color: #2563eb; margin-top: 1px;">CARTE D'ETUDIANT - ${new Date().getFullYear()}/${new Date().getFullYear() + 1}</div>
          </div>
          <img src="${logoUrl2}" alt="Logo" style="height: 38px;" crossorigin="anonymous" />
        </div>
        <div style="display: flex; flex: 1; padding: 10px 16px 0 16px; gap: 10px; min-height: 0;">
          <div style="flex: 2; display: flex; flex-direction: column; justify-content: center; min-width: 0;">
            <div style="display: grid; grid-template-columns: max-content 1fr; row-gap: 4px; column-gap: 12px; align-items: center;">
              <div style='font-size: 12px; font-weight: bold;'>Matricule :</div>
              <div style='font-size: 12px;'>${card.studentid}</div>
              <div style='font-size: 12px; font-weight: bold;'>Nom et Prénom :</div>
              <div style='font-size: 12px;'>${card.lastname} ${card.firstname}</div>
              <div style='font-size: 12px; font-weight: bold;'>Né(e) le :</div>
              <div style='font-size: 12px;'>${card.dateofbirth || ''}</div>
              <div style='font-size: 12px; font-weight: bold;'>Lieu de Naissance :</div>
              <div style='font-size: 12px;'>${card.placeofbirth || ''}</div>
              <div style='font-size: 12px; font-weight: bold;'>Filière :</div>
              <div style='font-size: 12px;'>${card.program}</div>
            </div>
          </div>
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 6px; min-width: 0;">
            <div style="width: 64px; height: 72px; background: #e3eafc; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(37,99,235,0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 2px;">
              ${card.avatar ? `<img src="${card.avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" crossorigin="anonymous" />` : ''}
            </div>
            <img src="${qrDataUrl}" alt="QR Code" style="width: 48px; height: 48px; border-radius: 6px; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 2px;" />
            <div style="font-size: 10px; color: #2563eb; font-style: italic; letter-spacing: 0.5px; margin-top: 2px; text-align: center;">Visa Directeur</div>
          </div>
        </div>
      </div>
    `;
    tempElement.style.position = 'fixed';
    tempElement.style.left = '-9999px';
    tempElement.style.top = '-9999px';
    document.body.appendChild(tempElement);

    // Convert to canvas
    const canvas = await html2canvas(tempElement, {
      scale: 2,
      backgroundColor: null,
      useCORS: true
    });

    // Remove temporary element
    document.body.removeChild(tempElement);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98] // Standard ID card size
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);

    // Download PDF
    pdf.save(`carte-etudiant-${card.studentid}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Erreur lors de la génération du PDF');
  }
};

export const generateReceiptPDF = async (payment: any): Promise<void> => {
  try {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('IUT de Douala', 20, 20);
    pdf.setFontSize(14);
    pdf.text('CampusCard Creator', 20, 30);
    
    // Title
    pdf.setFontSize(18);
    pdf.text('Reçu de paiement', 20, 50);
    
    // Payment details
    pdf.setFontSize(12);
    pdf.text(`ID de transaction: ${payment.id}`, 20, 70);
    pdf.text(`Date: ${new Date(payment.created_at).toLocaleDateString('fr-FR')}`, 20, 80);
    pdf.text(`Description: ${payment.description}`, 20, 90);
    pdf.text(`Montant: ${payment.amount.toLocaleString()} FCFA`, 20, 100);
    pdf.text(`Statut: ${payment.status === 'approved' ? 'Payé' : 'En attente'}`, 20, 110);
    
    // Footer
    pdf.setFontSize(10);
    pdf.text('Ce reçu est généré automatiquement par le système CampusCard Creator', 20, 280);
    
    pdf.save(`recu-paiement-${payment.id}.pdf`);
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    throw new Error('Erreur lors de la génération du reçu');
  }
};