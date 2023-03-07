import React, { useMemo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchData,
  fetchCharacters,
  selectHouses,
  setHouses,
  fetchBooks,
  selectCharacters,
  selectBooks
} from './tableSlice';
import styles from './Table.module.css';
import { useTable, useSortBy, useFilters, usePagination } from 'react-table';
import CharacterProfile from './Profile'
import '../../tailwind.css';

export const Table = () => {
  const dispatch = useDispatch();
  const houses = useSelector(selectHouses);
  const books = useSelector(selectBooks);
  const characters = useSelector(selectCharacters);

  const [showProfile, setShowProfile] = useState(false);
  const [showProfileURL, setShowProfileURL] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [fetchOption, setFetchOption] = useState('houses');


  const handlePreviousClick = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleNextClick = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handleFetchClick = (option) => {
    setFetchOption(option);
  };

  function CurrentLordCell({ row }) {
    const [currentLord, setCurrentLord] = useState(null);

    useEffect(() => {
      if (!row.original.currentLord) {
        setCurrentLord('Unknown');
      } else {
        fetch(row.original.currentLord)
          .then((response) => response.json())
          .then((data) => setCurrentLord(data.name))
          .catch((error) => console.error(error));
      }
    }, [row]);

    function handleClick(url) {
      setShowProfile(true);
      setShowProfileURL(url)
    }

    return (
      <>
        <div onClick={() => handleClick(row.original.currentLord)}>
          {currentLord ? currentLord : 'Unknown'}
        </div>
        {showProfile && <CharacterProfile characterUrl={row.original.currentLord} />}
      </>
    );
  }

  const columns = useMemo(() => {
    const commonColumns = [
      {
        Header: "Name",
        accessor: "name"
      }
    ];

    const houseColumns = [
      {
        Header: "Words",
        accessor: "words"
      },
      {
        Header: 'Current Lord',
        accessor: 'currentLord',
        Cell: CurrentLordCell,
      },
    ];

    const bookColumns = [
      {
        Header: "Author",
        accessor: "authors",
        Cell: ({ cell: { value } }) => {
          return value.join(", ");
        }
      },
      {
        Header: "Pages",
        accessor: "numberOfPages"
      }
    ];

    const characterColumns = [
      {
        Header: "Gender",
        accessor: "gender"
      },
      {
        Header: "Aliases",
        accessor: "aliases",
        Cell: ({ cell: { value } }) => {
          return value.join(", ");
        }
      }
    ];

    switch (fetchOption) {
      case "houses":
        return [...commonColumns, ...houseColumns];
      case "books":
        return [...commonColumns, ...bookColumns];
      case "characters":
        return [...commonColumns, ...characterColumns];
      default:
        return [];
    }
  }, [fetchOption]);

  const tableData = useMemo(() => {
    switch (fetchOption) {
      case "houses":
        return houses;
      case "books":
        return books;
      case "characters":
        return characters;
      default:
        return houses
    }
  }, [fetchOption, characters, houses, books])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    setFilter,
    state: { filters }
  } = useTable(
    {
      columns,
      data: tableData
    },
    useFilters,
    useSortBy,
    usePagination
  );

  useEffect(() => {
    if (fetchOption === 'houses') {
      let url = `https://www.anapioficeandfire.com/api/${fetchOption}?page=${currentPage + 1}&pageSize=5`
      dispatch(fetchData(url));
    }

    if (fetchOption === 'characters') {
      let url = `https://www.anapioficeandfire.com/api/${fetchOption}?page=${currentPage + 1}&pageSize=5`
      dispatch(fetchCharacters(url));
    }

    if (fetchOption === 'books') {
      let url = `https://www.anapioficeandfire.com/api/${fetchOption}?page=${currentPage + 1}&pageSize=5`
      dispatch(fetchBooks(url));
    }
  }, [currentPage, dispatch, fetchOption]);

  if (showProfile) {
    return <CharacterProfile url={showProfileURL} />;
  }

  return (
    <div>
      <div>
        <button onClick={() => handleFetchClick('books')} className="bg-purple-500 text-white px-2 py-1 rounded-md mr-2 mb-2">Books</button>
        <button onClick={() => handleFetchClick('characters')} className="bg-purple-500 text-white px-2 py-1 rounded-md mr-2 mb-2">Characters</button>
        <button onClick={() => handleFetchClick('houses')} className="bg-purple-500 text-white px-2 py-1 rounded-md mr-2 mb-2">Houses</button>
      </div>
      <h2>{fetchOption} Table</h2>
      <table {...getTableProps()} className="table-auto border-collapse border border-gray-500">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} className="px-4 py-2 font-semibold text-sm text-gray-700 border border-gray-500">
                  <div {...column.getSortByToggleProps()}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </div>
                  <div>
                    {column.canFilter ? (
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={filters.find((f) => f.id === column.id)?.value || ''}
                        onChange={(e) => {
                          setFilter(column.id, e.target.value);
                        }}
                      />
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="bg-white">
                {row.cells.map(cell => {
                  return (
                    <td {...cell.getCellProps()}  className="px-4 py-2 text-sm text-gray-700 border border-gray-500">{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div>
        <button onClick={handlePreviousClick} disabled={currentPage === 1} className="border border-gray-500 text-gray-700 px-2 py-1 rounded-md mr-2 mb-2 mt-2">
          Previous
        </button>
        <button onClick={handleNextClick} className="border border-gray-500 text-gray-700 px-2 py-1 rounded-md mr-2 mb-2 mt-2">
          Next
        </button>
      </div>
    </div>
  );
};
