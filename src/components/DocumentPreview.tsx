import React, { useRef } from 'react';
import { DocumentPage, ProjectMetadata, PhotoItem } from '../types';
import { Camera, Edit2, RotateCw, Trash2, Maximize, Plus, Calendar, MapPin, User, FileText, Image } from 'lucide-react';
import { formatDate } from '../utils';

interface DocumentPreviewProps {
  pages: DocumentPage[];
  metadata: ProjectMetadata;
  onPhotoClick?: (pageId: string, slotIndex: number) => void;
  onPhotoUpload: (pageId: string, slotIndex: number, file: File) => void;
  onRemovePhoto: (pageId: string, slotIndex: number) => void;
  onRotatePhoto: (pageId: string, slotIndex: number) => void;
  onToggleObjectFit?: (pageId: string, slotIndex: number) => void;
  onUpdatePhotoDetails?: (pageId: string, slotIndex: number, details: Partial<PhotoItem>) => void;
  isCompiling?: boolean;
}

export default function DocumentPreview({
  pages,
  metadata,
  onPhotoClick,
  onPhotoUpload,
  onRemovePhoto,
  onRotatePhoto,
  onToggleObjectFit,
  onUpdatePhotoDetails,
  isCompiling = false
}: DocumentPreviewProps) {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    pageId: string,
    slotIndex: number
  ) => {
    if (e.target.files && e.target.files[0]) {
      onPhotoUpload(pageId, slotIndex, e.target.files[0]);
    }
  };

  const triggerFileInput = (pageId: string, slotIndex: number) => {
    const key = `${pageId}-${slotIndex}`;
    fileInputRefs.current[key]?.click();
  };

  return (
    <div className="flex flex-col items-center gap-8 py-4 w-full">
      {/* Target element for html2canvas */}
      <div id="pdf-export-container" className="flex flex-col items-center gap-10 w-full">
        {pages.map((page, pageIndex) => {
          const isFirstPage = pageIndex === 0;
          const showHeader = isFirstPage || metadata.showHeaderOnAllPages;

          return (
            <div
              key={page.id}
              className="document-page w-[794px] h-[1123px] bg-white text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col justify-between p-10 relative overflow-hidden shrink-0 border border-slate-200 select-none print:shadow-none print:border-none"
              style={{ contentVisibility: 'auto' }}
            >
              {/* PAGE HEADER */}
              {showHeader ? (
                <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-start gap-4">
                  <div className="flex gap-3.5 items-start max-w-[65%]">
                    {metadata.logoUrl && (
                      <div className="w-14 h-14 bg-white rounded-xl border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                        <img src={metadata.logoUrl} alt="Logo Instansi" className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                    <div className="space-y-1">
                      {metadata.companyName && (
                        <p className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase font-sans">
                          {metadata.companyName}
                        </p>
                      )}
                      <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug uppercase font-sans">
                        {metadata.projectName || 'DOKUMENTASI FOTO KEGIATAN'}
                      </h1>
                      <p className="text-[11px] font-semibold text-slate-500 italic font-sans leading-normal">
                        {metadata.subtitle || 'Laporan Hasil Dokumentasi Progress Lapangan'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Metadata Details Grid */}
                  <div className="text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 grid grid-cols-2 gap-x-4 gap-y-1 min-w-[240px] font-sans">
                    {metadata.date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate"><strong>Tgl:</strong> {formatDate(metadata.date)}</span>
                      </div>
                    )}
                    {metadata.refNumber && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate"><strong>Ref:</strong> {metadata.refNumber}</span>
                      </div>
                    )}
                    {metadata.location && (
                      <div className="flex items-center gap-1.5 col-span-2 border-t border-slate-200/50 pt-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate"><strong>Lokasi:</strong> {metadata.location}</span>
                      </div>
                    )}
                    {metadata.inspector && (
                      <div className="flex items-center gap-1.5 col-span-2 border-t border-slate-200/50 pt-1">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate"><strong>Pemeriksa:</strong> {metadata.inspector}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-b border-slate-200 pb-2 mb-4 flex justify-between items-center text-[10px] text-slate-500 font-sans font-medium">
                  <div className="flex items-center gap-2">
                    {metadata.logoUrl && (
                      <img src={metadata.logoUrl} alt="Logo Mini" className="w-4 h-4 object-contain" />
                    )}
                    <span>{metadata.projectName || 'Laporan Dokumentasi'}</span>
                  </div>
                  <span>{metadata.refNumber && `No: ${metadata.refNumber}`}</span>
                </div>
              )}

              {/* PHOTOS GRID (Exactly 2x2) */}
              <div className="grid grid-cols-2 gap-6 items-stretch flex-1 my-2">
                {page.photos.map((photo, slotIndex) => {
                  const inputKey = `${page.id}-${slotIndex}`;
                  const hasPhoto = !!photo.url;

                  return (
                    <div
                      key={photo.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col hover:border-blue-300 transition-colors duration-200 relative group/slot shadow-xs hover:shadow-md h-[395px]"
                    >
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={(el) => (fileInputRefs.current[inputKey] = el)}
                        onChange={(e) => handleFileChange(e, page.id, slotIndex)}
                        accept="image/*"
                        className="hidden"
                      />

                      {/* Photo Container */}
                      <div className={`w-full h-[225px] bg-slate-50 border ${isCompiling ? 'border-transparent' : 'border-slate-200/80'} rounded-md overflow-hidden relative flex items-center justify-center shrink-0`}>
                        {hasPhoto ? (
                          <>
                            <img
                              src={photo.url || ''}
                              alt={`Slot ${slotIndex + 1}`}
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                              className="h-full w-full select-none pointer-events-none"
                              style={{
                                transform: `rotate(${photo.rotation}deg)`,
                                objectFit: photo.objectFit || 'cover'
                              }}
                            />
                            
                            {/* Hover Overlay Controls */}
                            {!isCompiling && (
                              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] opacity-0 group-hover/slot:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 print:hidden">
                                <button
                                  type="button"
                                  onClick={() => onToggleObjectFit && onToggleObjectFit(page.id, slotIndex)}
                                  className="p-2.5 bg-white hover:bg-slate-50 text-blue-600 rounded-full shadow-md transition-all transform hover:scale-105"
                                  title={photo.objectFit === 'contain' ? "Ubah ke Crop/Penuhi Slot" : "Ubah ke Fit/Muat Utuh"}
                                >
                                  <Maximize className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRotatePhoto(page.id, slotIndex)}
                                  className="p-2.5 bg-white hover:bg-slate-50 text-emerald-600 rounded-full shadow-md transition-all transform hover:scale-105"
                                  title="Putar Foto 90°"
                                >
                                  <RotateCw className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => triggerFileInput(page.id, slotIndex)}
                                  className="p-2.5 bg-white hover:bg-slate-50 text-amber-600 rounded-full shadow-md transition-all transform hover:scale-105"
                                  title="Ganti Foto"
                                >
                                  <Image className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRemovePhoto(page.id, slotIndex)}
                                  className="p-2.5 bg-white hover:bg-rose-50 text-rose-600 rounded-full shadow-md transition-all transform hover:scale-105"
                                  title="Hapus Foto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {/* Rotate Indicator pill */}
                            {photo.rotation !== 0 && (
                              <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs font-sans print:hidden">
                                <RotateCw className="w-2.5 h-2.5" />
                                {photo.rotation}°
                              </div>
                            )}
                          </>
                        ) : (
                          <div
                            onClick={!isCompiling ? () => triggerFileInput(page.id, slotIndex) : undefined}
                            className={`absolute inset-0 flex flex-col items-center justify-center p-4 ${isCompiling ? 'bg-slate-50/20' : 'cursor-pointer hover:bg-blue-50/50'} transition-colors group/upload`}
                          >
                            {!isCompiling && (
                              <div className="flex flex-col items-center justify-center print:hidden">
                                <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover/upload:bg-blue-100 group-hover/upload:text-blue-600 transition-all shadow-xs mb-2 border border-slate-200/50">
                                  <Camera className="w-5 h-5" />
                                </div>
                                <span className="text-[11px] font-bold text-slate-500 group-hover/upload:text-blue-600 font-sans">
                                  Unggah Foto {slotIndex + 1}
                                </span>
                                <span className="text-[9px] text-slate-400 mt-0.5 text-center px-4 leading-normal font-sans">
                                  Klik atau seret file ke area ini
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Caption/Description Area */}
                      <div className="w-full flex-1 flex flex-col justify-between mt-2.5 text-left bg-slate-50/60 p-2.5 rounded-lg border border-slate-100/80">
                        <div className="space-y-1 overflow-hidden">
                          {isCompiling ? (
                            <div className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight truncate border-b border-slate-200/60 pb-0.5">
                              {photo.title || `Foto Slot ${slotIndex + 1}`}
                            </div>
                          ) : (
                            <input
                              type="text"
                              placeholder={`Judul Foto ${slotIndex + 1}...`}
                              value={photo.title || ''}
                              onChange={(e) => onUpdatePhotoDetails && onUpdatePhotoDetails(page.id, slotIndex, { title: e.target.value })}
                              className="w-full text-[11px] font-extrabold text-slate-800 placeholder-slate-400 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none pb-0.5 truncate transition-all"
                            />
                          )}

                          {isCompiling ? (
                            <p className="text-[10px] text-slate-600 leading-relaxed h-[36px] overflow-hidden text-ellipsis line-clamp-2">
                              {photo.description || 'Tidak ada keterangan progres.'}
                            </p>
                          ) : (
                            <textarea
                              placeholder="Tulis deskripsi / progres pekerjaan..."
                              value={photo.description || ''}
                              onChange={(e) => onUpdatePhotoDetails && onUpdatePhotoDetails(page.id, slotIndex, { description: e.target.value })}
                              rows={2}
                              className="w-full text-[10px] text-slate-600 placeholder-slate-400 bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none resize-none leading-relaxed py-0.5 min-h-[34px] transition-all animate-none"
                            />
                          )}
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200/60 shrink-0">
                          <span className="font-bold text-slate-400/80">SLOT FOTO {slotIndex + 1}</span>
                          {isCompiling ? (
                            <span className="font-bold text-slate-600">{photo.timestamp || 'Progres Lapangan'}</span>
                          ) : (
                            <input
                              type="text"
                              placeholder="Tanggal / Progress..."
                              value={photo.timestamp || ''}
                              onChange={(e) => onUpdatePhotoDetails && onUpdatePhotoDetails(page.id, slotIndex, { timestamp: e.target.value })}
                              className="text-right text-[9px] font-bold text-slate-600 placeholder-slate-300 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none w-28 transition-all"
                            />
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* PAGE FOOTER */}
              <div className="border-t border-slate-200 pt-3 mt-4 flex justify-between items-center text-[10px] text-slate-500 font-sans">
                <span className="font-semibold text-slate-600 tracking-wide">Dokumentasi Laporan - {metadata.companyName || 'Sistem Laporan'}</span>
                <span className="font-extrabold text-blue-600 bg-blue-50/70 border border-blue-100/50 px-2.5 py-1 rounded-md">
                  Halaman {pageIndex + 1} dari {pages.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
