import React, { useState, useEffect } from 'react';
import { DocumentPage, ProjectMetadata, PhotoItem } from './types';
import { generateId, createEmptyPage, createEmptyPhoto } from './utils';
import MetadataForm from './components/MetadataForm';
import DocumentPreview from './components/DocumentPreview';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  Info,
  Layers,
  ArrowRight,
  Printer,
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Upload
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Sample Unsplash images with realistic construction titles
const SAMPLE_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop',
    title: 'Pekerjaan Pondasi Bore Pile',
    description: 'Pengeboran kedalaman 12m dan penulangan baja silinder pada as-4 zona struktur utama.',
    timestamp: '15 Juni 2026'
  },
  {
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop',
    title: 'Pembesian Kolom Lantai 1',
    description: 'Pemasangan sengkang kolom beton utama diameter D22 jarak sengkang 100mm.',
    timestamp: '18 Juni 2026'
  },
  {
    url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=800&auto=format&fit=crop',
    title: 'Pengecoran Plat Lantai',
    description: 'Penuangan beton ready mix kelas K-350 menggunakan concrete pump di area sayap timur.',
    timestamp: '21 Juni 2026'
  },
  {
    url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=800&auto=format&fit=crop',
    title: 'Pemasangan Bekisting Dinding',
    description: 'Penyetelan bekisting panel kayu lapis 15mm dengan perkuatan pipa push-pull support.',
    timestamp: '23 Juni 2026'
  }
];

