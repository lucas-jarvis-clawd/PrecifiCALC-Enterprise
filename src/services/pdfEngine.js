/**
 * PrecifiCALC Enterprise - Professional PDF Engine
 * 
 * Core PDF generation engine using jsPDF + jspdf-autotable.
 * Supports white-label branding, charts, executive reports, and segment templates.
 */
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ─── Constants ──────────────────────────────────────────────────
const PAGE = {
  WIDTH: 210,       // A4 width mm
  HEIGHT: 297,      // A4 height mm
  MARGIN_LEFT: 20,
  MARGIN_RIGHT: 20,
  MARGIN_TOP: 35,
  MARGIN_BOTTOM: 25,
  CONTENT_WIDTH: 170, // 210 - 20 - 20
};

const FONTS = {
  TITLE: 18,
  SUBTITLE: 14,
  SECTION: 12,
  BODY: 10,
  SMALL: 8,
  TINY: 7,
};

// ─── Color Utils ────────────────────────────────────────────────
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 79, g: 70, b: 229 }; // fallback indigo
}

function lightenColor(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  return {
    r: Math.min(255, Math.round(r + (255 - r) * percent)),
    g: Math.min(255, Math.round(g + (255 - g) * percent)),
    b: Math.min(255, Math.round(b + (255 - b) * percent)),
  };
}

function darkenColor(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  return {
    r: Math.round(r * (1 - percent)),
    g: Math.round(g * (1 - percent)),
    b: Math.round(b * (1 - percent)),
  };
}

// ─── Company Info Loader ────────────────────────────────────────
export function getEmpresaInfo() {
  let config = {}, perfil = {};
  try { config = JSON.parse(localStorage.getItem('precificalc_config') || '{}'); } catch {}
  try { perfil = JSON.parse(localStorage.getItem('precificalc_perfil') || '{}'); } catch {}
  return {
    nome: config.nomeEmpresa || perfil.nomeEmpresa || 'Empresa',
    cnpj: config.cnpj || perfil.cnpj || '',
    endereco: config.endereco || '',
    telefone: config.telefone || '',
    email: config.email || '',
    segmento: config.segmento || perfil.segmento || '',
    cor: config.corMarca || '#4f46e5',
    logo: config.logoBase64 || null,
  };
}

