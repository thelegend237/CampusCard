import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card } from '../types';

export const generateCardPDF = async (card: Card): Promise<void> => {
  try {
    // Create a temporary card element for PDF generation
    const tempElement = document.createElement('div');
    tempElement.innerHTML = `
      <div style="
        width: 420px;
        height: 260px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        padding: 20px;
        color: white;
        font-family: Arial, sans-serif;
        position: relative;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <div style="display: flex; align-items: center;">
            <div style="
              width: 40px;
              height: 40px;
              background: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 10px;
            ">
              <span style="color: #667eea; font-weight: bold; font-size: 14px;">IUT</span>
            </div>
            <span style="font-size: 18px; font-weight: bold;">CampusCard</span>
          </div>
          <span style="font-size: 12px;">2025-2026</span>
        </div>
        
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 24px;
          ">
            👤
          </div>
          <div>
            <h2 style="margin: 0; font-size: 20px; font-weight: bold;">${card.firstname} ${card.lastname}</h2>
            <p style="margin: 5px 0; font-size: 14px; opacity: 0.9;">${card.program}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px;">
          <div>
            <p style="margin: 0; opacity: 0.8;">ID: ${card.studentid}</p>
            <p style="margin: 0; opacity: 0.8;">Émission: ${new Date(card.issueddate).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <p style="margin: 0; opacity: 0.8;">Expiration: ${new Date(card.expirydate).toLocaleDateString('fr-FR')}</p>
            <p style="margin: 0; opacity: 0.8;">${card.department}</p>
          </div>
        </div>
        
        <div style="
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 30px;
            height: 30px;
            background: rgba(255,255,255,0.3);
            border-radius: 3px;
          "></div>
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