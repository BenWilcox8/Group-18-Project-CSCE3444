import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

if (typeof global !== 'undefined') {
  (global as any).DOMMatrix = (global as any).DOMMatrix || class DOMMatrix {};
  (global as any).ImageData = (global as any).ImageData || class ImageData {};
  (global as any).Path2D = (global as any).Path2D || class Path2D {};
}

interface ParsedCourse {
  code: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

/**
 * UNT transcripts use "2024 Fall" / "2025 Spring" format (year first).
 */
function detectSemester(line: string): string | null {
  const yearFirst = line.match(/^(20\d{2})\s+(Fall|Spring|Summer(?:\s+I{1,3})?|Winter)\s*$/i);
  if (yearFirst) return `${yearFirst[2]} ${yearFirst[1]}`;
  const standard = line.match(/\b(Fall|Spring|Summer(?:\s+I{1,3})?|Winter)\s+(20\d{2})\b/i);
  if (standard && line.length < 40) return `${standard[1]} ${standard[2]}`;
  return null;
}

const VALID_GRADE = /^(A[+-]?|B[+-]?|C[+-]?|D[+-]?|F|P|CR|S|NC|W|WF|I|IP|T[ABCDF])$/i;

/**
 * UNT PDF columns run together with no delimiter:
 *   ACCT2010ACCOUNT PRIN I3.0003.000B9.000
 *   ART 1300ART APPREC NON-MAJORS3.0003.000TA0.000
 *
 * Fix: restrict title to letters/spaces so it can never swallow credit digits.
 */
function parseCourseRow(line: string, semester: string): ParsedCourse | null {
  // Title group: must start with a letter, contains only letters/spaces/common punctuation
  // This prevents the regex from eating the credit columns (which start with digits)
  const re = new RegExp(
    '^([A-Z]+)\\s*(\\d{4})\\s*' +           // SUBJ + NUM
    '([A-Za-z][A-Za-z0-9 ,()\'\\/\\-]*?)\\s*' + // TITLE (no bare digits)
    '(\\d{1,2}\\.\\d{3})\\s*' +              // ATTEMPTED credits
    '(\\d{1,2}\\.\\d{3})\\s*' +              // EARNED credits
    '(T?[A-F][+-]?)\\s*' +                   // GRADE
    '(\\d+\\.\\d{3})\\s*$'                   // POINTS
  );

  const match = line.match(re);
  if (!match) return null;

  const [, subj, num, rawName, rawAttempted, , grade] = match;

  if (/^Y[A-Z]+$/.test(subj)) return null; // skip YBIO/YKIN placeholders
  if (!VALID_GRADE.test(grade)) return null;

  const credits = parseFloat(rawAttempted);
  if (isNaN(credits) || credits <= 0 || credits > 12) return null;

  const name = rawName.replace(/\s{2,}/g, ' ').replace(/\.+$/, '').trim();
  if (name.length < 2) return null;

  const normalizedGrade = /^T[A-F]$/i.test(grade)
    ? grade.slice(1).toUpperCase()
    : grade.toUpperCase();

  return {
    code: `${subj.trim()} ${num}`,
    name,
    credits,
    grade: normalizedGrade,
    semester,
  };
}

function parseTranscript(rawText: string): ParsedCourse[] {
  const text = cleanText(rawText);
  const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);

  const courses: ParsedCourse[] = [];
  let currentSemester = 'Unknown Semester';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const semester = detectSemester(line);
    if (semester) {
      currentSemester = semester;
      continue;
    }

    if (
      /^(Course|Description|Attempted|Earned|GPA|Points|Term|Cum|Transfer|Comb|Program|Plan|Campus|Academic|Standing|Page|Name|Student|Print|Beginning|End|Non-Course|Milestone|Status|Repeated|Repeat|UNT|Career|Unofficial|Engineering|Computer|Information|Business|Technology)/i.test(line) ||
      /^\d+(\.\d+)?$/.test(line) ||
      line.length < 8
    ) {
      continue;
    }

    let course = parseCourseRow(line, currentSemester);
    if (course) {
      courses.push(course);
      continue;
    }

    if (i + 1 < lines.length) {
      const merged = line + ' ' + lines[i + 1];
      course = parseCourseRow(merged, currentSemester);
      if (course) {
        courses.push(course);
        i++;
        continue;
      }
    }
  }

  const seen = new Map<string, ParsedCourse>();
  for (const c of courses) {
    seen.set(`${c.code}::${c.semester}`, c);
  }

  return Array.from(seen.values());
}

export async function POST(request: Request) {
  try {
    const pdf = require('pdf-parse/lib/pdf-parse.js');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdf(buffer);
    const rawText: string = data.text;

    if (process.env.NODE_ENV !== 'production') {
      console.log('=== RAW PDF TEXT ===');
      console.log(rawText);
      console.log('=== END RAW PDF TEXT ===');
    }

    const courses = parseTranscript(rawText);

    if (courses.length === 0) {
      return NextResponse.json({
        error: 'No courses found. See rawTextSample to tune the regex.',
        rawTextSample: rawText.slice(0, 2000),
        courses: [],
      }, { status: 422 });
    }

    return NextResponse.json({ courses });

  } catch (error: any) {
    console.error('PDF Parsing Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}