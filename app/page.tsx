import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

// Sample course data type
type Course = {
  id: string
  code: string
  name: string
  department: string
  rating: number
  numReviews: number
}

// Sample courses data
const sampleCourses: Course[] = [
  {
    id: "cse231",
    code: "CSE 231",
    name: "Introduction to Programming I",
    department: "Computer Science",
    rating: 4.2,
    numReviews: 245
  },
  {
    id: "mth132",
    code: "MTH 132",
    name: "Calculus I",
    department: "Mathematics",
    rating: 3.8,
    numReviews: 312
  },
  {
    id: "phy183",
    code: "PHY 183",
    name: "Physics for Scientists and Engineers I",
    department: "Physics",
    rating: 4.0,
    numReviews: 178
  },
  {
    id: "cmse201",
    code: "CMSE 201",
    name: "Computational Modeling and Data Analysis I",
    department: "Computational Mathematics",
    rating: 4.4,
    numReviews: 156
  },
  {
    id: "cem141",
    code: "CEM 141",
    name: "General Chemistry",
    department: "Chemistry",
    rating: 3.9,
    numReviews: 289
  },
  {
    id: "ec201",
    code: "EC 201",
    name: "Introduction to Microeconomics",
    department: "Economics",
    rating: 4.1,
    numReviews: 203
  },
  {
    id: "sta315",
    code: "STA 315",
    name: "Introduction to Probability and Statistics",
    department: "Statistics",
    rating: 3.7,
    numReviews: 167
  },
  {
    id: "bio171",
    code: "BIO 171",
    name: "Cell and Molecular Biology",
    department: "Biology",
    rating: 4.3,
    numReviews: 234
  },
  {
    id: "cse232",
    code: "CSE 232",
    name: "Introduction to Programming II",
    department: "Computer Science",
    rating: 4.5,
    numReviews: 198
  }
]

export default function HomePage() {
  return (
    <main className="container mx-auto py-6 space-y-8">
      {/* Search Section */}
      <div className="space-y-4">
        <h1 className="text-lg">Michigan State University</h1>
        <h1 className="text-4xl font-bold">Find Your Course</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses (e.g. CSE231, Introduction to Programming)"
              className="pl-8"
            />
          </div>
          <Button>Search</Button>
        </div>
      </div>
      {/* Course List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sampleCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </main>
  )
}

// Course Card Component
function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{course.code}</CardTitle>
            <CardDescription className="mt-1">{course.name}</CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{course.rating}</span>
            <p className="text-sm text-muted-foreground">
              {course.numReviews} reviews
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Department: {course.department}
        </p>
      </CardContent>
    </Card>
  )
}
