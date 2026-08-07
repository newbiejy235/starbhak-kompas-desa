"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/user/home");
  }, [router]);

  return null;
}
