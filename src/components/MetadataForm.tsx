import React from 'react';
import { ProjectMetadata } from '../types';
import { Calendar, MapPin, User, FileText, Building2, CheckSquare, Upload, Trash2, Image } from 'lucide-react';

interface MetadataFormProps {
  metadata: ProjectMetadata;
  onChange: (updated: ProjectMetadata) => void;
}

export default function MetadataForm({ metadata, onChange }: MetadataFormProps) {
  const handleChange = (key: keyof ProjectMetadata, value: any) => {
    onChange({
      ...metadata,
      [key]: value
    });
  };

  const handleSetToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    handleChange('date', `${year}-${month}-${day}`);
  };

  return (
    <div id="metadata-form" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Informasi Laporan</h2>
        <button
          onClick={handleSetToday}
          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          title="Gunakan tanggal hari ini"
        >
          <Calendar className="w-3.5 h-3.5" />
          Hari Ini
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Nama Proyek */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Nama Proyek / Kegiatan</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={metadata.projectName}
              onChange={(e) => handleChange('projectName', e.target.value)}
              placeholder="Contoh: Pembangunan Jembatan Ampera"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Sub-judul Proyek */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Sub-Judul Laporan</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={metadata.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Contoh: Laporan Dokumentasi Progress Fisik 100%"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Instansi / Perusahaan */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Instansi / Kontraktor</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={metadata.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Contoh: PT. Maju Bersama Konstruksi"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Logo Instansi */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Logo Instansi / Perusahaan</label>
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative">
              {metadata.logoUrl ? (
                <img src={metadata.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <div className="flex flex-col items-center text-slate-300">
                  <Building2 className="w-5 h-5" />
                  <span className="text-[8px] font-semibold text-slate-400">Default</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <label className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  Pilih Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            handleChange('logoUrl', event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                
                {metadata.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleChange('logoUrl', undefined)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                )}
              </div>
              <p className="text-[9px] text-slate-400 leading-normal">
                Disarankan format PNG/JPG transparan (Maks. 2MB)
              </p>
            </div>
          </div>
        </div>

        {/* Tanggal */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Tanggal Laporan</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </span>
            <input
              type="date"
              value={metadata.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Lokasi */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Lokasi Kegiatan</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <MapPin className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={metadata.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Contoh: Jl. Jenderal Sudirman KM. 5"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Penyusun */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Nama Penyusun / Pengawas</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={metadata.inspector}
              onChange={(e) => handleChange('inspector', e.target.value)}
              placeholder="Contoh: Hilmy Nurendra, S.T."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* No. Referensi */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Nomor Referensi / Laporan</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <FileText className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={metadata.refNumber}
              onChange={(e) => handleChange('refNumber', e.target.value)}
              placeholder="Contoh: LAP-04/VII/2026"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Opsi Tampilkan Header di Semua Halaman */}
        <div className="flex items-center pt-2 pl-1">
          <label className="flex items-center gap-2.5 cursor-pointer text-slate-700 select-none">
            <input
              type="checkbox"
              checked={metadata.showHeaderOnAllPages}
              onChange={(e) => handleChange('showHeaderOnAllPages', e.target.checked)}
              className="w-4.5 h-4.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 accent-blue-600"
            />
            <span className="text-xs font-bold text-slate-600">Tampilkan header lengkap di semua halaman</span>
          </label>
        </div>
      </div>
    </div>
  );
}
