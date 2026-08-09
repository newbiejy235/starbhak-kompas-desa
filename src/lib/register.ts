export type RegisterDraft = {
  fullName: string;
  username: string;
  noTelp: string;
  email: string;
  komoditas: string;
  lokasi: string;
  estimasi: string;
};

const KEY = "kd_register";

export function getRegisterDraft(): RegisterDraft {
  if (typeof window === "undefined") {
    return {
      fullName: "",
      username: "",
      noTelp: "",
      email: "",
      komoditas: "",
      lokasi: "",
      estimasi: "",
    };
  }
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) {
      return {
        fullName: "",
        username: "",
        noTelp: "",
        email: "",
        komoditas: "",
        lokasi: "",
        estimasi: "",
      };
    }
    return { ...getEmptyDraft(), ...(JSON.parse(raw) as Partial<RegisterDraft>) };
  } catch {
    return getEmptyDraft();
  }
}

export function saveRegisterDraft(partial: Partial<RegisterDraft>) {
  if (typeof window === "undefined") return;
  const draft = { ...getRegisterDraft(), ...partial };
  window.sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearRegisterDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}

function getEmptyDraft(): RegisterDraft {
  return {
    fullName: "",
    username: "",
    noTelp: "",
    email: "",
    komoditas: "",
    lokasi: "",
    estimasi: "",
  };
}
