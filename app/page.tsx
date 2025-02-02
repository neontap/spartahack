"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
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

// Updated type for universities
type University = {
  id: number;
  name: string;
  location?: string;
  course_count?: number;
};

export default function HomePage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;

  const fetchUniversities = async (search?: string, currentPage: number = page) => {
    setLoading(true);
    try {
      const fromIndex = (currentPage - 1) * pageSize;
      const toIndex = currentPage * pageSize - 1;

      let query = supabase
        .from("universities")
        .select(`
          id,
          name,
          location,
          courses(count)
        `)
        .range(fromIndex, toIndex);

      // Add search filter if provided
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching universities:", error);
        return;
      }

      // Transform the data to include course count
      const universitiesWithCounts = data?.map(uni => ({
        ...uni,
        course_count: uni.courses?.[0]?.count || 0
      })) || [];

      setUniversities(universitiesWithCounts);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when searchQuery changes
  useEffect(() => {
    setPage(1);
    fetchUniversities(searchQuery, 1);
  }, [searchQuery]);

  // Fetch universities when page changes
  useEffect(() => {
    fetchUniversities(searchQuery, page);
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchUniversities(searchQuery, 1);
  };

  const handleNextPage = () => {
    if (universities.length === pageSize) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/bg-landing.svg"
          alt="Background Image"
          height={80} 
          width={1920}
          priority
          className="object-cover"
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto py-6 space-y-8">
        <div className="flex justify-center">
          <Image 
            src="/mainlogo.svg" 
            height={70} 
            width={450} 
            alt="CourseChecker main logo"
            priority
          />
        </div>
        
        {/* Search Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative w-full flex justify-center">
              <div className="relative"> {/* Changed to relative */}
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /> {/* Added absolute */}
                <Input
                  placeholder="Search for your university"
                  className="pl-8 w-96"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Universities List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p>Loading...</p>
          ) : universities.length > 0 ? (
            universities.map((university) => (
              <Link href={`/universities/${university.id}`} key={university.id}>
                <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full backdrop-blur-sm bg-white/80">
                  <CardHeader>
                    <CardTitle>{university.name}</CardTitle>
                    {university.location && (
                      <CardDescription>{university.location}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {university.course_count} courses available
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p>No universities found.</p>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <Button onClick={handlePreviousPage} disabled={page === 1}>
            Previous
          </Button>
          <span className="self-center">Page {page}</span>
          <Button onClick={handleNextPage} disabled={universities.length < pageSize}>
            Next
          </Button>
        </div>
      </main>
    </div>
  );
}
