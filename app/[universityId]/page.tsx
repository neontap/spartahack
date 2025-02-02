"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type PageProps = {
  params: Promise<{ universityId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function UniversityPage({ params, searchParams }: PageProps) {
  const { universityId } = React.use(params);
  const [courses, setCourses] = useState<Course[]>([]);
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [subjectCode, setSubjectCode] = useState<string>("");
  const [courseCode, setCourseCode] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("subject_code")
        .eq("university_id", universityId);

      if (error) {
        console.error("Error fetching subjects:", error);
        return;
      }

      const uniqueSubjects = Array.from(
        new Set(data.map((course) => course.subject_code))
      ).sort();
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchUniversity = async () => {
    try {
      const { data, error } = await supabase
        .from("universities")
        .select("id, name")
        .eq("id", universityId)
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

  const fetchCourses = async (currentPage: number = page) => {
    setLoading(true);
    try {
      const fromIndex = (currentPage - 1) * pageSize;
      const toIndex = currentPage * pageSize - 1;

      let query = supabase
        .from("courses")
        .select(`
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
        `)
        .eq("university_id", universityId)
        .range(fromIndex, toIndex);

      if (subjectCode && courseCode) {
        query = query.eq("subject_code", subjectCode).ilike("course_code", `%${courseCode}%`);
      } else if (courseName) {
        query = query.ilike("title", `%${courseName}%`);
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

  useEffect(() => {
    fetchUniversity();
    fetchSubjects();
  }, [universityId]);

  useEffect(() => {
    setPage(1);
    fetchCourses(1);
  }, [subjectCode, courseCode, courseName]);

  const handleSearch = () => {
    setPage(1);
    fetchCourses(1);
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
    <main className="w-full">
      <div className="bg-md-purple w-full border-t-2 border-purple-600/20 py-8 rounded-b-2xl shadow-md">
        <div className="px-4 flex justify-between items-start">
          {/* Left side - University Info */}
          <div className="flex-1">
            <h1 className="text-7xl font-roboto  font-extrabold">{university.name}</h1>
            <p className="text-lg py-2">East Lansing, MI</p>
            <p className="text-lg font-light py-2 underline">https://msu.edu</p>
          </div>
          {/* Right side - Statistics */}
          <div className="flex-1">
            {/* Student Count & Acceptance Rate */}
            <div className="flex justify-left gap-4 mb-2">
              <div className="text-left">
                <div className="text-4xl text-white font-bold">51,316</div>
                <div className="text-xl font-bold">students</div>
              </div>
            </div>

            <div className="flex justify-left gap-4 mb-2">
              <div className="text-right">
                <div className="text-4xl text-white text-left font-bold">88%</div>
                <div className="text-xl font-bold">acceptance rate</div>
              </div>
            </div>

            {/* Tuition */}
            <div className="flex justify-left gap-4 mb-2">
              <div className="text-left">
                <div className="text-4xl text-white text-left font-bold">$16,118</div>
                <div className="text-xl font-bold">in-state</div>
              </div>

              <div className="text-left ml-20">
                <span className="font-bold  text-4xl text-white">$43,502</span>
                <div className="text-xl font-bold">out-of-state</div>
              </div>
            </div>

            {/* Rankings */}
            <div className="flex justify-left gap-4">
              <div className="text-left">
                <div className="text-4xl font-bold text-white">#30</div>
                <div className="text-xl font-bold">in the U.S. for public schools</div>
              </div>
              <div className="text-left">
                <div className="text-4xl font-bold text-white">#63</div>
                <div className="text-xl font-bold">in the U.S. nationally</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Centered Search Section */}
      <div className="flex justify-center mt-8">
        <div className="space-y-4 rounded-xl px-8 max-w-3xl w-full">
          <h1 className="text-3xl font-bold text-center">Search Your Course</h1>

          {/* Subject and Course Code Search */}
          <div className="flex gap-4 items-center justify-center">
            <Select onValueChange={setSubjectCode} value={subjectCode}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Course Code"
              className="w-32"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Course Name Search */}
          <div className="flex gap-2 justify-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course name"
                className="pl-8"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </div>
      </div>

      {/* Course List */}
      <div className="w-full px-8 py-8">
        {loading ? (
          <p>Loading...</p>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-center">No courses found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-8 mb-8">
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
    <Link href={`/courses/${course.id}`} className="block no-underline">
      <Card className="hover:bg-accent/50 transition-colors bg-white shadow-md border-none cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-rbc-purple/80">{course.subject_code} {course.course_code}</CardTitle>
              <CardDescription className="mt-1 text-rbc-purple font-semibold">{course.title}</CardDescription>
            </div>
            <div className="text-center">

              <span className="text-3xl text-rose-800 font-bold">
                1.8
              </span>

              <p className="text-md font-semibold">
                avg grade
              </p>
              <p className="text-sm text-muted-foreground">1 review</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
