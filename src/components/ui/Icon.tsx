import {
  Lock,
  BadgeCheck,
  ShieldCheck,
  Headset,
  RefreshCw,
  Languages,
  SearchCheck,
  Zap,
  Clock,
  MailCheck,
  Plane,
  User,
  BookText,
  Mail,
  ClipboardList,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  lock: Lock,
  'badge-check': BadgeCheck,
  shield: ShieldCheck,
  headset: Headset,
  refresh: RefreshCw,
  languages: Languages,
  'search-check': SearchCheck,
  zap: Zap,
  clock: Clock,
  'mail-check': MailCheck,
  plane: Plane,
  user: User,
  book: BookText,
  mail: Mail,
  clipboard: ClipboardList,
  check: CheckCircle2,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = MAP[name] ?? CheckCircle2
  return <Cmp className={className} aria-hidden="true" />
}
