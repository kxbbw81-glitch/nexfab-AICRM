'use client'

import { CustomerProfileView } from '@/components/p1-customer-profile-view'
import { RetentionView } from '@/components/p1-retention-view'
import { NotAvailableView } from '@/components/not-available-view'

export function CustomerLifecycleView({ active }: { active: { moduleId: string; subName: string } }) {
  if (active.moduleId === 'customer' && active.subName === '客户画像') {
    return <CustomerProfileView active={active} />
  }
  if (active.moduleId === 'pipeline' && active.subName === '售后与复购') {
    return <RetentionView active={active} />
  }
  return <NotAvailableView title={active.subName} reason="当前客户生命周期入口尚未接入。" needed="复用已有客户画像或复购入口后接入。" />
}
