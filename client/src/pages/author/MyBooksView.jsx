import React from 'react';
import { BookOpen, Loader2, AlertCircle, Globe } from 'lucide-react';

/**
 * Pure Visual Design Component: Author Book Catalog Table and Responsive Cards.
 */
export function MyBooksView({ books, loading, error }) {
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
        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
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
          <p className="text-gray-500">No books found in your catalog.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Genre</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">MRP</th>
                  <th className="py-3 px-4">Copies Sold</th>
                  <th className="py-3 px-4">Royalty Earned</th>
                  <th className="py-3 px-4">Royalty Paid</th>
                  <th className="py-3 px-4">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{book.title}</div>
                      {book.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {book.platforms.map((p) => (
                            <span
                              key={p}
                              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium"
                            >
                              <Globe className="h-2.5 w-2.5 text-gray-400" />
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{book.isbn}</td>
                    <td className="py-3 px-4 text-gray-600">{book.genre}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          book.inProduction
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}
                      >
                        {book.statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{book.displayMrp}</td>
                    <td className="py-3 px-4 text-gray-700">{book.displayCopiesSold}</td>
                    <td className="py-3 px-4 text-gray-700">{book.displayRoyaltyEarned}</td>
                    <td className="py-3 px-4 text-gray-700">{book.displayRoyaltyPaid}</td>
                    <td className="py-3 px-4 text-gray-900 font-semibold">{book.displayRoyaltyPending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {books.map((book) => (
              <div key={book.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{book.title}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{book.isbn}</p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      book.inProduction
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}
                  >
                    {book.statusLabel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Genre</p>
                    <p className="text-gray-700">{book.genre}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">MRP</p>
                    <p className="text-gray-700">{book.displayMrp}</p>
                  </div>
                  {!book.inProduction && (
                    <>
                      <div>
                        <p className="text-gray-400 text-xs">Copies Sold</p>
                        <p className="text-gray-700">{book.displayCopiesSold}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Royalty Earned</p>
                        <p className="text-gray-700">{book.displayRoyaltyEarned}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Royalty Paid</p>
                        <p className="text-gray-700">{book.displayRoyaltyPaid}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Pending</p>
                        <p className="text-gray-900 font-semibold">{book.displayRoyaltyPending}</p>
                      </div>
                    </>
                  )}
                </div>
                {book.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                    {book.platforms.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-medium"
                      >
                        <Globe className="h-2.5 w-2.5 text-gray-400" />
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
