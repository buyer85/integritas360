export type UserRole = 'owner' | 'perusahaan' | 'auditor';

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
  danaTersedia: number; // Disinkronkan dengan danaTerkunci untuk penjaminan whistleblowing
  saldo: number;        // Saldo aktif/bebas yang dapat ditarik atau di-deposit
  danaTerkunci?: number;// Dana yang dikunci khusus penjaminan integritas
  biayaJasaPerKasus?: number; // Biaya jasa auditor per kasus (minimal 100.000, default 150.000)
  isLocked?: boolean;   // Status kunci saldo/akun (Lock atau Terbuka)
  lockReason?: string;  // Alasan penguncian saldo oleh Admin
  rekeningBank?: BankDetails;
  namaBank?: string;
  nomorRekening?: string;
  pemilikRekening?: string;
  statusVerifikasiDokumen?: 'pending' | 'terverifikasi' | 'ditolak' | 'belum_upload';
  dokumenUrl?: string;
  dokumenNama?: string;
  catatanVerifikasi?: string;
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
  status: 'baru' | 'proses' | 'valid' | 'selesai' | 'ditolak';
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
  // Workflow Perusahaan & 1x24 Jam Auto-Release
  companyCaseStatus?: 'menunggu_ambil' | 'kasus_diambil' | 'sanksi_ditetapkan' | 'selesai';
  takenAt?: any;            // Waktu perusahaan klik ambil kasus
  autoReleaseDeadline?: any;// Deadline 24 jam setelah kasus diambil (ISO string atau timestamp)
  sanksiKaryawan?: string;  // Keterangan sanksi yang dijatuhkan pada oknum
  rewardReleased?: boolean; // True jika reward sudah dirilis ke pelapor & saldo lock terpotong
  rewardReleasedAt?: any;
  rewardReleaseType?: 'manual_perusahaan' | 'auto_sistem_24jam';
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
  type: 'deposit' | 'withdrawal' | 'lock' | 'unlock' | 'claim_reward';
  amount: number;
  status: 'selesai' | 'pending' | 'dibatalkan' | 'ditolak';
  keterangan: string;
  metode?: string;
  bankDetails?: BankDetails;
  claimReportToken?: string;
  claimReportId?: string;
  whatsapp?: string;
  catatanAdmin?: string;
  processedBy?: string;
  processedAt?: any;
  createdAt?: any;
}
