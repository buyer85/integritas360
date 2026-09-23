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
  deskripsi: string;
  tanggalKejadian?: string;
  lokasi?: string;
  status: 'baru' | 'proses' | 'selesai' | 'ditolak';
  tokenAkses: string;
  pelaporAnonim: boolean;
  namaPelapor?: string;
  kontakPelapor?: string;
  whatsappPelapor?: string; // Optional untuk notifikasi pencairan reward
  buktiFiles?: string[];    // Minimal 2 bukti file (base64 data url / nama file bukti)
  isContoh?: boolean;       // True jika dikirim lewat contoh form di halaman utama
  catatanAuditor?: string;
  auditorId?: string;
  auditorName?: string;
  rewardAmount?: number;
  rewardClaimed?: boolean;
  rewardClaimStatus?: 'none' | 'pending' | 'selesai' | 'ditolak';
  rewardClaimBank?: BankDetails;
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