export default function App() {
  // Document Pages State
  const [pages, setPages] = useState<DocumentPage[]>([]);
  
  // Project Metadata State
  const [metadata, setMetadata] = useState<ProjectMetadata>({
    projectName: 'PEMBANGUNAN GEDUNG KANTOR CABANG UTAMA',
    subtitle: 'Laporan Progres Fisik Bulanan - Pekerjaan Struktur & Arsitektur',
    companyName: 'PT. NUSANTARA MAJU KONSTRUKSI',
    date: '2026-06-24',
    location: 'Sleman, Daerah Istimewa Yogyakarta',
    inspector: 'Hilmy Nurendra, S.T.',
    refNumber: 'NMK/DIR-LAP/VI/2026',
    showHeaderOnAllPages: true
  });

  // Batch Upload Drag State
  const [isDraggingBatch, setIsDraggingBatch] = useState(false);

  // Export & Compile State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileTotal, setCompileTotal] = useState(0);

  // Initialize with one empty page on startup
  useEffect(() => {
    setPages([createEmptyPage()]);
  }, []);

  // Handler: Add a new page
  const handleAddPage = () => {
    setPages((prev) => [...prev, createEmptyPage()]);
  };

  // Handler: Delete a page
  const handleDeletePage = (pageId: string) => {
    if (pages.length <= 1) {
      alert('Dokumen minimal harus memiliki 1 halaman.');
      return;
    }
    if (window.confirm('Apakah Anda yakin ingin menghapus halaman ini beserta seluruh foto di dalamnya?')) {
      setPages((prev) => prev.filter((p) => p.id !== pageId));
    }
  };

  // Handler: Photo Upload (or drag and drop)
  const handlePhotoUpload = (pageId: string, slotIndex: number, file: File) => {
    const url = URL.createObjectURL(file);
    
    setPages((prevPages) =>
      prevPages.map((p) => {
        if (p.id !== pageId) return p;
        
        const updatedPhotos = [...p.photos] as [PhotoItem, PhotoItem, PhotoItem, PhotoItem];
        updatedPhotos[slotIndex] = {
          ...updatedPhotos[slotIndex],
          url,
          fileName: file.name
        };

        return { ...p, photos: updatedPhotos };
      })
    );
  };

  // Handler: Batch Upload (handles multiple images sequentially)
  const handleBatchUpload = (files: FileList | File[]) => {
    const validImageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validImageFiles.length === 0) return;

    setPages((prevPages) => {
      let updatedPages = [...prevPages].map(p => ({
        ...p,
        photos: [...p.photos] as [PhotoItem, PhotoItem, PhotoItem, PhotoItem]
      }));

      validImageFiles.forEach((file) => {
        // Find the first slot on any page where photo.url is null
        let foundSlot = false;
        for (let pIdx = 0; pIdx < updatedPages.length; pIdx++) {
          const page = updatedPages[pIdx];
          for (let sIdx = 0; sIdx < 4; sIdx++) {
            if (!page.photos[sIdx].url) {
              // Fill this slot
              const url = URL.createObjectURL(file);

              page.photos[sIdx] = {
                ...page.photos[sIdx],
                url,
                fileName: file.name
              };
              foundSlot = true;
              break;
            }
          }
          if (foundSlot) break;
        }

        // If no slot was found, create a new page and fill its first slot!
        if (!foundSlot) {
          const newPage = createEmptyPage();
          const url = URL.createObjectURL(file);

          newPage.photos[0] = {
            ...newPage.photos[0],
            url,
            fileName: file.name
          };

          updatedPages.push(newPage);
        }
      });

      return updatedPages;
    });
  };

  const handleDragOverBatch = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBatch(true);
  };

  const handleDragLeaveBatch = () => {
    setIsDraggingBatch(false);
  };

  const handleDropBatch = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingBatch(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleBatchUpload(e.dataTransfer.files);
    }
  };

  const handleFileChangeBatch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleBatchUpload(e.target.files);
    }
  };

  // Handler: Quick Rotate from preview controls
  const handleRotatePhoto = (pageId: string, slotIndex: number) => {
    setPages((prevPages) =>
      prevPages.map((p) => {
        if (p.id !== pageId) return p;

        const updatedPhotos = [...p.photos] as [PhotoItem, PhotoItem, PhotoItem, PhotoItem];
        const currentRotation = updatedPhotos[slotIndex].rotation || 0;
        updatedPhotos[slotIndex] = {
          ...updatedPhotos[slotIndex],
          rotation: (currentRotation + 90) % 360
        };

        return { ...p, photos: updatedPhotos };
      })
    );
  };

  // Handler: Remove photo from slot
  const handleRemovePhoto = (pageId: string, slotIndex: number) => {
    if (window.confirm('Hapus foto dari slot ini?')) {
      setPages((prevPages) =>
        prevPages.map((p) => {
          if (p.id !== pageId) return p;

          const updatedPhotos = [...p.photos] as [PhotoItem, PhotoItem, PhotoItem, PhotoItem];
          updatedPhotos[slotIndex] = {
            ...updatedPhotos[slotIndex],
            url: null,
            fileName: undefined
          };

          return { ...p, photos: updatedPhotos };
        })
      );
    }
  };

  // Handler: Toggle object-fit mode (cover vs contain)
  const handleToggleObjectFit = (pageId: string, slotIndex: number) => {
    setPages((prevPages) =>
      prevPages.map((p) => {
        if (p.id !== pageId) return p;

        const updatedPhotos = [...p.photos] as [PhotoItem, PhotoItem, PhotoItem, PhotoItem];
        const currentFit = updatedPhotos[slotIndex].objectFit || 'cover';
        updatedPhotos[slotIndex] = {
          ...updatedPhotos[slotIndex],
          objectFit: currentFit === 'cover' ? 'contain' : 'cover'
        };

        return { ...p, photos: updatedPhotos };
      })
    );
  };

  // Handler: Update photo caption/details (title, description, timestamp)
  const handleUpdatePhotoDetails = (pageId: string, slotIndex: number, details: Partial<PhotoItem>) => {
    setPages((prevPages) =>
      prevPages.map((p) => {
        if (p.id !== pageId) return p;

        const updatedPhotos = [...p.photos] as [PhotoItem, PhotoItem, PhotoItem, PhotoItem];
        updatedPhotos[slotIndex] = {
          ...updatedPhotos[slotIndex],
          ...details
        };

        return { ...p, photos: updatedPhotos };
      })
    );
  };

  // Reset Document to 1 Empty Page
  const handleResetDocument = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh isi laporan? Semua foto dan keterangan akan dihapus.')) {
      setPages([createEmptyPage()]);
      setMetadata({
        projectName: '',
        subtitle: '',
        companyName: '',
        date: '',
        location: '',
        inspector: '',
        refNumber: '',
        showHeaderOnAllPages: true,
        logoUrl: undefined
      });
    }
  };

  // Load Sample / Demonstration Data
  const handleLoadSampleData = () => {
    const samplePage: DocumentPage = {
      id: generateId(),
      photos: SAMPLE_PHOTOS.map((sample, idx) => ({
        id: generateId(),
        url: sample.url,
        title: sample.title,
        description: sample.description,
        timestamp: sample.timestamp,
        rotation: 0,
        objectFit: 'cover' as const
      })) as [PhotoItem, PhotoItem, PhotoItem, PhotoItem]
    };

    setMetadata({
      projectName: 'PROYEK PEMBANGUNAN GEDUNG SERBAGUNA GUNA BANGSA',
      subtitle: 'Laporan Peninjauan Lapangan - Progress Pengecoran & Struktur Utama',
      companyName: 'PT. ADHI RAYA KONSTRUKSI',
      date: '2026-06-25',
      location: 'Depok, Jawa Barat',
      inspector: 'Hilmy Nurendra, S.T. (Quality Assurance)',
      refNumber: 'ARK/DS-LAP/VI/2026/08',
      showHeaderOnAllPages: true
    });

    setPages([samplePage]);
  };

  // Export to PDF function using native browser printing (highly reliable, handles OKLCH/OKLAB perfectly)
  const handlePrintPDF = () => {
    setIsExportModalOpen(false);
    
    // Dynamically change page title to set default file name on "Save as PDF"
    const originalTitle = document.title;
    const rawFileName = metadata.projectName || 'Laporan_Dokumentasi_Foto';
    const cleanFileName = rawFileName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .substring(0, 35);
    
    document.title = `DOKUMENTASI_${cleanFileName || 'LAPORAN'}`;

    // Trigger native browser print
    window.print();

    // Restore title after print dialog opens
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // Export to PDF function using client-side conversion (highly reliable inside iframe sandboxes)
  const handleDirectDownloadPDF = async () => {
    setIsCompiling(true);
    setIsExportModalOpen(false);

    // Give state updates brief time to render in DOM
    await new Promise((resolve) => setTimeout(resolve, 350));

    const element = document.getElementById('pdf-export-container');
    if (!element) {
      setIsCompiling(false);
      return;
    }

    const pageElements = element.querySelectorAll('.document-page');
    if (pageElements.length === 0) {
      setIsCompiling(false);
      return;
    }

    setCompileTotal(pageElements.length);
    setCompileProgress(0);

    // Helpers to convert modern colors into RGB so html2canvas doesn't crash on color parsing
    const oklabToRgb = (l_: number, a_: number, b_: number, a: number = 1): string => {
      const l1 = l_ + 0.3963377774 * a_ + 0.2158037573 * b_;
      const m1 = l_ - 0.1055613458 * a_ - 0.0638541728 * b_;
      const s1 = l_ - 0.0894841775 * a_ - 1.2914855480 * b_;

      const l2 = l1 * l1 * l1;
      const m2 = m1 * m1 * m1;
      const s2 = s1 * s1 * s1;

      let r = +4.0767416621 * l2 - 3.3077115913 * m2 + 0.2309699292 * s2;
      let g = -1.2684380046 * l2 + 2.6097574011 * m2 - 0.3413193965 * s2;
      let b = -0.0041960863 * l2 - 0.7034186145 * m2 + 1.7076147010 * s2;

      const fn = (x: number) => x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
      r = Math.round(Math.max(0, Math.min(1, fn(r))) * 255);
      g = Math.round(Math.max(0, Math.min(1, fn(g))) * 255);
      b = Math.round(Math.max(0, Math.min(1, fn(b))) * 255);

      return a === 1 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    const oklchToRgb = (l: number, c: number, h: number, a: number = 1): string => {
      const a_ = c * Math.cos(h * Math.PI / 180);
      const b_ = c * Math.sin(h * Math.PI / 180);
      return oklabToRgb(l, a_, b_, a);
    };

    const parseVal = (str: string | undefined | null, isL = false): number => {
      if (!str || str === 'none') return 0;
      if (str.endsWith('%')) return parseFloat(str) / 100;
      if (str.endsWith('deg')) return parseFloat(str);
      const val = parseFloat(str);
      if (isL && val > 1) return val / 100;
      return val;
    };

    const replaceOklchInString = (str: string | null | undefined): string => {
      if (!str || typeof str !== 'string') return str || '';
      
      let processed = str;

      if (processed.includes('oklch')) {
        const oklchRegex = /oklch\(\s*([+-]?[\d.]+%?|[a-zA-Z]+)[,\s]+([+-]?[\d.]+%?|[a-zA-Z]+)[,\s]+([+-]?[\d.]+(?:deg)?|[a-zA-Z]+)(?:\s*[/\s,]\s*([+-]?[\d.]+%?|[a-zA-Z]+))?\s*\)/g;
        processed = processed.replace(oklchRegex, (match, lStr, cStr, hStr, aStr) => {
          try {
            const l = parseVal(lStr, true);
            const c = parseVal(cStr);
            const h = parseVal(hStr);
            const a = aStr ? parseVal(aStr) : 1;
            return oklchToRgb(l, c, h, a);
          } catch (err) {
            return 'rgb(59, 130, 246)';
          }
        });
      }

      if (processed.includes('oklab')) {
        const oklabRegex = /oklab\(\s*([+-]?[\d.]+%?|[a-zA-Z]+)[,\s]+([+-]?[\d.]+%?|[a-zA-Z]+)[,\s]+([+-]?[\d.]+%?|[a-zA-Z]+)(?:\s*[/\s,]\s*([+-]?[\d.]+%?|[a-zA-Z]+))?\s*\)/g;
        processed = processed.replace(oklabRegex, (match, lStr, aStr, bStr, alphaStr) => {
          try {
            const l = parseVal(lStr, true);
            const aVal = parseVal(aStr);
            const bVal = parseVal(bStr);
            const alpha = alphaStr ? parseVal(alphaStr) : 1;
            return oklabToRgb(l, aVal, bVal, alpha);
          } catch (err) {
            return 'rgb(59, 130, 246)';
          }
        });
      }

      return processed;
    };

    // Temporarily rewrite style tags to strip oklch/oklab before html2canvas runs
    const styleElements = Array.from(document.querySelectorAll('style'));
    const originalStyles = styleElements.map((el) => ({ el, text: el.textContent }));

    try {
      for (const item of originalStyles) {
        if (item.text) {
          item.el.textContent = replaceOklchInString(item.text);
        }
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < pageElements.length; i++) {
        setCompileProgress(i + 1);
        const pageElement = pageElements[i] as HTMLElement;

        // Force brief delay to let any rendering/image loads finish settling
        await new Promise((resolve) => setTimeout(resolve, 350));

        const canvas = await html2canvas(pageElement, {
          scale: 2.2, // High resolution output
          useCORS: true,
          allowTaint: false,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 794,
          windowHeight: 1123
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        const pdfWidth = 210;
        const pdfHeight = 297;

        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      }

      const rawFileName = metadata.projectName || 'Laporan_Dokumentasi_Foto';
      const cleanFileName = rawFileName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .substring(0, 35);
      
      pdf.save(`DOKUMENTASI_${cleanFileName || 'LAPORAN'}.pdf`);
    } catch (error) {
      console.error('Gagal membuat PDF langsung:', error);
      alert('Terjadi kesalahan saat menyusun file PDF langsung. Silakan gunakan opsi "Cetak via Browser" dengan terlebih dahulu mengeklik "Buka di Tab Baru".');
    } finally {
      // Restore all original styles
      for (const item of originalStyles) {
        item.el.textContent = item.text;
      }
      setIsCompiling(false);
    }
  };

  return (
    <div id="main-app" className="min-h-screen bg-[#f1f5f9] flex flex-col antialiased font-sans">
      
      {/* APP TOPBAR */}
      <header className="sticky top-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2 uppercase leading-none mt-0.5">
              Pembuat Laporan Foto <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">4-per-page</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Dokumentasi foto rapi standar konstruksi & inspeksi lapangan</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          <button
            onClick={handleLoadSampleData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all cursor-pointer"
            title="Muat template data sampel"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Muat Data Contoh</span>
          </button>
          
          <button
            onClick={handleResetDocument}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"
            title="Kosongkan seluruh data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* Action Download */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-full transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF
          </button>
        </div>
      </header>

      {/* CORE SPLIT WORKSPACE */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT WORKSPACE PANEL: Settings, Form, Page Manager */}
        <div className="w-full lg:w-[420px] shrink-0 border-r border-slate-200 bg-white p-6 overflow-y-auto space-y-6 max-h-[calc(100vh-64px)]">
          
          {/* Informative Instructions Alert */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 shadow-sm border border-slate-800 relative overflow-hidden">
            <div className="absolute right-[-10px] top-[-10px] opacity-10 text-white pointer-events-none">
              <FileText className="w-32 h-32" />
            </div>
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1 z-10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">Cara Pembuatan Laporan</h4>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Isi data proyek, lalu lengkapi grid 4-foto di sebelah kanan. Anda dapat mengklik slot kosong untuk mengunggah foto, lalu klik ikon <strong>Edit</strong> untuk memberi deskripsi progres lapangan.
                </p>
              </div>
            </div>
          </div>

          {/* Batch Drag & Drop Zone */}
          <div
            onDragOver={handleDragOverBatch}
            onDragLeave={handleDragLeaveBatch}
            onDrop={handleDropBatch}
            className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-300 ${
              isDraggingBatch
                ? 'border-blue-500 bg-blue-50/80 scale-[1.02] shadow-md shadow-blue-100'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              id="batch-file-upload"
              multiple
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileChangeBatch}
            />
            <div className="flex flex-col items-center justify-center space-y-2.5 font-sans">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isDraggingBatch
                  ? 'bg-blue-500 text-white animate-bounce'
                  : 'bg-blue-50 text-blue-600'
              }`}>
                <Upload className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isDraggingBatch ? 'Lepaskan Foto Sekarang!' : 'Unggah Massal (Batch Upload)'}
                </p>
                <p className="text-[11px] text-slate-500 leading-normal max-w-[300px] mx-auto">
                  Seret & lepas beberapa file foto ke sini sekaligus untuk mengisi slot laporan otomatis
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-[10px] font-bold text-blue-600 rounded-full shadow-xs">
                <Sparkles className="w-3 h-3" /> Pilih / Drop Banyak Foto
              </span>
            </div>
          </div>

          {/* Form Metadata */}
          <MetadataForm metadata={metadata} onChange={setMetadata} />

          {/* Document Structure & Pages List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Daftar Halaman Laporan</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                {pages.length} Halaman
              </span>
            </div>

            {/* Pages Quick Summary Stack */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {pages.map((p, index) => {
                const filledPhotos = p.photos.filter((ph) => !!ph.url).length;

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 bg-slate-50 hover:bg-white transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center font-mono font-bold text-xs text-blue-600 border border-blue-100">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">Halaman {index + 1}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {filledPhotos === 4 ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Grid Penuh (4/4 Foto)
                            </span>
                          ) : (
                            <span>{filledPhotos} dari 4 foto terisi</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDeletePage(p.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Halaman ini"
                        disabled={pages.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Page Button */}
            <button
              onClick={handleAddPage}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 text-xs font-bold rounded-xl bg-blue-50/30 hover:bg-blue-50/80 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Halaman Baru (4 Foto)
            </button>
          </div>

          {/* Quick Tips */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 space-y-1.5">
            <h5 className="font-bold flex items-center gap-1 text-amber-900">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Tips Pembuatan PDF:
            </h5>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed pl-1 text-amber-800/90">
              <li>Laporan ini otomatis berorientasi A4 Portrait (Tegak).</li>
              <li>Setiap halaman memuat grid 2x2 (maksimal 4 foto).</li>
              <li>Gunakan fitur <strong>Ubah Mode Tampilan</strong> (Pas/Penuh) jika posisi foto terpotong.</li>
              <li>Jika gambar miring saat diunggah, gunakan tombol <strong>Putar Foto</strong> di area pratinjau.</li>
            </ul>
          </div>

        </div>

        {/* RIGHT WORKSPACE PANEL: Realtime Interactive Preview Frame */}
        <div className="flex-1 bg-[#f1f5f9] border-l border-slate-200 overflow-y-auto px-4 py-8 flex flex-col items-center max-h-[calc(100vh-64px)]">
          
          {/* Zoom/Scale Tip */}
          <div className="text-xs text-slate-500 mb-4 flex items-center gap-1.5 font-semibold bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <Printer className="w-3.5 h-3.5 text-blue-500" />
            Desain A4 Standar - Layout presisi saat diekspor ke PDF
          </div>

          {/* Document canvas render wrapper */}
          <div className="w-full max-w-full overflow-x-auto pb-8 flex justify-center">
            <DocumentPreview
              pages={pages}
              metadata={metadata}
              onPhotoUpload={handlePhotoUpload}
              onRemovePhoto={handleRemovePhoto}
              onRotatePhoto={handleRotatePhoto}
              onToggleObjectFit={handleToggleObjectFit}
              onUpdatePhotoDetails={handleUpdatePhotoDetails}
              isCompiling={isCompiling}
            />
          </div>

        </div>

      </main>

      {/* EXPORT OPTIONS MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-600" />
                  Metode Ekspor PDF Dokumentasi
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Pilih cara terbaik untuk mengunduh laporan dokumentasi Anda ke format PDF.
                </p>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-full transition-all cursor-pointer text-xs font-bold px-2.5 py-1"
              >
                Tutup
              </button>
            </div>

            {/* Warning if running in an iframe */}
            {window.self !== window.top && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Deteksi Preview Terisolasi (Iframe Sandbox)
                </div>
                <p className="leading-relaxed">
                  Browser mendeteksi aplikasi berjalan di dalam frame preview. Tombol <strong>Cetak via Browser</strong> tidak akan terbuka langsung di dalam frame ini karena pembatasan keamanan browser.
                </p>
                <p className="font-medium">
                  💡 Solusi: Silakan klik tombol <strong className="text-blue-700">"Buka di Tab Baru"</strong> di pojok kanan atas layar preview Anda untuk menggunakan metode cetak browser, atau pilih <strong className="text-emerald-700">Unduh PDF Langsung (Backup)</strong> di bawah ini.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Browser Print */}
              <button
                onClick={handlePrintPDF}
                className="group border-2 border-slate-100 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 text-left p-5 rounded-2xl transition-all flex flex-col justify-between space-y-4 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Printer className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Cetak via Browser</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Menghasilkan PDF vektor berkualitas sangat tinggi dengan teks yang tajam, layout presisi, serta ukuran file yang optimal.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Gunakan Metode Ini <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              {/* Option 2: html2canvas + jsPDF Direct compilation */}
              <button
                onClick={handleDirectDownloadPDF}
                className="group border-2 border-slate-100 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 text-left p-5 rounded-2xl transition-all flex flex-col justify-between space-y-4 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Download className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Unduh PDF Langsung</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Mengonversi tampilan langsung ke file PDF (format gambar) di dalam halaman ini. Berfungsi 100% di semua lingkungan (bisa di dalam iframe sandbox).
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Unduh Sekarang <Download className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>

            <div className="text-[10px] text-slate-400 text-center leading-relaxed">
              * Tips: Desain ini dibuat presisi untuk kertas <strong>A4 Portrait</strong>. Jika mencetak melalui browser, pastikan ukuran kertas diatur ke <strong>A4</strong> dan hilangkan tanda centang pada opsi <strong>Headers and Footers</strong> di pengaturan printer browser Anda.
            </div>

          </div>
        </div>
      )}

      {/* COMPILER LOADER OVERLAY */}
      {isCompiling && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 relative">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base">Menyusun File PDF</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Membersihkan oklch/oklab, mengekstrak gambar, dan merender dokumen beresolusi tinggi...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 px-1">
                <span>Memproses halaman</span>
                <span>{compileProgress} dari {compileTotal}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                <div
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(compileProgress / compileTotal) * 100}%` }}
                ></div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-mono">
              Mohon jangan menutup jendela browser Anda.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
