"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Check, Search, School, MapPin, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import debounce from 'lodash/debounce';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface University {
  id: number;
  name: string;
  location?: string;
  course_count?: number;
}

export default function HomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchUniversities = async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("universities")
        .select(`
          id,
          name,
          location,
          courses(count)
        `)
        .limit(100);

      if (search?.trim()) {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const universitiesWithCounts = data?.map(uni => ({
        ...uni,
        course_count: uni.courses?.[0]?.count || 0
      })) || [];

      setUniversities(universitiesWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching universities');
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedFetch = useCallback(
    debounce((search: string) => fetchUniversities(search), 300),
    []
  );

  useEffect(() => {
    fetchUniversities();
    return () => {
      debouncedFetch.cancel();
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (!open) setOpen(true);
    debouncedFetch(value);
  };

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setSearchQuery(university.name);
    setOpen(false);
    router.push(`/${university.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && universities.length > 0) {
      handleUniversitySelect(universities[0]);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-white to-gray-50">
      <div className="h-[525px] absolute inset-0 z-0">
        <Image
          src="/bg-landing.svg"
          alt="Background Image"
          height={759}
          width={1920}
          priority
          className="w-full min-h-full object-cover"
        />
      </div>
      
      <main className="relative z-10 container mx-auto py-12 px-4 space-y-12">
        <div className="flex flex-col items-center space-y-8">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/mainlogo.svg"
              height={70}
              width={450}
              alt="CourseChecker main logo"
              priority
              className="cursor-pointer"
              onClick={() => router.push('/')}
            />
          </div>

          <div className="w-full max-w-xl mx-auto space-y-4">
            <h1 className="text-center text-3xl font-bold text-gray-800 mb-6">
              Your Guide to the Best University Courses
            </h1>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div 
                  className="relative w-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                  }}
                >
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none z-10"/>
                  <Input
                    ref={inputRef}
                    placeholder="Search for your university..."
                    className="w-full pl-9 pr-4 h-12 bg-white/90 backdrop-blur-sm border-2 focus:border-blue-500 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </PopoverTrigger>

              <PopoverContent
                className="w-full max-w-xl p-0 shadow-xl"
                align="start"
                onInteractOutside={(e) => {
                  const target = e.target as HTMLElement;
                  if (!target.closest('.search-container')) {
                    setOpen(false);
                  }
                }}
              >
                <Command className="rounded-lg border border-gray-200">
                  {error ? (
                    <CommandEmpty className="p-4 text-red-500">
                      Error: {error}
                    </CommandEmpty>
                  ) : loading ? (
                    <CommandEmpty className="py-6 text-center">
                      Searching universities...
                    </CommandEmpty>
                  ) : universities.length === 0 ? (
                    <CommandEmpty className="p-4">
                      No universities found. Try a different search term.
                    </CommandEmpty>
                  ) : (
                    <CommandGroup className="max-h-80 overflow-y-auto">
                      {universities.map((university) => (
                        <CommandItem
                          key={university.id}
                          value={university.name}
                          onSelect={() => handleUniversitySelect(university)}
                          className="cursor-pointer p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-start space-x-3">
                            <School className="h-5 w-5 text-rbc-purple mt-1" />
                            <div className="flex-1">
                              <div className="font-medium">{university.name}</div>
                              <div className="text-sm text-gray-500 flex items-center space-x-3 mt-1">
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {university.location || 'Location N/A'}
                                </span>
                                <span className="flex items-center">
                                  <BookOpen className="h-3 w-3 mr-1" />
                                  {university.course_count} courses
                                </span>
                              </div>
                            </div>
                            <Check
                              className={cn(
                                "h-4 w-4 text-blue-500",
                                selectedUniversity?.id === university.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </Command>
              </PopoverContent>
            </Popover>

            <p className="text-center text-gray-600 text-sm">
              Search through {universities.length > 0 ? universities.length : '...'} universities and their courses
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
