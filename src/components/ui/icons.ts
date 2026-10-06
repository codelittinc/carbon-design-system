/**
 * The icons the design system draws with, re-exported so an app uses the same
 * set (and the same version) without depending on `lucide-react` itself or
 * hand-drawing SVGs.
 *
 * Named exports with an `Icon` suffix — `SearchIcon`, not `Search` — so none
 * shadows a browser global (`File`) or a component (`Search`). Import only
 * what you use; each is its own module, so the rest is tree-shaken away.
 *
 * Every icon is an `<svg>` taking `size`, `className`, `strokeWidth` and the
 * SVG attributes. Lucide marks it `aria-hidden`, so an icon that is the only
 * content of a control needs a name on the control (`aria-label` on the
 * `Button`); one that means something on its own needs `aria-label` and
 * `role="img"` itself.
 *
 * Need one that is not here? Add it to this list rather than importing
 * `lucide-react` in the app.
 */
export {
  AlertCircle as AlertCircleIcon,
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ArrowUp as ArrowUpIcon,
  ArrowUpDown as ArrowUpDownIcon,
  Ban as BanIcon,
  Calendar as CalendarIcon,
  Check as CheckIcon,
  CheckCircle2 as CheckCircleIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  Copy as CopyIcon,
  Download as DownloadIcon,
  ExternalLink as ExternalLinkIcon,
  Eye as EyeIcon,
  File as FileIcon,
  FileText as FileTextIcon,
  Info as InfoIcon,
  LoaderCircle as LoaderIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Pencil as PencilIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Trash2 as TrashIcon,
  TriangleAlert as WarningIcon,
  Upload as UploadIcon,
  Users as UsersIcon,
  X as XIcon,
  type LucideIcon as IconComponent,
  type LucideProps as IconProps,
} from "lucide-react";
