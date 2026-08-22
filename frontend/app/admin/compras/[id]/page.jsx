'use client';

import { useParams } from 'next/navigation';
import useAdminAuth from '@/hooks/useAdminAuth';
import ComprasForm from '@/components/admin/compras/ComprasForm';

export default function EditarCompraPage() {
  const authLoading = useAdminAuth();
  const { id } = useParams();

  if (authLoading) return null;

  return <ComprasForm compraIdInicial={id} />;
}