// ─── Format Helpers ─────────────────────────────────────────────
export function fmtCurrency(v) {
  return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function fmtPercent(v) {
  return `${(v || 0).toFixed(2)}%`;
}

export function fmtDate(d) {
  return (d || new Date()).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

function fmtDateShort(d) {
  return (d || new Date()).toLocaleDateString('pt-BR');
}

// ─── PDF Engine Class ───────────────────────────────────────────
export class PDFEngine {
  constructor(options = {}) {
    this.empresa = options.empresa || getEmpresaInfo();
    this.brandColor = this.empresa.cor || '#4f46e5';
    this.brandRgb = hexToRgb(this.brandColor);
    this.brandLight = lightenColor(this.brandColor, 0.9);
    this.brandMedium = lightenColor(this.brandColor, 0.7);
    
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    this.pageNumber = 1;
    this.y = PAGE.MARGIN_TOP;
    this.title = options.title || 'Relatório';
    this.subtitle = options.subtitle || '';
    this.date = options.date || new Date();
    this.showPageNumbers = options.showPageNumbers !== false;
    this.showWatermark = options.showWatermark !== false;
  }

  // ─── Page Management ────────────────────────────────────────
  addPage() {
    this.doc.addPage();
    this.pageNumber++;
    this.y = PAGE.MARGIN_TOP;
    this._drawHeader();
    this._drawFooter();
  }

  checkPageBreak(neededHeight = 30) {
    if (this.y + neededHeight > PAGE.HEIGHT - PAGE.MARGIN_BOTTOM) {
      this.addPage();
      return true;
    }
    return false;
  }

  // ─── Header & Footer ───────────────────────────────────────
  _drawHeader() {
    const doc = this.doc;
    const { r, g, b } = this.brandRgb;

    // Top color bar
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, PAGE.WIDTH, 8, 'F');
    
    // Gradient fade effect
    const light = lightenColor(this.brandColor, 0.5);
    doc.setFillColor(light.r, light.g, light.b);
    doc.rect(0, 8, PAGE.WIDTH, 2, 'F');

    // Company name
    if (this.empresa.logo) {
      try {
        doc.addImage(this.empresa.logo, 'PNG', PAGE.MARGIN_LEFT, 12, 30, 12);
        doc.setFontSize(FONTS.SMALL);
        doc.setTextColor(100, 100, 100);
        doc.text(this.empresa.nome, PAGE.MARGIN_LEFT + 33, 17);
      } catch {
        this._drawTextLogo();
      }
    } else {
      this._drawTextLogo();
    }

    // Right side: date + document info
    doc.setFontSize(FONTS.TINY);
    doc.setTextColor(150, 150, 150);
    doc.text(fmtDateShort(this.date), PAGE.WIDTH - PAGE.MARGIN_RIGHT, 14, { align: 'right' });
    if (this.empresa.cnpj) {
      doc.text(`CNPJ: ${this.empresa.cnpj}`, PAGE.WIDTH - PAGE.MARGIN_RIGHT, 18, { align: 'right' });
    }
    
    // Thin separator line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(PAGE.MARGIN_LEFT, 26, PAGE.WIDTH - PAGE.MARGIN_RIGHT, 26);
  }

  _drawTextLogo() {
    const doc = this.doc;
    const { r, g, b } = this.brandRgb;
    
    // Logo square
    doc.setFillColor(r, g, b);
    doc.roundedRect(PAGE.MARGIN_LEFT, 12, 10, 10, 2, 2, 'F');
    doc.setFontSize(FONTS.SECTION);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(this.empresa.nome.charAt(0).toUpperCase(), PAGE.MARGIN_LEFT + 5, 19, { align: 'center' });
    
    // Company name
    doc.setFontSize(FONTS.BODY);
    doc.setTextColor(30, 41, 59);
    doc.text(this.empresa.nome, PAGE.MARGIN_LEFT + 13, 17);
    
    if (this.empresa.segmento) {
      doc.setFontSize(FONTS.TINY);
      doc.setTextColor(148, 163, 184);
      doc.text(this.empresa.segmento, PAGE.MARGIN_LEFT + 13, 21);
    }
  }

  _drawFooter() {
    const doc = this.doc;
    const { r, g, b } = this.brandRgb;
    const footerY = PAGE.HEIGHT - 15;
    
    // Footer line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(PAGE.MARGIN_LEFT, footerY, PAGE.WIDTH - PAGE.MARGIN_RIGHT, footerY);
    
    // Left: powered by
    doc.setFontSize(FONTS.TINY);
    doc.setTextColor(180, 180, 180);
    doc.text(`${this.empresa.nome} • Powered by PrecifiCALC Enterprise`, PAGE.MARGIN_LEFT, footerY + 5);
    
    // Right: page number
    if (this.showPageNumbers) {
      doc.setTextColor(r, g, b);
      doc.text(`Página ${this.pageNumber}`, PAGE.WIDTH - PAGE.MARGIN_RIGHT, footerY + 5, { align: 'right' });
    }

    // Bottom color bar
    doc.setFillColor(r, g, b);
    doc.rect(0, PAGE.HEIGHT - 4, PAGE.WIDTH, 4, 'F');
  }

  // ─── Title Page ─────────────────────────────────────────────
  addTitlePage(options = {}) {
    const doc = this.doc;
    const { r, g, b } = this.brandRgb;
    const title = options.title || this.title;
    const subtitle = options.subtitle || this.subtitle;
    const extraLines = options.extraLines || [];

    // Full color top section
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, PAGE.WIDTH, 100, 'F');

    // Decorative pattern (subtle geometric)
    const lighter = lightenColor(this.brandColor, 0.15);
    doc.setFillColor(lighter.r, lighter.g, lighter.b);
    doc.circle(PAGE.WIDTH - 30, 30, 45, 'F');
    doc.circle(PAGE.WIDTH - 10, 70, 25, 'F');
    doc.setFillColor(r, g, b); // restore
    doc.circle(PAGE.WIDTH - 30, 30, 40, 'F');
    doc.circle(PAGE.WIDTH - 10, 70, 20, 'F');

    // Logo area
    if (this.empresa.logo) {
      try {
        doc.addImage(this.empresa.logo, 'PNG', PAGE.MARGIN_LEFT, 20, 40, 16);
      } catch {
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(this.empresa.nome, PAGE.MARGIN_LEFT, 35);
      }
    } else {
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(this.empresa.nome, PAGE.MARGIN_LEFT, 35);
    }

    // Title
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(title, PAGE.CONTENT_WIDTH - 20);
    doc.text(titleLines, PAGE.MARGIN_LEFT, 60);

    // Subtitle
    if (subtitle) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255, 200);
      doc.text(subtitle, PAGE.MARGIN_LEFT, 60 + titleLines.length * 10 + 5);
    }

    // Info section below colored area
    let infoY = 120;
    
    // Date
    doc.setFontSize(FONTS.BODY);
    doc.setTextColor(100, 116, 139);
    doc.text(`Data: ${fmtDate(this.date)}`, PAGE.MARGIN_LEFT, infoY);
    infoY += 8;

    // Company details
    if (this.empresa.cnpj) {
      doc.text(`CNPJ: ${this.empresa.cnpj}`, PAGE.MARGIN_LEFT, infoY);
      infoY += 6;
    }
    if (this.empresa.endereco) {
      doc.text(`Endereço: ${this.empresa.endereco}`, PAGE.MARGIN_LEFT, infoY);
      infoY += 6;
    }
    if (this.empresa.telefone) {
      doc.text(`Telefone: ${this.empresa.telefone}`, PAGE.MARGIN_LEFT, infoY);
      infoY += 6;
    }
    if (this.empresa.email) {
      doc.text(`E-mail: ${this.empresa.email}`, PAGE.MARGIN_LEFT, infoY);
      infoY += 6;
    }

    // Extra info lines
    extraLines.forEach(line => {
      doc.text(line, PAGE.MARGIN_LEFT, infoY);
      infoY += 6;
    });

    // Confidentiality notice
    infoY += 10;
    doc.setFillColor(this.brandLight.r, this.brandLight.g, this.brandLight.b);
    doc.roundedRect(PAGE.MARGIN_LEFT, infoY, PAGE.CONTENT_WIDTH, 20, 3, 3, 'F');
    doc.setFontSize(FONTS.SMALL);
    doc.setTextColor(r, g, b);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCUMENTO CONFIDENCIAL', PAGE.WIDTH / 2, infoY + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(FONTS.TINY);
    doc.setTextColor(100, 116, 139);
    doc.text('Este documento contém informações estratégicas e financeiras de uso exclusivo do destinatário.',
      PAGE.WIDTH / 2, infoY + 14, { align: 'center' });

    // Bottom footer on title page
    doc.setFontSize(FONTS.TINY);
    doc.setTextColor(180, 180, 180);
    doc.text('Gerado automaticamente por PrecifiCALC Enterprise', PAGE.WIDTH / 2, PAGE.HEIGHT - 20, { align: 'center' });
    
    doc.setFillColor(r, g, b);
    doc.rect(0, PAGE.HEIGHT - 4, PAGE.WIDTH, 4, 'F');

    // Next page starts the content
    this.addPage();
  }

  // ─── Content Elements ───────────────────────────────────────
  
  addSectionTitle(text) {
    this.checkPageBreak(15);
    const doc = this.doc;
    const { r, g, b } = this.brandRgb;

    // Left accent bar
    doc.setFillColor(r, g, b);
    doc.rect(PAGE.MARGIN_LEFT, this.y, 3, 8, 'F');
    
    doc.setFontSize(FONTS.SECTION);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(text, PAGE.MARGIN_LEFT + 6, this.y + 6);
    
    this.y += 14;
  }

  addSubsectionTitle(text) {
    this.checkPageBreak(12);
    const doc = this.doc;

    doc.setFontSize(FONTS.BODY);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text(text, PAGE.MARGIN_LEFT, this.y + 4);
    
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(PAGE.MARGIN_LEFT, this.y + 7, PAGE.WIDTH - PAGE.MARGIN_RIGHT, this.y + 7);
    
    this.y += 12;
  }

  addParagraph(text, options = {}) {
    const doc = this.doc;
    const fontSize = options.fontSize || FONTS.BODY;
    const color = options.color || [71, 85, 105];
    const bold = options.bold || false;

    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, PAGE.CONTENT_WIDTH);
    const lineHeight = fontSize * 0.45;
    
    for (const line of lines) {
      this.checkPageBreak(lineHeight + 2);
      doc.text(line, PAGE.MARGIN_LEFT, this.y);
      this.y += lineHeight;
    }
    this.y += 3;
  }

  addSpace(mm = 5) {
    this.y += mm;
  }

  // ─── Highlight Box (executive summary, CTA, etc) ───────────
  addHighlightBox(title, content, variant = 'brand') {
    const doc = this.doc;
    const boxHeight = Math.max(25, 15 + content.length * 5);
    this.checkPageBreak(boxHeight + 5);

    let bgColor, borderColor, textColor, titleColor;
    if (variant === 'brand') {
      bgColor = this.brandLight;
      borderColor = this.brandRgb;
      titleColor = this.brandRgb;
      textColor = [51, 65, 85];
    } else if (variant === 'success') {
      bgColor = { r: 240, g: 253, b: 244 };
      borderColor = { r: 34, g: 197, b: 94 };
      titleColor = { r: 22, g: 163, b: 74 };
      textColor = [30, 70, 32];
    } else if (variant === 'warning') {
      bgColor = { r: 254, g: 252, b: 232 };
      borderColor = { r: 234, g: 179, b: 8 };
      titleColor = { r: 161, g: 98, b: 7 };
      textColor = [100, 80, 20];
    } else if (variant === 'danger') {
      bgColor = { r: 254, g: 242, b: 242 };
      borderColor = { r: 239, g: 68, b: 68 };
      titleColor = { r: 185, g: 28, b: 28 };
      textColor = [100, 20, 20];
    } else {
      bgColor = { r: 248, g: 250, b: 252 };
      borderColor = { r: 148, g: 163, b: 184 };
      titleColor = { r: 51, g: 65, b: 85 };
      textColor = [71, 85, 105];
    }

    // Box background
    doc.setFillColor(bgColor.r, bgColor.g, bgColor.b);
    doc.roundedRect(PAGE.MARGIN_LEFT, this.y, PAGE.CONTENT_WIDTH, boxHeight, 2, 2, 'F');
    
    // Left border accent
    doc.setFillColor(borderColor.r, borderColor.g, borderColor.b);
    doc.rect(PAGE.MARGIN_LEFT, this.y, 3, boxHeight, 'F');

    // Title
    doc.setFontSize(FONTS.BODY);
    doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
    doc.setFont('helvetica', 'bold');
    doc.text(title, PAGE.MARGIN_LEFT + 7, this.y + 7);

    // Content lines
    doc.setFontSize(FONTS.SMALL);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    let lineY = this.y + 13;
    content.forEach(line => {
      const wrapped = doc.splitTextToSize(line, PAGE.CONTENT_WIDTH - 12);
      wrapped.forEach(wl => {
        doc.text(wl, PAGE.MARGIN_LEFT + 7, lineY);
        lineY += 4;
      });
    });

    this.y += boxHeight + 5;
  }

  // ─── KPI Cards Row ─────────────────────────────────────────
  addKPICards(cards) {
    // cards = [{ label, value, subtitle?, color? }]
    const doc = this.doc;
    const count = Math.min(cards.length, 4);
    const cardWidth = (PAGE.CONTENT_WIDTH - (count - 1) * 4) / count;
    const cardHeight = 22;
    
    this.checkPageBreak(cardHeight + 5);

    cards.slice(0, 4).forEach((card, i) => {
      const x = PAGE.MARGIN_LEFT + i * (cardWidth + 4);
      const color = card.color ? hexToRgb(card.color) : this.brandRgb;
      const bgLight = lightenColor(card.color || this.brandColor, 0.92);
      
      // Card background
      doc.setFillColor(bgLight.r, bgLight.g, bgLight.b);
      doc.roundedRect(x, this.y, cardWidth, cardHeight, 2, 2, 'F');
      
      // Top accent
      doc.setFillColor(color.r, color.g, color.b);
      doc.rect(x, this.y, cardWidth, 2, 'F');
      
      // Value
      doc.setFontSize(FONTS.SECTION);
      doc.setTextColor(color.r, color.g, color.b);
      doc.setFont('helvetica', 'bold');
      const valueTxt = String(card.value);
      doc.text(valueTxt, x + cardWidth / 2, this.y + 10, { align: 'center' });
      
      // Label
      doc.setFontSize(FONTS.TINY);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(card.label, x + cardWidth / 2, this.y + 16, { align: 'center' });
      
      // Subtitle
      if (card.subtitle) {
        doc.setFontSize(6);
        doc.setTextColor(148, 163, 184);
        doc.text(card.subtitle, x + cardWidth / 2, this.y + 20, { align: 'center' });
      }
    });

    this.y += cardHeight + 6;
  }

  // ─── Professional Table ─────────────────────────────────────
  addTable(headers, rows, options = {}) {
    const doc = this.doc;
    const { r, g, b } = this.brandRgb;
    
    const tableStyles = {
      headStyles: {
        fillColor: [r, g, b],
        textColor: [255, 255, 255],
        fontSize: FONTS.SMALL,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 3,
      },
      bodyStyles: {
        fontSize: FONTS.SMALL,
        textColor: [51, 65, 85],
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: [this.brandLight.r, this.brandLight.g, this.brandLight.b],
      },
      styles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      startY: this.y,
      margin: { left: PAGE.MARGIN_LEFT, right: PAGE.MARGIN_RIGHT },
      tableWidth: PAGE.CONTENT_WIDTH,
      didDrawPage: () => {
        this._drawHeader();
        this._drawFooter();
      },
      ...options.tableOptions,
    };

    // Column styles for currency/number alignment
    const columnStyles = {};
    if (options.columnStyles) {
      Object.assign(columnStyles, options.columnStyles);
    }

    // Highlight total rows
    const totalRowIndices = [];
    rows.forEach((row, idx) => {
      const firstCell = String(row[0] || '');
      if (firstCell.includes('TOTAL') || firstCell.includes('Total') || firstCell.includes('Resultado') || firstCell.startsWith('=')) {
        totalRowIndices.push(idx);
      }
    });

    doc.autoTable({
      head: [headers],
      body: rows,
      columnStyles,
      ...tableStyles,
      didParseCell: (data) => {
        if (data.section === 'body' && totalRowIndices.includes(data.row.index)) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [this.brandMedium.r, this.brandMedium.g, this.brandMedium.b];
          data.cell.styles.textColor = [r, g, b];
        }
      },
    });

    this.y = doc.lastAutoTable.finalY + 6;
  }

  // ─── Simple Key-Value Table ─────────────────────────────────
  addKeyValueTable(data, title = null) {
    // data = [{ key, value }]
    if (title) this.addSubsectionTitle(title);
    
    const headers = ['Parâmetro', 'Valor'];
    const rows = data.map(item => [item.key, item.value]);
    
    this.addTable(headers, rows, {
      columnStyles: {
        0: { cellWidth: 90, fontStyle: 'bold' },
        1: { halign: 'right' },
      }
    });
  }

  // ─── Bar Chart (rendered as simple bars) ────────────────────
  addBarChart(data, options = {}) {
    // data = [{ label, value, color? }]
    const doc = this.doc;
    const title = options.title || '';
    const maxValue = Math.max(...data.map(d => Math.abs(d.value)), 1);
    const barHeight = 8;
    const totalHeight = data.length * (barHeight + 5) + (title ? 15 : 5);
    
    this.checkPageBreak(totalHeight + 10);

    if (title) {
      this.addSubsectionTitle(title);
    }

    const chartLeft = PAGE.MARGIN_LEFT + 50;
    const chartWidth = PAGE.CONTENT_WIDTH - 55;

    data.forEach((item, i) => {
      const barY = this.y + i * (barHeight + 5);
      const barW = (Math.abs(item.value) / maxValue) * chartWidth;
      const color = item.color ? hexToRgb(item.color) : this.brandRgb;
      
      // Label
      doc.setFontSize(FONTS.SMALL);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label, PAGE.MARGIN_LEFT, barY + barHeight / 2 + 1);
      
      // Bar background
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(chartLeft, barY, chartWidth, barHeight, 1.5, 1.5, 'F');
      
      // Bar fill
      if (barW > 2) {
        doc.setFillColor(color.r, color.g, color.b);
        doc.roundedRect(chartLeft, barY, barW, barHeight, 1.5, 1.5, 'F');
      }
      
      // Value label
      doc.setFontSize(FONTS.TINY);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      const valueText = typeof item.value === 'number' && options.currency
        ? fmtCurrency(item.value)
        : typeof item.value === 'number' && options.percent
          ? fmtPercent(item.value)
          : String(item.value);
      
      if (barW > 30) {
        doc.text(valueText, chartLeft + barW - 3, barY + barHeight / 2 + 1, { align: 'right' });
      } else {
        doc.setTextColor(71, 85, 105);
        doc.text(valueText, chartLeft + barW + 3, barY + barHeight / 2 + 1);
      }
    });

    this.y += data.length * (barHeight + 5) + 8;
  }

  // ─── Pie Chart (rendered as proportional blocks) ────────────
  addPieChart(data, options = {}) {
    const doc = this.doc;
    const title = options.title || '';
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];
    
    this.checkPageBreak(50);
    if (title) this.addSubsectionTitle(title);

    // Stacked horizontal bar
    const barY = this.y;
    const barHeight = 12;
    let currentX = PAGE.MARGIN_LEFT;
    
    data.forEach((item, i) => {
      const width = (item.value / total) * PAGE.CONTENT_WIDTH;
      const color = hexToRgb(item.color || colors[i % colors.length]);
      doc.setFillColor(color.r, color.g, color.b);
      if (i === 0) {
        doc.roundedRect(currentX, barY, width, barHeight, 2, 0, 'F');
        doc.rect(currentX + width - 2, barY, 2, barHeight, 'F');
      } else if (i === data.length - 1) {
        doc.rect(currentX, barY, 2, barHeight, 'F');
        doc.roundedRect(currentX, barY, width, barHeight, 0, 2, 'F');
      } else {
        doc.rect(currentX, barY, width, barHeight, 'F');
      }
      
      // Percentage in bar
      if (width > 15) {
        doc.setFontSize(FONTS.TINY);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(`${((item.value / total) * 100).toFixed(0)}%`, currentX + width / 2, barY + barHeight / 2 + 1, { align: 'center' });
      }
      currentX += width;
    });

    // Legend
    this.y = barY + barHeight + 5;
    const legendCols = Math.min(data.length, 3);
    const colWidth = PAGE.CONTENT_WIDTH / legendCols;
    
    data.forEach((item, i) => {
      const col = i % legendCols;
      const row = Math.floor(i / legendCols);
      const lx = PAGE.MARGIN_LEFT + col * colWidth;
      const ly = this.y + row * 8;
      
      const color = hexToRgb(item.color || colors[i % colors.length]);
      doc.setFillColor(color.r, color.g, color.b);
      doc.roundedRect(lx, ly, 4, 4, 0.5, 0.5, 'F');
      
      doc.setFontSize(FONTS.TINY);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      const label = `${item.label}: ${options.currency ? fmtCurrency(item.value) : fmtPercent((item.value / total) * 100)}`;
      doc.text(label, lx + 6, ly + 3.5);
    });

    this.y += Math.ceil(data.length / legendCols) * 8 + 5;
  }

  // ─── Comparison Table (side-by-side) ────────────────────────
  addComparisonTable(columns) {
    // columns = [{ title, items: [{ key, value }], highlight? }]
    const doc = this.doc;
    const colCount = columns.length;
    const colWidth = PAGE.CONTENT_WIDTH / colCount;
    const maxItems = Math.max(...columns.map(c => c.items.length));
    const boxHeight = 12 + maxItems * 7;
    
    this.checkPageBreak(boxHeight + 10);

    columns.forEach((col, i) => {
      const x = PAGE.MARGIN_LEFT + i * colWidth;
      const color = col.highlight ? this.brandRgb : { r: 148, g: 163, b: 184 };
      const bgLight = col.highlight ? this.brandLight : { r: 248, g: 250, b: 252 };
      
      // Column header
      doc.setFillColor(color.r, color.g, color.b);
      doc.rect(x + 1, this.y, colWidth - 2, 10, 'F');
      doc.setFontSize(FONTS.SMALL);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(col.title, x + colWidth / 2, this.y + 6.5, { align: 'center' });
      
      // Column body
      doc.setFillColor(bgLight.r, bgLight.g, bgLight.b);
      doc.rect(x + 1, this.y + 10, colWidth - 2, boxHeight - 10, 'F');
      
      col.items.forEach((item, j) => {
        const iy = this.y + 16 + j * 7;
        doc.setFontSize(FONTS.TINY);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(item.key, x + 4, iy);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(String(item.value), x + colWidth - 4, iy, { align: 'right' });
      });
    });

    this.y += boxHeight + 8;
  }

  // ─── CTA / Next Steps Box ──────────────────────────────────
  addNextSteps(steps) {
    this.checkPageBreak(20 + steps.length * 8);
    const doc = this.doc;
    const { r, g, b } = this.brandRgb;

    // Section header
    this.addSectionTitle('Próximos Passos');

    const boxHeight = 10 + steps.length * 8;
    doc.setFillColor(this.brandLight.r, this.brandLight.g, this.brandLight.b);
    doc.roundedRect(PAGE.MARGIN_LEFT, this.y, PAGE.CONTENT_WIDTH, boxHeight, 3, 3, 'F');

    steps.forEach((step, i) => {
      const sy = this.y + 7 + i * 8;
      
      // Number circle
      doc.setFillColor(r, g, b);
      doc.circle(PAGE.MARGIN_LEFT + 6, sy - 1, 3, 'F');
      doc.setFontSize(FONTS.TINY);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(String(i + 1), PAGE.MARGIN_LEFT + 6, sy, { align: 'center' });
      
      // Step text
      doc.setFontSize(FONTS.SMALL);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      doc.text(step, PAGE.MARGIN_LEFT + 12, sy);
    });

    this.y += boxHeight + 8;
  }

  // ─── Signature Area ─────────────────────────────────────────
  addSignatureArea(signatories = []) {
    this.checkPageBreak(40);
    const doc = this.doc;
    this.y += 20;

    const count = signatories.length || 2;
    const sigWidth = PAGE.CONTENT_WIDTH / count;

    signatories.forEach((sig, i) => {
      const x = PAGE.MARGIN_LEFT + i * sigWidth + sigWidth / 2;
      
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.3);
      doc.line(x - 30, this.y, x + 30, this.y);
      
      doc.setFontSize(FONTS.SMALL);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.text(sig.nome || '____________________', x, this.y + 5, { align: 'center' });
      
      if (sig.cargo) {
        doc.setFontSize(FONTS.TINY);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text(sig.cargo, x, this.y + 9, { align: 'center' });
      }
    });

    this.y += 15;
  }

  // ─── Build & Output ─────────────────────────────────────────
  
  init() {
    this._drawHeader();
    this._drawFooter();
    return this;
  }

  getBlob() {
    return this.doc.output('blob');
  }

  getDataUrl() {
    return this.doc.output('dataurlstring');
  }

  download(filename) {
    const name = filename || `${this.title.replace(/\s+/g, '_')}_${fmtDateShort(this.date).replace(/\//g, '-')}.pdf`;
    this.doc.save(name);
  }

  // Preview in new window
  preview() {
    const blob = this.getBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return url;
  }
}

// ─── Quick PDF Generators ─────────────────────────────────────
export function generateQuickPDF(title, buildContent) {
  const engine = new PDFEngine({ title });
  engine.init();
  buildContent(engine);
  return engine;
}

export default PDFEngine;
