import { useState, useEffect } from 'react';
import { getBooks } from '../../api/client';
import { formatCurrency } from '../../components/Badges';
import { BookOpen, Loader2, AlertCircle, Globe } from 'lucide-react';

export default function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBooks()
      .then((data) => setBooks(data.books || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load books'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Books</h1>
        <p className="text-gray-500 mt-1">View all your published and in-production titles</p>
      </div>

      {books.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No books found.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">ISBN</th>
                  <th className="pb-3 pr-4">Genre</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">MRP</th>
                  <th className="pb-3 pr-4">Copies Sold</th>
                  <th className="pb-3 pr-4">Royalty Earned</th>
                  <th className="pb-3 pr-4">Royalty Paid</th>
                  <th className="pb-3">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((book) => {
                  const inProduction = book.status?.toLowerCase().includes('in production') || book.status === 'IN_PRODUCTION' || book.status === 'DRAFT' || book.mrp == null;
                  const platforms = book.availableOn || book.platforms || [];
                  return (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-gray-900">{book.title}</div>
                        {platforms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {platforms.map((p) => (
                              <span key={p} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium">
                                <Globe className="h-2.5 w-2.5" />{p}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 font-mono text-xs">{book.isbn || '—'}</td>
                      <td className="py-3 pr-4 text-gray-600">{book.genre || '—'}</td>
                      <td className="py-3 pr-4">
                        {inProduction ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            {book.status || 'In Production'}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {book.status || 'Published & Live'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-gray-700">{inProduction ? '—' : formatCurrency(book.mrp)}</td>
                      <td className="py-3 pr-4 text-gray-700">{inProduction ? '—' : (book.totalCopiesSold ?? 0).toLocaleString('en-IN')}</td>
                      <td className="py-3 pr-4 text-gray-700">{inProduction ? '—' : formatCurrency(book.totalRoyaltyEarned)}</td>
                      <td className="py-3 pr-4 text-gray-700">{inProduction ? '—' : formatCurrency(book.royaltyPaid)}</td>
                      <td className="py-3 text-gray-700 font-medium">
                        {inProduction ? '—' : formatCurrency(book.royaltyPending ?? ((book.totalRoyaltyEarned || 0) - (book.royaltyPaid || 0)))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-4">
            {books.map((book) => {
              const inProduction = book.status?.toLowerCase().includes('in production') || book.status === 'IN_PRODUCTION' || book.status === 'DRAFT' || book.mrp == null;
              const platforms = book.availableOn || book.platforms || [];
              return (
                <div key={book.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{book.title}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{book.isbn || '—'}</p>
                    </div>
                    {inProduction ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        {book.status || 'In Production'}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        {book.status || 'Published & Live'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs">Genre</p>
                      <p className="text-gray-700">{book.genre || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">MRP</p>
                      <p className="text-gray-700">{inProduction ? '—' : formatCurrency(book.mrp)}</p>
                    </div>
                    {!inProduction && (
                      <>
                        <div>
                          <p className="text-gray-400 text-xs">Copies Sold</p>
                          <p className="text-gray-700">{(book.totalCopiesSold ?? 0).toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Royalty Earned</p>
                          <p className="text-gray-700">{formatCurrency(book.totalRoyaltyEarned)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Royalty Paid</p>
                          <p className="text-gray-700">{formatCurrency(book.royaltyPaid)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Pending</p>
                          <p className="text-gray-700 font-medium">{formatCurrency(book.royaltyPending ?? ((book.totalRoyaltyEarned || 0) - (book.royaltyPaid || 0)))}</p>
                        </div>
                      </>
                    )}
                  </div>
                  {platforms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                      {platforms.map((p) => (
                        <span key={p} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium">
                          <Globe className="h-2.5 w-2.5" />{p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
