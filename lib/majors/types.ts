export type MajorListItem = {
  text: string
  href?: string
  course?: boolean
  // Newer scraper output
  main_catalog_id?: number
  // Older scraper output (keep for compatibility)
  main_course_id?: number
}

export type MajorSection = {
  title: string
  level: number
  hours: number | null
  paragraphs: string[]
  lists: MajorListItem[][]
  subsections: MajorSection[]
}

export type Major = {
  url: string
  sections: MajorSection[]
}

export type MajorsJson = Record<string, Major>

