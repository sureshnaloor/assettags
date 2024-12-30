'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';

export default function FixedAssets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('assetnumber');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams({
          search,
          sortField,
          sortOrder,
          page: page.toString(),
        });

        const response = await fetch(`/api/fixedassets?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch assets');
        
        const data = await response.json();
        setAssets(data.assets);
        setTotalPages(data.totalPages);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch assets');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [search, sortField, sortOrder, page]);

  const handleSort = (field: string) => {
    setSortOrder(currentOrder => 
      sortField === field 
        ? currentOrder === 'asc' ? 'desc' : 'asc'
        : 'asc'
    );
    setSortField(field);
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-700 opacity-50" />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-white">Fixed Assets</h1>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-white/50" />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-100 px-4 py-2 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-white/70">
                    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('assetnumber')}>
                      Asset Number {sortField === 'assetnumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('description')}>
                      Description {sortField === 'description' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('location')}>
                      Location {sortField === 'location' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset: any) => (
                    <tr 
                      key={asset._id} 
                      className="border-t border-white/10 text-white hover:bg-white/5"
                    >
                      <td className="px-4 py-2">
                        <Link href={`/fixedasset/${asset.assetnumber}`}>
                          {asset.assetnumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{asset.assetdescription}</td>
                      <td className="px-4 py-2">{asset.acquireddate}</td>
                      <td className="px-4 py-2">{asset.acquiredvalue}</td>
                      <td className="px-4 py-2">{asset.assetcategory}</td>
                      <td className="px-4 py-2">{asset.assetstatus}</td>
                      <td className="px-4 py-2">{asset.assetlocation}</td>
                      <td className="px-4 py-2">{asset.assetcondition}</td>
                      <td className="px-4 py-2">{asset.assettype}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
} 