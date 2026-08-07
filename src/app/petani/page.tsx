"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PetaniIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/petani/dashboard");
  }, [router]);

  return null;
}
