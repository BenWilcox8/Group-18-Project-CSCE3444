"use client"

import { useEffect, useMemo, useState } from "react"

import { Header } from "@/components/eagle-plan/header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { parseCourseHours } from "@/lib/courses/hours"
import type { MajorListItem, MajorSection, MajorsJson } from "@/lib/majors/types"

type CourseHoursIndex = Record<string, string | null>

type CourseNode = {
  key: string
  label: string
  id?: number
}

type SectionId = string

type SectionMeta = {
  id: SectionId
  section: MajorSection
  parentId?: SectionId
  token?: string // 1,2,3... within parent
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

function collectLevels(section: MajorSection, out: number[] = []): number[] {
  out.push(section.level)
  for (const sub of section.subsections || []) collectLevels(sub, out)
  return out
}

function getMainCatalogId(item: MajorListItem): number | null {
  if (typeof item.main_catalog_id === "number") return item.main_catalog_id
  // Back-compat: some majors.json may still use main_course_id
  if (typeof item.main_course_id === "number") return item.main_course_id
  return null
}

function isUntCourseHref(href: string | undefined): boolean {
  if (!href) return false
  return (
    href.startsWith("https://catalog.unt.edu/preview_course_nopop.php?")
    && href.includes("catoid=")
    && href.includes("coid=")
  )
}

function isCourseItem(item: MajorListItem): boolean {
  return item.course === true || isUntCourseHref(item.href)
}

function courseNodeFromItem(item: MajorListItem): CourseNode | null {
  if (!isCourseItem(item)) return null
  const id = getMainCatalogId(item)
  if (id != null) return { key: `id:${id}`, id, label: item.text }
  if (item.href) return { key: `href:${item.href}`, label: item.text }
  return { key: `text:${item.text}`, label: item.text }
}

function buildSectionIndex(root: MajorSection) {
  let seq = 0
  const idBySection = new WeakMap<MajorSection, SectionId>()
  const tokenById = new Map<SectionId, string>()
  const parentById = new Map<SectionId, SectionId | undefined>()
  const metaById = new Map<SectionId, SectionMeta>()
  const traversal: SectionId[] = []

  const getId = (s: MajorSection): SectionId => {
    const existing = idBySection.get(s)
    if (existing) return existing
    const id = `sec_${seq++}`
    idBySection.set(s, id)
    return id
  }

  const visit = (s: MajorSection, parentId?: SectionId) => {
    const id = getId(s)
    parentById.set(id, parentId)
    traversal.push(id)

    const meta: SectionMeta = {
      id,
      section: s,
      parentId,
      token: tokenById.get(id),
    }
    metaById.set(id, meta)

    const subs = s.subsections || []
    subs.forEach((sub, idx) => {
      const childId = getId(sub)
      tokenById.set(childId, String(idx + 1))
      visit(sub, id)
    })
  }

  visit(root, undefined)

  const getMeta = (id: SectionId) => metaById.get(id)
  const getIdForSection = (s: MajorSection) => getId(s)
  const getDomId = (id: SectionId) => `selector-${id}`

  const metasAtLevel = (level: number): SectionMeta[] => {
    const out: SectionMeta[] = []
    for (const id of traversal) {
      const m = metaById.get(id)
      if (m && m.section.level === level && m.section !== root) out.push(m)
    }
    return out
  }

  return { getMeta, getIdForSection, getDomId, metasAtLevel }
}

function computeSelectedHoursForSection(
  section: MajorSection,
  selected: Set<string>,
  hoursIndex: CourseHoursIndex | null,
  getCourseNodesInSubtree: (s: MajorSection) => CourseNode[],
): number {
  const refs = getCourseNodesInSubtree(section)
  let sum = 0
  for (const r of refs) {
    if (!selected.has(r.key)) continue
    if (r.id == null) continue
    const raw = hoursIndex?.[String(r.id)]
    sum += parseCourseHours(raw)
  }
  return sum
}

function selectedCoursesForSection(
  section: MajorSection,
  selected: Set<string>,
  getCourseNodesInSubtree: (s: MajorSection) => CourseNode[],
): CourseNode[] {
  const refs = getCourseNodesInSubtree(section)
  // Dedup by course key to avoid showing the same course multiple times when
  // it appears under multiple subsections.
  const unique = new Map<string, CourseNode>()
  for (const r of refs) {
    if (!selected.has(r.key)) continue
    unique.set(r.key, r)
  }
  return Array.from(unique.values())
}

function LevelColumn({
  level,
  root,
  selected,
  setSelected,
  hoursIndex,
  getCourseNodesInSubtree,
  metasAtLevel,
  focusedId,
  setFocusedId,
  getDomId,
  getIdForSection,
  getMeta,
}: {
  level: number
  root: MajorSection
  selected: Set<string>
  setSelected: (next: Set<string>) => void
  hoursIndex: CourseHoursIndex | null
  getCourseNodesInSubtree: (s: MajorSection) => CourseNode[]
  metasAtLevel: (lvl: number) => SectionMeta[]
  focusedId: SectionId | null
  setFocusedId: (id: SectionId | null) => void
  getDomId: (id: SectionId) => string
  getIdForSection: (s: MajorSection) => SectionId
  getMeta: (id: SectionId) => SectionMeta | undefined
}) {
  const sectionsAtLevel = useMemo(() => metasAtLevel(level), [metasAtLevel, level])

  return (
    <div className="flex flex-col gap-3 min-w-[280px]">
      {sectionsAtLevel.map((meta) => (
        <SectionCard
          key={meta.id}
          meta={meta}
          selected={selected}
          setSelected={setSelected}
          hoursIndex={hoursIndex}
          getCourseNodesInSubtree={getCourseNodesInSubtree}
          focusedId={focusedId}
          setFocusedId={setFocusedId}
          getDomId={getDomId}
          getIdForSection={getIdForSection}
          getMeta={getMeta}
        />
      ))}
    </div>
  )
}

function HoursLine({ x, y }: { x: number; y: number | null }) {
  if (y == null) return <span className="text-xs text-muted-foreground">{x} Hours</span>
  return <span className="text-xs text-muted-foreground">{x}/{y} Hours</span>
}

function Token({ token }: { token?: string }) {
  if (!token) return null
  return (
    <span className="inline-flex items-center justify-center rounded-full border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
      {token}
    </span>
  )
}

function CourseChecklist({
  items,
  selected,
  setSelected,
}: {
  items: MajorListItem[]
  selected: Set<string>
  setSelected: (next: Set<string>) => void
}) {
  const courseItems = items
    .map((item) => courseNodeFromItem(item))
    .filter((x): x is CourseNode => x != null)

  if (courseItems.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {courseItems.map((node) => {
        const checked = selected.has(node.key)
        return (
          <label key={node.key} className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => {
                const next = new Set(selected)
                if (v) next.add(node.key)
                else next.delete(node.key)
                setSelected(next)
              }}
            />
            <span className="leading-snug">{node.label}</span>
          </label>
        )
      })}
    </div>
  )
}

