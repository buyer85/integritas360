export type UserRole = 'owner' | 'perusahaan' | 'admin_perusahaan' | 'auditor';

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  holderName: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  namaPT: string;
  sektor: string;
  alamat: string;
  deskripsi: string;
  telepon?: string;
  npwp?: string;
  picName?: string;
  photoURL?: string;   // Foto Profil Perusahaan (Logo) atau Foto Profil Auditor
  perusahaanId?: string; // Khusus role 'admin_perusahaan': Terikat dengan ID Perusahaan
  perusahaanName?: string; // Khusus role 'admin_perusahaan': Nama PT yang diawasi
  jabatan?: string;    // Jabatan (misal: Admin Kepatuhan, Head of Internal Investigation)
  departemen?: string; // Departemen/Divisi (Audit Internal, Legal, HR)
  statusAkun?: 'aktif' | 'nonaktif' | 'suspended';
  danaTersedia: number;// Disinkronkan dengan danaTerkunci untuk penjaminan whistleblowing
  saldo: number;       // Saldo terbuka / bebas yang dapat ditarik, di-deposit, atau dikunci
  danaTerkunci?: number;// Dana yang dikunci khusus penjaminan integritas
  biayaJasaPerKasus?: number; // Biaya jasa auditor per kasus (minimal 100.000, default 150.000)
  nomorLisensi?: string; // Nomor Lisensi / Izin Praktik / Registrasi Profesi Auditor
  gelarProfesi?: string; // Gelar Profesi Auditor (CPA, CA, CFE, CFrA, Ak., dsb)
  spesialisasiAudit?: string; // Spesialisasi Bidang Audit
  isLocked?: boolean;  // Status kunci saldo/akun (Lock atau Terbuka)
  lockReason?: string; // Alasan penguncian saldo oleh Admin
  rekeningBank?: BankDetails;
  namaBank?: string;
  nomorRekening?: string;
  pemilikRekening?: string;
  statusVerifikasiDokumen?: 'pending' | 'terverifikasi' | 'ditolak' | 'belum_upload';
  dokumenUrl?: string;
  dokumenNama?: string;
  catatanVerifikasi?: string;
  kebijakanReward?: {
    rewardKasusEtik: number;       // Nominal tetap kasus etik (contoh: Rp 2.500.000)
    persenFinansial: number;       // Persen dari kerugian kasus finansial (default 2%)
    minPersenFinansial: number;    // Aturan wajib min 2%
  };
  createdAt?: any;
}

export interface WhistleblowingReport {
  id?: string;
  companyId: string;
  companyName: string;
  judul: string;
  kategori: string;
  tipePelanggaran?: 'finansial' | 'etik';
  estimasiKerugian?: number;
  deskripsi: string;
  tanggalKejadian?: string;
  lokasi?: string;
  status: 'baru' | 'investigasi' | 'terbukti' | 'palsu_hoax' | 'proses' | 'valid' | 'selesai' | 'ditolak';
  tokenAkses: string;
  pelaporAnonim: boolean;
  namaPelapor?: string;
  kontakPelapor?: string;
  whatsappPelapor?: string; // Optional untuk notifikasi pencairan reward
  buktiFiles?: string[];    // Minimal 2 bukti file (base64 data url / nama file bukti)
  isContoh?: boolean;       // True jika dikirim lewat contoh form di halaman utama
  targetAuditorId?: string; // Auditor tunggal yang dipilih
  targetAuditorName?: string;
  targetAuditorIds?: string[]; // Tetap sediakan untuk kompatibilitas filter
  targetAuditorNames?: string[];
  catatanAuditor?: string;
  auditorId?: string;
  auditorName?: string;
  biayaAuditor?: number;    // Biaya jasa auditor per kasus (dari setting auditor, default 150.000)
  auditorVerified?: boolean;// True jika diverifikasi valid oleh auditor
  auditorVerifiedAt?: any;  // Waktu verifikasi valid auditor
  // Workflow Investigasi Menyeluruh Perusahaan & Admin Perusahaan
  investigasiStatus?: 'belum_dimulai' | 'investigasi_berjalan' | 'investigasi_selesai';
  investigasiStartedAt?: any;
  investigasiCompletedAt?: any;
  investigasiNotes?: string;
  investigatorName?: string;
  investigatorRole?: 'perusahaan' | 'admin_perusahaan' | 'auditor';
  hasilInvestigasi?: 'terbukti' | 'palsu_hoax' | 'belum_konklusif';
  hoaxReason?: string; // Alasan keputusan palsu/hoax
  terbuktiNotes?: string;
  companyCaseStatus?: 'menunggu_ambil' | 'kasus_diambil' | 'sanksi_ditetapkan' | 'selesai';
  takenAt?: any;            // Waktu perusahaan klik ambil kasus
  autoReleaseDeadline?: any;// Deadline 24 jam setelah kasus diambil (ISO string atau timestamp)
  sanksiKaryawan?: string;  // Keterangan sanksi yang dijatuhkan pada oknum
  rewardReleased?: boolean; // True jika reward sudah dirilis ke pelapor & saldo lock terpotong
  rewardReleasedAt?: any;
  rewardReleaseType?: 'manual_perusahaan' | 'admin_perusahaan' | 'auto_sistem_24jam';
  // Reward & Claim
  rewardAmount?: number;
  rewardMinAmount?: number;
  rewardStatusPerusahaan?: 'belum_ditentukan' | 'disetujui' | 'dicairkan';
  rewardClaimed?: boolean;
  rewardClaimStatus?: 'none' | 'pending' | 'siap_diklaim' | 'selesai' | 'ditolak';
  rewardClaimBank?: BankDetails;
  rewardClaimWhatsapp?: string;
  createdAt?: any;
}

export interface WalletTransaction {
  id?: string;
  userId: string;
  userName?: string;
  type: 'deposit' | 'withdrawal' | 'lock' | 'unlock' | 'claim_reward' | 'potong_lock_reward' | 'potong_lock_auditor' | 'fee_auditor_masuk';
  amount: number;
  status: 'selesai' | 'pending' | 'dibatalkan' | 'ditolak';
  keterangan: string;
  metode?: string;
  bankDetails?: BankDetails;
  cryptoCurrency?: string;
  cryptoAmount?: number;
  txHash?: string;
  buktiTransferUrl?: string;
  claimReportToken?: string;
  claimReportId?: string;
  whatsapp?: string;
  companyName?: string;
  catatanAdmin?: string;
  processedBy?: string;
  processedAt?: any;
  createdAt?: any;
}
