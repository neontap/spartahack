"use client";
import Link from "next/link";
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

type Course = {
  id: number;
  course_code: string;
  subject_code: string;
  title: string;
  historical_average_grade: number | null;
  universities: {
    name: string;
  };
  course_professors: {
    professors: {
      full_name: string;
    };
  }[];
};

type University = {
  id: number;
  name: string;
};

export default function UniversityPage({ params }: { params: { universityId: string } }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Fetch university details
  const fetchUniversity = async () => {
    try {
      const { data, error } = await supabase
        .from("universities")
        .select("id, name")
        .eq("id", params.universityId)
        .single();

      if (error) {
        console.error("Error fetching university:", error);
        return;
      }

      setUniversity(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchCourses = async (search?: string, currentPage: number = page) => {
    setLoading(true);
    try {
      const fromIndex = (currentPage - 1) * pageSize;
      const toIndex = currentPage * pageSize - 1;

      let query = supabase
        .from("courses")
        .select(
          `
          id,
          course_code,
          title,
          subject_code,
          historical_average_grade,
          universities!inner (
            name
          ),
          course_professors!inner (
            professors!inner (
              full_name
            )
          )
        `
        )
        .eq("university_id", params.universityId)
        .range(fromIndex, toIndex);

      if (search) {
        query = query.or(
          `course_code.ilike.%${search}%,title.ilike.%${search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching courses:", error);
        return;
      }

      setCourses((data as unknown as Course[]) || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of university details
  useEffect(() => {
    fetchUniversity();
  }, [params.universityId]);

  // Reset to page 1 when searchQuery changes
  useEffect(() => {
    setPage(1);
    fetchCourses(searchQuery, 1);
  }, [searchQuery]);

  // Fetch courses when page changes
  useEffect(() => {
    fetchCourses(searchQuery, page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchCourses(searchQuery, 1);
  };

  const handleNextPage = () => {
    if (courses.length === pageSize) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  if (!university) {
    return <div className="container mx-auto py-6">Loading university details...</div>;
  }

  return (
    <main className="container mx-auto py-6 space-y-8">
      {/* Search Section */}
      <div className="space-y-4">
        <h1 className="text-lg">{university.name}</h1>
        <h1 className="text-4xl font-bold">Find Your Course</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses (e.g. CSE380, Introduction to Programming)"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-8">
        <Button onClick={handlePreviousPage} disabled={page === 1}>
          Previous
        </Button>
        <span className="self-center">Page {page}</span>
        <Button onClick={handleNextPage} disabled={courses.length < pageSize}>
          Next
        </Button>
      </div>
    </main>
  );
}

// Course Card Component
function CourseCard({ course }: { course: Course }) {
  const instructor =
    course.course_professors?.[0]?.professors?.full_name || "Unknown Instructor";

  return (
    <Link 
      href={`/courses/${course.id}`}
      className="block no-underline"
    >
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{course.subject_code} {course.course_code}</CardTitle>
              <CardDescription className="mt-1">{course.title}</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">
                {course.historical_average_grade !== null
                  ? course.historical_average_grade.toFixed(1)
                  : "N/A"}
              </span>
              <p className="text-sm text-muted-foreground">1 review</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {instructor}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
