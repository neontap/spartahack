"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import UniversityLogo from "@/components/university-logo";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { Search, AlertCircle, GraduationCap, Users, Star, ChevronDown } from "lucide-react";
import _ from 'lodash';
import router from "next/router";

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
    average_rating: any;
    review_count: number;
    universities: {
        name: string;
    }[];
    course_professors: {
        professors: Professor[];
    }[];
    reviews: {
        rating: number;
        is_deleted: boolean;
    }[];
};

interface Professor {
    full_name: string;
}

type University = {
    id: number;
    name: string;
};

type PageProps = {
    params: Promise<{ universityId: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Skeleton loader for course cards
function CourseCardSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="space-y-2 w-2/3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <div className="text-center w-16">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-4 w-16 mt-2" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
            </CardContent>
        </Card>
    );
}

function CourseCard({ course }: { course: Course }) {
    const instructors = course.course_professors?.map(cp => {
        const full_name = cp.professors['full_name'];
        if (!full_name) return "Unknown Instructor";

        const nameParts = full_name.split(' ');
        const firstInitial = nameParts[0][0];
        const lastName = nameParts[nameParts.length - 1];

        return `${firstInitial}. ${lastName}`;
    })
        .slice(-3)
        .join(', ') || "Unknown Instructor";

    const getQualityColor = (rating: number | null) => {
        if (!rating) return 'text-gray-400';
        if (rating >= 4) return 'text-green-600';
        if (rating >= 3) return 'text-yellow-500';
        if (rating >= 2) return 'text-red-500';
        return 'text-red-500';
    };

    const getRatingLabel = (rating: number | null) => {
        if (!rating) return 'No ratings';
        if (rating >= 4) return 'Excellent';
        if (rating >= 3) return 'Fair';
        return 'Poor';
    };

    return (
        <Link href={`/courses/${course.id}`} className="block no-underline transition-transform hover:scale-102">
            <Card className="h-full hover:shadow-lg transition-shadow duration-200 bg-white">
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg font-bold text-rbc-purple ">
                                    {course.subject_code} {course.course_code}
                                </CardTitle>
                                {course.historical_average_grade && (
                                    <Badge variant="secondary" className="text-xs">
                                        Avg Grade: {course.historical_average_grade.toFixed(1)}
                                    </Badge>
                                )}
                            </div>
                            <CardDescription className="mt-1 text-base font-medium text-gray-700 line-clamp-2">
                                {course.title}
                            </CardDescription>
                        </div>

                        <div className="text-center min-w-[80px]">
                            <div className={`text-3xl font-bold ${getQualityColor(course.average_rating)}`}>
                                {course.average_rating ? course.average_rating.toFixed(1) : '-'}
                            </div>
                            <p className="text-sm font-medium text-gray-600">
                                {getRatingLabel(course.average_rating)}
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{instructors}</span>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-4 w-4" />
                        <span>
                            {course.review_count} {course.review_count === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </CardFooter>
            </Card>
        </Link>
    );
}

export default function UniversityPage({ params, searchParams }: PageProps) {
    const { universityId } = React.use(params);
    const [courses, setCourses] = useState<Course[]>([]);
    const [university, setUniversity] = useState<University | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [subjectCode, setSubjectCode] = useState<string>("");
    const [courseCode, setCourseCode] = useState<string>("");
    const [courseName, setCourseName] = useState<string>("");
    const [subjects, setSubjects] = useState<string[]>([]);
    const [page, setPage] = useState<number>(1);
    const [sortBy, setSortBy] = useState<"rating" | "review_count">("rating");
    const [filterMinRating, setFilterMinRating] = useState<number | null>(null);
    const pageSize = 12;

    // Debounced search function with error handling
    const debouncedFetchCourses = useCallback(
        _.debounce(async (currentPage: number, subject: string, code: string, name: string) => {
            try {
                await fetchCourses(currentPage, subject, name);
            } catch (err) {
                setError("Failed to fetch courses. Please try again.");
            }
        }, 300),
        []
    );

    const fetchSubjects = async () => {
        try {
            const { data, error } = await supabase
                .from("courses")
                .select("subject_code")
                .eq("university_id", universityId);

            if (error) throw error;

            const uniqueSubjects = Array.from(
                new Set(data.map((course) => course.subject_code))
            ).sort();
            setSubjects(uniqueSubjects);
        } catch (error) {
            setError("Failed to load subjects. Please refresh the page.");
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

            if (error) throw error;
            setUniversity(data);
        } catch (error) {
            setError("Failed to load university details.");
            console.error("Error:", error);
        }
    };

    const fetchCourses = async (
        currentPage: number = page,
        currentSubject: string = subjectCode,
        currentCourseName: string = courseName
    ) => {
        if (!initialLoading) {
            setLoading(true);
        }
        setError(null);

        try {
            const fromIndex = (currentPage - 1) * pageSize;
            const toIndex = currentPage * pageSize - 1;

            let query = supabase
                .from("courses_with_review_count")
                .select(`
          id,
          course_code,
          subject_code,
          title,
          historical_average_grade,
          average_rating,
          review_count,
          universities!inner ( name ),
          course_professors!inner (
            professors!inner ( full_name )
          ),
          course_reviews (
            id,
            is_deleted
          )
        `)
                .eq("university_id", universityId)
                .order("review_count", { ascending: false })
                .range(fromIndex, toIndex);


            // parse the search input to extract subject and course number
            if (currentCourseName) {
                const parts = currentCourseName.trim().split(/\s+/);

                if (parts.length > 0) {
                    // if we have a subject code (e.g. "CSE")
                    query = query.ilike("subject_code", `${parts[0]}%`);

                    // if we also have a course number or partial number (e.g. "2" or "23")
                    if (parts.length > 1) {
                        query = query.ilike("course_code", `${parts[1]}%`);
                    }
                }
            }

            // keep existing subject filter if it's set
            if (currentSubject) {
                query = query.eq("subject_code", currentSubject);
            }

            const { data, error } = await query;

            if (error) throw error;

            let processedData = (data || []).map(course => {
                // console.log('processed data before processing', course.course_reviews)
                const validReviews = course.course_reviews?.filter(r => !r.is_deleted) || [];
                const reviewCount = validReviews.length;
                // const averageRating = reviewCount > 0
                //   ? validReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewCount
                //   : null;

                return {
                    ...course,
                    average_rating: course.average_rating,
                    review_count: reviewCount,
                    reviews: validReviews,
                };
            });

            processedData = _.orderBy(processedData, ['review_count'], ['desc']);

            // apply filters and sorting
            if (filterMinRating) {
                processedData = processedData.filter(course =>
                    course.average_rating && course.average_rating >= filterMinRating
                );
            }
            setCourses(processedData);
        } catch (error) {
            setError("Failed to fetch courses. Please try again.");
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
    }, [subjectCode, courseCode, courseName, sortBy, filterMinRating]);

    const handleSearch = () => {
        setPage(1);
        debouncedFetchCourses.cancel();
        fetchCourses(1, subjectCode, courseName);
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
        return (
            <div className="container mx-auto py-6 space-y-6">
                <Skeleton className="h-16 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <CourseCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <main className="w-full min-h-screen bg-gray-50">
            {/* Logo section */}
            <div className="w-full bg-white shadow-sm">
                <div className="mx-auto">
                    <UniversityLogo
                        universityName={university?.name || ""}
                        universityLocation="East Lansing, MI"
                    />
                </div>
            </div>

            {/* Search Section */}
            <div className="bg-white shadow-md py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h1 className="text-3xl font-bold text-center text-gray-900">
                            Search Your Course
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* First row */}
                            <div>
                                <Select
                                    onValueChange={(value) => setSubjectCode(value === "all" ? "" : value)}
                                    value={subjectCode || "all"}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subjects</SelectItem>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject} value={subject}>
                                                {subject}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Select
                                    value={filterMinRating !== null ? filterMinRating.toString() : "all"}
                                    onValueChange={(value) => setFilterMinRating(value === "all" ? null : Number(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Min Rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Rating</SelectItem>
                                        <SelectItem value="4">4+ Stars</SelectItem>
                                        <SelectItem value="3">3+ Stars</SelectItem>
                                        <SelectItem value="2">2+ Stars</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Second row - full width search */}
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by subject name and code"
                                    className="pl-10"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button
                                onClick={handleSearch}
                                className="w-full md:w-auto"
                                size="lg"
                            >
                                Search Courses
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="container mx-auto px-4 mb-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* Course List */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <CourseCardSkeleton key={i} />
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No courses found</h3>
                        <p className="mt-2 text-gray-500">Try adjusting your search criteria</p>

                        {/* Add Course Button */}
                        <Link href={`/${universityId}/addCourse`}>
                            <Button className="mt-6" size="lg">
                                Add a Course
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {courses.length > 0 && (
                    <div className="pt-8">
                        <div className="flex justify-center items-center gap-4">
                            <Button
                                onClick={handlePreviousPage}
                                disabled={page === 1 || loading}
                                variant="outline"
                                className="gap-2"
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium">
                                Page {page}
                            </span>
                            <Button
                                onClick={handleNextPage}
                                disabled={courses.length < pageSize || loading}
                                variant="outline"
                                className="gap-2"
                            >
                                Next
                            </Button>
                        </div>
                    </div>

                )}
            </div>
        </main>
    );
}
