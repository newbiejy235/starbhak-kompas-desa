export type RegisterInput = {
  nama_pengguna: string;
  no_telp: string;
  password: string;
  nama_lengkap: string;
  email: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