function SubsectionBox({
  subsection,
  subsectionId,
  token,
  selected,
  hoursIndex,
  getCourseNodesInSubtree,
  focusedId,
  setFocusedId,
  scrollToId,
}: {
  subsection: MajorSection
  subsectionId: SectionId
  token?: string
  selected: Set<string>
  hoursIndex: CourseHoursIndex | null
  getCourseNodesInSubtree: (s: MajorSection) => CourseNode[]
  focusedId: SectionId | null
  setFocusedId: (id: SectionId | null) => void
  scrollToId: (id: SectionId) => void
}) {
  const chosen = selectedCoursesForSection(subsection, selected, getCourseNodesInSubtree)
  const x = computeSelectedHoursForSection(subsection, selected, hoursIndex, getCourseNodesInSubtree)
  const isFocused = focusedId === subsectionId

  return (
    <div className="space-y-2">
      {/* Subsection header (no bounding box) */}
      <button
        type="button"
        className={[
          "w-full text-left flex items-center justify-between gap-3 rounded-md px-2 py-1",
          "hover:bg-muted/40 transition-colors",
          isFocused ? "bg-muted/50 ring-2 ring-primary/30" : "",
        ].join(" ")}
        onMouseEnter={() => setFocusedId(subsectionId)}
        onMouseLeave={() => setFocusedId(null)}
        onClick={() => {
          setFocusedId(subsectionId)
          scrollToId(subsectionId)
        }}
      >
        <div className="flex items-center gap-2">
          <Token token={token} />
          <span className="text-xs text-muted-foreground">→</span>
          <div className="text-sm font-medium">{subsection.title}</div>
        </div>
        <HoursLine x={x} y={subsection.hours} />
      </button>

      {/* Selected courses box (keep as box) */}
      <div className="min-h-[44px] rounded-md border bg-background p-2">
        {chosen.length === 0 ? (
          <div className="text-xs text-muted-foreground">No courses selected</div>
        ) : (
          <ul className="list-disc pl-5 space-y-1">
            {chosen.map((c) => (
              <li key={c.key} className="text-xs">
                {c.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function SectionCard({
  meta,
  selected,
  setSelected,
  hoursIndex,
  getCourseNodesInSubtree,
  focusedId,
  setFocusedId,
  getDomId,
  getIdForSection,
  getMeta,
}: {
  meta: SectionMeta
  selected: Set<string>
  setSelected: (next: Set<string>) => void
  hoursIndex: CourseHoursIndex | null
  getCourseNodesInSubtree: (s: MajorSection) => CourseNode[]
  focusedId: SectionId | null
  setFocusedId: (id: SectionId | null) => void
  getDomId: (id: SectionId) => string
  getIdForSection: (s: MajorSection) => SectionId
  getMeta: (id: SectionId) => SectionMeta | undefined
}) {
  const section = meta.section
  const x = computeSelectedHoursForSection(section, selected, hoursIndex, getCourseNodesInSubtree)
  const listItems = (section.lists || []).flat()
  const isFocused = focusedId === meta.id

  const scrollToId = (id: SectionId) => {
    const el = document.getElementById(getDomId(id))
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })
  }

  return (
    <Card
      id={getDomId(meta.id)}
      className={[
        "py-4 scroll-mt-28",
        isFocused ? "ring-2 ring-primary/40 border-primary/30" : "",
      ].join(" ")}
      onMouseEnter={() => setFocusedId(meta.id)}
      onMouseLeave={() => setFocusedId(null)}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Token token={meta.token} />
            <span>{section.title}</span>
          </div>
          <HoursLine x={x} y={section.hours} />
        </div>

        {section.paragraphs?.length ? (
          <div className="text-xs text-muted-foreground mb-3 space-y-1">
            {section.paragraphs.slice(0, 2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}

        {/* Lists (courses) */}
        <CourseChecklist items={listItems} selected={selected} setSelected={setSelected} />

        {/* Subsections (shown as headers; selections roll up automatically) */}
        {section.subsections?.length ? (
          <div className="mt-3 flex flex-col gap-3">
            {section.subsections.map((sub, idx) => {
              const subsectionId = getIdForSection(sub)
              const token = getMeta(subsectionId)?.token ?? String(idx + 1)
              return (
                <SubsectionBox
                  key={subsectionId}
                  subsection={sub}
                  subsectionId={subsectionId}
                  token={token}
                  selected={selected}
                  hoursIndex={hoursIndex}
                  getCourseNodesInSubtree={getCourseNodesInSubtree}
                  focusedId={focusedId}
                  setFocusedId={setFocusedId}
                  scrollToId={scrollToId}
                />
              )
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export default function SelectorPage() {
  const [majors, setMajors] = useState<MajorsJson | null>(null)
  const [majorName, setMajorName] = useState<string>("")
  const [hoursIndex, setHoursIndex] = useState<CourseHoursIndex | null>(null)
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set())
  const [focusedId, setFocusedId] = useState<SectionId | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/data/majors.json")
      .then((r) => r.json())
      .then((data: MajorsJson) => {
        if (cancelled) return
        setMajors(data)
        const first = Object.keys(data)[0] || ""
        setMajorName(first)
      })
      .catch(() => {
        if (cancelled) return
        setMajors({})
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!majorName) return
    // Load course hours lazily
    if (hoursIndex) return
    fetch("/data/courseHoursByMainCatalogId.json")
      .then((r) => r.json())
      .then((data: CourseHoursIndex) => setHoursIndex(data))
      .catch(() => setHoursIndex({}))
  }, [majorName, hoursIndex])

  useEffect(() => {
    // Reset selection when major changes (simplest behavior for now)
    setSelectedCourses(new Set())
  }, [majorName])

  const major = majors?.[majorName]
  const level2Sections = major?.sections?.filter((s) => s.level === 2) ?? []

  const getCourseNodesInSubtree = useMemo(() => {
    const cache = new WeakMap<MajorSection, CourseNode[]>()
    const build = (sec: MajorSection): CourseNode[] => {
      const existing = cache.get(sec)
      if (existing) return existing
      const map = new Map<string, CourseNode>()
      for (const list of sec.lists || []) {
        for (const item of list || []) {
          const node = courseNodeFromItem(item)
          if (node) map.set(node.key, node)
        }
      }
      for (const sub of sec.subsections || []) {
        for (const node of build(sub)) map.set(node.key, node)
      }
      const nodes = Array.from(map.values())
      cache.set(sec, nodes)
      return nodes
    }
    return build
  }, [majorName])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6">
            <Badge variant="outline" className="mb-2">
              Selector
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">Requirement Selector</h1>
            <p className="text-muted-foreground">
              Pick your major and select courses to satisfy catalog requirements.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-8">
            <div className="text-sm font-medium text-foreground">Major</div>
            <Select value={majorName} onValueChange={setMajorName}>
              <SelectTrigger className="min-w-[320px]">
                <SelectValue placeholder="Select a major" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(majors || {}).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {level2Sections.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-muted-foreground">
                No major data loaded. Make sure `public/data/majors.json` exists.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-10">
              {level2Sections.map((lvl2, idx) => {
                const index = buildSectionIndex(lvl2)
                const levels = uniq(collectLevels(lvl2, [])).filter((l) => l > 2).sort((a, b) => a - b)
                const columns = levels.length
                const x = computeSelectedHoursForSection(lvl2, selectedCourses, hoursIndex, getCourseNodesInSubtree)

                return (
                  <section key={`${lvl2.title}-${idx}`} className="space-y-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-bold">{lvl2.title}</h2>
                        <HoursLine x={x} y={lvl2.hours} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Columns: {Math.max(columns, 1)}
                      </div>
                    </div>

                    {columns === 0 ? (
                      <Card>
                        <CardContent className="p-6 text-muted-foreground">
                          No subsections for this section.
                        </CardContent>
                      </Card>
                    ) : (
                      <ScrollArea className="w-full">
                        <div className="flex gap-4 pb-2">
                          {levels.map((level) => (
                            <LevelColumn
                              key={level}
                              level={level}
                              root={lvl2}
                              selected={selectedCourses}
                              setSelected={setSelectedCourses}
                              hoursIndex={hoursIndex}
                              getCourseNodesInSubtree={getCourseNodesInSubtree}
                              metasAtLevel={index.metasAtLevel}
                              focusedId={focusedId}
                              setFocusedId={setFocusedId}
                              getDomId={index.getDomId}
                              getIdForSection={index.getIdForSection}
                              getMeta={index.getMeta}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </section>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

