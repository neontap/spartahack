"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import UniversityLogo from "@/components/university-logo"
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
import _ from 'lodash';

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
  average_rating: number | null;
  review_count: number;
  universities: {
    name: string;
  };
  course_professors: {
    professors: {
      full_name: string;
    };
  }[];
  reviews: {
    rating: number;
    is_deleted: boolean;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [subjectCode, setSubjectCode] = useState<string>("");
  const [courseCode, setCourseCode] = useState<string>("");
  const [courseName, setCourseName] = useState<string>("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  // Debounced search function
  const debouncedFetchCourses = useCallback(
    _.debounce((currentPage: number, subject: string, code: string, name: string) => {
      fetchCourses(currentPage, subject, code, name);
    }, 300),
    []
  );

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

  const fetchCourses = async (
    currentPage: number = page,
    currentSubject: string = subjectCode,
    currentCourseCode: string = courseCode,
    currentCourseName: string = courseName
  ) => {
    if (!initialLoading) {
      setLoading(true);
    }

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
          ),
          course_reviews (
            rating,
            is_deleted
          )
        `)
        .eq("university_id", universityId)
        .range(fromIndex, toIndex);

      if (currentSubject && currentCourseCode) {
        query = query
          .eq("subject_code", currentSubject)
          .ilike("course_code", `%${currentCourseCode}%`);
      } else if (currentCourseName) {
        query = query.ilike("title", `%${currentCourseName}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching courses:", error);
        return;
      }

      const processedData = (data || []).map(course => {
        const validReviews = course.course_reviews?.filter(r => !r.is_deleted) || [];
        const reviewCount = validReviews.length;
        const averageRating = reviewCount > 0
          ? validReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewCount
          : null;

        return {
          ...course,
          average_rating: averageRating,
          review_count: reviewCount,
          reviews: validReviews,
        };
      });

      setCourses(processedData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      await Promise.all([fetchUniversity(), fetchSubjects()]);
      await fetchCourses(1);
    };
    initializePage();
  }, [universityId]);

  useEffect(() => {
    setPage(1);
    debouncedFetchCourses(1, subjectCode, courseCode, courseName);

    return () => {
      debouncedFetchCourses.cancel();
    };
  }, [subjectCode, courseCode, courseName]);

  const handleSearch = () => {
    setPage(1);
    debouncedFetchCourses.cancel();
    fetchCourses(1, subjectCode, courseCode, courseName);
  };

  const handleNextPage = () => {
    if (courses.length === pageSize) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCourses(nextPage);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchCourses(prevPage);
    }
  };

  if (initialLoading) {
    return <div className="container mx-auto py-6">Loading university details...</div>;
  }

  return (
    <main className="w-full">
      {/* Logo section */}
      <div className="w-full mr-4">
        <UniversityLogo
          universityName="Michigan State University"
          universityLocation="East Lansing, MI"
        />
      </div>
      {/* Search Section */}
      <div className="flex justify-center mt-4 bg-slight-purple">
        <div className="space-y-4 rounded-xl px-8 max-w-3xl w-full">
          <h1 className="text-3xl font-bold text-center">Search Your Course</h1>
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
      <div className="w-full px-8 py-8 bg-slight-purple min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full opacity-50">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
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

      {/* Pagination */}
      <div className="flex justify-center gap-4 mt-8 mb-8">
        <Button onClick={handlePreviousPage} disabled={page === 1 || loading}>
          Previous
        </Button>
        <span className="self-center">Page {page}</span>
        <Button onClick={handleNextPage} disabled={courses.length < pageSize || loading}>
          Next
        </Button>
      </div>
    </main>
  );
}

function CourseCard({ course }: { course: Course }) {
  const instructor =
    course.course_professors?.[0]?.professors?.full_name || "Unknown Instructor";

  const getQualityColor = (rating: any) => {
    if (rating >= 3) return 'text-green-600';
    if (rating >= 2) return 'text-yellow-400';
    return 'text-red-600';
  };

  return (
    <Link href={`/courses/${course.id}`} className="block no-underline">
      <Card className="hover:bg-accent/50 transition-colors bg-white shadow-md border-none cursor-pointer">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-rbc-purple/80">
                {course.subject_code} {course.course_code}
              </CardTitle>
              <CardDescription className="mt-1 text-rbc-purple font-semibold">
                {course.title}
              </CardDescription>
            </div>
            <div className="text-center">
              <span className={`text-3xl ${getQualityColor(course.average_rating ? course.average_rating.toFixed(1) : '0')} text-rose-800 font-bold`}>
                {course.average_rating ? course.average_rating.toFixed(1) : 'N/A'}
              </span>
              <p className="text-md font-semibold">rating</p>
              <p className="text-sm text-muted-foreground">
                {course.review_count} {course.review_count === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
