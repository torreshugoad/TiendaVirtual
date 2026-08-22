'use client';

import useAdminAuth from '@/hooks/useAdminAuth';
import ComprasForm from '@/components/admin/compras/ComprasForm';

export default function ComprasPage() {
  const authLoading = useAdminAuth();
  if (authLoading) return null;

  return <ComprasForm />;
}
