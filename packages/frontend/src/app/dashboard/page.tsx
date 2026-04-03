'use client'

import ReportList from '@/components/dashboard/ReportList'
import { DashboardSkeleton } from '@/components/Skeleton'
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<DashboardSkeleton />}>
        <ReportList />
      </Suspense>
    </div>
  )
}
