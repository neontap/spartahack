"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Search } from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Updated types based on Supabase's returned data shape
type Course = {
  id: number;
  course_code: string;
  title: string;
  historical_average_grade: number | null;
  // 'universities' is returned as an object.
  universities: {
    name: string;
  };
  // 'course_professors' is an array, but each object's 'professors' is now an object.
  course_professors: {
    professors: {
      full_name: string;
    };
  }[];
};

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchCourses = async (search?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("courses")
        .select(`
          id,
          course_code,
          title,
          historical_average_grade,
          universities!inner (
            name
          ),
          course_professors!inner (
            professors!inner (
              full_name
            )
          )
        `)
        .eq("universities.name", "Michigan State University");

      // Add search filter if provided
      if (search) {
        query = query.or(`course_code.ilike.%${search}%,title.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching courses:", error);
        return;
      }

      console.log("Raw Supabase response:", JSON.stringify(data, null, 2));

      setCourses((data as Course[]) || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = () => {
    fetchCourses(searchQuery);
  };

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
              placeholder="Search courses (e.g. CSE380, Introduction to Programming)"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Course List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading...</p>
        ) : courses.length > 0 ? (
          courses.map((course) => <CourseCard key={course.id} course={course} />)
        ) : (
          <p>No courses found.</p>
        )}
      </div>
    </main>
  );
}

// Course Card Component
function CourseCard({ course }: { course: Course }) {
  // Extract instructor from course_professors; since 'professors' is an object:
  const instructor = course.course_professors?.[0]?.professors?.full_name || "Unknown Instructor";

  // 'universities' is now an object
  const universityName = course.universities?.name || "Unknown University";

  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{course.course_code}</CardTitle>
            <CardDescription className="mt-1">{course.title}</CardDescription>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">
              {course.historical_average_grade !== null
                ? course.historical_average_grade.toFixed(1)
                : "N/A"}
            </span>
            <p className="text-sm text-muted-foreground">
              1 review
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Instructor: {instructor}
        </p>
        <p className="text-sm text-muted-foreground">
          University: {universityName}
        </p>
      </CardContent>
    </Card>
  );
}
